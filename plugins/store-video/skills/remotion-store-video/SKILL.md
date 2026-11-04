---
name: remotion-store-video
description: 用 Remotion 从零搭项目并制作 App Store / Google Play 商店宣传视频（竖屏 886×1920、≤30 秒、多语言、合成 BGM）。当用户要做 App 商店视频、应用宣传视频、多语言推广短片，或要安装/初始化 Remotion 动效项目时使用。
---

# Remotion 商店视频

一套已经在真实项目（Cleaner Pro 宣传视频、Safe Cleanup 商店视频）里跑通的流程：
**一个根项目、一份依赖，多个动画**；每支视频放在 `effects/<name>/`，按语言注册多个 Composition，Studio 预览，确认后再渲染。

本 skill 的根目录记为 `$SKILL`（即本文件所在目录）。

## 默认规则（除非用户另说）

- **默认不渲染**。改完让用户在 Remotion Studio 预览；用户明确说“渲染/导出”才渲染。
- 成片只放 `effects/<name>/renders/`，不放根目录 `out/`，不上传到别处。
- 依赖只装在项目根目录；`remotion` 与所有 `@remotion/*` 用**同一个精确版本**，不随意升级。
- 遇到异常**先定位再动手**：`npx remotion versions` → `npx tsc --noEmit` → `npx remotion compositions` → 具体报错帧。不要盲目重装、删 node_modules。
- 视觉风格见 `references/style.md`（细字体、封面简洁、不做生硬手机框、不照搬竞品排版、完成弹窗勾在上文字居中）。

## 流程

### 1. 选择 Remotion 项目文件夹
Remotion 项目是**可复用的工作区**：一个项目里可以放很多支视频/动效（商店视频、产品动效、科普短片……），每支一个 `effects/<name>/`。所以先问用户用哪个文件夹，**不要每次都新建项目**。

先弹卡片（没有弹窗工具就用编号列表）：
1. **用已有的 Remotion 项目**（推荐）——填文件夹路径（选项里列出能找到的候选：当前目录、对话里提过的路径、根目录有 `package.json` 且依赖 `remotion` 的文件夹）
2. **新建一个 Remotion 项目**——填要放的文件夹路径（默认给当前目录下的 `remotion-effects/`）

- 选 1：检查该路径根目录有 `package.json` 且依赖 `remotion`、`src/Root.tsx` 存在；结构不同（比如不是 `effects/` 结构）就先告诉用户差异再决定怎么放，不擅自改造。确认后直接进第 2 步，新视频放进它的 `effects/<name>/`，已有的其他动效一律不动。
- 选 2：在该路径初始化：
```bash
bash "$SKILL/scripts/init_project.sh" "<项目目录>"   # 拷模板 + 字体，然后 npm run setup
cd "<项目目录>" && npm run verify                    # 版本 / 类型 / 合成列表 / 测试渲染
```
verify 通过后删掉测试动画：`effects/_env-test/` 整个目录，并从 `src/Root.tsx` 去掉 `EnvTestComp` 的 import 和 `<EnvTestComp />`。
npm 403、端口冲突、bash 3.2 变量问题等见 `references/setup.md`。

### 2. 收集需求
**第一步先让用户选需求来源**（有选项型提问工具如 Claude Code 的 `AskUserQuestion` 就弹选择题，没有就用编号列表问）：
1. **提供产品文档**（推荐）——飞书/Lark 链接、PDF/Markdown/Word、Figma 链接或粘贴文字，Claude 自己从文档里找需求
2. **自己逐项选择要求**——不看文档，直接一项项选

**选 1：从文档抽取**
- 先看项目里有没有 `docs/` 目录（或用户指定的路径），有导出的需求文档就直接读。
- 飞书链接：目前没有官方飞书/Lark 连接器。若用户自己用飞书开放平台的 token 配了自定义 MCP，就用它读；否则先试网页抓取，飞书一般要登录、拿不到正文，这时请用户在飞书里“导出为 Markdown / PDF”放进项目 `docs/`（或直接发来），或复制粘贴相关章节。
- 从文档里找：App 名、卖点/封面标题、要展示的功能及操作流程、尺寸、时长、语言（文档列了多种也先只做主语言，问用户选哪一种）、素材链接、参考竞品。商店视频需求常写在“非功能需求 → 商店视频”一类章节。
- 整理成需求摘要发给用户确认。**文档里已经写明的项不再弹卡片**；只有文档没写的项，才用下面“选 2”里对应的那张卡片补问（例如文档没写时长，就只弹时长）。唯一例外：文档列了多种语言时，弹一次单选问先做哪一种。

