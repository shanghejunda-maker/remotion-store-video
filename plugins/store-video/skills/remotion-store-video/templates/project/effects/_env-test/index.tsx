import React from "react";
import { AbsoluteFill, Composition, Folder, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/** 临时环境测试动画：只用于验证编译 / 预览 / 渲染，验证通过后可删除 effects/_env-test 并从 src/Root.tsx 移除。 */
const EnvTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const rot = interpolate(frame, [0, 60], [0, 360]);
  return (
    <AbsoluteFill style={{ background: "#0b62ff", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ width: 240, height: 240, borderRadius: 48, background: "#fff", transform: `scale(${s}) rotate(${rot}deg)` }} />
      <div style={{ position: "absolute", bottom: 160, color: "#fff", fontSize: 64, fontWeight: 700, opacity: s }}>Remotion OK · {frame}</div>
    </AbsoluteFill>
  );
};

export const EnvTestComp: React.FC = () => (
  <Folder name="env-test">
    <Composition id="EnvTest" component={EnvTest} durationInFrames={60} fps={30} width={1080} height={1080} />
  </Folder>
);
