import React from "react";

/** All on-screen copy of the __APP__ store video, per language. The app name stays "__APP__" everywhere. */
/** Start with ONE language (the one the user picked). Add more only when the user asks for multi-language versions. */
export const LANGS = ["en"] as const;
export type Lang = (typeof LANGS)[number];

const LOCALE: Record<string, string> = { en: "en-US", "zh-CN": "zh-CN", "zh-TW": "zh-TW", ja: "ja-JP", ko: "ko-KR", es: "es-ES", pt: "pt-BR", fr: "fr-FR", de: "de-DE" };

/** one feature demo: tap a button -> progress -> done popup */
type Feature = { title: [string, string]; action: string; working: string; doneTitle: string; doneSub: string };
type Dict = {
  headline: [string, string, string];
  hook: [string, string];
  features: [Feature, Feature, Feature];
};

const en: Dict = {
  headline: ["Clean Smarter", "& Protect", "Privacy"],
  hook: ["Storage", "almost full."],
  features: [
    { title: ["Free Up", "Storage"], action: "Smart Clean", working: "Cleaning…", doneTitle: "96 GB Freed", doneSub: "Storage back to healthy" },
    { title: ["Declutter Your", "Screenshots"], action: "Scan Screenshots", working: "Sorting…", doneTitle: "All Sorted", doneSub: "57 junk screenshots removed" },
    { title: ["Share a", "Safe Copy"], action: "Clean & Share", working: "Removing risks…", doneTitle: "Clean Copy Saved", doneSub: "Original unchanged" },
  ],
};

/** example of a second language — only listed in LANGS once the user asks for it */
const ja: Dict = {
  headline: ["スマートに整理", "プライバシーも", "しっかり保護"],
  hook: ["ストレージ", "残りわずか。"],
  features: [
    { title: ["ストレージを", "空ける"], action: "スマートクリーン", working: "クリーン中…", doneTitle: "96 GB 解放", doneSub: "ストレージが正常に戻りました" },
    { title: ["スクショを", "すっきり整理"], action: "スクショをスキャン", working: "整理中…", doneTitle: "整理完了", doneSub: "不要なスクショ57枚を削除" },
    { title: ["安全なコピーを", "共有"], action: "クリーンして共有", working: "リスクを処理中…", doneTitle: "コピーを保存しました", doneSub: "元の写真はそのままです" },
  ],
};

const DICTS: Record<string, Dict> = { en, ja };

export const LangCtx = React.createContext<Lang>("en");

/** rough text-width estimate (em) so longer translations can shrink to fit a box */
export const emWidth = (s: string) => [...s].reduce((w, ch) => w + (/[　-鿿가-힯＀-￯]/.test(ch) ? 1 : ch === " " ? 0.28 : /[A-Z]/.test(ch) ? 0.66 : 0.56), 0);
/** largest font size <= base at which the longest line of `text` fits in maxW px */
export const fit = (text: string, maxW: number, base: number) => Math.min(base, ...text.split("\n").map((l) => maxW / Math.max(1, emWidth(l))));

/** copy + locale-aware number helpers for the current language */
export const useT = () => {
  const lang = React.useContext(LangCtx);
  const nf = new Intl.NumberFormat(LOCALE[lang], { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return { ...DICTS[lang], lang, num: (v: number) => nf.format(v), cjk: /^(ja|ko|zh)/.test(lang) };
};