**选 2：自己填写——全部用弹窗**（`AskUserQuestion` 每次最多 4 题、每题 2–4 个选项，并且自带“其他”可自由填写；没有该工具时用编号列表代替）。分三轮弹，第 1 轮是固定选项，后两轮按项目生成：
- 第 1 轮（选择为主）：
  - 尺寸：886×1920（推荐）/ 1080×1920 / 1290×2796
  - 时长：≤30s（推荐）/ ≤15s / ≤60s
  - 语言（**单选，只做一种**）：English（推荐）/ 简体中文 / 日本語 / 其他（填写）
  - 功能数量：3 个（推荐）/ 4 个 / 5 个
- 第 2 轮（填写为主）：**先问 App 名 + 一句话介绍这个 App 是做什么的**（开放填写；能从上下文得知就直接给作为选项）。
- 第 3 轮：**根据这个 App 生成选项**，不要用固定示例。依据：用户的一句话介绍、App Store/官网链接、项目里已有的视频和文案、之前的对话。
  - 封面标题：按该 App 的核心卖点写 2–3 句候选 + “其他（填写）”
  - 功能清单：按该 App 的真实功能给 2–3 组候选（每个功能写成“点什么 → 发生什么 → 结果”）+ “其他（填写）”
收齐后整理成需求摘要，再弹一次“确认 / 修改”。

需要的信息（缺的就问，能猜的先按常规值做并说明）：
- App 名、图标/Logo；封面标题（一句卖点，2–3 行）；主色从 Figma 设计稿取，不单独问
- 要展示的功能（通常 3–5 个，每个一句标题 + 一段操作流程）
- 尺寸（默认 886×1920）、时长（默认 ≤30s）、语言（只选一种，默认 en）
- 参考视频/竞品（只参考节奏，不照搬排版）；产品 UI 在第 3 步从 Figma 取

把需求摘要写进 `effects/<name>/references/requirements.md`。

### 3. 提供 Figma 产品链接
需求确认后，**请用户给 Figma 产品设计稿链接**（弹窗：“填写 Figma 链接” / “暂时没有，先用占位界面”）。最好指到具体页面或节点（链接里带 `node-id=`），例如 App 首页、各功能页、完成页、Logo。
- 已连接 Figma 连接器（MCP）：用 `get_metadata` 看页面结构、`get_screenshot` 看画面、`get_design_context` 拿布局和颜色、`download_assets` 导出图标/图片，统一放到 `public/<name>/fig/`，按 Figma 坐标手搓页面。
- 没连 Figma：请用户在 Claude 设置里连接 Figma 连接器；或在 Figma 里把需要的图层导出 SVG/PNG（2x/3x）发来，放进 `public/<name>/fig/`。
- 链接打不开（无权限）：请用户把文件分享权限设为“有链接的人可查看”，或邀请账号。
- 用户选“暂时没有”：先用模板占位界面做节奏和动画，之后拿到设计稿再替换。

### 4. 新建视频
```bash
bash "$SKILL/scripts/new_effect.sh" "<项目目录>" <kebab-name> <PascalId> "<App 名>"
# 例：new_effect.sh . safe-cleanup-store SafeCleanupStore "Safe Cleanup"
```
它会生成 `effects/<name>/`（Promo/lib/fonts/i18n/cover/ui/scenes + audio/），建 `public/<name>/`，并在 `src/Root.tsx` 注册。先只注册所选的一种语言，Composition 为 `<PascalId>-<lang>`（如 `<PascalId>-en`）。

### 5. 写分镜与时间轴
**视觉风格不问用户**：直接参考 Figma 界面设计（配色、字体、圆角、图标风格）来定，并遵守 `references/style.md`。没有设计稿时用模板默认的品牌色渐变。

**节奏不问用户**：由 Claude 自己把控，按 `references/storyboard.md` 的时长分配，每步停够 10–15 帧，太赶就用 `TimeCtx` 放慢。

**动手前弹一张卡片**（需求文档里已经写明就跳过）：
- 参考视频：有（填写链接或发文件，只参考节奏和信息量，不照搬排版）/ 没有，按默认结构
然后把分镜表（每段帧范围 + 内容）发给用户，弹“确认 / 修改”。

