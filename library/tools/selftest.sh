#!/usr/bin/env bash
# Build the bundled example reel through the real pipeline in a throwaway folder and render one still.
# Checks: scaffold, kit sync, placeholder narration, build_vo, stubs, typecheck, a Remotion render with fonts, backdrops and camera.
#   usage: library/tools/selftest.sh [WORK_DIR]    (default: a temp dir, removed on success; pass a dir to keep the result)
#   needs: node 20+, npm, ffmpeg, python3 (first run downloads npm packages and Remotion's headless Chrome)
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$HERE/../env.sh"
KEEP=1; W="${1:-}"; if [ -z "$W" ]; then W="$(mktemp -d)"; KEEP=0; fi
say() { printf '  selftest: %s\n' "$*"; }
EX="$PAPERCUT_LIB/../examples/hello-reel"

say "scaffold in $W"
bash "$PAPERCUT_LIB/new_episode.sh" "$W/series" 01-selftest Example example-papercut >/dev/null
E="$W/series/episodes/01-selftest"; P="$E/papercut"

say "narration (placeholder, silent)"
cp "$EX/narration/script.json" "$E/narration/script.json"
( cd "$E/narration" && python3 "$PAPERCUT_LIB/tools/placeholder_vo.py" >/dev/null )

say "plan and scenes"
cp "$EX/episode.json" "$P/episode.json"
cp "$EX/scenes/"*.tsx "$P/src/scenes/"
mkdir -p "$P/tools/cue_sheet.d" && cp "$EX/tools/cue_sheet.d/"*.json "$P/tools/cue_sheet.d/"
( cd "$P" && python3 "$PAPERCUT_LIB/papercut/stubs.py" >/dev/null && python3 "$PAPERCUT_LIB/tools/build_vo.py" >/dev/null )

say "typecheck"
( cd "$P" && npx tsc --noEmit )

say "sound effects and music bed"
if papercut_find_chrome >/dev/null; then
  ( cd "$P" && python3 "$PAPERCUT_LIB/tools/cues.py" >/dev/null && node "$PAPERCUT_LIB/audio/render.mjs" >/dev/null )
  [ "$(wc -c < "$P/public/audio/fx.wav")" -gt 20000 ] || { echo "selftest: fx.wav is empty" >&2; exit 1; }
else
  say "skipped: no Chrome or Chromium found (set CHROME_PATH); the audio render needs one"
fi

say "render one still"
( cd "$P" && npx remotion still Example out/selftest.png --frame=40 --log=error )
[ "$(wc -c < "$P/out/selftest.png")" -gt 50000 ] || { echo "selftest: still is empty or tiny" >&2; exit 1; }

if [ "$KEEP" = 1 ]; then say "ok, still at $P/out/selftest.png"; else rm -rf "$W"; say "ok"; fi
