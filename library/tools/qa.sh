#!/usr/bin/env bash
# One-shot QA sheet: render every Nth frame of a range at low scale, then a labelled contact sheet.
#   usage (from a Remotion project dir): $PAPERCUT_LIB/tools/qa.sh NAME [FROM-TO] [NTH=12] [SCALE=0.3] [COLS=9]
#   -> out/qa/NAME/ (frames) and out/qa/NAME_0.jpg, _1.jpg ... (<= 45 frames per sheet)
#   env: PAPERCUT_PY (python with Pillow, default python3), CONC (render tabs, default 2)
set -euo pipefail

rp() { python3 -c 'import os,sys;print(os.path.realpath(sys.argv[1]))' "$1"; }

LIB=$(dirname "$(rp "${BASH_SOURCE[0]}")")
NAME=${1:?usage: qa.sh NAME [FROM-TO] [NTH=12] [SCALE=0.3] [COLS=9]}
case "$NAME" in */*|.*) echo "qa.sh: NAME must be a plain folder name, got '$NAME'" >&2; exit 2 ;; esac
RANGE=${2:-}; NTH=${3:-12}; SCALE=${4:-0.3}; COLS=${5:-9}
if [ -f "$LIB/../env.sh" ]; then . "$LIB/../env.sh"; fi   # fills PAPERCUT_PY from the config file, if any
PY=${PAPERCUT_PY:-python3}
COMP=$(python3 -c "import json;print(json.load(open('episode.json'))['comp'])")
rm -rf "out/qa/$NAME"; mkdir -p out/qa
FRAMES=(); [ -n "$RANGE" ] && FRAMES=("--frames=$RANGE")
npx remotion render "$COMP" "out/qa/$NAME" --sequence ${FRAMES[@]+"${FRAMES[@]}"} --every-nth-frame="$NTH" --scale="$SCALE" --gl=angle \
  --concurrency="${CONC:-2}" --muted --log=error --image-format=jpeg 2>&1 | grep -iv deprecat || true
OFF=${RANGE%%-*}
"$PY" "$LIB/sheet.py" "out/qa/$NAME" "out/qa/$NAME" "$NTH" 45 "$COLS" 200 "${OFF:-0}"
