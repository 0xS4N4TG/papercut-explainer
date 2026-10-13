#!/usr/bin/env bash
# Scaffold a new papercut episode from the shared library.
#   usage: new_episode.sh <series dir> <NN-slug> <CompositionId> [out-name]
#   e.g.   new_episode.sh ~/videos/my-series 04-mcp McpPapercut mcp-papercut
# Creates <series>/episodes/<NN-slug>/{research,narration/voice,papercut}. An existing episode folder is fine (the earlier stages
# write research/, narration/script.json and papercut/STORYBOARD.md there); files already present are never overwritten.
# The papercut project is the template plus the
# synced kit. node_modules comes from $DONOR, else from the newest <series>/episodes/*/papercut/node_modules (an APFS clone
# on macOS when the filesystem allows it, a plain copy otherwise), else from `npm i`.
set -euo pipefail

# realpath without GNU coreutils (macOS ships none)
rp() { python3 -c 'import os,sys;print(os.path.realpath(sys.argv[1]))' "$1"; }

if [ $# -lt 3 ]; then echo "usage: $0 <series dir> <NN-slug> <CompositionId> [out-name]" >&2; exit 2; fi
L=$(dirname "$(rp "${BASH_SOURCE[0]}")")
CH=$(rp "$1"); SLUG=$2; COMP=$3; OUTN=${4:-${SLUG#*-}-papercut}
E=$CH/episodes/$SLUG; P=$E/papercut
# SYNCED.txt is written last (by sync_kit.sh), so a run that died halfway can be repeated
if [ -e "$P/src/lib/SYNCED.txt" ]; then echo "already scaffolded: $P" >&2; exit 1; fi
mkdir -p "$E/research" "$E/narration/voice" "$P"
rsync -a --ignore-existing "$L/papercut/template/" "$P/"   # never overwrites; rsync is a required dependency

DONOR=${DONOR:-}
if [ -z "$DONOR" ]; then
  DONOR=$(ls -td "$CH"/episodes/*/papercut/node_modules 2>/dev/null | head -1 || true)
fi
if [ -d "$P/node_modules" ]; then
  :   # left by an earlier run that stopped after the install
elif [ -n "$DONOR" ] && [ -d "$DONOR" ]; then
  cp -cR "$DONOR" "$P/node_modules" 2>/dev/null || { rm -rf "$P/node_modules"; cp -R "$DONOR" "$P/node_modules"; }
else
  (cd "$P" && npm i --no-audit --no-fund)
fi

if [ -d "$CH/papercut-assets" ]; then
  "$L/papercut/sync_kit.sh" "$P" "$CH/papercut-assets"
else
  "$L/papercut/sync_kit.sh" "$P"
fi

python3 - "$P/episode.json" "$COMP" "$OUTN" <<'PY'
import json, sys
p, comp, out = sys.argv[1:]; e = json.load(open(p)); e["comp"], e["out"] = comp, out; json.dump(e, open(p, "w"), indent=1)
PY
[ -e "$E/narration/build_timing.py" ] || cp "$L/voice/build_timing.py" "$E/narration/"
[ -e "$E/narration/script.json" ] || echo "[]" > "$E/narration/script.json"
echo "new episode: $E  (comp $COMP -> out/$OUTN.mp4)"
echo "next: research/facts.md -> narration/script.json -> voice/narrate.sh -> voice/finalize.sh -> episode.json scenes+banners -> papercut/stubs.py -> tools/build_vo.py"
echo "      (the two voice steps are optional; any TTS works if it produces the files voice/README.md lists)"
