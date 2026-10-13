# Paper trail: one episode, every file

This folder holds every file a papercut episode writes before any scene is built, for one invented product. Read it top to bottom to see what each stage outputs and what the next stage takes from it.

Everything here is invented for illustration: Echolark (a local voice-cloning app), Vocalyst (its paid competitor), their numbers, the URLs (all `example.com`) and the "Paper Trail" series. Nothing is a claim about a real company or product.

## The episode in one paragraph

A 28-second reel in the open-source-drop mode, told as a heist movie. It opens on a mascot plugging an old laptop into a bank vault with a "$15/MO" plate, names Echolark in beat 4, stacks three features, hits the 210-language peak, admits the catch (slower on old laptops, a watermark), cancels the paid plan and ends on "comment VOICE".

## Stage to file

The order and the file contract come from `skills/papercut-explainer/SKILL.md` ("Stages" and "Project files").

| # | Stage | Skill | What it wrote here |
|---|---|---|---|
| 1 | Strategy | `papercut-strategy` | `SERIES.md`; the BRIEF block and "Strategy notes" at the top of `research/facts.md` |
| 2 | Hook | `papercut-hook` | The HOOK block (SAY / WRITE / SHOW / ALIGN), the alignment test and the hook variants at the top of `papercut/STORYBOARD.md` |
| 3 | Script | `papercut-script` | The numbered facts below the BRIEF in `research/facts.md`; `narration/script.json` (10 lines, 94 words); the "Staging table" in `papercut/STORYBOARD.md` |
| 4 | Storyboard | `papercut-storyboard` | "Global rules", the "Camera / Cut table", four full scene blocks and the "SFX plan" in `papercut/STORYBOARD.md` |
| 5 | Scaffold and plan | `papercut-build` | `papercut/episode.json`: scenes cut on words, banners, hook, cuts, bed, `cutSfx`, `gaps`. The Camera / Cut table's cut column became `cuts` |
| 6 | Voice and timing | `papercut-voice` | `voice/voice.json`; the `tts` respellings in `script.json`; the generated "Timing" section at the end of `STORYBOARD.md` (from `tools/timing_md.py`) |
| 7 | Scenes, sound, render | `papercut-build` | `papercut/tools/cue_sheet.d/S01Hook.json`, the SFX rows a scene agent writes next to `S01Hook.tsx`. The scenes, audio and mp4 are not included |
| 8 | QA | `papercut-qa` | Nothing saved. It checks stills against this storyboard |
| 9 | After posting | `papercut-strategy` (autopsy), `papercut-build` (harvest) | Nothing yet: the episode is fictional |

Each stage reads what the stages above it wrote. For example `papercut-script` reads the BRIEF and the HOOK block, and `papercut-build` reads the Camera / Cut table when it fills in `cuts`.

## How to read it

1. `SERIES.md`: who the series is for, the voice, the palette, the mascot, the banned words.
2. `research/facts.md`: the BRIEF, the strategy notes, then 23 numbered facts with a source line each, the caveats, and a table tracing every banner and number to a fact.
3. `papercut/STORYBOARD.md`: the hook and why it won, the staging table (one row per banner), the camera and cut for each scene, four scenes spelled out frame by frame, the SFX plan, then the generated timing.
4. `narration/script.json`, `papercut/episode.json`, `papercut/tools/cue_sheet.d/S01Hook.json`, `voice/voice.json`: the data the scripts read.

## Layout note

This folder is one episode with the series files beside it, so you can read it flat. In a real series, `SERIES.md` and `voice/` sit at the series root and the rest lives in `episodes/01-echolark/`:

```
<series>/SERIES.md   <series>/voice/voice.json
<series>/episodes/01-echolark/research/facts.md
<series>/episodes/01-echolark/narration/script.json
<series>/episodes/01-echolark/papercut/{episode.json, STORYBOARD.md, tools/cue_sheet.d/}
```

`papercut/episode.json` points at the narration with `"narration": "../narration"`, which resolves the same way in both layouts.

## Rebuild the plan yourself

From the repository root, with `PAPERCUT_LIB=$PWD/library`. This needs ffmpeg and nothing else. It runs in a scratch folder, never in this one.

```
T=$(mktemp -d)
mkdir -p $T/narration $T/papercut/src/scenes $T/papercut/public $T/papercut/tools
cp examples/paper-trail/narration/script.json $T/narration/
cp examples/paper-trail/papercut/episode.json $T/papercut/
cp -R examples/paper-trail/papercut/tools/cue_sheet.d $T/papercut/tools/
(cd $T/narration && python3 $PAPERCUT_LIB/tools/placeholder_vo.py --wps 4.2)
cd $T/papercut
python3 $PAPERCUT_LIB/tools/build_vo.py      # 13 scenes, none under 1.2 s, total 27.96 s
python3 $PAPERCUT_LIB/papercut/stubs.py      # src/scenes/index.ts and 13 stubs
python3 $PAPERCUT_LIB/tools/cues.py          # merges cue_sheet.d/S01Hook.json with the cut sounds
```

`--wps 4.2` is the placeholder pace. The placeholder pads every line by 0.2 s, so 4.2 words a second lands each line near a real take at 3.75. A real voice moves the scene times by a few tenths of a second, which is why the scene blocks use frame offsets from a word instead of absolute frames.

## What is checked

- Every `.json` loads, and every scene in `episode.json` points at an existing line id and a word in it.
- Every backdrop, camera component, cut kind, SFX and bed named here exists in `library/papercut/CATALOG.md` or `library/audio/CATALOG.md`.
- Every banner is 3-7 words in capitals and appears in the trace table in `research/facts.md`; every number in a banner appears in a fact.
- The HOOK block's WRITE line matches `episode.json` `hook`, and shares no word with SAY.
- `script.json` is 75-95 words, and the placeholder build is 22-30 s with no scene under 1.2 s.
