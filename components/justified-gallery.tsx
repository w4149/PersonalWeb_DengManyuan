"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { GAP } from "@/lib/gallery-config";

export type GalleryItem = {
  src: string;
  aspectRatio: number;
  title: string;
  displayTitle?: string;
  href: string;
};

type Props = {
  items: GalleryItem[];
  columns?: { base?: number; sm?: number; md?: number; lg?: number };
  layout?: number[];
  minHeight?: number;
  maxHeight?: number;
  gap?: number;
  showTitle?: boolean;
  className?: string;
};

export function JustifiedGallery({
  items,
  columns = { base: 1, sm: 2, lg: 3 },
  layout,
  minHeight = 100,
  maxHeight = 380,
  gap = GAP,
  showTitle = false,
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

  const rowGroups = useMemo(() => {
    if (layout && layout.length > 0) {
      const groups: GalleryItem[][] = [];
      let idx = 0;
      for (const count of layout) {
        groups.push(items.slice(idx, idx + count));
        idx += count;
      }
      if (idx < items.length) {
        const remaining = items.slice(idx);
        const lastGroup = groups[groups.length - 1] || [];
        groups[groups.length - 1] = [...lastGroup, ...remaining];
      }
      return groups;
    }
    const perRow = currentCols;
    const groups: GalleryItem[][] = [];
    for (let i = 0; i < items.length; i += perRow) {
      groups.push(items.slice(i, i + perRow));
    }
    return groups;
  }, [items, layout, currentCols]);

  const rows = useMemo(() => {
    const result: { items: GalleryItem[]; height: number }[] = [];
    if (!containerWidth || items.length === 0) return result;

    for (const group of rowGroups) {
      const n = group.length;
      const totalGap = (n - 1) * gap;
      const availableWidth = containerWidth - totalGap;
      const sumAR = group.reduce((s, item) => s + item.aspectRatio, 0);
      let height = availableWidth / sumAR;
      height = Math.max(minHeight, Math.min(maxHeight, height));
      result.push({ items: group, height });
    }
    return result;
  }, [rowGroups, containerWidth, minHeight, maxHeight, gap, items.length]);

  if (items.length === 0) return null;

  const titleGap = showTitle ? 6 : 0;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col ${className}`}
      style={{ rowGap: gap }}
    >
      {rows.map((row, rowIdx) => (
        <div
          key={rowIdx}
          className="flex justify-between"
          style={{ height: row.height + titleGap + (showTitle ? 20 : 0) }}
        >
          {row.items.map((item) => {
            const width = item.aspectRatio * row.height;
            return (
              <div
                key={item.href}
                className="flex flex-col items-center shrink-0"
                style={{ width }}
              >
                <Link
                  href={item.href}
                  className="group relative block"
                  style={{ height: row.height, width }}
                >
                  <img
                    src={item.src}
                    alt={item.displayTitle || item.title}
                    className="w-full h-full object-contain bg-gray-50"
                  />
                </Link>
                {showTitle && (
                  <span
                    className="text-sm text-gray-700 text-center mt-2 leading-tight"
                    style={{ maxWidth: width }}
                  >
                    {item.displayTitle || item.title}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
