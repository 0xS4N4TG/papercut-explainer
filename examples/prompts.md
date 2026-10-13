# Prompts

Copy-paste prompts for each skill, in the order of the workflow, with what to expect. Replace anything in `<angle brackets>`.

Claude Code picks a skill from your wording. If the wrong one loads, or none does, name it: "use papercut-hook to write 5 hooks for this fact list". Each skill reads the files the stage before it wrote, so you can stop after any stage and pick up in a new session. `examples/paper-trail/` shows what every stage writes.

## End to end

```
Make a papercut explainer about <link>, 25 seconds, CTA keyword PAPER
```

- Loads `papercut-explainer`, the router. It checks your install mode, finds `$PAPERCUT_LIB` and your series folder, then asks which run mode you want (full reel, script only, storyboard from a script, style prompt, fix one scene).
- Asks only what is missing: the claim the video proves, who does the work in the product (role framing), what the viewer gets for the keyword, and the audience level if there is no `SERIES.md`.
- Writes the BRIEF at the top of `episodes/NN-slug/research/facts.md`, then hands to `papercut-strategy` and walks the stages. It renders only when you ask.

Other ways in:

```
Write only the script, banners and staging table for <link>. No video yet.
Storyboard this script: <path to narration/script.json>
Give me the papercut style prompt for <image or video tool>
```

These pick the "script only", "storyboard from an existing script" and "style prompt" run modes. The last one hands you a block from `references/style-prompt.md` and stops.

## 1. Setup

```
Set up papercut-explainer, partial install
```

- Loads `papercut-setup`. It runs `./install.sh --doctor` from the repo root and tells you in plain words what is installed and which mode that adds up to.
- Asks, in one question: how much (Minimal, Standard, Full or Custom), skills for every project or one, symlink or copy. "Partial" usually means Minimal, or Custom with the components you name (`skills,deps,pytools,verify`). It asks again before any multi-GB download.
- Runs `install.sh --yes` with the matching flags and writes `~/.config/papercut-explainer/config.env`, which every later skill reads for the library path. A new Claude Code session picks up the linked skills.

## 2. Strategy

```
Pick the topic, format and funnel for a reel about <link>. Audience: <who>.
```

- Loads `papercut-strategy`. It reads `SERIES.md` first, and if there is none it asks for the audience (who, level, regions), voice, palette, mascot and keyword log, then writes it.
- Picks the one familiar format for the whole reel ("what show is this secretly about?"), the mode, the keyword and the freebie, and plans the caption.
- Writes `SERIES.md` and the BRIEF block at the top of `research/facts.md`. Next stage: the hook.

The same skill also runs competitor studies and the post-publish autopsy:

```
Study these 4 reels and tell me what to borrow: <url> <url> <url> <url>
Here are the numbers for the reel I posted: <views, skip rate, watch time, comments>. Do the autopsy.
```

The first spawns one subagent per reel and saves `research/analytics/YYYY-MM-DD-<creator>-reels.md`. The second reads the numbers hook first, topic second, and writes `research/analytics/YYYY-MM-DD-autopsy.md` plus an update to `SERIES.md`.

## 3. Hook

```
Write 5 hooks for this fact list: <paste the facts, or point at research/facts.md>
```

- Loads `papercut-hook`. It needs the BRIEF. If there is none it sends you to `papercut-strategy`.
- Writes five variants from at least three hook patterns, scores each on the six-question hook check, drops any that fail the facts, and picks the best.
- Writes the HOOK block (SAY, WRITE, SHOW, ALIGN) at the top of `papercut/STORYBOARD.md`. The WRITE line becomes the `hook` title in `episode.json` when `papercut-build` fills it in. It also sets the rule for the motion out of the hook, which the storyboard applies.

## 4. Script

```
Write the script, banner track and staging table for <link>
```

- Loads `papercut-script`. It needs the BRIEF and the HOOK block. It researches the source (web fetch or search, a browser for screenshots) and asks you for screenshots and facts if it has none of those.
- Writes the sourced facts list under the BRIEF in `research/facts.md`, the 75-95 word script on the 10-beat spine in `narration/script.json` (line `l1_hook` is the SAY line), 10-18 banners, and a staging table with one set per banner and a GAG column from the humour pass.
- The staging table goes into `papercut/STORYBOARD.md` under the HOOK block. Stressed words per line are marked there for the voice stage.

## 5. Storyboard

```
Storyboard this script
```

- Loads `papercut-storyboard`. It needs `narration/script.json` and the HOOK block and staging table. It reads the two library catalogs to check every camera move, cut kind, backdrop and SFX name.
- Writes the global rules, the Camera / Cut table (one row per scene, no plain `CameraPush` on more than a third), one block per scene with an event on each stressed word, and the SFX plan into `papercut/STORYBOARD.md`.
- The cut column becomes `cuts` in `episode.json` at the next stage. The Timing section is left for the voice stage.

## 6. Voice

Three paths. Say which one, or the skill asks.

**A. Local Qwen3-TTS** (Full install)

```
Voice the episode with local Qwen3-TTS, speaker Ryan
```

