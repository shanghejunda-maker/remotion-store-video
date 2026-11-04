#!/usr/bin/env bash
# 渲染一支视频的一个或多个语言版本（只在用户明确要求渲染时使用）。
# 用法：bash render_langs.sh <项目目录> <kebab-name> <PascalId> "<成片标题>" [vN] [lang ...]
#   不给 lang：渲染 effects/<name>/i18n.ts 里 LANGS 的全部语言
#   单语言 → renders/<标题>[ vN].mp4
#   多语言 → renders/<标题>[ vN]（多语言）/<标题>-<lang>.mp4
#   同名旧文件先移到 renders/history/
set -euo pipefail
PROJ="${1:?用法：render_langs.sh <项目目录> <kebab-name> <PascalId> \"<成片标题>\" [vN] [lang ...]}"
NAME="${2:?缺少 kebab-name}"; ID="${3:?缺少 PascalId}"; TITLE="${4:?缺少成片标题}"
shift 4
VER=""
if [ $# -gt 0 ] && [[ "${1}" =~ ^v[0-9]+$ ]]; then VER=" ${1}"; shift; fi
cd "${PROJ}"
OUT="effects/${NAME}/renders"; HIST="${OUT}/history"
if [ $# -gt 0 ]; then
  LANGS_LIST=("$@")
else
  LINE="$(grep -E 'export const LANGS' "effects/${NAME}/i18n.ts")"
  # shellcheck disable=SC2207
  LANGS_LIST=($(printf '%s' "${LINE}" | grep -oE '"[^"]+"' | tr -d '"'))
fi
[ ${#LANGS_LIST[@]} -gt 0 ] || { echo "没找到语言列表"; exit 1; }
mkdir -p "${OUT}"

stash() { # move an existing file into history/ with a timestamp
  if [ -e "$1" ]; then
    mkdir -p "${HIST}"; local b; b="$(basename "$1" .mp4)"
    mv "$1" "${HIST}/${b}-$(date +%Y%m%dT%H%M%S).mp4"; echo "  旧文件已移到 history/：${b}.mp4"
  fi
}

echo "▶ 类型检查"; npx tsc --noEmit
for L in "${LANGS_LIST[@]}"; do
  if [ ${#LANGS_LIST[@]} -eq 1 ]; then
    FILE="${OUT}/${TITLE}${VER}.mp4"
  else
    DIR="${OUT}/${TITLE}${VER}（多语言）"; mkdir -p "${DIR}"; FILE="${DIR}/${TITLE}-${L}.mp4"
  fi
  stash "${FILE}"
  echo "▶ 渲染 ${ID}-${L} → ${FILE}"
  npx remotion render "${ID}-${L}" "${FILE}" --port=3123
done
echo "✅ 完成：${OUT}/"
