# The 12 principles of animation, in cut paper

Each principle with what it means for paper and the kit component or helper that does it. Helpers: `keyed`, `swing`, `onN` from `'../lib/paper/motion'`; `bob`, `hop`, `reach`, `PopIn`, `SlideIn`, `Boil`, `Blink`, `SparkleBurst`, `CameraPush` from `'../lib/paper/kit'`; camera moves from `'../lib/paper/camera'`. Timings in frames at 30 fps; the full timing table is in `style-guide.md`.

Paper does not deform. A prop is a rigid cut-out: it scales, rotates, slides and hinges, but it never bends or changes volume. Where a principle asks for a squash, use overshoot instead.

| # | Principle | In papercut | How |
|---|---|---|---|
| 1 | Squash and stretch | Overshoot, not squash. A pop-in grows 0 → 1.08 → 1 and settles; a limb stretches along one axis only (scaleX, 10% overshoot). A hit gets a 3-frame shake. | `PopIn` (spring, damping 12, stiffness 180), `SnapZoom` (1 → 1.25 in 4 frames, then settle), `reach` for limbs |
| 2 | Anticipation | Move back 3-4 frames before the main move: a hop starts with a dip, a stamp lifts before it lands, the hook's cut starts with a tiny pull back. | a negative first key in `keyed`, `PullBack`, the hook-to-scene-2 rule in `papercut-hook` |
| 3 | Staging | One focal prop per beat. Frame 0 is a full, readable set. Keep y < 420 (banner) and y 1420-1580 (captions) free of key props and faces. The camera points at the thing the voiceover names. | `OrbitCamera` + `Depth`, `RackFocus`, `FocusPulse`, `FocusHunt`, `Backdrop` floor line |
| 4 | Straight ahead and pose to pose | Key poses sit on stressed words (pose to pose); ambient motion runs straight ahead underneath. | `cueOf(ID)(word, n)` + `keyed` for poses; `bob`, `Handheld`, `Blink`, `Boil` for ambient |
| 5 | Follow-through and overlapping action | Things keep moving after the body stops, and parts start at different times. A hung sign swings after impact; the critter's arm trails its body by 2 frames. | `swing(f, at, amp)` (pendulum, 2 cycles then still), `DutchTilt` judder, offset arm and body phases |
| 6 | Slow in and slow out | Everything eases. Default ease-out cubic; slides use (0.16, 1, 0.3, 1) with 4-8% overshoot; the camera push is ease-in-out. A linear move reads as a glitch. | `keyed` (ease per segment), `SlideIn`, `CameraPush` |
| 7 | Arcs | Natural motion follows curves. Hops are a sine arc; thrown props and pointing arms follow a curve, not a straight line. | `hop(f, at, dur, h)`, `OrbitCamera` yaw arc, `CrabTrack`, a cubic path for thrown props |
| 8 | Secondary action | Small motion that supports the main one without stealing it: an LED blinking, a sparkle on a number, a radio wave, idle bob. Always on, always quieter than the event. | `Blink`, `SparkleBurst`, `RadioWaves`, `bob` |
| 9 | Timing | One visual event per stressed word, every 0.4-0.8 s. Pop-ins 6-9 frames, slides 8-12, cuts 6-12. Stepped "on twos" for the hand-made feel; hold a beat after a gag lands. | `cueOf`, `onN(f, 2)`, `Boil`, the transition frames in `CUT_DEFAULTS` |
| 10 | Exaggeration | Push the one beat that matters: a number lands with a snap zoom, a realisation gets a dolly zoom, a gauge overshoots 3-5°. Exaggerate one beat per scene, and keep it readable in under 1 s. | `SnapZoom`, `DollyZoom`, `DutchTilt`, `TimeRamp`, `FreezeFrame` |
| 11 | Solid drawing | Volume from stacked cut pieces, not outlines: a darker underside strip, a lighter top strip, light from the top-left everywhere, one consistent drop shadow, grain and a rough edge. Depth from layers. | `Paper`, `Slab` (`shade`, `hi`), `Depth` z layers, `PaperDefs` |
| 12 | Appeal | Simple geometry, eyes only, stubby limbs, a readable silhouette. Cast differs by colour, accessory and name pill, not by new anatomy. Expressions are a small fixed set. | `Critter` (`expr`, `acc`, `tag`), accessories (`cap`, `headset`, `monocle`…) |

## Using this list

- **Storyboard**: for each scene block, name the anticipation (principle 2) and the one exaggerated beat (10) in the event table.
- **Build**: when a move looks wrong, find its row. Stiff and robotic is usually 6 (no easing) or 5 (nothing trails). Muddy is usually 3 (two focal props) or 11 (shade strips missing).
- **QA**: see the principles pass in `papercut-qa`.
