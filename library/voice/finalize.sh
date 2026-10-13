#!/usr/bin/env bash
# Narrator takes -> ASR + pitch -> pick -> final lines -> ASR -> timing. Older voices' files stay untouched (names carry the ROLE).
#   usage: [ROLE=bot SCRIPT=dialogue.json] finalize.sh VOICE.json NARRATION_DIR TAKES_DIR [NUM.json]   (tempo + QA targets come from VOICE.json)
#     NARRATION_DIR holds script.json + build_timing.py; outputs go to its voice/final_<ROLE>/,
#     voice/chosen_<ROLE>.json, voice/asr_<ROLE>*.json, voice/pitch_<ROLE>.txt and (if build_timing.py exists) timing_<ROLE>.js
#   env: ROLE=narrator (output names; one per speaker in a dialogue), SCRIPT=script.json, SKIP_PICK=1 (reuse voice/picks_<ROLE>.json,
#        e.g. when only the tempo changed), ASR_PY (python with mlx-whisper, default python3),
#        QWEN_TTS_PY (python with librosa + numpy for the pitch pass, default python3; Qwen3-TTS installs librosa).
#   Tool output from the ASR and pitch passes goes to voice/finalize_<ROLE>.log. Needs ffmpeg, and rubberband when tempo != 1.
set -euo pipefail
rp() { python3 -c 'import os,sys;print(os.path.realpath(sys.argv[1]))' "$1"; }
if [ $# -lt 3 ]; then echo "usage: [ROLE=..] [SCRIPT=..] $0 VOICE.json NARRATION_DIR TAKES_DIR [NUM.json]" >&2; exit 2; fi

ROLE=${ROLE:-narrator}; SCRIPT=${SCRIPT:-script.json}; export ROLE
L=$(dirname "$(rp "${BASH_SOURCE[0]}")"); VJ=$(rp "$1"); N=$(rp "$2"); TK=$(rp "$3")
NUM=""; if [ -n "${4:-}" ]; then NUM=$(rp "$4"); fi
export VOICE_JSON=$VJ
# env.sh fills ASR_PY / QWEN_TTS_PY from the config file that voice/setup_tts.sh writes (variables already set win)
if [ -f "$L/../env.sh" ]; then . "$L/../env.sh"; fi
ASR=${ASR_PY:-python3}
QPY=${QWEN_TTS_PY:-python3}
TEMPO=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1])).get('tempo',1.0))" "$VJ")
cd "$N"
mkdir -p voice
LOG=voice/finalize_${ROLE}.log
if [ -z "${SKIP_PICK:-}" ]; then
  "$ASR" "$L/asr.py" "$TK"/*.wav > "voice/asr_${ROLE}_takes.json" 2>>"$LOG"
  "$QPY" "$L/analyze.py" "$TK"/*.wav > "voice/pitch_${ROLE}.txt" 2>>"$LOG"
  python3 "$L/pick.py" "$SCRIPT" "voice/asr_${ROLE}_takes.json" "voice/pitch_${ROLE}.txt" "voice/picks_${ROLE}.json" ${NUM:+"$NUM"}
fi
# manual overrides after you listen: voice/picks_override.json {"line": take}
if [ -f voice/picks_override.json ]; then
  python3 -c "import json,sys;r=sys.argv[1];p=json.load(open(f'voice/picks_{r}.json'));o=json.load(open('voice/picks_override.json'));p.update({k:v for k,v in o.items() if k in p});json.dump(p,open(f'voice/picks_{r}.json','w'),indent=1);print('override ->',p)" "$ROLE"
fi
mkdir -p "voice/final_$ROLE"
python3 - "$TK" "$TEMPO" <<'PY'
# trim + highpass -> (tempo != 1: Rubber Band R3 "fine" time-stretch, pitch kept) -> loudnorm, 48 kHz mono
import json, subprocess, sys, tempfile, os
tk, tempo = sys.argv[1], float(sys.argv[2])
role = os.environ.get("ROLE", "narrator")
picks = json.load(open(f"voice/picks_{role}.json")); chosen = {}
trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02"
norm = "loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000"
tmp = tempfile.mkdtemp()
for lid, k in picks.items():
    src, dst = f"{tk}/{lid}_{k}.wav", f"voice/final_{role}/{lid}.wav"
    if abs(tempo - 1.0) < 1e-6:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", f"{trim},areverse,{trim},areverse,highpass=f=70,{norm}", "-ac", "1", dst], check=True)
    else:
        a, b = os.path.join(tmp, "a.wav"), os.path.join(tmp, "b.wav")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", f"{trim},areverse,{trim},areverse,highpass=f=70", "-ac", "1", "-ar", "48000", a], check=True)
        subprocess.run(["rubberband", "-q", "--fine", "-T", str(tempo), a, b], check=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", b, "-af", norm, "-ac", "1", dst], check=True)
    chosen[lid] = dst
json.dump(chosen, open(f"voice/chosen_{role}.json", "w"), indent=1)
print("final lines at tempo", tempo, len(chosen))
PY
"$ASR" "$L/asr.py" voice/final_"$ROLE"/*.wav > "voice/asr_${ROLE}_final.json" 2>>"$LOG"
# narration timing (single narrator); dialogues build their timeline with tools/dialogue_timeline.py instead
if [ -f build_timing.py ]; then
  CHOSEN="voice/chosen_$ROLE.json" TIMING_OUT="timing_$ROLE.js" python3 build_timing.py "voice/asr_${ROLE}_final.json"
fi
