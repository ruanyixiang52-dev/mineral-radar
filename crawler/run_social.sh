#!/bin/bash
# 社媒热度源抓取（B站真实抓取；微博/Fabre 待攻坚源自动尝试并记录状态）
set -e
TOOLBOX=/Users/ruan/.workbuddy/skills/browser-automation-toolbox__skillhub
PY=/Users/ruan/.workbuddy/binaries/python/envs/default/bin/python
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

"$PY" "$TOOLBOX/scripts/browser_orchestrator.py" run \
  --plan "$ROOT/crawler/plans/bilibili.json" \
  --output-dir "$ROOT/crawler/out/bili" \
  --engine-order playwright 2>&1 | tail -1

node "$ROOT/crawler/parse_social.mjs"
