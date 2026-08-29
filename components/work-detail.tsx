"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  forwardRef,
} from "react";
import type { Work, SubPage } from "@/lib/works-data";
import { GAP } from "@/lib/gallery-config";
import {
  FallbackThumbnailCtx,
  ShowViewOriginalCtx,
  PreviewableImg,
  LightboxProvider,
} from "@/components/previewable-image";

type Props = {
  work: Work;
  index: number;
  gap?: number;
};

// 单张图片的"安全渲染"包装：内部 img 出错时自动按阶段切换源，不会让浏览器默认裂图破坏视觉。
// 阶段：0 = 原 src；1 = 回退到作品 thumbnail；2 = 内置浅灰占位 SVG（彻底兜底）。
// 使用方式：把 <SafeImg ... /> 直接换成 <SafeImg ... />；所有 img 属性都能透传（包括 ref / onLoad / style）。
// FallbackThumbnailCtx 从共享文件 previewable-image.tsx 导入（同一份 Context，WorkDetail 根 Provider 照常赋值）。
const SafeImg = forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>((props, ref) => {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const fallback = useContext(FallbackThumbnailCtx);

  const {
    src: origSrc = "",
    onError: outerOnError,
    style: outerStyle,
    ...rest
  } = props;

  const effSrc: string =
    stage === 0
      ? origSrc
      : stage === 1 && fallback
      ? fallback
      : // 完全兜底：16×16 浅灰方块 SVG（data URI，不会再加载失败）
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><rect fill='%23f5f5f2' width='16' height='16'/></svg>";

  return (
    <img
      ref={ref}
      src={effSrc}
      onError={(e) => {
        setStage((s) => {
          if (s === 2) return 2;
          // 如果没有提供 fallback（fallback 为空），直接跳过阶段 1 进入 SVG 兜底
          if (s === 0 && !fallback) return 2;
          return (s + 1) as 0 | 1 | 2;
        });
        outerOnError?.(e);
      }}
      style={
        stage === 2
          ? {
              ...(outerStyle || {}),
              // 最后兜底：让 SVG 小方块 cover 填满整格 + 浅灰背景，不会像裂图
              objectFit: "cover" as const,
              background: "#f5f5f2",
            }
          : outerStyle
      }
      {...rest}
    />
  );
});
SafeImg.displayName = "SafeImg";

// ————— 预览图/查看原图相关代码已抽离到 @/components/previewable-image.tsx —————
// PreviewableImg, toPreviewSrc, cnPreview, extractObjectFitClasses,
// FallbackThumbnailCtx, ShowViewOriginalCtx 都在共享文件里导出。
// 上面 SafeImg 使用共享 FallbackThumbnailCtx，保持三级 stage 语义与旧版完全等价。

const TITLE_FONT =
  "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif";
const MONO_FONT =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const IMAGE_HEIGHT = "80vh";
const FALLBACK_WIDTH = 187;
const LEFT_MAX_WIDTH = 420;

function renderMaterials(materials: string): React.ReactNode {
  const parts = materials.split("|");
  return parts.map((part, i) => (
    <span key={i}>
      {part.trim()}
      {i < parts.length - 1 && <br />}
    </span>
  ));
}

function renderDescription(description: string): React.ReactNode {
  const parts = description.split("|");
  return parts.map((part, i) => (
    <span key={i}>
      {part.trim()}
      {i < parts.length - 1 && <br />}
    </span>
  ));
}

function ImageWithLink({
  src,
  alt,
  link,
  className,
  style,
  imgRef,
  onLoad,
}: {
  src: string;
  alt: string;
  link?: string;
  className?: string;
  style?: React.CSSProperties;
  imgRef?: React.RefObject<HTMLImageElement>;
  onLoad?: () => void;
}) {
  // 若有 link → 整个作品是外部跳转：隐藏"查看原图"（与 work-level 规则一致，显式覆盖双重保险）
  const showVO = !link;
  const imgEl = (
    <PreviewableImg
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
      showViewOriginal={showVO}
    />
  );
  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="inline-block">
        {imgEl}
      </a>
    );
  }
  return imgEl;
}

/**
 * 把 caption 文本按 | 或 \n 拆成多行并渲染（换行用 <br>）
 */
function renderCaptionText(caption: string) {
  const lines = caption.split(/\||\n/).map((l) => l.trim());
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}

/**
 * 通用单行宽度优先布局（合并了原 GridSubPage 和 RowCaptionSubPage）
 *  - 图片 caption：紧贴图片下方永久可见，样式参考 WORKS 分类画廊"作品名"样式：
 *      mt-2（8px 间距），text-sm text-gray-700 深灰文字居中，按宽度限制换行
 *  - caption 内容中的 "|" 等价于换行
 *  - 宽度按图片真实宽高比比例分配（原 grid 行为，优于原 rowCaption 的 width:auto）
 *  - 容器高度：图片部分统一 50vh（同行图片严格等高）；caption 在图片块之外，不影响图底对齐
 *  - 可选整页 description，显示在所有图下方
 */
