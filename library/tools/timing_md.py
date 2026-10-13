#!/usr/bin/env python3
"""Write the "## Timing" section of STORYBOARD.md from src/plan.json (run from the papercut project dir after build_vo.py).

  python3 $PAPERCUT_LIB/tools/timing_md.py

Replaces everything from the "## Timing" heading to the end of the file with the scene table (absolute frames) and the
per-scene word-cue table that `cueOf(ID)(word, n)` returns, so scene agents never need plan.json itself.
"""
import json
import os

plan = json.load(open('src/plan.json'))
fps = plan['fps']
out = ['## Timing (generated from the narration by tools/timing_md.py)', '',
       f"Total {plan['durationInFrames']} frames ({plan['durationInFrames'] / fps:.2f} s)."]
if plan.get('hook'):
    out.append(f"Hook title (global): frames 0–{plan['hook']['outAt']}; the banner starts at frame {plan['hook']['outAt']}.")
out += ['', '| Scene | from (abs f) | dur (f) | dur (s) |', '|---|---|---|---|']
out += [f"| {s['id']} | {s['from']} | {s['durationInFrames']} | {s['durationInFrames'] / fps:.2f} |" for s in plan['scenes']]
out += ['', "Word cue frames (relative to each scene's start; `cueOf(ID)('word', n)` returns these):", '', '```']
out += [f"{s['id']:<14} " + ' '.join(f"{w['text']}@{w['f']}" for w in s['words']) for s in plan['scenes']]
out += ['```', '']
md = open('STORYBOARD.md').read() if os.path.exists('STORYBOARD.md') else ''
i = md.find('## Timing')
open('STORYBOARD.md', 'w').write((md[:i] if i >= 0 else md.rstrip() + '\n\n') + '\n'.join(out))
print(f"timing written: {len(plan['scenes'])} scenes, {plan['durationInFrames']} frames")
