import sharp from "sharp";
import { writeFileSync } from "fs";
import { resolve } from "path";

const srcPath = resolve("public/images/hero-pictures.webp");
const destPath = resolve("public/images/og-image-rituel.webp");

console.log("Generating og:image from hero-pictures.webp...");
console.log(`Source: ${srcPath}`);
console.log(`Destination: ${destPath}`);

// Load, crop to 1200x630 center, and save as optimized WebP
const buffer = await sharp(srcPath)
  .resize(1200, 630, { fit: "cover", position: "center" })
  .webp({ quality: 75 })
  .toBuffer();

const sizeKB = (buffer.length / 1024).toFixed(1);
console.log(`Image size: ${sizeKB} KB`);

if (buffer.length > 300 * 1024) {
  console.warn(`⚠️  Image exceeds 300 KB limit! (${sizeKB} KB)`);
  process.exit(1);
}

writeFileSync(destPath, buffer);
console.log("✓ og:image created successfully");
