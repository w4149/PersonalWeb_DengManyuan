import fs from "fs";
import path from "path";

function getJpegDimensions(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8)
    return null;
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const length = buffer.readUInt16BE(offset + 2);
    if (
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    ) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }
    offset += 2 + length;
  }
  return null;
}

function getPngDimensions(buffer) {
  if (buffer.length < 24 || buffer[0] !== 0x89) return null;
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

function getImageDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") return getJpegDimensions(buffer);
    if (ext === ".png") return getPngDimensions(buffer);
    return null;
  } catch {
    return null;
  }
}

const baseDir = "public/images";

function walkDir(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, fileList);
    } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const files = walkDir(baseDir);
const results = [];

for (const file of files) {
  const relPath = file.replace(/^public[\\/]/, "").replace(/\\/g, "/");
  const dims = getImageDimensions(file);
  if (dims) {
    const aspectRatio = +(dims.width / dims.height).toFixed(4);
    results.push({ path: relPath, width: dims.width, height: dims.height, aspectRatio });
  }
}

results.sort((a, b) => a.path.localeCompare(b.path));

console.log(JSON.stringify(results, null, 2));