function GridSubPage({ subPage }: { subPage: SubPage }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [dims, setDims] = useState<{ w: number; h: number }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const gapX = 24;
  const gapY = 24;
  const DESKTOP_HEIGHT = "50vh";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleImgLoad = useCallback(
    (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setDims((prev) => {
        const next = [...prev];
        next[index] = { w: img.naturalWidth, h: img.naturalHeight };
        return next;
      });
    },
    []
  );

  useEffect(() => {
    subPage.images.forEach((_, i) => {
      const img = imgRefs.current[i];
      if (img && img.complete && img.naturalWidth > 0) {
        setDims((prev) => {
          if (prev[i]?.w) return prev;
          const next = [...prev];
          next[i] = { w: img.naturalWidth, h: img.naturalHeight };
          return next;
        });
      }
    });
  }, [subPage.images]);

  const count = subPage.images.length;
  const totalGap = (count - 1) * gapX;
  const availableWidth = containerWidth - totalGap;

  let widths: number[] = [];
  if (availableWidth > 0 && dims.length >= count && dims.every((d) => d && d.w > 0)) {
    const ratios = dims.map((d) => d.w / d.h);
    const totalRatio = ratios.reduce((a, b) => a + b, 0);
    widths = ratios.map((r) => (r / totalRatio) * availableWidth);
  }

  if (isMobile) {
    return (
      <div className="mt-16">
        <div
          ref={containerRef}
          className="flex flex-col w-full"
          style={{ gap: `${gapY}px` }}
        >
          {subPage.images.map((img, i) => (
            <div
              key={i}
              className="flex flex-col items-center w-full"
            >
              <div style={{ width: "100%" }}>
                <PreviewableImg
                  ref={(el) => { imgRefs.current[i] = el; }}
                  src={img.src}
                  alt={img.alt || `Sub page ${i + 1}`}
                  loading="lazy"
                  className="object-contain w-full"
                  onLoad={(e) => handleImgLoad(i, e)}
                  style={{
                    height: "auto",
                    maxHeight: "60vh",
                    display: "block",
                    width: "100%",
                  }}
                />
              </div>
              {img.caption && img.caption.length > 0 && (
                <p
                  className="text-gray-700 text-center leading-tight mt-2"
                  style={{ maxWidth: "100%", fontSize: "10px", opacity: 0.5 }}
                >
                  {renderCaptionText(img.caption)}
                </p>
              )}
            </div>
          ))}
        </div>
        {subPage.description && (
          <p
            className="text-gray-700 mt-4 text-left"
            style={{
              fontFamily: TITLE_FONT,
              fontSize: "12px",
              lineHeight: "16pt",
              color: "#464646",
            }}
          >
            {renderDescription(subPage.description)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div
        ref={containerRef}
        className="flex items-start w-full"
        style={{ gap: `${gapX}px` }}
      >
        {subPage.images.map((img, i) => {
          const itemWidth = widths[i] || undefined;
          return (
            <div
              key={i}
              className="flex flex-col items-center shrink-0"
              style={{ width: itemWidth ? `${itemWidth}px` : "auto" }}
            >
              {/* 图片块：固定 DESKTOP_HEIGHT（同行图片严格等高，caption 在块外不影响） */}
              <div
                className="group relative block overflow-hidden"
                style={{
                  height: DESKTOP_HEIGHT,
                  width: itemWidth ? `${itemWidth}px` : "auto",
                }}
              >
                <PreviewableImg
                  ref={(el) => { imgRefs.current[i] = el; }}
                  src={img.src}
                  alt={img.alt || `Sub page ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-contain"
                  onLoad={(e) => handleImgLoad(i, e)}
                  style={{ display: "block", width: "100%", height: "100%" }}
                />
              </div>
              {/* caption：紧贴图片下方永久可见，参考 WORKS 分类画廊作品名字样式 */}
              {img.caption && img.caption.length > 0 && (
                <p
                  className="text-gray-700 text-center leading-tight mt-2"
                  style={{
                    maxWidth: itemWidth ? `${itemWidth}px` : "none",
                    fontSize: "10px",
                    opacity: 0.5,
                  }}
                >
                  {renderCaptionText(img.caption)}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {subPage.description && (
        <p
          className="text-gray-700 mt-4 text-left"
          style={{
            fontFamily: TITLE_FONT,
            fontSize: "12px",
            lineHeight: "16pt",
            color: "#464646",
          }}
        >
          {renderDescription(subPage.description)}
        </p>
      )}
    </div>
  );
}

function TextLeftStackedRightSubPage({ subPage }: { subPage: SubPage }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [dims, setDims] = useState<{ w: number; h: number }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const gapX = 24;
  const gapY = 24;

  const leftImgs = subPage.images.slice(0, 2);
  const rightImg = subPage.images[2];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setContainerSize({ w: cr.width, h: cr.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleImgLoad = useCallback(
    (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setDims((prev) => {
        const next = [...prev];
        next[index] = { w: img.naturalWidth, h: img.naturalHeight };
        return next;
      });
    },
    []
  );

  useEffect(() => {
    subPage.images.forEach((_, i) => {
      const img = imgRefs.current[i];
      if (img && img.complete && img.naturalWidth > 0) {
        setDims((prev) => {
          const next = [...prev];
          next[i] = { w: img.naturalWidth, h: img.naturalHeight };
          return next;
        });
      }
    });
  }, [subPage.images]);

  if (isMobile) {
    return (
      <div className="mt-16">
        <div
          ref={containerRef}
          className="flex flex-col w-full"
          style={{ gap: `${gapY}px` }}
        >
          {subPage.description && (
            <p
              className="text-gray-700 text-left"
              style={{
                fontFamily: TITLE_FONT,
                fontSize: "12px",
                lineHeight: "16pt",
                color: "#464646",
              }}
            >
              {renderDescription(subPage.description)}
            </p>
          )}
          {leftImgs.map((img, i) => (
            <PreviewableImg
              key={`left-${i}`}
              ref={(el) => { imgRefs.current[i] = el; }}
              src={img.src}
              alt={img.alt || `Middle image ${i + 1}`}
              onLoad={(e) => handleImgLoad(i, e)}
              className="object-contain w-full"
              style={{
                height: "auto",
                maxHeight: "60vh",
                display: "block",
              }}
            />
          ))}
          {rightImg && (
            <PreviewableImg
              ref={(el) => { imgRefs.current[2] = el; }}
              src={rightImg.src}
              alt={rightImg.alt || "Right image"}
              onLoad={(e) => handleImgLoad(2, e)}
              className="object-contain w-full"
              style={{
                height: "auto",
                maxHeight: "70vh",
                display: "block",
              }}
            />
          )}
        </div>
      </div>
    );
  }

  const H = containerSize?.h ?? 0;
  const W = containerSize?.w ?? 0;

  const leftAvailableH = H - gapY;
  const eachLeftH = leftAvailableH / 2;

  let rightWidth = 0;
  if (dims[2] && dims[2].w > 0 && dims[2].h > 0 && H > 0) {
    rightWidth = (dims[2].w / dims[2].h) * H;
  }

  let leftWidth = 0;
  if (eachLeftH > 0 && dims[0] && dims[0].w > 0 && dims[0].h > 0) {
    leftWidth = (dims[0].w / dims[0].h) * eachLeftH;
  }

  let scale = 1;
  const textWidth = 280;
  const totalW = textWidth + gapX + leftWidth + gapX + rightWidth;
  if (totalW > W && W > 0 && totalW > 0) {
    scale = W / totalW;
  } else if (totalW > 0 && W > 0) {
    scale = Math.min(1, W / totalW);
  }

  const finalTextWidth = textWidth * scale;
  const finalLeftWidth = leftWidth * scale;
  const finalRightWidth = rightWidth * scale;

  return (
    <div className="mt-16">
      <div
        ref={containerRef}
        className="flex items-center w-full"
        style={{ height: "80vh", gap: `${gapX}px` }}
      >
        {subPage.description && (
          <div
            className="flex flex-col justify-center"
            style={{ width: `${finalTextWidth}px`, height: "100%" }}
          >
            <p
              className="text-gray-700 text-left"
              style={{
                fontFamily: TITLE_FONT,
                fontSize: "12px",
                lineHeight: "16pt",
                color: "#464646",
              }}
            >
              {renderDescription(subPage.description)}
            </p>
          </div>
        )}
        <div
          className="flex flex-col items-center justify-center"
          style={{ height: "100%", gap: `${gapY}px`, width: `${finalLeftWidth}px` }}
        >
          {leftImgs.map((img, i) => (
            <PreviewableImg
              key={i}
              ref={(el) => { imgRefs.current[i] = el; }}
              src={img.src}
              alt={img.alt || `Middle image ${i + 1}`}
              onLoad={(e) => handleImgLoad(i, e)}
              className="object-contain"
              style={{
                height: `calc((100% - ${gapY}px) / 2)`,
                width: "100%",
                display: "block",
              }}
            />
          ))}
        </div>
        {rightImg && (
          <PreviewableImg
            ref={(el) => { imgRefs.current[2] = el; }}
            src={rightImg.src}
            alt={rightImg.alt || "Right image"}
            onLoad={(e) => handleImgLoad(2, e)}
            className="object-contain ml-auto"
            style={{
              height: "100%",
              width: `${finalRightWidth}px`,
              display: "block",
            }}
          />
        )}
      </div>
    </div>
  );
}

function StackedRightSubPage({ subPage }: { subPage: SubPage }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [dims, setDims] = useState<{ w: number; h: number }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const gapX = 24;
  const gapY = 24;

  const leftImgs = subPage.images.slice(0, 2);
  const rightImg = subPage.images[2];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setContainerSize({ w: cr.width, h: cr.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleImgLoad = useCallback(
    (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setDims((prev) => {
        const next = [...prev];
        next[index] = { w: img.naturalWidth, h: img.naturalHeight };
        return next;
      });
    },
    []
  );

  useEffect(() => {
    subPage.images.forEach((_, i) => {
      const img = imgRefs.current[i];
      if (img && img.complete && img.naturalWidth > 0) {
        setDims((prev) => {
          const next = [...prev];
          next[i] = { w: img.naturalWidth, h: img.naturalHeight };
          return next;
        });
      }
    });
  }, [subPage.images]);

  if (isMobile) {
    return (
      <div className="mt-16">
        <div
          ref={containerRef}
          className="flex flex-col w-full"
          style={{ gap: `${gapY}px` }}
        >
          {leftImgs.map((img, i) => (
            <PreviewableImg
              key={`left-${i}`}
              ref={(el) => { imgRefs.current[i] = el; }}
              src={img.src}
              alt={img.alt || `Left image ${i + 1}`}
              onLoad={(e) => handleImgLoad(i, e)}
              className="object-contain w-full"
              style={{
                height: "auto",
                maxHeight: "60vh",
                display: "block",
                objectPosition: "top",
              }}
            />
          ))}
          {rightImg && (
            <PreviewableImg
              ref={(el) => { imgRefs.current[2] = el; }}
              src={rightImg.src}
              alt={rightImg.alt || "Right image"}
              onLoad={(e) => handleImgLoad(2, e)}
              className="object-contain w-full"
              style={{
                height: "auto",
                maxHeight: "70vh",
                display: "block",
                objectPosition: "top",
              }}
            />
          )}
        </div>
        {subPage.description && (
          <p
            className="text-gray-700 mt-4 text-left"
            style={{
              fontFamily: TITLE_FONT,
              fontSize: "12px",
              lineHeight: "16pt",
              color: "#464646",
            }}
          >
            {renderDescription(subPage.description)}
          </p>
        )}
      </div>
    );
  }

  const H = containerSize?.h ?? 0;
  const W = containerSize?.w ?? 0;

  const eachLeftH = H > 0 ? (H - gapY) / 2 : 0;

  let rightWidth = 0;
  if (dims[2] && dims[2].w > 0 && dims[2].h > 0 && H > 0) {
    rightWidth = (dims[2].w / dims[2].h) * H;
  }

  let leftWidth1 = 0;
  let leftWidth2 = 0;
  if (eachLeftH > 0) {
    if (dims[0] && dims[0].w > 0 && dims[0].h > 0) {
      leftWidth1 = (dims[0].w / dims[0].h) * eachLeftH;
    }
    if (dims[1] && dims[1].w > 0 && dims[1].h > 0) {
      leftWidth2 = (dims[1].w / dims[1].h) * eachLeftH;
    }
  }
  const leftWidth = Math.max(leftWidth1, leftWidth2);

  let scale = 1;
  const totalW = leftWidth + gapX + rightWidth;
  if (totalW > W && W > 0 && totalW > 0) {
    scale = W / totalW;
  }

  const finalLeftWidth = leftWidth * scale;
  const finalRightWidth = rightWidth * scale;

  return (
    <div className="mt-16">
      <div
        ref={containerRef}
        className="flex items-start w-full"
        style={{ height: "80vh", gap: `${gapX}px` }}
      >
        <div
          className="flex flex-col items-start"
          style={{ height: "100%", gap: `${gapY}px`, width: `${finalLeftWidth}px` }}
        >
          {leftImgs.map((img, i) => (
            <PreviewableImg
              key={i}
              ref={(el) => { imgRefs.current[i] = el; }}
              src={img.src}
              alt={img.alt || `Left image ${i + 1}`}
              onLoad={(e) => handleImgLoad(i, e)}
              className="object-contain"
              style={{
                height: `calc((100% - ${gapY}px) / 2)`,
                width: "100%",
                display: "block",
                objectPosition: "top",
              }}
            />
          ))}
        </div>
        {rightImg && (
          <PreviewableImg
            ref={(el) => { imgRefs.current[2] = el; }}
            src={rightImg.src}
            alt={rightImg.alt || "Right image"}
            onLoad={(e) => handleImgLoad(2, e)}
            className="object-contain ml-auto"
            style={{
              height: "100%",
              width: `${finalRightWidth}px`,
              display: "block",
              objectPosition: "top",
            }}
          />
        )}
      </div>
      {subPage.description && (
        <p
          className="text-gray-700 mt-4 text-left"
          style={{
            fontFamily: TITLE_FONT,
            fontSize: "12px",
            lineHeight: "16pt",
            color: "#464646",
          }}
        >
          {renderDescription(subPage.description)}
        </p>
      )}
    </div>
  );
}

function FiveImageStackSubPage({ subPage }: { subPage: SubPage }) {
  const [stacked, setStacked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [dims, setDims] = useState<{ w: number; h: number }[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleImgLoad = (index: number) => {
    const img = imgRefs.current[index];
    if (img) {
      setDims((prev) => {
        const next = [...prev];
        next[index] = { w: img.naturalWidth, h: img.naturalHeight };
        return next;
      });
    }
  };

  const centerImg = subPage.images[1];
  const leftTopImg = subPage.images[0];
  const leftBottomImg = subPage.images[2];
  const rightTopImg = subPage.images[3];
  const rightBottomImg = subPage.images[4];

  if (isMobile) {
    return (
      <div className="mt-16">
        <div
          ref={containerRef}
          className="flex flex-col w-full"
          style={{ gap: "24px" }}
        >
          <PreviewableImg
            ref={(el) => { imgRefs.current[0] = el; }}
            src={leftTopImg.src}
            alt={leftTopImg.alt || "Left Top"}
            onLoad={() => handleImgLoad(0)}
            className="object-contain w-full"
            style={{ height: "auto", maxHeight: "60vh", display: "block" }}
          />
          <PreviewableImg
            ref={(el) => { imgRefs.current[1] = el; }}
            src={centerImg.src}
            alt={centerImg.alt || "Center"}
            onLoad={() => handleImgLoad(1)}
            className="object-contain w-full"
            style={{ height: "auto", maxHeight: "70vh", display: "block" }}
          />
          <PreviewableImg
            ref={(el) => { imgRefs.current[2] = el; }}
            src={leftBottomImg.src}
            alt={leftBottomImg.alt || "Left Bottom"}
            onLoad={() => handleImgLoad(2)}
            className="object-contain w-full"
            style={{ height: "auto", maxHeight: "60vh", display: "block" }}
          />
          <PreviewableImg
            ref={(el) => { imgRefs.current[3] = el; }}
            src={rightTopImg.src}
            alt={rightTopImg.alt || "Right Top"}
            onLoad={() => handleImgLoad(3)}
            className="object-contain w-full"
            style={{ height: "auto", maxHeight: "60vh", display: "block" }}
          />
          <PreviewableImg
            ref={(el) => { imgRefs.current[4] = el; }}
            src={rightBottomImg.src}
            alt={rightBottomImg.alt || "Right Bottom"}
            onLoad={() => handleImgLoad(4)}
            className="object-contain w-full"
            style={{ height: "auto", maxHeight: "60vh", display: "block" }}
          />
        </div>
      </div>
    );
  }

  const H = containerSize?.h ?? 600;
  const totalW = containerSize?.w ?? 1200;
  const gap = GAP;

  // 读取显式写死的 aspect 兜底（方案二：不再依赖 dims onLoad 首帧到位，解决刷新坏态/缓存命中漏事件）
  // 优先级：imageAspects[i] > dims[i].w/dims[i].h > 1（正方形假设最后兜底）
  // nullish coalescing 防 imageAspects 数组本身 / 指定下标越界
  const preAspects = subPage.imageAspects ?? [];
  const aspectAt = (i: number): number => {
    if (preAspects[i] != null && Number.isFinite(preAspects[i]) && (preAspects[i] as number) > 0) {
      return preAspects[i] as number;
    }
    if (dims[i]) {
      return dims[i].w / dims[i].h;
    }
    return 1;
  };
  const leftTopAspect = aspectAt(0);
  const leftBottomAspect = aspectAt(2);
  const centerAspect = aspectAt(1);
  const rightTopAspect = aspectAt(3);
  const rightBottomAspect = aspectAt(4);

  // ============ D1 = Y：整体 Justified 同比缩放 ============
  // 基准高度（scale = 1 时）：
  //   中心图高 = H（占满容器垂直空间）
  //   角图高 sideH = H/2 − gap/2，两排之间刚好 gap=24 间距（与原实现一致）
  const sideH_base = H / 2 - gap / 2;
  const centerH_base = H;
  // 三列贴合时的"理想参考宽"（中心图右侧 + gap + 右下图右侧贴在中心图右侧）
  const w_LT_b = leftTopAspect * sideH_base;
  const w_LB_b = leftBottomAspect * sideH_base;
  const w_C_b = centerAspect * centerH_base;
  const w_RT_b = rightTopAspect * sideH_base;
  const w_RB_b = rightBottomAspect * sideH_base;
  // Layer blending 按钮宽度预留（紧贴 RB 右侧，按钮与图之间 gap=24）
  // 英文 "Layer blending" / "Restore layers" 最长文案预估 + padding 4+9 px ≈ 135 px；
  // 给 150 px 兜底，足够切换文案后不溢出容器。
  const BTN_WIDTH_RESERVED = 150;
  const fit_b = w_LT_b + 2 * gap + w_C_b + w_RB_b + gap + BTN_WIDTH_RESERVED;
  // scale = min(1, totalW / fit_b)：
  //   宽屏 totalW >= fit_b -> scale=1，贴合布局但右侧有空白（不硬拉满）；
  //   窄屏 totalW <  fit_b -> scale<1，五图 + 按钮按比例整体缩小到刚好不溢出容器宽度。
  const rawScale = fit_b > 0.001 ? totalW / fit_b : 1;
  const scale = Math.min(1, rawScale);
  // 对极端窄屏（超长中心图）做下限保护：不让角图/中心图缩到 0
  const SCALE_MIN = 0.1;
  const safeScale = Math.max(SCALE_MIN, scale);

  const sideH = safeScale * sideH_base;
  const centerH = safeScale * centerH_base;
  const leftTopW = leftTopAspect * sideH;
  const leftBottomW = leftBottomAspect * sideH;
  const centerW = centerAspect * centerH;
  const rightTopW = rightTopAspect * sideH;
  const rightBottomW = rightBottomAspect * sideH;

  // ============ D2 = P1：水平定位（按用户本轮文字） ============
  // ① 左上图 + 左下图：容器内绝对左对齐 left=0
  const leftLeft = 0;
  // ② 中心图左边 = 左上图右边 + gap（由于左两图 left 都是 0，左上图右 = leftTopW）
  const centerLeft = leftTopW + gap;
  // ③ 右下图左边 = 中心图右边 + gap
  const rightBottomLeft = centerLeft + centerW + gap;
  // ④ P1：右上图右边 = 右下图右边 (= rightBottomLeft + rightBottomW)，所以
  //        left_RT = (rightBottomLeft + rightBottomW) − rightTopW
  const rightBottomRightEdge = rightBottomLeft + rightBottomW;
  const rightTopLeft = rightBottomRightEdge - rightTopW;

  const leftTopTop = 0;
  const leftBottomTop = sideH + gap;
  const rightTopTop = 0;
  const rightBottomTop = sideH + gap;

  // ============ D3：堆叠中中心图不动，四角图向中心图 box 收拢 ============
  // - 中心图堆叠后 transform 永远 = "none"（完全不动，符合 D3）
  // - 四角图目标：左上角 = (centerLeft, 0)，宽度 = centerW，高度 = centerH
  //   （把四角图等比缩放成中心图外框大小，并移动到中心图左上角起点）
  const ANIM_DURATION = "1.2s";
  const TARGET_X = centerLeft;
  const TARGET_Y = 0;
  const TARGET_W = centerW;
  const TARGET_H = centerH;

  const getStackedTransform = (
    imgLeft: number,
    imgTop: number,
    imgW: number,
    imgH: number
  ) => {
    if (!stacked) return "none";
    // 先 translate 让 img 左上角对齐目标左上角，再以目标左上角为原点做 scale
    // （因此 transform-origin 要改成 "top left"，见下方 sideImages style）
    const dx = TARGET_X - imgLeft;
    const dy = TARGET_Y - imgTop;
    const sx = TARGET_W / Math.max(imgW, 0.001);
    const sy = TARGET_H / Math.max(imgH, 0.001);
    return `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  };

  // ============ sideImages：使用各自真实宽（不再统一 maxLeftW/maxRightW） ============
  const sideImages = [
    {
      src: leftTopImg.src,
      alt: leftTopImg.alt || "Left Top",
      imgIndex: 0,
      imgLeft: leftLeft,
      imgTop: leftTopTop,
      imgW: leftTopW,
      imgH: sideH,
      objectPos: "top" as const,
      z: 3,
    },
    {
      src: leftBottomImg.src,
      alt: leftBottomImg.alt || "Left Bottom",
      imgIndex: 2,
      imgLeft: leftLeft,
      imgTop: leftBottomTop,
      imgW: leftBottomW,
      imgH: sideH,
      objectPos: "left bottom" as const,
      z: 3,
    },
    {
      src: rightTopImg.src,
      alt: rightTopImg.alt || "Right Top",
      imgIndex: 3,
      imgLeft: rightTopLeft,
      imgTop: rightTopTop,
      imgW: rightTopW,
      imgH: sideH,
      objectPos: "top" as const,
      z: 3,
    },
    {
      src: rightBottomImg.src,
      alt: rightBottomImg.alt || "Right Bottom",
      imgIndex: 4,
      imgLeft: rightBottomLeft,
      imgTop: rightBottomTop,
      imgW: rightBottomW,
      imgH: sideH,
      objectPos: "bottom" as const,
      z: 3,
    },
  ];

  return (
    <div className="mt-16" style={{ height: IMAGE_HEIGHT }}>
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: "100%", overflow: "hidden" }}
      >
        {/* Side Images */}
        {sideImages.map((s) => (
          <PreviewableImg
            key={s.imgIndex}
            ref={(el) => { imgRefs.current[s.imgIndex] = el; }}
            src={s.src}
            alt={s.alt}
            onLoad={() => handleImgLoad(s.imgIndex)}
            className="object-contain absolute"
            style={{
              left: `${s.imgLeft}px`,
              top: `${s.imgTop}px`,
              height: `${s.imgH}px`,
              width: `${s.imgW}px`,
              objectPosition: s.objectPos,
              // D4a：堆叠后中心图 z 在上（=2 保留）；四角图在下。
              // 为了四角图在上层不会盖到中心图，堆叠时我们把角图 z 降到 1。
              zIndex: stacked ? 1 : s.z,
              transform: getStackedTransform(s.imgLeft, s.imgTop, s.imgW, s.imgH),
              opacity: stacked ? 0.5 : 1,
              transition: `transform ${ANIM_DURATION} cubic-bezier(0.4, 0, 0.2, 1), opacity ${ANIM_DURATION} cubic-bezier(0.4, 0, 0.2, 1), z-index 0.1s`,
              // D3：堆叠 transform 以"目标左上角"为锚（四角图左上角 → 中心图左上角）
              transformOrigin: "top left",
            }}
          />
        ))}

        {/* Center Image (堆叠中 transform 永远 = none，尺寸位置不动，D3) */}
        <PreviewableImg
          ref={(el) => { imgRefs.current[1] = el; }}
          src={centerImg.src}
          alt={centerImg.alt || "Center"}
          onLoad={() => handleImgLoad(1)}
          onClick={() => setStacked(!stacked)}
          className="object-contain absolute cursor-pointer"
          style={{
            left: `${centerLeft}px`,
            top: 0,
            height: `${centerH}px`,
            width: `${centerW}px`,
            objectPosition: "top",
            // D4a：堆叠后中心图 z 稳定在 2；四角 z=1（下方），所以中心图在上，半透显露出下方叠层
            zIndex: 2,
            transform: "none", // D3：始终不动
            opacity: stacked ? 0.5 : 1,
            transition: `opacity ${ANIM_DURATION} cubic-bezier(0.4, 0, 0.2, 1), z-index 0.1s`,
            transformOrigin: "center center",
          }}
        />

        {/* Layer blending / Restore layers 按钮：紧贴右下图 (RB) 右侧垂直居中
            - 与中心图共用同一个 stacked state：点击切换堆叠动画（四角→中心叠化 + opacity 0.5）
            - 样式与 View original image 胶囊一致：半黑圆角 pill + 白字 11px + 透明度 hover 过渡
            - 不依赖 group hover：按钮是常驻可见的显式 CTA（用户明确"按钮放在右下图右边"，而非 hover 才显）
            - 位置参与 fit_b scale 预留（见 BTN_WIDTH_RESERVED），窄屏下整体等比缩小，不会被 overflow:hidden 裁掉 */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setStacked((s) => !s);
          }}
          className="transition-opacity duration-200 absolute opacity-90 hover:opacity-100 active:opacity-100"
          style={{
            left: `${rightBottomLeft + rightBottomW + gap}px`,
            // 垂直底对齐：按钮底边 = 右下图 (RB) 底边
            // RB.top = H/2 + gap/2；RB.bottom = RB.top + sideH
            // 按钮高由 padding (4+4 px) + 11px 行高 (lineHeight:1) 近似 20 px
            // 若按钮内容换行（实际只有一层英文），此处可能有 1-2px 偏差；可把高度改成显式 height:20px
            top: `${H / 2 + gap / 2 + sideH - 20}px`,
            padding: "4px 9px",
            height: "20px", // 显式写死高度 → 底边对齐到像素级不随字重/行高漂
            borderRadius: "9999px",
            background: "rgba(0,0,0,0.55)",
            color: "white",
            fontSize: "11px",
            lineHeight: 1,
            letterSpacing: "0.02em",
            fontFamily: "system-ui, -apple-system, sans-serif",
            border: "none",
            cursor: "pointer",
            userSelect: "none",
            WebkitBackdropFilter: "blur(2px)",
            backdropFilter: "blur(2px)",
            zIndex: stacked ? 5 : 6, // 堆叠动画期间也不被任何半透图片覆盖
          }}
          aria-pressed={stacked}
        >
          {stacked ? "Restore layers" : "Layer blending"}
        </button>
      </div>
    </div>
  );
}

type ImgSrc = { src: string; alt?: string };

/**
 * 单行宽度优先布局：
 *  1. 根据容器宽度 W，按图片宽高比分配每张图的像素宽度；
 *  2. 图片高度按宽高比自适应；
 *  3. 容器高度由最高的图片撑开，所有图片底部对齐。
 */
function WidthRow({
  images,
  gapX,
  rowKey,
}: {
  images: ImgSrc[];
  gapX: number;
  rowKey?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [dims, setDims] = useState<{ w: number; h: number }[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    images.forEach((_, i) => {
      const img = imgRefs.current[i];
      if (img && img.complete && img.naturalWidth > 0) {
        setDims((prev) => {
          const next = [...prev];
          next[i] = { w: img.naturalWidth, h: img.naturalHeight };
          return next;
        });
      }
    });
  }, [images]);

  const handleImgLoad = (index: number) => {
    const img = imgRefs.current[index];
    if (img) {
      setDims((prev) => {
        const next = [...prev];
        next[index] = { w: img.naturalWidth, h: img.naturalHeight };
        return next;
      });
    }
  };

  const count = images.length;
  const totalGap = (count - 1) * gapX;
  const availableWidth = containerWidth - totalGap;

  let widths: number[] = [];
  let heights: number[] = [];
  if (availableWidth > 0 && dims.length >= count && dims.every((d) => d && d.w > 0)) {
    const ratios = dims.map((d) => d.w / d.h);
    const totalRatio = ratios.reduce((a, b) => a + b, 0);
    widths = ratios.map((r) => (r / totalRatio) * availableWidth);
    heights = widths.map((w, i) => w / ratios[i]);
  }

  return (
    <div
      ref={containerRef}
      className="flex w-full items-end"
      style={{ gap: `${gapX}px` }}
      data-row-key={rowKey}
    >
      {images.map((img, i) => (
        <PreviewableImg
          key={i}
          ref={(el) => { imgRefs.current[i] = el; }}
          src={img.src}
          alt={img.alt || `Image ${i + 1}`}
          onLoad={() => handleImgLoad(i)}
          className="object-contain block"
          style={{
            width: widths[i] ? `${widths[i]}px` : "auto",
            height: heights[i] ? `${heights[i]}px` : "auto",
            display: "block",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

function RowSubPage({ subPage }: { subPage: SubPage }) {
  const widthPct =
    typeof subPage.widthPercent === "number"
      ? Math.min(100, Math.max(1, subPage.widthPercent))
      : 100;
  const widthWrapperStyle: React.CSSProperties | undefined =
    widthPct < 100
      ? {
          width: `${widthPct}%`,
          maxWidth: "100%",
          marginLeft: "auto",
          marginRight: "auto",
        }
      : undefined;
  const rowBlock = (
    <WidthRow images={subPage.images} gapX={GAP} />
  );
  const descBlock = subPage.description ? (
    <p
      className="text-gray-700 mt-4 text-left"
      style={{
        fontFamily: TITLE_FONT,
        fontSize: "12px",
        lineHeight: "16pt",
        color: "#464646",
      }}
    >
      {renderDescription(subPage.description)}
    </p>
  ) : null;
  return (
    <div className="mt-16">
      {widthWrapperStyle ? (
        <div style={widthWrapperStyle}>
          {rowBlock}
          {descBlock}
        </div>
      ) : (
        <>
          {rowBlock}
          {descBlock}
        </>
      )}
    </div>
  );
}

/**
 * LeftMainRightStackedSubPage（左图 + 右上大图 + 右下若干张图）
 *  - images[0]       = 左图（下方可选 description）
 *  - images[1]       = 右上大图
 *  - images[2..N]    = 右下任意张图（不限制数量，支持若干张）
 *
 * 桌面端布局约束：
 *  ① 「左图」和「右上大图」严格等高 H_top → 两者按宽高比自适应宽度
 *     W0 = r0 * H_top,  W1 = r1 * H_top,  W0 + GAP + W1 = 整容器宽 W
 *  ② 右下所有图严格等高 H_bottom → 在「总宽度 = W1（右上大图宽度）」的约束下
 *     按各自宽高比分配宽度：Σ(ri * H_bottom) + (K-1)*GAP = W1
 */
function LeftMainRightStackedSubPage({ subPage }: { subPage: SubPage }) {
  const leftImg = subPage.images[0];
  const topRightImg = subPage.images[1];
  const bottomRow = subPage.images.slice(2); // 支持右下任意张，不再限制 3 张
  const mainRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [dims, setDims] = useState<{ w: number; h: number }[]>([]);
  const [containerW, setContainerW] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const gap = GAP;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!mainRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerW(entry.contentRect.width);
    });
    ro.observe(mainRef.current);
    return () => ro.disconnect();
  }, []);

  const handleImgLoad = (i: number, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDims((prev) => {
      const next = [...prev];
      next[i] = { w: img.naturalWidth, h: img.naturalHeight };
      return next;
    });
  };

  // 首屏图片可能已经 cached 加载完成：手动补一次 dims
  useEffect(() => {
    subPage.images.forEach((_, i) => {
      const img = imgRefs.current[i];
      if (img && img.complete && img.naturalWidth > 0) {
        setDims((prev) => {
          if (prev[i]?.w) return prev;
          const next = [...prev];
          next[i] = { w: img.naturalWidth, h: img.naturalHeight };
          return next;
        });
      }
    });
  }, [subPage.images]);

  // ============ 桌面端尺寸计算 ============
  const imgCount = subPage.images.length;
  const bottomCount = bottomRow.length;
  const dimsReady =
    containerW > 0 &&
    dims.length >= imgCount &&
    dims.every((d, i) => i >= imgCount || (d && d.w > 0));

  // 先把 dims 的索引和 subPage.images 对齐：0=left, 1=topRight, 2..N=bottom
  let W0 = 0, W1 = 0, H_top = 0;
  let H_bottom = 0;
  let bottomWidths: number[] = [];

  if (dimsReady) {
    const r0 = dims[0].w / dims[0].h;
    const r1 = dims[1].w / dims[1].h;

    // 约束 ①：左图和右上大图等高
    // W0 + GAP + W1 = containerW   →   r0*H + GAP + r1*H = containerW
    H_top = (containerW - gap) / (r0 + r1);
    W0 = r0 * H_top;
    W1 = r1 * H_top;

    // 约束 ②：右下若干张图等高，总宽度 = W1
    if (bottomCount > 0) {
      const bottomRatios = bottomRow.map(
        (_, offset) => {
          const d = dims[2 + offset];
          return d ? d.w / d.h : 1;
        }
      );
      const totalR = bottomRatios.reduce((a, b) => a + b, 0);
      const bottomGapTotal = (bottomCount - 1) * gap;
      const availableBottomW = W1 - bottomGapTotal;
      if (availableBottomW > 0 && totalR > 0) {
        H_bottom = availableBottomW / totalR;
        bottomWidths = bottomRatios.map((r) => r * H_bottom);
      }
    }
  }

  if (isMobile) {
    return (
      <div className="mt-16">
        <div className="flex flex-col w-full" style={{ gap: `${gap}px` }}>
          {/* 左图 + description（保持原顺序）*/}
          <div className="flex flex-col w-full">
            <PreviewableImg
              ref={(el) => { imgRefs.current[0] = el; }}
              src={leftImg.src}
              alt={leftImg.alt || "Left image"}
              onLoad={(e) => handleImgLoad(0, e)}
              className="block w-full"
              style={{ height: "auto", objectFit: "contain", maxHeight: "70vh" }}
            />
            {subPage.description && (
              <p
                className="text-gray-700 mt-4 text-left"
                style={{
                  fontFamily: TITLE_FONT,
                  fontSize: "12px",
                  lineHeight: "16pt",
                  color: "#464646",
                }}
              >
                {renderDescription(subPage.description)}
              </p>
            )}
          </div>

          {/* 右上大图 + 右下所有图（支持任意张，垂直堆叠顺序排列）*/}
          <div className="flex flex-col w-full" style={{ gap: `${gap}px` }}>
            <PreviewableImg
              ref={(el) => { imgRefs.current[1] = el; }}
              src={topRightImg.src}
              alt={topRightImg.alt || "Top right image"}
              onLoad={(e) => handleImgLoad(1, e)}
              className="block w-full"
              style={{ height: "auto", objectFit: "contain", maxHeight: "60vh" }}
            />
            {bottomRow.map((img, offset) => {
              const imgIdx = 2 + offset;
              return (
                <PreviewableImg
                  key={imgIdx}
                  ref={(el) => { imgRefs.current[imgIdx] = el; }}
                  src={img.src}
                  alt={img.alt || `Bottom image ${offset + 1}`}
                  onLoad={(e) => handleImgLoad(imgIdx, e)}
                  className="block w-full"
                  style={{ height: "auto", objectFit: "contain", maxHeight: "50vh" }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 桌面端
  return (
    <div className="mt-16">
      <div
        ref={mainRef}
        className="flex w-full"
        style={{ gap: `${gap}px`, alignItems: "flex-start" }}
      >
        {/* 左列：左图 + description（独立向下延伸）*/}
        <div className="flex flex-col" style={{ width: W0 ? `${W0}px` : "auto" }}>
          <PreviewableImg
            ref={(el) => { imgRefs.current[0] = el; }}
            src={leftImg.src}
            alt={leftImg.alt || "Left image"}
            onLoad={(e) => handleImgLoad(0, e)}
            className="object-contain block"
            style={{
              width: W0 ? `${W0}px` : "auto",
              height: H_top ? `${H_top}px` : "auto",
              flexShrink: 0,
              display: "block",
            }}
          />
          {subPage.description && (
            <p
              className="text-gray-700 mt-4 text-left"
              style={{
                fontFamily: TITLE_FONT,
                fontSize: "12px",
                lineHeight: "16pt",
                color: "#464646",
              }}
            >
              {renderDescription(subPage.description)}
            </p>
          )}
        </div>

        {/* 右列：右上大图（宽 W1 高 H_top）+ 下接 bottomRow */}
        <div
          className="flex flex-col"
          style={{
            width: W1 ? `${W1}px` : "auto",
            flexShrink: 0,
            gap: `${gap}px`,
          }}
        >
          <PreviewableImg
            ref={(el) => { imgRefs.current[1] = el; }}
            src={topRightImg.src}
            alt={topRightImg.alt || "Top right image"}
            onLoad={(e) => handleImgLoad(1, e)}
            className="object-contain block"
            style={{
              width: W1 ? `${W1}px` : "auto",
              height: H_top ? `${H_top}px` : "auto",
              flexShrink: 0,
              display: "block",
            }}
          />

          {/* 右下若干张（等高 H_bottom，各宽按宽高比分配）*/}
          {bottomCount > 0 && (
            <div
              className="flex items-end"
              style={{
                gap: `${gap}px`,
                width: W1 ? `${W1}px` : "100%",
              }}
            >
              {bottomRow.map((img, offset) => {
                const imgIdx = 2 + offset;
                const bw = bottomWidths[offset];
                return (
                  <PreviewableImg
                    key={imgIdx}
                    ref={(el) => { imgRefs.current[imgIdx] = el; }}
                    src={img.src}
                    alt={img.alt || `Bottom image ${offset + 1}`}
                    onLoad={(e) => handleImgLoad(imgIdx, e)}
                    className="object-contain block"
                    style={{
                      width: bw ? `${bw}px` : "auto",
                      height: H_bottom ? `${H_bottom}px` : "auto",
                      flexShrink: 0,
                      display: "block",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 多行宽度优先布局：
 *  - subPage.rows 定义每行由哪些下标的图片组成，例：
 *    rows = [[0, 1, 2, 3], [4, 5]] → 共两行：
 *      第一行：images[0], images[1], images[2], images[3]
 *      第二行：images[4], images[5]
 *  - 如果 rows 未提供，就把所有图片放到一行。
 *  - subPage.description 可选，显示在所有行下方。
 */
function MultiRowSubPage({ subPage }: { subPage: SubPage }) {
  const gapX = GAP;
  const rowGap = GAP;
  const rowsDef =
    subPage.rows && subPage.rows.length > 0
      ? subPage.rows
      : [subPage.images.map((_, i) => i)];
  const widthPct =
    typeof subPage.widthPercent === "number"
      ? Math.min(100, Math.max(1, subPage.widthPercent))
      : 100;
  const widthWrapperStyle: React.CSSProperties | undefined =
    widthPct < 100
      ? {
          width: `${widthPct}%`,
          maxWidth: "100%",
          marginLeft: "auto",
          marginRight: "auto",
        }
      : undefined;

  const rowsBlock = (
    <div
      className="flex flex-col w-full"
      style={{ rowGap: `${rowGap}px` }}
    >
      {rowsDef.map((rowIndices, rowIdx) => {
        const rowImages: ImgSrc[] = rowIndices
          .map((idx) => subPage.images[idx])
          .filter((img): img is ImgSrc => !!img);
        return (
          <WidthRow
            key={`row-${rowIdx}`}
            images={rowImages}
            gapX={gapX}
            rowKey={`r${rowIdx}`}
          />
        );
      })}
    </div>
  );

  const descBlock = subPage.description ? (
    <p
      className="text-gray-700 mt-4 text-left"
      style={{
        fontFamily: TITLE_FONT,
        fontSize: "12px",
        lineHeight: "16pt",
        color: "#464646",
      }}
    >
      {renderDescription(subPage.description)}
    </p>
  ) : null;

  return (
    <div className="mt-16">
      {widthWrapperStyle ? (
        <div style={widthWrapperStyle}>
          {rowsBlock}
          {descBlock}
        </div>
      ) : (
        <>
          {rowsBlock}
          {descBlock}
        </>
      )}
    </div>
  );
}

/**
 * 七图 2:3 双栏附页模板（sevenSplit，拓展版：数量 / 宽度比可调）
 *
 *  【布局结构】（↕：栏内对齐方向；—/—：内部同行等高）
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │ 左栏 = splitRatio[0] 份          │ 右栏 = splitRatio[1] 份          │
 *  │                                  │                                  │
 *  │ ┌─────────────────────────────┐  │ ┌──────────────────────────────┐ │
 *  │ │ 左上：images[0]             │  │ │ 右上：images[1..T]           │ │
 *  │ │ 宽=左栏宽                   │  │ │ 一行 topRightCount 张         │ │ ← 右栏 justify-start → 整体上对齐 ✓
 *  │ │ 高=左栏宽 / r₀              │  │ │ 同行严格等高，总宽顶满右栏   │ │
 *  │ └─────────────────────────────┘  │ │ Σ widths + (T-1)*24 = 右栏宽 │ │
 *  │                                  │ └──────────────────────────────┘ │
 *  │                                  │  gapY=24                         │
 *  │                                  │ ┌──────────────────────────────┐ │
 *  │                                  │ │ 右下：images[T+1]            │ │
 *  │                                  │ │ 宽=右栏宽，高按比例          │ │
 *  │                                  │ └──────────────────────────────┘ │
 *  │ ┌─────────────────────────────┐  │                                  │
 *  │ │ 左下：images[T+2..T+1+B]    │  │                                  │
 *  │ │ 一行 leftBottomCount 张     │  │                                  │
 *  │ │ 同行严格等高，总宽顶满左栏  │  │                                  │
 *  │ │ Σ widths + (B-1)*24=左栏宽 │  │                                  │
 *  │ └─────────────────────────────┘  │                                  │ ← 左栏 justify-between → 左下行整体下对齐 ✓
 *  └─────────────────────────────────────────────────────────────────────┘
 *
 *  - splitRatio：默认 [2, 3]（左 40% : 右 60%，两栏间 gap=24）
 *  - topRightCount：右上一行图片数量，默认 3
 *  - leftBottomCount：左下一行图片数量，默认 2
 *  - 图片总数量 = 1 + topRightCount + 1 + leftBottomCount
 *  - 响应式 <768px：纵向堆叠，顺序 = 左上 → 右上同行 → 右下 → 左下同行
 */
function SevenSplitSubPage({ subPage }: { subPage: SubPage }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [containerW, setContainerW] = useState(0);
  const [dims, setDims] = useState<{ w: number; h: number }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const GAP_X = 24;
  const GAP_Y = 24;

  // 可调参数（默认值与原始七图 2:3 规范一致）
  const splitRatio: [number, number] = subPage.splitRatio && subPage.splitRatio.length === 2
    ? subPage.splitRatio
    : [2, 3];
  const topRightCount = Math.max(0, Math.floor(subPage.topRightCount ?? 3));
  const leftBottomCount = Math.max(0, Math.floor(subPage.leftBottomCount ?? 2));

  // 下标映射
  const TOP_LEFT_IDX = 0;
  const TOP_RIGHT_START = 1;
  const TOP_RIGHT_END = TOP_RIGHT_START + topRightCount; // exclusive
  const BOTTOM_RIGHT_IDX = TOP_RIGHT_END;
  const BOTTOM_LEFT_START = BOTTOM_RIGHT_IDX + 1;
  const BOTTOM_LEFT_END = BOTTOM_LEFT_START + leftBottomCount; // exclusive
  const totalExpected = 1 + topRightCount + 1 + leftBottomCount;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerW(entry.contentRect.width);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleImgLoad = useCallback(
    (i: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setDims((prev) => {
        if (prev[i]?.w === img.naturalWidth && prev[i]?.h === img.naturalHeight) return prev;
        const next = [...prev];
        next[i] = { w: img.naturalWidth, h: img.naturalHeight };
        return next;
      });
    },
    []
  );

  // 首屏已缓存图片直接填充 dims，避免二次重排
  useEffect(() => {
    subPage.images.forEach((_, i) => {
      const img = imgRefs.current[i];
      if (img && img.complete && img.naturalWidth > 0) {
        setDims((prev) => {
          if (prev[i]?.w) return prev;
          const next = [...prev];
          next[i] = { w: img.naturalWidth, h: img.naturalHeight };
          return next;
        });
      }
    });
    setDims((prev) => {
      if (prev.length === subPage.images.length) return prev;
      if (prev.length > subPage.images.length) return prev.slice(0, subPage.images.length);
      return [...prev, ...new Array(subPage.images.length - prev.length).fill(null)];
    });
  }, [subPage.images]);

  const ratioAt = (i: number) => {
    const d = dims[i];
    return d && d.w > 0 && d.h > 0 ? d.w / d.h : 1;
  };
  const dimsReadyAt = (i: number) => {
    const d = dims[i];
    return !!(d && d.w > 0 && d.h > 0);
  };

  // ====== 通用同行等高算法（N 张图，指定可用宽度，返回 widths 数组和统一高度 H，归一化保证总和=avail） ======
  const rowEqualHeight = (indices: number[], availW: number) => {
    const n = indices.length;
    const widths = new Array<number>(n).fill(0);
    let H = 0;
    if (availW <= 0 || n <= 0) return { widths, H };
    const totalGap = (n - 1) * GAP_X;
    const av = availW - totalGap;
    if (av <= 0) {
      const avg = availW / n;
      return { widths: new Array<number>(n).fill(avg), H: avg };
    }
    if (indices.every((i) => dimsReadyAt(i))) {
      const rs = indices.map((i) => ratioAt(i));
      const sumR = rs.reduce((a, b) => a + b, 0);
      H = sumR > 0 ? av / sumR : 0;
      let ws = rs.map((r) => r * H);
      const sumW = ws.reduce((a, b) => a + b, 0);
      if (sumW > 0 && Math.abs(sumW - av) > 0.01) {
        const scale = av / sumW;
        ws = ws.map((w) => w * scale);
        H = H * scale;
      }
      ws.forEach((w, k) => (widths[k] = w));
    } else {
      const avg = av / n;
      for (let k = 0; k < n; k++) widths[k] = avg;
      H = avg;
    }
    return { widths, H };
  };

  // ====== 桌面端栏宽计算 ======
  const availTotal = Math.max(0, containerW - GAP_X); // 两栏之间 gap
  const ratioSum = splitRatio[0] + splitRatio[1] || 1;
  const leftColW = availTotal * (splitRatio[0] / ratioSum);
  const rightColW = availTotal * (splitRatio[1] / ratioSum);

  // 左上单张：images[0]，宽顶满左栏
  const topLeftH = leftColW > 0 ? leftColW / ratioAt(TOP_LEFT_IDX) : 0;
  // 右下单张：images[T+1]，宽顶满右栏
  const bottomRightH = rightColW > 0 ? rightColW / ratioAt(BOTTOM_RIGHT_IDX) : 0;

  // 右上一行：images[1..T]，同行等高，总宽顶满右栏
  const topRightIndices = Array.from({ length: topRightCount }, (_, k) => TOP_RIGHT_START + k);
  const { widths: topRightWs, H: topRightH } = rowEqualHeight(topRightIndices, rightColW);

  // 左下一行：images[T+2..T+1+B]，同行等高，总宽顶满左栏
  const bottomLeftIndices = Array.from({ length: leftBottomCount }, (_, k) => BOTTOM_LEFT_START + k);
  const { widths: bottomLeftWs, H: bottomLeftH } = rowEqualHeight(bottomLeftIndices, leftColW);

  // 单图块渲染（固定 width × height 容器 + 下方 caption）
  const imageBlock = (idx: number, width: number, height: number) => {
    const img = subPage.images[idx];
    if (!img) return null;
    return (
      <div
        key={idx}
        className="flex flex-col items-center shrink-0"
        style={{ width: `${width}px` }}
      >
        <div
          className="group relative block overflow-hidden"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <PreviewableImg
            ref={(el) => { imgRefs.current[idx] = el; }}
            src={img.src}
            alt={img.alt || `Image ${idx + 1}`}
            loading="lazy"
            className="h-full w-full object-contain"
            onLoad={(e) => handleImgLoad(idx, e)}
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        </div>
        {img.caption && img.caption.length > 0 && (
          <p
            className="text-gray-700 text-center leading-tight mt-2"
            style={{ maxWidth: `${width}px`, fontSize: "10px", opacity: 0.5 }}
          >
            {renderCaptionText(img.caption)}
          </p>
        )}
      </div>
    );
  };

  // 同行多图（一行）
  const inlineRow = (indices: number[], widths: number[], height: number, itemsAlign: "start" | "end" = "start") => (
    <div
      className={`flex shrink-0 ${itemsAlign === "end" ? "items-end" : "items-start"}`}
      style={{ gap: `${GAP_X}px` }}
    >
      {indices.map((idx, k) => imageBlock(idx, widths[k], height))}
    </div>
  );

  // 移动端顺序：左上 → 右上行 → 右下 → 左下行
  const mobileOrder: number[] = [TOP_LEFT_IDX];
  for (let i = TOP_RIGHT_START; i < TOP_RIGHT_END; i++) mobileOrder.push(i);
  mobileOrder.push(BOTTOM_RIGHT_IDX);
  for (let i = BOTTOM_LEFT_START; i < BOTTOM_LEFT_END; i++) mobileOrder.push(i);

  // ============ 移动端：纵向堆叠 ============
  if (isMobile) {
    return (
      <div className="mt-16">
        <div
          ref={containerRef}
          className="flex flex-col w-full"
          style={{ gap: `${GAP_Y}px` }}
        >
          {mobileOrder.map((i) => {
            const img = subPage.images[i];
            if (!img) return null;
            return (
              <div key={i} className="flex flex-col items-center w-full">
                <div style={{ width: "100%" }}>
                  <PreviewableImg
                    ref={(el) => { imgRefs.current[i] = el; }}
                    src={img.src}
                    alt={img.alt || `Image ${i + 1}`}
                    loading="lazy"
                    className="object-contain w-full"
                    onLoad={(e) => handleImgLoad(i, e)}
                    style={{ width: "100%", height: "auto", display: "block", maxHeight: "60vh" }}
                  />
                </div>
                {img.caption && img.caption.length > 0 && (
                  <p
                    className="text-gray-700 text-center leading-tight mt-2"
                    style={{ maxWidth: "100%", fontSize: "10px", opacity: 0.5 }}
                  >
                    {renderCaptionText(img.caption)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {subPage.description && (
          <p
            className="text-gray-700 mt-4"
            style={{
              fontFamily: TITLE_FONT,
              fontSize: "12px",
              lineHeight: "16pt",
              color: "#464646",
            }}
          >
            {renderDescription(subPage.description)}
          </p>
        )}
      </div>
    );
  }

  // ============ 桌面端：双栏 ============
  return (
    <div className="mt-16">
      <div
        ref={containerRef}
        className="flex items-stretch w-full"
        style={{ gap: `${GAP_X}px` }}
      >
        {/* 左栏：justify-between → 左上贴顶，左下一整行贴底（下对齐 ✓） */}
        <div
          className="flex flex-col justify-between shrink-0"
          style={{ width: `${leftColW}px`, minHeight: "1px" }}
        >
          <div>{imageBlock(TOP_LEFT_IDX, leftColW, topLeftH)}</div>
          <div style={{ marginTop: `${GAP_Y}px` }}>
            {inlineRow(bottomLeftIndices, bottomLeftWs, bottomLeftH, "start")}
          </div>
        </div>
        {/* 右栏：justify-between → 右上一行贴顶（上对齐 ✓），右下单张贴底（下对齐 ✓） */}
        <div
          className="flex flex-col justify-between shrink-0"
          style={{ width: `${rightColW}px`, minHeight: "1px" }}
        >
          <div>{inlineRow(topRightIndices, topRightWs, topRightH, "start")}</div>
          <div style={{ marginTop: `${GAP_Y}px` }}>
            {imageBlock(BOTTOM_RIGHT_IDX, rightColW, bottomRightH)}
          </div>
        </div>
      </div>
      {subPage.description && (
        <p
          className="text-gray-700 mt-4 text-left"
          style={{
            fontFamily: TITLE_FONT,
            fontSize: "12px",
            lineHeight: "16pt",
            color: "#464646",
          }}
        >
          {renderDescription(subPage.description)}
        </p>
      )}
    </div>
  );
  void totalExpected;
}

/**
 * Becoming Human 第 2 附页定制 5 图拼贴布局（layout: "becomingHumanCollage5"）
 * 布局结构（严格对应截图，共 2 行）：
 *
 *   Row 1 (2 张，同行严格等高，总宽顶满容器)：
 *   ┌───────────────────────────────────────┐ gap24 ┌──────────────┐
 *   │ images[0] = part-8.jpg (大图)        │       │ images[1] =    │
 *   │ 宽度按真实比例                        │       │ part-9.jpg(小图)│
 *   └───────────────────────────────────────┘       └──────────────┘
 *                    heights 严格相等，H1 = (W-24)/(r0+r1)
 *   gapY = 24px
 *   Row 2 (3 张，同行严格等高，总宽顶满容器)：
 *   ┌──────────────┐ gap24 ┌──────────────────┐ gap24 ┌──────────────────┐
 *   │ images[2] =  │       │ images[3] =      │       │ images[4] =      │
 *   │ part-10.jpg  │       │ part-11.jpg      │       │ part-12.jpg      │
 *   └──────────────┘       └──────────────────┘       └──────────────────┘
 *                    heights 严格相等，H2 = (W-2*24)/(r2+r3+r4)
 *
 *  - 移动端 <768px：按 [0,1,2,3,4] 顺序纵向堆叠，每张 w-full/h-auto/maxHeight 60vh
 *  - 每张图可选 caption（mt-2 / 10px / opacity 0.5 / 深灰居中，与 grid/sevenSplit 同款）
 *  - 整页可选 description（下方）
 */
function BecomingHumanCollage5SubPage({ subPage }: { subPage: SubPage }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [containerW, setContainerW] = useState(0);
  const [dims, setDims] = useState<{ w: number; h: number }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const GAP_X = 24;
  const GAP_Y = 24;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerW(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleImgLoad = useCallback(
    (i: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setDims((prev) => {
        if (prev[i]?.w === img.naturalWidth && prev[i]?.h === img.naturalHeight) return prev;
        const next = [...prev];
        next[i] = { w: img.naturalWidth, h: img.naturalHeight };
        return next;
      });
    },
    []
  );

  useEffect(() => {
    subPage.images.forEach((_, i) => {
      const img = imgRefs.current[i];
      if (img && img.complete && img.naturalWidth > 0) {
        setDims((prev) => {
          if (prev[i]?.w) return prev;
          const next = [...prev];
          next[i] = { w: img.naturalWidth, h: img.naturalHeight };
          return next;
        });
      }
    });
    setDims((prev) => {
      if (prev.length === subPage.images.length) return prev;
      if (prev.length > subPage.images.length) return prev.slice(0, subPage.images.length);
      return [...prev, ...new Array(subPage.images.length - prev.length).fill(null)];
    });
  }, [subPage.images]);

  const ratioAt = (i: number) => {
    const d = dims[i];
    return d && d.w > 0 && d.h > 0 ? d.w / d.h : 1;
  };
  const dimsReadyAt = (i: number) => {
    const d = dims[i];
    return !!(d && d.w > 0 && d.h > 0);
  };

  // 通用同行等高：按可用宽度分配 widths & 统一高度 H，归一化防溢出
  const rowEqualHeight = (indices: number[], availW: number) => {
    const n = indices.length;
    const widths = new Array<number>(n).fill(0);
    let H = 0;
    if (availW <= 0 || n <= 0) return { widths, H };
    const totalGap = (n - 1) * GAP_X;
    const av = availW - totalGap;
    if (av <= 0) {
      const avg = availW / n;
      return { widths: new Array<number>(n).fill(avg), H: avg };
    }
    if (indices.every((i) => dimsReadyAt(i))) {
      const rs = indices.map((i) => ratioAt(i));
      const sumR = rs.reduce((a, b) => a + b, 0);
      H = sumR > 0 ? av / sumR : 0;
      let ws = rs.map((r) => r * H);
      const sumW = ws.reduce((a, b) => a + b, 0);
      if (sumW > 0 && Math.abs(sumW - av) > 0.01) {
        const scale = av / sumW;
        ws = ws.map((w) => w * scale);
        H = H * scale;
      }
      ws.forEach((w, k) => (widths[k] = w));
    } else {
      const avg = av / n;
      for (let k = 0; k < n; k++) widths[k] = avg;
      H = avg;
    }
    return { widths, H };
  };

  // 行计算：Row1 indices=[0,1] 2张；Row2 indices=[2,3,4] 3张
  const row1 = rowEqualHeight([0, 1], containerW);
  const row2 = rowEqualHeight([2, 3, 4], containerW);

  const imageBlock = (idx: number, width: number, height: number) => {
    const img = subPage.images[idx];
    if (!img) return null;
    return (
      <div
        key={idx}
        className="flex flex-col items-center shrink-0"
        style={{ width: `${width}px` }}
      >
        <div
          className="group relative block overflow-hidden"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <PreviewableImg
            ref={(el) => { imgRefs.current[idx] = el; }}
            src={img.src}
            alt={img.alt || `Image ${idx + 1}`}
            loading="lazy"
            className="h-full w-full object-contain"
            onLoad={(e) => handleImgLoad(idx, e)}
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        </div>
        {img.caption && img.caption.length > 0 && (
          <p
            className="text-gray-700 text-center leading-tight mt-2"
            style={{ maxWidth: `${width}px`, fontSize: "10px", opacity: 0.5 }}
          >
            {renderCaptionText(img.caption)}
          </p>
        )}
      </div>
    );
  };

  // ============ 移动端：顺序纵向堆叠 ============
  if (isMobile) {
    return (
      <div className="mt-16">
        <div
          ref={containerRef}
          className="flex flex-col w-full"
          style={{ gap: `${GAP_Y}px` }}
        >
          {[0, 1, 2, 3, 4].map((i) => {
            const img = subPage.images[i];
            if (!img) return null;
            return (
              <div key={i} className="flex flex-col items-center w-full">
                <div style={{ width: "100%" }}>
                  <PreviewableImg
                    ref={(el) => { imgRefs.current[i] = el; }}
                    src={img.src}
                    alt={img.alt || `Image ${i + 1}`}
                    loading="lazy"
                    className="object-contain w-full"
                    onLoad={(e) => handleImgLoad(i, e)}
                    style={{ width: "100%", height: "auto", display: "block", maxHeight: "60vh" }}
                  />
                </div>
                {img.caption && img.caption.length > 0 && (
                  <p
                    className="text-gray-700 text-center leading-tight mt-2"
                    style={{ maxWidth: "100%", fontSize: "10px", opacity: 0.5 }}
                  >
                    {renderCaptionText(img.caption)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {subPage.description && (
          <p
            className="text-gray-700 mt-4"
            style={{
              fontFamily: TITLE_FONT,
              fontSize: "12px",
              lineHeight: "16pt",
              color: "#464646",
            }}
          >
            {renderDescription(subPage.description)}
          </p>
        )}
      </div>
    );
  }

  // ============ 桌面端：两行结构 ============
  return (
    <div className="mt-16">
      <div
        ref={containerRef}
        className="flex flex-col w-full"
        style={{ gap: `${GAP_Y}px` }}
      >
        {/* Row 1: 2 张同行等高 */}
        <div
          className="flex shrink-0 items-start w-full"
          style={{ gap: `${GAP_X}px` }}
        >
          {imageBlock(0, row1.widths[0] || 0, row1.H)}
          {imageBlock(1, row1.widths[1] || 0, row1.H)}
        </div>
        {/* Row 2: 3 张同行等高 */}
        <div
          className="flex shrink-0 items-start w-full"
          style={{ gap: `${GAP_X}px` }}
        >
          {imageBlock(2, row2.widths[0] || 0, row2.H)}
          {imageBlock(3, row2.widths[1] || 0, row2.H)}
          {imageBlock(4, row2.widths[2] || 0, row2.H)}
        </div>
      </div>
      {subPage.description && (
        <p
          className="text-gray-700 mt-4 text-left"
          style={{
            fontFamily: TITLE_FONT,
            fontSize: "12px",
            lineHeight: "16pt",
            color: "#464646",
          }}
        >
          {renderDescription(subPage.description)}
        </p>
      )}
    </div>
  );
}

function SubPageLayout({ subPage }: { subPage: SubPage }) {
  if (subPage.layout === "becomingHumanCollage5") {
    return <BecomingHumanCollage5SubPage subPage={subPage} />;
  }
  if (subPage.layout === "sevenSplit") {
    return <SevenSplitSubPage subPage={subPage} />;
  }

  if (subPage.layout === "multiRow") {
    return <MultiRowSubPage subPage={subPage} />;
  }

  if (subPage.layout === "leftMainRightStacked") {
    return <LeftMainRightStackedSubPage subPage={subPage} />;
  }

  if (subPage.layout === "row") {
    return <RowSubPage subPage={subPage} />;
  }

  if (subPage.layout === "fiveImageStack") {
    return <FiveImageStackSubPage subPage={subPage} />;
  }

  if (subPage.layout === "textLeftStackedRight") {
    return <TextLeftStackedRightSubPage subPage={subPage} />;
  }

  if (subPage.layout === "stackedRight") {
    return <StackedRightSubPage subPage={subPage} />;
  }

  const isSingle = subPage.layout === "single" || subPage.images.length === 1;

  if (isSingle) {
    const img = subPage.images[0];
    return (
      <div className="mt-16">
        <PreviewableImg
          src={img.src}
          alt={img.alt || "Sub page"}
          className="object-contain block w-full"
          style={{ maxHeight: "80vh" }}
        />
        {subPage.description && (
          <p
            className="text-gray-700 mt-4 text-left"
            style={{
              fontFamily: TITLE_FONT,
              fontSize: "12px",
              lineHeight: "16pt",
              color: "#464646",
            }}
          >
            {renderDescription(subPage.description)}
          </p>
        )}
      </div>
    );
  }

  return <GridSubPage subPage={subPage} />;
}

function renderSubPages(subPages?: SubPage[]) {
  if (!subPages || subPages.length === 0) return null;
  return (
    <>
      {subPages.map((sp, i) => (
        <SubPageLayout key={i} subPage={sp} />
      ))}
    </>
  );
}

export function WorkDetail({ work, index, gap = GAP }: Props) {
  const displayTitle = work.displayTitle || work.title;
  const numStr = "";
  const isCenter = work.layout === "center";
  const isWide = work.layout === "wide";
  const isWideBottom = work.layout === "wideBottom";
  const isPartial = work.layout === "partial";
  const isSideBySide = work.layout === "right" || work.layout === "left" || !work.layout;
  const isBottom = work.layout === "bottom";
  const isGrid = work.layout === "grid";

  // work 级开关：有 heroLink / work.link（整个作品是外部跳转）→ 主图 + 所有 part-N 都隐藏"查看原图"
  const showWorkLevelVO = !(work.heroLink || work.link);
  const wrapCtx = (node: React.ReactNode) => (
    // D7：LightboxProvider 只挂在 WorkDetail 内部单例
    <LightboxProvider>
      <FallbackThumbnailCtx.Provider value={work.thumbnail}>
        <ShowViewOriginalCtx.Provider value={showWorkLevelVO}>
          {node}
        </ShowViewOriginalCtx.Provider>
      </FallbackThumbnailCtx.Provider>
    </LightboxProvider>
  );

  const subPages = renderSubPages(work.subPages);

  if (isGrid) {
    return wrapCtx(
      <>
        <GridLayout work={work} displayTitle={displayTitle} numStr={numStr} />
        {subPages}
      </>
    );
  }

  // WideBottom + Bottom → 合并模板：文本在顶部，图片在下方 min-height:80vh 区域（下方描述）
  if (isWideBottom || isBottom) {
    // layout="wideBottom" → 100%；layout="bottom" → imgWidthRatio*100，默认 75%
    const imageWidthPercent = isWideBottom
      ? 100
      : (work.imgWidthRatio != null ? work.imgWidthRatio * 100 : 75);
    return wrapCtx(
      <>
        <HeroImageBottomLayout
          work={work}
          displayTitle={displayTitle}
          numStr={numStr}
          imageWidthPercent={imageWidthPercent}
        />
        {subPages}
      </>
    );
  }

  // Wide + Partial → 合并模板：文本在顶部，图片紧跟其后（下方描述），可配置图片宽度百分比
  if (isWide || isPartial) {
    // layout="wide" → 100%；layout="partial" → imgWidthRatio*100，默认 75%
    const imageWidthPercent = isWide
      ? 100
      : (work.imgWidthRatio != null ? work.imgWidthRatio * 100 : 75);
    return wrapCtx(
      <>
        <HeroImageLayout
          work={work}
          displayTitle={displayTitle}
          numStr={numStr}
          imageWidthPercent={imageWidthPercent}
        />
        {subPages}
      </>
    );
  }

  if (isCenter) {
    return wrapCtx(
      <>
        <CenteredLayout
          work={work}
          displayTitle={displayTitle}
          numStr={numStr}
          textSide="left"
          gap={gap}
        />
        {subPages}
      </>
    );
  }

  if (isSideBySide) {
    // layout === "right" 或未设置 layout → 图片在右
    // layout === "left" → 图片在左
    const imageSide: "left" | "right" = work.layout === "left" ? "left" : "right";
    return wrapCtx(
      <>
        <SideBySideLayout
          work={work}
          displayTitle={displayTitle}
          numStr={numStr}
          imageSide={imageSide}
          gap={gap}
        />
        {subPages}
      </>
    );
  }

  // 兜底（逻辑上已被 isSideBySide 覆盖，防止 lint 警告）
  const fallbackImageSide: "left" | "right" = work.layout === "left" ? "left" : "right";
  return wrapCtx(
    <>
      <SideBySideLayout
        work={work}
        displayTitle={displayTitle}
        numStr={numStr}
        imageSide={fallbackImageSide}
        gap={gap}
      />
      {subPages}
    </>
  );
}

/**
 * HeroImageLayout / HeroImageBottomLayout 共用的"主图同行渲染区"：
 *  - work.images 有 ≥2 张 → 同行严格等高，真实宽高比比例分配宽度，总宽 = imageWidthPercent% 容器宽，自适应高度
 *  - 未配置 work.images 或 work.images.length ≤ 1 → 回退到原单图 ImageWithLink 渲染（向后兼容）
 *  - 多图模式下每张图可附带 caption（可选）：紧贴图片下方 mt-2，10px opacity 0.5 深灰文字居中（同 GridSubPage 新规范）
 */
function HeroImageRow({
  work,
  displayTitle,
  imageWidthPercent,
  maxHeight,
  areaStyle,
}: {
  work: Work;
  displayTitle: string;
  imageWidthPercent: number;
  maxHeight?: string;
  areaStyle?: React.CSSProperties;
}) {
  const widthStyle = `${imageWidthPercent}%`;
  const images: { src: string; alt?: string; caption?: string }[] =
    work.images && work.images.length > 0
      ? work.images
      : [{ src: work.thumbnail, alt: displayTitle }];

  // 单图：HeroImageLayout / HeroImageBottomLayout 用「外层块占 width: N%」，内部 <img> 撑满。
  // 关键：若有 heroLink/work.link → 把 width% / maxHeight 挂在 <a> 外层锚点（而不是 <img> 内部百分比），
  // 避免 inline-block 锚点 shrink-to-fit 打断 "img width% 相对页面含宽块" 的链路 → 导致图片不居中、宽度不到 N%。
  if (images.length <= 1) {
    const img0 = images[0];
    const heroSizeStyle: React.CSSProperties = {
      width: widthStyle,
      maxHeight: maxHeight || undefined,
    };

    const imgEl = (
      <PreviewableImg
        src={img0.src}
        alt={img0.alt || displayTitle}
        className="object-contain block"
        style={{ width: "100%", height: "auto", maxHeight: maxHeight || undefined, display: "block" }}
      />
    );

    const wrapLink = work.heroLink ?? work.link;

    const heroBlock = wrapLink ? (
      <a
        href={wrapLink}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center shrink-0 overflow-hidden"
        style={heroSizeStyle}
      >
        {imgEl}
      </a>
    ) : (
      <div
        className="relative flex items-center justify-center shrink-0 overflow-hidden"
        style={heroSizeStyle}
      >
        {imgEl}
      </div>
    );

    return (
      <div className="flex flex-col items-center" style={areaStyle}>
        {heroBlock}
        {renderHeroCaption(work.heroCaption)}
      </div>
    );
  }

  // 多图：同行严格等高，真实宽高比分配宽度，自适应高度
  return (
    <HeroImageMultiRow
      work={work}
      displayTitle={displayTitle}
      imageWidthPercent={imageWidthPercent}
      images={images}
      areaStyle={areaStyle}
    />
  );
}

function HeroImageMultiRow({
  work,
  displayTitle,
  imageWidthPercent,
  images,
  areaStyle,
}: {
  work: Work;
  displayTitle: string;
  imageWidthPercent: number;
  images: { src: string; alt?: string; caption?: string }[];
  areaStyle?: React.CSSProperties;
}) {
  const widthStyle = `${imageWidthPercent}%`;
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [contentWidth, setContentWidth] = useState(0);
  const [dims, setDims] = useState<{ w: number; h: number }[]>([]);
  const GAP_X = 24;

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleImgLoad = useCallback(
    (i: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setDims((prev) => {
        if (prev[i]?.w === img.naturalWidth && prev[i]?.h === img.naturalHeight) return prev;
        const next = [...prev];
        next[i] = { w: img.naturalWidth, h: img.naturalHeight };
        return next;
      });
    },
    []
  );

  // 首屏已缓存图片直接填充 dims，避免二次重排
  useEffect(() => {
    images.forEach((_, i) => {
      const img = imgRefs.current[i];
      if (img && img.complete && img.naturalWidth > 0) {
        setDims((prev) => {
          if (prev[i]?.w) return prev;
          const next = [...prev];
          next[i] = { w: img.naturalWidth, h: img.naturalHeight };
          return next;
        });
      }
    });
    setDims((prev) => {
      if (prev.length === images.length) return prev;
      if (prev.length > images.length) return prev.slice(0, images.length);
      return [...prev, ...new Array(images.length - prev.length).fill(null)];
    });
  }, [images]);

  const n = images.length;
  const totalGap = (n - 1) * GAP_X;
  const availableW = contentWidth - totalGap;

  let rowHeight = 300; // 降级默认高度
  let widths: number[] = new Array(n).fill(0);

  if (availableW > 0 && dims.length >= n && dims.every((d) => d && d.w > 0 && d.h > 0)) {
    // 真实宽高比就绪 → 精确比例分配 + 归一化保证总宽 = availableW
    const ratios = dims.map((d) => d.w / d.h);
    const sumR = ratios.reduce((a, b) => a + b, 0);
    rowHeight = sumR > 0 ? availableW / sumR : 300;
    widths = ratios.map((r) => r * rowHeight);
    const sumW = widths.reduce((a, b) => a + b, 0);
    if (sumW > 0 && Math.abs(sumW - availableW) > 0.01) {
      const scale = availableW / sumW;
      widths = widths.map((w) => w * scale);
      rowHeight = rowHeight * scale;
    }
  } else if (availableW > 0) {
    // 降级：用 work.aspectRatio 近似，平均分配每张宽度
    const ratio = work.aspectRatio > 0 ? work.aspectRatio : 1;
    const avgW = availableW / n;
    rowHeight = avgW / ratio;
    widths = new Array(n).fill(avgW);
  }

  return (
    <div className="flex flex-col items-center" style={areaStyle}>
      <div
        ref={containerRef}
        className="flex items-start shrink-0 overflow-hidden justify-center"
        style={{ width: widthStyle, maxWidth: "100%", gap: `${GAP_X}px` }}
      >
        {images.map((img, i) => {
          const w = widths[i];
          const rawImgEl = (
            <PreviewableImg
              ref={(el) => { imgRefs.current[i] = el; }}
              src={img.src}
              alt={img.alt || displayTitle}
              loading="lazy"
              onLoad={(e) => handleImgLoad(i, e)}
              className="object-contain block"
              style={{
                width: w ? `${w}px` : "auto",
                height: `${rowHeight}px`,
                maxWidth: "none",
              }}
            />
          );
          // heroLink 优先于 work.link；heroLink 未设置时仍用 work.link 做单张跳转
          const wrapLink = work.heroLink ?? work.link;
          const wrappedImg = wrapHeroImgWithLink(rawImgEl, wrapLink);
          return (
            <div
              key={i}
              className="flex flex-col items-center shrink-0"
              style={{ width: w ? `${w}px` : "auto" }}
            >
              {wrappedImg}
              {img.caption && img.caption.length > 0 && (
                <p
                  className="text-gray-700 text-center leading-tight mt-2"
                  style={{
                    maxWidth: w ? `${w}px` : "none",
                    fontSize: "10px",
                    opacity: 0.5,
                  }}
                >
                  {renderCaptionText(img.caption)}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {renderHeroCaption(work.heroCaption)}
    </div>
  );
}

/**
 * 合并 WideLayout（100% 图宽）+ PartialLayout（可配置图宽）：
 *  - 统一模板：顶部 标题（左）+ 材料（右），然后图片（可配置宽度 %，居中），
 *    然后描述文本（居中，宽度与图片对齐；description 可为空）。
 *  - 图片区域无 min-height 包裹，图片尺寸按宽度百分比 + 高度自适应。
 *  - imageWidthPercent: 0~100 的数字（例：100 → 顶满，75 → 75%）
 *  - 支持 work.images 多图（同 HeroImageRow）：若干图同行严格等高，总宽=imageWidthPercent%，自适应高度
 */
function HeroImageLayout({
  work,
  displayTitle,
  numStr,
  imageWidthPercent,
}: {
  work: Work;
  displayTitle: string;
  numStr: string;
  imageWidthPercent: number;
}) {
  const widthStyle = `${imageWidthPercent}%`;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full">
        {/* 标题行：和图片/描述使用相同的宽度（imageWidthPercent%）+ 居中包裹，
            保证标题左边 = 图片左边，材料右边 = 图片右边 */}
        <div className="flex justify-center mb-2 sm:mb-2">
          <div className="w-full" style={{ width: widthStyle }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 sm:gap-0">
              <h1
                className="italic text-gray-900 w-full sm:w-auto"
                style={{ fontFamily: TITLE_FONT, fontSize: "20px" }}
              >
                {numStr}
                {displayTitle}
              </h1>
              {work.materials && (
                <p
                  className="text-gray-500 text-left sm:text-right w-full sm:w-auto"
                  style={{
                    fontFamily: MONO_FONT,
                    fontSize: "14px",
                    lineHeight: "16pt",
                    color: "#464646",
                  }}
                >
                  {renderMaterials(work.materials)}
                </p>
              )}
            </div>
          </div>
        </div>

        <HeroImageRow
          work={work}
          displayTitle={displayTitle}
          imageWidthPercent={imageWidthPercent}
          maxHeight="calc(100vh - 200px)"
        />

        {work.description && (
          <div className="flex justify-center mt-4">
            <div style={{ width: widthStyle }}>
              <p
                className="text-gray-700 text-left"
                style={{
                  fontFamily: TITLE_FONT,
                  fontSize: "12px",
                  lineHeight: "16pt",
                  color: "#464646",
                }}
              >
                {renderDescription(work.description)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 合并 WideBottomLayout + BottomLayout：
 *  - 与 HeroImageLayout 结构一致，但图片放在最小高度 60vh 的 flex 居中区域内
 *    （保持原 WideBottomLayout / BottomLayout 的视觉：标题在下、图片垂直空间占满并居中顶部）
 *  - 可配置图片宽度百分比 imageWidthPercent（0~100，默认 100）。
 *  - 支持 work.images 多图（同 HeroImageRow）：若干图同行严格等高，总宽=imageWidthPercent%，自适应高度
 */
function HeroImageBottomLayout({
  work,
  displayTitle,
  numStr,
  imageWidthPercent,
}: {
  work: Work;
  displayTitle: string;
  numStr: string;
  imageWidthPercent: number;
}) {
  const widthStyle = `${imageWidthPercent}%`;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full">
        {/* 标题行：和图片/描述使用相同的宽度（imageWidthPercent%）+ 居中包裹，
            保证标题左边 = 图片左边，材料右边 = 图片右边 */}
        <div className="flex justify-center mb-2 sm:mb-2">
          <div className="w-full" style={{ width: widthStyle }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 sm:gap-0">
              <h1
                className="italic text-gray-900 w-full sm:w-auto"
                style={{ fontFamily: TITLE_FONT, fontSize: "20px" }}
              >
                {numStr}
                {displayTitle}
              </h1>
              {work.materials && (
                <p
                  className="text-gray-500 text-left sm:text-right w-full sm:w-auto"
                  style={{
                    fontFamily: MONO_FONT,
                    fontSize: "14px",
                    lineHeight: "16pt",
                    color: "#464646",
                  }}
                >
                  {renderMaterials(work.materials)}
                </p>
              )}
            </div>
          </div>
        </div>

        <HeroImageRow
          work={work}
          displayTitle={displayTitle}
          imageWidthPercent={imageWidthPercent}
          maxHeight="calc(100vh - 300px)"
          areaStyle={{ minHeight: "60vh", marginTop: "16px", display: "flex", justifyContent: "center", alignItems: "flex-start" }}
        />

        {work.description && (
          <div className="flex justify-center mt-4">
            <div style={{ width: widthStyle }}>
              <p
                className="text-gray-700 text-left"
                style={{
                  fontFamily: TITLE_FONT,
                  fontSize: "12px",
                  lineHeight: "16pt",
                  color: "#464646",
                }}
              >
                {renderDescription(work.description)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GridLayout({
  work,
  displayTitle,
  numStr,
}: {
  work: Work;
  displayTitle: string;
  numStr: string;
}) {
  const images = work.images || [{ src: work.thumbnail, alt: displayTitle }];
  const gapX = 24;
  const gapY = 12;

  // work.gridColumns：桌面端（≥640px = sm）强制固定列数，移动端永远 1 列。
  // 省略（=undefined / null）则走 legacy 响应式：sm=2 列 / lg=3 列
  const fixedCols = work.gridColumns && work.gridColumns > 0 ? Math.floor(work.gridColumns) : null;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-2 sm:mb-2 gap-2 sm:gap-0">
          <h1
            className="italic text-gray-900 w-full sm:w-auto"
            style={{
              fontFamily: TITLE_FONT,
              fontSize: "20px",
            }}
          >
            {numStr}
            {displayTitle}
          </h1>
          {work.materials && (
            <p
              className="text-gray-500 text-left sm:text-right w-full sm:w-auto"
              style={{
                fontFamily: MONO_FONT,
                fontSize: "14px",
                lineHeight: "16pt",
                color: "#464646",
              }}
            >
              {renderMaterials(work.materials)}
            </p>
          )}
        </div>

        {/* 网格：移动端永远 1 列；桌面端列数由 fixedCols 或 legacy 响应式决定 */}
        <div
          data-gridlayout-fixed={fixedCols ?? ""}
          className={
            fixedCols
              ? "grid grid-cols-1"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }
          style={{ gap: `${gapY}px ${gapX}px` }}
        >
          {images.map((img, i) => (
            <div key={i} className="flex flex-col items-center w-full">
              <div className="w-full">
                <ImageWithLink
                  src={img.src}
                  alt={img.alt || `${displayTitle} ${i + 1}`}
                  link={work.link}
                  className="object-contain block w-full"
                  style={{ maxHeight: "60vh" }}
                />
              </div>
              {img.caption && img.caption.length > 0 && (
                <p
                  className="text-gray-700 text-center leading-tight mt-2 w-full"
                  style={{ fontSize: "10px", opacity: 0.5 }}
                >
                  {renderCaptionText(img.caption)}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 当设置了固定列数 fixedCols 时：用 @media(sm) 把桌面端列数切为 fixedCols（移动端仍 1 列） */}
        {fixedCols && (
          <style
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html:
                `@media (min-width: 640px) { ` +
                `div[data-gridlayout-fixed="${fixedCols}"] { ` +
                `grid-template-columns: repeat(${fixedCols}, 1fr) !important; ` +
                `} }`,
            }}
          />
        )}

        {work.description && (
          <div className="flex justify-center mt-4">
            <p
              className="text-gray-700 text-left"
              style={{
                fontFamily: TITLE_FONT,
                fontSize: "12px",
                lineHeight: "16pt",
                color: "#464646",
                maxWidth: "100%",
              }}
            >
              {renderDescription(work.description)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 居中主图模板（CenterTextPanel 合并且通用化）：
 *  - 一张图 + 文本面板（title/materials/description），图保持在页面主内容容器水平中心；
 *  - 通过 textSide 选择文本面板放在图的左侧还是右侧；
 *  - 文本面板宽度 = (主内容宽度 − 图宽度) / 2 − gap，保证图两侧视觉留白相等；
 *  - 材料右对齐、描述 10px / serif，与 SideBySideLayout 一致。
 *  - 移动端：切换为垂直堆叠布局，文本在上方，图片在下方居中
 */
function CenteredLayout({
  work,
  displayTitle,
  numStr,
  textSide,
  gap,
}: {
  work: Work;
  displayTitle: string;
  numStr: string;
  textSide: "left" | "right";
  gap: number;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [panelWidth, setPanelWidth] = useState<number>(FALLBACK_WIDTH);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const measure = useCallback(() => {
    const containerEl = outerRef.current;
    const imgEl = imgRef.current;
    if (!containerEl || !imgEl) return;

    const containerW = containerEl.getBoundingClientRect().width;
    const imgW = imgEl.getBoundingClientRect().width;

    if (containerW < 1 || imgW < 1) {
      requestAnimationFrame(measure);
      return;
    }

    const pw = Math.max(0, Math.floor((containerW - imgW) / 2 - gap));
    setPanelWidth(pw);
  }, [gap]);

  useEffect(() => {
    if (isMobile) return;
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    if (imgRef.current) ro.observe(imgRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, isMobile]);

  const imgStyle = isMobile
    ? { width: "100%", height: "auto", maxHeight: "70vh", display: "block" }
    : { height: IMAGE_HEIGHT, width: "auto", display: "block" };
  const rawImage = (
    <PreviewableImg
      src={work.thumbnail}
      alt={displayTitle}
      ref={imgRef}
      onLoad={measure}
      className="object-contain shrink-0 mx-auto block"
      style={imgStyle}
    />
  );
  // 若有 heroLink → 包在 <a target=_blank>；否则仍走 work.link（原 ImageWithLink 老语义）
  const linkedImage = wrapHeroImgWithLink(rawImage, work.heroLink ?? work.link);

  // 图片块：<a><img></a>（或 <img>）下方挂 heroCaption
  const image = (
    <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
      {linkedImage}
      {renderHeroCaption(work.heroCaption)}
    </div>
  );

  const textPanel = (
    <div
      className="flex flex-col justify-start shrink-0"
      style={
        isMobile
          ? { width: "100%", marginBottom: "16px" }
          : {
              width: panelWidth,
              [textSide === "left" ? "marginRight" : "marginLeft"]: gap,
            }
      }
    >
      <h1
        className="italic text-gray-900 mb-2 sm:mb-4"
        style={{ fontFamily: TITLE_FONT, fontSize: "20px" }}
      >
        {numStr}
        {displayTitle}
      </h1>

      {work.materials && (
        <p
          className="text-gray-500 leading-relaxed mb-4 sm:mb-10 text-left"
          style={{ fontFamily: MONO_FONT, fontSize: "14px", lineHeight: "16pt", color: "#464646" }}
        >
          {renderMaterials(work.materials)}
        </p>
      )}

      {work.description && (
        <p
          className="text-gray-700 leading-relaxed text-left"
          style={{ fontFamily: TITLE_FONT, fontSize: "12px", lineHeight: "16pt", color: "#464646" }}
        >
          {renderDescription(work.description)}
        </p>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div ref={outerRef} style={{ width: "100%" }}>
        <div className="flex flex-col w-full">
          {textPanel}
          {image}
        </div>
      </div>
    );
  }

  // 桌面端：文本侧 & 图片侧左右顺序
  const left = textSide === "left" ? textPanel : image;
  const right = textSide === "left" ? image : textPanel;

  return (
    <div ref={outerRef} style={{ textAlign: "left", width: "100%" }}>
      <div style={{ display: "inline-block", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "flex-start", height: "80vh" }}>
          {left}
          {right}
        </div>
      </div>
    </div>
  );
}

/**
 * 统一的左右分栏主图模板：
 *  - 通过 imageSide 参数选择图片放左边还是右边；
 *  - 文本面板始终在对侧，包含标题、材料（可选右对齐）、描述（可选）；
 *  - 空间分配策略：图片先按 80vh 比例计算宽度（flexShrink:0，不收缩），
 *    文本面板占剩余空间，不足时文本自动换行收缩。
 *  - 移动端：切换为垂直堆叠布局，图片在上方，文本在下方
 */
/**
 * 渲染作品详情页"主图下方"的 heroCaption（若 work.heroCaption 存在）
 * 样式统一：mt-2 / 10px / text-center / text-gray-700 / opacity 0.5
 */
function renderHeroCaption(caption?: string) {
  if (!caption) return null;
  return (
    <p
      className="mt-2 w-full text-center leading-tight text-gray-700"
      style={{ fontSize: "10px", opacity: 0.5 }}
    >
      {renderCaptionText(caption)}
    </p>
  );
}

/**
 * 把"主图"包到 heroLink（作品详情页专用跳转）的 <a> 标签里。
 * - 若 heroLink 存在：<a target=_blank rel=noopener> 包裹
 * - 若 heroLink 不存在 → 原样返回 imgEl
 */
function wrapHeroImgWithLink(
  imgEl: React.ReactElement,
  heroLink?: string
): React.ReactElement {
  if (!heroLink) return imgEl;
  return (
    <a
      href={heroLink}
      target="_blank"
      rel="noopener noreferrer"
      className="relative inline-block shrink-0 overflow-hidden"
    >
      {imgEl}
    </a>
  );
}

function SideBySideLayout({
  work,
  displayTitle,
  numStr,
  imageSide,
  gap,
}: {
  work: Work;
  displayTitle: string;
  numStr: string;
  imageSide: "left" | "right";
  gap: number;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 原图 <img>：禁用 ImageWithLink 自带的 work.link wrapping（因为外层统一用 heroLink）
  const rawImage = (
    <PreviewableImg
      src={work.thumbnail}
      alt={displayTitle}
      className="object-contain"
      style={
        isMobile
          ? {
              width: "100%",
              height: "auto",
              maxHeight: "70vh",
              display: "block",
              flexShrink: 0,
            }
          : {
              height: IMAGE_HEIGHT,
              width: "auto",
              maxWidth: "100%",
              display: "block",
              flexShrink: 0,
            }
      }
    />
  );

  // 有 heroLink → 包 <a target=_blank>
  const linkedImage = wrapHeroImgWithLink(rawImage, work.heroLink);

  // 主图块：<img>（或 <a><img></a>）下方挂 heroCaption（若有），桌面端/移动端共用
  const image = (
    <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
      {linkedImage}
      {renderHeroCaption(work.heroCaption)}
    </div>
  );

  const textPanel = (
    <div
      className="flex flex-col justify-start"
      style={
        isMobile
          ? {
              width: "100%",
              marginTop: "16px",
            }
          : {
              maxWidth: LEFT_MAX_WIDTH,
              minWidth: 0,
              flex: "0 1 auto", // 不主动扩张，空间不足时收缩
            }
      }
    >
      <h1
        className="italic text-gray-900 mb-2 sm:mb-4"
        style={{ fontFamily: TITLE_FONT, fontSize: "20px" }}
      >
        {numStr}
        {displayTitle}
      </h1>

      {work.materials && (
        <p
          className="text-gray-500 leading-relaxed mb-4 sm:mb-10 text-left"
          style={{ fontFamily: MONO_FONT, fontSize: "14px", lineHeight: "16pt", color: "#464646" }}
        >
          {renderMaterials(work.materials)}
        </p>
      )}

      {work.description && (
        <p
          className="text-gray-700 leading-relaxed text-left"
          style={{ fontFamily: TITLE_FONT, fontSize: "12px", lineHeight: "16pt", color: "#464646" }}
        >
          {renderDescription(work.description)}
        </p>
      )}
    </div>
  );

  if (isMobile) {
    // 移动端：垂直堆叠，图片在上方，文本在下方
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {image}
        {textPanel}
      </div>
    );
  }

  // 桌面端：图片侧的外边距（只在和文本之间加 gap）
  // A2：当 imageSide="right" 时，文本贴左（默认 flex-start），图片块用 marginLeft:auto 顶到容器右边界。
  //     当 imageSide="left" 时，文本和图整体左对齐（默认 flex-start），图片仅设置右侧 24px 间隔（gap）。
  const imageWrapperStyle: React.CSSProperties =
    imageSide === "left"
      ? { flexShrink: 0, marginRight: gap }
      : { flexShrink: 0, marginLeft: "auto" };

  const left = imageSide === "left"
    ? <div style={imageWrapperStyle}>{image}</div>
    : textPanel;
  const right = imageSide === "left"
    ? textPanel
    : <div style={imageWrapperStyle}>{image}</div>;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        height: "80vh",
        width: "100%",
      }}
    >
      {left}
      {right}
    </div>
  );
}

function toRoman(num: number): string {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  let n = num;
  for (const [value, symbol] of map) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result;
}
