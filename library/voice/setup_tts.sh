#!/usr/bin/env bash
# Set up local voiceover: a Python venv with Qwen3-TTS, a word-timing ASR backend and audio analysis,
# the model download, and a one-line smoke test through the real narrate.py.
#   usage: library/voice/setup_tts.sh [--model 1.7B|0.6B] [--with-clone] [--venv-dir DIR]
#                                     [--skip-download] [--skip-smoke] [--yes]
#   --model 1.7B   Qwen3-TTS CustomVoice 1.7B, ~4.2 GB, better prosody (default)
#   --model 0.6B   CustomVoice 0.6B, ~2.3 GB, lighter and faster
#   --with-clone   also fetch the Base model of that size (voice cloning from a reference clip), same size again
# Writes QWEN_TTS_PY and ASR_PY into the papercut config file (see ../env.sh), so every voice script finds the venv.
# Backends: Apple Silicon -> mps + mlx-whisper; NVIDIA -> cuda + faster-whisper; anything else -> cpu (slow: minutes per line).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "$HERE/../env.sh"

MODEL_SIZE=1.7B; WITH_CLONE=0; SKIP_DL=0; SKIP_SMOKE=0; ASSUME_YES=0
DATA="${XDG_DATA_HOME:-$HOME/.local/share}/papercut-explainer"
VENV="${PAPERCUT_VOICE_VENV:-$DATA/voice-venv}"
while [ $# -gt 0 ]; do
  case "$1" in
    --model) MODEL_SIZE=$2; shift 2 ;;
    --with-clone) WITH_CLONE=1; shift ;;
    --venv-dir) VENV=$2; shift 2 ;;
    --skip-download) SKIP_DL=1; shift ;;
    --skip-smoke) SKIP_SMOKE=1; shift ;;
    --yes|-y) ASSUME_YES=1; shift ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done
case "$MODEL_SIZE" in 1.7B) GB=4.2 ;; 0.6B) GB=2.3 ;; *) echo "--model must be 1.7B or 0.6B" >&2; exit 2 ;; esac
REPO_CUSTOM="Qwen/Qwen3-TTS-12Hz-$MODEL_SIZE-CustomVoice"; REPO_BASE="Qwen/Qwen3-TTS-12Hz-$MODEL_SIZE-Base"

say() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

# ---- platform ----
OS="$(uname -s)"; ARCH="$(uname -m)"
if [ "$OS" = Darwin ] && [ "$ARCH" = arm64 ]; then DEVICE=mps; ASR=mlx-whisper
elif command -v nvidia-smi >/dev/null 2>&1; then DEVICE=cuda; ASR=faster-whisper
else DEVICE=cpu; ASR=faster-whisper; fi
[ "$OS" = Darwin ] || [ "$OS" = Linux ] || die "unsupported OS $OS (macOS and Linux only)"
say "device: $DEVICE, ASR: $ASR"
[ "$DEVICE" = cpu ] && echo "    no GPU found: generation works but takes minutes per line. Consider recording the voiceover yourself." >&2

# ---- confirm the download ----
if [ "$SKIP_DL" = 0 ] && [ "$ASSUME_YES" = 0 ]; then
  EXTRA=""; [ "$WITH_CLONE" = 1 ] && EXTRA=" + $GB GB for the clone model"
  printf 'This downloads about %s GB%s into the Hugging Face cache and builds a ~1.5 GB venv at %s. Continue? [Y/n] ' "$GB" "$EXTRA" "$VENV"
  read -r a; case "$a" in n|N|no) echo "skipped"; exit 0 ;; esac
fi

# ---- venv ----
make_venv() {
  if command -v uv >/dev/null 2>&1; then
    uv venv --python 3.12 "$VENV" >/dev/null && USE_UV=1
  else
    PY=""; for c in python3.12 python3.11 python3.10; do command -v "$c" >/dev/null 2>&1 && { PY="$(command -v "$c")"; break; }; done
    [ -n "$PY" ] || die "need Python 3.10-3.12 (Qwen3-TTS has no wheels for newer versions yet). Install one: 'brew install python@3.12' or install uv (https://docs.astral.sh/uv/) and rerun."
    "$PY" -m venv "$VENV"; USE_UV=0
    "$VENV/bin/python" -m pip install -q -U pip
  fi
}
pipi() { if [ "${USE_UV:-0}" = 1 ]; then uv pip install -q --python "$VENV/bin/python" "$@"; else "$VENV/bin/python" -m pip install -q "$@"; fi; }

USE_UV=0
if [ -x "$VENV/bin/python" ]; then
  say "reusing venv $VENV"; command -v uv >/dev/null 2>&1 && USE_UV=1
else
  say "creating venv $VENV"; mkdir -p "$(dirname "$VENV")"; make_venv
fi
say "installing qwen-tts, $ASR, librosa, soundfile (a few minutes; torch is large)"
pipi -U qwen-tts "$ASR" librosa soundfile numpy huggingface_hub
"$VENV/bin/python" -c "import qwen_tts, torch, soundfile, librosa; print('imports ok, torch', torch.__version__)"

# ---- models ----
if [ "$SKIP_DL" = 0 ]; then
  export HF_HUB_DISABLE_XET=1   # the xet transport stalls on some networks; plain HTTP resumes
  fetch() {
    say "fetching $1"
    for try in 1 2 3; do
      "$VENV/bin/python" -c "from huggingface_hub import snapshot_download as s; print(s('$1'))" && return 0
      echo "    attempt $try failed, retrying" >&2; sleep 3
    done
    die "could not download $1 (network?). Rerun the script; finished files are kept."
  }
  fetch "$REPO_CUSTOM"
  [ "$WITH_CLONE" = 1 ] && fetch "$REPO_BASE"
fi

papercut_config_set QWEN_TTS_PY "$VENV/bin/python"
papercut_config_set ASR_PY "$VENV/bin/python"
papercut_config_set QWEN_TTS_MODEL "$REPO_CUSTOM"
say "config written: QWEN_TTS_PY, ASR_PY, QWEN_TTS_MODEL"

# ---- smoke test through the real pipeline ----
if [ "$SKIP_SMOKE" = 0 ]; then
  T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
  printf '{"speaker":"Ryan","model":"%s","instruct":"friendly, natural, conversational","takes_per_line":1}\n' "$REPO_CUSTOM" > "$T/voice.json"
  printf '[{"id":"l1","text":"Paper cut explainers, now with a real voice."}]\n' > "$T/script.json"
  say "smoke test: generating one line (the first run loads the model, allow a minute or two)"
  TAKES=1 "$VENV/bin/python" -u "$HERE/narrate.py" "$T/voice.json" "$T/script.json" "$T/out"
  W="$T/out/l1_0.wav"; [ -s "$W" ] || die "smoke test produced no audio"
  "$VENV/bin/python" - "$W" <<'PY' || die "generated audio is silent or too short"
import sys, soundfile as sf, numpy as np
a, sr = sf.read(sys.argv[1]); d = len(a) / sr
assert d > 1.0 and float(np.abs(a).max()) > 0.01, (d, float(np.abs(a).max()))
print(f"audio ok: {d:.1f}s")
PY
  say "voice ready"
fi
