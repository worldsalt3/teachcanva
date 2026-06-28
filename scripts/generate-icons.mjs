// Generates PNG icon variants from public/icons/icon.svg using sharp.
// Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");

const svg = await readFile(join(iconsDir, "icon.svg"));

const targets = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of targets) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, name));
  console.log(`✓ ${name} (${size}x${size})`);
}

// Maskable: add ~12% padding (safe zone) on a solid brand background.
const maskSize = 512;
const pad = Math.round(maskSize * 0.12);
const inner = maskSize - pad * 2;
const innerPng = await sharp(svg, { density: 384 })
  .resize(inner, inner)
  .png()
  .toBuffer();
await sharp({
  create: {
    width: maskSize,
    height: maskSize,
    channels: 4,
    background: "#1d4ed8",
  },
})
  .composite([{ input: innerPng, top: pad, left: pad }])
  .png()
  .toFile(join(iconsDir, "icon-maskable-512.png"));
console.log("✓ icon-maskable-512.png (512x512)");
