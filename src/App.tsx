import { CSSProperties, FormEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createBrowserRouter, RouterProvider, useLocation, useNavigate } from "react-router";
import { I18nProvider, LanguageSelector } from "./i18n";

const images = {
  hero: "https://images.unsplash.com/photo-1627894485200-b92fb4353967?auto=format&fit=crop&w=2200&q=88",
  kashmir: "https://images.unsplash.com/photo-1569852837227-1d0d3af93456?auto=format&fit=crop&w=1200&q=84",
  ladakh: "https://images.unsplash.com/photo-1558187424-f786111643b0?auto=format&fit=crop&w=1200&q=84",
  meghalaya: "https://images.unsplash.com/photo-1742494267580-e026d3737f65?auto=format&fit=crop&w=1200&q=84",
  kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=84",
  rajasthan: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=84",
  himachal: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1200&q=84",
  goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=84",
  uttarakhand: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=84",
  group: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1200&q=84",
  friends: "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=1200&q=84",
  trek: "https://images.unsplash.com/photo-1548957175-84f0f9af659e?auto=format&fit=crop&w=1200&q=84",
};

/* Backdrops use wider, lower-quality crops than content images — they sit
   behind a scrim, so extra detail would be wasted bandwidth. */
const backdrops = {
  hero: "https://images.unsplash.com/photo-1627894485200-b92fb4353967?auto=format&fit=crop&w=1800&q=60",
  kashmir: "https://images.unsplash.com/photo-1569852837227-1d0d3af93456?auto=format&fit=crop&w=1800&q=55",
  ladakh: "https://images.unsplash.com/photo-1558187424-f786111643b0?auto=format&fit=crop&w=1800&q=55",
  meghalaya: "https://images.unsplash.com/photo-1742494267580-e026d3737f65?auto=format&fit=crop&w=1800&q=55",
  kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1800&q=55",
  rajasthan: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1800&q=55",
  himachal: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1800&q=55",
  goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1800&q=55",
  uttarakhand: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1800&q=55",
  group: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1800&q=55",
  trek: "https://images.unsplash.com/photo-1548957175-84f0f9af659e?auto=format&fit=crop&w=1800&q=55",
};

interface Trip {
  id: string;
  name: string;
  line: string;
  duration: string;
  date: string;
  priceInr: number;
  badge: string;
  image: string;
  seats: string;
  category: string;
  rating: number;
  reviewsCount: number;
  trending?: boolean;
}

const trips: Trip[] = [
  { id: "kashmir", name: "Kashmir", line: "Valleys, lakes & mountain villages", duration: "5D / 4N", date: "18–22 Oct", priceInr: 24999, badge: "Culture & nature", image: images.kashmir, seats: "12 seats left", category: "Culture", rating: 4.9, reviewsCount: 128, trending: true },
  { id: "ladakh", name: "Ladakh", line: "High-altitude roads & unforgettable landscapes", duration: "7D / 6N", date: "24–30 Oct", priceInr: 34999, badge: "Adventure", image: images.ladakh, seats: "8 seats left", category: "Adventure", rating: 4.95, reviewsCount: 94, trending: true },
  { id: "meghalaya", name: "Meghalaya", line: "Waterfalls, caves & living root bridges", duration: "6D / 5N", date: "02–07 Nov", priceInr: 27999, badge: "Slow travel", image: images.meghalaya, seats: "15 seats left", category: "Solo-friendly", rating: 4.88, reviewsCount: 82 },
  { id: "kerala", name: "Kerala", line: "Backwaters, beaches & slow travel", duration: "5D / 4N", date: "09–13 Nov", priceInr: 21999, badge: "Coastal", image: images.kerala, seats: "Filling fast", category: "Weekend", rating: 4.92, reviewsCount: 110 },
  { id: "rajasthan", name: "Rajasthan", line: "Forts, deserts & royal cities", duration: "6D / 5N", date: "16–21 Nov", priceInr: 25999, badge: "Culture", image: images.rajasthan, seats: "10 seats left", category: "Culture", rating: 4.86, reviewsCount: 76 },
  { id: "himachal", name: "Himachal", line: "Mountains, forests & Himalayan towns", duration: "5D / 4N", date: "28 Nov–02 Dec", priceInr: 19999, badge: "Weekend+", image: images.himachal, seats: "6 seats left", category: "Weekend", rating: 4.91, reviewsCount: 145, trending: true },
];

const destinations = [
  ["Kashmir", "Alpine valleys & old Srinagar", images.kashmir, "5 Trips Available"],
  ["Ladakh", "High passes & quiet monasteries", images.ladakh, "4 Trips Available"],
  ["Himachal Pradesh", "Forest trails & mountain towns", images.himachal, "8 Trips Available"],
  ["Rajasthan", "Desert stories & royal cities", images.rajasthan, "6 Trips Available"],
  ["Kerala", "Backwaters & a slower rhythm", images.kerala, "5 Trips Available"],
  ["Meghalaya", "Rainforests & hidden falls", images.meghalaya, "3 Trips Available"],
  ["Goa", "Coastal roads & old quarters", images.goa, "4 Trips Available"],
  ["Uttarakhand", "Sacred towns & Himalayan trails", images.uttarakhand, "7 Trips Available"],
];

const currencies: Record<string, { symbol: string; rate: number; label: string }> = {
  INR: { symbol: "₹", rate: 1, label: "INR (₹)" },
  USD: { symbol: "$", rate: 0.012, label: "USD ($)" },
  EUR: { symbol: "€", rate: 0.011, label: "EUR (€)" },
  GBP: { symbol: "£", rate: 0.0095, label: "GBP (£)" },
};

function formatPrice(amountInr: number, currency = "INR") {
  const curr = currencies[currency] || currencies.INR;
  const converted = Math.round(amountInr * curr.rate);
  return `${curr.symbol}${converted.toLocaleString("en-IN")}`;
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    chevron: <path d="m8 10 4 4 4-4" />,
    calendar: <><path d="M6 3v3M18 3v3M4 8h16" /><rect x="4" y="5" width="16" height="16" rx="2" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    users: <><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    star: <path d="m12 2 3 6 7 .9-5 4.8 1.2 6.8L12 17.3l-6.2 3.2L7 13.7 2 8.9 9 8Z" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" /></>,
    mountain: <><path d="m3 20 7-12 4 7 2-3 5 8Z" /><path d="m8 11 2 2 2-2" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15 9-2 5-5 2 2-5Z" /></>,
    sparkles: <path d="m12 3 1.9 5.5L19 10l-5.1 1.5L12 17l-1.9-5.5L5 10l5.1-1.5zM19 17l.9 2.5L22 20l-2.1.5L19 23l-.9-2.5L16 20l2.1-.5z" />,
    heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
    play: <polygon points="6 3 20 12 6 21 6 3" />,
    message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
  };
  return <svg aria-hidden="true" className="icon" fill="none" height={size} viewBox="0 0 24 24" width={size}>{paths[name] || paths.arrow}</svg>;
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <button className={`logo ${inverse ? "logo--inverse" : ""}`} onClick={() => navigateTo("/")} aria-label="Swati The Travel Queen — home">
      <span className="logo-mark">
        {/* Circular crop of the supplied artwork, transparent outside the disc.
            alt is empty because the button already carries the full name. */}
        <img src="/logo-mark.webp" alt="" width={36} height={36} decoding="async" />
      </span>
      {/* Two-line lockup: the name is far longer than the old wordmark, so a
          single line at header scale would crowd out the centred nav. */}
      <span className="logo-type">
        <span className="logo-name">Swati</span>
        <span className="logo-sub">The Travel Queen</span>
      </span>
    </button>
  );
}

let globalNavigate: ((path: string) => void) | null = null;
function navigateTo(path: string) { globalNavigate?.(path); }

/* ─── INTERACTION HOOKS ─── */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Reveal engine for the whole app.
 *
 * `.reveal-child` is unconditionally `opacity: 0` in CSS and only `.reveal-parent.visible`
 * can bring it back, so a trigger that never fires hides content permanently. Observing each
 * parent per-component made that failure silent and easy to hit: `<section className="trust-strip
 * reveal-parent">` and the /trips grid both carried `.reveal-child` markup with no observer
 * attached, and their content simply never painted. Here `.reveal-parent` owns its own
 * trigger, so any element carrying the class reveals whether it was written as `<Reveal>` or
 * hand-authored — the class stops depending on a developer remembering an extra step.
 */
function useRevealParents() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const seenRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const seen = seenRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("visible");
          seen.delete(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observerRef.current = observer;
    return () => {
      observer.disconnect();
      seen.clear();
      observerRef.current = null;
    };
  }, []);

  // Re-scan after every commit. Running on each render rather than only on route change
  // catches parents that mount late (filtered results, expanded panels) without the cost
  // of a scroll listener; the Set keeps it idempotent, so repeat scans are cheap.
  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;
    const scan = () => {
      const seen = seenRef.current;
      // forget nodes that left the document so the Set cannot grow without bound
      for (const el of seen) {
        if (el.isConnected) continue;
        observer.unobserve(el);
        seen.delete(el);
      }
      document.querySelectorAll(".reveal-parent:not(.visible)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        observer.observe(el);
      });
    };
    scan();
    const frame = requestAnimationFrame(scan);
    return () => cancelAnimationFrame(frame);
  });
}

/** Wrapper that reveals itself and cascades `--i` to `.reveal-child` descendants. */
function Reveal({
  children,
  className = "",
  variant = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  variant?: "left" | "right" | "scale" | "clip" | "";
  style?: CSSProperties;
}) {
  const classes = ["reveal-parent", "reveal", variant ? `reveal--${variant}` : "", className].filter(Boolean).join(" ");
  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}

/**
 * Magnetic pull toward the cursor, plus the edge "lift" on enter/leave.
 * Strength ramps with proximity so buttons feel attached, not glued.
 */
