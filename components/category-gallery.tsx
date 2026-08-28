"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { WorkCategory } from "@/lib/works-data";
import { GAP } from "@/lib/gallery-config";

type Props = {
  categories: WorkCategory[];
  gap?: number;
};

const SIDEBAR_WIDTH = 120;
type ImgDims = { w: number; h: number };

export function CategoryGallery({ categories, gap = GAP }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  // 每张分类封面图的真实尺寸，onLoad 后填充；用于校正 coverAspectRatio 与实际图片比例不一致的问题
  const [dims, setDims] = useState<ImgDims[]>([]);
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

  // 与 JustifiedGallery 同款：图片 onLoad → 写入 native 宽高 → rows 重新按真实比例布局
  const handleImgLoad = useCallback(
    (catIdx: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (!img || !img.naturalWidth || !img.naturalHeight) return;
      setDims((prev) => {
        const next = [...prev];
        if (
          next[catIdx] &&
          next[catIdx].w === img.naturalWidth &&
          next[catIdx].h === img.naturalHeight
        )
          return prev;
        next[catIdx] = { w: img.naturalWidth, h: img.naturalHeight };
        return next;
      });
    },
    []
  );

  const perRow = isMobile ? 1 : 2;

  const rows = useMemo(() => {
    type RowResult = {
      cats: WorkCategory[];
      height: number;
      /** 每只封面图的渲染宽度（像素） */
      imgWidths: number[];
      /** 每个分类卡片（封面图 + 年份列）的总宽度（像素） */
      blockWidths: number[];
    };
    const result: RowResult[] = [];
    if (!containerWidth) return result;

    let globalCatIdx = 0;
    for (let i = 0; i < categories.length; i += perRow) {
      const rowCats = categories.slice(i, i + perRow);

      if (isMobile) {
        result.push({
          cats: rowCats,
          height: 0,
          imgWidths: rowCats.map(() => 0),
          blockWidths: rowCats.map(() => 0),
        });
        globalCatIdx += rowCats.length;
        continue;
      }

      const n = rowCats.length;
      const totalGap = (n - 1) * gap;
      const reserved = totalGap + n * SIDEBAR_WIDTH;
      const availableForImgs = Math.max(0, containerWidth - reserved);

      // 每张封面图用真实 dims 比例，缺失则回退 coverAspectRatio
      const ratios: number[] = [];
      let sumR = 0;
      for (let k = 0; k < n; k++) {
        const catIdx = globalCatIdx + k;
        const d = dims[catIdx];
        const r =
          d && d.w > 0 && d.h > 0 ? d.w / d.h : rowCats[k].coverAspectRatio;
        ratios.push(r);
        sumR += r;
      }

      let height = sumR > 0 ? availableForImgs / sumR : 180;
      height = Math.max(180, Math.min(420, height));

      // 归一化宽度（与 JustifiedGallery 一致）：
      // 避免 clamp 或浮点误差导致 widths 总和与 availableForImgs 不一致，
      // 从而 justify-between 两分类之间的间距不等于 gap。
      let imgWidths = ratios.map((r) => r * height);
      const sumW = imgWidths.reduce((a, b) => a + b, 0);
      if (sumW > 0 && Math.abs(sumW - availableForImgs) > 0.01) {
        const scale = availableForImgs / sumW;
        imgWidths = imgWidths.map((w) => w * scale);
        height = height * scale; // 同步缩放高度 → 比例与图片真实宽高严格匹配
      }

      const blockWidths = imgWidths.map((w) => w + SIDEBAR_WIDTH);
      result.push({ cats: rowCats, height, imgWidths, blockWidths });
      globalCatIdx += n;
    }
    return result;
  }, [categories, perRow, containerWidth, gap, isMobile, dims]);

  if (categories.length === 0) return null;

  // 构建整张容器的扁平索引（rows 展开后）→ 方便 img onLoad / ref 对应到 dims 数组位置
  let flatCatIdx = 0;

  return (
    <div
      ref={containerRef}
      className="flex flex-col"
      style={{ rowGap: isMobile ? gap * 2 : gap }}
    >
      {rows.map((row, rowIdx) => {
        const rowStartFlatIdx = flatCatIdx;
        return (
          <div
            key={rowIdx}
            className={`flex justify-between ${isMobile ? "flex-col" : ""}`}
            style={isMobile ? {} : { height: row.height }}
          >
            {row.cats.map((category, k) => {
              const catIdx = rowStartFlatIdx + k;
              flatCatIdx++;
              const imgWidth = isMobile ? 0 : row.imgWidths[k];
              const blockWidth = isMobile ? 0 : row.blockWidths[k];
              return (
                <div
                  key={category.slug}
                  className={`flex justify-between shrink-0 ${
                    isMobile ? "flex-col w-full" : ""
                  }`}
                  style={
                    isMobile
                      ? {}
                      : {
                          height: row.height,
                          width: blockWidth,
                        }
                  }
                >
                  <Link
                    href={`/works/${category.slug}/${category.years[0]}`}
                    className="relative group/item shrink-0 overflow-hidden"
                    style={
                      isMobile
                        ? { width: "100%" }
                        : { height: row.height, width: imgWidth }
                    }
                  >
                    <img
                      ref={(el) => {
                        imgRefs.current[catIdx] = el;
                      }}
                      src={category.coverImage}
                      alt={category.title}
                      // 显式像素尺寸 + object-contain 兜底：
                      // 与 JustifiedGallery 同款修复，保证同行内容严格等高，不留上下白边
                      className="object-contain block bg-gray-50"
                      style={
                        isMobile
                          ? {
                              display: "block",
                              width: "100%",
                              height: "auto",
                              maxHeight: "60vh",
                            }
                          : {
                              display: "block",
                              width: `${imgWidth}px`,
                              height: `${row.height}px`,
                              maxWidth: "none",
                            }
                      }
                      onLoad={(e) => handleImgLoad(catIdx, e)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <h2
                      className="absolute font-medium text-white tracking-wide"
                      style={
                        isMobile
                          ? {
                              // 移动端：单列大图，用 clamp 随视口平滑缩放
                              fontSize: "clamp(1.1rem, 4.5vw, 2.25rem)",
                              bottom: "clamp(0.6rem, 1.5vw, 1.25rem)",
                              left: "clamp(0.6rem, 1.5vw, 1.25rem)",
                              right: "clamp(0.6rem, 1.5vw, 1.25rem)",
                              lineHeight: 1.2,
                            }
                          : {
                              // 桌面端：字号与内边距随本行封面图高（row.height）等比缩放，
                              // 真正的"自适应"——卡片越高字越大、留白越足；反之则紧凑。
                              // 范围：最小 14px（避免矮卡片文字飞出去），最大 48px（超宽屏上限）。
                              fontSize: `${Math.max(
                                14,
                                Math.min(48, row.height * 0.135)
                              )}px`,
                              bottom: `${Math.max(
                                8,
                                Math.min(24, row.height * 0.07)
                              )}px`,
                              left: `${Math.max(
                                10,
                                Math.min(28, row.height * 0.09)
                              )}px`,
                              right: `${Math.max(
                                10,
                                Math.min(28, row.height * 0.09)
                              )}px`,
                              lineHeight: 1.2,
                            }
                      }
                    >
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
                      const isActive =
                        pathname === yearHref ||
                        pathname.startsWith(yearHref + "/");
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
        );
      })}
    </div>
  );
}
