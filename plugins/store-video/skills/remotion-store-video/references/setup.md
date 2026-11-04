# 环境与安装

## 要求
- Node.js 18+（已验证：Node v24.22.1、npm 11.19.1、macOS）
- Python 3 + numpy（只用于生成 BGM）
- 能访问 `registry.npmjs.org`（装依赖）和 Remotion 的 Chrome Headless Shell 下载地址（首次渲染）

## 初始化
```bash
bash "$SKILL/scripts/init_project.sh" "<项目目录>"
```
它做的事：
1. 把 `templates/project/` 拷到目标目录（package.json、remotion.config.ts、tsconfig.json、src/、scripts/、AGENTS.md、.gitignore），已存在的文件不覆盖。
2. 把 Inter 字体（SIL OFL）放到 `public/fonts/`（从本 skill 的 `assets/fonts/` 拷）。
3. 运行 `npm run setup` → `scripts/setup.sh`：
   - 已有 `node_modules/remotion` 就跳过（只装一次）
   - 否则安装 `remotion`、`@remotion/cli`（同一精确版本，可用 `REMOTION_VERSION=4.0.538` 固定）、react 19、typescript 5
   - `npx remotion browser ensure` 下载 Chrome Headless Shell
   - `npx remotion versions` 检查版本一致

然后 `npm run verify`：版本一致性 → `tsc --noEmit` → `remotion compositions` → 渲染 `EnvTest` 测试动画到 `effects/_env-test/renders/`。通过后 `_env-test` 可以删掉（同时从 `src/Root.tsx` 去掉）。

已验证版本组合：remotion / @remotion/cli 4.0.538、react 19.3.1、typescript 5.9.3。

## 加额外依赖
只装在根目录，Remotion 官方包与 `remotion` 同版本：
```bash
npx remotion versions               # 看当前版本
npm i -E @remotion/three@4.0.538    # 例
```
确需升级：`npx remotion upgrade` 一次性统一升级，再 `npm run verify`。

## 常见问题（都实际遇到过）

| 现象 | 原因 / 处理 |
|---|---|
| `npm install` 403 / `ENOTFOUND registry.npmjs.org` | Claude 的沙盒网络白名单不含 npm。在自己电脑终端里运行，或在 claude.ai 设置里把 `registry.npmjs.org` 加入允许域名。不是项目问题，别改代码。 |
| `Version mismatch` / 多个 remotion 版本 | `npx remotion versions` 查；`npm i -E` 对齐到同一版本，不要整体升级。 |
| 找不到浏览器 / Headless Shell 下载失败（`ENOTFOUND remotion.media`） | `npx remotion browser ensure`；失败多为网络拦截（Claude 云端沙盒里就会这样）。已有 Chromium 时可临时加 `--browser-executable=<chromium 路径>` 绕过。 |
| 渲染或 `compositions` 报 `window.getStaticCompositions is undefined` / `Does this look like a foreign page?` | 3000 端口被正在运行的 Studio 占用。不用关 Studio，命令加 `--port=3123`。 |
| 脚本报 `XXX?: unbound variable` | macOS 自带 bash 3.2 把紧跟 `$VAR` 的中文/全角字符当变量名。脚本里变量一律写 `${VAR}`。 |
| 图片/字体/音频 404 | 资源必须在 `public/` 下，用 `staticFile("<name>/…")` 引用。 |
| 字体渲染成默认字体 | 字体要在渲染前加载完：用 `fonts.ts` 的 `delayRender` + `FontFace` 写法，并在 Promo.tsx 里 `import "./fonts"`。 |
| 类型报错 `Img` 重名 | 自己的组件别叫 `Img`（会和 remotion 的冲突），改名如 `AbsImg`。 |
| `document.fonts.add` 没有类型 | tsconfig `lib` 加 `DOM.Iterable`（模板已加）。 |
| 中文路径命令出错 | 路径加引号；`~` 放引号外：`cd ~/"Documents/哇哇鱼/项目"`。 |
| Studio 里改了 bgm.wav 声音没变 | 浏览器缓存。`audio.py` 会写 `audio/version.ts`，`<Audio src={…?v=${BGM_V}}>` 会刷新。 |
