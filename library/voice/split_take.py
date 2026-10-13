# Split ONE whole-script narration take into per-line files without a seam. The voice keeps one pitch/energy arc and
# the per-line files butt back together into exactly the processed take (build_vo.py with "gap": 0).
#   usage: split_take.py TAKE.wav SCRIPT.json ASR_TAKES.json [NARRATION_DIR=.] [ROLE=narrator]
#     TAKE.wav       the chosen whole take (raw TTS output)
#     SCRIPT.json    the per-line script ([{id, text}, ...]); the lines' words must appear in order in the take
#     ASR_TAKES.json asr.py output that contains TAKE.wav (word times are shifted, nothing is re-transcribed)
#   post chain (ONCE, tempo 1.0): trim leading/trailing silence only (-45 dB), highpass 70 Hz, loudnorm I=-16:TP=-1.5:LRA=11,
#     48 kHz mono. Cuts fall in the MIDDLE of each pause between a line's last word and the next line's first word;
#     the inner edges are never trimmed. Cuts are sample-accurate; sample counts are verified.
#   out (in NARRATION_DIR): voice/final_ROLE/<id>.wav, voice/chosen_ROLE.json {id: path}, voice/asr_ROLE_final.json
#     (asr.py format, words re-timed to each line's own file). Then run build_timing.py:
#       CHOSEN=voice/chosen_narrator.json TIMING_OUT=timing_narrator.js python3 build_timing.py voice/asr_narrator_final.json
import json, os, re, sys, subprocess, difflib, tempfile, wave
take, script_p, asr_p = (os.path.abspath(a) for a in sys.argv[1:4])
nd = os.path.abspath(sys.argv[4]) if len(sys.argv) > 4 else os.getcwd()
role = sys.argv[5] if len(sys.argv) > 5 else "narrator"
SR = 48000
script = json.load(open(script_p)); asr = json.load(open(asr_p))
a = next((v for k, v in asr.items() if os.path.abspath(k) == take), None) or asr[next(k for k in asr if os.path.basename(k) == os.path.basename(take))]
out_dir = os.path.join(nd, "voice", f"final_{role}"); os.makedirs(out_dir, exist_ok=True)

# 1. one post-processing pass; leading trim offset measured from the raw take
trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02"
tmp = tempfile.mkdtemp(); full = os.path.join(tmp, "full.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", take, "-af", f"{trim},areverse,{trim},areverse,highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11,aresample={SR}", "-ac", "1", full], check=True)
# leading trim: how much the front silenceremove removed (find by trimming only the front, no gain change)
front = os.path.join(tmp, "front.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", take, "-af", trim, "-ac", "1", front], check=True)
def info(p):
    w = wave.open(p); return w.getnframes(), w.getframerate()
n_raw, sr_raw = info(take); n_front, _ = info(front)
lead = (n_raw - n_front) / sr_raw   # seconds removed at the start (raw take time -> processed time: t - lead)
w = wave.open(full); N = w.getnframes(); assert w.getframerate() == SR and w.getnchannels() == 1; pcm = w.readframes(N); w.close()

# 2. align ASR words to the script lines
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
sw, owner = [], []
for li, ln in enumerate(script):
    for t in ln["text"].split():
        if norm(t): sw.append(norm(t)); owner.append(li)
aw = [x for x in a["words"] if norm(x["w"])]
sm = difflib.SequenceMatcher(a=sw, b=[norm(x["w"]) for x in aw], autojunk=False)
amap = [None] * len(sw)
for blk in sm.get_matching_blocks():
    for k in range(blk.size): amap[blk.a + k] = blk.b + k
first, last = {}, {}
for i, j in enumerate(amap):
    if j is None: continue
    first.setdefault(owner[i], j); last[owner[i]] = j
miss = [i for i in range(len(script)) if i not in first]
if miss: sys.exit(f"no ASR words matched for lines {miss}")
sh = lambda t: t - lead   # raw time -> processed time
cuts = [0]
for li in range(1, len(script)):
    e = sh(aw[last[li - 1]]["e"]); s = sh(aw[first[li]]["s"])
    mid = int(round((e + s) / 2 * SR)) if s > e else int(round(s * SR))
    cuts.append(max(cuts[-1], min(N, mid)))
cuts.append(N)

# 3. write the pieces, verify they re-join to the processed take
chosen, outasr, total = {}, {}, 0
for li, ln in enumerate(script):
    s, e = cuts[li], cuts[li + 1]
    p = os.path.join(out_dir, ln["id"] + ".wav")
    with wave.open(p, "wb") as o:
        o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes(pcm[2 * s:2 * e])
    total += e - s; chosen[ln["id"]] = os.path.relpath(p, nd)
    t0 = s / SR; words = []
    lo = first[li]; hi = last[li]
    for x in aw[lo:hi + 1]:
        words.append({"w": x["w"], "s": round(max(0, sh(x["s"]) - t0), 3), "e": round(min((e - s) / SR, max(0, sh(x["e"]) - t0)), 3)})
    outasr[chosen[ln["id"]]] = {"text": " ".join(x["w"] for x in words), "words": words, "dur": (e - s) / SR}
assert total == N, (total, N)
joined = b"".join(wave.open(os.path.join(out_dir, l["id"] + ".wav")).readframes(10**9) for l in script)
assert joined == pcm, "pieces do not re-join to the processed take"
json.dump(chosen, open(os.path.join(nd, "voice", f"chosen_{role}.json"), "w"), indent=1)
json.dump(outasr, open(os.path.join(nd, "voice", f"asr_{role}_final.json"), "w"))
print(f"take {os.path.basename(take)}: lead trim {lead:.3f}s, {N} samples ({N/SR:.2f}s) = sum of {len(script)} pieces, joined audio identical")
print({l["id"]: round((cuts[i + 1] - cuts[i]) / SR, 2) for i, l in enumerate(script)})
