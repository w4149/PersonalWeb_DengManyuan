"use client";

import {
  useState,
  createContext,
  useContext,
  forwardRef,
} from "react";

// 两个 Context 都抽出来放共享文件：
//   1) FallbackThumbnailCtx —— 只有 work-detail 里会提供（画廊层不提供，undefined，此时 SafeImg 跳过 stage1）
//   2) ShowViewOriginalCtx   —— 只有 work-detail 里会提供 false（当 heroLink/work.link 时），画廊层不提供，默认 true
// PreviewableImg 的 showViewOriginal prop 优先级最高（可覆盖 Context）。画廊层一律传 showViewOriginal={false} 来关闭按钮。
export const FallbackThumbnailCtx = createContext<string | undefined>(undefined);
export const ShowViewOriginalCtx = createContext<boolean>(true);

export type PreviewableImgProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  showViewOriginal?: boolean; // undefined → 读 Context（默认 true）；true/false → 强制覆盖。画廊层一律传 false
};

// =============================================================
// 工具：原图路径 → 预览图路径
// =============================================================
// 开发模式下：每次进程启动时生成一个时间戳，作为预览图 URL 的版本戳
// （重启 Next.js dev server 后，浏览器自动失效之前磁盘缓存的旧预览图）
const DEV_PREVIEW_VERSION =
  typeof process !== "undefined" && process.env && process.env.NODE_ENV === "development"
    ? String(Date.now())
    : null;

export function toPreviewSrc(origSrc: string): string {
  if (!origSrc) return origSrc;
  try {
    const lastSlash = origSrc.lastIndexOf("/");
    if (lastSlash < 0) return origSrc;
    const dir = origSrc.slice(0, lastSlash);
    const file = origSrc.slice(lastSlash + 1);
    // 已在 preview/ 下 → 不重复嵌套
    if (/[\\/]preview$/.test(dir)) return origSrc;
    const dot = file.lastIndexOf(".");
    const name = dot >= 0 ? file.slice(0, dot) : file;
    let preview = `${dir}/preview/${name}.webp`;
    if (DEV_PREVIEW_VERSION) {
      const sep = preview.includes("?") ? "&" : "?";
      preview = `${preview}${sep}v=${DEV_PREVIEW_VERSION}`;
    }
    return preview;
  } catch {
    return origSrc;
  }
}

// 小工具：类名合并（避免引 clsx，保持无额外依赖）
export function cnPreview(...parts: string[]): string {
  return parts.filter(Boolean).join(" ").trim();
}

