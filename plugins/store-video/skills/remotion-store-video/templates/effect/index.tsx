import React from "react";
import { Composition, Folder } from "remotion";
import { Promo, T } from "./Promo";
import { LANGS } from "./i18n";
import { W, H, FPS } from "./lib";

/** __APP__ 商店视频 — W×H, 30 fps; one composition per language (__ID__-en, __ID__-ja, …) */
export const __ID__: React.FC = () => (
  <Folder name="__NAME__">
    {LANGS.map((lang) => (
      <Composition key={lang} id={`__ID__-${lang}`} component={Promo} defaultProps={{ lang }} durationInFrames={T.total} fps={FPS} width={W} height={H} />
    ))}
  </Folder>
);
