#!/usr/bin/env bash
# 初始化一个 Remotion 商店视频项目（可重复运行：已存在的文件不会被覆盖）。
# 用法：bash init_project.sh <项目目录> [--no-install]
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TPL="${SKILL_DIR}/templates/project"
DEST="${1:?用法：init_project.sh <项目目录> [--no-install]}"
INSTALL=1; [ "${2:-}" = "--no-install" ] && INSTALL=0

mkdir -p "${DEST}"
DEST="$(cd "${DEST}" && pwd)"
echo "▶ 项目目录：${DEST}"

copy() { # copy <src> <dst>, skip if dst exists
  if [ -e "$2" ]; then echo "  跳过（已存在）：${2#${DEST}/}"; else mkdir -p "$(dirname "$2")"; cp "$1" "$2"; echo "  新建：${2#${DEST}/}"; fi
}
for f in package.json remotion.config.ts tsconfig.json AGENTS.md CLAUDE.md src/index.ts src/Root.tsx scripts/setup.sh scripts/verify.sh effects/_env-test/index.tsx; do
  copy "${TPL}/${f}" "${DEST}/${f}"
done
copy "${TPL}/gitignore.txt" "${DEST}/.gitignore"
chmod +x "${DEST}/scripts/"*.sh

mkdir -p "${DEST}/public/fonts"
for f in "${SKILL_DIR}/assets/fonts/"*.otf; do
  [ -e "${f}" ] || { echo "  ⚠ skill 里没有 assets/fonts/*.otf，请手动把 Inter 字体放进 public/fonts/"; break; }
  copy "${f}" "${DEST}/public/fonts/$(basename "${f}")"
done

if [ "${INSTALL}" = 1 ]; then
  echo "▶ 安装依赖（npm run setup）"
  (cd "${DEST}" && npm run setup)
  echo "✅ 初始化完成。下一步：cd \"${DEST}\" && npm run verify"
else
  echo "✅ 文件已就位（未安装依赖）。下一步：cd \"${DEST}\" && npm run setup && npm run verify"
fi
