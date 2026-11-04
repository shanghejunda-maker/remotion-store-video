import React from "react";
import { AbsoluteFill } from "remotion";
import { useFrame, ip, E, spring, clamp, colorAt, W } from "./lib";
import { FONT, INK, GRAY, DonePopup } from "./ui";
import { useT, fit } from "./i18n";

/**
 * PLACEHOLDER scenes. They show the house pattern (tap -> progress -> result -> DonePopup) with frame
 * constants that audio/audio.py mirrors. Replace each Feature with real product UI built from the
 * Figma export (public/__NAME__/fig/), full-bleed or as floating cards — no phone-frame mockup.
 */

/** Hook: storage capsule fills up and turns red, then shakes. 90 frames. */
export const HOOK = { len: 90, red: 45, shake: [52, 60] as [number, number], line2: 20 };
export const Hook: React.FC = () => {
  const f = useFrame();
  const t = useT();
  const fill = ip(f, [4, HOOK.red], [0.25, 0.97], E.inOutCubic);
  const shake = f > HOOK.shake[0] && f < HOOK.shake[1] ? Math.sin(f * 3) * 10 : 0;
  const color = colorAt(fill, [[0, "#34c759"], [0.7, "#ffcc00"], [0.95, "#ff3b30"], [1, "#ff3b30"]]);
  return (
    <AbsoluteFill style={{ background: "#f3f6fc", fontFamily: FONT, alignItems: "center" }}>
      <div style={{ position: "absolute", top: 420, width: W, textAlign: "center", fontSize: fit(t.hook.join("\n"), 760, 96), fontWeight: 600, color: INK, lineHeight: 1.1, letterSpacing: t.cjk ? 0 : -1.5 }}>
        <div style={{ opacity: clamp(f / 8) }}>{t.hook[0]}</div>
        <div style={{ opacity: ip(f, [HOOK.line2, HOOK.line2 + 8], [0, 1]), color: f > HOOK.red ? "#ff3b30" : INK }}>{t.hook[1]}</div>
      </div>
      <div style={{ position: "absolute", top: 900, left: 143, width: 600, height: 120, borderRadius: 60, background: "#e3e8f2", overflow: "hidden", transform: `translateX(${shake}px)` }}>
        <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 60, background: color }} />
      </div>
      <div style={{ position: "absolute", top: 1060, width: W, textAlign: "center", fontSize: 48, fontWeight: 500, color: GRAY }}>{Math.round(fill * 128)} / 128 GB</div>
    </AbsoluteFill>
  );
};

/** one feature demo: button press at TAP, progress until DONE, popup at DONE (scene frames, before TimeCtx rate) */
export const FEAT = { TAP: 20, DONE: 90 };
export const Feature: React.FC<{ i: 0 | 1 | 2 }> = ({ i }) => {
  const f = useFrame();
  const t = useT();
  const ft = t.features[i];
  const press = f > FEAT.TAP - 2 && f < FEAT.TAP + 6 ? 0.94 : 1;
  const prog = ip(f, [FEAT.TAP + 6, FEAT.DONE - 6], [0, 1], E.inOutSine);
  const ring = spring(f, FEAT.TAP, { damping: 20, stiffness: 120 });
  return (
    <AbsoluteFill style={{ background: "#f3f6fc", fontFamily: FONT }}>
      <div style={{ position: "absolute", top: 260, width: W, textAlign: "center", fontSize: fit(ft.title.join(t.cjk ? "" : " "), 760, 64), fontWeight: 600, color: INK }}>{ft.title.join(t.cjk ? "" : " ")}</div>
      {/* progress ring */}
      <svg width={460} height={460} style={{ position: "absolute", left: (W - 460) / 2, top: 520 }} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#e3e8f2" strokeWidth="6" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#2f6fe8" strokeWidth="6" strokeLinecap="round" strokeDasharray={276.5} strokeDashoffset={276.5 * (1 - prog)} transform="rotate(-90 50 50)" />
        <text x="50" y="56" textAnchor="middle" fontSize="18" fontWeight="500" fill={INK}>{Math.round(prog * 100)}%</text>
      </svg>
      <div style={{ position: "absolute", top: 1030, width: W, textAlign: "center", fontSize: 40, color: GRAY, opacity: f > FEAT.TAP ? 1 : 0 }}>{ft.working}</div>
      {/* CTA button + tap ripple */}
      <div style={{ position: "absolute", left: 103, top: 1500, width: 680, height: 140, borderRadius: 70, background: "#2f6fe8", color: "#fff", fontSize: fit(ft.action, 600, 48), fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${press})` }}>{ft.action}</div>
      {f >= FEAT.TAP && f < FEAT.TAP + 20 && (
        <div style={{ position: "absolute", left: W / 2 - 60 * (1 + ring), top: 1570 - 60 * (1 + ring), width: 120 * (1 + ring), height: 120 * (1 + ring), borderRadius: "50%", background: "rgba(255,255,255,0.5)", opacity: 1 - clamp(ring) }} />
      )}
      <DonePopup at={FEAT.DONE} title={ft.doneTitle} sub={ft.doneSub} />
    </AbsoluteFill>
  );
};
