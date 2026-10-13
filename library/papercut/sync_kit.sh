#!/usr/bin/env bash
# Copy the shared kit into a project's src/lib/ (and the default paper textures, backdrops and fonts into public/).
#   usage: sync_kit.sh <papercut project dir> [series assets dir to overlay on public/]
# The copy is a snapshot: old episodes keep rendering the same even after the library changes. Never edit src/lib in a project;
# fix the library, then re-sync (and run tools/harvest.py first if the project has local kit edits). Needs rsync.
set -euo pipefail

rp() { python3 -c 'import os,sys;print(os.path.realpath(sys.argv[1]))' "$1"; }

if [ $# -lt 1 ]; then echo "usage: $0 <papercut project dir> [assets dir]" >&2; exit 2; fi
L=$(dirname "$(rp "${BASH_SOURCE[0]}")"); P=$(rp "$1")
mkdir -p "$P/src/lib" "$P/public/bg" "$P/public/assets" "$P/public/bg/backdrops" "$P/public/bg/textures"
rsync -a --delete "$L/kit/" "$P/src/lib/"
printf '%s\n' "synced from papercut/kit on $(date '+%Y-%m-%d %H:%M'); do not edit here, edit the library and re-sync" > "$P/src/lib/SYNCED.txt"
[ -f "$P/public/bg/grain.png" ] || cp "$L/public/bg/grain.png" "$P/public/bg/"
[ -f "$P/public/assets/wall.png" ] || cp "$L/public/assets/wall.png" "$P/public/assets/"
# paper-diorama backdrops (kit/paper/backdrops.tsx), copied additively so a project keeps any it already has
if [ -d "$L/public/bg/backdrops" ]; then rsync -a "$L/public/bg/backdrops/" "$P/public/bg/backdrops/"; fi
# texture overlays for kit/paper/look.tsx (felt fibre loop, lens dirt, halftone, graph paper), additive the same way
if [ -d "$L/public/bg/textures" ]; then rsync -a "$L/public/bg/textures/" "$P/public/bg/textures/"; fi
# local font files (kit/fonts.ts loads them; renders never fetch fonts from the network)
mkdir -p "$P/public/fonts" && rsync -a "$L/public/fonts/" "$P/public/fonts/"
# optional series assets (your own textures, logos, ...) copied over the defaults
if [ -n "${2:-}" ]; then rsync -a "$(rp "$2")/" "$P/public/"; fi
echo "kit -> $P/src/lib ($(find "$P/src/lib" -name '*.ts*' | wc -l | tr -d ' ') files)"
