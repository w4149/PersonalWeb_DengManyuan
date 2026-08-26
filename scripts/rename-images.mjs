import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require("fs");
const path = require("path");

const PUBLIC_DIR = path.resolve("public/images");
const IMAGE_DIR = path.resolve("image");

const TOP_DIR_MAP = {
  "1.paitings-2026": "paintings-2026",
  "2.paitings-2025": "paintings-2025",
  "3.paitings-2024": "paintings-2024",
  "4.installations-2026": "installations-2026",
  "5.installations-2025": "installations-2025",
  "6.workshops-2026": "workshops-2026",
  "7.workshops-2025": "workshops-2025",
  "8.Photograph and videos-2026": "photograph-videos-2026",
};

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]/g, (m) => ({ "Ⅰ": "i", "Ⅱ": "ii", "Ⅲ": "iii", "Ⅳ": "iv", "Ⅴ": "v", "Ⅵ": "vi", "Ⅶ": "vii", "Ⅷ": "viii", "Ⅸ": "ix", "Ⅹ": "x" }[m] || m))
    .replace(/[①②③④⑤⑥⑦⑧⑨⑩]/g, (m) => ({ "①": "1", "②": "2", "③": "3", "④": "4", "⑤": "5", "⑥": "6", "⑦": "7", "⑧": "8", "⑨": "9", "⑩": "10" }[m] || m))
    .replace(/[\u4e00-\u9fff]/g, "")
    .replace(/[()（）]/g, "")
    .replace(/[,，。；;：:]/g, "")
    .replace(/'/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugifyDir(str) {
  return slugify(str).replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function safeRename(oldPath, newPath) {
  const oldAbs = path.resolve(oldPath);
  const newAbs = path.resolve(newPath);
  if (oldAbs.toLowerCase() === newAbs.toLowerCase()) {
    const tmpPath = oldAbs + ".__tmp__";
    fs.renameSync(oldAbs, tmpPath);
    fs.renameSync(tmpPath, newAbs);
  } else {
    fs.renameSync(oldAbs, newAbs);
  }
}

const renameMap = {};

function buildRenameMap(dir, relPath = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const oldRel = path.join(relPath, entry.name).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      let newRel;
      if (relPath === "" && TOP_DIR_MAP[entry.name]) {
        newRel = TOP_DIR_MAP[entry.name];
      } else {
        newRel = path.join(relPath, slugifyDir(entry.name)).replace(/\\/g, "/");
      }
      renameMap[oldRel] = newRel;
      buildRenameMap(path.join(dir, entry.name), oldRel);
    } else {
      const dirPart = path.dirname(relPath);
      const baseName = path.basename(entry.name, path.extname(entry.name));
      const ext = path.extname(entry.name).toLowerCase();
      const newName = slugify(baseName) + ext;
      const newRel = dirPart
        ? path.join(dirPart, newName).replace(/\\/g, "/")
        : newName;
      renameMap[oldRel] = newRel;
    }
  }
}

function applyRenames(baseDir) {
  const dirs = [];
  const files = [];

  for (const [oldPath, newPath] of Object.entries(renameMap)) {
    if (oldPath === newPath) continue;
    const oldFull = path.join(baseDir, oldPath);
    const newFull = path.join(baseDir, newPath);
    if (!fs.existsSync(oldFull)) {
      console.log(`  SKIP: ${oldPath}`);
      continue;
    }
    const stat = fs.statSync(oldFull);
    if (stat.isDirectory()) {
      dirs.push({ oldFull, newFull });
    } else {
      files.push({ oldFull, newFull });
    }
  }

  files.sort((a, b) => b.oldFull.length - a.oldFull.length);
  for (const { oldFull, newFull } of files) {
    fs.mkdirSync(path.dirname(newFull), { recursive: true });
    safeRename(oldFull, newFull);
  }

  dirs.sort((a, b) => b.oldFull.length - a.oldFull.length);
  for (const { oldFull, newFull } of dirs) {
    fs.mkdirSync(path.dirname(newFull), { recursive: true });
    safeRename(oldFull, newFull);
  }

  console.log(`  Renamed ${dirs.length} dirs and ${files.length} files in ${path.basename(baseDir)}/`);
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

console.log("=== Image Rename Script ===\n");

console.log("Building rename map from public/images/ ...");
buildRenameMap(PUBLIC_DIR);
console.log(`Total entries: ${Object.keys(renameMap).length}`);

const changes = Object.entries(renameMap).filter(([o, n]) => o !== n);
console.log(`Entries needing rename: ${changes.length}\n`);

if (changes.length > 0) {
  console.log("Renaming in public/images/ ...");
  applyRenames(PUBLIC_DIR);
} else {
  console.log("No renames needed.");
}

console.log("\nCopying public/images/ → image/ ...");
fs.rmSync(IMAGE_DIR, { recursive: true, force: true });
copyDir(PUBLIC_DIR, IMAGE_DIR);

const countFiles = (dir) => {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) count += countFiles(p);
    else count++;
  }
  return count;
};
console.log(`  Copied ${countFiles(IMAGE_DIR)} files to image/`);

console.log("\n=== Rename Mapping ===");
const sorted = Object.entries(renameMap).filter(([o, n]) => o !== n).sort((a, b) => a[0].length - b[0].length);
for (const [old, nw] of sorted) {
  console.log(`  ${old}  →  ${nw}`);
}

console.log("\nDone!");
