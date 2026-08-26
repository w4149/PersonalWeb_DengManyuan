import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require("fs");
const path = require("path");

const src = path.resolve("image");
const dst = path.resolve("public/images");

if (!fs.existsSync(src)) {
  console.log("[images] Source directory 'image/' not found, skipping.");
  process.exit(0);
}

fs.mkdirSync(dst, { recursive: true });

function copyRecursive(from, to) {
  const entries = fs.readdirSync(from, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(from, entry.name);
    const dstPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(dstPath, { recursive: true });
      copyRecursive(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

copyRecursive(src, dst);

const fileCount = fs
  .readdirSync(dst, { recursive: true })
  .filter((f) => f.isFile()).length;
console.log(`[images] Copied ${fileCount} files to public/images/`);
