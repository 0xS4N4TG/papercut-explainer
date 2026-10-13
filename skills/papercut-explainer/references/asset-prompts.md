# AI-generated assets for the Papercut style

## Which parts to generate and which to build

| Element | Build in code (Remotion/SVG) | Generate with an image tool | Why |
|---|---|---|---|
| Characters (the critter and its variants) | ✅ | no | Need posable parts; must look identical in every frame |
| Caption tags, banner, labels, buttons, gauges | ✅ | no | Text must be exact and animatable |
| Real UI (terminal, comment box) | ✅ | no | Text accuracy |
| Backgrounds (sky, slate room, space, wall) | either | ✅ good fit | Rich texture, static, no text |
| Complex static props (rocket, crane, consoles, Earth, metal panel, easel) | possible | ✅ good fit | Faster than drawing; animate as whole pieces |
| Paper-grain texture tile | no | ✅ | One-time asset |

**Text-to-video models are the wrong tool for the finished video.** They can't hold exact on-screen text, word-synced captions, or the same character across 10 shots. Use them at most for an optional B-roll insert. The pipeline is: **AI stills for textured assets → Remotion for all motion, text and timing.**

## Tool

Use whatever image tool the machine has. It needs to support **transparent PNG output** for props and, ideally, **image-to-image edits** for style matching. The shape of the calls, whatever the tool:

```bash
<image-tool> generate "<prompt>" --size 1024x1536 --out public/assets/<name>.png                  # backgrounds
<image-tool> generate "<prompt>" --background transparent --out public/assets/<name>.png          # props
<image-tool> edit "<prompt>" --image library/papercut/public/bg/backdrops/kitchen.jpg --out ...   # style-match against a library backdrop
```

If no image tool is available, build every prop in code with the paper filter. The style holds up without generated images. Don't generate any text inside images; add all text in Remotion.

## Style-lock suffix (append to every prompt)

```
Digital cut-paper collage illustration. Flat solid colour shapes cut from matte construction paper,
visible fine paper fibre grain, slightly irregular scissor-cut edges with a thin lighter rim,
soft realistic drop shadows between stacked paper layers, no gradients on objects, no outlines,
no text, no letters, no logos. Muted retro 1960s space-race palette: dusty blue, khaki, slate teal,
sage green, cream, coral #C9573C accents. Calm, clean, charming, handmade.
```

## Background prompts (1024×1536, then upscale or cover-fit to 1080×1920)

- **Launch sky:** `Vertical background plate: dusty blue sky (#567E97 at top) fading to a bright pale-blue glow in the centre (#BAD7E9), mottled watercolour-paper texture, strong soft vignette at the corners, flat khaki concrete ground strip across the bottom quarter (#BFB087). Empty, no objects. + STYLE-LOCK`
- **Mission-control room:** `Vertical background plate: very dark slate-teal wall (#132124) with subtle mottled parchment texture and heavy vignette, slightly darker floor zone in the bottom third, empty room, no objects. + STYLE-LOCK`
- **Deep space:** `Vertical background plate: deep navy night sky (#081027) with scattered tiny white paper-punch stars of varied sizes, faint mottled texture. No planets. + STYLE-LOCK` (Better: build the stars in code so they can twinkle, and generate only the navy texture.)
- **Briefing room:** `Vertical background plate: warm khaki plaster wall (#8A7A60) with heavy grunge mottling and vignette, dark brown wooden floor band across the bottom 25% (#452A15). Empty. + STYLE-LOCK`

## Prop prompts (transparent background)

- **Rocket:** `Single retro space-race rocket, tall and slender, cream body with black checkerboard panels, three black fins, small round porthole window near the nose (empty, dark), grey nozzle, side view, centred, isolated on transparent background. + STYLE-LOCK`
- **Launch crane:** `Tall red lattice launch tower with X-bracing and one short horizontal service arm, side view, isolated. + STYLE-LOCK`
- **Smoke cluster:** `Cluster of overlapping grey paper circles forming a puffy exhaust cloud, darker grey inner shadows between circles, isolated. + STYLE-LOCK`
- **Mission console:** `Wide sage-green mission-control desk seen from the front, a row of small square indicator lights (green, amber, white) along the top edge, flat front panel with empty space for a label, isolated. + STYLE-LOCK`
- **Big screen:** `Wall-mounted monitor with thick dark bezel, dark teal grid screen showing flat green paper continents, empty space for an orbit line, isolated. + STYLE-LOCK`
- **Spacecraft panel:** `Brushed light-grey metal panel with rounded corners and a row of rivets along the edges, one round porthole with a dark glass centre and riveted ring, front view, isolated. + STYLE-LOCK`
- **Earth curve:** `Top arc of planet Earth filling the bottom of a vertical frame: saturated blue ocean, flat green landmass blobs, flat white elongated cloud shapes, thin pale atmosphere rim, isolated on transparent. + STYLE-LOCK`
- **Fuel gauge:** build in code (the needle must rotate). The dial face can be generated: `Round analog fuel gauge face, cream dial, black tick marks, a red arc on the left and a green arc on the right, no needle, no letters. + STYLE-LOCK`
- **Easel + clipboard:** `Wooden easel holding a large blank cream paper clipboard with a grey metal clip at the top, front view, isolated, clipboard blank. + STYLE-LOCK`
- **Paper grain tile:** `Seamless tileable texture of off-white matte construction paper, fine fibres and subtle speckles, flat even lighting, no shadows.` (use as a multiply overlay)

## Consistency checklist for generated assets
- Same light direction: light from the top left, so shadows fall down and slightly right.
- If the prompt produced perspective, regenerate. Every asset has to be flat orthographic.
- Re-colour generated props in code if a hue drifts (CSS `filter: hue-rotate()` or re-generate with the hex in the prompt).
- Generate at high quality, trim transparent padding, and store in `public/assets/` with kebab-case names.
