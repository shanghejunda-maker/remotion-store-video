#!/usr/bin/env bash
# 一次性初始化依赖（只在项目根目录运行一次）。之后不要重复执行。
# 所有 remotion / @remotion/* 包锁定为同一个精确版本（见 package.json）。
# 想换版本：REMOTION_VERSION=4.x.y npm run setup（仅首次安装时生效）
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -d node_modules/remotion ]; then
  echo "依赖已安装（node_modules/remotion 存在），跳过。检查版本：npx remotion versions"
  exit 0
fi

node -v >/dev/null 2>&1 || { echo "未找到 Node.js，请先安装 Node 18+（https://nodejs.org）"; exit 1; }

if [ -n "${REMOTION_VERSION:-}" ]; then
  RV="${REMOTION_VERSION}"
  echo "▶ 安装 Remotion ${RV}（精确版本）"
  npm install --save-exact "remotion@${RV}" "@remotion/cli@${RV}" "react@19" "react-dom@19"
  npm install --save-exact --save-dev "typescript@5" "@types/react@19" "@types/react-dom@19"
else
  echo "▶ 按 package.json 安装依赖"
  npm install
fi

echo "▶ 安装 / 检查 Chrome Headless Shell"
npx remotion browser ensure

echo "▶ 版本检查"
npx remotion versions
echo "✅ 完成。下一步：npm run verify"
