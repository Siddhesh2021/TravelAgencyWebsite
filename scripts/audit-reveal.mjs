/**
 * Reveal audit — guards against permanently invisible content.
 *
 * `.reveal-child` is `opacity: 0` in CSS and only `.reveal-parent.visible` restores it,
 * so any trigger that never fires leaves real content laid out but painted as nothing.
 * That has bitten this codebase twice: the /trips grid and the home trust-strip both
 * shipped with `reveal-child` markup and no observer attached.
 *
 * This walks every route at desktop and mobile, scrolls the full page so each observer
 * gets a chance to fire, then reports any `.reveal-child` that is still transparent or
 * has no revealed ancestor.
 *
 *   node scripts/audit-reveal.mjs [baseUrl]
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:5173";
const ROUTES = ["/", "/trips", "/reviews", "/contact", "/about", "/trips/kashmir", "/booking"];
// Retired routes. They must resolve to NotFound rather than silently rendering
// stale markup, so they are asserted instead of walked for reveal content.
const RETIRED = ["/destinations", "/experiences"];
const WIDTHS = [1440, 390];
const STEP = 600;
const SETTLE = 110;

const browser = await chromium.launch();
let defects = 0;

for (const route of RETIRED) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({
    notFound: (document.querySelector("h1")?.textContent ?? "").includes("doesn"),
    stale: document.querySelectorAll(".destination-page-card, .experience-grid, .region-grid, .quiz-graphic").length,
  }));
  if (r.notFound && r.stale === 0) {
    console.log(`  PASS  ${route.padEnd(14)} retired -> NotFound, no stale markup`);
  } else {
    defects++;
    console.log(`  FAIL  ${route.padEnd(14)} retired -> notFound:${r.notFound} staleMarkup:${r.stale}`);
  }
  await page.close();
}

for (const width of WIDTHS) {
  console.log(`\n########## ${width}px ##########`);
  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: { width, height: width <= 390 ? 844 : 900 } });
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= height; y += STEP) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(SETTLE);
    }
    await page.waitForTimeout(900);

    const result = await page.evaluate(() => {
      const bad = [];
      document.querySelectorAll(".reveal-child").forEach((el) => {
        const parent = el.closest(".reveal-parent");
        const opacity = getComputedStyle(el).opacity;
        if (!parent) bad.push({ why: "no .reveal-parent ancestor", cls: el.className.toString().slice(0, 50), opacity });
        else if (!parent.classList.contains("visible")) bad.push({ why: "parent never revealed", cls: el.className.toString().slice(0, 50), opacity });
        else if (parseFloat(opacity) < 0.05) bad.push({ why: "revealed but still transparent", cls: el.className.toString().slice(0, 50), opacity });
      });
      return {
        children: document.querySelectorAll(".reveal-child").length,
        bad,
      };
    });

    if (!result.bad.length) {
      console.log(`  PASS  ${route.padEnd(14)} ${result.children} reveal-child elements visible`);
    } else {
      console.log(`  FAIL  ${route.padEnd(14)} ${result.bad.length} invisible`);
      for (const b of new Map(result.bad.map((b) => [b.why + b.cls, b])).values()) {
        defects++;
        console.log(`          opacity=${b.opacity}  ${b.why}  ::  ${b.cls}`);
      }
    }
    await page.close();
  }
}

console.log(`\n=== ${defects} invisible-content defect(s) ===`);
await browser.close();
process.exit(defects ? 1 : 0);