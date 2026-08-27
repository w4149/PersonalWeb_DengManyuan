"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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

type ImgDims = { w: number; h: number };

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
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentCols, setCurrentCols] = useState(columns.lg || 3);
  const [dims, setDims] = useState<ImgDims[]>([]);

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

  // 图片加载后记录真实尺寸（保证图片显示内容绝对等高，不依赖 data 里预写的 aspectRatio）
  const handleImgLoad = useCallback(
    (i: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setDims((prev) => {
        if (prev[i]?.w === img.naturalWidth && prev[i]?.h === img.naturalHeight) {
          return prev;
        }
        const next = [...prev];
        next[i] = { w: img.naturalWidth, h: img.naturalHeight };
        return next;
      });
    },
    []
  );

  // 首屏补全：已缓存（complete=true）且有自然尺寸的图片直接填充 dims，避免二次重排
  useEffect(() => {
    items.forEach((_, i) => {
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
    // items 变化时重置 dims 的长度（但保留已经有值的，避免闪烁）
    setDims((prev) => {
      if (prev.length === items.length) return prev;
      if (prev.length > items.length) return prev.slice(0, items.length);
      const pad = new Array(items.length - prev.length).fill(null);
      return [...prev, ...pad];
    });
  }, [items]);

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
    type RowResult = { items: GalleryItem[]; height: number; widths: number[] };
    const result: RowResult[] = [];
    if (!containerWidth || items.length === 0) return result;

    let globalIdx = 0;
    for (const group of rowGroups) {
      const n = group.length;
      const totalGap = (n - 1) * gap;
      const availableWidth = containerWidth - totalGap;

      // 每个图用真实 dims，没有则降级到 item.aspectRatio
      const ratios: number[] = [];
      let sumR = 0;
      let allReady = true;
      for (let k = 0; k < n; k++) {
        const gIdx = globalIdx + k;
        const d = dims[gIdx];
        let r: number;
        if (d && d.w > 0 && d.h > 0) {
          r = d.w / d.h;
        } else {
          allReady = false;
          r = group[k].aspectRatio;
        }
        ratios.push(r);
        sumR += r;
      }

      let height = sumR > 0 ? availableWidth / sumR : maxHeight;
      height = Math.max(minHeight, Math.min(maxHeight, height));

      const widths = ratios.map((r) => r * height);
      void allReady; // 暂不区分是否就绪，首屏用降级 aspectRatio，图片加载完 dims 触发 useMemo 重新精确计算一次

      result.push({ items: group, height, widths });
      globalIdx += n;
    }
    return result;
  }, [rowGroups, containerWidth, minHeight, maxHeight, gap, items, dims]);

  if (items.length === 0) return null;

  const titleGap = showTitle ? 6 : 0;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col ${className}`}
      style={{ rowGap: gap }}
    >
      {rows.map((row, rowIdx) => {
        const rowStartIdx =
          rowIdx === 0
            ? 0
            : rows
                .slice(0, rowIdx)
                .reduce((s, r) => s + r.items.length, 0);
        return (
          <div
            key={rowIdx}
            className="flex justify-between"
            style={{
              height: row.height + titleGap + (showTitle ? 20 : 0),
            }}
          >
            {row.items.map((item, k) => {
              const gIdx = rowStartIdx + k;
              const width = row.widths[k];
              const hasTrueDims =
                dims[gIdx] && dims[gIdx].w > 0 && dims[gIdx].h > 0;
              return (
                <div
                  key={item.href}
                  className="flex flex-col items-center shrink-0"
                  style={{ width }}
                >
                  <Link
                    href={item.href}
                    className="group relative block overflow-hidden"
                    style={{
                      height: row.height,
                      width,
                      // 真实尺寸已就绪时：精确按 width/height 显示图片，
                      // 用 object-fit: cover 会裁剪，这里要保证图片不裁剪，
                      // 但容器和图片尺寸比完全一致 → 用 contain 也等价于 fill
                      // 为了防万一留 contain，并把背景设为透明（不要灰色底造成视觉误差）
                    }}
                  >
                    <img
                      ref={(el) => { imgRefs.current[gIdx] = el; }}
                      src={item.src}
                      alt={item.displayTitle || item.title}
                      loading="lazy"
                      onLoad={(e) => handleImgLoad(gIdx, e)}
                      className={
                        hasTrueDims
                          ? "h-full w-full object-cover"
                          : "h-full w-full object-contain"
                      }
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                      }}
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
        );
      })}
    </div>
  );
}
