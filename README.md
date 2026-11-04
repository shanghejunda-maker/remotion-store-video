# remotion-store-video

一个 Claude skill：让 Claude 用 Remotion 从选项目、收集需求、读 Figma，一直做到出一支 App 商店宣传视频（竖屏 886×1920，30 秒以内）。

skill 本体在 [`plugins/store-video/skills/remotion-store-video/`](plugins/store-video/skills/remotion-store-video/)，详细说明见其中的 [`SKILL.md`](plugins/store-video/skills/remotion-store-video/SKILL.md) 和 [`README.md`](plugins/store-video/skills/remotion-store-video/README.md)。

## 安装

### Claude Code（推荐：支持弹窗选择、本机装依赖和渲染）

作为 plugin 安装：

```
/plugin marketplace add shanghejunda-maker/remotion-store-video
/plugin install store-video@remotion-store-video
```

或者只拷 skill 文件夹：

```bash
git clone https://github.com/shanghejunda-maker/remotion-store-video
mkdir -p ~/.claude/skills
cp -R remotion-store-video/plugins/store-video/skills/remotion-store-video ~/.claude/skills/
```

重开 Claude Code，输入 `/skills` 能看到 `remotion-store-video` 即可。

### Claude.ai / Claude 桌面 App

把 `plugins/store-video/skills/remotion-store-video` 文件夹压成 zip（zip 根目录就是这个文件夹），在 设置 → Capabilities → Skills 上传。云端连不上 npm，装依赖和渲染需要在自己电脑上做。

## 使用

装好后直接对 Claude 说，例如“帮我给 XX App 做一个商店视频”。流程共 9 步，需要你操作的地方：

1. 选 Remotion 项目：用已有的，或新建（填文件夹路径）
2. 选需求来源：产品文档，或自己填
3. 补全缺的需求，确认需求摘要
4. 给 Figma 链接，或选“暂时没有”
5. 有没有参考视频
6. 确认分镜
7. 确认文案
8. 在 Remotion Studio 里预览，提修改意见
9. 说“渲染”

## 环境要求

Node.js 18+、Python 3 + numpy；首次安装需要能访问 registry.npmjs.org 和 Remotion 的 Chrome Headless Shell 下载地址。

## 许可

`assets/fonts/` 中的 Inter 字体使用 SIL Open Font License 1.1。
