/**
 * Backdrop visibility + copy-contrast diagnostic.
 *
 * Eyeballing a screenshot cannot tell you whether a background photo is
 * actually readable through its veil — a washed-out photo and a flat gradient
 * look identical at a glance. This measures it instead.
 *
 * For every photo-backed section it clips the rendered region and computes:
 *   range     p95 - p05 luminance spread (robust to text pixels). A surviving
 *             photograph keeps meaningful spread; a flat wash collapses to 0.
 *   stddev    whole-sample luminance standard deviation.
 *   sat       mean HSV saturation.
 *
 * It also measures the real WCAG contrast of body copy against the pixels
 * actually painted behind it, so the AA claim is verified rather than assumed.
 *
 * Usage: node scripts/diagnose-backdrops.mjs [baseUrl]
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.argv[2] || "http://localhost:8443";
const OUT_DIR = path.resolve("screenshots/_diagnostics");
const VIEWPORT = { width: 1440, height: 900 };

/** Regions whose backdrop should read as photography. */
const SECTIONS = [
  { route: "/", selector: ".section--tint", label: "home / destinations" },
  { route: "/", selector: ".stories-section", label: "home / stories" },
  { route: "/", selector: ".upcoming-section", label: "home / upcoming" },
  { route: "/", selector: ".scroll-journey", label: "home / scroll-journey" },
  { route: "/", selector: ".process-section", label: "home / process (dark)" },
  { route: "/", selector: ".reels-section", label: "home / reels (dark)" },
  { route: "/", selector: ".newsletter", label: "home / newsletter (dark)" },
  { route: "/destinations", selector: ".region-section", label: "destinations / region" },
  { route: "/about", selector: ".values-section", label: "about / values" },
  { route: "/", selector: ".footer-band", label: "footer / photo band" },
  { route: "/", selector: ".footer-surface", label: "footer / link ground" },
];

/** Copy that sits directly on a veil, to contrast-check. */
const TEXT_CHECKS = [
  { route: "/", selector: ".section--tint .section-copy", label: "destinations copy" },
  { route: "/", selector: ".stories-section .section-copy", label: "stories copy" },
  { route: "/", selector: ".upcoming-section .section-copy", label: "upcoming copy" },
  { route: "/destinations", selector: ".region-grid article h3", label: "region card heading" },
  { route: "/destinations", selector: ".region-grid article p", label: "region card body" },
  { route: "/about", selector: ".value-grid article h3", label: "values card heading" },
  { route: "/", selector: ".process-section .section-copy", label: "process copy (dark)" },
  { route: "/", selector: ".process-step h3", label: "process step heading (dark)" },
  { route: "/", selector: ".newsletter p", label: "newsletter copy (dark)" },
  { route: "/", selector: ".reels-section .section-copy", label: "reels copy (dark)" },
  { route: "/", selector: ".process-step p", label: "process step body (dark)" },
  { route: "/", selector: ".newsletter form small", label: "newsletter fine print" },
  { route: "/", selector: ".footer-brand p", label: "footer brand copy" },
  { route: "/", selector: ".trust-note", label: "footer trust note" },
  { route: "/", selector: ".footer-col button", label: "footer link" },
  { route: "/", selector: ".footer-bottom span", label: "footer legal line" },
  { route: "/", selector: ".section--tint .eyebrow", label: "destinations eyebrow" },
  { route: "/", selector: ".region-grid small", label: "region card tag" },
  { route: "/destinations", selector: ".region-grid article p", label: "region card body" },
  { route: "/destinations", selector: ".value-grid article p", label: "values card body" },
  { route: "/trips", selector: ".trip-meta", label: "trip card meta" },
  { route: "/trips", selector: ".price small", label: "price note" },
  { route: "/", selector: ".trust-grid span", label: "trust strip label" },
  { route: "/", selector: ".breadcrumb", label: "breadcrumb" },
];

/** Decodes a PNG buffer and returns luminance / saturation statistics.
 *
 *  Two different quantities are tracked deliberately:
 *    gray / stddev / range — gamma-encoded luma. Used only to judge whether
 *      photographic structure survives a veil, where perceptual spread is what
 *      matters and the encoding does not.
 *    relLum / median       — WCAG relative luminance (channels linearised).
 *      This is the only quantity valid for a contrast ratio. Feeding the
 *      gamma-encoded value into a WCAG formula is a common and very quiet
 *      mistake: it overstates contrast on light surfaces and understates it on
 *      dark ones, which is exactly the range these sections occupy.
 *    medianRGB             — the surface colour, needed to composite translucent
 *      text over it before measuring. */
