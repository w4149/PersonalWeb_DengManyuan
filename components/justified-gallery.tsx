"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";

export type GalleryItem = {
  src: string;
  aspectRatio: number;
  title: string;
  href: string;
};

type Props = {
  items: GalleryItem[];
  columns?: { base?: number; sm?: number; md?: number; lg?: number };
  minHeight?: number;
  maxHeight?: number;
  className?: string;
};

export function JustifiedGallery({
  items,
  columns = { base: 1, sm: 2, lg: 3 },
  minHeight = 100,
  maxHeight = 380,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentCols, setCurrentCols] = useState(columns.lg || 3);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) setCurrentCols(columns.lg || 3);
      else if (w >= 768) setCurrentCols(columns.md || columns.sm || 2);
      else if (w >= 640) setCurrentCols(columns.sm || 2);
      else setCurrentCols(columns.base || 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [columns]);

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

  const rows = useMemo(() => {
    const result: { items: GalleryItem[]; height: number }[] = [];
    if (!containerWidth || items.length === 0) return result;

    const perRow = currentCols;

    for (let i = 0; i < items.length; i += perRow) {
      const rowItems = items.slice(i, i + perRow);
      const sumAR = rowItems.reduce((s, item) => s + item.aspectRatio, 0);
      let height = containerWidth / sumAR;
      height = Math.max(minHeight, Math.min(maxHeight, height));
      result.push({ items: rowItems, height });
    }
    return result;
  }, [items, currentCols, containerWidth, minHeight, maxHeight]);

  if (items.length === 0) return null;

  return (
    <div ref={containerRef} className={`flex flex-col ${className}`} style={{ rowGap: "2.5rem" }}>
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-between" style={{ height: row.height }}>
          {row.items.map((item) => {
            const width = item.aspectRatio * row.height;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative block"
                style={{ height: row.height, width }}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-contain bg-gray-50"
                />
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
