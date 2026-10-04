// Crop the circular centre out of the source image into a logo mark.
// The source is a detailed photo on a black field: corners are pure 0,0,0 and the
// content is a disc. Detect the disc from the luminance map, then re-render just that
// disc with transparent corners so it can sit on the header's glass plate.
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { chromium } from "playwright";

const SRC = "C:/Users/siddh/Downloads/704898716_17888841669519259_7919930610869089707_n.jpg";
const SIZE = 144; // 4x the 36px mark
const THRESHOLD = 16; // black field is 0; anything brighter is content

const b64 = readFileSync(SRC).toString("base64");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent("<body></body>");

const result = await page.evaluate(
  async ({ dataUrl, size, threshold }) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const W = img.naturalWidth, H = img.naturalHeight;
    const src = document.createElement("canvas");
    src.width = W; src.height = H;
    const sctx = src.getContext("2d", { willReadFrequently: true });
    sctx.drawImage(img, 0, 0);
    const d = sctx.getImageData(0, 0, W, H).data;
    const lum = (i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];

    let minX = W, maxX = -1, minY = H, maxY = -1;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (lum((y * W + x) * 4) > threshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const R = Math.min(maxX - minX, maxY - minY) / 2;

    // keep a sliver of the black field so the disc's own rim is not cropped away
    const pad = Math.max(2, R * 0.015);
    const crop = R + pad;
    const out = document.createElement("canvas");
    out.width = size; out.height = size;
    const octx = out.getContext("2d", { willReadFrequently: true });
    octx.imageSmoothingQuality = "high";
    octx.drawImage(img, cx - crop, cy - crop, crop * 2, crop * 2, 0, 0, size, size);

    // knock out everything outside the disc
    const mask = octx.createRadialGradient(size / 2, size / 2, size / 2 - 1.5, size / 2, size / 2, size / 2);
    mask.addColorStop(0, "rgba(0,0,0,1)");
    mask.addColorStop(1, "rgba(0,0,0,0)");
    octx.globalCompositeOperation = "destination-in";
    octx.fillStyle = mask;
    octx.fillRect(0, 0, size, size);
    octx.globalCompositeOperation = "source-over";

    // report the transparency actually achieved
    const chk = octx.getImageData(0, 0, size, size).data;
    const corner = chk[3];
    let opaque = 0;
    for (let i = 3; i < chk.length; i += 4) if (chk[i] > 250) opaque++;

    return {
      detect: { W, H, minX, maxX, minY, maxY, cx, cy, R: Math.round(R) },
      png: out.toDataURL("image/png").split(",")[1],
      webp: out.toDataURL("image/webp", 0.92).split(",")[1],
      cornerAlpha: corner,
      discCoverage: +(opaque / (size * size)).toFixed(3),
    };
  },
  { dataUrl: "data:image/jpeg;base64," + b64, size: SIZE, threshold: THRESHOLD }
);

const png = Buffer.from(result.png, "base64");
const webp = Buffer.from(result.webp, "base64");
console.log(`source ${result.detect.W}x${result.detect.H}`);
console.log(`disc detected: centre (${Math.round(result.detect.cx)}, ${Math.round(result.detect.cy)}) radius ${result.detect.R}px`);
console.log(`png  ${SIZE}x${SIZE}  ${(png.length / 1024).toFixed(1)} kB`);
console.log(`webp ${SIZE}x${SIZE}  ${(webp.length / 1024).toFixed(1)} kB`);
console.log(`corner alpha ${result.cornerAlpha} (0 = fully transparent)   disc covers ${result.discCoverage * 100}% of the square`);

// The mark renders at 36px, so pick the smaller lossless-alpha format.
const useWebp = webp.length < png.length;
const out = useWebp ? "public/logo-mark.webp" : "public/logo-mark.png";
writeFileSync(out, useWebp ? webp : png);
if (useWebp) { try { unlinkSync("public/logo-mark.png"); } catch {} }
console.log(`wrote ${out}`);
await browser.close();