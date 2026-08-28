"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { GAP } from "@/lib/gallery-config";

export type GalleryItem = {
  src: string;
  /**
   * 可选：当主 src 加载失败（如 R2 Content-Type 异常、ORB 拦截、404 等）时，
   * 浏览器自动回退到此 URL。典型用法：分类画廊的 cover 加载失败时回退到作品 thumbnail。
   */
  fallbackSrc?: string;
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
  // 记录加载失败的图片 index，自动回退到 fallbackSrc
  const [erroredIndices, setErroredIndices] = useState<Set<number>>(new Set());

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

      // 归一化：保证 widths 总和严格等于 availableWidth，防止 clamp 或浮点误差导致总宽度溢出容器
      let widths = ratios.map((r) => r * height);
      const sumW = widths.reduce((a, b) => a + b, 0);
      if (sumW > 0 && Math.abs(sumW - availableWidth) > 0.01) {
        const scale = availableWidth / sumW;
        widths = widths.map((w) => w * scale);
        height = height * scale; // 同步调整行高以保持宽高比严格匹配图片真实比例（object-contain 不会留白）
      }
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
      style={{ rowGap: gap, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
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
            className="flex items-start shrink-0 overflow-hidden"
            style={{
              gap: `${gap}px`,
              height: row.height + titleGap + (showTitle ? 20 : 0),
              width: "100%",
              maxWidth: "100%",
            }}
          >
            {row.items.map((item, k) => {
              const gIdx = rowStartIdx + k;
              const width = row.widths[k];
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
                      // 与真实比例严格一致，object-contain 保证完整显示不裁剪不超出
                    }}
                  >
                    <img
                      ref={(el) => { imgRefs.current[gIdx] = el; }}
                      src={erroredIndices.has(gIdx) && item.fallbackSrc ? item.fallbackSrc : item.src}
                      alt={item.displayTitle || item.title}
                      loading="lazy"
                      onLoad={(e) => handleImgLoad(gIdx, e)}
                      onError={() => {
                        if (item.fallbackSrc && !erroredIndices.has(gIdx)) {
                          setErroredIndices((prev) => {
                            const next = new Set(prev);
                            next.add(gIdx);
                            return next;
                          });
                        }
                      }}
                      className="object-contain block"
                      style={{
                        // 使用显式像素尺寸（而非 % 填充父容器）：
                        // 保证 img 元素内容盒子与 rows 算法算出的目标完全一致，
                        // 彻底避免 h-full w-full + object-contain 在 浮点精度/比率不匹配
                        // 时出现的上下留白，从而实现"同行图片实际渲染内容等高"。
                        width: `${width}px`,
                        height: `${row.height}px`,
                        maxWidth: "none",
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