按 `references/storyboard.md` 的结构：封面 → 钩子（痛点）→ 功能 1..N（每段前一张功能标题卡）→ 结尾回到封面。
所有切点集中在 `Promo.tsx` 的 `T` 常量（帧，30fps，按 120 BPM 每拍 15 帧对齐）。
场景代码规范（`useFrame`/`ip`/`spring`/`TimeCtx` 放慢某段、`CrossIn` 转场）见 `references/structure.md`。

### 6. 文案与多语言
文案写完、界面按 Figma 搭好后，把所有屏幕文字列成清单发给用户，弹“确认文案 / 修改”。
**一开始只做一种语言**：`i18n.ts` 的 `LANGS` 只放用户选的那一种。等用户主动提出要多语言版本，再加语言（翻译 Dict、加进 `LANGS`，每种语言自动多一个 Composition）。
所有屏幕文字只写在 `i18n.ts` 的 `Dict` 里；App 名不翻译。长语言用 `fit()` 自动缩字号，CJK 去掉负字距。见 `references/i18n.md`。

### 7. BGM 与音效
用 `effects/<name>/audio/audio.py`（numpy 合成，原创无版权）生成 `public/<name>/bgm.wav`，事件时间与 `T` 一一对应；脚本会刷新 `audio/version.ts` 让 Studio 重新加载音频。见 `references/audio.md`。
```bash
python3 effects/<name>/audio/audio.py
```

### 8. 自检 + 预览
**交给用户看之前，Claude 先自己检查一遍**（每次大改后都要做）：
1. `npx tsc --noEmit` 通过；`npx remotion compositions --port=3123` 能列出 `<PascalId>-<lang>`，尺寸、帧数（≤30s）正确。
2. 抽关键帧截图并**自己看图**：截图统一放 `CHK="${TMPDIR:-/tmp}/remotion-check-<name>"`，`npx remotion still <id> "$CHK/<帧>.png" --frame=<帧> --scale=0.5 --port=3123`。至少看：封面第 0 帧和中间帧、每张标题卡、每个功能的完成弹窗、结尾。
3. 对照 `references/style.md` 自检清单逐项看：文字有没有溢出/截断、字体是否正确（不是系统默认字体）、完成弹窗勾在上文字居中、没有手机框、界面和 Figma 一致。
4. 音画对齐：`audio.py` 里的帧常量和 `Promo.tsx` 的 `T`、场景关键帧一致；改过时间轴就重新跑 `audio.py`。
5. 发现问题先修再查；把检查结果简要告诉用户（查了什么、改了什么、还有什么要用户定）。
6. **清理**：检查完删掉 `$CHK` 整个目录；中途试渲染的片段、临时脚本也一并删除。只删自己这次生成的临时文件，绝不动 `renders/`（含 `history/`）、`public/` 素材和用户的文件。

自检通过后再请用户预览：
```bash
npm run studio      # 浏览器打开 http://localhost:3000，选 <PascalId>-en
```
让用户在 Studio 里看，按反馈改。每次大改前把上一版说清楚改了什么。

### 9. 渲染（仅在用户要求时）
```bash
bash "$SKILL/scripts/render_langs.sh" "<项目目录>" <kebab-name> <PascalId> "<成片标题>" [v版本] [语言...]
```
输出 `effects/<name>/renders/<成片标题> v13.mp4`（单语言）或 `renders/<成片标题>（多语言）/<成片标题>-<lang>.mp4`；旧版本自动移到 `renders/history/`。Studio 开着也能渲染（脚本固定用 `--port=3123`）。细节见 `references/render.md`。

**渲染后检查**：确认文件存在且大小正常，用 `ffprobe -v error -show_entries format=duration:stream=width,height -of csv=p=0 <文件>`（或 `npx remotion ffprobe`）核对时长 ≤30s、尺寸正确、带音轨；再告诉用户文件路径。

## 参考文件

| 文件 | 内容 |
|---|---|
| `references/setup.md` | 环境要求、安装、验证、常见报错与处理 |
| `references/structure.md` | 目录结构、注册方式、场景/动画工具函数用法 |
| `references/storyboard.md` | 商店视频的标准分镜、时长分配、转场与标题卡 |
| `references/i18n.md` | 多语言文案结构、字号自适应、语言列表 |
| `references/audio.md` | 合成 BGM/音效的做法和与画面对齐 |
| `references/style.md` | 视觉风格偏好与反面清单 |
| `references/render.md` | 渲染命令、命名、版本归档、质量检查 |
