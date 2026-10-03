/**
 * Page-by-page screenshot capture for the Roamly site.
 *
 * Produces two kinds of shot per route:
 *   <route>-NN-<label>.png  viewport-sized filmstrip frames taken at successive
 *                           scroll offsets (an accurate view of what a user sees)
 *   <route>-full.png        a single full-page capture for quick comparison
 *
 * The whole page is scrolled once up front so IntersectionObserver reveals fire
 * and the fixed ScrollBackdrop reaches its final slide. Reveals unobserve after
 * firing, so content stays visible for the frames that follow.
 *
 * Usage: node scripts/screenshot.mjs [baseUrl] [outDir]
 */

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.argv[2] || "http://localhost:8443";
const OUT_DIR = path.resolve(process.argv[3] || "screenshots");

const VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/trips", name: "trips" },
  { path: "/destinations", name: "destinations" },
  { path: "/experiences", name: "experiences" },
  { path: "/about", name: "about" },
  { path: "/trips/kashmir", name: "trip-detail-kashmir" },
  { path: "/booking", name: "booking" },
  { path: "/this-route-does-not-exist", name: "404" },
];

/** Scrolls the whole page in viewport-sized steps, then returns to the top. */
async function primeScroll(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    const total = document.documentElement.scrollHeight;
    // Two passes: the first fires the reveals, the second settles the
    // scroll-driven backdrop crossfade and any lazy images.
    for (let pass = 0; pass < 2; pass++) {
      for (let y = 0; y <= total; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
      }
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
}

/** Waits until every <img> in the document has finished decoding. */
async function settleImages(page) {
  await page
    .evaluate(async () => {
      const imgs = Array.from(document.images);
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
            // Cap the wait so one dead CDN request cannot stall the run.
            setTimeout(resolve, 4000);
          });
        })
      );
    })
    .catch(() => {});
}

/** How many filmstrip frames fit on this page. */
async function frameCount(page) {
  return page.evaluate(() => {
    const h = document.documentElement.scrollHeight;
    return Math.max(1, Math.min(14, Math.ceil(h / (window.innerHeight * 0.8))));
  });
}

async function scrollTo(page, index, frames) {
  await page.evaluate(
    ({ index, frames }) => {
      const step = window.innerHeight * 0.8;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(max, index * step));
    },
    { index, frames }
  );
  // Let the reveal transition and any parallax settle before capturing.
  await page.waitForTimeout(650);
}

async function captureRoute(context, route, { viewport, suffix, label }) {
  const page = await context.newPage();
  await page.setViewportSize(viewport);

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

  const url = `${BASE_URL}${route.path}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  await settleImages(page);
  await primeScroll(page);

  const frames = await frameCount(page);
  for (let i = 0; i < frames; i++) {
    await scrollTo(page, i, frames);
    const file = path.join(OUT_DIR, `${route.name}${suffix}-${String(i + 1).padStart(2, "0")}.png`);
    await page.screenshot({ path: file });
    process.stdout.write(`  ${path.basename(file)}\n`);
  }

  // Single tall capture. Animations off so the stagger does not land mid-frame.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const fullFile = path.join(OUT_DIR, `${route.name}${suffix}-full.png`);
  await page.screenshot({ path: fullFile, fullPage: true, animations: "disabled" });
  process.stdout.write(`  ${path.basename(fullFile)}\n`);

  const metrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    images: document.images.length,
    brokenImages: Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0).length,
  }));

  await page.close();
  return { route: route.name, url, frames, viewport: label, metrics, consoleErrors };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const results = [];

  const desktop = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  for (const route of ROUTES) {
    process.stdout.write(`\n${route.name} (desktop)\n`);
    try {
      results.push(await captureRoute(desktop, route, { viewport: VIEWPORT, suffix: "", label: "desktop" }));
    } catch (err) {
      process.stdout.write(`  FAILED: ${err.message}\n`);
      results.push({ route: route.name, url: `${BASE_URL}${route.path}`, error: err.message });
    }
  }
  await desktop.close();

  // Mobile pass over the primary routes only.
  const mobile = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  for (const route of ROUTES.slice(0, 4)) {
    process.stdout.write(`\n${route.name} (mobile)\n`);
    try {
      results.push(
        await captureRoute(mobile, route, { viewport: MOBILE_VIEWPORT, suffix: "-mobile", label: "mobile" })
      );
    } catch (err) {
      process.stdout.write(`  FAILED: ${err.message}\n`);
      results.push({ route: route.name, viewport: "mobile", error: err.message });
    }
  }
  await mobile.close();

  await browser.close();

  await writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify(results, null, 2));

  const failures = results.filter((r) => r.error);
  const broken = results.filter((r) => r.metrics?.brokenImages);
  process.stdout.write(`\n${results.length} routes captured -> ${OUT_DIR}\n`);
  if (failures.length) process.stdout.write(`${failures.length} route(s) errored\n`);
  if (broken.length) {
    process.stdout.write(
      `broken images: ${broken.map((r) => `${r.route}(${r.metrics.brokenImages}/${r.metrics.images})`).join(", ")}\n`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});