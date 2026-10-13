#!/usr/bin/env bash
# Render the episode in the current Remotion project dir (episode.json {"comp": "...", "out": "name"}) -> out/<out>.mp4
# A wrapper around render.py: bundle once, per-scene ProRes cache, grouped parallel jobs, one final x264 encode,
# audio mix in parallel. Flags: --workers N (default 3), --conc N (tabs per job, default $CONC or 4), --force, --keep.
# env: PAPERCUT_PY (python with numpy + soundfile for the audio mix, default python3)
set -euo pipefail
HERE=$(dirname "$(python3 -c 'import os,sys;print(os.path.realpath(sys.argv[1]))' "${BASH_SOURCE[0]}")")
if [ -f "$HERE/../env.sh" ]; then . "$HERE/../env.sh"; fi   # fills PAPERCUT_PY from the config file, if any
exec "${PAPERCUT_PY:-python3}" -u "$HERE/render.py" "$@"
