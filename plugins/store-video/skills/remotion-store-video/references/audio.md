# BGM 与音效

用 Python + numpy 直接合成，原创、无版权问题，而且每个音效能精确对到帧。

## 运行
```bash
python3 -m pip install numpy          # 只需一次
python3 effects/<name>/audio/audio.py  # 在项目根目录运行
```
输出 `public/<name>/bgm.wav`（48kHz 立体声 16bit），并改写 `effects/<name>/audio/version.ts` 里的 `BGM_V`（时间戳）。`Promo.tsx` 里 `<Audio src={\`${staticFile("<name>/bgm.wav")}?v=${BGM_V}\`} />`，所以 Studio 会重新加载新音频。

## 结构（模板 audio.py 已有骨架）
1. **时间轴常量**：`HOOK P1 T2 P2 …` 与 `Promo.tsx` 的 `T` 完全一致；`scene(start, off, rate)` 把段内帧换算成全局帧，与 `TimeCtx` 一致。
2. **乐器函数**：`saw/sine/noise` + `lp/hp`（FFT 滤波）+ `env`（包络）组成 pad、pluck、kick、hat、clap、riser、boom。
3. **编曲**：
   - 封面：空灵 pad + 玻璃拨弦
   - 钩子：低沉 boom、存储变红时的冲击、riser 上冲
   - 功能段：120 BPM 四拍底鼓 + 和弦（如 Cm–Ab–Eb–Bb）+ 军鼓/拍手
   - 结尾前 2 拍鼓停（breakdown），结尾卡一记 impact + 闪光
   - 底鼓对 pad 做侧链压缩，让节奏更“呼吸”
4. **音效**：点按 `tap`、扫描 `blip`、弹出 `pop`、完成 `done`（上行和弦 + 闪光）、转场 `whoosh`，时间写成 `fr(S(段内帧))`。
5. **混音**：各轨相加 → 头尾淡入淡出 → 轻微立体声展宽 → `tanh` 软削波 → 归一到 -1dB 左右。

## 对齐原则
- 改了 `T` 或某段 rate，**必须同步改 audio.py 再跑一遍**。
- 音效跟“动作发生的那一帧”，不是跟“段开始”。在场景代码里把关键帧写成常量（如 `P1.DONE`），音频里引用同样的数字。
- 音量参考：音乐 pad 0.02–0.05，点按 0.18–0.22，blip 0.07，完成音 0.1 左右。整体 RMS 约 -14 ~ -12 dBFS。

## 想用现成音乐时
把 mp3/wav 放到 `public/<name>/bgm.mp3`，`<Audio src={staticFile(...)} volume={0.8} />`；注意版权，商店视频要用可商用授权的音乐。
有配音需求可参考 edge-tts 生成语音 + 逐词时间轴（sky-blue 项目做过），但商店视频一般不需要配音。
