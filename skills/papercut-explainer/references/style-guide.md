# Papercut style guide

**This is a style system, not a recreation spec.** It describes how to make *any* topic look and move like layered construction paper brought to life. The worked example in `frame-breakdown.md` is an invented explainer set in a space mission control room. Its colours, fonts and props are **defaults**. Swap them freely as long as the rules in section 2 hold.

Numbers marked *(measured)* come from frame-by-frame analysis of a finished reel in this style (5 fps contact sheets, pixel-sampled colours, motion tracking at 30 fps). Everything else is observation or recommendation.

---

## 1. What the style is called

| Layer | Names | Search terms for more references |
|---|---|---|
| Visual look | **Digital cut-paper collage**, papercraft, construction-paper illustration, textured flat | `cut paper motion graphics`, `papercraft explainer`, `paper cutout animation` |
| Animation | **Digital cut-out animation**: rigid flat parts moved by transforms, not redrawn (the classic cut-out tradition) | `cut-out animation`, `rigged 2D`, `puppet animation` |
| Storytelling | **Extended-metaphor explainer**: an abstract idea acted out in a physical world | `visual metaphor explainer`, `analogy explainer` |
| Captions | **Word-pop captions** (karaoke / word-by-word kinetic captions), here on torn paper tags | `word by word captions`, `kinetic captions` |

Working name: **Papercut Explainer**. Format: faceless vertical short (Reels/TikTok/Shorts), voiceover-led.

---

## 2. Style DNA: the non-negotiables

Change the topic, palette, fonts or world, but keep these six rules:

1. **Everything is paper.** Flat fill, paper grain, a slightly irregular cut edge, and a soft drop shadow for every object. No gradients or outlines on objects.
2. **Shading comes from stacked cut pieces, not blends.** A darker strip for the underside and a lighter strip for a highlight, each its own paper layer.
3. **Two-voice typography.** A heavy caps sans on a taped paper banner for the beat's takeaway, and a soft bold serif on torn tags for the spoken words.
4. **Every set is a paper world.** Either one extended metaphor world (the mission-control example in `frame-breakdown.md`) or, more often, a **new set per banner** whose room and props illustrate the VO's words (the Echolark and Turbo Lane examples in `../../papercut-script/references/storytelling.md`). Real UI is always placed *inside* the set as a rough paper rebuild on a monitor or laptop.
5. **Never fully still.** Motion runs on ones with a slow camera drift, and the paper overlays "boil" on twos (section 8).
6. **Saturation is earned.** Backgrounds are muted and dark or dusty. Bright colour only goes on characters, captions and state signals.

---

## 3. Drawing in papercut (for any object or character)

### Shape language
- **Build from primitives:** rectangles, rounded rectangles (corner radius 2–6 px at 1080 w), circles, ellipses, trapezoids, triangles. Get the silhouette right first; if it reads as a flat shape at thumbnail size, it works.
- **Orthographic only.** Draw everything front-on or side-on, with no perspective and no 3/4 views. Depth comes from overlap, shadow and scale, never from vanishing points.
- **2–3 tones per object:** base, shade (about 12–18% darker, same hue), and an optional accent. The shade is a separate cut shape (underside band, inner rim, cast strip), not a gradient.
- **No outlines.** Separate objects with value contrast and drop shadow. Black only appears as a *fill* (screens, eyes, tyres, checkerboard panels).
- **Details are separate stacked pieces.** A porthole is a dark circle, then a grey ring, then small rivet dots. A button is a dark bezel plus a coloured cap. A screen is a black bezel, a coloured display, and paper text on top.
- **Controlled imperfection.** Edges wobble very slightly (noise displacement 1.5–3 px), shapes are nearly but not perfectly symmetric, and small tape or patch pieces are allowed. It should look handmade, not sloppy.
- **Chunky, legible scale.** Nothing meaningful smaller than about 12 px at 1080 w. Props are bold and simplified, closer to a children's book than a technical diagram.
- **Light from the top-left** for every object in every scene, so shadows fall down and slightly right.

