# Harvest: after every episode, before starting the next one

From the episode's `papercut/` folder, run `python3 $PAPERCUT_LIB/tools/harvest.py .`. It only reports. Promote what is worth keeping.

1. Kit files changed in the project. A local fix (a clipped label, a wrong layer order, a missing key flash) goes into `papercut/kit/` in the library. Never leave a fix only in an episode. The report also lists a file when the library has moved on since the project was synced, so read the diff to see which side changed.
2. Episode-local components, in `*.parts.tsx` or helpers inside scene files, that another episode could use. Move them to `kit/props/<topic>.tsx`, or to `kit/paper/` or `kit/ui/` if they are generic, with a one-line doc comment above the export. The catalog shows that comment.
3. SFX the cue sheet used that the library lacks. Write `audio/sfx/<name>.js` with the `// @sfx name | tags | sec | description | origin` header. Use `papercut-explainer` as the origin unless you want to track where a sound came from.
4. Recurring beats become scene templates in `kit/scenes/`. A beat qualifies when it has appeared in two or more episodes. `CtaPhoneDM` (the comment-keyword call to action) is the one that ships. Other candidates are a terminal reveal, a repo card with a star count-up, stat columns with a number card, a corkboard of files and a callback desk. Pass the cue frames in as props. Don't call `cueOf` inside the template.
5. A new music bed goes in `audio/beds/<name>.json`.

Then run `python3 $PAPERCUT_LIB/tools/catalog.py`, add an entry to `CHANGELOG.md`, and re-sync any project you will keep editing (`papercut/sync_kit.sh <project>`).
