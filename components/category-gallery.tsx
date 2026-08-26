"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import type { WorkCategory } from "@/lib/works-data";

type Props = {
  categories: WorkCategory[];
};

export function CategoryGallery({ categories }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 768);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const perRow = isMobile ? 1 : 2;

  const rows = useMemo(() => {
    const result: { cats: WorkCategory[]; height: number }[] = [];
    if (!containerWidth) return result;

    for (let i = 0; i < categories.length; i += perRow) {
      const rowCats = categories.slice(i, i + perRow);
      const sumAR = rowCats.reduce((s, c) => s + c.coverAspectRatio, 0);
      let height = containerWidth / sumAR;
      height = Math.max(180, Math.min(420, height));
      result.push({ cats: rowCats, height });
    }
    return result;
  }, [categories, perRow, containerWidth]);

  if (categories.length === 0) return null;

  return (
    <div ref={containerRef} className="flex flex-col" style={{ rowGap: "3rem" }}>
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="flex justify-between"
          style={{ height: row.height }}
        >
          {row.cats.map((category) => {
            const imgWidth = category.coverAspectRatio * row.height;
            const minBlockWidth = isMobile ? "100%" : `${imgWidth + 120}px`;
            return (
              <div
                key={category.slug}
                className="flex"
                style={{
                  height: row.height,
                  width: isMobile ? "100%" : undefined,
                  minWidth: isMobile ? undefined : minBlockWidth,
                }}
              >
                <Link
                  href={`/works/${category.slug}/${category.years[0]}`}
                  className="relative group/item shrink-0"
                  style={{ height: row.height, width: imgWidth }}
                >
                  <img
                    src={category.coverImage}
                    alt={category.title}
                    className="w-full h-full object-contain bg-gray-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <h2 className="absolute bottom-4 left-4 right-4 text-xl sm:text-2xl md:text-3xl font-medium text-white tracking-wide">
                    {category.title}
                  </h2>
                </Link>

                <div
                  className={`flex flex-col justify-center gap-2 sm:gap-3 ${
                    isMobile ? "flex-row justify-start mt-3" : "ml-6 shrink-0"
                  }`}
                  style={isMobile ? {} : { minWidth: "100px" }}
                >
                  {category.years.map((year) => (
                    <Link
                      key={year}
                      href={`/works/${category.slug}/${year}`}
                      className="flex items-center gap-2 py-1.5 px-2 rounded text-sm sm:text-base text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition-colors text-right sm:text-left"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-amber-500 transition-colors shrink-0" />
                      <span className="tabular-nums">{year}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
