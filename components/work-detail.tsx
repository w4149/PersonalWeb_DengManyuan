"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Work, SubPage } from "@/lib/works-data";
import { GAP } from "@/lib/gallery-config";

type Props = {
  work: Work;
  index: number;
  gap?: number;
};

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
  const imgEl = (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
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
 * 带 hover caption 的图片组件：
 *  - 图片有 caption 时，鼠标 hover 进入图片区域：
 *    ① 图片整体被灰色半透明蒙版覆盖（background: rgba(0,0,0,0.5)）
 *    ② caption 以白色 10px serif 字体显示在图片水平+垂直中心
 *    ③ caption 内的 "|" 等价于换行符，同时也支持原生换行 \n
 *  - 图片没有 caption 时，渲染结果和纯 <img> 完全一致，无额外包裹层
 */
function ImageWithCaption({
  src,
  alt,
  caption,
  className,
  style,
  imgRef,
  imgIndex,
  onLoad,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  style?: React.CSSProperties;
  imgRef?: React.MutableRefObject<(HTMLImageElement | null)[]>;
  imgIndex?: number;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}) {
  const imgEl = (
    <img
      ref={
        imgRef && typeof imgIndex === "number"
          ? (el) => { imgRef.current[imgIndex] = el; }
          : undefined
      }
      src={src}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
    />
  );

  if (!caption || caption.length === 0) {
    return imgEl;
  }

  // 按 "|" 或 "\n" 都作为换行分隔
  const lines = caption.split(/\||\n/).map((l) => l.trim());

  return (
    <div
      className="group"
      style={{
        position: "relative",
        display: "inline-block",
        width: style?.width ?? "auto",
        height: style?.height ?? "auto",
      }}
    >
      {imgEl}

      {/* hover 蒙版 + caption 居中文字 */}
      <div
        className="group-hover:opacity-100 transition-opacity duration-200"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontFamily: TITLE_FONT,
            fontSize: "10px",
            lineHeight: "14pt",
            color: "#ffffff",
            textAlign: "center",
            margin: 0,
            padding: "0 12px",
            whiteSpace: "pre-wrap",
          }}
        >
          {lines.map((line, i) => (
            <span key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

/**
 * 通用单行宽度优先布局（合并了原 GridSubPage 和 RowCaptionSubPage）
 *  - 图片 caption 统一通过 hover 蒙版+居中白字展示（见 ImageWithCaption）
 *    不再物理预留底部空间，因此容器高度统一为 50vh
 *  - caption 内容中的 "|" 等价于换行
 *  - 宽度按图片宽高比比例分配（原 grid 行为，优于原 rowCaption 的 width:auto）
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
            <ImageWithCaption
              key={i}
              imgRef={imgRefs}
              imgIndex={i}
              src={img.src}
              alt={img.alt || `Sub page ${i + 1}`}
              caption={img.caption}
              className="object-contain w-full"
              onLoad={(e) => handleImgLoad(i, e)}
              style={{
                height: "auto",
                maxHeight: "60vh",
                display: "block",
                width: "100%",
              }}
            />
          ))}
        </div>
        {subPage.description && (
          <p
            className="text-gray-700 mt-4"
            style={{
              fontFamily: TITLE_FONT,
              fontSize: "10px",
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
        style={{ gap: `${gapX}px`, height: DESKTOP_HEIGHT }}
      >
        {subPage.images.map((img, i) => (
          <div key={i} className="flex items-center shrink-0" style={{ height: "100%" }}>
            <ImageWithCaption
              imgRef={imgRefs}
              imgIndex={i}
              src={img.src}
              alt={img.alt || `Sub page ${i + 1}`}
              caption={img.caption}
              className="object-contain"
              onLoad={(e) => handleImgLoad(i, e)}
              style={{
                height: "100%",
                width: widths[i] ? `${widths[i]}px` : "auto",
                display: "block",
              }}
            />
          </div>
        ))}
      </div>
      {subPage.description && (
        <p
          className="text-gray-700 mt-4"
          style={{
            fontFamily: TITLE_FONT,
            fontSize: "10px",
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
                fontSize: "10px",
                lineHeight: "16pt",
                color: "#464646",
              }}
            >
              {renderDescription(subPage.description)}
            </p>
          )}
          {leftImgs.map((img, i) => (
            <img
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
            <img
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

  const H = containerSize.h;
  const W = containerSize.w;

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
                fontSize: "10px",
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
            <img
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
          <img
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
            <img
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
            <img
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
              fontSize: "10px",
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

  const H = containerSize.h;
  const W = containerSize.w;

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
            <img
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
          <img
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
            fontSize: "10px",
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
          <img
            ref={(el) => { imgRefs.current[0] = el; }}
            src={leftTopImg.src}
            alt={leftTopImg.alt || "Left Top"}
            onLoad={() => handleImgLoad(0)}
            className="object-contain w-full"
            style={{ height: "auto", maxHeight: "60vh", display: "block" }}
          />
          <img
            ref={(el) => { imgRefs.current[1] = el; }}
            src={centerImg.src}
            alt={centerImg.alt || "Center"}
            onLoad={() => handleImgLoad(1)}
            className="object-contain w-full"
            style={{ height: "auto", maxHeight: "70vh", display: "block" }}
          />
          <img
            ref={(el) => { imgRefs.current[2] = el; }}
            src={leftBottomImg.src}
            alt={leftBottomImg.alt || "Left Bottom"}
            onLoad={() => handleImgLoad(2)}
            className="object-contain w-full"
            style={{ height: "auto", maxHeight: "60vh", display: "block" }}
          />
          <img
            ref={(el) => { imgRefs.current[3] = el; }}
            src={rightTopImg.src}
            alt={rightTopImg.alt || "Right Top"}
            onLoad={() => handleImgLoad(3)}
            className="object-contain w-full"
            style={{ height: "auto", maxHeight: "60vh", display: "block" }}
          />
          <img
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

  const H = containerSize.h || 600;
  const totalW = containerSize.w || 1200;
  const colW = totalW / 3;
  const gap = GAP;

  const centerAspect = dims[1] ? dims[1].w / dims[1].h : 1;
  const centerH = H;
  const centerW = centerAspect * centerH;

  const leftTopAspect = dims[0] ? dims[0].w / dims[0].h : 1;
  const leftBottomAspect = dims[2] ? dims[2].w / dims[2].h : 1;
  const rightTopAspect = dims[3] ? dims[3].w / dims[3].h : 1;
  const rightBottomAspect = dims[4] ? dims[4].w / dims[4].h : 1;

  const sideH = (H - gap) / 2;
  const leftTopW = leftTopAspect * sideH;
  const leftBottomW = leftBottomAspect * sideH;
  const rightTopW = rightTopAspect * sideH;
  const rightBottomW = rightBottomAspect * sideH;

  const maxLeftW = Math.max(leftTopW, leftBottomW, FALLBACK_WIDTH);
  const maxRightW = Math.max(rightTopW, rightBottomW, FALLBACK_WIDTH);

  const centerLeft = colW + gap / 2;
  const leftLeft = centerLeft - maxLeftW - gap;
  const rightLeft = centerLeft + centerW + gap;
  const leftTopTop = 0;
  const leftBottomTop = sideH + gap;
  const rightTopTop = 0;
  const rightBottomTop = sideH + gap;

  const ANIM_DURATION = "1.2s";
  const STACKED_W = totalW * 0.3;
  const STACKED_CX = totalW / 2;
  const STACKED_CY = H / 2;

  const getStackedTransform = (
    imgLeft: number,
    imgTop: number,
    imgW: number,
    imgH: number
  ) => {
    if (!stacked) return "none";
    const imgCx = imgLeft + imgW / 2;
    const imgCy = imgTop + imgH / 2;
    const scale = STACKED_W / imgW;
    const dx = STACKED_CX - imgCx;
    const dy = STACKED_CY - imgCy;
    return `translate(${dx}px, ${dy}px) scale(${scale})`;
  };

  const sideImages = [
    {
      src: leftTopImg.src,
      alt: leftTopImg.alt || "Left Top",
      imgIndex: 0,
      imgLeft: leftLeft,
      imgTop: leftTopTop,
      imgW: maxLeftW,
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
      imgW: maxLeftW,
      imgH: sideH,
      objectPos: "left bottom" as const,
      z: 3,
    },
    {
      src: rightTopImg.src,
      alt: rightTopImg.alt || "Right Top",
      imgIndex: 3,
      imgLeft: rightLeft,
      imgTop: rightTopTop,
      imgW: maxRightW,
      imgH: sideH,
      objectPos: "top" as const,
      z: 3,
    },
    {
      src: rightBottomImg.src,
      alt: rightBottomImg.alt || "Right Bottom",
      imgIndex: 4,
      imgLeft: rightLeft,
      imgTop: rightBottomTop,
      imgW: maxRightW,
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
          <img
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
              zIndex: stacked ? 5 : s.z,
              transform: getStackedTransform(s.imgLeft, s.imgTop, s.imgW, s.imgH),
              opacity: stacked ? 0.5 : 1,
              transition: `transform ${ANIM_DURATION} cubic-bezier(0.4, 0, 0.2, 1), opacity ${ANIM_DURATION} cubic-bezier(0.4, 0, 0.2, 1), z-index 0.1s`,
              transformOrigin: "center center",
            }}
          />
        ))}

        {/* Center Image (on top when stacked) */}
        <img
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
            zIndex: stacked ? 10 : 2,
            transform: getStackedTransform(centerLeft, 0, centerW, centerH),
            opacity: stacked ? 0.5 : 1,
            transition: `transform ${ANIM_DURATION} cubic-bezier(0.4, 0, 0.2, 1), opacity ${ANIM_DURATION} cubic-bezier(0.4, 0, 0.2, 1), z-index 0.1s`,
            transformOrigin: "center center",
          }}
        />
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
        <img
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
  return (
    <div className="mt-16">
      <WidthRow images={subPage.images} gapX={GAP} />
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
            <img
              ref={(el) => { imgRefs.current[0] = el; }}
              src={leftImg.src}
              alt={leftImg.alt || "Left image"}
              onLoad={(e) => handleImgLoad(0, e)}
              className="block w-full"
              style={{ height: "auto", objectFit: "contain", maxHeight: "70vh" }}
            />
            {subPage.description && (
              <p
                className="mt-4"
                style={{
                  fontFamily: TITLE_FONT,
                  fontSize: "10px",
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
            <img
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
                <img
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
          <img
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
              className="mt-4"
              style={{
                fontFamily: TITLE_FONT,
                fontSize: "10px",
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
          <img
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
                  <img
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

  return (
    <div className="mt-16">
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
      {subPage.description && (
        <p
          className="text-gray-700 mt-4"
          style={{
            fontFamily: TITLE_FONT,
            fontSize: "10px",
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
        <img
          src={img.src}
          alt={img.alt || "Sub page"}
          className="object-contain block w-full"
          style={{ maxHeight: "80vh" }}
        />
        {subPage.description && (
          <p
            className="text-gray-700 mt-4"
            style={{
              fontFamily: TITLE_FONT,
              fontSize: "10px",
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
  const numStr = `${toRoman(index + 1)}. `;
  const isCenter = work.layout === "center";
  const isWide = work.layout === "wide";
  const isWideBottom = work.layout === "wideBottom";
  const isPartial = work.layout === "partial";
  const isSideBySide = work.layout === "right" || work.layout === "left" || !work.layout;
  const isBottom = work.layout === "bottom";
  const isGrid = work.layout === "grid";

  const subPages = renderSubPages(work.subPages);

  if (isGrid) {
    return (
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
    return (
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
    return (
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
    return (
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
    return (
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
  return (
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
 * 合并 WideLayout（100% 图宽）+ PartialLayout（可配置图宽）：
 *  - 统一模板：顶部 标题（左）+ 材料（右），然后图片（可配置宽度 %，居中），
 *    然后描述文本（居中，宽度与图片对齐；description 可为空）。
 *  - 图片区域无 min-height 包裹，图片尺寸按宽度百分比 + 高度自适应。
 *  - imageWidthPercent: 0~100 的数字（例：100 → 顶满，75 → 75%）
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-2 sm:mb-2 gap-2 sm:gap-0">
          <h1
            className="italic text-gray-900 w-full sm:w-auto"
            style={{ fontFamily: TITLE_FONT, fontSize: "18px" }}
          >
            {numStr}
            {displayTitle}
          </h1>
          {work.materials && (
            <p
              className="text-gray-500 text-left sm:text-right w-full sm:w-auto"
              style={{
                fontFamily: MONO_FONT,
                fontSize: "12px",
                lineHeight: "16pt",
                color: "#464646",
              }}
            >
              {renderMaterials(work.materials)}
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <ImageWithLink
            src={work.thumbnail}
            alt={displayTitle}
            link={work.link}
            className="object-contain block"
            style={{ width: widthStyle, maxHeight: "calc(100vh - 200px)" }}
          />
        </div>

        {work.description && (
          <div className="flex justify-center mt-4">
            <div style={{ width: widthStyle }}>
              <p
                className="text-gray-700 text-left sm:text-center"
                style={{
                  fontFamily: TITLE_FONT,
                  fontSize: "10px",
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
 *  - 与 HeroImageLayout 结构一致，但图片放在最小高度 80vh 的 flex 居中区域内
 *    （保持原 WideBottomLayout / BottomLayout 的视觉：标题在下、图片垂直空间占满并居中顶部）
 *  - 可配置图片宽度百分比 imageWidthPercent（0~100，默认 100）。
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-2 sm:mb-2 gap-2 sm:gap-0">
          <h1
            className="italic text-gray-900 w-full sm:w-auto"
            style={{ fontFamily: TITLE_FONT, fontSize: "18px" }}
          >
            {numStr}
            {displayTitle}
          </h1>
          {work.materials && (
            <p
              className="text-gray-500 text-left sm:text-right w-full sm:w-auto"
              style={{
                fontFamily: MONO_FONT,
                fontSize: "12px",
                lineHeight: "16pt",
                color: "#464646",
              }}
            >
              {renderMaterials(work.materials)}
            </p>
          )}
        </div>

        <div className="flex justify-center items-start" style={{ minHeight: "60vh", marginTop: "16px" }}>
          <ImageWithLink
            src={work.thumbnail}
            alt={displayTitle}
            link={work.link}
            className="object-contain block"
            style={{ width: widthStyle, maxHeight: "calc(100vh - 300px)" }}
          />
        </div>

        {work.description && (
          <div className="flex justify-center mt-4">
            <div style={{ width: widthStyle }}>
              <p
                className="text-gray-700 text-left sm:text-center"
                style={{
                  fontFamily: TITLE_FONT,
                  fontSize: "10px",
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

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-2 sm:mb-2 gap-2 sm:gap-0">
          <h1
            className="italic text-gray-900 w-full sm:w-auto"
            style={{
              fontFamily: TITLE_FONT,
              fontSize: "18px",
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
                fontSize: "12px",
                lineHeight: "16pt",
                color: "#464646",
              }}
            >
              {renderMaterials(work.materials)}
            </p>
          )}
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(1, 1fr)",
            gap: `${gapY}px ${gapX}px`,
          }}
        >
          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: `${gapY}px ${gapX}px` }}
          >
            {images.map((img, i) => (
              <ImageWithLink
                key={i}
                src={img.src}
                alt={img.alt || `${displayTitle} ${i + 1}`}
                link={work.link}
                className="object-contain block w-full"
                style={{ maxHeight: "60vh" }}
              />
            ))}
          </div>
        </div>

        {work.description && (
          <div className="flex justify-center mt-4">
            <p
              className="text-gray-700 text-left sm:text-center"
              style={{
                fontFamily: TITLE_FONT,
                fontSize: "10px",
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

  const image = (
    <ImageWithLink
      src={work.thumbnail}
      alt={displayTitle}
      link={work.link}
      imgRef={imgRef}
      onLoad={measure}
      className="object-contain shrink-0 mx-auto"
      style={
        isMobile
          ? { width: "100%", height: "auto", maxHeight: "70vh", display: "block" }
          : { height: IMAGE_HEIGHT, width: "auto", display: "block" }
      }
    />
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
        style={{ fontFamily: TITLE_FONT, fontSize: "18px" }}
      >
        {numStr}
        {displayTitle}
      </h1>

      {work.materials && (
        <p
          className="text-gray-500 leading-relaxed mb-4 sm:mb-10 text-left sm:text-right"
          style={{ fontFamily: MONO_FONT, fontSize: "12px", lineHeight: "16pt", color: "#464646" }}
        >
          {renderMaterials(work.materials)}
        </p>
      )}

      {work.description && (
        <p
          className="text-gray-700 leading-relaxed"
          style={{ fontFamily: TITLE_FONT, fontSize: "10px", lineHeight: "16pt", color: "#464646" }}
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

  const image = (
    <ImageWithLink
      src={work.thumbnail}
      alt={displayTitle}
      link={work.link}
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
        style={{ fontFamily: TITLE_FONT, fontSize: "18px" }}
      >
        {numStr}
        {displayTitle}
      </h1>

      {work.materials && (
        <p
          className="text-gray-500 leading-relaxed mb-4 sm:mb-10 text-left"
          style={{ fontFamily: MONO_FONT, fontSize: "12px", lineHeight: "16pt", color: "#464646" }}
        >
          {renderMaterials(work.materials)}
        </p>
      )}

      {work.description && (
        <p
          className="text-gray-700 leading-relaxed text-left"
          style={{ fontFamily: TITLE_FONT, fontSize: "10px", lineHeight: "16pt", color: "#464646" }}
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
  const imageWrapperStyle: React.CSSProperties =
    imageSide === "left"
      ? { flexShrink: 0, marginRight: gap }
      : { flexShrink: 0, marginLeft: gap };

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