async function analyseBuffer(page, buffer) {
  return page.evaluate(async (b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0);
    const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height);

    const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

    const gray = [];
    const rel = [];
    let satSum = 0;
    let n = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      gray.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
      rel.push(0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b));
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      satSum += max === 0 ? 0 : (max - min) / max;
      n++;
    }

    const pct = (arr, p) => {
      const sorted = [...arr].sort((a, b) => a - b);
      return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
    };
    const mean = gray.reduce((s, v) => s + v, 0) / gray.length;
    const stddev = Math.sqrt(gray.reduce((s, v) => s + (v - mean) ** 2, 0) / gray.length);
    const p05 = pct(gray, 0.05);
    const p95 = pct(gray, 0.95);

    // Median surface colour, for compositing translucent text.
    const chan = (k) => {
      const arr = [];
      for (let i = k; i < data.length; i += 4) arr.push(data[i]);
      arr.sort((a, b) => a - b);
      return arr[Math.floor(arr.length / 2)];
    };

    return {
      width: bitmap.width,
      height: bitmap.height,
      meanLuma: +mean.toFixed(4),
      stddev: +stddev.toFixed(4),
      p05: +p05.toFixed(4),
      p95: +p95.toFixed(4),
      range: +(p95 - p05).toFixed(4),
      sat: +(satSum / n).toFixed(4),
      median: +pct(rel, 0.5).toFixed(4),
      p15: +pct(rel, 0.15).toFixed(4),
      p85: +pct(rel, 0.85).toFixed(4),
      medianRGB: [chan(0), chan(1), chan(2)],
    };
  }, buffer.toString("base64"));
}

const linear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const relativeLuma = (r, g, b) => 0.2126 * linear(r / 255) + 0.7152 * linear(g / 255) + 0.0722 * linear(b / 255);

