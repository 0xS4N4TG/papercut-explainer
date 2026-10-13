# Pick one narrator take per line: the words must match the script (Whisper) and the pitch must sit in the
# narrator's pitch range (voice.json qa_targets); then prefer the tighter take with the livelier pitch spread.
#   usage: VOICE_JSON=voice.json pick.py SCRIPT.json ASR_TAKES.json PITCH.txt PICKS_OUT.json [NUM.json]
#   NUM.json maps a numeral in the script to how it is spoken ({"13,000": "thirteen thousand"}), so the ASR compare doesn't miss on digits.
import json, re, sys, difflib, os
V = json.load(open(os.environ["VOICE_JSON"]))
Q = V.get("qa_targets") or V.get("qa", {})
lo, hi = Q.get("median_pitch_hz") or Q.get("pitch_hz"); need = Q.get("asr_match") or Q.get("asr_match_min", 0.9)
script = {l["id"]: l["text"] for l in json.load(open(sys.argv[1]))}
asr = json.load(open(sys.argv[2]))
NUM = json.load(open(sys.argv[5])) if len(sys.argv) > 5 else {}
pitch = {}
for row in open(sys.argv[3]).read().splitlines()[1:]:
    p = row.split()
    if len(p) >= 4: pitch[p[0]] = (float(p[1]), float(p[2]), float(p[3]))   # dur, median Hz, spread (st)
norm = lambda t: [x for x in (re.sub(r"[^a-z0-9]", "", w.lower()) for w in t.split()) if x]
def spoken(t):
    for k, v in NUM.items(): t = t.replace(k, v)
    return t.replace("-", " ")
picks, report = {}, []
for lid, text in script.items():
    cands = []
    for path, v in asr.items():
        f = os.path.basename(path)
        if not re.fullmatch(re.escape(lid) + r"_\d+\.wav", f): continue
        r = difflib.SequenceMatcher(a=norm(spoken(text)), b=norm(spoken(v["text"]))).ratio()
        _, hz, spread = pitch.get(f, (0, 0, 0))
        ok = r >= need and lo <= hz <= hi
        cands.append((not ok, -round(r, 2), v["dur"] - 0.08 * spread, f, r, hz, spread, v["dur"], v["text"]))
    if not cands: continue   # line belongs to another speaker (dialogue) or has no takes
    cands.sort(); best = cands[0]
    picks[lid] = int(best[3].rsplit("_", 1)[1].split(".")[0])
    for c in cands:
        report.append(f"{'*' if c is best else ' '}{'!' if c[0] else ' '} {c[3]:20s} match {c[4]:.2f} {c[5]:4.0f} Hz spread {c[6]:4.1f} {c[7]:4.1f}s | {c[8]}")
json.dump(picks, open(sys.argv[4], "w"), indent=1)
print("\n".join(report)); print(picks)
