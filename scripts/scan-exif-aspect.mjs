/* =========================================================================
 * scan-exif-aspect.mjs
 *
 * 批量检测两类问题：
 *  1) works-data.ts 中每个作品的 aspectRatio 是否与它 thumbnail 原图的
 *     「视觉尺寸比例」一致（EXIF orientation 修正后）
 *  2) 所有预览图（public/images/**\/preview/*.webp）的宽高比是否与原图
 *     视觉尺寸比例一致 —— 不一致意味着 EXIF 方向 bug 导致预览被生成成
 *     错误比例（如 Non-Dualism 预览横/竖翻转），需要删除并重新生成
 *
 * 用法：
 *   node scripts/scan-exif-aspect.mjs
 *
 * 输出：问题清单 + 建议操作（修正 aspectRatio / 删除需重生成的预览图）
 * ========================================================================= */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_IMG = path.join(ROOT, "public", "images");
const WORKS_DATA = path.join(ROOT, "lib", "works-data.ts");

const VALID_EXT = new Set([".jpg", ".jpeg", ".png"]);
const PREVIEW_DIR = "preview";
const SWAP_ORIENTS = new Set([5, 6, 7, 8]);
const RATIO_REL_TOL = 0.02; // aspectRatio 相对误差超过 2% 即告警

let sharp;
try {
  const mod = await import("sharp");
  sharp = mod.default || mod;
} catch (e) {
  console.error("[错误] 请先安装 sharp: npm i -D sharp");
  process.exit(1);
}

const R2_PREFIX = "https://pub-0152450371c44ecb87bb433ea94e2039.r2.dev";

/* ---------- 工具函数 ---------- */
function relPub(p) {
  return path.relative(PUBLIC_IMG, p).replace(/\\/g, "/");
}

function relRoot(p) {
  return path.relative(ROOT, p).replace(/\\/g, "/");
}

function isInsidePreviewDir(absPath) {
  return absPath.split(path.sep).includes(PREVIEW_DIR);
}

function orientedDims(meta) {
  let w = meta.width | 0;
  let h = meta.height | 0;
  const o = typeof meta.orientation === "number" ? meta.orientation : 1;
  if (SWAP_ORIENTS.has(o)) {
    const t = w; w = h; h = t;
  }
  return { w, h, orient: o, storedW: meta.width | 0, storedH: meta.height | 0 };
}

function ratioDiff(a, b) {
  if (a <= 0 || b <= 0) return Infinity;
  return Math.abs(a - b) / Math.min(a, b);
}

/* ---------- 1. 扫描 works-data.ts 提取作品 (slug / aspectRatio / thumbnail) ---------- */
function parseWorksData() {
  const src = fs.readFileSync(WORKS_DATA, "utf-8");
  // 用简单状态机按层级解析 works 数组项
  const works = [];
  // 匹配每个 { slug, aspectRatio, thumbnail, title } 块
  // 做法：按 "slug:" 切片，对每个片段分别抓字段
  const slugRe = /slug:\s*"([^"]+)"/g;
  let m;
  const matches = [];
  while ((m = slugRe.exec(src)) !== null) matches.push({ idx: m.index, slug: m[1] });
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].idx;
    const end = i + 1 < matches.length ? matches[i + 1].idx : src.length;
    const slice = src.slice(start, end);
    const title = (slice.match(/title:\s*"([^"]+)"/) || [])[1] || "";
    const arMatch = slice.match(/aspectRatio:\s*([0-9.]+)/);
    const thumb = (slice.match(/thumbnail:\s*`([^`]+)`/) || [])[1] || "";
    const cover = (slice.match(/\bcover:\s*`([^`]+)`/) || [])[1] || "";
    works.push({
      slug: matches[i].slug,
      title,
      aspectRatioRaw: arMatch ? arMatch[1] : null,
      aspectRatio: arMatch ? parseFloat(arMatch[1]) : null,
      thumbnailR2: thumb,
      coverR2: cover,
    });
  }
  return works;
}

