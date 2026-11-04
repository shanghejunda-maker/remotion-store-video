# 渲染与交付

**只在用户明确要求时渲染。** 平时让用户在 Studio 里预览。

## 命令
单个：
```bash
npx remotion render <PascalId>-en "effects/<name>/renders/<成片标题> v13.mp4" --port=3123
```
批量（推荐，用本 skill 脚本）：
```bash
bash "$SKILL/scripts/render_langs.sh" <项目目录> <name> <PascalId> "<成片标题>" [v13] [en ja ...]
```
- 不给语言 → 从 `effects/<name>/i18n.ts` 的 `LANGS` 读出全部语言。
- 只渲染一种语言 → 输出 `renders/<成片标题> v13.mp4`（不写版本号就没有 ` vN`）。
- 多种语言 → 输出 `renders/<成片标题>（多语言）/<成片标题>-<lang>.mp4`。
- 目标位置已有同名旧文件 → 先移到 `renders/history/`（加时间戳），不会直接覆盖丢失。
- 固定 `--port=3123`：Studio 开着也不冲突。

## 命名约定（实际在用）
- `Safe Cleanup 商店视频 v13.mp4`，旧版本在 `renders/history/… v6 … v12.mp4`
- `Cleaner Pro 宣传视频（多语言）/Cleaner Pro 宣传视频-ja.mp4`

## 交付
- 成片只留在本地 `effects/<name>/renders/`，不要上传到项目文件库或其他地方，除非用户要求。
- `.gitignore` 已忽略 `effects/*/renders/`。

## 渲染前检查
1. `npx tsc --noEmit` 通过
2. `npx remotion compositions --port=3123` 能看到 `<PascalId>-*`
3. 先渲染一个语言 + 抽几帧确认：`npx remotion still <id> /tmp/f.png --frame=450 --port=3123`
4. 字体是否正确（Mac 外渲染时 SF Pro 会回落到 Inter）

## 商店规格备忘
- 本流程默认 886×1920（需求方指定尺寸）、30fps、H.264、≤30s。
- App Store 预览视频官方尺寸因机型而异（如 886×1920 用于 6.5"/6.7" 竖屏），以当次需求为准；改尺寸只需改 `index.tsx` 的 width/height 和 `lib.tsx` 的 `W/H`。
