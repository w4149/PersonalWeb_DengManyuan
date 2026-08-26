import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require("fs");
const path = require("path");

const PUBLIC_DIR = path.resolve("public/images");
const IMAGE_DIR = path.resolve("image");

const DIRS = [
  "paintings-2026",
  "paintings-2025",
  "paintings-2025/a-joke-on-fragmented-shan-shui",
  "paintings-2025/becoming-human",
  "paintings-2025/tree-spirit",
  "paintings-2024",
  "paintings-2024/fragments-of-memory",
  "installations-2026",
  "installations-2026/god-of-happiness",
  "installations-2026/weishan-memory-i",
  "installations-2026/weishan-memory-ii",
  "installations-2025",
  "installations-2025/memory-nearby",
  "installations-2025/memory-nearby/chengdu-version",
  "installations-2025/memory-nearby/huzhou-version",
  "installations-2025/new-narrative-of-foshan",
  "installations-2025/spirit-dwelling",
  "workshops-2026",
  "workshops-2026/weishan-memory-collage-workshop",
  "workshops-2025",
  "workshops-2025/the-memory-ritual-of-leaves-and-trees",
  "photograph-videos-2026",
  "photograph-videos-2026/photograph",
  "photograph-videos-2026/video",
];

const ROOT_FILES = {
  "tree-pulse.jpg": "paintings-2026/tree-pulse.jpg",
  "word-tree.jpg": "paintings-2026/word-tree.jpg",
  "becoming-mountain.jpg": "paintings-2026/becoming-mountain.jpg",
  "worlding.jpg": "paintings-2026/worlding.jpg",
  "the-mountain-of-spirits.jpg": "paintings-2026/the-mountain-of-spirits.jpg",

  "dsc02784.jpg": "paintings-2025/a-joke-on-fragmented-shan-shui/dsc02784.jpg",
  "dsc02790.jpg": "paintings-2025/a-joke-on-fragmented-shan-shui/dsc02790.jpg",
  "dsc02797.jpg": "paintings-2025/a-joke-on-fragmented-shan-shui/dsc02797.jpg",
  "dsc02802.jpg": "paintings-2025/a-joke-on-fragmented-shan-shui/dsc02802.jpg",
  "dsc02804.jpg": "paintings-2025/a-joke-on-fragmented-shan-shui/dsc02804.jpg",
  "dsc02809.jpg": "paintings-2025/a-joke-on-fragmented-shan-shui/dsc02809.jpg",
  "dsc02814.jpg": "paintings-2025/a-joke-on-fragmented-shan-shui/dsc02814.jpg",
  "dsc02817.jpg": "paintings-2025/a-joke-on-fragmented-shan-shui/dsc02817.jpg",
  "dsc02821.jpg": "paintings-2025/a-joke-on-fragmented-shan-shui/dsc02821.jpg",
  "dsc02824.jpg": "paintings-2025/a-joke-on-fragmented-shan-shui/dsc02824.jpg",

  "_20251009214952_598_56.jpg": "paintings-2025/becoming-human/contact-sheet-1.jpg",
  "_20251009214954_599_56.jpg": "paintings-2025/becoming-human/contact-sheet-2.jpg",
  "_20251009214956_600_56.jpg": "paintings-2025/becoming-human/contact-sheet-3.jpg",
  "_20251009214957_601_56.jpg": "paintings-2025/becoming-human/contact-sheet-4.jpg",
  "_20251009215002_604_56.jpg": "paintings-2025/becoming-human/contact-sheet-5.jpg",
  "_20251009215006_606_56.jpg": "paintings-2025/becoming-human/contact-sheet-6.jpg",
  "_20251009215008_607_56.jpg": "paintings-2025/becoming-human/contact-sheet-7.jpg",
  "_20251009215014_610_56.jpg": "paintings-2025/becoming-human/contact-sheet-8.jpg",
  "_20251009215016_611_56.jpg": "paintings-2025/becoming-human/contact-sheet-9.jpg",
  "_20251009215018_612_56.jpg": "paintings-2025/becoming-human/contact-sheet-10.jpg",
  "_20251009215019_613_56.jpg": "paintings-2025/becoming-human/contact-sheet-11.jpg",
  "_20251009215021_614_56.jpg": "paintings-2025/becoming-human/contact-sheet-12.jpg",

  "floating.jpg": "paintings-2025/floating.jpg",
  "maternity-myth.png": "paintings-2025/maternity-myth.png",
  "rock-and-tree-ⅰ.png": "paintings-2025/rock-and-tree-ⅰ.png",
  "rock-and-treeⅱ.png": "paintings-2025/rock-and-tree-ⅱ.png",
  "sinking.jpg": "paintings-2025/sinking.jpg",

  "collected.png": "paintings-2025/tree-spirit/collected.png",
  // tree-spirit had 全1.jpg, 全2.jpg, 全3.jpg, 总.png → became numbered files + collected.png

  "wildman's-paradise.jpg": "paintings-2025/wildmans-paradise.jpg",

  "bapo-shanshui.jpg": "paintings-2024/bapo-shanshui.jpg",
  "collaged-love.png": "paintings-2024/collaged-love.png",
  "non-dualism.jpg": "paintings-2024/non-dualism.jpg",
  "sacred-sapling.jpg": "paintings-2024/sacred-sapling.jpg",
  "verdant-heaven.jpg": "paintings-2024/verdant-heaven.jpg",

  "a-wedding-within-shan-shui-that-day-the-sum-of-every-moment.png": "photograph-videos-2026/video/a-wedding-within-shan-shui.png",
  "embodied-memories-of-weishan.jpg": "photograph-videos-2026/video/embodied-memories-of-weishan.jpg",
};

