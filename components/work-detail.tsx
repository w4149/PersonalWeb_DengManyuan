"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Work } from "@/lib/works-data";
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

  if (isGrid) {
    return <GridLayout work={work} displayTitle={displayTitle} numStr={numStr} />;
  }

  if (isWideBottom) {
    return <WideBottomLayout work={work} displayTitle={displayTitle} numStr={numStr} />;
  }

  if (isWide) {
    return <WideLayout work={work} displayTitle={displayTitle} numStr={numStr} />;
  }

  if (isPartial) {
    return <PartialLayout work={work} displayTitle={displayTitle} numStr={numStr} imgWidthRatio={work.imgWidthRatio} />;
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
      <div ref={outerRef} style={{ textAlign: "left" }}>
        <div style={{ display: "inline-block", textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "flex-start", height: "80vh" }}>
            {textPanel}
            {image}
          </div>
        </div>
      </div>
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
      <div style={{ display: "flex", alignItems: "flex-start", height: "80vh" }}>
        {textPanel}
        {image}
      </div>
    );
  }

  if (isBottom) {
    return <BottomLayout work={work} displayTitle={displayTitle} numStr={numStr} imgWidthRatio={work.imgWidthRatio} />;
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
    <div style={{ display: "flex", alignItems: "flex-start", height: "80vh" }}>
      {image}
      {textPanel}
    </div>
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
              className="text-gray-500"
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
              className="text-gray-500"
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
              className="text-gray-500"
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
              className="text-gray-500"
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
              className="text-gray-500"
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