function useMagnetic<T extends HTMLElement>(strength = 0.32) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    // Coarse pointers (touch) have no cursor to follow.
    if (window.matchMedia("(hover: none)").matches) return;

    let frame = 0;
    const move = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = node.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        node.classList.add("magnetic-locked");
        node.style.transform = `translate3d(${relX * strength}px, ${relY * strength}px, 0)`;
      });
    };
    const leave = () => {
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      node.classList.remove("magnetic-locked");
      node.style.transform = "";
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  }, [strength, reduced]);

  return ref;
}

/**
 * Combined card motion: pointer-tracked spotlight vars (`--mx` / `--my`) plus an
 * optional 3D tilt written as `--tilt-x` / `--tilt-y`.
 *
 * The tilt is written as custom properties rather than `transform` so the
 * `.tilt` rule in CSS can compose it with each component's own `--lift`
 * hover offset. One pointer listener drives both.
 */
function useCardMotion<T extends HTMLElement>(tilt = 3.5) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let frame = 0;
    let rx = 0;
    let ry = 0;
    let mx = 50;
    let my = 50;

    const paint = () => {
      frame = 0;
      if (tilt > 0) {
        node.style.setProperty("--tilt-x", `${rx.toFixed(2)}deg`);
        node.style.setProperty("--tilt-y", `${ry.toFixed(2)}deg`);
      }
      node.style.setProperty("--mx", `${mx.toFixed(1)}%`);
      node.style.setProperty("--my", `${my.toFixed(1)}%`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };

    const move = (e: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width) * 100;
      my = ((e.clientY - rect.top) / rect.height) * 100;
      if (tilt > 0) {
        ry = (mx / 100 - 0.5) * tilt * 2;
        rx = -(my / 100 - 0.5) * tilt * 2;
      }
      schedule();
    };
    const leave = () => {
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      rx = 0;
      ry = 0;
      if (tilt > 0) {
        node.style.setProperty("--tilt-x", "0deg");
        node.style.setProperty("--tilt-y", "0deg");
      }
    };

    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  }, [tilt, reduced]);

  return ref;
}

/** Counts up to `value` once scrolled into view. Keeps any non-numeric affix. */
function CountUp({ value, affix = "", decimals = 0 }: { value: number; affix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = useReducedMotionSafe();
    if (reduced) {
      node.textContent = `${value.toFixed(decimals)}${affix}`;
      return;
    }

    let raf = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      const duration = 1500;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // expo-out so it decelerates instead of ticking linearly
        const eased = 1 - Math.pow(2, -10 * t);
        node.textContent = `${(value * eased).toFixed(decimals)}${affix}`;
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.5 });

    observer.observe(node);
    return () => { observer.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [value, affix, decimals]);

  return <span className="count" ref={ref}>{`${value.toFixed(decimals)}${affix}`}</span>;
}

// Reads reduced-motion without subscribing to changes (one-shot, inside effect)
function useReducedMotionSafe() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Vertical parallax offset driven by scroll position, written to a CSS var. */
function useParallax<T extends HTMLElement>(amount = 0.14) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.bottom < -200 || rect.top > viewport + 200) return;
      // -1 at the top of the viewport, +1 at the bottom
      const progress = (rect.top + rect.height / 2 - viewport / 2) / (viewport / 2);
      node.style.setProperty("--parallax", `${progress * amount * 100}px`);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [amount, reduced]);

  return ref;
}

function Button({ children, variant = "primary", icon, onClick, type = "button", className = "", magnetic = true }: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "light" | "text" | "glow";
  icon?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  magnetic?: boolean;
}) {
  const magnetRef = useMagnetic<HTMLButtonElement>(magnetic ? 0.28 : 0);
  return (
    <button
      type={type}
      ref={magnetic ? magnetRef : undefined}
      className={`btn btn--${variant} ${magnetic ? "magnetic" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
      {icon && <Icon name={icon} size={18} />}
    </button>
  );
}

/* ─── PHOTO BACKDROP SYSTEM ─── */

/**
 * Full-bleed photo behind a section, with a scroll-linked parallax offset and
 * a scrim strong enough for body copy. Beats a multi-stop gradient because the
 * background carries actual place information.
 */
function PhotoBackdrop({
  src,
  variant = "",
  className = "",
  parallax = 0.12,
  children,
}: {
  src: string;
  variant?: "deep" | "warm" | "";
  className?: string;
  parallax?: number;
  children?: ReactNode;
}) {
  const parallaxRef = useParallax<HTMLDivElement>(parallax);
  const classes = ["photo-bg", variant ? `photo-bg--${variant}` : "", className].filter(Boolean).join(" ");
  return (
    <div ref={parallaxRef} className={classes}>
      <img src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" style={{ transform: "translate3d(0, var(--parallax, 0px), 0) scale(1.04)" }} />
      {children}
    </div>
  );
}

/**
 * Fixed, page-wide backdrop that crossfades between photos as you scroll.
 * The layer is oversized by 12% on each axis so the parallax translate never
 * exposes an edge.
 */
function ScrollBackdrop() {
  const [bgIndex, setBgIndex] = useState(0);
  const layerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const bgImages = [
    backdrops.hero,
    backdrops.kashmir,
    backdrops.ladakh,
    backdrops.meghalaya,
    backdrops.kerala,
    backdrops.rajasthan,
    backdrops.himachal,
  ];

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0) {
          const fraction = Math.min(0.999, Math.max(0, scrollY / maxScroll));
          setBgIndex(Math.floor(fraction * bgImages.length));
        }
        // Counter-parallax: layer drifts down as the page scrolls up past it
        if (layerRef.current) {
          layerRef.current.style.setProperty("--bg-shift", `${-scrollY * 0.06}px`);
        }
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [bgImages.length]);

  return (
    <div className="scroll-bg-wrap" aria-hidden="true">
      <div
        className="scroll-bg-layer"
        ref={layerRef}
        style={reduced ? undefined : { transform: "translate3d(0, var(--bg-shift, 0px), 0)" }}
      >
        {bgImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={bgIndex === i ? "active" : ""}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
      </div>
      <div className="scroll-bg-overlay" />
      <div className="scroll-bg-grain" />
      <div className="scroll-bg-vignette" />
    </div>
  );
}

/** Tracks pointer position over the hero for the spotlight wash. */
function HeroSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    const hero = node?.parentElement;
    if (!node || !hero || reduced) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let frame = 0;
    const move = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = hero.getBoundingClientRect();
        node.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
        node.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
      });
    };
    hero.addEventListener("pointermove", move);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", move);
    };
  }, [reduced]);

  return <div className="hero-spotlight" ref={ref} />;
}

function Header({ onMenu, currentPath, onOpenSearch, currency, onCurrencyChange }: { onMenu: () => void; currentPath: string; onOpenSearch: () => void; currency: string; onCurrencyChange: (c: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<HTMLSpanElement>(null);

  const links = [
    ["Explore Trips", "/trips"],
    ["Destinations", "/destinations"],
    ["Experiences", "/experiences"],
    ["About Us", "/about"],
  ];

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled(y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      // Write straight to the DOM — no React render on every scroll frame
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${ratio})`;
      setProgress(ratio);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      <div className="shell header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, path]) => (
            <button className={currentPath === path ? "active" : ""} key={path} onClick={() => navigateTo(path)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <LanguageSelector />
          <div className="currency-selector">
            <select value={currency} onChange={(e) => onCurrencyChange(e.target.value)} aria-label="Select Currency">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <button className="icon-button search-button" aria-label="Search journeys" onClick={onOpenSearch}>
            <Icon name="search" />
            <span className="kbd-hint">⌘K</span>
          </button>
          <button className="login" onClick={() => navigateTo("/booking")}>My Trips</button>
          <Button onClick={() => navigateTo("/trips")} icon="arrow">Find a Trip</Button>
          <button className="icon-button menu-button" onClick={onMenu} aria-label="Open menu">
            <Icon name="menu" />
          </button>
        </div>
      </div>
      <div className="header-progress" aria-hidden="true">
        <span ref={progressRef} style={{ transform: `scaleX(${progress})` }} />
      </div>
    </header>
  );
}

function SectionTitle({ eyebrow, title, copy, action }: { eyebrow?: string; title: string; copy?: string; action?: ReactNode }) {
  return (
    // No `reveal-parent` here: the children are `.reveal` in their own right and there are no
    // `.reveal-child` descendants, so the class would be decorative.
    <div className="section-heading">
      <Reveal>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {copy && <p className="section-copy">{copy}</p>}
      </Reveal>
      {action && <Reveal variant="right">{action}</Reveal>}
    </div>
  );
}

function TripCard({ trip, currency = "INR", onFavorite, isFav = false, index = 0 }: { trip: Trip; currency?: string; onFavorite?: (id: string) => void; isFav?: boolean; index?: number }) {
  const cardRef = useCardMotion<HTMLElement>(3.5);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(trip.id);
  };

  return (
    <article className="trip-card tilt spotlight reveal-child" ref={cardRef} style={{ ["--i" as string]: index }}>
      <div className="trip-image-wrap" role="button" tabIndex={0} onClick={() => navigateTo(`/trips/${trip.id}`)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigateTo(`/trips/${trip.id}`); } }} aria-label={`View ${trip.name} trip`}>
        <img src={trip.image} alt={`${trip.name} landscape`} className="trip-image" loading="lazy" decoding="async" />
        <span className="image-shade" />
        <span className="badge badge--light">{trip.badge}</span>
        {trip.trending && <span className="badge badge--amber badge--trending"><Icon name="sparkles" size={13} /> Trending</span>}
        {onFavorite && (
          <button
            type="button"
            className={`card-fav-btn ${isFav ? "active" : ""}`}
            onClick={handleFavorite}
            aria-label={isFav ? `Remove ${trip.name} from saved` : `Save ${trip.name}`}
            aria-pressed={isFav}
          >
            <Icon name="heart" size={16} />
          </button>
        )}
      </div>
      <div className="trip-content">
        <div className="trip-top">
          <div>
            <p className="trip-location"><Icon name="pin" size={15} />{trip.name}</p>
            <h3>{trip.line}</h3>
          </div>
          <span className="availability"><i />{trip.seats}</span>
        </div>
        <div className="trip-meta">
          <span><Icon name="clock" size={16} />{trip.duration}</span>
          <span><Icon name="calendar" size={16} />{trip.date}</span>
          <span><Icon name="star" size={15} />{trip.rating} ({trip.reviewsCount})</span>
        </div>
        <div className="trip-footer">
          <div className="price">
            <small>Starts at</small>
            <strong>{formatPrice(trip.priceInr, currency)}</strong>
            <small>/ person</small>
          </div>
          <Button variant="text" icon="arrow" onClick={() => navigateTo(`/trips/${trip.id}`)}>View Trip</Button>
        </div>
      </div>
    </article>
  );
}

