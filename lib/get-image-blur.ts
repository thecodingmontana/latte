import fs from "node:fs";
import { getPlaiceholder } from "plaiceholder";

export async function getBlurData(src: string) {
  const file = fs.readFileSync(`./public${src}`);
  const { base64 } = await getPlaiceholder(file);
  return base64;
}
