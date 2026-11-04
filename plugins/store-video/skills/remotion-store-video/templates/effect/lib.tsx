import React from "react";
import { useCurrentFrame, Sequence, staticFile } from "remotion";

export const NAME = "__NAME__";
export const FPS = 30;
export const W = 886;
export const H = 1920;

/** playback-rate remap for a scene: scene frame = frame * rate - off (rate < 1 slows the scene down) */
export const TimeCtx = React.createContext({ rate: 1, off: 0 });
/** frame inside the current <Sequence>, after the TimeCtx remap. Use this in scenes instead of useCurrentFrame(). */
export const useFrame = () => {
  const t = React.useContext(TimeCtx);
  return useCurrentFrame() * t.rate - t.off;
};

/** Time-shifted block: thin wrapper around Remotion <Sequence> */
export const Seq: React.FC<{ from: number; dur?: number; name?: string; children: React.ReactNode }> = ({ from, dur, name, children }) => (
  <Sequence from={from} durationInFrames={dur} name={name} layout="none">
    {children}
  </Sequence>
);

export type Ease = (t: number) => number;
export const E = {
  linear: (t: number) => t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inCubic: (t: number) => t * t * t,
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuint: (t: number) => 1 - Math.pow(1 - t, 5),
  outBack: (t: number) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
};

/** piecewise-linear interpolate with clamping + easing per segment */
export function ip(f: number, input: number[], output: number[], ease: Ease = E.inOutCubic): number {
  if (f <= input[0]) return output[0];
  for (let i = 0; i < input.length - 1; i++) {
    if (f <= input[i + 1]) {
      const t = (f - input[i]) / (input[i + 1] - input[i]);
      return output[i] + (output[i + 1] - output[i]) * ease(t);
    }
  }
  return output[output.length - 1];
}

/** damped spring 0->1 starting at frame `start` */
export function spring(f: number, start: number, { damping = 12, stiffness = 120, mass = 1 } = {}): number {
  const t = (f - start) / FPS;
  if (t <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function mixColor(a: string, b: string, t: number): string {
  const pa = hex(a), pb = hex(b);
  const r = pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp(t)));
  return `rgb(${r[0]},${r[1]},${r[2]})`;
}
function hex(h: string) {
  const s = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}
/** multi-stop color: stops at t positions, e.g. colorAt(p, [[0, "#34c759"], [0.7, "#ffcc00"], [1, "#ff3b30"]]) */
export function colorAt(t: number, stops: [number, string][]): string {
  if (t <= stops[0][0]) return mixColor(stops[0][1], stops[0][1], 0);
  for (let i = 0; i < stops.length - 1; i++) {
    if (t <= stops[i + 1][0]) {
      const k = (t - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
      return mixColor(stops[i][1], stops[i + 1][1], k);
    }
  }
  const l = stops[stops.length - 1][1];
  return mixColor(l, l, 0);
}

/** static asset of this video: public/__NAME__/<file> */
export const pub = (file: string) => staticFile(`${NAME}/${file}`);
/** Figma-exported asset: public/__NAME__/fig/<file> */
export const fig = (file: string) => staticFile(`${NAME}/fig/${file}`);
