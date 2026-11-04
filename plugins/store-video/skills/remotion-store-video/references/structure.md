# 项目与视频结构

## 根项目
```
<项目>/
  package.json          scripts: setup / studio / render / typecheck / verify / versions
  remotion.config.ts    入口 src/index.ts；jpeg 帧；允许覆盖输出
  tsconfig.json         include: src, effects
  src/index.ts          registerRoot（不用改）
  src/Root.tsx          ★ 所有视频在这里注册
  effects/<name>/       每支视频一个文件夹
  public/fonts/         共享 Inter 字体
  public/<name>/        该视频的静态资源（bgm.wav、fig/、a/ …）
  scripts/setup.sh verify.sh
  AGENTS.md CLAUDE.md   给 Claude 看的维护说明
```
规则：不要在 `effects/*` 里建 package.json；Composition `id` 全局唯一，只用字母数字和 `-`。

## 一支视频（new_effect.sh 生成）
```
effects/<name>/
  index.tsx      <Folder name="<name>"> 里按 LANGS 循环出 <PascalId>-<lang> 的 Composition
  Promo.tsx      ★ 时间轴 T、各段编排、转场、BGM
  lib.tsx        帧/缓动/弹簧/颜色工具，staticFile 快捷函数
  fonts.ts       渲染前加载 Inter
  i18n.ts        LANGS、Dict、useT()、fit()
  cover.tsx      封面（也作结尾卡）
  ui.tsx         字体常量、TitleCard、DonePopup、Callout、DoneMark
  scenes.tsx     各功能段（先是占位，按需求替换/拆成 s1.tsx s2.tsx …）
  audio/audio.py audio/version.ts
  references/requirements.md   需求摘要
  renders/       成片（.gitignore 已忽略）
```
真实项目里功能段通常拆成多个文件（Safe Cleanup：`stage.tsx` 钩子、`creative.tsx` 功能 1–3、`s5.tsx` 功能 4）。

## 关键写法

**时间轴集中**：`Promo.tsx` 里
```ts
export const T = { hook: 30, p1: 120, t2: 250, p2: 272, /* … */ end: 855, total: 897 };
```
每个功能段用 `<Part from={T.pN} to={T.tN+1}>`，标题卡用 `<Part from={T.tN} to={T.pN}>`。改节奏只改 `T`，音频脚本同步改同名常量。

**段内帧**：段内用 `useFrame()`（不是 `useCurrentFrame()`），段的 0 帧就是它开始的那一帧。
**放慢某段**：`<TimeCtx.Provider value={{ rate: 0.85, off: 0 }}>` —— 段内帧 = 帧 × rate − off。rate < 1 拉长，让每一步看得清。音频里用同样的 `scene(start, off, rate)` 换算。

**动画工具（lib.tsx）**
- `ip(f, [f0, f1, …], [v0, v1, …], E.outCubic)`：分段插值 + 缓动 + 夹紧
- `spring(f, start, { damping, stiffness })`：0→1 阻尼弹簧，做弹出
- `E.outCubic / inCubic / inOutCubic / outQuint / outBack / inOutSine`
- `mixColor(a, b, t)`、`colorAt(t, stops)`：比如存储条从绿变红
- `pub("x.png")` → `staticFile("<name>/x.png")`；`fig("x.svg")` → `staticFile("<name>/fig/x.svg")`

**转场**：`CrossIn` —— 新段在前 10 帧从 1.06 缩放、带模糊淡入，盖在旧段上（两段重叠 6 帧）。

**素材**：Figma 导出的图标/UI 切图放 `public/<name>/fig/`，3D 图（勾、星星）放 `public/<name>/a/`。产品内页面优先用设计稿手搓（按 Figma 坐标写 absolute 布局），比截图清晰、可做局部动画。

**字体**：模板 `FONT` 用 `-apple-system, 'SF Pro …', 'Inter', system-ui`。在 Mac 上渲染会用 SF Pro；要跨机器一致就把 `-apple-system` 去掉，只用打包的 Inter。