- Loads `papercut-voice`. It checks that `qwen_tts` imports and hands to `papercut-setup` if not. It copies `voice.example.json` to `voice/voice.json` and sets the speaker and the style line (`instruct`).
- Plays the first three lines before the full run, then generates takes, picks one per line and writes `voice/final_narrator/<id>.wav` and `timing_narrator.js`.
- Finishes with `build_vo.py` and `timing_md.py`: `public/vo/captions.json`, `src/plan.json` and the Timing section of `STORYBOARD.md`.

**B. Your own recording or another TTS**

```
I recorded the narration myself, one file per line, in <folder>. Time the script to it.
```

- Loads `papercut-voice`, path B. It needs an ASR backend (mlx-whisper or faster-whisper) for word times, and asks for one WAV per line or raw takes.
- Writes `voice/final_narrator/`, the ASR file and `timing_narrator.js`, then the same captions, plan and Timing section.
- Without ASR it can only estimate 2.75 words a second, and says that captions will drift.

**C. Placeholder voice**

```
Use a placeholder voice so I can see the timing
```

- Loads `papercut-voice`, path C (Standard install). It runs `placeholder_vo.py` from `narration/` with a pace of 3.5 to 4 words a second, silent or the macOS `say` voice.
- Writes silent WAVs and `timing_narrator.js`, then runs `build_vo.py`, which flags any scene under 1.2 s. You can build, preview and QA the whole reel, and re-voice later without touching a scene.

## 7. Build

```
Build scenes S03-S06 with parallel scene agents
```

- Loads `papercut-build` (and the Remotion best-practices skill). It needs `papercut/STORYBOARD.md` and `src/plan.json`. It builds `S01Hook` itself first, as the reference scene.
- Splits S03 to S06 across scene agents, two or three scenes each, and gives each the project path, its frame ranges, a QA folder and `library/papercut/AGENT_BRIEF.md`. Each agent writes only `src/scenes/<Scene>.tsx` and `tools/cue_sheet.d/<Scene>.json`.
- Agents QA their own stills. You get a short report per agent. Nothing renders unless you ask.

Other build requests:

```
Scaffold the episode as 01-<slug> in <series folder>
Mix the sound for the episode
Render it
```

They run `new_episode.sh` (and merge your earlier files into the new folder), then `cues.py` with `audio/render.mjs`, then `render.sh` for `out/<name>.mp4`.

## 8. QA

```
QA the reel
```

- Loads `papercut-qa`. It renders contact sheets with `qa.sh`, four to six frames per scene, one render at a time.
- Checks them against the style checklist and the storyboard: paper look, banner rules, the HOOK block on screen, a camera move in every scene, humour pass, bottom 20% clear.
- Fixes go back to `papercut-build`, at most two rounds per scene. The last step is a delivery summary that names what is still placeholder (voice, music, SFX, assets).

## Maintenance

**Re-voice with a different speaker**

```
Re-voice the episode with a different speaker
```

Loads `papercut-voice`. It asks which speaker (Aiden is the other recommended one), changes `speaker` in `voice/voice.json`, regenerates the takes, finalizes them, then reruns `build_vo.py` and `timing_md.py`. Scene starts move with the new word times, and the scene cache re-renders everything.

**Swap the mascot's colour**

```
Swap the mascot's colour to <colour>
```

Loads `papercut-build`. Say whether the colour is for this episode or the whole series. For one episode it changes the `color` and `shade` props the scenes pass to the `Critter`, and only those scenes re-render. For the series it changes the hero colour in the library's `kit/tokens.ts`, re-syncs with `sync_kit.sh` (a kit change re-renders everything) and notes the colour in `SERIES.md`. It never edits `src/lib/` inside a project, because that folder is a synced copy.

**Add a backdrop**

```
Add a backdrop for <place>
```

Loads `papercut-build`. It checks the 24 existing sets first, and generates or draws a new one only if none fits (an image tool, or code like `backdrops-src/`). The JPG goes in `library/papercut/public/bg/backdrops/`, with an entry in `backdrops.json` and the `BACKDROPS` table in `kit/paper/backdrops.tsx`. Then it runs `tools/catalog.py` and `sync_kit.sh`.

**Add a sound effect**

```
Add a sound effect: <describe it>
```

Loads `papercut-build`. It writes `library/audio/sfx/<name>.js` with the `// @sfx name | tags | seconds | description | origin` header line, runs `tools/catalog.py` so it shows in `audio/CATALOG.md`, and adds a row to the scene's `tools/cue_sheet.d/<Scene>.json`. Then `cues.py` and `render.mjs` rebuild the audio.

**Fix scene S04 so the camera moves**

```
Fix scene S04 so the camera moves
```

Loads `papercut-explainer` (run mode "fix one scene"), which hands to `papercut-build` and then `papercut-qa`. It reads S04's row in the Camera / Cut table. If the table names no camera move for S04, run `papercut-storyboard` first to choose one. Then it edits `src/scenes/S04*.tsx` to use that move, checks the scene with `qa.sh`, and re-renders only that scene.
