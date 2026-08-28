/* =========================================================================
 * generate-previews.mjs
 * 批量生成艺术作品网站图片的 WebP 低分辨率预览图（等比缩放，不裁剪）
 *
 * 使用说明：
 *   1) 首次使用请先安装 sharp：
 *        npm i -D sharp
 *      （如因原生编译失败，可尝试：npm i -D sharp --platform=win32 --arch=x64）
 *   2) 执行脚本：
 *        node scripts/generate-previews.mjs
 *   3) 脚本会：
 *      - 扫描 public/images 下所有 .jpg/.jpeg/.png（跳过 preview/ 子目录）
 *      - 按长边阈值等比缩放到 target_long_edge，输出 .webp 到同级 preview/
 *      - 增量检测：preview 文件更新时间 ≥ 原图则跳过
 *      - 输出详细日志到 scripts/logs/，CSV 清单方便后续批量填充 previewSrc
 * ========================================================================= */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

// ========== 路径与基础配置 ==========
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKING_DIR = path.resolve(
  String.raw`d:\Trae_Code\Project\DengManyuan_PersonalWeb\public\images`
);
const LOGS_DIR = path.join(__dirname, "logs");
const TIMESTAMP = new Date()
  .toISOString()
  .replace(/[:.]/g, "-")
  .replace("T", "_")
  .slice(0, 19);
const LOG_FILE = path.join(LOGS_DIR, `generate-previews-${TIMESTAMP}.log`);
const CSV_FILE = path.join(LOGS_DIR, `preview-manifest-${TIMESTAMP}.csv`);

const VALID_EXT = new Set([".jpg", ".jpeg", ".png"]);
const PREVIEW_DIR_NAME = "preview";
const QUALITY = 78;
const EFFORT = 6;
const ALPHA_QUALITY = 78;

// 并发数（max(1, CPU 数 - 1)）
const CONCURRENCY = Math.max(1, os.cpus().length - 1);

// ========== 工具函数 ==========
// 按长边像素分类，返回目标长边；返回 null 代表跳过
function classify(longEdge) {
  if (longEdge < 900) return null; // SKIP: 太小
  if (longEdge <= 1600) return 800;
  if (longEdge <= 2400) return 1200;
  if (longEdge <= 3200) return 1600;
  return 2000;
}

// 判断路径段里是否包含 preview 目录
function isInsidePreviewDir(absPath) {
  // 按系统分隔符拆分
  const parts = absPath.split(path.sep);
  return parts.includes(PREVIEW_DIR_NAME);
}

// 字节转 KB（保留两位小数）
function kb(bytes) {
  return Number((bytes / 1024).toFixed(2));
}

// 节省百分比
function savedPct(origSize, newSize) {
  if (origSize <= 0) return 0;
  return Number((((origSize - newSize) / origSize) * 100).toFixed(2));
}

// ms 转 "H 分 M 秒 S 毫秒"
function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const parts = [];
  if (h) parts.push(`${h} 时`);
  if (m) parts.push(`${m} 分`);
  parts.push(`${ss} 秒`);
  return parts.join(" ");
}

// Windows 控制台彩色输出（简单 ANSI）
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

// 递归扫描目录，返回所有符合条件的原图绝对路径数组
async function scanImages(root) {
  const results = [];
  async function walk(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    const tasks = [];
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === PREVIEW_DIR_NAME) continue; // 跳过 preview
        tasks.push(walk(full));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!VALID_EXT.has(ext)) continue;
        if (isInsidePreviewDir(full)) continue; // 兜底
        results.push(full);
      }
    }
    await Promise.all(tasks);
  }
  await walk(root);
  return results;
}

// 简单 Promise 并发池（不引入 p-limit 新依赖）
async function runWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let idx = 0;
  async function runner() {
    while (idx < items.length) {
      const i = idx++;
      // 这里捕获错误，交给 worker 内部处理即可；但为了安全也兜底
      try {
        results[i] = await worker(items[i], i);
      } catch (e) {
        results[i] = { error: e };
      }
    }
  }
  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    runner
  );
  await Promise.all(runners);
  return results;
}

