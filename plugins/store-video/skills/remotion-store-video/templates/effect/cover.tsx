import React from "react";
import { AbsoluteFill } from "remotion";
import { useFrame, ip, E, spring, clamp, W } from "./lib";
import { FONT, BRAND_BG } from "./ui";
import { useT, fit } from "./i18n";

export const APP_NAME = "__APP__";

/** Placeholder app icon. Replace with the real one, e.g. <Img src={fig("logo.svg")} /> from public/__NAME__/fig/. */
export const AppLogo: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.254, background: "#fff", boxShadow: `0 ${size * 0.2}px ${size * 0.5}px rgba(0,40,140,0.35)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 600, fontSize: size * 0.42, color: "#2f6fe8" }}>
    {APP_NAME.slice(0, 1)}
  </div>
);

const Star: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" fill="#ffd36b" /></svg>
);

/** Cover (also used as the end card): headline, app icon, app name, five stars. Keep it uncluttered. */
export const Cover: React.FC = () => {
  const f = useFrame();
  const t = useT();
  const l = [0, 3, 6].map((d) => spring(f, d, { damping: 15, stiffness: 150 }));
  const iconP = spring(f, 6, { damping: 11, stiffness: 140 });
  const nameP = spring(f, 10, { damping: 15, stiffness: 150 });
  const line = (p: number): React.CSSProperties => ({ transform: `translateY(${(1 - p) * 60}px)`, opacity: clamp(p * 1.4), filter: p < 0.97 ? `blur(${(1 - clamp(p)) * 14}px)` : undefined });
  return (
    <AbsoluteFill style={{ background: BRAND_BG, fontFamily: FONT, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.2), rgba(255,255,255,0) 58%)" }} />
      <div style={{ position: "absolute", top: 230, width: W, textAlign: "center", fontWeight: 600, fontSize: fit(t.headline.join("\n"), 820, 104), lineHeight: 1.08, color: "#fff", letterSpacing: t.cjk ? 0 : -2 }}>
        {t.headline.map((h, i) => <div key={i} style={line(l[i])}>{h}</div>)}
      </div>
      <div style={{ position: "absolute", left: (W - 340) / 2, top: 720 + Math.sin(f / 12) * 6, width: 340, height: 340, transform: `scale(${iconP})`, opacity: clamp(iconP * 2), display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AppLogo size={300} />
      </div>
      <div style={{ position: "absolute", top: 1130, width: W, textAlign: "center", fontWeight: 500, fontSize: 72, color: "#fff", letterSpacing: -1, transform: `translateY(${(1 - nameP) * 40}px)`, opacity: clamp(nameP) }}>{APP_NAME}</div>
      <div style={{ position: "absolute", top: 1300, width: W, display: "flex", justifyContent: "center", gap: 14 }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const p = spring(f, 12 + i * 2.5, { damping: 9, stiffness: 180 });
          return <div key={i} style={{ transform: `scale(${p}) rotate(${(1 - clamp(p)) * -40}deg)`, opacity: clamp(p * 3) * ip(f, [10, 16], [0, 1], E.outCubic) }}><Star size={72} /></div>;
        })}
      </div>
    </AbsoluteFill>
  );
};
