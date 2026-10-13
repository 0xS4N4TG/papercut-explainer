# SFX cue sheet → tools/cues.json for audio/render.mjs.   usage (from the papercut project dir): python3 $PAPERCUT_LIB/tools/cues.py
#   in : src/plan.json, tools/cue_sheet.json + tools/cue_sheet.d/*.json {"S01Hook": [["Ask", 0, "hit", -6], ...]}  (word prefix, nth match, sfx, offset frames)
#        episode.json "whipScene" (the scene that gets a whip instead of a cut), "cutSfx" (per-scene cut sound), "noAir", optional "outroLead" frames (default 40)
#   SFX names must exist in audio/sfx (see audio/CATALOG.md).
#   optional episode.json "sfxMinGapMs" (default 0 = off): drop a decorative cue (sparkle, pop, pop3, boing, toss, slide, tick)
#   when another cue already sits within that many ms before or after it, so layered hits don't pile up.
import json, re, os, sys
plan = json.load(open("src/plan.json")); FPS = plan["fps"]
EP = json.load(open("episode.json")) if os.path.exists("episode.json") else {}
SHEET = json.load(open("tools/cue_sheet.json")) if os.path.exists("tools/cue_sheet.json") else {}
# scene agents write their own rows to tools/cue_sheet.d/<Scene>.json (no write conflicts); those override the main sheet
import glob
for q in sorted(glob.glob("tools/cue_sheet.d/*.json")): SHEET.update(json.load(open(q)))
LIB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "audio", "sfx")
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
cues, bad = [], []
# optional episode.json "cutSfx": the sound on each scene start, {"*": default, "<Scene>": name}; "" = silent. Without it every
# cut gets "cut" (a soft swish) and whipScene gets "whip". Match the transition: tearAway "rip", tapePull "tape-peel", keyhole "click".
CUTSFX = EP.get("cutSfx", {})
for s in plan["scenes"]:
    if s["from"] > 0:
        cut = CUTSFX.get(s["id"], "whip" if s["id"] == EP.get("whipScene") else CUTSFX.get("*", "cut"))
        if cut: cues.append({"t": round(s["from"] / FPS, 3), "type": cut})
    for word, n, typ, off in SHEET.get(s["id"], []):
        hits = [w for w in s["words"] if norm(w["text"]).startswith(norm(word))]
        if len(hits) <= n: bad.append(f"{s['id']}: no word '{word}'#{n}"); continue
        if not os.path.exists(os.path.join(LIB, f"{typ}.js")): bad.append(f"{s['id']}: unknown sfx '{typ}'")
        cues.append({"t": round((s["from"] + hits[n]["f"] + off) / FPS, 3), "type": typ})
last = plan["scenes"][-1]
cues.append({"t": round((last["from"] + last["durationInFrames"] - EP.get("outroLead", 40)) / FPS, 3), "type": "outro"})
cues.sort(key=lambda c: c["t"])
gap = EP.get("sfxMinGapMs", 0) / 1000
if gap:
    DECOR = {"sparkle", "pop", "pop3", "boing", "toss", "slide", "tick"}
    keep = [c for c in cues if c["type"] not in DECOR]          # main hits, cuts, whips, outro always stay
    for c in (c for c in cues if c["type"] in DECOR):
        if all(abs(c["t"] - k["t"]) >= gap for k in keep): keep.append(c)
    print(f"declutter ({EP['sfxMinGapMs']} ms): {len(cues)} -> {len(keep)} cues"); cues = sorted(keep, key=lambda c: c["t"])
AIR = {"whoosh", "slide", "whip", "zoom", "swish"}           # airy sounds: more than about one per 2.5 s of reel gets distracting
air = sum(c["type"] in AIR for c in cues); dur = plan["durationInFrames"] / FPS
# episode.json "noAir": true (for a reel with no swoosh sounds at all) makes any airy sound an error
if EP.get("noAir"): bad += [f"air sound '{c['type']}' at {c['t']} s (noAir)" for c in cues if c["type"] in AIR | {"cut", "toss", "page-flip"}]
if air > dur / 2.5: print(f"NOTE {air} air sounds (whoosh/slide/whip/zoom) in {dur:.0f} s; budget is {int(dur / 2.5)}, one per 2.5 s. Swap entrances to pop/thud/stamp or drop them (a note, not a failure)")
json.dump({"dur": plan["durationInFrames"] / FPS, "cues": cues}, open("tools/cues.json", "w"))
print(len(cues), "cues"); [print("WARN", b) for b in bad]
sys.exit(1 if bad else 0)
