#!/usr/bin/env bash
# Render code-drawn library backdrops to out/backdrops/<name>.jpg (1080x1920, q92). usage: ./render_backdrops.sh [name ...]
set -e
cd "$(cd "$(dirname "$0")" && pwd)"
if (( $# )); then IDS=($@); else IDS=(courtroom bank-vault warehouse mission-control airport-gate subway-platform diner bedroom-day); fi
for id in $IDS; do npx remotion still src/backdrops/index.ts $id out/backdrops/$id.jpg --frame=0 --jpeg-quality=92 --log=error; done