// =============================================================
// 拆分 className：把 "只作用在 <img> 不作用在布局容器" 的类摘出来 → 给内层两张图。
// 其余类（宽度/居中/伸缩/边框等盒子类）→ 留给外层 Grid 容器。
//   需要抽给内层的类：
//     - object-*（objectFit/objectPosition）
//     - filter / 图像滤镜类：grayscale / sepia / saturate / hue-rotate / invert / blur / contrast / brightness
//     - drop-shadow / -[filter] 任意值
//     - transition-[filter] / transition-filter（filter 属性的过渡）
//     - 上面所有类带 group-hover:/hover:/focus:/active: 前缀
// 这样外层 Grid 容器不会被 group-hover:grayscale 整成"连按钮也一起灰"。
// =============================================================
const IMG_ONLY_CLASS_PREFIXES = [
  /^object-/,
  /^grayscale(-|\[|:|$)/,
  /^sepia(-|\[|:|$)/,
  /^saturate(-|\[|:|$)/,
  /^hue-rotate-/,
  /^invert(-|\[|:|$)/,
  /^blur(-|\[|:|$)/,
  /^contrast(-|\[|:|$)/,
  /^brightness(-|\[|:|$)/,
  /^drop-shadow-/,
  /^filter(\[|-|:|$)/,
  /^transition-\[filter\]/,
  /^transition-filter(-|:|$)/,
];
const PREFIXED_VARIANTS = ["group-hover", "hover", "focus", "active", "focus-within", "focus-visible"];

function _isImgOnlyClass(token: string): boolean {
  if (!token) return false;
  // 变体前缀: <variant>:<actualClass>   递归剥一层看 actualClass
  const colon = token.indexOf(":");
  if (colon > 0) {
    const prefix = token.slice(0, colon);
    const rest = token.slice(colon + 1);
    if (PREFIXED_VARIANTS.includes(prefix)) return _isImgOnlyClass(rest);
  }
  return IMG_ONLY_CLASS_PREFIXES.some((rx) => rx.test(token));
}

export function extractImgOnlyClasses(className?: string): string {
  if (!className) return "";
  const parts = className.split(/\s+/);
  return parts.filter(_isImgOnlyClass).join(" ");
}

export function extractObjectFitClasses(className?: string): string {
  return extractImgOnlyClasses(className);
}

// =============================================================
// PreviewableImg —— 所有图片页面的统一包装组件
//
// ‼️ 分支规则（按用户要求"叠化与预览冲突时保留叠化"）：
//   【Legacy Stacking 模式】: className 中包含 "absolute" → 用户意图让本元素是绝对定位堆叠
//          叠化布局的一部分（FiveImageStack / SevenSplit / 各类 Collage 的小缩略图），
//          此模式下我们不引入任何外层包装 div：直接渲染裸 <img>（forwardRef → 它），
//          与旧 <img> 语义 100% 等价 → 保证 absolute/left/top/z-index/transition:
//          transform/opacity/z-index 的"叠化"过渡效果零破坏；
//          同时仍提供 preview 路径转换 + onError 原图降级 + SafeImg 三级 stage，
//          但不显示 "View original image" 按钮、不引入 crossfade（小图没必要，也避免
//          300ms crossfade 打断外层自己 1.2s 的 opacity/transform 堆叠过渡）。
//
//   【Grid Crossfade 模式】: 其他所有情况（Hero 主图 / 画廊缩略图 / 普通 part 单列）
//          → 输出 Grid 单格叠层：外层 display:grid 接收用户 width/height/shrink-0 等
//          盒模型类 → 修复 SideBySideLayout 80vh×auto 塌缩的 God of Happiness bug；
//          内层预览 + 原图同 cell 叠加 crossfade；右下角 View original image 胶囊按钮。
// =============================================================
export const PreviewableImg = forwardRef<HTMLImageElement, PreviewableImgProps>(
  function PreviewableImg(props, ref) {
    const fallback = useContext(FallbackThumbnailCtx);
    const workLevelShow = useContext(ShowViewOriginalCtx);
    const {
      src: origSrc = "",
      onError: outerOnError,
      onLoad: outerOnLoad,
      className,
      style,
      showViewOriginal, // undefined → 走 Context；true/false → 强制覆盖
      ...rest
    } = props;
    const finalShowVO =
      showViewOriginal !== undefined ? !!showViewOriginal : !!workLevelShow;

    // 判定：Legacy Stacking 模式？
    const isLegacyStacking = /(^|\s)absolute(\s|$)/.test(className ?? "");

    // ====== 状态（声明在使用前，避免 TDZ）======
    const [stage, setStage] = useState<0 | 1 | 2>(0);
    const [previewErrored, setPreviewErrored] = useState(false);
    const [originalRequested, setOriginalRequested] = useState(false);
    const [originalLoaded, setOriginalLoaded] = useState(false);
    const [originalErrored, setOriginalErrored] = useState(false);

    // ====== 三级源路径（preview 底层 + 原图顶层）======
    const basePreview: string =
      stage === 0
        ? toPreviewSrc(origSrc)
        : stage === 1 && fallback
        ? toPreviewSrc(fallback)
        : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><rect fill='%23f5f5f2' width='16' height='16'/></svg>";
    const finalPreviewSrc =
      stage === 2 ? basePreview : previewErrored ? origSrc : basePreview;
    const effOrigSrc = originalRequested ? origSrc : undefined;
    const renderPreview = !(originalLoaded && !originalErrored);

    // ====== 样式拆分 ======
    const {
      objectFit,
      objectPosition,
      ...outerStyleRemain
    } = (style || {}) as React.CSSProperties & {
      objectFit?: React.CSSProperties["objectFit"];
      objectPosition?: React.CSSProperties["objectPosition"];
    };

    const outerStyle: React.CSSProperties | undefined =
      stage === 2
        ? { ...outerStyleRemain, background: "#f5f5f2" }
        : outerStyleRemain;

    const hasFit = objectFit !== undefined;
    // Grid 模式下两张叠层 img 共用的 100% 填充样式；Legacy 模式下不强制 100%（用户传什么就什么）
    const makeImgStyle = (
      opacity: number,
      extras?: React.CSSProperties
    ): React.CSSProperties => ({
      width: "100%",
      height: "100%",
      maxWidth: "none",
      maxHeight: "none",
      minWidth: 0,
      minHeight: 0,
      ...(hasFit ? { objectFit } : undefined),
      ...(objectPosition !== undefined ? { objectPosition } : undefined),
      opacity,
      ...(extras || {}),
    });

    // ====== 共用 onError 处理：preview 失败 → 降原图 → SafeImg stage ======
    const handlePreviewImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (stage === 2) {
        outerOnError?.(e);
        return;
      }
      if (!previewErrored) {
        setPreviewErrored(true);
      } else {
        setStage((s) => {
          if (s === 2) return 2;
          if (s === 0 && !fallback) return 2;
          return (s + 1) as 0 | 1 | 2;
        });
      }
      outerOnError?.(e);
    };

    // ====== 类名拆分 ======
    const imgOnlyClasses = extractImgOnlyClasses(className);
    const outerClasses = className ?? "";
    const innerImgFixed = `transition-opacity duration-[300ms] ease-out block`; // block 去 baseline 白边

    // ========================================================
    // BRANCH A: Legacy Stacking 模式 → 裸 <img>（保留叠化）
    // ========================================================
    if (isLegacyStacking) {
      return (
        <img
          ref={ref}
          src={finalPreviewSrc}
          {...rest}
          className={className} // 100% 原封不动：包含 absolute + transform/opacity transition + z-index 等布局类
          style={style} // 用户 style 原封不动：包含 left/top/width/height/z-index/transition 等
          onError={handlePreviewImgError}
          onLoad={outerOnLoad}
        />
      );
    }

    // ========================================================
    // BRANCH B: Grid Crossfade 模式 → 完整功能（Hero / 画廊 / 普通 part）
    // ========================================================
    return (
      <div
        className={cnPreview(
          "group grid relative overflow-hidden [grid-template-areas:_'img'] place-items-stretch",
          outerClasses
        )}
        style={outerStyle}
      >
        {/* ====== Layer 1: 预览图（底层，Grid in-flow 驱动盒子比例） ====== */}
        {renderPreview && (
          <img
            ref={ref}
            src={finalPreviewSrc}
            {...rest}
            className={cnPreview(
              innerImgFixed,
              imgOnlyClasses,
              "[grid-area:img]"
            )}
            style={makeImgStyle(originalLoaded ? 0 : 1)}
            onError={handlePreviewImgError}
            onLoad={(e) => {
              outerOnLoad?.(e);
            }}
          />
        )}

        {/* ====== Layer 2: 原图（顶层，点按钮后渲染；同 grid cell 叠加） ====== */}
        {originalRequested && (
          <img
            src={effOrigSrc}
            alt={rest.alt || ""}
            {...rest}
            className={cnPreview(
              innerImgFixed,
              imgOnlyClasses,
              "[grid-area:img]"
            )}
            style={makeImgStyle(
              originalErrored ? 0 : originalLoaded ? 1 : 0.4
            )}
            onError={() => {
              setOriginalErrored(true);
              setOriginalLoaded(false);
            }}
            onLoad={() => {
              setOriginalLoaded(true);
            }}
          />
        )}

        {/* ====== "View original image" 胶囊按钮（仅详情页 showViewOriginal=true） ====== */}
        {finalShowVO && !originalLoaded && !originalErrored && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!originalRequested) setOriginalRequested(true);
            }}
            className="transition-opacity duration-200 absolute bottom-2 right-2 z-[5] opacity-0 group-hover:opacity-90 hover:!opacity-100 active:opacity-100"
            style={{
              padding: "4px 9px",
              borderRadius: "9999px",
              background: "rgba(0,0,0,0.55)",
              color: "white",
              fontSize: "10px",
              lineHeight: 1,
              letterSpacing: "0.02em",
              fontFamily: "system-ui, -apple-system, sans-serif",
              border: "none",
              cursor: "pointer",
              userSelect: "none",
              WebkitBackdropFilter: "blur(2px)",
              backdropFilter: "blur(2px)",
            }}
          >
            View original image
          </button>
        )}
      </div>
    );
  }
);
PreviewableImg.displayName = "PreviewableImg";