### Material cheats (still paper, printed differently)
| Material | How to fake it on paper |
|---|---|
| Metal | Light grey paper plus a very fine horizontal streak texture, with rivet dots along the edges |
| Wood | Brown paper plus a faint grain texture and one darker plank-gap line |
| Glass/screen | Near-black paper plus one diagonal lighter sliver as a reflection |
| Fire | 2–3 nested trapezoids or teardrops (cream core → yellow → orange), flickering |
| Smoke/clouds | Clusters of overlapping circles in 2 greys (or whites), with darker circles tucked behind |
| Water/planet | Flat blue base, flat irregular blobs for land, flat elongated white cloud strips |
| Light beams | Semi-transparent flat wedge (50–60% opacity), no blur |
| Stars/sparkles | Four-point star shapes or 1–3 px dots |

### Characters
- **One base creature for the whole cast.** Simple geometry, a boxy or blobby body, **eyes only** (small solid shapes), and stubby rectangular limbs. The kit's default is a boxy orange critter (token `C.hero` `#D67354`, shade `C.heroLo` `#A9553B`, with `you` as an alias for the viewer's stand-in). Use whatever mascot fits the series, but keep it at this level of simplicity.
- **Characters differ only by accessory and name pill:** caps in different colours, headset, helmet, apron, hard hat, tie. The name pill is a small rounded label above or across the head.
- **Expressions are part swaps:** sleep (eye lines plus rising Z's), alert (eyes scale ×1.4 plus a small O mouth), happy (short smile line), worried (eyes shifted, one limb raised).
- **Acting:** limbs stretch to point or press (rectangle scaleX with overshoot), the body leans ±6°, hops 8–15 px, peeks up from behind furniture, and bobs ±2–3 px while idle. Walking is a slide plus a bob.

### Recipes for common props
- **Monitor/screen:** dark bezel (rounded rect) → display colour → paper content → reflection sliver. Add a thin top "title bar" for app windows.
- **Control desk:** front face (base tone) + a darker top lip + a row of 6–10 small square LEDs (green/amber/white) + a black label pill.
- **Gauge:** cream dial, black ticks, red arc on the low end, green arc on the high end, black needle with a round hub. The needle is its own layer so it can rotate.
- **Button/light:** a dim state (a dark shade of the colour) and a lit state (full saturation), swapped instantly.
- **Board/list:** dark rounded panel, rows as slightly lighter strips, a status pill at the right end of each row.
- **Checklist:** cream paper on a clipboard or easel; square boxes; ticks drawn on.
- **Paper document/card:** cream rectangle, a few grey bar "text lines", optional corner fold.

---

## 4. Canvas and layout

- **9:16, 1080×1920, 30 fps.** (Platform re-encodes often land at 720×1280. Always render at 1080×1920.)

| Zone | Y (% of height) | Contents |
|---|---|---|
| Top margin | 0–13% | Background only |
| **Header banner** | 14–21% | Taped paper strip, same position all video |
| **Stage** | 22–72% | Props, characters, embedded UI |
| **Caption band** | 68–80% | Word tags; the band shifts per scene to stay clear of faces and focal props |
| Platform safe area | 80–100% | Empty ground, floor or dark wall |

- Banner spans about 6–94% width, rotated about −1°.
- Let stage props **bleed off the side edges**, so the frame feels like a window into a bigger world.
- **Depth stack (back → front):** background wash → far props → mid props → characters → foreground lip (desk/console edge) → UI labels → captions → banner → grain.

---

## 5. Colour system

Build a palette by **role**. The values below are the default set.

| Role | Rule | Default |
|---|---|---|
| World backgrounds (1 per location) | Desaturated, dark or dusty, mottled and vignetted | sky `#567E97` → glow `#BAD7E9`, ground `#BFB087`, room slate `#132124`, space navy `#081027`, wall khaki `#8A7A60`, floor `#452A15` |
| Neutral paper | Warm off-white, used for documents and banners | cream `#DACEC0`, tape `#C3B284` |
| Prop mid-tones | Muted, one hue family per material | console sage `#8A9A86`/`#546054`, metal `#B1B9BC`, smoke `#726F68`, dark panel `#2E3235`, wood `#7F5231` |
| **Accents** | Saturated colours for the main character and the caption tags | hero critter orange `#D67354` (shade `#A9553B`), caption tag coral `#C9573C`, tag text cream `#F3E6D3` |
| Identity accents | Name pills, accessory colours | purple `#4E3881`, cap blue `#3968AD`, violet `#8154B9` |
| **State signals** | Fully saturated, each with a dim twin | go `#2DA34D`/`#165329`, no-go `#D63A2B`/`#4D140D`, amber `#F3A53B` |
| Ink | Near-black for text and labels | `#1C1B17`, navy sign `#293042` |
| Effects | Sparkles, fire | spark yellow `#F5C542`, pink `#F4A7B9`, flame `#FBF9D0` → `#F68B29` |

**Re-theming:** keep the roles and swap the values. Pick the accents first, choose backgrounds that are their muted complements, and keep signal colours standard (green/red/amber) so states read instantly.

---

## 6. Typography (families, not exact fonts)

Any font with these characteristics works; the listed ones are free options.

| Role | Characteristics | Good options |
|---|---|---|
| **Header banner** | Heavy geometric/grotesk sans, ALL CAPS, tight tracking, near-black | Archivo Black, Poppins ExtraBold/Black, Montserrat Black, Inter Black, Unbounded |
| **Caption tags** | Soft, rounded, chunky bold serif with a friendly handmade feel | Fraunces (Black, SOFT axis up), Recoleta, Cooper Black, Young Serif, DM Serif Display |
| **Labels/signage** | Bold sans caps inside pills | Inter 800, Archivo 800, Manrope 800 |
| **Embedded UI** | Whatever the real product uses | Inter for app chrome, JetBrains Mono / IBM Plex Mono for code |

Sizes at 1080 w: banner 56–64 px, one line with auto-shrink; captions 58–68 px; labels 26–40 px; UI 24–34 px.

**Banner copy:** 3–7 words, caps, stating the *takeaway* of the beat rather than repeating the voiceover. Test: a sound-off viewer reading only the banners should get the whole argument.

---

## 7. Material and texture recipe (apply to every object)

1. Flat fill.
2. **Paper grain:** fine fibre noise multiplied at 8–15% (SVG `feTurbulence` fractalNoise, baseFrequency ≈ 0.8–1.2, 3–4 octaves, clipped to the shape), or a tiled scanned-paper PNG with `multiply`.
3. **Cut edge:** a 1–2 px lighter rim on the top and left edges, plus low-frequency edge displacement (1.5–3 px).
4. **Drop shadow:** 0 px x, 3–6 px y, 6–10 px blur, black 25–40%. Foreground layers get the larger values. This is what sells the depth, so never skip it.
5. **Torn edge:** only on the banner and caption tags. Stronger displacement plus a faint white fibre fringe.
6. **Background wash:** mottled watercolour/parchment texture with a radial vignette (centre +10–15%, corners −25–35%). An optional bloom behind the hero prop.
7. **Global grain:** 2–4% animated film grain over the whole frame.
8. **Masking tape:** tan translucent (70–85%) strips with torn short ends, rotated about ±35° over the banner corners.

---

## 8. Camera and jitter *(measured)*

The handmade feel comes from **two separate motion layers**. Don't mix them up.

### A. World camera: smooth, continuous, never shaky
- Every scene has a slow **push-in and/or drift** toward the focal prop. The measured rate is about 0.6–1% scale per second, with the frame drifting 0.3–0.5 px per frame (720p) in x/y toward the subject.
- Measured jitter on world props is **~0.05 px RMS**: effectively none. The world layer moves on smooth easing curves only.
- Bigger moves are deliberate: a strong push (the desk grows about 15% in 1 s) on a dramatic line, and one **world-continuous tilt/pan** between two locations in the hook (about 0.6–0.8 s, ease-in-out).

### B. Paper boil: the stop-motion "hand-placed" jitter
- Screen-space paper overlays (the **header banner**, and likely the pills and labels on it) hold their position for **2 frames, then jump**. Offsets re-roll every 2 frames (15 Hz): about ±0.7–1.3 px at 720p ≈ **±1–2 px at 1080p**, RMS ≈ 0.4–0.5 px (720p). The values are random, with no drift.
- **Caption tags** float slightly once they've landed (±1 px at 720p), smoothly rather than stepped.
- Implementation: `const step = Math.floor(frame / 2); x = (random('bx' + step) - 0.5) * 3; y = (random('by' + step) - 0.5) * 3;` Optionally add `rotate = (random('br' + step) - 0.5) * 0.4deg`.
- Keep boil **subtle**. It should be felt rather than seen, and the text must stay easy to read.

### C. Everything else runs on ones
All 60 frames of every 2 s window I measured are distinct *(measured)*. Only the boil is stepped.

---

## 9. Motion language

All motion is transforms on rigid parts (position, scale, rotation, opacity). The only exceptions are draw-on strokes and typing.

### Timing constants (30 fps)
| Motion | Frames | Easing |
|---|---|---|
| Prop pop-in | 6–9 | Spring (damping ≈ 12, stiffness ≈ 180): scale 0 → 1.08 → 1, rotation ±4° → 0 |
| Caption word pop | 3–5 | Scale 0.6 → 1.05 → 1, y −8 → 0 px, no fade |
| Slide-in | 8–12 | Ease-out (0.16, 1, 0.3, 1), 4–8% overshoot |
| Limb stretch/press | 5–7 out, 5 back | 10% overshoot |
| State change (dim ↔ lit) | 1–2 | Hard swap plus sparkle burst |
| Blink (alarm/LED) | ~4 Hz | Hard on/off |
| Camera push | whole scene | Scale 1.00 → 1.06–1.12, ease-in-out |
| Idle bob | 30–40 period | Sine ±2–3 px |

### Signature effects (reusable in any world)
- **Sparkle burst:** 4–6 four-point stars (yellow/pink/white) fly out 30–60 px, scale 0 → 1 → 0 and spin over ~10 frames. Use for any confirmation or success.
- **Signal waves:** 2–3 concentric amber arcs pulse from a source toward a target, staggered 3 frames and fading as they travel. Use for any communication.
- **Alarm:** a blinking red panel plus a rotating translucent light wedge. Use for any error or urgency.
- **Typing:** about 2 frames per character, a block caret, and a spark on the keyboard per keystroke. Use for any command or input.
- **Scrolling tape/list:** content moves up at about 40 px/s, curls under a paper roller, and piles into a coil. Use for any stream of logs or data.
- **Draw-on annotation:** a hand-drawn red ellipse (stroke-dashoffset, ~8 frames) around the key item, while a character points at it.
- **Gauge needle:** ease-out with 3–5° overshoot and a small settle; step it down for "burning".
- **Stamp/card fly-out:** a card pops from a board, arcs to a character's hand, and lands rotated ±8°.
- **Engine/fire:** flames flicker (scaleY 0.9–1.1 at ~12 Hz noise), smoke circles expand and drift; failure is a white cough puff and a sink.
- **Ambient loops:** twinkling stars, rising Z's, blinking LEDs, waveforms on screens.

### Event density
One **discrete visual event per stressed word**, roughly every 0.4–0.8 s: a prop entering, a state flipping, a character acting, or a camera accent. Ambient motion runs continuously underneath.

---

## 10. Scene transitions

- **Hard cut on the banner change** is the default. Measured with scene detection on finished reels: 9 hard cuts in 28 s, 17 in 33 s and 11 in 30 s.
- **One world-continuous camera move** (a tilt or pan across a tall or wide canvas that holds two locations) in the hook is optional.
- **Slide-push / whip-pan into the CTA set:** the next set slides in from the side, or the frame smears horizontally with motion blur. About 6–8 frames.
- The banner stays in place and its text swaps on the cut.
- Sets last about 1.8–3 s in product tours and news videos, and up to 5 s for a metaphor beat that needs a mini-story.

---

## 11. Captions: word-pop torn tags

- One paper tag per word in the caption accent (coral `C.tag` by default), cream serif text, torn edges, drop shadow.
- Each tag gets a random rotation of −5° to +5° and a y-offset of ±6 px (seeded, so the same tag always gets the same values).
- 6–10 px gap between tags. Pages hold **1–3 words** (rarely 4) and break at phrase boundaries or punctuation.
- Each word appears exactly on its spoken onset; the page clears when the next page starts.
- The CTA keyword goes in CAPS in the same font, with no colour change.
- Pace: about **3.5–4 words/s** of voiceover, so 75–95 words per 22–30 s.

---

## 12. Narrative template (metaphor-world variant)

> The full storytelling system (spoken spine, banner fact track, set-per-banner staging, URL → rough UI, three modes, and the storytelling prompt) is in **`../../papercut-script/references/storytelling.md`**. This section covers the single-metaphor-world variant used by the mission-control example in `frame-breakdown.md`.

| # | Beat | Share of runtime | Purpose | Example (`frame-breakdown.md`) |
|---|---|---|---|---|
| 1 | Hook | ~13% | Absurd or funny visual plus a claim; uses the continuous camera move | Rocket launches, the advisor is asleep at mission control |
| 2 | Unlock | ~7% | The one action or command that changes things, shown in the real UI | `/advisor sage` typed in a terminal |
| 3–5 | Mechanism ×2–3 | ~30% | How it works, one metaphor prop per point | Telemetry tape; alarm → transmit; wrong cargo caught |
| 6 | Objection | ~17% | Cost or risk, told as a mini-story (usually the longest scene) | Two-rocket fuel race |
| 7 | Benefit | ~12% | The payoff, shown with state signals | GO/NO-GO board, limit gauge ✓ |
| 8 | Offer | ~7% | Free resource | Checklist plus a locked prompt card |
| 9 | CTA | ~5% | Comment keyword typed into a comment box, then Post | `COMMENT ADVISOR` |

**Choosing a metaphor world:** it needs a natural prop for the *actors*, the *work*, the *failure*, the *approval* and the *cost*. Worlds that fit: space mission, restaurant kitchen, railway yard, construction site, heist crew, hospital ward, post office, sports team, film set, garden. Call back to the hook's location in the objection or benefit beat.

---

## 13. Sound

- **Voiceover:** any TTS works. The recommended local option is **Qwen3-TTS** (open weights, `Qwen/Qwen3-TTS-12Hz-*` on Hugging Face; runs on Apple Silicon MPS or CUDA, usually through a small Gradio app). Use the user's existing install if there is one, and ask where it lives.
  - **TTS (CustomVoice)**, 0.6B or 1.7B: preset speakers Aiden, Dylan, Eric, Ryan, Serena, Vivian, Sohee, Ono_anna, Uncle_fu, plus an optional style instruction. For this style, try 1.7B with Ryan or Aiden and an instruction like *"friendly, natural, conversational, like telling a friend; clear pauses between sentences; stress the key word of each line"*. Delivery rules (breathing room, emphasis, tone): `../../papercut-voice/SKILL.md`.
  - **Voice Design** (1.7B): describe a voice in words.
  - **Voice Clone** (Base 0.6B/1.7B): clone from a reference clip plus its transcript.
  - Export the WAV to the video project's `public/vo/` and transcribe it for word timings (Remotion captions skill).
- **Measured on a finished reel:** the audio ran continuously with no gaps over 0.25 s at −35 dB, so voiceover lines were butted tight over a music bed.
- **Recommended:** a light playful music bed at −20 to −24 LUFS, plus paper and UI foley (pop on entrances, key clicks, a GO chime, a NO-GO buzzer, radio squelch, a whoosh on camera moves, a rumble on launches).
