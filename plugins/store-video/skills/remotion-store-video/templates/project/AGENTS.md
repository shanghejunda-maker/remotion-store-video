# Remotion 动效项目 · 维护说明

长期使用的 Remotion 项目。**一个根项目、一份依赖，多个视频**：每个视频放在 `effects/<name>/`，统一注册到 Remotion Studio。

## 目录结构

```
<项目根目录>/                  ← 唯一的 package.json / node_modules
  package.json                依赖与脚本（remotion 与 @remotion/* 为同一精确版本）
  remotion.config.ts          全局渲染配置（入口 src/index.ts）
  tsconfig.json
  src/index.ts                registerRoot 入口（一般不用改）
  src/Root.tsx                ★ 所有视频在这里注册
  effects/<name>/             每个视频一个文件夹
    index.tsx                 导出 <Folder><Composition …/></Folder>
    renders/                  ★ 该视频的导出成片（统一输出位置）
    audio/ references/        音频脚本、需求与参考素材
  public/fonts/               共享字体（Inter，SIL OFL）
  public/<name>/              各视频自己的静态资源，代码里用 staticFile("<name>/…")
  scripts/setup.sh            一次性安装依赖 + Chrome Headless Shell
  scripts/verify.sh           版本 / 类型 / 合成列表 / 测试渲染
```

## 常用命令（在根目录运行）

| 用途 | 命令 |
|---|---|
| 首次安装（只需一次） | `npm run setup` |
| 验证环境 | `npm run verify` |
| 打开预览 | `npm run studio` |
| 渲染某个视频 | `npx remotion render <CompositionId> "effects/<name>/renders/<文件名>.mp4" --port=3123` |
| 查看版本是否一致 | `npx remotion versions` |

## 工作约定

- 默认只在 Studio 里预览，用户明确要求才渲染；成片只放 `effects/<name>/renders/`，不要输出到根目录 `out/`。
- 只在根目录安装依赖；Remotion 官方包用与 `remotion` 相同的精确版本（`npm i -E @remotion/xxx@<同版本>`）。不随意升级，需要时 `npx remotion upgrade` 后 `npm run verify`。
- Composition `id` 全局唯一，只用字母、数字、`-`。
- 遇到异常先定位原因再动手：`npx remotion versions` → `npx tsc --noEmit` → `npx remotion compositions` → 报错的具体帧 / 文件。不要盲目重装依赖或删 node_modules。

## 常见问题

| 现象 | 原因 / 处理 |
|---|---|
| `npm install` 403 / `ENOTFOUND registry.npmjs.org` | Claude 沙盒的网络白名单挡住了 npm。在自己的终端运行，或在 Claude 设置里放行 `registry.npmjs.org`。 |
| `Version mismatch` | `npx remotion versions` 查看，用 `npm i -E` 对齐到同一版本。 |
| 找不到浏览器 | `npx remotion browser ensure`。 |
| `window.getStaticCompositions is undefined` | 3000 端口被 Studio 占用，命令加 `--port=3123`。 |
| 脚本报 `XXX?: unbound variable` | macOS bash 3.2 问题，变量一律写 `${VAR}`。 |
| 图片 / 字体 / 音频 404 | 资源放 `public/` 下，用 `staticFile()` 引用。 |
| 字体渲染成默认字体 | 用 `fonts.ts` 的 `delayRender` + `FontFace` 先加载。 |
| 中文路径出错 | 路径加引号，`~` 放引号外。 |

## 记录

（在这里按日期记录验证结果和踩过的坑）
