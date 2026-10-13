# Papercut library

A Remotion kit for short vertical (9:16) explainer reels in a cut-paper style, plus the scripts around it. The kit has paper components, 24 backdrops, camera moves, scene transitions and film-look layers. The audio folder has 79 sound effects and 8 music beds, all synthesised in code. The scripts scaffold an episode, time it to a voiceover, mix the sound, render it and pull reusable pieces back into the library.

The idea is that an episode is mostly choosing and configuring. Whoever builds it (you, or an agent following `../skills/papercut-explainer/SKILL.md`) reads two short catalogs instead of the kit source, picks sounds and a music bed by name, reuses kit components and scene templates, and writes new code only for what the episode needs that the kit lacks.

## Layout

```
library/
  README.md  HARVEST.md  CHANGELOG.md
  env.sh                       sourced by the scripts; fills the env vars below from ~/.config/papercut-explainer/config.env
  new_episode.sh               scaffold <series>/episodes/NN-slug/ (template project + synced kit + node_modules)
  audio/
    CATALOG.md                 every SFX and bed preset, one line each (generated)
    engine.js                  Web Audio kit (noise, tone, pop, chime, pluck...) and one parametric music bed
    sfx/<name>.js              one file per effect, first line "// @sfx name | tags | sec | description | origin"
    beds/<preset>.json         music beds as data (bpm, instrument, chords, pattern, percussion...)
    render.mjs                 cues.json + bed -> public/audio/music.wav + fx.wav (loads only the SFX the cues use)
  papercut/
    CATALOG.md                 every kit export with its props and a doc line (generated)
    AGENT_BRIEF.md             the brief a scene agent gets (what to read, file ownership, QA loop)
    kit/                       the Remotion kit; copied into each project as src/lib/
      tokens.ts fonts.ts paper/ ui/ cast/ props/ scenes/    (scenes/ holds parametric scene templates)
    template/                  empty episode project (Root, PapercutVideo and scene.ts read episode.json)
    public/                    default paper textures, fonts and the backdrop images; copied into each project
    backdrops-src/             React sources of the code-drawn backdrops, for redrawing or tweaking them
    tools/                     textures.py (procedural paper textures)
    sync_kit.sh  stubs.py      re-sync the kit into a project; write scene stubs and index.ts from episode.json
  tools/
    build_vo.py                narration lines + timing -> voiceover.wav, captions.json, src/plan.json
    cues.py                    per-scene SFX rows -> tools/cues.json
    render.sh  render.py       cached per-scene render -> out/<name>.mp4
    mix.py  qa.sh  sheet.py    audio mix, QA stills and labelled contact sheets
    timing_md.py               writes the "Timing" section of STORYBOARD.md from plan.json
    capture.mjs                screenshot a web page for the kit's RealShot component
    placeholder_vo.py          silent (or macOS `say`) narration, so a reel can be timed with no TTS
    selftest.sh                scaffold + build the bundled example (../examples/hello-reel), typecheck, render SFX and a still
    catalog.py  harvest.py     regenerate the two catalogs; list what an episode should give back to the library
    dialogue_timeline.py       two-speaker dialogue -> timeline.json + vo.wav (no template for it ships here)
  voice/                       optional local voiceover pipeline, see voice/README.md
```

## Quick start

Prerequisites.

- Node 20 or newer, and npm.
- ffmpeg and ffprobe on PATH. `rsync` for the kit sync.
- Python 3.10 or newer with numpy and Pillow (textures and contact sheets) and soundfile (audio mix).
- Chrome or Chromium for the audio render and `capture.mjs`. Set `CHROME_PATH` if it is not in a usual macOS or Linux location. Remotion downloads its own headless browser for video.
- Optional: Qwen3-TTS and a speech-to-text backend for the voice pipeline (`voice/README.md`). Without them you can use `placeholder_vo.py`, or record the narration yourself.

Setup.

```
git clone <this repo>
export PAPERCUT_LIB="$PWD/library"
```

`../install.sh` at the repo root can do the same setup for you (skill links, Python tools, optionally the voice venv). `./install.sh --doctor` lists what it finds.

Make a first episode.

```
$PAPERCUT_LIB/new_episode.sh ~/videos/my-series 01-first Episode first-reel
cd ~/videos/my-series/episodes/01-first/papercut
npx remotion studio
```

