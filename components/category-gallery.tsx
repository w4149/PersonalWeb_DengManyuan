"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { WorkCategory } from "@/lib/works-data";
import { GAP } from "@/lib/gallery-config";

type Props = {
  categories: WorkCategory[];
  gap?: number;
};

const SIDEBAR_WIDTH = 120;

export function CategoryGallery({ categories, gap = GAP }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname() || "";

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

      if (isMobile) {
        result.push({ cats: rowCats, height: 0 });
      } else {
        const n = rowCats.length;
        const totalGap = (n - 1) * gap;
        const sumAR = rowCats.reduce((s, c) => s + c.coverAspectRatio, 0);
        let height = (containerWidth - totalGap - n * SIDEBAR_WIDTH) / sumAR;
        height = Math.max(180, Math.min(420, height));
        result.push({ cats: rowCats, height });
      }
    }
    return result;
  }, [categories, perRow, containerWidth, gap, isMobile]);

  if (categories.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="flex flex-col"
      style={{ rowGap: isMobile ? gap * 2 : gap }}
    >
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className={`flex justify-between ${isMobile ? "flex-col" : ""}`}
          style={isMobile ? {} : { height: row.height }}
        >
          {row.cats.map((category) => {
            const imgWidth = isMobile ? 0 : category.coverAspectRatio * row.height;
            return (
              <div
                key={category.slug}
                className={`flex justify-between shrink-0 ${isMobile ? "flex-col w-full" : ""}`}
                style={
                  isMobile
                    ? {}
                    : {
                        height: row.height,
                        width: imgWidth + SIDEBAR_WIDTH,
                      }
                }
              >
                <Link
                  href={`/works/${category.slug}/${category.years[0]}`}
                  className="relative group/item shrink-0"
                  style={
                    isMobile
                      ? { width: "100%" }
                      : { height: row.height, width: imgWidth }
                  }
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
                    isMobile
                      ? "flex-row justify-start mt-3"
                      : "ml-6 shrink-0"
                  }`}
                  style={isMobile ? {} : { minWidth: `${SIDEBAR_WIDTH}px` }}
                >
                  {category.years.map((year) => {
                    const yearHref = `/works/${category.slug}/${year}`;
                    const isActive = pathname === yearHref || pathname.startsWith(yearHref + "/");
                    return (
                      <Link
                        key={year}
                        href={yearHref}
                        className={
                          [
                            "block py-1.5 px-2 rounded text-sm sm:text-base transition-colors",
                            "text-right sm:text-left",
                            isActive
                              ? "text-gray-900 bg-gray-200"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                          ].join(" ")
                        }
                      >
                        <span className="tabular-nums">{year}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
