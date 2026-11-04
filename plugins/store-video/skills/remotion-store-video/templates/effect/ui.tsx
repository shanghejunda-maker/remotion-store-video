import React from "react";
import { AbsoluteFill } from "remotion";
import { useFrame, ip, E, spring, clamp, W } from "./lib";
import { useT, fit } from "./i18n";

/** System font on Mac (SF Pro), bundled Inter everywhere else. Drop -apple-system for identical output on every machine. */
export const FONT = "-apple-system, 'SF Pro Text', 'SF Pro Display', 'Inter', system-ui, sans-serif";
export const INK = "#0b1530";
export const GRAY = "#6b7285";
export const BRAND_BG = "linear-gradient(165deg, #2f6fe8 0%, #3f8cf5 45%, #6db8ff 100%)";

/** animated check mark in a filled circle, p 0..1 */
export const DoneMark: React.FC<{ size: number; p: number; color?: string }> = ({ size, p, color = "#34c759" }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={{ transform: `scale(${0.6 + 0.4 * clamp(p * 1.4)})`, opacity: clamp(p * 3) }}>
    <circle cx="30" cy="30" r="28" fill={color} />
    <path d="M17 31l9 9 17-19" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="44" strokeDashoffset={44 * (1 - clamp((p - 0.25) / 0.6))} />
  </svg>
);

/** dimmed backdrop + white card springing up at frame `at`, fading out at `until` */
export const Callout: React.FC<{ at: number; top: number; children: React.ReactNode; until?: number; w?: number }> = ({ at, top, children, until = 9999, w = 640 }) => {
  const f = useFrame();
  if (f < at) return null;
  const p = spring(f, at, { damping: 12, stiffness: 150 });
  const o = ip(f, [until, until + 8], [1, 0]);
  const mask = ip(f, [at, at + 6], [0, 0.45]) * o;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: mask, zIndex: 79 }} />
      <div style={{ position: "absolute", left: (W - w) / 2, top, width: w, transform: `translateY(-50%) translateY(${(1 - p) * 80}px) scale(${0.7 + 0.3 * p})`, opacity: clamp(p * 2) * o, zIndex: 80 }}>
        <div style={{ borderRadius: 48, background: "rgba(255,255,255,0.97)", boxShadow: "0 30px 80px rgba(0,0,0,0.3)", padding: "48px 40px", fontFamily: FONT }}>{children}</div>
      </div>
    </>
  );
};

/** completion popup: check mark on top, title + subtitle centered below */
export const DonePopup: React.FC<{ at: number; title: string; sub?: string; until?: number; top?: number }> = ({ at, title, sub, until, top = 960 }) => {
  const f = useFrame();
  return (
    <Callout at={at} top={top} until={until}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <DoneMark size={120} p={ip(f, [at, at + 12], [0, 1])} />
        <div style={{ marginTop: 32, fontSize: fit(title, 540, 48), fontWeight: 600, color: INK, letterSpacing: -0.4, whiteSpace: "nowrap" }}>{title}</div>
        {sub && <div style={{ marginTop: 16, fontSize: fit(sub, 540, 34), fontWeight: 400, lineHeight: 1.5, color: GRAY, whiteSpace: "pre-line" }}>{sub}</div>}
      </div>
    </Callout>
  );
};

/** feature title card between demos: icon tile with ripples + title lines sliding up */
export const TitleCard: React.FC<{ lines: string[]; icon?: React.ReactNode; bg?: string }> = ({ lines, icon, bg = BRAND_BG }) => {
  const f = useFrame();
  const { cjk } = useT();
  const iconP = spring(f, 0, { damping: 11, stiffness: 150 });
  const IY = 760;
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden", fontFamily: FONT }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${IY}px, rgba(255,255,255,0.28), rgba(255,255,255,0) 45%)` }} />
      {[0, 1, 2].map((k) => {
        const t = ((f + k * 9) % 27) / 27;
        const r = 120 + t * 330;
        return <div key={k} style={{ position: "absolute", left: W / 2 - r, top: IY - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.6)", opacity: (1 - t) * 0.7 * clamp(f / 4) }} />;
      })}
      <div style={{ position: "absolute", left: W / 2 - 110, top: IY - 110, width: 220, height: 220, borderRadius: 60, background: "#fff", boxShadow: "0 30px 70px rgba(0,30,120,0.35)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${iconP}) rotate(${(1 - clamp(iconP)) * -25}deg)` }}>
        {icon ?? <DoneMark size={120} p={1} color="#2f6fe8" />}
      </div>
      <div style={{ position: "absolute", left: 0, width: W, top: 1000, textAlign: "center", fontSize: fit(lines.join("\n"), 800, 88), fontWeight: 600, lineHeight: 1.12, color: "#fff", letterSpacing: cjk ? 0 : -1.5 }}>
        {lines.map((l, i) => {
          const p = ip(f, [4 + i * 3, 14 + i * 3], [0, 1], E.outCubic);
          return (
            <div key={i} style={{ overflow: "hidden", paddingBottom: 8 }}>
              <div style={{ transform: `translateY(${(1 - p) * 120}%)` }}>{l}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