A series is a folder that holds `episodes/`, and optionally `voice/voice.json`, `papercut-assets/` (textures and props laid over the defaults in each project's `public/`) and `SERIES.md` (audience, voice and palette notes). `new_episode.sh` copies `node_modules` from `$DONOR`, else from the newest `<series>/episodes/*/papercut/node_modules`, else runs `npm i`.

## An episode, step by step

Run these from the series folder unless noted.

1. `$PAPERCUT_LIB/new_episode.sh . NN-slug CompId out-name`
2. Research into `episodes/NN-slug/research/facts.md`, then write `narration/script.json` as `[{"id": "l1_hook", "text": "..."}, ...]`.
3. Narration takes: `$PAPERCUT_LIB/voice/narrate.sh voice/voice.json episodes/NN-slug/narration`. One TTS process at a time. Skip this and step 4 with `placeholder_vo.py` or your own recording.
4. Pick takes, fix pace and write timing: `$PAPERCUT_LIB/voice/finalize.sh voice/voice.json episodes/NN-slug/narration episodes/NN-slug/narration/voice/takes/narrator [num.json]`.
5. In `papercut/episode.json`, set `scenes` (cuts on words), `banners`, `bed`, `whipScene` and optionally `hook`. From `papercut/`, run `python3 $PAPERCUT_LIB/papercut/stubs.py`, then `python3 $PAPERCUT_LIB/tools/build_vo.py`. The second command flags any scene under 1.2 s.
6. Build the first scene and `STORYBOARD.md` yourself. Give each scene agent `$PAPERCUT_LIB/papercut/AGENT_BRIEF.md` and its scene list. Each agent also writes its SFX rows to `tools/cue_sheet.d/<Scene>.json`.
7. From `papercut/`: `python3 $PAPERCUT_LIB/tools/cues.py && node $PAPERCUT_LIB/audio/render.mjs`. Check scenes with `$PAPERCUT_LIB/tools/qa.sh NAME FROM-TO NTH`, then render with `$PAPERCUT_LIB/tools/render.sh`.
8. From `papercut/`, `python3 $PAPERCUT_LIB/tools/harvest.py .` lists what the episode should give back. Promote it (`HARVEST.md`), then run `python3 $PAPERCUT_LIB/tools/catalog.py`.

## Token rules

These keep an agent's context small.

- Read `papercut/CATALOG.md` (about 60 KB) and `audio/CATALOG.md` (about 9 KB), not the kit source (about 350 KB) or the sound code. Open a source file only for one specific detail.
- Reuse before writing. A kit component, a props set (`props/council`, `props/everyday`) or a scene template (`scenes/CtaPhoneDM`) beats new drawing code. New code goes in the scene file, and anything reusable gets harvested afterwards.
- Pick SFX by name. A new sound is a new `sfx/<name>.js` file with the header line, never an edit inside a large score file.
- A music bed is a JSON preset. A new mood is a new preset.
- Beds with `"style": "night"` (`beds/night-rain-piano-F.json`) replace the plucked loop with rain on glass, room tone, a sparse felt piano and a soft pad through a convolution reverb. They also take `thinFrom`, `thinTo` and `resolveAt`. Beds without `style` render the plain loop.
- One QA command per scene, and contact sheets of at most 45 frames at 200 px, keep image tokens low.
- Each project keeps a copy of the kit (`src/lib/`), so an old episode renders the same after the library changes. Re-sync with `papercut/sync_kit.sh` when you want the new version.

## Environment variables

The scripts read these. `env.sh` supplies the defaults and also loads `KEY=value` lines from `${PAPERCUT_CONFIG:-~/.config/papercut-explainer/config.env}`; anything already set in your shell wins.

| Variable | Meaning | Default |
|---|---|---|
| `PAPERCUT_LIB` | Absolute path to this folder. The skill and the agent brief use it. | the folder `env.sh` sits in |
| `PAPERCUT_PY` | Python with numpy, Pillow and soundfile. Used by `qa.sh`, `render.sh` (audio mix) and the texture tools. | `python3` |
| `QWEN_TTS_PY` | Python with `qwen-tts` and torch installed. Used by `voice/narrate.sh`, and by `finalize.sh` for the pitch pass (needs librosa). | `python3` |
| `QWEN_TTS_HOME` | Folder to add to `PYTHONPATH`, only if you run `qwen_tts` from a source checkout instead of pip. | unset |
| `QWEN_TTS_MODEL` | Model repo for custom-voice mode when `voice.json` has no `model` key. | `Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` |
| `ASR_PY` | Python with `mlx-whisper` or `faster-whisper`, for `voice/asr.py`. | `python3` |
| `FASTER_WHISPER_MODEL` | Model name when `asr.py` uses faster-whisper. | `large-v3-turbo` |
| `CHROME_PATH` | Chrome or Chromium binary for `audio/render.mjs` and `tools/capture.mjs`. | tries the usual macOS and Linux paths |
| `DONOR` | A `node_modules` folder for `new_episode.sh` to copy. | newest `<series>/episodes/*/papercut/node_modules` |
| `CONC` | Browser tabs per render job. | 4 for `render.sh`, 2 for `qa.sh` |
| `PAPERCUT_CONFIG` | Path of the config file. | `~/.config/papercut-explainer/config.env` |

The voice scripts take more (`ROLE`, `SCRIPT`, `SKIP_PICK`, `ONLY`, `TAKES`, `SEED_BASE`, and the usual Hugging Face variables). They are listed in `voice/README.md`.

## Status

The scripts were written on macOS (Apple Silicon) for one author's workflow and have only been run end to end there. The shell scripts are bash and pass `bash -n`, the Python passes `py_compile`, and `new_episode.sh` falls back to a plain copy where APFS cloning isn't available. Linux should work, Windows probably needs WSL, and neither has been tried.

Things to know before you rely on it.

- The voice pipeline is optional and the least tested part. It was built around Qwen3-TTS and mlx-whisper. The CUDA path in `narrate.py` and the faster-whisper path in `asr.py` were written afterwards and not run on real hardware by the author.
- `render.py` and `qa.sh` pass `--gl=angle` to Remotion and use ProRes intermediates, which take several GB per episode in `out/cache`. If your Chrome build rejects the flag, change it in `render.py` (`FPS_FLAGS`) and `qa.sh`.
- `dialogue_timeline.py`, the `SPEAKER` and `ROLE` options in the voice scripts, and the dialogue branch in `render.py` and `mix.py` support two-speaker videos. No template for those ships here.
- The catalogs are generated. Run `tools/catalog.py` after you add or change anything in the kit or the audio folder, or agents will read stale ones.
