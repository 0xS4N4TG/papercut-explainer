# papercut-explainer: notes for coding agents

This repo makes short vertical explainer reels that look like layered construction paper. It is nine Agent Skills plus a
Remotion library. If your harness loads skills from `.agents/skills` or `skills/` (most do), they are already available here.
If it does not, read the matching `skills/<name>/SKILL.md` yourself when a request fits its description.

| Skill | Use it when the user wants to |
|---|---|
| `papercut-explainer` | make a reel end to end, or does not say which stage; it routes to the rest |
| `papercut-strategy` | decide what the reel should be: topic, format, audience, funnel, competitor study |
| `papercut-hook` | write or fix the hook (five scored variants, frame-0 cover) |
| `papercut-script` | turn a link into a researched script (75-95 words on a fixed spine) |
| `papercut-storyboard` | storyboard a script: camera and cut table, scene by scene, before any code |
| `papercut-voice` | voice the reel and time it to the picture |
| `papercut-build` | build and render the episode from a storyboard with the library |
| `papercut-qa` | check stills and the cut against the style and the storyboard |
| `papercut-setup` | install or repair this repo's setup (`./install.sh --doctor` first) |

- Library path: `$PAPERCUT_LIB`, else `PAPERCUT_LIB=` in `~/.config/papercut-explainer/config.env`, else `./library` here.
- Each skill reads the files the stage before it wrote, so you can stop after any stage.
- Scene-building agent: `papercut-scene` (installed per harness by `install.sh`). With no subagent support, build the scenes yourself, one at a time.
- Aider and other agents without skills support: `aider --read AGENTS.md`, then read the `SKILL.md` that fits.
- Harness folders and models: `harnesses.sh` and the README's *Works with* section.
