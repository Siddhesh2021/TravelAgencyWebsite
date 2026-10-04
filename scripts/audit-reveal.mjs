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
const ROUTES = ["/", "/trips", "/destinations", "/experiences", "/about", "/trips/kashmir", "/booking"];
const WIDTHS = [1440, 390];
const STEP = 600;
const SETTLE = 110;

const browser = await chromium.launch();
let defects = 0;

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