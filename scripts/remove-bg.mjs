import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT = path.join(__dirname, "../public/products/Platinum-Mac.jpg");
const OUTPUT = path.join(__dirname, "../public/products/Platinum-Mac-hero.png");

// Pixels where R, G, B are all above this value are considered background
const BG_THRESHOLD = 180;
// Edge feathering radius in pixels for smooth cutout
const FEATHER_RADIUS = 2;

async function main() {
  const { data, info } = await sharp(INPUT)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Pass 1: Set alpha to 0 for light gray background pixels
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r > BG_THRESHOLD && g > BG_THRESHOLD && b > BG_THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  // Pass 2: Edge feathering — smooth the boundary between opaque and transparent
  const alphaMap = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      alphaMap[y * width + x] = data[(y * width + x) * channels + 3];
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (alphaMap[idx] === 0) continue;

      let minDist = FEATHER_RADIUS + 1;

      for (let dy = -FEATHER_RADIUS; dy <= FEATHER_RADIUS; dy++) {
        for (let dx = -FEATHER_RADIUS; dx <= FEATHER_RADIUS; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          if (alphaMap[ny * width + nx] === 0) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            minDist = Math.min(minDist, dist);
          }
        }
      }

      if (minDist <= FEATHER_RADIUS) {
        const factor = minDist / FEATHER_RADIUS;
        data[idx * channels + 3] = Math.round(255 * factor);
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png({ compressionLevel: 9 })
    .toFile(OUTPUT);

  console.log(`Background removed: ${OUTPUT}`);
  console.log(`  Input:  ${width}x${height} JPEG`);
  console.log(`  Output: ${width}x${height} PNG with transparency`);
}

main().catch((err) => {
  console.error("Background removal failed:", err);
  process.exit(1);
});
