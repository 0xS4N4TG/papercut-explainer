# Scene-agent brief (papercut episodes built on the shared library)

The lead's spawn message tells you: the project path, your scenes with their absolute frame ranges, and your QA folder name. Run every command from the project dir.

## Read, in this order (and nothing else unless you need a specific detail)
1. `STORYBOARD.md`: the global rules, the cue table and **your** scene specs only.
2. `src/scenes/S01Hook.tsx`: the lead's reference scene. Match its structure (cue constants, `CameraPush`, clamped `interpolate`) and craft level.
3. `$PAPERCUT_LIB/papercut/CATALOG.md`: every kit component, prop set and scene template with its props. **Do not read the kit source** (`src/lib/**`) unless the catalog line isn't enough for something you're using; then read only that component.
4. `$PAPERCUT_LIB/audio/CATALOG.md`: SFX names for your cue rows.
(`$PAPERCUT_LIB` is the absolute path to the library folder. The lead's spawn message gives its value if your shell doesn't have it set.)

## Build
- **Sets:** stand each scene on a `<Backdrop name="…" />` (`../lib/paper/backdrops`, the "Backdrops" section of the catalog lists names and floorY) unless the storyboard asks for a plain `<Room>`. Neighbouring scenes never share a backdrop unless the storyboard says it's the same place. Props and critters stand on the backdrop's floorY.
- **Reuse first.** Use a kit component, a props set (`../lib/props/...`) or a scene template (`../lib/scenes/...`) when one fits. Write new drawing code only for what the set needs that the kit lacks, and keep it in your own file.
- Imports: `../lib/paper/kit`, `../lib/paper/sets`, `../lib/ui/ui`, `../lib/cast/...`, `../lib/props/...`, `../lib/scenes/...`, `../lib/tokens`, plus the episode's own `../theme` if it exists, and `../scene` for `cueOf` / `durOf`.
- **You own only** `src/scenes/<Scene>.tsx`, an optional `src/scenes/<Scene>.parts.tsx`, and `tools/cue_sheet.d/<Scene>.json`. Never edit `src/lib/**` (it's a synced copy; report kit bugs instead), other scenes, `index.ts`, `plan.json`, `episode.json` or the storyboard.
- Time every event with `cueOf(ID)(word, n)`. Frame 0 is a full, readable set. Every `interpolate` input range must be strictly increasing even when cue words are 3–5 frames apart (`Math.max(prev + 1, …)`).
- Everything is paper (Slab/Disc/Card/Pill inside `<Paper>`), with stacked shade pieces, no outlines, no CSS gradients except soft light glows, and no CSS animations.
- Keep y 1420–1580 free of faces and key labels (captions) and y < 420 free of key props (banner).
- No numbers on screen beyond those the storyboard gives your scene. No brand logos. Text ≥ 24 px.

## Sound (you know your events best)
Write `tools/cue_sheet.d/<Scene>.json` as `{"<Scene>": [["word", nth, "sfx", offsetFrames], ...]}`, one row per visual event, using names from the audio catalog. If no SFX fits, say so in your report; don't write audio code.

**Air sounds are rationed** (`whoosh`, `slide`, `whip`, `zoom`, `swish`): at most one per scene, and none in a scene that opens on a whip or zoom transition (the transition already has its sound). Banner and prop entrances get a contact sound instead (`pop`, `thud`, `stamp`, `click`, `tape-peel`) or nothing. Across the whole reel, use at most one air sound per ~2.5 s; `cues.py` prints a note when a reel goes above that.

## QA (required; one command per scene, never two renders at once)
`$PAPERCUT_LIB/tools/qa.sh <Agent>_<Scene> <from>-<to> <nth> 0.4 5`, with nth ≈ dur / 4 (4–5 stills). Then Read `out/qa/<Agent>_<Scene>_0.jpg`. Check that frame 0 is full, the key events land on their words, nothing is clipped or covering the caption or banner bands, and props read as paper. Fix and repeat.

## Report (under 150 words)
For each scene: one line per cue event. Note anything you changed from the spec and why, any kit gaps or bugs, any reusable component you wrote that the lead should harvest, and your final sheet path.
