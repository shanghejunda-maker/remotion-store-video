#!/usr/bin/env bash
# 在项目里新建一支商店视频，并注册到 src/Root.tsx。
# 用法：bash new_effect.sh <项目目录> <kebab-name> <PascalId> "<App 名>"
# 例：  bash new_effect.sh . safe-cleanup-store SafeCleanupStore "Safe Cleanup"
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJ="${1:?用法：new_effect.sh <项目目录> <kebab-name> <PascalId> \"<App 名>\"}"
NAME="${2:?缺少 kebab-name，如 my-app-store}"
ID="${3:?缺少 PascalId，如 MyAppStore}"
APP="${4:?缺少 App 名}"

[[ "${NAME}" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || { echo "kebab-name 只能用小写字母、数字和 -：${NAME}"; exit 1; }
[[ "${ID}" =~ ^[A-Z][A-Za-z0-9]*$ ]] || { echo "PascalId 需以大写字母开头、只含字母数字：${ID}"; exit 1; }
PROJ="$(cd "${PROJ}" && pwd)"
[ -f "${PROJ}/src/Root.tsx" ] || { echo "找不到 ${PROJ}/src/Root.tsx，先运行 init_project.sh"; exit 1; }
DEST="${PROJ}/effects/${NAME}"
[ -e "${DEST}" ] && { echo "已存在：${DEST}（不覆盖）"; exit 1; }
grep -q "<${ID} />" "${PROJ}/src/Root.tsx" && { echo "Root.tsx 里已经注册了 ${ID}"; exit 1; }

mkdir -p "${PROJ}/effects"
cp -R "${SKILL_DIR}/templates/effect" "${DEST}"
mkdir -p "${DEST}/renders" "${PROJ}/public/${NAME}/fig"
export NAME ID APP
find "${DEST}" -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.py' -o -name '*.md' \) -print0 | xargs -0 perl -pi -e 's/__NAME__/$ENV{NAME}/g; s/__ID__/$ENV{ID}/g; s/__APP__/$ENV{APP}/g'

ROOT="${PROJ}/src/Root.tsx"
IMPORT="import { ${ID} } from \"../effects/${NAME}\";"
export IMPORT
if grep -q "@effects-imports" "${ROOT}"; then
  perl -pi -e 'print "$ENV{IMPORT}\n" if /\@effects-imports/' "${ROOT}"
else # insert after the last import line
  perl -0pi -e 's/(.*^import [^\n]*\n)/$1$ENV{IMPORT}\n/ms' "${ROOT}"
fi
if grep -q "@effects-list" "${ROOT}"; then
  perl -pi -e 'if (/\@effects-list/) { $_ .= (" " x 4) . "<$ENV{ID} />\n" }' "${ROOT}"
else # insert before the closing fragment
  perl -0pi -e 's/(\n(\s*)<\/>)/\n$2  <$ENV{ID} \/>$1/' "${ROOT}"
fi

echo "✅ 已创建 effects/${NAME}/ 和 public/${NAME}/，并在 src/Root.tsx 注册 <${ID} />"
echo "   Composition：${ID}-en（先只有一种语言；要多语言时再往 effects/${NAME}/i18n.ts 的 LANGS 里加）"
echo "   下一步：写 effects/${NAME}/references/requirements.md → 改 scenes.tsx / i18n.ts → python3 effects/${NAME}/audio/audio.py → npm run studio"