function contrast(l1, l2) {
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Crops a rect that is guaranteed to sit inside the viewport. */
function safeClip(box, { x, y, w, h }) {
  const cx = Math.max(0, Math.round(box.x + x));
  const cy = Math.max(0, Math.round(box.y + y));
  const cw = Math.max(8, Math.min(Math.round(w), VIEWPORT.width - cx));
  const ch = Math.max(8, Math.min(Math.round(h), VIEWPORT.height - cy));
  if (cw < 8 || ch < 8) return null;
  return { x: cx, y: cy, width: cw, height: ch };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });

  const load = async (route) => {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(1200);
  };

  console.log("=== BACKDROP VISIBILITY ===");
  console.log(
    "label".padEnd(28) + "range".padStart(8) + "stddev".padStart(8) + "sat".padStart(8) + "meanL".padStart(8) + "  verdict"
  );
  console.log("-".repeat(80));

  const rows = [];
  for (const s of SECTIONS) {
    await load(s.route);
    const locator = page.locator(s.selector).first();
    if ((await locator.count()) === 0) {
      console.log(s.label.padEnd(28) + "  <selector not found>");
      continue;
    }
    // Scroll into view first: boundingBox() and screenshot clip are both
    // viewport-relative, so an off-screen section yields an empty clip.
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    const box = await locator.boundingBox();
    if (!box) {
      console.log(s.label.padEnd(28) + "  <no box>");
      continue;
    }

    // Left gutter strip: clear of the text column and of any cards, so only
    // the veil + photo contribute to the statistics.
    const clip = safeClip(box, { x: 6, y: box.height * 0.5, w: 110, h: Math.min(190, box.height * 0.18) });
    if (!clip) {
      console.log(s.label.padEnd(28) + "  <not in viewport>");
      continue;
    }
    const buffer = await page.screenshot({ clip });
    await locator.screenshot({ path: path.join(OUT_DIR, `${s.label.replace(/[^a-z0-9]+/gi, "-")}.png`) });
    const st = await analyseBuffer(page, buffer);

    // A photograph surviving a veil keeps real luminance spread. Below ~0.02
    // the veil has flattened it into a gradient; above ~0.045 it clearly reads.
    const verdict = st.range >= 0.045 ? "visible" : st.range >= 0.02 ? "faint" : "washed out";
    rows.push({ ...s, ...st, verdict });

    console.log(
      s.label.padEnd(28) +
        st.range.toFixed(4).padStart(8) +
        st.stddev.toFixed(4).padStart(8) +
        st.sat.toFixed(4).padStart(8) +
        st.meanLuma.toFixed(4).padStart(8) +
        `  ${verdict}`
    );
  }

  console.log("\n=== COPY CONTRAST (WCAG) ===");
  console.log("label".padEnd(30) + "size/weight".padEnd(14) + "bgL".padStart(8) + "ratio".padStart(8) + "  verdict");
  console.log("-".repeat(80));

  const fails = [];
  for (const t of TEXT_CHECKS) {
    await load(t.route);
    const node = page.locator(t.selector).first();
    if ((await node.count()) === 0) {
      console.log(t.label.padEnd(30) + "  <selector not found>");
      continue;
    }
    await node.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const style = await node.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        color: cs.color,
        fontSize: parseFloat(cs.fontSize),
        fontWeight: cs.fontWeight,
        onOwnSurface: cs.backgroundColor !== "rgba(0, 0, 0, 0)",
      };
    });

    // Measure the backdrop from real pixels inside the text box itself. Glyph
    // pixels are always a minority of the box, so the median is the surface.
    // Works for light-on-dark and dark-on-light alike, and avoids guessing
    // which ancestor owns the veil.
    const box = await node.boundingBox();
    const clip = box ? safeClip(box, { x: 0, y: 0, w: box.width, h: Math.min(box.height, 100) }) : null;
    const st = clip ? await analyseBuffer(page, await page.screenshot({ clip })) : null;

    // Composite the text over the measured surface before computing contrast.
    // Scoring rgba(255,255,255,.72) as pure white overstates the ratio by a
    // wide margin, which is exactly the case this check exists to catch.
    const parts = style.color.match(/[\d.]+/g)?.map(Number) || [0, 0, 0];
    const alpha = parts.length >= 4 ? parts[3] : 1;

    // Estimate the backdrop from the percentile on the far side of the median
    // from the text. Glyphs are always a minority of their own box, but on a
    // short label like an 11px eyebrow they can be a third of it — which drags
    // a plain median toward the ink and understates the real ratio.
    let bgL = null;
    let bgRGB = null;
    let fgL = null;
    if (st) {
      const textL = relativeLuma(parts[0], parts[1], parts[2]);
      const darkText = textL <= st.median;
      bgL = darkText ? st.p85 : st.p15;
      bgRGB = st.medianRGB;
      // Re-derive the surface colour at the chosen percentile by blending the
      // median toward the same side, so translucent ink composites correctly.
      const t = darkText ? 0.7 : 0.3;
      const toward = darkText ? st.p85 : st.p15;
      const scale = toward / Math.max(st.median, 1e-4);
      bgRGB = st.medianRGB.map((c) => Math.min(255, Math.round(c * (1 + (scale - 1) * t))));
      fgL = relativeLuma(
        alpha * parts[0] + (1 - alpha) * bgRGB[0],
        alpha * parts[1] + (1 - alpha) * bgRGB[1],
        alpha * parts[2] + (1 - alpha) * bgRGB[2]
      );
    } else {
      fgL = relativeLuma(parts[0], parts[1], parts[2]);
    }
    const ratio = bgL === null ? null : contrast(fgL, bgL);

    // WCAG: 3.0 for large text (>=24px, or >=18.66px bold), else 4.5.
    const isLarge = style.fontSize >= 24 || (style.fontWeight >= 700 && style.fontSize >= 18.66);
    const threshold = isLarge ? 3 : 4.5;
    const verdict =
      ratio === null ? "n/a" : ratio >= threshold ? "AA pass" : ratio >= threshold - 0.6 ? "borderline" : "FAIL";
    if (verdict === "FAIL") fails.push(t.label);

    console.log(
      t.label.padEnd(30) +
        `${style.fontSize}px/${style.fontWeight}`.padEnd(14) +
        (bgL === null ? "?" : bgL.toFixed(3)).padStart(8) +
        (ratio === null ? "?" : ratio.toFixed(2)).padStart(8) +
        `  ${verdict}${style.onOwnSurface ? " (own surface)" : ""}`
    );
  }

  const washed = rows.filter((r) => r.verdict === "washed out");
  const faint = rows.filter((r) => r.verdict === "faint");
  console.log(
    `\nbackdrops: ${rows.length - washed.length - faint.length} visible, ${faint.length} faint, ${washed.length} washed out`
  );
  console.log(`contrast:  ${fails.length} failing check(s)${fails.length ? ` -> ${fails.join(", ")}` : ""}`);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});