// CSV 安全转义
function csvEscape(v) {
  const s = v == null ? "" : String(v);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// ========== 主流程 ==========
async function main() {
  console.time("TOTAL");

  // 0. 前置：检查 sharp
  let sharp;
  try {
    const mod = await import("sharp");
    sharp = mod.default || mod;
  } catch (_err) {
    console.error(
      RED +
        "[错误] 未找到 sharp 模块，请先安装：\n\n    npm i -D sharp\n" +
        RESET
    );
    process.exit(1);
  }

  // 1. 准备目录
  if (!fs.existsSync(WORKING_DIR)) {
    console.error(RED + `[错误] 图片根目录不存在: ${WORKING_DIR}` + RESET);
    process.exit(1);
  }
  fs.mkdirSync(LOGS_DIR, { recursive: true });
  // 初始化空日志
  fs.writeFileSync(LOG_FILE, `# generate-previews log @ ${TIMESTAMP}\n`, "utf-8");

  // 2. 扫描
  process.stdout.write(CYAN + "[扫描] 正在递归扫描图片..." + RESET + "\r");
  const images = await scanImages(WORKING_DIR);
  console.log(
    `${GREEN}[就绪]${RESET} WORKING_DIR = ${WORKING_DIR}`
  );
  console.log(
    `${GREEN}[就绪]${RESET} 找到图片总数（排除 preview/ 后）：${images.length} 张`
  );
  console.log(
    `${GREEN}[就绪]${RESET} 并发数 = ${CONCURRENCY}  |  日志 = ${path.relative(
      process.cwd(),
      LOG_FILE
    )}`
  );
  console.log("");

  // 追加到日志
  const logLines = [];
  function appendLog(line) {
    logLines.push(line);
    // 批量写，最后统一 flush（减少 IO），失败列表单独维护
  }

  // 3. 状态统计
  const stats = {
    total: images.length,
    generated: 0,
    skipped_upToDate: 0,
    skipped_tooSmall: 0,
    skipped_other: 0,
    failed: 0,
    origTotalBytes: 0,
    prevTotalBytes: 0,
    failures: [], // {relPath, error}
  };
  const csvRows = []; // CSV 行（不含 header）

  // 打印用进度
  let doneCount = 0;
  let currentProcessing = "<启动中>";
  // 中断处理
  process.on("SIGINT", () => {
    console.log(
      `\n${YELLOW}[SIGINT]${RESET} 收到 Ctrl+C，当前正在处理: ${currentProcessing}`
    );
    // 尝试把现有结果写入 CSV/日志
    flushLogsSync();
    writeCSVSync();
    process.exit(0);
  });

  function flushLogsSync() {
    try {
      fs.appendFileSync(LOG_FILE, logLines.join("\n") + "\n", "utf-8");
      logLines.length = 0;
    } catch (e) {
      // 忽略日志写入错误
    }
  }

  function writeCSVSync() {
    try {
      const header = [
        "original_relpath",
        "preview_relpath",
        "orig_w",
        "orig_h",
        "orig_size_kb",
        "prev_w",
        "prev_h",
        "prev_size_kb",
        "saved_pct",
        "status",
      ].join(",");
      const content = [header, ...csvRows].join("\r\n") + "\r\n";
      fs.writeFileSync(CSV_FILE, content, "utf-8");
    } catch (e) {
      console.error(RED + "[错误] 写 CSV 失败：" + e.message + RESET);
    }
  }

  // 工作单元：处理一张图片
  async function processOne(absPath) {
    const relPath = path.relative(WORKING_DIR, absPath);
    currentProcessing = relPath;
    let status = "FAILED";
    let origW = "",
      origH = "",
      origSizeKb = "";
    let prevW = "",
      prevH = "",
      prevSizeKb = "";
    let saved = "";
    let previewRelPath = "";

    try {
      const origStat = await fsp.stat(absPath);
      const origSize = origStat.size;
      origSizeKb = kb(origSize);
      stats.origTotalBytes += origSize;

      // 用 sharp 读取尺寸与 metadata
      const meta = await sharp(absPath).metadata();
      let width = meta.width;
      let height = meta.height;
      if (width == null || height == null) {
        throw new Error(`无法读取图像尺寸 (metadata.width/height == null)`);
      }

      // --- EXIF 方向修正：metadata.width/height 是存储像素尺寸，
      //     orientation=5/6/7/8 时需要交换宽高才是视觉尺寸（后续 .rotate() 会应用）。
      //     如果不交换，则 pw/ph 会按存储像素算出错误的盒尺寸，
      //     .rotate().resize(pw, ph, fit:fill) 会把图像强行拉伸到错误比例。
      const orient = typeof meta.orientation === "number" ? meta.orientation : 1;
      const SWAP_ORIENTS = new Set([5, 6, 7, 8]);
      if (SWAP_ORIENTS.has(orient)) {
        const wTmp = width; width = height; height = wTmp;
      }

      origW = width;
      origH = height;

      const longEdge = Math.max(width, height);
      const shortEdge = Math.min(width, height);
      let targetLong = classify(longEdge);

      // 如果按尺寸被判为太小 (<900px) 但原图文件较大 (≥200KB，典型是透明 PNG)
      // 仍强制生成预览图：保持原长边像素不变，仅做 WebP 转码（省流量来自格式压缩而非缩放）
      if (targetLong == null && origSize >= 200 * 1024) {
        targetLong = longEdge;
        console.log(
          `ℹ️  强制生成：${CYAN}${relPath}${RESET} | 长边 ${longEdge} < 900 但 文件 ${origSizeKb} KB ≥ 200 KB（仅转 WebP，不缩放像素）`
        );
      }

      // 预览输出路径
      const dir = path.dirname(absPath);
      const base = path.basename(absPath, path.extname(absPath));
      const previewDir = path.join(dir, PREVIEW_DIR_NAME);
      const previewAbs = path.join(previewDir, `${base}.webp`);
      previewRelPath = path.relative(WORKING_DIR, previewAbs);

      // 是否需要生成
      if (targetLong == null) {
        // 太小 (长边 <900 且 文件 <200KB，纯缩略图，转 WebP 收益低)
        status = "SKIPPED_TOO_SMALL";
        stats.skipped_tooSmall++;
        console.log(
          `⏭️  跳过：${CYAN}${relPath}${RESET} | 原因：长边 ${longEdge}px < 900px 且 文件 ${origSizeKb}KB < 200KB`
        );
        appendLog(
          `SKIP_TOO_SMALL ${relPath} | longEdge=${longEdge}px size=${origSizeKb}KB`
        );
        return;
      }

      // 计算输出尺寸（零比例误差 · 整数严格等比）
      //
      // 思路：给定 (ow, oh) 与目标长边 targetLong，找一对整数 (pw, ph) 满足：
      //   (1) 比例严格相等：ow * ph === oh * pw   （整数域恒等，pxErr=0）
      //   (2) max(pw, ph) ≤ targetLong           （不放大，严格不超阈值）
      //   (3) 在 (1)(2) 约束下，max(pw, ph) 尽量大（不浪费目标长边预算）
      //
      // 算法：设 g = gcd(ow, oh)，既约比例 r = ow/g : s = oh/g（r/s 即 ow/oh 最简分数）。
      //       设缩放因子 k = floor(targetLong / max(r, s))，则
      //         pw = k*r ,  ph = k*s
      //       ——天然满足 ow*ph = g*r*k*s = g*s*k*r = oh*pw，且 max(pw,ph) = k*max(r,s) ≤ targetLong
      //       k 为最大整数，保证「尽量大但不超长边」。
      //
      // 小尺寸大文件 override 分支（targetLong === 原始 longEdge）时 k = g，pw=ow, ph=oh，等比 1:1 无缩放。
      function gcd(a, b) {
        a = Math.abs(a | 0); b = Math.abs(b | 0);
        while (b) { const t = a % b; a = b; b = t; }
        return a || 1;
      }
      const g = gcd(width, height);
      const r = width / g;   // 既约宽
      const s = height / g;  // 既约高
      const maxRs = Math.max(r, s);
      // k = floor(targetLong / maxRs)，至少为 1（否则没意义，至少 1×r,1×s）
      let k = Math.floor(targetLong / maxRs);
      if (k < 1) k = 1;
      let pw = k * r;
      let ph = k * s;
      // 安全兜底（理论不会触发，但如果 targetLong 输入为 0 或负数时防御）
      if (pw < 1) pw = 1;
      if (ph < 1) ph = 1;
      // 传给 sharp 的 resize 参数：因为 (pw,ph) 就是严格整数等比，用 fit:'fill' 更精准
      // （内容不拉伸，像素盒与内容严格匹配）；并用 info.width/height 回写 CSV 做双重校验
      const resizeOpts = {
        width: pw,
        height: ph,
        fit: "fill",
        kernel: "lanczos3",
        withoutEnlargement: false,
      };

      // 增量检测
      let prevExists = false;
      try {
        const pStat = await fsp.stat(previewAbs);
        prevExists = true;
        if (pStat.mtimeMs >= origStat.mtimeMs) {
          status = "SKIPPED_UP_TO_DATE";
          stats.skipped_upToDate++;
          // 读取实际预览文件尺寸（保证 CSV 里 prevW/prevH = 浏览器读 natural dims）
          try {
            const pMeta = await sharp(previewAbs).metadata();
            // fallback 用新的严格等比 pw/ph（替换之前旧 tw/th 变量名）
            prevW = pMeta.width ?? pw;
            prevH = pMeta.height ?? ph;
          } catch (_e) {
            prevW = pw;
            prevH = ph;
          }
          stats.prevTotalBytes += pStat.size;
          prevSizeKb = kb(pStat.size);
          saved = savedPct(origSize, pStat.size);
          console.log(
            `⏭️  跳过：${CYAN}${relPath}${RESET} | 原因：预览已存在且更新 (mtime newer)`
          );
          appendLog(
            `SKIP_UP_TO_DATE ${relPath} -> ${previewRelPath}`
          );
          return;
        }
      } catch (_notExist) {
        prevExists = false;
      }

      // 打印 "🔄 正在生成"（只在生成前打一次）
      console.log(`🔄 正在生成：${CYAN}${relPath}${RESET}`);

      // 确保 preview 目录存在
      await fsp.mkdir(previewDir, { recursive: true });

      // sharp 处理：单轴长边约束 + fit:inside → 零畸变严格等比（无拉伸/填充）
      // 使用 toBuffer({resolveWithObject:true}) 拿到 sharp 实际输出的 w/h，避免理论整数舍入误差
      const hasAlpha = meta.channels === 4 || meta.hasAlpha === true;

      const { data: outBuffer, info } = await sharp(absPath, { failOn: "none" })
        .rotate() // 按 EXIF 方向纠正（不影响比例）
        .resize(resizeOpts)
        .webp({
          quality: QUALITY,
          effort: EFFORT,
          alphaQuality: hasAlpha ? ALPHA_QUALITY : undefined,
          lossless: false,
        })
        .toBuffer({ resolveWithObject: true });
      await fsp.writeFile(previewAbs, outBuffer);

      const newSize = outBuffer.length;
      stats.prevTotalBytes += newSize;
      stats.generated++;
      status = "GENERATED";
      // 用 sharp 实际输出 info 的精确像素尺寸（保证 CSV 维度 = 浏览器 naturalWidth/Height）
      prevW = info.width;
      prevH = info.height;
      prevSizeKb = kb(newSize);
      saved = savedPct(origSize, newSize);

      console.log(
        `✅ 生成成功：${GREEN}${relPath}${RESET} → ${GREEN}${previewRelPath}${RESET}` +
          ` | 尺寸 ${origW}×${origH} → ${prevW}×${prevH}` +
          ` | ${origSizeKb} KB → ${prevSizeKb} KB` +
          ` | 节省 ${saved}%`
      );
      appendLog(
        `GENERATED ${relPath} -> ${previewRelPath} | ${origW}x${origH} -> ${prevW}x${prevH} | ${origSizeKb}KB -> ${prevSizeKb}KB | saved ${saved}%`
      );
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      stats.failed++;
      status = "FAILED";
      stats.failures.push({ relPath, error: msg });
      console.log(
        `❌ 错误：${RED}${relPath}${RESET} | ${msg}`
      );
      appendLog(`FAILED ${relPath} | ${msg}`);
    } finally {
      // CSV 行
      csvRows.push(
        [
          relPath,
          previewRelPath,
          origW,
          origH,
          origSizeKb,
          prevW,
          prevH,
          prevSizeKb,
          saved,
          status,
        ].map(csvEscape).join(",")
      );
      doneCount++;
    }
  }

  // 4. 并发执行
  await runWithConcurrency(images, CONCURRENCY, processOne);

  // 5. Summary
  console.log("");
  console.log("=".repeat(64));
  console.log(`${CYAN}  处理汇总（Summary）${RESET}`);
  console.log("=".repeat(64));
  console.log(`  扫描图片总数       : ${stats.total}`);
  console.log(`  ${GREEN}成功生成${RESET}           : ${stats.generated}`);
  const skipTotal =
    stats.skipped_upToDate + stats.skipped_tooSmall + stats.skipped_other;
  console.log(
    `  ${YELLOW}跳过${RESET}                 : ${skipTotal}  （已有新预览 ${stats.skipped_upToDate} + 原图太小 ${stats.skipped_tooSmall} + 其他 ${stats.skipped_other}）`
  );
  console.log(`  ${RED}失败${RESET}                 : ${stats.failed}`);

  const savedBytes =
    stats.origTotalBytes - Math.max(0, stats.prevTotalBytes);
  const savedKb = kb(savedBytes);
  const savedMb = Number((savedKb / 1024).toFixed(2));
  const totalSavedPct =
    stats.origTotalBytes > 0
      ? Number(((savedBytes / stats.origTotalBytes) * 100).toFixed(2))
      : 0;
  console.log(
    `  原图总大小         : ${kb(stats.origTotalBytes)} KB (${Number(
      (kb(stats.origTotalBytes) / 1024).toFixed(2)
    )} MB)`
  );
  console.log(
    `  预览总大小         : ${kb(stats.prevTotalBytes)} KB (${Number(
      (kb(stats.prevTotalBytes) / 1024).toFixed(2)
    )} MB)`
  );
  console.log(
    `  总节省流量         : ${savedKb} KB ≈ ${savedMb} MB （节省 ${totalSavedPct}%）`
  );

  if (stats.failures.length > 0) {
    console.log(``);
    console.log(`${RED}  失败清单（详见日志文件）${RESET}:`);
    for (const f of stats.failures) {
      console.log(`    - ${f.relPath}  => ${f.error}`);
    }
  }

  // 6. 写入日志 & CSV
  console.timeEnd("TOTAL");
  // @ts-ignore
  const durMs = Number(process.hrtime?.bigint ? 0 : 0); // 占位
  const took = formatDuration(
    (globalThis && globalThis.__TOTAL_MS__) ||
      // console.timeEnd 无法拿到数值，这里再用 Date 兜底
      0
  );
  // 我们用自己的计时更可靠
  // （上面的 console.time("TOTAL") 已开始，这里重新用 Date 算一下）
  // 简单做法：追加 Summary 到日志
  const summaryBlock = `
========== SUMMARY ==========
扫描图片总数       : ${stats.total}
成功生成           : ${stats.generated}
跳过               : ${skipTotal} (已有新预览 ${stats.skipped_upToDate} + 原图太小 ${stats.skipped_tooSmall} + 其他 ${stats.skipped_other})
失败               : ${stats.failed}
原图总大小         : ${kb(stats.origTotalBytes)} KB
预览总大小         : ${kb(stats.prevTotalBytes)} KB
总节省流量         : ${savedKb} KB (~${savedMb} MB, ${totalSavedPct}%)
并发数             : ${CONCURRENCY}
==============================
`;
  appendLog(summaryBlock);
  if (stats.failures.length > 0) {
    appendLog("FAILED_FILES:");
    for (const f of stats.failures) {
      appendLog(`  - ${f.relPath} | ${f.error}`);
    }
  }
  flushLogsSync();
  writeCSVSync();

  console.log("");
  console.log(`${GREEN}[完成]${RESET} 日志文件: ${LOG_FILE}`);
  console.log(`${GREEN}[完成]${RESET} CSV 清单: ${CSV_FILE}`);
}

// 用 Date 再包一层计时，便于打印"用时"
(async function run() {
  const t0 = Date.now();
  try {
    await main();
  } catch (e) {
    console.error(RED + "[致命错误]" + RESET, e);
    process.exit(2);
  } finally {
    const ms = Date.now() - t0;
    globalThis.__TOTAL_MS__ = ms;
    console.log(`  总用时             : ${formatDuration(ms)}`);
  }
})();
