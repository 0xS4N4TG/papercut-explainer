# Portable Papercut style prompts

Copy-paste blocks for using this style outside this skill: another coding agent, p5/Canvas, After Effects notes, image or video generators. Each block stands alone.

**To write the story** (script + banner fact track + set-per-banner staging + rough UI spec) from a link, use the storytelling prompt in `../../papercut-script/references/storytelling.md` section 7. Pair it with block A below for the visuals.

---

## A. Master style prompt (for any coding or motion agent)

```
Make this in the "Papercut Explainer" style: digital cut-paper collage with cut-out animation.

LOOK
- Every object is flat construction paper: one solid fill, fine paper-fibre grain multiplied at ~10%,
  a slightly irregular scissor-cut edge with a 1–2px lighter rim on the top-left, and a soft drop shadow
  (0 x, 3–6px y, 6–10px blur, 30% black). No gradients or outlines on objects.
- Shading = stacked cut pieces (a darker underside strip, a lighter highlight strip), never blends.
- Build everything from simple primitives (rects, rounded rects, circles, trapezoids), orthographic
  front/side views only, chunky and legible at phone size, light from the top-left.
- Backgrounds: muted dark or dusty colour with a mottled watercolour-paper texture and a strong vignette.
  Saturated colour only on characters, captions and state signals (green GO / red NO-GO / amber).
- Characters: one simple geometric mascot (boxy orange body, eyes only, stubby rectangular limbs) reused
  for the whole cast, told apart only by accessories (caps, headset, helmet) and a small name pill.
- Light 2–4% animated film grain over the whole frame.

LAYOUT (9:16, 1080×1920, 30fps)
- Taped paper header banner at 14–21% height: cream torn strip, two translucent tan tape pieces at the
  corners, heavy ALL-CAPS geometric sans, 3–7 words stating the takeaway of the current beat.
- Stage 22–72%. Word captions 68–80%. Keep the bottom 20% empty for platform UI.
- Props may bleed off the side edges.

CAPTIONS
- Voiceover shown word by word: each word on its own torn paper tag in the caption accent colour (coral by default),
  cream soft bold serif text, random ±5° tilt, ±6px y offset, drop shadow. Each word pops in on its
  spoken onset (scale 0.6→1.05→1 over 4 frames). Pages of 1–3 words, cleared at phrase breaks.

MOTION
- Rigid cut-out animation: only position/scale/rotation/opacity on paper parts. Everything on ones.
- Springy pop-ins (6–9 frames, overshoot ~8%, rotation settles from ±4°); slide-ins with ease-out;
  limbs stretch to point or press; idle bob ±2–3px; blinking LEDs; twinkling stars.
- Camera: a slow smooth push-in/drift toward the focal prop in every scene (~1% scale per second),
  with no random shake. One continuous tilt/pan between two locations in the opening scene.
  Hard cuts on sentence boundaries otherwise; scenes 1.5–5s.
- Paper boil: the banner and its labels re-offset randomly every 2 frames by ±1–2px (stop-motion
  hand-placed jitter). Subtle enough to feel, not to read.
- One visual event per stressed word (a prop enters, a light flips dim→lit with a sparkle burst,
  a character acts, a gauge moves, a red ellipse draws around the key item).
- Signature effects: four-point-star sparkle bursts, amber signal arcs between characters/devices,
  blinking alarm with a rotating light wedge, typewriter text with key sparks, scrolling data tape.

STORY
- Explain the topic through ONE physical metaphor world (e.g. mission control, a kitchen, a rail yard).
  Real product UI appears inside that world as a paper prop.
- Beats: hook → the unlock → mechanism ×2–3 → objection (cost/risk mini-story) → benefit → free
  resource → "comment KEYWORD" CTA typed into a comment box.
```

---

## B. Image-generation style lock (append to any prop or background prompt)

```
Digital cut-paper collage illustration. Flat solid colour shapes cut from matte construction paper,
visible fine paper-fibre grain, slightly irregular scissor-cut edges with a thin lighter rim, soft
realistic drop shadows between stacked paper layers, shading made from separate darker paper pieces,
no gradients, no outlines, orthographic front view, simple geometric forms, light from the top-left.
No text, no letters, no logos. Muted palette with one warm accent.
```

Add `isolated on a transparent background` for props, and the colour hexes of the current palette.

---

## C. Text-to-video models (for B-roll only)

These can't hold exact text or a consistent cast, so use them only for textless inserts:

```
Stop-motion cut-paper animation, flat construction-paper shapes with visible grain and soft drop
shadows, rigid paper pieces sliding and popping into place, slow smooth camera push-in, subtle
frame-to-frame paper jitter, muted palette with a warm orange accent, orthographic flat view,
no text. [SUBJECT AND ACTION]
```

---

## D. One-line descriptor (for briefs, notes, search)

> Faceless vertical explainer in digital cut-paper collage: grainy construction-paper props with soft drop shadows, rigid cut-out animation with springy pops, a slow camera push, stop-motion paper boil, a taped-banner headline per beat, and word-by-word captions on torn coral paper tags, all inside one extended visual metaphor.
