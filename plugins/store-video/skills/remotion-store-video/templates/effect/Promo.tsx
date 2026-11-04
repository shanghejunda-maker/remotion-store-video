import React from "react";
import { AbsoluteFill, Audio, Sequence } from "remotion";
import "./fonts";
import { Seq, useFrame, ip, E, TimeCtx, pub } from "./lib";
import { Cover } from "./cover";
import { Hook, HOOK, Feature } from "./scenes";
import { TitleCard } from "./ui";
import { BGM_V } from "./audio/version";
import { Lang, LangCtx, useT } from "./i18n";

/**
 * __APP__ store video — 886×1920, 30 fps, 120 BPM grid (1 beat = 15 frames).
 * Cover -> hook (pain point) -> feature 1 -> title 2 -> feature 2 -> title 3 -> feature 3 -> cover again.
 * ALL cut points live in T. audio/audio.py mirrors these numbers — change both together.
 */
export const T = {
  hook: 30, p1: 120, t2: 270, p2: 292, t3: 480, p3: 502, end: 690, total: 732,
};
// playback rates: < 1 stretches a part so each step reads (audio/audio.py mirrors these)
const P1_TIME = { rate: 0.85, off: 0 };
const P2_TIME = { rate: 0.85, off: 0 };
const P3_TIME = { rate: 0.85, off: 0 };

/** soft cross-zoom: the incoming segment fades in over the outgoing one while settling from a slight zoom */
const CrossIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useFrame();
  const p = ip(f, [0, 10], [0, 1], E.outCubic);
  return <AbsoluteFill style={{ opacity: p, transform: `scale(${1.06 - 0.06 * p})`, filter: p < 0.98 ? `blur(${(1 - p) * 12}px)` : undefined }}>{children}</AbsoluteFill>;
};
/** a segment from..to that starts 6 frames early (overlap for CrossIn) and lingers 10 frames */
const Part: React.FC<{ from: number; to: number; name: string; children: React.ReactNode }> = ({ from, to, name, children }) => (
  <Seq name={name} from={from - 6} dur={to - from + 16}>
    <CrossIn><Sequence from={6} layout="none">{children}</Sequence></CrossIn>
  </Seq>
);

export const Promo: React.FC<{ lang?: Lang }> = ({ lang = "en" }) => (
  <LangCtx.Provider value={lang}><Main /></LangCtx.Provider>
);

const Main: React.FC = () => {
  const f = useFrame();
  const t = useT();
  const coverOut = ip(f, [T.hook - 6, T.hook + 4], [0, 1], E.inCubic);
  return (
    <AbsoluteFill lang={t.lang} style={{ overflow: "hidden", background: "#071a3d" }}>
      <Seq name="Cover" from={0} dur={T.hook + 6}>
        <AbsoluteFill style={{ transform: `scale(${1 + coverOut * 0.15})`, opacity: 1 - coverOut }}><Cover /></AbsoluteFill>
      </Seq>
      <Seq name="Hook" from={T.hook - 4} dur={HOOK.len + 12}>
        <AbsoluteFill style={{ opacity: ip(f, [T.hook - 4, T.hook + 4], [0, 1]) }}>
          <Sequence from={4} layout="none"><Hook /></Sequence>
        </AbsoluteFill>
      </Seq>
      <Part name="1 Feature" from={T.p1} to={T.t2}><TimeCtx.Provider value={P1_TIME}><Feature i={0} /></TimeCtx.Provider></Part>
      <Part name="Title 2" from={T.t2} to={T.p2}><TitleCard lines={t.features[1].title} /></Part>
      <Part name="2 Feature" from={T.p2} to={T.t3}><TimeCtx.Provider value={P2_TIME}><Feature i={1} /></TimeCtx.Provider></Part>
      <Part name="Title 3" from={T.t3} to={T.p3}><TitleCard lines={t.features[2].title} /></Part>
      <Part name="3 Feature" from={T.p3} to={T.end}><TimeCtx.Provider value={P3_TIME}><Feature i={2} /></TimeCtx.Provider></Part>
      <Seq name="End card (cover)" from={T.end - 6}>
        <CrossIn><Sequence from={6} layout="none"><Cover /></Sequence></CrossIn>
      </Seq>
      {/* synthesized BGM + SFX, regenerate with: python3 effects/__NAME__/audio/audio.py */}
      {BGM_V !== "0" && <Audio src={`${pub("bgm.wav")}?v=${BGM_V}`} />}
    </AbsoluteFill>
  );
};
