# Dialogue timeline for two-speaker videos: place each speaker's final line WAVs on one track with
# per-line gaps, cut interrupted lines partway through a word, and write per-frame "talking" flags for mouth flaps.
# No dialogue template ships with the library; this is for projects that bring their own scenes.
#   usage (from the Remotion project; needs numpy + soundfile, so use $PAPERCUT_PY if python3 lacks them):
#     python3 dialogue_timeline.py timing.json
#   timing.json:
#     {"dialogue": "../narration/dialogue.json",                       # [{id, speaker, text, cut?: "word"}]
#      "finals": {"bot": "../narration/voice/final_bot", "human": "../narration/voice/final_human"},
#      "asr":    {"bot": "../narration/voice/asr_bot_final.json", ...}, # word timings, only needed for "cut" lines
#      "fps": 30, "start": 0.8, "tail": 2.4, "gap_same": 0.28, "gap_change": 0.4, "gaps": {"d21": 1.1}, "wps": 2.6,
#      "cut_at": 0.62}                                                  # fraction of the cut word that stays
#   writes src/timeline.json {fps, dur, lines: [{id, speaker, text, from, to}], talk: {speaker: "0110..."}} and public/vo/vo.wav.
#   A missing WAV gets a placeholder length (words / wps) and silence, so the picture can be blocked out before the voice exists.
import json, os, re, sys
import numpy as np, soundfile as sf

cfg = json.load(open(sys.argv[1])); base = os.path.dirname(os.path.abspath(sys.argv[1]))
P = lambda p: p if os.path.isabs(p) else os.path.join(base, p)
SR, fps = 48000, cfg.get("fps", 30)
lines = json.load(open(P(cfg["dialogue"])))
asr = {}
for spk, p in cfg.get("asr", {}).items():
    if os.path.exists(P(p)): asr.update({os.path.basename(k)[:-4]: v for k, v in json.load(open(P(p))).items()})
norm = lambda w: re.sub(r"[^a-z]", "", w.lower())

clips, t, prev, out = [], cfg.get("start", 0.8), None, []
for ln in lines:
    wav = os.path.join(P(cfg["finals"][ln["speaker"]]), f"{ln['id']}.wav")
    if os.path.exists(wav):
        a, sr = sf.read(wav, dtype="float32")
        if a.ndim > 1: a = a.mean(1)
        if sr != SR: a = np.interp(np.arange(int(len(a) * SR / sr)) / SR, np.arange(len(a)) / sr, a).astype("float32")
        if ln.get("cut"):
            ws = [w for w in asr.get(ln["id"], {}).get("words", []) if norm(w["w"]).startswith(norm(ln["cut"])[:5])]
            if ws:
                w = ws[-1]; end = int((w["s"] + cfg.get("cut_at", .62) * (w["e"] - w["s"])) * SR)
                a = a[:end].copy(); fade = int(.025 * SR); a[-fade:] *= np.linspace(1, 0, fade)
            else: print("warning: cut word not found in ASR for", ln["id"])
    else:
        a = np.zeros(int((len(ln["text"].split()) / cfg.get("wps", 2.6) + .25) * SR), "float32"); print("placeholder:", ln["id"])
    if prev is not None:
        t += cfg.get("gaps", {}).get(ln["id"], cfg.get("gap_same", .28) if ln["speaker"] == prev["speaker"] else cfg.get("gap_change", .4))
    clips.append((t, a, ln)); out.append({"id": ln["id"], "speaker": ln["speaker"], "text": ln["text"],
                                          "from": int(round(t * fps)), "to": int(round((t + len(a) / SR) * fps))})
    t += len(a) / SR; prev = ln
dur = t + cfg.get("tail", 2.4); nF = int(np.ceil(dur * fps))
vo = np.zeros(int(dur * SR) + SR, "float32")
talk = {s: np.zeros(nF, bool) for s in cfg["finals"]}
for t0, a, ln in clips:
    i = int(t0 * SR); vo[i:i + len(a)] += a
    hop = SR // fps; peak = 1e-9
    rms = np.array([np.sqrt(np.mean(a[k * hop:(k + 1) * hop] ** 2) + 1e-12) for k in range(len(a) // hop)])
    if rms.size and rms.max() > 1e-4:
        on = rms > max(.012, .14 * np.percentile(rms, 95))
        for k in range(1, len(on) - 2):                                   # bridge 1-2 frame dips inside words
            if not on[k] and on[k - 1] and (on[k + 1] or on[k + 2]): on[k] = True
        f0 = int(round(t0 * fps)); talk[ln["speaker"]][f0:f0 + len(on)] |= on[: max(0, nF - f0)]
os.makedirs(os.path.join(base, "public/vo"), exist_ok=True); os.makedirs(os.path.join(base, "src"), exist_ok=True)
sf.write(os.path.join(base, "public/vo/vo.wav"), vo[: int(dur * SR)], SR, subtype="PCM_16")
json.dump({"fps": fps, "dur": nF, "lines": out, "talk": {s: "".join("1" if x else "0" for x in v) for s, v in talk.items()}},
          open(os.path.join(base, "src/timeline.json"), "w"))
print(f"{len(out)} lines, {dur:.2f} s = {nF} frames ->", "src/timeline.json + public/vo/vo.wav")
for o in out: print(f"  {o['id']} {o['speaker']:5s} {o['from']/fps:6.2f}-{o['to']/fps:6.2f}  {o['text']}")
