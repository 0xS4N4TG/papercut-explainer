#!/usr/bin/env bash
# narrate.sh VOICE.json NARRATION_DIR  -> NARRATION_DIR/voice/takes/narrator/<line>_<k>.wav   (extra env as narrate.py)
#   env: QWEN_TTS_PY   python with qwen-tts + torch installed (default python3)
#        QWEN_TTS_HOME optional folder to put on PYTHONPATH, if you run qwen_tts from a source checkout instead of pip
#        HF_HUB_OFFLINE=1 optional, once the model is cached, to stop Hugging Face network checks
set -euo pipefail
rp() { python3 -c 'import os,sys;print(os.path.realpath(sys.argv[1]))' "$1"; }
if [ $# -lt 2 ]; then echo "usage: $0 VOICE.json NARRATION_DIR" >&2; exit 2; fi
L=$(dirname "$(rp "${BASH_SOURCE[0]}")"); N=$(rp "$2")
# env.sh fills QWEN_TTS_PY etc. from the config file that voice/setup_tts.sh writes (variables already set win)
if [ -f "$L/../env.sh" ]; then . "$L/../env.sh"; fi
if [ -n "${QWEN_TTS_HOME:-}" ]; then export PYTHONPATH="$QWEN_TTS_HOME${PYTHONPATH:+:$PYTHONPATH}"; fi
exec "${QWEN_TTS_PY:-python3}" -u "$L/narrate.py" "$(rp "$1")" "$N/script.json" "$N/voice/takes/narrator"