function r2ToLocal(r2url) {
  if (!r2url) return null;
  let rel = r2url;
  // works-data.ts 模板字面量中使用 ${R2} 前缀，先展开成实际前缀
  // （此时从源码按字符串读到的 $ 是字面字符）
  rel = rel.replace(/^\$\{R2\}/, R2_PREFIX);
  if (rel.startsWith(R2_PREFIX)) rel = rel.slice(R2_PREFIX.length);
  if (rel.startsWith("/")) rel = rel.slice(1);
  // R2 中的 /images/... 映射到 public/images/...
  if (rel.startsWith("images/")) rel = rel.slice("images/".length);
  return path.join(PUBLIC_IMG, rel);
}

/* ---------- 2. 扫描 public/images 下所有原图（跳过 preview/）---------- */
async function scanAllOriginals() {
  const list = [];
  async function walk(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    const tasks = [];
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === PREVIEW_DIR) continue;
        tasks.push(walk(full));
      } else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        if (!VALID_EXT.has(ext)) continue;
        if (isInsidePreviewDir(full)) continue;
        list.push(full);
      }
    }
    await Promise.all(tasks);
  }
  await walk(PUBLIC_IMG);
  return list;
}

/* ---------- 3. 主流程 ---------- */
async function main() {
  console.log("=".repeat(72));
  console.log("  EXIF 方向 / aspectRatio / 预览比例一致性扫描");
  console.log("=".repeat(72));

  const works = parseWorksData();
  console.log(`\n📚 从 works-data.ts 解析到 ${works.length} 个作品条目`);

  const originals = await scanAllOriginals();
  console.log(`🖼️  public/images 下原图（跳过 preview/）共 ${originals.length} 张`);

  /* ===== A. works-data aspectRatio vs thumbnail 视觉比例 ===== */
  console.log("\n" + "-".repeat(72));
  console.log("【A】检查 works-data.ts aspectRatio 与 thumbnail 原图视觉比例");
  console.log("-".repeat(72));

  const aspectIssues = [];
  for (const w of works) {
    if (w.aspectRatio == null) {
      console.log(`  ⚠️  ${w.slug} (${w.title}) — aspectRatio 未设置`);
      aspectIssues.push({ slug: w.slug, kind: "MISSING_AR" });
      continue;
    }
    const local = r2ToLocal(w.thumbnailR2);
    if (!local || !fs.existsSync(local)) {
      console.log(`  ⚠️  ${w.slug} — thumbnail 文件不存在: ${w.thumbnailR2}`);
      aspectIssues.push({ slug: w.slug, kind: "MISSING_THUMB" });
      continue;
    }
    let meta;
    try { meta = await sharp(local).metadata(); }
    catch (e) {
      console.log(`  ❌ ${w.slug} — 读取失败: ${e.message}`);
      aspectIssues.push({ slug: w.slug, kind: "READ_ERR" });
      continue;
    }
    const { w: vw, h: vh, orient, storedW, storedH } = orientedDims(meta);
    const visualRatio = vw / vh;
    const diff = ratioDiff(visualRatio, w.aspectRatio);
    const swappedIndicator = orient !== 1 ? `  [EXIF orient=${orient} 存储=${storedW}×${storedH} 视觉=${vw}×${vh}]` : `  [${vw}×${vh}]`;
    if (diff > RATIO_REL_TOL) {
      console.log(
        `  ❗ ${w.slug} (${w.title}) — aspectRatio=${w.aspectRatio} vs 视觉=${visualRatio.toFixed(4)}`
        + `  差异=${(diff * 100).toFixed(1)}%${swappedIndicator}`
      );
      aspectIssues.push({
        slug: w.slug,
        kind: "AR_MISMATCH",
        fieldAR: w.aspectRatio,
        actualAR: +visualRatio.toFixed(4),
        local: relRoot(local),
      });
    } else {
      console.log(
        `  ✅ ${w.slug} (${w.title}) — aspectRatio=${w.aspectRatio} 视觉=${visualRatio.toFixed(4)}  差异=${(diff * 100).toFixed(2)}%${swappedIndicator}`
      );
    }
  }

  /* ===== B. 预览图比例 vs 原图视觉比例 ===== */
  console.log("\n" + "-".repeat(72));
  console.log("【B】检查所有预览图 .webp 宽高比与原图视觉比例是否一致");
  console.log("-".repeat(72));

  const previewRegen = []; // 需要删除并重生成的原图
  const skipped = { noPreview: 0, ok: 0, err: 0, exifFlags: 0 };

  for (const abs of originals) {
    const dir = path.dirname(abs);
    const base = path.basename(abs, path.extname(abs));
    const prevAbs = path.join(dir, PREVIEW_DIR, `${base}.webp`);
    if (!fs.existsSync(prevAbs)) { skipped.noPreview++; continue; }

    let origMeta, prevMeta;
    try {
      origMeta = await sharp(abs).metadata();
      prevMeta = await sharp(prevAbs).metadata();
    } catch (e) {
      skipped.err++;
      console.log(`  ❌ read fail ${relPub(abs)}: ${e.message}`);
      continue;
    }

    const { w: vw, h: vh, orient, storedW, storedH } = orientedDims(origMeta);
    const visualRatio = vw / vh;
    const prevW = prevMeta.width | 0;
    const prevH = prevMeta.height | 0;
    const prevRatio = prevW / prevH;
    const diff = ratioDiff(prevRatio, visualRatio);
    const exifSwap = SWAP_ORIENTS.has(orient);
    if (exifSwap) skipped.exifFlags++;

    if (diff > RATIO_REL_TOL) {
      const flip = Math.sign(visualRatio - 1) !== Math.sign(prevRatio - 1) ? "  【方向完全翻转!】" : "";
      console.log(
        `  ❗ ${relPub(abs)}${exifSwap ? ` [EXIF orient=${orient} 存储${storedW}×${storedH}→视觉${vw}×${vh}]` : ""}`
      );
      console.log(
        `      视觉比例=${visualRatio.toFixed(4)}(${vw}×${vh})  预览比例=${prevRatio.toFixed(4)}(${prevW}×${prevH})`
        + `  差异=${(diff * 100).toFixed(1)}%${flip}`
      );
      previewRegen.push({ orig: abs, prev: prevAbs, diff, visualRatio, prevRatio });
    } else {
      skipped.ok++;
    }
  }

  /* ===== C. 汇总 ===== */
  console.log("\n" + "=".repeat(72));
  console.log("  扫 描 汇 总");
  console.log("=".repeat(72));
  console.log(`  作品数                    : ${works.length}`);
  console.log(`  原图数（跳过 preview/）   : ${originals.length}`);
  console.log(`  B 有预览图数              : ${originals.length - skipped.noPreview}`);
  console.log(`    比例一致 OK             : ${skipped.ok}`);
  console.log(`    含 EXIF 旋转标记原图     : ${skipped.exifFlags}（需注意）`);
  console.log(`    比例 ❌ 异常需重生成     : ${previewRegen.length}`);
  console.log(`    无预览图                : ${skipped.noPreview}`);
  console.log(`    读取错误                : ${skipped.err}`);
  console.log(``);
  console.log(`  A aspectRatio 异常总数    : ${aspectIssues.length}`);

  if (aspectIssues.length) {
    console.log(`\n--- 需要修正的 aspectRatio 清单 ---`);
    for (const it of aspectIssues) {
      if (it.kind === "AR_MISMATCH") {
        console.log(
          `  - works-data.ts [${it.slug}]  aspectRatio: ${it.fieldAR} -> ${it.actualAR}`
        );
      } else {
        console.log(`  - works-data.ts [${it.slug}]  原因: ${it.kind}`);
      }
    }
  }

  if (previewRegen.length) {
    console.log(`\n--- 需要重生成预览图的原图（建议删除 .webp 后跑 generate-previews）---`);
    for (const it of previewRegen) {
      console.log(`  del:  ${relRoot(it.prev)}`);
    }
  }

  // 把建议删除的预览列表写成一个 PowerShell 命令，便于一键执行
  if (previewRegen.length) {
    const delLines = previewRegen.map(p => `Remove-Item "${p.prev}"`).join("\n");
    const outBat = path.join(__dirname, "logs", `_regen-delete-list-${Date.now()}.ps1`);
    fs.mkdirSync(path.dirname(outBat), { recursive: true });
    fs.writeFileSync(outBat, delLines + "\n\n# 之后执行: node scripts/generate-previews.mjs\n", "utf-8");
    console.log(`\n💾 删除清单已写入: ${relRoot(outBat)}`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
