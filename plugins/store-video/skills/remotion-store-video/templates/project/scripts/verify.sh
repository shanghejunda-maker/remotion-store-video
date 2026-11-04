#!/usr/bin/env bash
# 验证环境：版本 → 类型检查 → 列出合成 → 渲染测试动画（用 3123 端口，Studio 开着也不冲突）
set -euo pipefail
cd "$(dirname "$0")/.."
echo "▶ 1/4 版本一致性"; npx remotion versions
echo "▶ 2/4 TypeScript 编译检查"; npx tsc --noEmit
echo "▶ 3/4 列出已注册的合成"; npx remotion compositions --port=3123
if [ -d effects/_env-test ]; then
  echo "▶ 4/4 渲染测试动画 → effects/_env-test/renders/_env-test.mp4"; npx remotion render EnvTest effects/_env-test/renders/_env-test.mp4 --port=3123
  echo "  测试通过后可删除 effects/_env-test/，并从 src/Root.tsx 去掉 EnvTestComp"
else
  echo "▶ 4/4 跳过测试渲染（_env-test 已删除）"
fi
echo "✅ 全部通过。预览请运行：npm run studio"
