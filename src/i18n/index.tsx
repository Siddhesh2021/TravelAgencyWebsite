import { ReactNode, useEffect, useState } from "react";
import en from "./en.json";
import mr from "./mr.json";

export type Language = "en" | "mr";
export const translations: Record<Language, Record<string, string>> = { en, mr };

const STORAGE_KEY = "roamly-language";
const EVENT_NAME = "roamly-language-change";

export function getLanguage(): Language {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem(STORAGE_KEY) === "mr" ? "mr" : "en";
}

export function setLanguage(language: Language) {
  localStorage.setItem(STORAGE_KEY, language);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: language }));
}

function translateTree(language: Language) {
  if (typeof document === "undefined") return;
  const dictionary = translations[language];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node as Text;
    const parent = text.parentElement;
    if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT", "OPTION"].includes(parent.tagName)) continue;
    if (parent.closest("[data-i18n-ignore]")) continue;
    nodes.push(text);
  }
  nodes.forEach((text) => {
    const original = text.getAttribute("data-i18n-original") ?? text.textContent ?? "";
    if (!text.getAttribute("data-i18n-original")) text.setAttribute("data-i18n-original", original);
    const value = dictionary[original.trim()];
    if (value && original.trim() === original) text.textContent = value;
    else if (value) text.textContent = original.replace(original.trim(), value);
  });
}

export function useLanguage() {
  const [language, setCurrent] = useState<Language>(getLanguage);
  useEffect(() => {
    const onChange = (event: Event) => setCurrent((event as CustomEvent<Language>).detail);
    window.addEventListener(EVENT_NAME, onChange);
    return () => window.removeEventListener(EVENT_NAME, onChange);
  }, []);
  return { language, setLanguage };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  useEffect(() => {
    translateTree(language);
    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(() => translateTree(language));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);
  return <>{children}</>;
}

export function LanguageSelector() {
  const { language } = useLanguage();
  return (
    <div className="language-selector" data-i18n-ignore>
      <label htmlFor="language-select" className="sr-only">Language</label>
      <select
        id="language-select"
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        aria-label="Language"
      >
        <option value="en">EN</option>
        <option value="mr">मराठी</option>
      </select>
    </div>
  );
}
