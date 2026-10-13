# Generate narration takes for every script line with a series' voice settings (voice.json, see voice.example.json).
# Run one process at a time: the 1.7B model is memory-hungry (written on a 24 GB Apple Silicon machine).
#   usage: narrate.py VOICE.json SCRIPT.json OUT_DIR   (python with qwen-tts + torch; narrate.sh sets that up from QWEN_TTS_PY / QWEN_TTS_HOME)
#   The model comes from the local Hugging Face cache ($HF_HUB_CACHE, else $HF_HOME/hub, else ~/.cache/huggingface/hub) and is downloaded on first use.
#   env: ONLY=l1_hook,l3_name (lines)  SPEAKER=bot (only lines whose "speaker" matches; dialogue scripts)  TAKES=3  SEED_BASE=7 (seed = base + 31k)  TAKE0=0 (file index offset)  TTS_TEXT=override text
#   voice.json: clone mode if it has "ref_audio" + "ref_text" (Base 1.7B ICL clone), custom mode if it has "speaker" (CustomVoice 1.7B).
#               Optional "model" / "clone_model" name another repo, e.g. the 0.6B models.
#   A script line may carry "tts": "<respelled text>" to change pronunciation while captions keep "text",
#   and "instruct": "<style>" to override voice.json's instruct for that line (custom mode only).
import os, sys, json, glob, time
os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")
import torch, soundfile as sf
from qwen_tts import Qwen3TTSModel
vpath, spath, out = sys.argv[1], sys.argv[2], sys.argv[3]
V = json.load(open(vpath)); lines = json.load(open(spath)); os.makedirs(out, exist_ok=True)
clone = "ref_audio" in V
# model: voice.json "clone_model" / "model", else $QWEN_TTS_MODEL (custom mode; setup_tts.sh writes it), else the 1.7B model for the mode
repo = V.get("clone_model") or V.get("model") or (None if clone else os.environ.get("QWEN_TTS_MODEL")) or ("Qwen/Qwen3-TTS-12Hz-1.7B-" + ("Base" if clone else "CustomVoice"))
hub = os.environ.get("HF_HUB_CACHE") or os.path.join(os.environ.get("HF_HOME", os.path.expanduser("~/.cache/huggingface")), "hub")
snaps = sorted(glob.glob(os.path.join(hub, "models--" + repo.replace("/", "--"), "snapshots", "*")))
snap = snaps[-1] if snaps else repo          # not cached yet: from_pretrained downloads it
dev = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"   # cuda path is untested
model = Qwen3TTSModel.from_pretrained(snap, device_map=dev, dtype=torch.float32 if dev == "cpu" else torch.bfloat16, attn_implementation="sdpa")
if clone:
    ref = V["ref_audio"] if os.path.isabs(V["ref_audio"]) else os.path.join(os.path.dirname(os.path.abspath(vpath)), V["ref_audio"])
    prompt = model.create_voice_clone_prompt(ref_audio=ref, ref_text=V["ref_text"], x_vector_only_mode=V.get("x_vector_only_mode", False))
only = os.environ.get("ONLY", "").split(",") if os.environ.get("ONLY") else None
spk = os.environ.get("SPEAKER")
takes = int(os.environ.get("TAKES", V.get("takes_per_line", 3))); base = int(os.environ.get("SEED_BASE", "7")); t0 = int(os.environ.get("TAKE0", "0"))
samp = V.get("sampling", {})
for ln in lines:
    if only and ln["id"] not in only: continue
    if spk and ln.get("speaker") != spk: continue
    for k in range(takes):
        torch.manual_seed(base + 31 * k); t = time.time()
        kw = dict(text=os.environ.get("TTS_TEXT") or ln.get("tts", ln["text"]), language=V.get("language", "English"), max_new_tokens=samp.get("max_new_tokens", 1536),
                  do_sample=True, temperature=samp.get("temperature", 0.8), top_p=samp.get("top_p", 0.9))
        if clone: wavs, sr = model.generate_voice_clone(voice_clone_prompt=prompt, non_streaming_mode=True, **kw)
        else: wavs, sr = model.generate_custom_voice(speaker=V["speaker"], instruct=ln.get("instruct", V.get("instruct", "")), non_streaming_mode=True, **kw)
        p = os.path.join(out, f"{ln['id']}_{k + t0}.wav"); sf.write(p, wavs[0], sr)
        print(p, f"{len(wavs[0])/sr:.1f}s in {time.time()-t:.0f}s", flush=True)
