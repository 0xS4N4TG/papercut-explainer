# Butt the final narration lines together, write word captions and the scene plan. Config: episode.json
#   {"narration": "../narration", "timing": "timing_narrator.js", "fps": 30, "start": 0.2, "gap": 0.22, "hold": 2.3,
#    "scenes": [["S01Hook", "l1_hook", 0], ["S02Yes", "l1_hook", "and"], ...]}   (first word: index or exact word)
#    "hook": {...}   (optional, see below)
#   out: public/vo/voiceover.wav, public/vo/captions.json (Remotion Caption[]), src/plan.json
#   usage (from the Remotion project dir): python3 $PAPERCUT_LIB/tools/build_vo.py
import json, os, subprocess, wave
EP = json.load(open("episode.json"))
SRC = EP.get("narration", "../narration")
FPS, START, GAP, HOLD = EP.get("fps", 30), EP.get("start", 0.2), EP.get("gap", 0.22), EP.get("hold", 2.3)
VO = json.loads(open(f"{SRC}/" + os.environ.get("VO_TIMING", EP.get("timing", "timing_narrator.js"))).read().split("const VO = ", 1)[1].rstrip().rstrip(";"))
SCENES = [tuple(s) for s in EP["scenes"]]
GAPS = EP.get("gaps", {})

words, t, parts, line_at = [], START, [], {}
for lid in VO["order"]:
    seg = VO["seg"][lid]
    w = wave.open(f"{SRC}/{seg['file']}"); dur = w.getnframes() / w.getframerate()
    line_at[lid] = (t, len(words))
    for x in seg["words"]:
        words.append({"text": x["w"], "startMs": round((t + x["s"]) * 1000), "endMs": round((t + x["e"]) * 1000), "line": lid})
    parts.append((seg["file"], t)); t += dur + GAP + GAPS.get(lid, 0)   # "gaps": {"l7_setup": 0.3} = an extra beat after a line
total = t - GAP + HOLD

os.makedirs("public/vo", exist_ok=True)
inp, flt = [], []
for k, (f, at) in enumerate(parts):
    inp += ["-i", f"{SRC}/{f}"]; ms = int(round(at * 1000))
    flt.append(f"[{k}:a]aresample=48000,adelay={ms}[a{k}]")
flt.append("".join(f"[a{k}]" for k in range(len(parts))) + f"amix=inputs={len(parts)}:normalize=0,apad,atrim=0:{total:.3f}[o]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *inp, "-filter_complex", ";".join(flt), "-map", "[o]", "-ac", "1", "public/vo/voiceover.wav"], check=True)
# silent music/fx placeholders until audio/render.mjs writes the real ones, so scene agents' qa.sh renders work
os.makedirs("public/audio", exist_ok=True)
for a in ("music", "fx"):
    if not os.path.exists(f"public/audio/{a}.wav"):
        subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", f"{total:.3f}", f"public/audio/{a}.wav"], check=True)

caps = [{"text": (" " if i else "") + w["text"], "startMs": w["startMs"], "endMs": w["endMs"], "timestampMs": (w["startMs"] + w["endMs"]) // 2, "confidence": 1}
        for i, w in enumerate(words)]
json.dump(caps, open("public/vo/captions.json", "w"))

starts = []
for sid, lid, first in SCENES:
    base = line_at[lid][1]; lw = [w for w in words if w["line"] == lid]
    idx = first if isinstance(first, int) else next(i for i, w in enumerate(lw) if w["text"] == first)
    starts.append(base + idx)
cut = [0] + [round((words[i]["startMs"] / 1000 - 0.08) * FPS) for i in starts[1:]] + [round(total * FPS)]
plan = {"fps": FPS, "durationInFrames": cut[-1], "scenes": []}
for k, (sid, lid, _) in enumerate(SCENES):
    a, b = cut[k], cut[k + 1]
    ws = [{"text": w["text"], "f": round(w["startMs"] / 1000 * FPS) - a, "e": round(w["endMs"] / 1000 * FPS) - a}
          for w in words if a <= round(w["startMs"] / 1000 * FPS) < b]
    plan["scenes"].append({"id": sid, "from": a, "durationInFrames": b - a, "words": ws})
# Optional hook title (the cover text on screen from frame 0; see kit/paper/hook.tsx):
#   "hook": {"lines": [["AI", "LEAKED"], ["13,000+"]], "hot": ["13,000+"], "until": "yes" | ["yes", 2], "size": 108, "top": 220}
#   It leaves at the onset of the `until` word (its n-th occurrence), or after "hold" seconds (default 2.4).
H = EP.get("hook")
if H:
    if "until" in H:
        uw, un = (H["until"], 1) if isinstance(H["until"], str) else H["until"]
        hits = [w for w in words if w["text"].strip(".,!?;:'\"").lower() == uw.lower()]
        out = round(hits[un - 1]["startMs"] / 1000 * FPS)
    else:
        out = round(H.get("hold", 2.4) * FPS)
    plan["hook"] = {**{k: v for k, v in H.items() if k not in ("until", "hold")}, "outAt": out}
    print(f"hook title until frame {out} ({out / FPS:.2f}s)")
json.dump(plan, open("src/plan.json", "w"), indent=1)
for s in plan["scenes"]:
    flag = "  <-- under 1.2 s: merge it into a neighbour" if s["durationInFrames"] < 36 else ""
    print(f"{s['id']:16s} {s['from']/FPS:6.2f}s  {s['durationInFrames']/FPS:4.2f}s  " + " ".join(f"{w['text']}@{w['f']}" for w in s["words"]) + flag)
print("total", round(total, 2), "s", cut[-1], "frames")
