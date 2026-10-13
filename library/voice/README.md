# Voice pipeline (optional)

These scripts turn `narration/script.json` into one WAV per line plus a timing file with a start and end for every word. `tools/build_vo.py` then joins the lines into the reel's voiceover and cuts the scenes on the words. If you record the narration yourself or use another TTS, you can skip this folder. All the rest of the library needs is `voice/final_narrator/<id>.wav` and `timing_narrator.js` in the narration folder (the format `build_timing.py` writes). `tools/placeholder_vo.py` writes both from the script alone, with silence or the macOS `say` voice, so you can build and time a reel before any real voice exists.

It is the least tested part of the library. It was written on an Apple Silicon Mac with 24 GB of memory against Qwen3-TTS and mlx-whisper. The CUDA path in `narrate.py` and the faster-whisper path in `asr.py` were added later and have not been run on real hardware.

## Setup

`setup_tts.sh` builds a Python venv with `qwen-tts`, an ASR backend (mlx-whisper on Apple Silicon, faster-whisper elsewhere), librosa and soundfile. It downloads the model and writes `QWEN_TTS_PY` and `ASR_PY` into `~/.config/papercut-explainer/config.env`, which `env.sh` reads. Run `setup_tts.sh --help` for the options.

By hand, install `qwen-tts torch soundfile librosa numpy` plus `mlx-whisper` or `faster-whisper` into one Python 3.10 to 3.12 environment, and point `QWEN_TTS_PY` and `ASR_PY` at it. You also need ffmpeg, and the `rubberband` command line tool if you set a `tempo` other than 1.0.

Models. The default is `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` (about 4.2 GB), which picks one of the built-in speakers. A voice-clone setup uses `Qwen/Qwen3-TTS-12Hz-1.7B-Base`. The 0.6B versions are smaller and faster. The first run downloads the model into the Hugging Face cache. Afterwards `HF_HUB_OFFLINE=1` stops network checks.

## The scripts

| Script | What it does | Reads | Writes |
|---|---|---|---|
| `narrate.sh` / `narrate.py` | Generates `takes_per_line` takes (default 3) for every script line. Seed for take k is `SEED_BASE + 31k`. | `voice.json`, `<narration>/script.json` | `<narration>/voice/takes/narrator/<id>_<k>.wav` |
| `asr.py` | Transcribes WAVs with word timestamps. | WAV files | JSON on stdout: `{path: {text, words: [{w, s, e}], dur}}` |
| `analyze.py` | Median pitch, pitch spread, voiced fraction, peak and RMS per WAV. | WAV files | a table on stdout |
| `pick.py` | Picks one take per line. A take passes if its ASR text matches the script (ratio at least `asr_match`) and its median pitch is inside `median_pitch_hz`. Among passing takes it prefers the closest ASR match, then the shorter take with the wider pitch spread. | script, ASR JSON, pitch table, optional `NUM.json` | `picks_<ROLE>.json` `{id: take}` |
| `finalize.sh` | Runs the chain below. | `voice.json`, narration folder, takes folder | everything under `voice/` and `timing_<ROLE>.js` |
| `build_timing.py` | Aligns the ASR words to the script text and writes the timing file. Without ASR it estimates 2.75 words a second. | `script.json`, ASR JSON, env `CHOSEN` | `timing_<ROLE>.js` (env `TIMING_OUT`) |
| `split_take.py` | Splits one whole-script take into per-line files at the middle of each pause, with no seam. | the take, `script.json`, `asr.py` output for the take | `voice/final_<ROLE>/<id>.wav`, `chosen_<ROLE>.json`, `asr_<ROLE>_final.json` |
| `setup_tts.sh` | Builds the venv, downloads the model, runs a one-line smoke test. | none | venv, config file |

`finalize.sh VOICE.json NARRATION_DIR TAKES_DIR [NUM.json]` does this in order.

1. `asr.py` and `analyze.py` over every take. Their stderr goes to `voice/finalize_<ROLE>.log`.
2. `pick.py` chooses a take per line. Put corrections in `voice/picks_override.json` as `{"l3_name": 2}`, listen, and rerun with `SKIP_PICK=1`.
3. Each chosen take is trimmed of leading and trailing silence (below -45 dB), high-passed at 70 Hz, loudness-normalised to -16 LUFS and resampled to 48 kHz mono. If `tempo` is not 1.0, Rubber Band stretches it first and keeps the pitch.
4. `asr.py` runs again on the finished lines, and `build_timing.py` (if it is in the narration folder; `new_episode.sh` copies it there) writes `timing_<ROLE>.js`.

`NUM.json` maps a numeral in the script to how it is spoken, for example `{"13,000": "thirteen thousand"}`, so the ASR comparison doesn't fail on digits.

Layout of a narration folder after the run.

```
narration/
  script.json                      [{"id": "l1_hook", "text": "..."}, ...]
  build_timing.py                  copy made by new_episode.sh
  timing_narrator.js               read by tools/build_vo.py
  voice/
    takes/narrator/<id>_<k>.wav    raw takes
    asr_narrator_takes.json  pitch_narrator.txt  picks_narrator.json
    final_narrator/<id>.wav        the lines the reel uses
    chosen_narrator.json  asr_narrator_final.json  finalize_narrator.log
```

