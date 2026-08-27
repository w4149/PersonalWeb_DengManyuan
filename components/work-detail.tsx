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

function GridSubPage({ subPage }: { subPage: SubPage }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [dims, setDims] = useState<{ w: number; h: number }[]>([]);
  const gapX = 24;

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

  return (
    <div className="mt-16">
      <div
        ref={containerRef}
        className="flex items-start w-full"
        style={{ gap: `${gapX}px`, height: "50vh" }}
      >
        {subPage.images.map((img, i) => (
          <img
            key={i}
            ref={(el) => { imgRefs.current[i] = el; }}
            src={img.src}
            alt={img.alt || `Sub page ${i + 1}`}
            onLoad={(e) => handleImgLoad(i, e)}
            className="object-contain shrink-0"
            style={{
              height: "100%",
              width: widths[i] ? `${widths[i]}px` : "auto",
              display: "block",
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

function TextLeftStackedRightSubPage({ subPage }: { subPage: SubPage }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [dims, setDims] = useState<{ w: number; h: number }[]>([]);
  const gapX = 24;
  const gapY = 24;

  const leftImgs = subPage.images.slice(0, 2);
  const rightImg = subPage.images[2];

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
  const gapX = 24;
  const gapY = 24;

  const leftImgs = subPage.images.slice(0, 2);
  const rightImg = subPage.images[2];

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

function RowSubPage({ subPage }: { subPage: SubPage }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [dims, setDims] = useState<{ w: number; h: number }[]>([]);
  const gapX = GAP;

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

  const count = subPage.images.length;
  const totalGap = (count - 1) * gapX;
  const availableWidth = containerWidth - totalGap;

  let widths: number[] = [];
  if (availableWidth > 0 && dims.length >= count && dims.every((d) => d && d.w > 0)) {
    const ratios = dims.map((d) => d.w / d.h);
    const totalRatio = ratios.reduce((a, b) => a + b, 0);
    widths = ratios.map((r) => (r / totalRatio) * availableWidth);
  }

  return (
    <div className="mt-16" style={{ height: IMAGE_HEIGHT }}>
      <div
        ref={containerRef}
        className="flex w-full items-center justify-center"
        style={{ height: "100%", gap: `${gapX}px` }}
      >
        {subPage.images.map((img, i) => (
          <img
            key={i}
            ref={(el) => { imgRefs.current[i] = el; }}
            src={img.src}
            alt={img.alt || `Image ${i + 1}`}
            onLoad={() => handleImgLoad(i)}
            className="object-contain shrink-0"
            style={{
              height: "100%",
              width: widths[i] ? `${widths[i]}px` : "auto",
              display: "block",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SubPageLayout({ subPage }: { subPage: SubPage }) {
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
  const isRight = work.layout === "right";
  const isBottom = work.layout === "bottom";
  const isGrid = work.layout === "grid";

  const outerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [panelWidth, setPanelWidth] = useState<number>(FALLBACK_WIDTH);

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
    if (!isCenter) return;
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    if (imgRef.current) ro.observe(imgRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, isCenter]);

  const subPages = renderSubPages(work.subPages);

  if (isGrid) {
    return (
      <>
        <GridLayout work={work} displayTitle={displayTitle} numStr={numStr} />
        {subPages}
      </>
    );
  }

  if (isWideBottom) {
    return (
      <>
        <WideBottomLayout work={work} displayTitle={displayTitle} numStr={numStr} />
        {subPages}
      </>
    );
  }

  if (isWide) {
    return (
      <>
        <WideLayout work={work} displayTitle={displayTitle} numStr={numStr} />
        {subPages}
      </>
    );
  }

  if (isPartial) {
    return (
      <>
        <PartialLayout work={work} displayTitle={displayTitle} numStr={numStr} imgWidthRatio={work.imgWidthRatio} />
        {subPages}
      </>
    );
  }

  if (isCenter) {
    const image = (
      <ImageWithLink
        src={work.thumbnail}
        alt={displayTitle}
        link={work.link}
        imgRef={imgRef}
        onLoad={measure}
        className="object-contain shrink-0"
        style={{ height: IMAGE_HEIGHT, width: "auto", display: "block" }}
      />
    );

    const textPanel = (
      <CenterTextPanel
        work={work}
        displayTitle={displayTitle}
        numStr={numStr}
        panelWidth={panelWidth}
        gap={gap}
      />
    );

    return (
      <>
        <div ref={outerRef} style={{ textAlign: "left" }}>
          <div style={{ display: "inline-block", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "flex-start", height: "80vh" }}>
              {textPanel}
              {image}
            </div>
          </div>
        </div>
        {subPages}
      </>
    );
  }

  if (isRight) {
    const image = (
      <ImageWithLink
        src={work.thumbnail}
        alt={displayTitle}
        link={work.link}
        className="object-contain shrink-0"
        style={{ height: IMAGE_HEIGHT, width: "auto", display: "block" }}
      />
    );

    const textPanel = (
      <RightTextPanel
        work={work}
        displayTitle={displayTitle}
        numStr={numStr}
        gap={gap}
      />
    );

    return (
      <>
        <div style={{ display: "flex", alignItems: "flex-start", height: "80vh" }}>
          {textPanel}
          {image}
        </div>
        {subPages}
      </>
    );
  }

  if (isBottom) {
    return (
      <>
        <BottomLayout work={work} displayTitle={displayTitle} numStr={numStr} imgWidthRatio={work.imgWidthRatio} />
        {subPages}
      </>
    );
  }

  const image = (
    <ImageWithLink
      src={work.thumbnail}
      alt={displayTitle}
      link={work.link}
      className="object-contain shrink-0"
      style={{ height: IMAGE_HEIGHT, width: "auto", display: "block" }}
    />
  );

  const textPanel = (
    <LeftTextPanel
      work={work}
      displayTitle={displayTitle}
      numStr={numStr}
      gap={gap}
    />
  );

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", height: "80vh" }}>
        {image}
        {textPanel}
      </div>
      {subPages}
    </>
  );
}

function WideLayout({
  work,
  displayTitle,
  numStr,
}: {
  work: Work;
  displayTitle: string;
  numStr: string;
}) {
  return (
    <div className="flex flex-col items-center" style={{ minHeight: "80vh" }}>
      <div className="w-full">
        <div className="flex justify-between items-start mb-2">
          <h1
            className="italic text-gray-900"
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
              className="text-gray-500 text-right"
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

        <ImageWithLink
          src={work.thumbnail}
          alt={displayTitle}
          link={work.link}
          className="object-contain block w-full"
          style={{ maxHeight: "80vh" }}
        />

        {work.description && (
          <div className="flex justify-center mt-4">
            <p
              className="text-gray-700 text-center"
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

function WideBottomLayout({
  work,
  displayTitle,
  numStr,
}: {
  work: Work;
  displayTitle: string;
  numStr: string;
}) {
  return (
    <div className="flex flex-col items-center" style={{ minHeight: "80vh" }}>
      <div className="w-full">
        <div className="flex justify-between items-start mb-2">
          <h1
            className="italic text-gray-900"
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
              className="text-gray-500 text-right"
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

        <div className="flex justify-center items-start" style={{ minHeight: "80vh" }}>
          <ImageWithLink
            src={work.thumbnail}
            alt={displayTitle}
            link={work.link}
            className="object-contain block w-full"
            style={{ maxHeight: "80vh" }}
          />
        </div>

        {work.description && (
          <div className="flex justify-center mt-4">
            <p
              className="text-gray-700 text-center"
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
  const cols = 3;
  const gapX = 24;
  const gapY = 12;

  return (
    <div className="flex flex-col items-center" style={{ minHeight: "80vh" }}>
      <div className="w-full">
        <div className="flex justify-between items-start mb-2">
          <h1
            className="italic text-gray-900"
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
              className="text-gray-500 text-right"
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
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: `${gapY}px ${gapX}px`,
          }}
        >
          {images.map((img, i) => (
            <ImageWithLink
              key={i}
              src={img.src}
              alt={img.alt || `${displayTitle} ${i + 1}`}
              link={work.link}
              className="object-contain block w-full"
              style={{ maxHeight: "80vh" }}
            />
          ))}
        </div>

        {work.description && (
          <div className="flex justify-center mt-4">
            <p
              className="text-gray-700 text-center"
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

function PartialLayout({
  work,
  displayTitle,
  numStr,
  imgWidthRatio,
}: {
  work: Work;
  displayTitle: string;
  numStr: string;
  imgWidthRatio?: number;
}) {
  const widthPercent = imgWidthRatio ? `${imgWidthRatio * 100}%` : "75%";

  return (
    <div className="flex flex-col items-center" style={{ minHeight: "80vh" }}>
      <div className="w-full">
        <div className="flex justify-between items-start mb-2">
          <h1
            className="italic text-gray-900"
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
              className="text-gray-500 text-right"
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
            style={{
              width: widthPercent,
              maxHeight: "calc(100vh - 200px)",
            }}
          />
        </div>

        {work.description && (
          <div className="flex justify-center mt-4">
            <div style={{ width: widthPercent }}>
              <p
                className="text-gray-700 text-center"
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

function CenterTextPanel({
  work,
  displayTitle,
  numStr,
  panelWidth,
  gap,
}: {
  work: Work;
  displayTitle: string;
  numStr: string;
  panelWidth: number;
  gap: number;
}) {
  const panelStyle: React.CSSProperties = {
    marginRight: gap,
    width: panelWidth,
    paddingLeft: 0,
    paddingRight: 0,
  };

  return (
    <div
      className="flex flex-col justify-start shrink-0"
      style={panelStyle}
    >
      <h1
        className="text-3xl sm:text-4xl md:text-5xl italic text-gray-900 mb-4"
        style={{ fontSize: "18px", fontFamily: "Comic Sans MS, cursive", height: "48px" }}
      >
        {numStr}
        {displayTitle}
      </h1>

      {work.materials && (
        <p
          className="text-sm sm:text-base text-gray-500 leading-relaxed mb-10"
          style={{ fontFamily: MONO_FONT, fontSize: "12px", lineHeight: "16pt", color: "#464646" }}
        >
          {renderMaterials(work.materials)}
        </p>
      )}

      {work.description && (
        <p
          className="text-base sm:text-lg text-gray-700 leading-relaxed"
          style={{ fontFamily: TITLE_FONT, fontSize: "10px", lineHeight: "16pt", color: "#464646" }}
        >
          {renderDescription(work.description)}
        </p>
      )}
    </div>
  );
}

function LeftTextPanel({
  work,
  displayTitle,
  numStr,
  gap,
}: {
  work: Work;
  displayTitle: string;
  numStr: string;
  gap: number;
}) {
  const panelStyle: React.CSSProperties = {
    marginLeft: gap,
    maxWidth: LEFT_MAX_WIDTH,
  };

  return (
    <div
      className="flex flex-col justify-start shrink-0"
      style={panelStyle}
    >
      <h1
        className="text-3xl sm:text-4xl md:text-5xl italic text-gray-900 mb-4"
        style={{ fontFamily: TITLE_FONT, fontSize: "18px" }}
      >
        {numStr}
        {displayTitle}
      </h1>

      {work.materials && (
        <p
          className="text-sm sm:text-base text-gray-500 leading-relaxed mb-10"
          style={{ fontFamily: MONO_FONT, fontSize: "12px", lineHeight: "16pt", color: "#464646" }}
        >
          {renderMaterials(work.materials)}
        </p>
      )}

      {work.description && (
        <p
          className="text-base sm:text-lg text-gray-700 leading-relaxed"
          style={{ fontFamily: TITLE_FONT, fontSize: "10px", lineHeight: "16pt", color: "#464646" }}
        >
          {renderDescription(work.description)}
        </p>
      )}
    </div>
  );
}

function RightTextPanel({
  work,
  displayTitle,
  numStr,
  gap,
}: {
  work: Work;
  displayTitle: string;
  numStr: string;
  gap: number;
}) {
  const panelStyle: React.CSSProperties = {
    marginRight: gap,
    maxWidth: LEFT_MAX_WIDTH,
  };

  return (
    <div
      className="flex flex-col justify-start shrink-0"
      style={panelStyle}
    >
      <h1
        className="text-3xl sm:text-4xl md:text-5xl italic text-gray-900 mb-4"
        style={{ fontFamily: TITLE_FONT, fontSize: "18px" }}
      >
        {numStr}
        {displayTitle}
      </h1>

      {work.materials && (
        <p
          className="text-sm sm:text-base text-gray-500 leading-relaxed mb-10"
          style={{ fontFamily: MONO_FONT, fontSize: "12px", lineHeight: "16pt", color: "#464646" }}
        >
          {renderMaterials(work.materials)}
        </p>
      )}

      {work.description && (
        <p
          className="text-base sm:text-lg text-gray-700 leading-relaxed"
          style={{ fontFamily: TITLE_FONT, fontSize: "10px", lineHeight: "16pt", color: "#464646" }}
        >
          {renderDescription(work.description)}
        </p>
      )}
    </div>
  );
}

function BottomLayout({
  work,
  displayTitle,
  numStr,
  imgWidthRatio,
}: {
  work: Work;
  displayTitle: string;
  numStr: string;
  imgWidthRatio?: number;
}) {
  const widthPercent = imgWidthRatio ? `${imgWidthRatio * 100}%` : "75%";

  return (
    <div className="flex flex-col items-center" style={{ minHeight: "80vh" }}>
      <div className="w-full">
        <div className="flex justify-between items-start mb-2">
          <h1
            className="italic text-gray-900"
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
              className="text-gray-500 text-right"
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

        <div className="flex justify-center items-start" style={{ minHeight: "80vh" }}>
          <ImageWithLink
            src={work.thumbnail}
            alt={displayTitle}
            link={work.link}
            className="object-contain block"
            style={{
              width: widthPercent,
              maxHeight: "calc(100vh - 300px)",
            }}
          />
        </div>

        {work.description && (
          <div className="flex justify-center mt-4">
            <div style={{ width: widthPercent }}>
              <p
                className="text-gray-700 text-center"
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