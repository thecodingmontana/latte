import { existsSync, unlinkSync } from "node:fs";
import sharp from "sharp";

const images = ["finance-investment-banking-cost-concept"];

for (const name of images) {
  const input = `./public/images/${name}.jpg`;
  const output = `./public/images/${name}.webp`;

  if (existsSync(output)) {
    console.log(`⏭ Skipped: ${name}.webp already exists`);
    continue;
  }

  await sharp(input).webp({ quality: 80 }).toFile(output);
  unlinkSync(input); // deletes the original .jpg
  console.log(`✅ Converted & removed original: ${name}`);
}