## voice.json

`voice.example.json` is a working custom-voice file. Copy it to `<series>/voice/voice.json` and edit.

| Key | Used by | Meaning |
|---|---|---|
| `speaker` | `narrate.py` | Built-in CustomVoice speaker name (for example `Ryan`). Its presence selects custom-voice mode. |
| `instruct` | `narrate.py` | Style instruction sent with every line. A script line can carry its own `instruct`. |
| `language` | `narrate.py` | Default `English`. |
| `sampling` | `narrate.py` | `temperature` (0.8), `top_p` (0.9), `max_new_tokens` (1536). |
| `takes_per_line` | `narrate.py` | Default 3. Env `TAKES` overrides it. |
| `model`, `clone_model` | `narrate.py` | Model repo. Optional. Without them custom mode uses `$QWEN_TTS_MODEL`, then the 1.7B CustomVoice model. |
| `ref_audio`, `ref_text`, `x_vector_only_mode` | `narrate.py` | Clone mode. `ref_audio` is a clip of the voice (path relative to `voice.json`), `ref_text` is its transcript. Having `ref_audio` selects clone mode and the Base model. Only clone a voice you have the right to use. |
| `tempo` | `finalize.sh` | 1.0 leaves the pace alone. Other values need `rubberband`. |
| `qa_targets.median_pitch_hz` | `pick.py` | `[low, high]`. Takes outside the range are rejected, so adjust it after you have heard a few takes. The example range is deliberately wide. |
| `qa_targets.asr_match` | `pick.py` | Minimum similarity (0 to 1) between the script and what ASR heard. Default 0.9. |
| `name` and any other key | nobody | Free-form notes. |

A script line may also carry `tts` (respelled text for pronunciation, while captions keep `text`) and, for dialogues, `speaker`.

## Environment variables

| Variable | Used by | Meaning | Default |
|---|---|---|---|
| `QWEN_TTS_PY` | `narrate.sh`, `finalize.sh` | Python with `qwen-tts` and torch (librosa for the pitch pass) | `python3` |
| `QWEN_TTS_HOME` | `narrate.sh` | Folder to add to `PYTHONPATH` for a source checkout of `qwen_tts` | unset |
| `QWEN_TTS_MODEL` | `narrate.py` | Model repo for custom-voice mode when `voice.json` has no `model` | `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` |
| `ASR_PY` | `finalize.sh` | Python with `mlx-whisper` or `faster-whisper` | `python3` |
| `FASTER_WHISPER_MODEL` | `asr.py` | Model name for the faster-whisper backend | `large-v3-turbo` |
| `HF_HUB_CACHE`, `HF_HOME`, `HF_HUB_OFFLINE` | `narrate.py` | Standard Hugging Face settings. The model is read from `$HF_HUB_CACHE`, else `$HF_HOME/hub`, else `~/.cache/huggingface/hub`, and downloaded if it is missing. | unset |
| `ROLE` | `finalize.sh`, `split_take.py` | Name used in output files, one per speaker in a dialogue | `narrator` |
| `SCRIPT` | `finalize.sh` | Script file inside the narration folder | `script.json` |
| `SKIP_PICK` | `finalize.sh` | Reuse `picks_<ROLE>.json` (for example after changing only `tempo`) | unset |
| `ONLY` | `narrate.py` | Comma-separated line ids to generate | all lines |
| `SPEAKER` | `narrate.py` | Only lines whose `speaker` matches (dialogue scripts) | all lines |
| `TAKES`, `SEED_BASE`, `TAKE0` | `narrate.py` | Takes per line, seed base (7), file index offset (0) | see `voice.json` |
| `TTS_TEXT` | `narrate.py` | Text to speak instead of each line's own | unset |

## Variations

- A seamless single take. Generate one take of the whole script (a one-line `script.json` whose text is every line joined, or `TTS_TEXT`), run `asr.py` on it, then `split_take.py TAKE.wav script.json asr.json [NARRATION_DIR] [ROLE]`. Then run `build_timing.py` as in the last item below, and set `"gap": 0` in `episode.json` so `build_vo.py` butts the pieces back together.
- Two speakers. Keep one `voice.json` per speaker, run `narrate.py` directly with `SPEAKER=<name>` and the dialogue script (`narrate.sh` always reads `script.json`), run `finalize.sh` with `ROLE=<name> SCRIPT=dialogue.json`, then build the timeline with `tools/dialogue_timeline.py`. No dialogue template ships with the library.
- Your own voiceover. Put one WAV per line in `voice/final_narrator/<id>.wav`, run `asr.py` over them into `voice/asr_narrator_final.json`, and run `CHOSEN=voice/chosen_narrator.json TIMING_OUT=timing_narrator.js python3 build_timing.py voice/asr_narrator_final.json` after writing `chosen_narrator.json` as `{id: "voice/final_narrator/<id>.wav"}`.
