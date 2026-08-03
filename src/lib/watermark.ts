import "server-only";
import sharp from "sharp";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildWatermarkSvg(width: number, height: number, text: string): Buffer {
  const safeText = escapeXml(text);
  const tileW = 340;
  const tileH = 170;
  const cols = Math.ceil(width / tileW) + 1;
  const rows = Math.ceil(height / tileH) + 1;

  let texts = "";
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * tileW;
      const y = row * tileH + (col % 2 === 0 ? 0 : tileH / 2);
      texts += `<text x="${x}" y="${y}" transform="rotate(-30 ${x} ${y})">${safeText}</text>`;
    }
  }

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        text {
          fill: rgba(255, 255, 255, 0.35);
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 20px;
          font-weight: 600;
        }
      </style>
      ${texts}
    </svg>`;

  return Buffer.from(svg);
}

export interface WatermarkOptions {
  /** Resize the longest edge to this many pixels before watermarking. */
  maxDimension: number;
  /** Text repeated diagonally across the image (e.g. viewer email + timestamp). */
  text: string;
  quality?: number;
}

export async function applyWatermark(sourceBuffer: Buffer, options: WatermarkOptions): Promise<Buffer> {
  const image = sharp(sourceBuffer).rotate();
  const metadata = await image.metadata();

  const resized = image.resize({
    width: options.maxDimension,
    height: options.maxDimension,
    fit: "inside",
    withoutEnlargement: true,
  });

  const targetWidth = Math.min(metadata.width ?? options.maxDimension, options.maxDimension);
  const scale = targetWidth / (metadata.width ?? targetWidth);
  const targetHeight = Math.round((metadata.height ?? targetWidth) * scale);

  const watermarkSvg = buildWatermarkSvg(targetWidth, targetHeight, options.text);

  return resized
    .composite([{ input: watermarkSvg, gravity: "center" }])
    .webp({ quality: options.quality ?? 82 })
    .toBuffer();
}