function SearchModal({ isOpen, onClose, onSelectTrip }: { isOpen: boolean; onClose: () => void; onSelectTrip: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = trips.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.line.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal-card" onClick={e => e.stopPropagation()}>
        <div className="search-modal-head">
          <Icon name="search" size={22} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search trips, destinations, e.g. Kashmir, Ladakh, Weekend..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="icon-button" onClick={onClose} aria-label="Close search">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="search-modal-results">
          <p className="eyebrow" style={{ padding: "0 16px 8px" }}>
            {query ? `Results (${filtered.length})` : "Popular Curated Departures"}
          </p>
          <div className="search-results-list">
            {(query ? filtered : trips.slice(0, 4)).map(t => (
              <button
                key={t.id}
                className="search-result-item"
                onClick={() => { onSelectTrip(t.id); onClose(); }}
              >
                <img src={t.image} alt="" />
                <div>
                  <strong>{t.name} — {t.line}</strong>
                  <span>{t.duration} · {t.badge} · Starts at ₹{t.priceInr.toLocaleString("en-IN")}</span>
                </div>
                <Icon name="arrow" size={16} />
              </button>
            ))}
          </div>
        </div>
        <div className="search-modal-foot">
          <span>Tip: Press ESC to close</span>
          <button className="btn btn--text" onClick={() => { navigateTo("/trips"); onClose(); }}>
            View All 48 Journeys →
          </button>
        </div>
      </div>
    </div>
  );
}

function TripQuizModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const questions = [
    { q: "What's your ideal escape vibe?", options: ["Snowy peaks & chai pauses", "Lush rainforests & waterfalls", "Royal palaces & dunes", "Quiet coastal backwaters"] },
    { q: "How long do you want to travel?", options: ["Quick Weekend (2–3 days)", "Sweet Spot (4–6 days)", "Full Adventure (7–10 days)"] },
    { q: "Who are you travelling with?", options: ["Solo traveller joining a group", "With partner / close friend", "Small squad of friends"] },
  ];

  if (!isOpen) return null;

  const handlePick = (option: string) => {
    const nextAnswers = [...answers, option];
    setAnswers(nextAnswers);
    if (step < questions.length - 1) {
      setStep(s => s + 1);
    } else {
      setStep(3); // Result
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers([]);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="quiz-modal-card" onClick={e => e.stopPropagation()}>
        <div className="quiz-modal-head">
          <div className="quiz-badge"><Icon name="sparkles" size={15} /> 60-Second Trip Matcher</div>
          <button className="icon-button" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>

        {step < questions.length ? (
          <div className="quiz-modal-body">
            <span className="quiz-step-num">Step 0{step + 1} of 03</span>
            <h2>{questions[step].q}</h2>
            <div className="quiz-options-grid">
              {questions[step].options.map(opt => (
                <button key={opt} className="quiz-option-btn" onClick={() => handlePick(opt)}>
                  <span>{opt}</span>
                  <Icon name="arrow" size={16} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="quiz-result-view">
            <div className="quiz-matched-tag">✨ Perfect Match Found</div>
            <h2>Kashmir Valley & Alpine Lakes</h2>
            <p>Based on your preference for <strong>{answers[0]}</strong> over <strong>{answers[1]}</strong>, this curated journey is your exact frequency.</p>
            <div className="matched-trip-card">
              <img src={images.kashmir} alt="Kashmir" />
              <div>
                <strong>Kashmir — The Great Valley Escape</strong>
                <span>5 Days · 4.9 ★ (124 reviews) · Starts ₹24,999</span>
              </div>
            </div>
            <div className="quiz-result-actions">
              <Button onClick={() => { navigateTo("/trips/kashmir"); onClose(); }} icon="arrow">View Itinerary & Reserve</Button>
              <Button variant="secondary" onClick={resetQuiz}>Retake Matcher</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReelPlayerModal({ reel, onClose }: { reel: { title: string; copy: string; image: string; views: string } | null; onClose: () => void }) {
  const [liked, setLiked] = useState(false);
  if (!reel) return null;

  return (
    <div className="reel-modal-backdrop" onClick={onClose}>
      <div className="reel-modal-card" onClick={e => e.stopPropagation()}>
        <img src={reel.image} alt={reel.title} className="reel-modal-bg" />
        <div className="reel-modal-overlay" />
        <button className="reel-modal-close" onClick={onClose}><Icon name="close" size={20} /></button>
        <div className="reel-modal-controls">
          <div className="reel-modal-info">
            <span className="reel-tag"><Icon name="instagram" size={14} /> Travel Queen Moments</span>
            <h3>{reel.title}</h3>
            <p>{reel.copy}</p>
            <div className="reel-stats-bar">
              <span>{reel.views} travellers watched</span>
            </div>
          </div>
          <div className="reel-actions-column">
            <button className={`reel-action-btn ${liked ? "active" : ""}`} onClick={() => setLiked(!liked)}>
              <Icon name="heart" size={20} />
              <small>{liked ? "Liked" : "Like"}</small>
            </button>
            <button className="reel-action-btn" onClick={() => { navigateTo("/trips/kashmir"); onClose(); }}>
              <Icon name="compass" size={20} />
              <small>Trip</small>
            </button>
          </div>
        </div>
        <div className="reel-modal-cta">
          <Button onClick={() => { navigateTo("/trips/kashmir"); onClose(); }} icon="arrow">
            Explore This Journey
          </Button>
        </div>
      </div>
    </div>
  );
}

function FloatingConcierge() {
  const [open, setOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hi there! 👋 I'm Arjun from the Swati The Travel Queen trip team. Looking for solo trips, packing guides, or custom group departures?" }
  ]);
  const [inputVal, setInputVal] = useState("");

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const userMsg = inputVal;
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInputVal("");
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: "bot", text: "Got it! Our trip captains host small departures (12-18 travellers) with verified stays and 24/7 support. You can reserve with just 25% deposit." }
      ]);
    }, 900);
  };

  return (
    <div className="floating-concierge-wrap">
      {open ? (
        <div className="concierge-chat-window">
          <div className="concierge-head">
            <div className="concierge-lead-avatar">
              <img src={images.friends} alt="Trip Lead" />
              <span className="online-dot" />
            </div>
            <div>
              <strong>Arjun &amp; The Travel Queen Team</strong>
              <small>Trip Captains · Online</small>
            </div>
            <button className="icon-button" onClick={() => setOpen(false)}><Icon name="close" size={16} /></button>
          </div>
          <div className="concierge-messages">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-bubble chat-bubble--${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <form className="concierge-input-form" onSubmit={send}>
            <input
              type="text"
              placeholder="Ask anything about dates, stays..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
            />
            <button type="submit" aria-label="Send message"><Icon name="arrow" size={16} /></button>
          </form>
        </div>
      ) : (
        <button className="concierge-trigger-btn" onClick={() => setOpen(true)} aria-label="Chat with trip leader">
          <Icon name="message" size={20} />
          <span>Ask a Trip Captain</span>
        </button>
      )}
    </div>
  );
}

function SearchModule({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const [dest, setDest] = useState("");
  const [month, setMonth] = useState("");
  const [type, setType] = useState("");

  const handleSearchSubmit = () => {
    if (dest) {
      navigateTo("/trips/kashmir");
    } else {
      document.querySelector("#trips")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="search-module">
      <label>
        <span><Icon name="pin" size={18} />Where do you want to go?</span>
        <select value={dest} onChange={e => setDest(e.target.value)}>
          <option value="">Choose a destination</option>
          <option value="kashmir">Kashmir (Dal Lake & Valleys)</option>
          <option value="ladakh">Ladakh (High Passes)</option>
          <option value="meghalaya">Meghalaya (Root Bridges)</option>
          <option value="kerala">Kerala (Backwaters)</option>
          <option value="rajasthan">Rajasthan (Royal Deserts)</option>
          <option value="himachal">Himachal (Forest Trails)</option>
        </select>
      </label>
      <label>
        <span><Icon name="calendar" size={18} />When?</span>
        <select value={month} onChange={e => setMonth(e.target.value)}>
          <option value="">Any upcoming month</option>
          <option value="oct">October 2025</option>
          <option value="nov">November 2025</option>
          <option value="dec">December 2025</option>
          <option value="newyear">New Year Special</option>
        </select>
      </label>
      <label>
        <span><Icon name="compass" size={18} />Trip type</span>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="">All experiences</option>
          <option value="group">Group trips (12–18 travellers)</option>
          <option value="adventure">High-altitude Adventure</option>
          <option value="culture">Culture & Local Stories</option>
          <option value="weekend">Weekend Getaways (3–4 days)</option>
        </select>
      </label>
      <Button icon="arrow" onClick={handleSearchSubmit}>
        Explore Trips
      </Button>
    </div>
  );
}

function HomePage({ currency = "INR", onOpenQuiz, onOpenReel }: { currency?: string; onOpenQuiz: () => void; onOpenReel: (r: any) => void }) {
  const [openFaq, setOpenFaq] = useState(0);
  const [toast, setToast] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFav = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  function subscribe(e: FormEvent) {
    e.preventDefault();
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  }

  return (
    <main>
      <section className="hero">
        <img src={images.hero} alt="Traveller overlooking the mountains of Kashmir" fetchPriority="high" />
        <div className="hero-shade" />
        <HeroSpotlight />
        <div className="shell hero-inner">
          <div className="hero-copy">
            <div className="hero-pill-badge">
              <span className="live-pulse" />
              <span>Winter 2025/26 Departures Now Live</span>
            </div>
            <h1>Trips you’ll remember.<br />Stories you’ll keep.</h1>
            <p>Curated group journeys across India’s most awe-inspiring landscapes. Designed for people who want to experience more and plan zero.</p>
            <div className="hero-actions">
              <Button onClick={() => document.querySelector("#trips")?.scrollIntoView({ behavior: "smooth" })} icon="arrow">
                Explore Departures
              </Button>
              <Button variant="light" onClick={onOpenQuiz} icon="sparkles">
                Trip Style Matcher
              </Button>
            </div>
          </div>
          <SearchModule />
        </div>
      </section>

      <section className="trust-strip reveal-parent">
        <div className="shell trust-grid">
          {[
            [<CountUp value={5000} affix="+" />, "happy travellers"],
            [<CountUp value={100} affix="+" />, "trips completed"],
            [<><CountUp value={4.9} decimals={1} /> / 5</>, "traveller rating"],
            [<CountUp value={35} />, "states & UTs explored"],
            [<CountUp value={100} affix="%" />, "verified trip leaders"],
          ].map(([value, label], i) => (
            <div key={label as string} className="reveal-child" style={{ ["--i" as string]: i }}>
              {i === 2 && <Icon name="star" size={16} />}
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section shell" id="trips">
        <SectionTitle
          eyebrow="Curated departures"
          title="Where will you go next?"
          copy="Handpicked journeys across India, paced for genuine exploration with solo-friendly group vibes."
          action={<Button variant="secondary" icon="arrow" onClick={() => navigateTo("/trips")}>View all 48 trips</Button>}
        />
        <Reveal className="reveal-parent">
          <div className="trip-grid">
            {trips.map((trip, i) => (
              <TripCard
                key={trip.id}
                trip={trip}
                currency={currency}
                onFavorite={toggleFav}
                isFav={favorites.includes(trip.id)}
                index={i}
              />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section photo-bg section--tint" id="destinations">
        <img src={backdrops.himachal} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <div className="shell">
          <SectionTitle
            eyebrow="Explore by place"
            title="India, one journey at a time."
            copy="From high Himalayan mountain passes to silent emerald backwaters, find the horizon that calls you."
          />
          <Reveal className="reveal-parent">
            <div className="destination-grid">
              {destinations.map(([name, line, image, meta], i) => (
                <button
                  className={`destination-card destination-card--${i + 1} reveal-child spotlight spotlight--dark`}
                  key={name}
                  style={{ ["--i" as string]: i }}
                  onClick={() => navigateTo("/destinations")}
                >
                  <img src={image} alt={`${name} landscape`} loading="lazy" decoding="async" />
                  <span className="image-shade" />
                  <span className="destination-info">
                    <small>{line}</small>
                    <strong>{name}</strong>
                    <span className="destination-meta-pill">{meta}</span>
                    <span className="dest-explore-link">Explore <Icon name="arrow" size={16} /></span>
                  </span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <ScrollJourney />

      <section className="section shell" id="categories">
        <SectionTitle eyebrow="Find your kind of journey" title="Go for what moves you." />
        <Reveal className="reveal-parent">
          <div className="category-row">
            {[
              ["clock", "Weekend Getaways", "2–4 days"],
              ["compass", "Adventure", "For the wild-hearted"],
              ["mountain", "Mountains", "Higher perspectives"],
              ["star", "Cultural", "Stories & traditions"],
              ["users", "Group Trips", "Come solo, leave together"],
              ["shield", "Solo-Friendly", "Safe, social, supported"],
            ].map(([icon, title, line], i) => (
              <button className="category-card reveal-child" key={title} style={{ ["--i" as string]: i }} onClick={() => navigateTo("/trips")}>
                <span><Icon name={icon} /></span>
                <strong>{title}</strong>
                <small>{line}</small>
                <Icon name="arrow" size={18} />
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section process-section" id="process">
        <img src={backdrops.trek} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <div className="shell">
          <SectionTitle
            eyebrow="Simple by design"
            title="Four steps. Zero travel admin."
            copy="We handle every moving piece — stays, permits, local transport — so you stay present for the moments."
          />
          <Reveal className="reveal-parent">
            <div className="process-grid">
              {[
                ["01", "Choose your trip", "Browse transparent itineraries, confirmed departures, and honest all-inclusive prices."],
                ["02", "Reserve your seat", "Lock in your spot with just a 25% deposit. Zero credit card fees."],
                ["03", "Meet your travel group", "Join the verified group chat before you set off. Get custom packing notes."],
                ["04", "Travel, fully organized", "Stays, tempo traveller, boutique meals and dedicated trip leaders are all sorted."],
              ].map(([n, title, copy], i) => (
                <div className="process-step reveal-child" key={n} style={{ ["--i" as string]: i }}>
                  <span>{n}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section shell why-grid" id="why">
        <Reveal variant="left" className="why-image">
          <img src={images.group} alt="Friends travelling together in the mountains" loading="lazy" decoding="async" />
          <div className="why-stat">
            <strong>9 in 10</strong>
            <span>travellers book their next journey with us</span>
          </div>
        </Reveal>
        <Reveal variant="right" className="why-content">
          <p className="eyebrow">The Swati standard</p>
          <h2>Everything is planned.<br />You just show up.</h2>
          <p>Thoughtful trips, vetted boutique stays and zero fine-print surprises.</p>
          <div className="feature-list">
            {[
              ["Experienced trip leaders", "Local knowledge, logistics support, and a human point of contact throughout."],
              ["Transparent pricing", "No surprise costs or confusing hidden packages."],
              ["Small-group experiences", "Travel with people, not large bus tours (12–18 travellers max)."],
              ["Verified stays & transport", "Comfortable, clean, and handpicked local partner stays."],
              ["24/7 trip concierge support", "Peace of mind for you and your family back home."],
            ].map(([title, line], i) => (
              <div className="feature-item reveal-child" key={title} style={{ ["--i" as string]: i }}>
                <span><Icon name="check" size={17} /></span>
                <div>
                  <strong>{title}</strong>
                  <p>{line}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section stories-section">
        <img src={backdrops.meghalaya} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <div className="shell">
          <SectionTitle
            eyebrow="Traveller stories"
            title="Straight from the group chat."
            copy="Honest words from solo wanderers and friends who took the road with us."
          />
          <Reveal className="reveal-parent">
            <div className="story-grid">
              {[
                ["Aanya Mehta", "Mumbai", "Kashmir · May 2025", "Everything was planned flawlessly without ever feeling rigid. We had enough freedom to explore on our own while knowing all logistics were handled.", images.friends],
                ["Rohan Kapoor", "Bengaluru", "Ladakh · June 2025", "I arrived completely solo and left with a close-knit group of friends I’m still travelling with today. Our trip lead Arjun was incredible.", images.group],
                ["Mira Thomas", "Pune", "Meghalaya · July 2025", "The boutique stays felt so considered, the pacing was relaxing, and every waterfall felt more magical than any photograph could capture.", images.trek],
              ].map(([name, city, trip, quote, image], i) => (
                <article className="story-card reveal-child" key={name} style={{ ["--i" as string]: i }}>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((x) => <Icon name="star" size={15} key={x} />)}
                  </div>
                  <blockquote>“{quote}”</blockquote>
                  <div className="profile">
                    <img src={image} alt={`Portrait of ${name}`} loading="lazy" />
                    <div>
                      <strong>{name}</strong>
                      <span>{city} · {trip}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <ReelsSection onOpenReel={onOpenReel} />

      <section className="section shell social-section">
        <SectionTitle
          eyebrow="@swatithetravelqueen"
          title="See where our travellers are going."
          action={<Button variant="secondary" magnetic={false}><Icon name="instagram" size={18} />Follow on Instagram</Button>}
        />
        <Reveal className="reveal-parent">
          <div className="social-grid">
            {[images.kashmir, images.group, images.rajasthan, images.meghalaya, images.ladakh, images.kerala].map((img, i) => (
              <div key={img} className={`social-tile social-tile--${i + 1} reveal-child`} style={{ ["--i" as string]: i }}>
                <img src={img} alt="Swati The Travel Queen traveller moment" loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section upcoming-section">
        <img src={backdrops.ladakh} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <div className="shell">
          <SectionTitle
            eyebrow="Pack sooner"
            title="Upcoming guaranteed departures"
            copy="Limited seats, 100% confirmed dates and zero hidden surcharges."
          />
          <Reveal className="reveal-parent">
            <div className="departure-list">
              {trips.slice(0, 4).map((trip, i) => (
                <button className="departure-row reveal-child" key={trip.name} style={{ ["--i" as string]: i }} onClick={() => navigateTo(`/trips/${trip.id}`)}>
                  <div className="date-block">
                    <strong>{["18", "24", "02", "09"][i]}</strong>
                    <span>{i < 2 ? "OCT" : "NOV"}</span>
                  </div>
                  <img src={trip.image} alt="" loading="lazy" />
                  <div className="departure-place">
                    <strong>{trip.name}</strong>
                    <span>{trip.line}</span>
                  </div>
                  <span className="desktop-only">{trip.duration}</span>
                  <span className="departure-price">{formatPrice(trip.priceInr, currency)}<small>per person</small></span>
                  <span className="availability"><i />{trip.seats}</span>
                  <span className="round-arrow"><Icon name="arrow" size={18} /></span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section shell faq-section">
        <Reveal variant="left">
          <p className="eyebrow">Good to know</p>
          <h2>The questions everyone asks.</h2>
          <p>Still have queries about our group format, fitness requirements or payment options?</p>
          <Button variant="secondary" onClick={() => navigateTo("/about")}>Talk to a trip expert</Button>
        </Reveal>
        <Reveal variant="right">
          <div className="faq-list">
            {[
              ["Can I join a group trip solo?", "Absolutely. Around 65% of our travellers join solo. We curate welcoming, friendly groups and create an introductory WhatsApp group before departure so you feel right at home."],
              ["What is included in the trip price?", "Your verified boutique stays, private intercity transport, daily breakfast, guided cultural tours, permits, and a dedicated Swati The Travel Queen trip captain."],
              ["How large are the groups?", "Most departures have 12–18 travellers: large enough to be social and lively, small enough to remain intimate and flexible."],
              ["Can I pay in simple instalments?", "Yes! Reserve your seat with just a 25% deposit today, and clear the remaining balance up to 30 days before departure."],
            ].map(([q, a], i) => (
              <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={q}>
                <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}>
                  <strong>{q}</strong>
                  <Icon name="chevron" />
                </button>
                <div>
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="newsletter">
        <img src={backdrops.goa} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <div className="shell newsletter-inner">
          <Reveal variant="left">
            <p className="eyebrow eyebrow--light">Notes from the road</p>
            <h2>Your next trip starts in your inbox.</h2>
            <p>Get exclusive early-bird departures, secret route guides and limited-seat drops.</p>
          </Reveal>
          <Reveal variant="right">
            <form onSubmit={subscribe} noValidate>
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                aria-label="Email address"
                placeholder="Enter your email address"
                required
                onInvalid={(e) => {
                  const el = e.currentTarget;
                  if (el.validity.valueMissing) el.setCustomValidity("Enter your email address to subscribe.");
                  else el.setCustomValidity("That email address doesn't look right.");
                }}
                onInput={(e) => e.currentTarget.setCustomValidity("")}
              />
              <Button type="submit" icon="arrow">Subscribe</Button>
              <small>Zero spam. Unsubscribe anytime with one tap.</small>
            </form>
          </Reveal>
        </div>
      </section>

      <MobilePageCta />
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span><Icon name="check" /></span>
          <div>
            <strong>You’re on the list</strong>
            <small>Check your inbox for upcoming secret departure invites.</small>
          </div>
        </div>
      )}
    </main>
  );
}

function ReelsSection({ onOpenReel }: { onOpenReel?: (r: any) => void }) {
  const reels = [
    { title: "48 hours in Kashmir", copy: "Dal Lake shikara at 6:12 AM", image: images.kashmir, views: "128K" },
    { title: "Why strangers become friends", copy: "A Swati The Travel Queen group in Ladakh", image: images.group, views: "94K" },
    { title: "The road into Meghalaya", copy: "Rain, roots and hidden rivers", image: images.meghalaya, views: "81K" },
    { title: "Golden hour in Jaisalmer", copy: "Desert camp diaries under stars", image: images.rajasthan, views: "76K" },
  ];

  return (
    <section className="section reels-section">
      <img src={backdrops.goa} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <div className="shell">
        <SectionTitle
          eyebrow="Swati, in motion"
          title="Watch the journey unfold."
          copy="Raw moments, real groups, and the unscripted laughs that make every departure unforgettable."
          action={<Button variant="secondary" magnetic={false}><Icon name="instagram" size={18} />Watch all reels</Button>}
        />
        <Reveal className="reveal-parent">
          <div className="reels-track">
            {reels.map((reel, i) => (
              <button
                className="reel-card reveal-child spotlight spotlight--dark"
                key={reel.title}
                style={{ ["--i" as string]: i }}
                onClick={() => onOpenReel?.(reel)}
                aria-label={`Play reel: ${reel.title}`}
              >
                <img src={reel.image} alt={`${reel.title} still`} loading="lazy" decoding="async" />
                <span className="reel-shade" />
                <span className="reel-top"><Icon name="instagram" size={17} /> REEL</span>
                <span className="reel-play"><Icon name="play" size={20} /></span>
                <span className="reel-copy">
                  <small>{reel.views} plays</small>
                  <strong>{reel.title}</strong>
                  <span>{reel.copy}</span>
                </span>
                <span className="reel-index">0{i + 1}</span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ScrollJourney() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const chapters = [
    ["01", "Wake up above the clouds", "Ladakh", "Cross high passes with a seasoned trip leader who knows the quietest chai points and safest mountain routes.", images.ladakh],
    ["02", "Follow the rain into the forest", "Meghalaya", "Walk living root bridges, swim in crystal turquoise pools and let the Northeast reveal itself at an unhurried pace.", images.meghalaya],
    ["03", "Slow down by the backwaters", "Kerala", "Trade bustling schedules for quiet backwater houseboats, coastal spices and mornings that start whenever you're ready.", images.kerala],
    ["04", "End the day under desert constellations", "Rajasthan", "Wander ancient golden forts and open desert dunes with authentic stories that bring history to life.", images.rajasthan],
  ];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = Number((entry.target as HTMLElement).dataset.index);
          if (!isNaN(idx)) setActive(idx);
        }
      });
    }, { rootMargin: "-35% 0px -35% 0px", threshold: 0.2 });

    stepRefs.current.forEach(node => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="scroll-journey">
      <img src={backdrops.trek} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <div className="shell scroll-journey-layout">
        <div className="scroll-visual">
          {chapters.map(([,, place,, image], i) => (
            <img className={active === i ? "active" : ""} src={image} alt={`${place} landscape`} key={place} />
          ))}
          <span className="scroll-visual-shade" />
          <div className="scroll-location">
            <Icon name="pin" size={16} />
            <span>Now exploring</span>
            <strong>{chapters[active][2]}</strong>
          </div>
          <div className="scroll-progress">
            {chapters.map((chapter, i) => (
              <span className={active === i ? "active" : ""} key={chapter[0]} />
            ))}
          </div>
        </div>
        <div className="scroll-chapters">
          <div className="scroll-intro">
            <p className="eyebrow">A journey through India</p>
            <h2>Every few hundred kilometres, everything changes.</h2>
            <p>Scroll through four very different landscapes that will redefine how you experience travel.</p>
          </div>
          {chapters.map(([number, title, place, copy], i) => (
            <article
              data-index={i}
              ref={node => { stepRefs.current[i] = node; }}
              className={active === i ? "active" : ""}
              key={number}
            >
              <span>{number}</span>
              <small>{place}</small>
              <h3>{title}</h3>
              <p>{copy}</p>
              <button onClick={() => navigateTo("/destinations")}>
                Explore {place} <Icon name="arrow" size={17} />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MobilePageCta() {
  return (
    <div className="mobile-page-cta">
      <div>
        <small>Ready when you are</small>
        <strong>Find your next group trip</strong>
      </div>
      <Button onClick={() => navigateTo("/trips")} icon="arrow">Explore</Button>
    </div>
  );
}

function PageHero({ eyebrow, title, copy, image }: { eyebrow: string; title: string; copy: string; image: string }) {
  return (
    <section className="page-hero">
      <img src={image} alt="" />
      <span className="page-hero-shade" />
      <div className="shell">
        <p className="eyebrow eyebrow--light">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      <span className="hero-orbit hero-orbit--one" />
      <span className="hero-orbit hero-orbit--two" />
    </section>
  );
}

function TripsPage({ currency = "INR", onOpenQuiz, onOpenReel }: { currency?: string; onOpenQuiz: () => void; onOpenReel: (r: any) => void }) {
  const [filter, setFilter] = useState("All trips");
  const filters = ["All trips", "Upcoming", "Weekend", "Adventure", "Culture", "Solo-friendly"];

  const filteredTrips = trips.filter(trip => {
    if (filter === "All trips") return true;
    if (filter === "Upcoming") return true;
    return trip.category.toLowerCase().includes(filter.toLowerCase()) || trip.badge.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <main>
      <PageHero
        eyebrow="100+ journeys and counting"
        title="Find the trip that fits your pace."
        copy="Guaranteed dates, transparent pricing and thoughtfully crafted itineraries across India."
        image={images.ladakh}
      />
      <section className="section shell trips-page">
        <div className="filter-toolbar">
          <div className="filter-pills-list">
            {filters.map(x => (
              <button className={filter === x ? "active" : ""} key={x} onClick={() => setFilter(x)}>
                {x}
              </button>
            ))}
          </div>
          <button className="sort-button">
            Sort: Recommended <Icon name="chevron" size={16} />
          </button>
        </div>
        <div className="result-intro">
          <div>
            <p className="eyebrow">Explore departures</p>
            <h2>{filter === "All trips" ? "All curated journeys" : `${filter} trips`}</h2>
          </div>
          <span>Showing {filteredTrips.length} of 48 departures</span>
        </div>
        {/* TripCard hardcodes `reveal-child`, which only un-hides under a `.reveal-parent.visible`.
            Rendered bare here, the grid had no trigger at all and stayed at opacity 0. */}
        <Reveal>
          <div className="trip-grid">
            {filteredTrips.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} currency={currency} index={i} />
            ))}
          </div>
        </Reveal>
        <div className="load-more">
          <Button variant="secondary" icon="arrow">Load more journeys</Button>
        </div>
      </section>
      <section className="page-cta">
        <div className="shell">
          <div>
            <p className="eyebrow eyebrow--light">Not sure which trip to pick?</p>
            <h2>Take our 60-second trip matcher to find your perfect itinerary.</h2>
          </div>
          <Button onClick={onOpenQuiz} icon="sparkles">Help me choose</Button>
        </div>
      </section>
      <ReelsSection onOpenReel={onOpenReel} />
      <MobilePageCta />
    </main>
  );
}

function DestinationsPage({ onOpenReel }: { onOpenReel: (r: any) => void }) {
  const regions = [
    ["North", "Snow lines, pine forests and ancient high mountain passes", "Kashmir · Ladakh · Himachal · Uttarakhand"],
    ["West", "Golden desert cities, salt flats and coastal sunsets", "Rajasthan · Gujarat · Goa"],
    ["South", "Emerald backwaters, coffee estates and quiet temple towns", "Kerala · Karnataka · Tamil Nadu"],
    ["East & Northeast", "Lush rainforests, living root bridges and sacred monasteries", "Meghalaya · Sikkim · Assam · Arunachal"],
  ];

  return (
    <main>
      <PageHero
        eyebrow="Across 35 states & union territories"
        title="A country worth taking your time with."
        copy="Explore India by terrain, culture and the stories you want to carry home with you."
        image={images.kashmir}
      />
      <section className="section shell">
        <SectionTitle
          eyebrow="Explore the map"
          title="Where India changes pace."
          copy="Every region possesses its own rhythm, culinary soul and landscapes."
        />
        <div className="destination-page-grid">
          {destinations.map(([name, line, image, meta], i) => (
            <button key={name} className="destination-page-card" onClick={() => navigateTo("/trips/kashmir")}>
              <span className="destination-number">0{i + 1}</span>
              <img src={image} alt="" loading="lazy" />
              <span className="image-shade" />
              <span>
                <small>{line}</small>
                <strong>{name}</strong>
                <em>{meta} · See trips <Icon name="arrow" size={17} /></em>
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="section region-section">
        <img src={backdrops.uttarakhand} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <div className="shell">
          <SectionTitle eyebrow="Go by region" title="Four corners. A hundred different Indias." />
          <Reveal className="reveal-parent">
            <div className="region-grid">
              {regions.map(([name, copy, places], i) => (
                <article className="reveal-child" key={name} style={{ ["--i" as string]: i }}>
                  <span><Icon name="compass" /></span>
                  <h3>{name}</h3>
                  <p>{copy}</p>
                  <small>{places}</small>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      <ReelsSection onOpenReel={onOpenReel} />
      <MobilePageCta />
    </main>
  );
}

function ExperiencesPage({ onOpenQuiz, onOpenReel }: { onOpenQuiz: () => void; onOpenReel: (r: any) => void }) {
  const experiences = [
    ["Weekend Getaways", "Leave Friday night. Return with a story.", images.himachal, "2–4 days"],
    ["High-altitude Adventure", "Big landscapes, tested routes and expert leads.", images.ladakh, "5–9 days"],
    ["Culture & Heritage", "Ancient traditions understood through local storytellers.", images.rajasthan, "4–7 days"],
    ["Coastal Slow Living", "Salt air, secret coves and room to roam.", images.kerala, "4–6 days"],
    ["Solo-Friendly Departures", "Come by yourself. Leave with lifelong friends.", images.group, "12–18 people"],
    ["Nature & Waterfalls", "Rainforest trails, natural pools and misty mornings.", images.meghalaya, "4–8 days"],
  ];

  return (
    <main>
      <PageHero
        eyebrow="Travel your way"
        title="More than just a destination."
        copy="Select how you want your journey to feel — wild, unhurried, social or deeply local."
        image={images.group}
      />
      <section className="section shell">
        <SectionTitle
          eyebrow="Experience collections"
          title="Start with what moves you."
          copy="Tailored around shared passions, then organized down to the finest practical detail."
        />
        <div className="experience-grid">
          {experiences.map(([title, copy, image, meta], i) => (
            <button key={title} onClick={() => navigateTo("/trips")}>
              <div>
                <img src={image} alt="" loading="lazy" />
                <span className="experience-icon"><Icon name={i % 2 ? "compass" : "mountain"} /></span>
              </div>
              <small>{meta}</small>
              <h3>{title}</h3>
              <p>{copy}</p>
              <span className="text-link">Explore collection <Icon name="arrow" size={17} /></span>
            </button>
          ))}
        </div>
      </section>
      <section className="section quiz-section">
        <div className="shell quiz-layout">
          <div>
            <p className="eyebrow eyebrow--light">60-second trip matcher</p>
            <h2>Mountains or coast? High energy or slow mornings?</h2>
            <p>Answer three quick questions and get an instant shortlist tailored to your travel style.</p>
            <Button onClick={onOpenQuiz} icon="sparkles">Find my travel style</Button>
          </div>
          <div className="quiz-graphic" onClick={onOpenQuiz} style={{ cursor: "pointer" }}>
            <span>01</span>
            <strong>What does your dream morning look like?</strong>
            <button type="button">Hot chai overlooking snow peaks</button>
            <button type="button">Barefoot stroll along coastal waves</button>
            <button type="button">Morning coffee in an old heritage alley</button>
          </div>
        </div>
      </section>
      <ReelsSection onOpenReel={onOpenReel} />
      <MobilePageCta />
    </main>
  );
}

function AboutPage({ onOpenReel }: { onOpenReel: (r: any) => void }) {
  return (
    <main>
      <PageHero
        eyebrow="Our story"
        title="Travel more. Plan less."
        copy="Swati The Travel Queen was built to make small-group exploration across India effortless, human and genuinely unforgettable."
        image={images.friends}
      />
      <section className="section shell about-intro">
        <div>
          <p className="eyebrow">Why we started</p>
          <h2>Great travel shouldn’t feel like a second full-time job.</h2>
        </div>
        <div>
          <p>We grew frustrated having to pick between rigid commercial package tours and spending weeks researching permits, reliable drivers and boutique stays on our own. So we built the kind of journeys we genuinely wanted to take.</p>
          <p>Today, our team collaborates with passionate local captains and independent partners across 35 states to run small-group adventures that prioritize safety, genuine local connection and unforgettable camaraderie.</p>
        </div>
      </section>
      <section className="impact-section">
        <div className="shell impact-grid">
          {[
            ["100+", "managed group departures"],
            ["5,000+", "travellers in our community"],
            ["35", "states & UTs explored"],
            ["4.9 / 5", "average traveller satisfaction rating"],
          ].map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="section shell">
        <SectionTitle
          eyebrow="The people behind the plans"
          title="Logistics obsessives. Mountain lovers."
          copy="A dedicated team of route planners, community managers and certified wilderness leaders."
        />
        <div className="team-grid">
          {[
            ["Naina Rao", "Founder · Journey Design", images.friends],
            ["Kabir Shah", "Head of Trip Operations", images.group],
            ["Tsering Dolma", "Senior Lead Captain · Himalayas", images.trek],
          ].map(([name, role, image]) => (
            <article key={name}>
              <img src={image} alt="" />
              <h3>{name}</h3>
              <span>{role}</span>
            </article>
          ))}
        </div>
      </section>
      <section className="section values-section">
        <img src={backdrops.kerala} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <div className="shell">
          <SectionTitle eyebrow="Our principles" title="The standards we never compromise on." />
          <Reveal className="reveal-parent">
            <div className="value-grid">
              {[
                ["Clarity over fine print", "What you see is what you pay. Inclusions, policies and dates are written in honest, simple words."],
                ["Local over generic", "We partner with local storytellers and independent stays that reflect the genuine essence of each region."],
                ["Groups, not crowds", "Strict limit of 12–18 travellers ensures agility, genuine friendships and respectful presence."],
                ["Safety & care in details", "From vehicle maintenance checks to backup weather plans, thorough prep makes true spontaneity possible."],
              ].map(([title, copy], i) => (
                <article className="reveal-child" key={title} style={{ ["--i" as string]: i }}>
                  <span>0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      <ReelsSection onOpenReel={onOpenReel} />
      <MobilePageCta />
    </main>
  );
}

function TripDetail({ currency = "INR" }: { currency?: string }) {
  const [faq, setFaq] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <main className="detail-page">
      <div className="shell breadcrumb">
        <button onClick={() => navigateTo("/")}>Home</button>
        <span>/</span>
        <button onClick={() => navigateTo("/trips")}>India trips</button>
        <span>/</span>
        <strong>Kashmir</strong>
      </div>
      <section className="shell detail-hero">
        <div className="detail-title">
          <div>
            <div className="hero-pill-badge" style={{ marginBottom: "12px" }}>
              <span className="live-pulse" />
              <span>Small-group departure · Kashmir</span>
            </div>
            <h1>Kashmir — The Great Valley Escape</h1>
            <p>Peaceful mornings on Dal Lake, alpine meadows in Gulmarg and village trails along the Lidder River.</p>
          </div>
          <div className="rating">
            <span><Icon name="star" size={17} />4.9</span>
            <small>124 reviews</small>
          </div>
        </div>
        <div className="gallery">
          <img src={images.kashmir} alt="Kashmir lake and mountains" />
          <img src="https://images.unsplash.com/photo-1614591276564-7b3e69347a48?auto=format&fit=crop&w=900&q=85" alt="Houseboats on Dal Lake" />
          <img src="https://images.unsplash.com/photo-1564327287902-0ccf559d839e?auto=format&fit=crop&w=900&q=85" alt="Floating market in Kashmir" />
          <button onClick={() => navigateTo("/destinations")}>View all 18 photos</button>
        </div>
        <div className="detail-facts">
          {[
            ["clock", "Duration", "5 days / 4 nights"],
            ["users", "Group size", "12–18 travellers"],
            ["mountain", "Difficulty", "Easy to moderate"],
            ["calendar", "Next departure", "18 October 2025"],
          ].map(([icon, label, value]) => (
            <div key={label}>
              <span><Icon name={icon} /></span>
              <p>
                <small>{label}</small>
                <strong>{value}</strong>
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="detail-nav">
        <div className="shell">
          {["overview", "itinerary", "inclusions", "stays", "faqs"].map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => {
                setActiveTab(tab);
                document.querySelector(`#${tab}`)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="shell detail-layout">
        <div className="detail-main">
          <section id="overview">
            <p className="eyebrow">The journey</p>
            <h2>A gentler, authentic way to experience Kashmir.</h2>
            <p className="lead">Five thoughtfully paced days through Srinagar, Gulmarg and Pahalgam — with local tea houses, warm wazwan feasts and enough unscheduled time to make the journey your own.</p>
            <div className="highlight-grid">
              {[
                "Sunrise shikara ride on Dal Lake",
                "Gulmarg Gondola & alpine pine walk",
                "Pahalgam riverside meadow trail",
                "Traditional Wazwan family dinner",
                "Handpicked heritage houseboat stays",
                "Dedicated certified Travel Queen captain",
              ].map(x => (
                <div key={x}>
                  <Icon name="check" size={17} />{x}
                </div>
              ))}
            </div>
          </section>

          <section id="itinerary">
            <p className="eyebrow">Day by day</p>
            <h2>Your detailed itinerary</h2>
            <div className="timeline">
              {[
                ["Day 01", "Arrive in Srinagar & Sunset Shikara", "Meet your lead captain at Srinagar Airport. Check into your heritage houseboat on Dal Lake, followed by an evening shikara ride under the Pir Panjal mountains."],
                ["Day 02", "Old City Heritage & Wazwan Dinner", "Explore old Srinagar's wooden architecture with a local historian, stroll the Mughal gardens, and feast on an authentic multi-course Wazwan dinner."],
                ["Day 03", "The High Meadows of Gulmarg", "Scenic drive to Gulmarg. Take the cable gondola to snow-capped viewpoints and relax at a cozy alpine café before returning to Srinagar."],
                ["Day 04", "Pahalgam Valley & Riverside Stay", "Follow the azure Lidder River to Pahalgam. Meet local saffron growers and spend the evening by the campfire in a boutique riverside lodge."],
                ["Day 05", "Farewell Breakfast & Airport Transfer", "Enjoy kahwa and freshly baked Kashmiri bread overlooking the valley before our private transfer to Srinagar Airport."],
              ].map(([day, title, copy]) => (
                <div className="timeline-item" key={day}>
                  <span>{day}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                    <small>Boutique stay included · Breakfast & Dinner included</small>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="inclusions">
            <div className="two-column-info">
              <div>
                <p className="eyebrow">All sorted</p>
                <h2>What’s included</h2>
                {[
                  "4 nights in verified heritage & boutique stays",
                  "Private AC Tempo Traveller with expert driver",
                  "4 breakfasts & 2 traditional dinners",
                  "All listed guided heritage tours & permits",
                  "Dal Lake shikara ride tickets",
                  "Dedicated Travel Queen trip captain throughout",
                  "24/7 on-trip concierge and emergency support",
                ].map(x => (
                  <p className="check-row" key={x}>
                    <Icon name="check" size={17} />{x}
                  </p>
                ))}
              </div>
              <div>
                <p className="eyebrow">Bring your own</p>
                <h2>Not included</h2>
                {[
                  "Flights to and from Srinagar",
                  "Lunches and unlisted personal snacks",
                  "Personal shopping & souvenirs",
                  "Optional adventure sports",
                  "Anything not explicitly stated as included",
                ].map(x => (
                  <p className="minus-row" key={x}>
                    <span>—</span>{x}
                  </p>
                ))}
              </div>
            </div>
          </section>

          <section id="stays">
            <p className="eyebrow">Rest easy</p>
            <h2>Stay & transport</h2>
            <div className="stay-card">
              <img src="https://images.unsplash.com/photo-1575336127377-71c4af9ce931?auto=format&fit=crop&w=900&q=85" alt="Houseboats on Dal Lake" />
              <div>
                <h3>Handcrafted Houseboats & Mountain Lodges</h3>
                <p>Double occupancy ensuite rooms, hot water heating, locally carved cedar interiors and panoramic lake vistas.</p>
                <span>Private luxury Tempo Traveller throughout the entire journey</span>
              </div>
            </div>
          </section>

          <section>
            <p className="eyebrow">Your person on the ground</p>
            <h2>Meet your trip leader</h2>
            <div className="leader-card">
              <img src={images.group} alt="" />
              <div>
                <h3>Arjun Rawat</h3>
                <span>Senior Expedition Captain · 38 Kashmir Departures</span>
                <p>Mountain enthusiast, certified wilderness first responder and storyteller who knows every quiet ridge in the valley.</p>
                <div className="stars">
                  <Icon name="star" size={15} />
                  <strong>4.95 captain rating (180+ reviews)</strong>
                </div>
              </div>
            </div>
          </section>

          <section id="faqs">
            <p className="eyebrow">Before you book</p>
            <h2>Common questions & policies</h2>
            <div className="faq-list">
              {[
                ["Is this trip suitable for first-time group travellers?", "Yes, absolutely! The pace is comfortable, with zero strenuous trekking required. Your captain manages every airport transfer, check-in and local permit."],
                ["What is the cancellation & refund policy?", "Cancel 30+ days prior for a 90% instant refund. Between 15–29 days, receive a 50% cash refund or 100% full travel voucher valid for 2 years."],
                ["What should I pack?", "We send a comprehensive season-specific packing list 10 days before departure, including footwear advice and layers for chilly evenings."],
              ].map(([q, a], i) => (
                <div className={`faq-item ${faq === i ? "open" : ""}`} key={q}>
                  <button onClick={() => setFaq(faq === i ? -1 : i)}>
                    <strong>{q}</strong>
                    <Icon name="chevron" />
                  </button>
                  <div>
                    <p>{a}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="booking-card">
          <span className="badge">Next departure · 18 Oct 2025</span>
          <div className="booking-price">
            <small>Starting from</small>
            <strong>{formatPrice(24999, currency)}</strong>
            <span>per person</span>
          </div>
          <label>
            Choose departure
            <select>
              <option>18–22 October · 12 seats left</option>
              <option>08–12 November · 9 seats left</option>
              <option>21–25 December · 6 seats left</option>
            </select>
          </label>
          <div className="mini-row">
            <span>Trip base price</span>
            <strong>{formatPrice(24999, currency)}</strong>
          </div>
          <div className="mini-row">
            <span>Taxes & permits</span>
            <strong style={{ color: "var(--forest-mid)" }}>All Included</strong>
          </div>
          <Button className="full" onClick={() => navigateTo("/booking")} icon="arrow">
            Reserve Your Seat (25% Deposit)
          </Button>
          <small className="secure">
            <Icon name="shield" size={15} />
            Secure 256-bit checkout · Free date switches within 48h
          </small>
          <button className="expert-link" onClick={() => navigateTo("/about")}>
            Questions? Chat with a trip lead
          </button>
        </aside>
      </div>

      <div className="mobile-booking-bar">
        <div>
          <small>From</small>
          <strong>{formatPrice(24999, currency)}</strong>
        </div>
        <Button onClick={() => navigateTo("/booking")}>Reserve Seat</Button>
      </div>
    </main>
  );
}

const bookingSteps = ["Departure", "Travellers", "Your details", "Add-ons", "Payment", "Confirmed"];

function BookingFlow({ currency = "INR" }: { currency?: string }) {
  const [step, setStep] = useState(0);
  const [travellers, setTravellers] = useState(1);
  const [selectedDate, setSelectedDate] = useState(0);
  const [addons, setAddons] = useState<string[]>([]);

  const next = () => {
    setStep(s => Math.min(5, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => setStep(s => Math.max(0, s - 1));
  const addOnTotal = addons.length * 1499;
  const basePrice = 24999 * travellers;
  const totalDue = Math.round((basePrice + addOnTotal) * 0.25);

  return (
    <main className="booking-page">
      <div className="booking-header shell">
        <Logo />
        <button onClick={() => navigateTo("/trips/kashmir")}>
          <Icon name="close" /> Exit booking
        </button>
      </div>
      <div className="booking-progress-wrap">
        <div className="shell booking-progress">
          {bookingSteps.map((label, i) => (
            <div className={`${i < step ? "done" : ""} ${i === step ? "active" : ""}`} key={label}>
              <span>{i < step ? <Icon name="check" size={14} /> : i + 1}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>
      </div>

      {step < 5 ? (
        <div className="shell checkout-layout">
          <section className="checkout-card">
            {step === 0 && (
              <>
                <p className="eyebrow">Step 1 of 5</p>
                <h1>Choose your departure date</h1>
                <p className="lead">All listed departures are 100% confirmed. Select the date window that matches your schedule.</p>
                <div className="date-options">
                  {[
                    ["18–22 October 2025", "12 seats left", 24999],
                    ["08–12 November 2025", "9 seats left", 25999],
                    ["21–25 December 2025", "6 seats left (Holiday)", 28999],
                  ].map((d, i) => (
                    <button
                      className={selectedDate === i ? "selected" : ""}
                      onClick={() => setSelectedDate(i)}
                      key={d[0] as string}
                    >
                      <span className="radio" />
                      <div>
                        <strong>{d[0]}</strong>
                        <small><i />{d[1]}</small>
                      </div>
                      <strong>{formatPrice(d[2] as number, currency)}</strong>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <p className="eyebrow">Step 2 of 5</p>
                <h1>Who’s travelling with you?</h1>
                <p className="lead">You can provide names and preferences in the next step.</p>
                <div className="counter-row">
                  <div>
                    <strong>Number of Adults</strong>
                    <small>Age 18 and above</small>
                  </div>
                  <div className="counter">
                    <button onClick={() => setTravellers(Math.max(1, travellers - 1))}>−</button>
                    <strong>{travellers}</strong>
                    <button onClick={() => setTravellers(Math.min(8, travellers + 1))}>+</button>
                  </div>
                </div>
                <div className="info-note">
                  <Icon name="users" />
                  <p>
                    <strong>Travelling solo?</strong><br />
                    You’re in wonderful company — over 65% of our travellers embark on their journey solo!
                  </p>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className="eyebrow">Step 3 of 5</p>
                <h1>Traveller Information</h1>
                <p className="lead">Lead traveller details. Additional guest details will be gathered via our secure traveller portal.</p>
                <div className="form-grid">
                  <label>
                    <span>First name</span>
                    <input placeholder="Aanya" defaultValue="Aanya" />
                  </label>
                  <label>
                    <span>Last name</span>
                    <input placeholder="Mehta" defaultValue="Mehta" />
                  </label>
                  <label className="full-field">
                    <span>Email address</span>
                    <input type="email" placeholder="aanya@example.com" defaultValue="aanya.mehta@gmail.com" />
                  </label>
                  <label>
                    <span>Mobile number</span>
                    <input placeholder="+91 98765 43210" defaultValue="+91 98765 43210" />
                  </label>
                  <label>
                    <span>City</span>
                    <input placeholder="Mumbai" defaultValue="Mumbai" />
                  </label>
                  <label className="full-field checkbox">
                    <input type="checkbox" defaultChecked />
                    <span>Send trip confirmation, itinerary updates & flight recommendations on WhatsApp.</span>
                  </label>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <p className="eyebrow">Step 4 of 5</p>
                <h1>Customize your experience</h1>
                <p className="lead">Handcrafted add-ons for this Kashmir departure. Add or skip as you wish.</p>
                <div className="addon-list">
                  {[
                    ["Comprehensive Travel Cover", "Emergency medical cover and trip cancellation protection", 1499],
                    ["Private Room Solo Upgrade", "Dedicated private room for all 4 nights instead of twin-share", 7999],
                    ["Private Airport Express Transfer", "Private luxury vehicle pickup directly outside flight hours", 1499],
                  ].map(([title, copy, price]) => (
                    <button
                      className={addons.includes(title as string) ? "selected" : ""}
                      key={title as string}
                      onClick={() => setAddons(x => x.includes(title as string) ? x.filter(a => a !== title) : [...x, title as string])}
                    >
                      <span className="check-box">
                        {addons.includes(title as string) && <Icon name="check" size={14} />}
                      </span>
                      <div>
                        <strong>{title}</strong>
                        <small>{copy}</small>
                      </div>
                      <strong>{formatPrice(price as number, currency)}</strong>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <p className="eyebrow">Step 5 of 5</p>
                <h1>Secure Deposit Payment</h1>
                <p className="lead">Pay a 25% deposit today to guarantee your seat. Remaining balance is due 30 days before departure.</p>
                <div className="payment-tabs">
                  <button className="active">UPI / GPay / PhonePe</button>
                  <button>Credit & Debit Card</button>
                  <button>Net Banking</button>
                </div>
                <div className="form-grid">
                  <label className="full-field">
                    <span>Enter UPI ID or Card Number</span>
                    <input placeholder="e.g. mobile@okaxis or 4532 •••• •••• 9842" defaultValue="aanya@okhdfcbank" />
                  </label>
                </div>
                <div className="secure-panel">
                  <Icon name="shield" />
                  <p>
                    <strong>Your transaction is 100% encrypted & protected.</strong><br />
                    Bank-grade 256-bit SSL encryption. We never store payment credentials.
                  </p>
                </div>
              </>
            )}

            <div className="checkout-actions">
              {step > 0 ? (
                <Button variant="secondary" onClick={back}>Back</Button>
              ) : <span />}
              <Button onClick={next} icon={step === 4 ? undefined : "arrow"}>
                {step === 4 ? `Pay Deposit ${formatPrice(totalDue, currency)}` : "Continue"}
              </Button>
            </div>
          </section>

          <aside className="order-summary">
            <h3>Your Selected Journey</h3>
            <img src={images.kashmir} alt="Kashmir" />
            <strong>Kashmir — The Great Valley Escape</strong>
            <span><Icon name="calendar" size={16} />18–22 October 2025</span>
            <span><Icon name="users" size={16} />{travellers} traveller{travellers > 1 ? "s" : ""}</span>
            <hr />
            <div>
              <span>Trip base ({travellers}x)</span>
              <strong>{formatPrice(basePrice, currency)}</strong>
            </div>
            {addons.length > 0 && (
              <div>
                <span>Selected Add-ons</span>
                <strong>{formatPrice(addOnTotal, currency)}</strong>
              </div>
            )}
            <div className="total">
              <span>Deposit Due Today (25%)</span>
              <strong>{formatPrice(totalDue, currency)}</strong>
            </div>
            <small>Includes all taxes and permits. Remaining balance due 18 Sep 2025.</small>
          </aside>
        </div>
      ) : (
        <section className="confirmation shell">
          <span className="confirmation-icon"><Icon name="check" size={34} /></span>
          <p className="eyebrow">Booking Confirmed</p>
          <h1>Kashmir is officially on your calendar!</h1>
          <p>Your reservation <strong>#ROAM-KAS-1842</strong> is confirmed. A receipt and pre-trip WhatsApp invite have been sent to <strong>aanya.mehta@gmail.com</strong>.</p>
          <div className="confirmation-card">
            <img src={images.kashmir} alt="" />
            <div>
              <small>18–22 October 2025 · 5 Days / 4 Nights</small>
              <h3>Kashmir — The Great Valley Escape</h3>
              <span>{travellers} traveller{travellers > 1 ? "s" : ""} · Verified Captain: Arjun Rawat</span>
            </div>
          </div>
          <div className="confirmation-actions">
            <Button onClick={() => navigateTo("/")}>Return Home</Button>
            <Button variant="secondary" onClick={() => navigateTo("/trips")}>Explore More Departures</Button>
          </div>
        </section>
      )}
    </main>
  );
}

function Footer() {
  const bandRef = useParallax<HTMLDivElement>(0.2);

  return (
    <footer className="footer">
      {/* The footer is dense with 10-13px copy, which cannot coexist with a
          photograph you are meant to actually see. So the photo gets its own
          full-bleed band with nothing printed on it, and the link columns sit
          on a near-opaque ground below. */}
      <div className="footer-band" ref={bandRef} aria-hidden="true">
        <img src={backdrops.kashmir} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="footer-surface">
        <div className="shell footer-grid">
          <div className="footer-brand">
            <Logo inverse />
            <p>Curated small-group journeys across India’s most breathtaking terrains. Travel more, plan zero.</p>
            <div className="trust-note">
              <Icon name="shield" size={17} />
              Certified Safe & Verified Group Travel
            </div>
          </div>
          {[
            ["Explore", "All Departures,Destinations,Experience Collections,Upcoming Trips"],
            ["Company", "Our Story,Meet the Captains,Safety Standards,Careers"],
            ["Traveller Care", "FAQs,Cancellation & Refunds,Packing Guides,WhatsApp Support"],
            ["Connect", "Instagram,YouTube,Community Stories,Newsletter"],
          ].map(([title, links]) => (
            <div className="footer-col" key={title}>
              <strong>{title}</strong>
              {links.split(",").map((x) => (
                <button key={x} onClick={() => navigateTo("/trips")}>{x}</button>
              ))}
            </div>
          ))}
        </div>
        <div className="shell footer-bottom">
          <span>© 2025 Swati The Travel Queen · All Rights Reserved</span>
          <span className="footer-legal">
            <button onClick={() => navigateTo("/about")}>Privacy policy</button>
            <button onClick={() => navigateTo("/about")}>Terms of service</button>
          </span>
        </div>
      </div>
    </footer>
  );
}

function SiteLayout() {
  const [menu, setMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [activeReel, setActiveReel] = useState<{ title: string; copy: string; image: string; views: string } | null>(null);
  const [currency, setCurrency] = useState("INR");

  const navigate = useNavigate();
  const location = useLocation();
  const isBooking = location.pathname === "/booking";

  globalNavigate = (next) => {
    navigate(next);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useRevealParents();

  useEffect(() => {
    document.body.style.overflow = (menu || isSearchOpen || isQuizOpen || activeReel) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menu, isSearchOpen, isQuizOpen, activeReel]);

  // Keyboard shortcut: CMD+K or CTRL+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsQuizOpen(false);
        setActiveReel(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <ScrollBackdrop />
      {!isBooking && (
        <Header
          currentPath={location.pathname}
          onMenu={() => setMenu(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          currency={currency}
          onCurrencyChange={setCurrency}
        />
      )}

      {menu && (
        <div className="mobile-menu">
          <div>
            <Logo />
            <button className="icon-button" onClick={() => setMenu(false)} aria-label="Close navigation">
              <Icon name="close" />
            </button>
          </div>
          <nav>
            {[
              ["Explore Trips", "/trips"],
              ["Destinations", "/destinations"],
              ["Experiences", "/experiences"],
              ["About Us", "/about"],
            ].map(([label, path], i) => (
              <button key={path} style={{ animationDelay: `${80 + i * 60}ms` }} onClick={() => navigateTo(path)}>
                {label}
                <Icon name="arrow" />
              </button>
            ))}
          </nav>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            <Button onClick={() => { setIsQuizOpen(true); setMenu(false); }} variant="secondary" icon="sparkles">
              Trip Style Matcher
            </Button>
            <Button onClick={() => navigateTo("/trips")}>Find a Trip</Button>
          </div>
        </div>
      )}

      <div className="route-transition" key={location.pathname} id="main-content">
        {location.pathname === "/" && <HomePage currency={currency} onOpenQuiz={() => setIsQuizOpen(true)} onOpenReel={setActiveReel} />}
        {location.pathname === "/trips" && <TripsPage currency={currency} onOpenQuiz={() => setIsQuizOpen(true)} onOpenReel={setActiveReel} />}
        {location.pathname === "/destinations" && <DestinationsPage onOpenReel={setActiveReel} />}
        {location.pathname === "/experiences" && <ExperiencesPage onOpenQuiz={() => setIsQuizOpen(true)} onOpenReel={setActiveReel} />}
        {location.pathname === "/about" && <AboutPage onOpenReel={setActiveReel} />}
        {location.pathname.startsWith("/trips/") && <TripDetail currency={currency} />}
        {location.pathname === "/booking" && <BookingFlow currency={currency} />}
        {!["/", "/trips", "/destinations", "/experiences", "/about", "/booking"].includes(location.pathname) && !location.pathname.startsWith("/trips/") && <NotFound />}
      </div>

      {!isBooking && <Footer />}
      {!isBooking && <FloatingConcierge />}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTrip={() => navigateTo("/trips/kashmir")}
      />

      <TripQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />

      <ReelPlayerModal
        reel={activeReel}
        onClose={() => setActiveReel(null)}
      />
    </div>
  );
}

function NotFound() {
  return (
    <section className="not-found">
      <img src={backdrops.ladakh} alt="" aria-hidden="true" />
      <div className="shell not-found-inner">
        <p className="eyebrow eyebrow--light">404 · Off the map</p>
        <h1>This route doesn’t exist.</h1>
        <p>The page you were looking for has moved on. Let’s get you back to solid ground.</p>
        <div className="not-found-actions">
          <Button onClick={() => navigateTo("/")} icon="arrow">Back to home</Button>
          <Button variant="light" onClick={() => navigateTo("/trips")}>Browse departures</Button>
        </div>
      </div>
    </section>
  );
}

const router = createBrowserRouter([
  {
    path: "*",
    Component: SiteLayout,
  },
]);

export default function App() {
  return (
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  );
}
