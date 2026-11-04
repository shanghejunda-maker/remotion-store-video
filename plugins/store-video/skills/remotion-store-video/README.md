# remotion-store-video skill · 安装与使用

把“装 Remotion → 搭项目 → 做多语言商店视频 → 合成 BGM → 预览 → 渲染”整套流程交给 Claude。

## 包里有什么
```
remotion-store-video/
  SKILL.md               Claude 读的主说明（何时用、9 步流程、默认规则）
  references/            细节：setup / structure / storyboard / i18n / audio / style / render
  scripts/
    init_project.sh      新建项目（拷模板 + 字体 + npm run setup）
    new_effect.sh        新建一支视频并注册到 src/Root.tsx
    render_langs.sh      按语言批量渲染，自动命名、旧版本归档
  templates/project/     根项目模板（package.json 锁定 remotion 4.0.538 等）
  templates/effect/      单支视频模板（封面、钩子、功能段、标题卡、完成弹窗、i18n、合成 BGM）
  assets/fonts/          Inter 字体（SIL Open Font License，可自由分发）
```

## 安装

### A. Claude Code（终端 / 桌面 / IDE）—— 个人使用
```bash
mkdir -p ~/.claude/skills
cp -R remotion-store-video ~/.claude/skills/
```
重开 Claude Code，输入 `/skills` 能看到 `remotion-store-video` 即成功。
只想在某个项目里用：放到该项目的 `.claude/skills/remotion-store-video/`，随仓库提交，团队成员拉代码就有。

### B. 打包成 plugin 分享给别人（Claude Code）
1. 建一个 GitHub 仓库，结构如下：
   ```
   my-skills/
     .claude-plugin/marketplace.json
     plugins/store-video/
       .claude-plugin/plugin.json
       skills/remotion-store-video/    ← 整个 skill 文件夹放这里
   ```
2. `plugins/store-video/.claude-plugin/plugin.json`：
   ```json
   { "name": "store-video", "version": "1.0.0", "description": "Remotion 商店宣传视频流程", "author": { "name": "lee" } }
   ```
3. `.claude-plugin/marketplace.json`：
   ```json
   { "name": "lee-skills", "owner": { "name": "lee" },
     "plugins": [ { "name": "store-video", "source": "./plugins/store-video", "description": "Remotion 商店宣传视频流程" } ] }
   ```
4. 别人在 Claude Code 里运行：
   ```
   /plugin marketplace add <你的 GitHub 用户名>/my-skills
   /plugin install store-video@lee-skills
   ```

### C. Claude.ai / Claude 桌面 App
把 `remotion-store-video` 文件夹压成 zip（zip 根目录就是这个文件夹），在 设置 → Capabilities（功能）→ Skills 里上传。
注意：Claude.ai 的云端沙盒通常连不上 npm 和 Chrome 下载地址，装依赖、渲染这几步要在自己电脑上做（或用 Claude Code）。

## 使用
装好后直接对 Claude 说，例如：
- “用 Remotion 帮我新建一个商店视频项目，放在 ~/Videos/store”
- “给 XX App 做一支 30 秒的商店视频，886×1920，英语版，功能有 A、B、C”
- “这个视频再出日语和韩语版本”
- “把 XX 商店视频渲染出所有语言版本，版本号 v3”

Claude 会按 SKILL.md 的流程走：选需求来源（产品文档或弹窗填写）→ 要 Figma 链接 → 生成工程 → 写分镜 → 合成 BGM → 让你在 Remotion Studio 预览 → 你确认后才渲染。

## 需要的环境
Node.js 18+、Python 3 + numpy、能访问 registry.npmjs.org（首次安装）和 Remotion 的 Chrome Headless Shell 下载地址（首次渲染）。