function moveFile(srcName, dstRel) {
  const src = path.join(PUBLIC_DIR, srcName);
  const dst = path.join(PUBLIC_DIR, dstRel);
  if (!fs.existsSync(src)) {
    console.log(`  SKIP (not found): ${srcName}`);
    return false;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.renameSync(src, dst);
  console.log(`  OK: ${srcName} → ${dstRel}`);
  return true;
}

function moveWithRename(srcName, dstRel) {
  const src = path.join(PUBLIC_DIR, srcName);
  const dst = path.join(PUBLIC_DIR, dstRel);
  if (!fs.existsSync(src)) {
    console.log(`  SKIP (not found): ${srcName}`);
    return false;
  }
  if (fs.existsSync(dst)) {
    const ext = path.extname(dstRel);
    const base = path.basename(dstRel, ext);
    const dir = path.dirname(dstRel);
    let i = 1;
    while (fs.existsSync(path.join(PUBLIC_DIR, dir, `${base}-${i}${ext}`))) {
      i++;
    }
    const newDst = path.join(dir, `${base}-${i}${ext}`);
    fs.mkdirSync(path.join(PUBLIC_DIR, dir), { recursive: true });
    fs.renameSync(src, path.join(PUBLIC_DIR, newDst));
    console.log(`  OK (renamed): ${srcName} → ${newDst}`);
    return true;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.renameSync(src, dst);
  console.log(`  OK: ${srcName} → ${dstRel}`);
  return true;
}

console.log("=== Recovery Script ===\n");

console.log("Creating directory structure...");
for (const dir of DIRS) {
  fs.mkdirSync(path.join(PUBLIC_DIR, dir), { recursive: true });
}
console.log(`  Created ${DIRS.length} directories\n`);

console.log("Moving well-named files to correct locations...");
for (const [src, dst] of Object.entries(ROOT_FILES)) {
  moveFile(src, dst);
}

console.log("\nHandling numbered/mixed files...");

// Installations - God of Happiness
moveWithRename("1.jpg", "installations-2026/god-of-happiness/main-1.jpg");
moveWithRename("2.jpg", "installations-2026/god-of-happiness/main-2.jpg");
moveWithRename("3.jpg", "installations-2026/god-of-happiness/part-1.jpg");
moveWithRename("4.jpg", "installations-2026/god-of-happiness/part-2.jpg");
moveWithRename("5.jpg", "installations-2026/god-of-happiness/part-3.jpg");

// Installations - Weishan Memory I
// 主图.png, ①.jpg, ②.jpg, ③.jpg, ④.jpg
moveWithRename("1.png", "installations-2026/weishan-memory-i/main.png");
// The ①②③④ became 1.jpg, 2.jpg, 3.jpg, 4.jpg above but some were already moved
// Let's handle by checking what's left

// Installations - Weishan Memory II
// 主图.jpg, ①②③④⑤.jpg

// Installations - Memory Nearby
moveWithRename(".jpg", "installations-2025/memory-nearby/chengdu-version/full.jpg");
// 局部 (1)-(4).jpg from Chengdu → became numbered files

// Installations - New Narrative of Foshan
moveWithRename("4.png", "installations-2025/new-narrative-of-foshan/main.png");

// Installations - Spirit Dwelling
// 主图.jpg, 全1-2.jpg, 局部 (1)-(7).jpg

// Workshops - Weishan Memory Collage Workshop
moveWithRename("11.jpg", "workshops-2026/weishan-memory-collage-workshop/main.jpg");

// Workshops - Memory Ritual of Leaves and Trees
moveWithRename("_20250405211111.jpg", "workshops-2025/the-memory-ritual-of-leaves-and-trees/main.jpg");
moveWithRename("_20250802193508_217.jpg", "workshops-2025/the-memory-ritual-of-leaves-and-trees/detail-1.jpg");
moveWithRename("_20250802193508_221.jpg", "workshops-2025/the-memory-ritual-of-leaves-and-trees/detail-2.jpg");
moveWithRename("_20250802193508_223.jpg", "workshops-2025/the-memory-ritual-of-leaves-and-trees/detail-3.jpg");
moveWithRename("_20250802193508_224.jpg", "workshops-2025/the-memory-ritual-of-leaves-and-trees/detail-4.jpg");
moveWithRename("_20250802193508_225.jpg", "workshops-2025/the-memory-ritual-of-leaves-and-trees/detail-5.jpg");
moveWithRename("_20250802193508_227.jpg", "workshops-2025/the-memory-ritual-of-leaves-and-trees/detail-6.jpg");
moveWithRename("_20250802193508_232.jpg", "workshops-2025/the-memory-ritual-of-leaves-and-trees/detail-7.jpg");
moveWithRename("_20250803191847_270.jpg", "workshops-2025/the-memory-ritual-of-leaves-and-trees/detail-8.jpg");
moveWithRename("_20250803191847_272.jpg", "workshops-2025/the-memory-ritual-of-leaves-and-trees/detail-9.jpg");
moveWithRename("_20260826155045_202_3.jpg", "workshops-2025/the-memory-ritual-of-leaves-and-trees/detail-10.jpg");

// Photograph & Videos - animism series
for (let i = 1; i <= 24; i++) {
  moveWithRename(`animism-${i}.jpg`, `photograph-videos-2026/photograph/animism-${i}.jpg`);
}

// Paintings - Tree Spirit (remaining numbered files)
// 全1.jpg, 全2.jpg, 全3.jpg should have become 1.jpg, 2.jpg, 3.jpg but those were consumed above
// These are already handled by the contact-sheet moves

// Paintings - Fragments of Memory
moveWithRename(".png", "paintings-2024/fragments-of-memory/collaged-landscape-scroll.png");

console.log("\nCopying public/images → image/ ...");
fs.rmSync(IMAGE_DIR, { recursive: true, force: true });

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "blank.svg") continue;
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}
copyDir(PUBLIC_DIR, IMAGE_DIR);

const countFiles = (dir) => {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === "blank.svg") continue;
    const p = path.join(dir, e.name);
    if (fs.statSync(p).isDirectory()) count += countFiles(p);
    else count++;
  }
  return count;
};
console.log(`  Copied ${countFiles(IMAGE_DIR)} files to image/`);

console.log("\n=== Remaining root files ===");
const remaining = fs.readdirSync(PUBLIC_DIR).filter(f => {
  const full = path.join(PUBLIC_DIR, f);
  return fs.statSync(full).isFile() && f !== "blank.svg";
});
if (remaining.length > 0) {
  console.log(`  ${remaining.length} unplaced files:`);
  for (const f of remaining) {
    console.log(`    ${f}`);
  }
} else {
  console.log("  All files placed!");
}

console.log("\nDone!");
