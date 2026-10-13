# Changelog

## 0.1.0: first public release

What ships.

- Kit (`papercut/kit/`): paper primitives, set builders, a UI kit, a default critter, props sets, `tokens.ts`, local fonts and the `CtaPhoneDM` scene template. `papercut/CATALOG.md` lists every export with its props.
- 24 backdrops (`papercut/public/bg/backdrops/`, `<Backdrop name="..." />`), each with a floor line and a calm band for the banner and captions. The sources of the eight code-drawn ones are in `papercut/backdrops-src/`.
- Camera moves (`paper/camera.tsx`): orbit with depth layers, foreground pass, rack focus, snap zoom, pull-back, freeze frame, dolly zoom, crab track, crane, POV masks, time ramp, dutch tilt, tilt shift, focus pulse, focus hunt and handheld.
- Scene transitions (`paper/transitions.tsx`, `<CutSeries>`): whip, zoom-through, page turn, tear-away, tape pull, stamp cut, infinite zoom, pop-up book, keyhole and burn-away.
- Film-look layers (`paper/look.tsx`): gate weave and flicker, moving felt fibre, lens dirt, lamp flicker, halftone and graph paper.
- Audio: 79 sound effects (one file each), 8 music beds (marimba and kalimba presets plus a rain-and-piano night bed), a Web Audio engine and an offline renderer.
- Tools: scaffold (`new_episode.sh`), kit sync, scene stubs, voiceover and frame-plan builder, SFX cue builder, cached per-scene render, audio mix, QA contact sheets, page capture, catalog generator, harvest report, placeholder narration and a self-test.
- Optional voice pipeline (`voice/`): Qwen3-TTS narration, take picking, pace and loudness pass, word timing, with a setup script.
