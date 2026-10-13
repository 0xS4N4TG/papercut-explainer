# Mix the final audio outside Remotion: VO + music (ducked exactly like PapercutVideo.musicVolume) + fx x0.9.
#   out: out/chunks/mix_raw.wav  (then alimiter + loudnorm -14 LUFS in render.sh)
#   Dialogue projects (src/timeline.json, public/vo/vo.wav) duck under the dialogue lines instead of captions;
#   episode.json "duck": [floor, ramp_ms] sets how far and how slowly the music dips (default [0.45, 400]).
import json, os, numpy as np, soundfile as sf
SR = 48000
ep = json.load(open("episode.json")) if os.path.exists("episode.json") else {}
floor, ramp = ep.get("duck", [0.45, 400])
if os.path.exists("src/plan.json"):
    caps = json.load(open("public/vo/captions.json")); plan = json.load(open("src/plan.json")); VO = "public/vo/voiceover.wav"
else:
    tl = json.load(open("src/timeline.json")); VO = "public/vo/vo.wav"
    plan = {"durationInFrames": tl["dur"], "fps": tl["fps"]}
    caps = [{"startMs": l["from"] / tl["fps"] * 1000, "endMs": l["to"] / tl["fps"] * 1000} for l in tl["lines"]]
n = int(round(plan["durationInFrames"] / plan["fps"] * SR))
def load(p):
    a, sr = sf.read(p, always_2d=True)
    assert sr == SR, (p, sr)
    a = a.mean(1, keepdims=True).repeat(2, 1) if a.shape[1] == 1 else a[:, :2]
    out = np.zeros((n, 2)); out[:min(n, len(a))] = a[:n]; return out
vo, music, fx = load(VO), load("public/audio/music.wav"), load("public/audio/fx.wav")
# duck curve, evaluated per video frame then interpolated per sample (Remotion applies volume per frame)
frames = np.arange(plan["durationInFrames"] + 1)
ms = frames / plan["fps"] * 1000
spans = np.array([[c["startMs"], c["endMs"]] for c in caps])
gap = np.min(np.where(ms[:, None] < spans[:, 0], spans[:, 0] - ms[:, None], np.where(ms[:, None] > spans[:, 1], ms[:, None] - spans[:, 1], 0)), axis=1)
vol = floor + (1 - floor) * np.clip((gap - 150) / ramp, 0, 1)
duck = np.interp(np.arange(n) / SR * plan["fps"], frames, vol)[:, None]
mix = vo + music * duck + fx * 0.9
sf.write("out/chunks/mix_raw.wav", mix, SR, subtype="FLOAT")
print("mix_raw.wav", n / SR, "s, peak", float(np.abs(mix).max()))
