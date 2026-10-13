HOOK
SAY:   Vocalyst charges $15 a month to clone your voice.
WRITE: $180 PER YEAR
SHOW:  Frame 0, mid-action: the mascot, a domino mask over its blue cap, is plugging an old laptop into the wheel of a bank-vault door. A brass plate on the door reads $15/MO and the laptop's progress bar is climbing. A coin marked FREE bounces off the door on "charges". The camera orbits, punches in on the plate at "$15", then pushes through the door on the cut.
ALIGN: The paid voice-cloning plan is a vault, and an old laptop is the key.

Invented for illustration. Written by `papercut-hook` (stage 2). The rest of this file is added by `papercut-script` (staging table) and `papercut-storyboard` (everything after it).

## Alignment test and hook check

Cover any two layers; the third should still hint at the same idea.

| Visible | Reads as | Result |
|---|---|---|
| WRITE only: "$180 PER YEAR" | something costs $180 every year | pass |
| SAY only: "Vocalyst charges $15 a month to clone your voice." | a monthly fee to clone a voice | pass |
| SHOW only: a laptop wired into a vault door with a price plate | a cheap machine getting round a paid lock | pass |

WRITE shares no word with SAY ($180 is the yearly total of the $15 in SAY, written as a different number). Frame 0 plus the title works with the sound off: the plate, the cable and the title carry it.

## Hook variants

The hook step writes five variants from at least three patterns. This keeps the winner and the two closest rejects. Score is one point per yes on the six-question hook check (gap within about 10 words, who or what is at stake, one concrete number or object, answer left for later, works muted, true to the facts).

| Variant | Pattern | Score | Verdict |
|---|---|---|---|
| "Vocalyst charges $15 a month to clone your voice." / title "$180 PER YEAR" | price shock | 6/6 | Chosen. The $15 is fact 20, the $180 is fact 21. The answer (a free app, an old laptop) waits for beats 3 and 4. |
| "A solo dev just open-sourced a free version of Vocalyst." / title "12,000 STARS" | borrowed authority + giveaway | 2/6 | Rejected. News framing (the hook update skips it), it answers itself in line one, and "just open-sourced" has no date in the facts, so it fails question 6. The 12,000 moves to beat 2 as proof. |
| "Your voice is probably sitting on someone else's server right now." / title "ALL YOURS" | pain and fear | 3/6 | Rejected. "Probably" can't be checked against the facts (fact 23 covers Vocalyst only, not the viewer's setup), so it fails question 6. No number, and "ALL YOURS" doesn't match any picture. |

## Global rules

- 1080x1920, 30 fps, 22-30 s. Banner at 14-21% height, caption band `y=0.745` (the default `stubs.py` writes) unless a scene says otherwise, bottom 20% clear (nothing but ground, floor or plain wall below y 1536). Light from the top-left. Saturation only on characters, captions and signals.
- Palette by role is in `SERIES.md`. Mascot: the base `Critter`, orange (color `#D67354`, shade `#A9553B`), blue cap always on, one extra scene-drawn prop on top per idea. Pass the colours as props or through the episode's `src/theme.ts`; never edit `src/lib/`. Product UI accent: magenta-pink `#D6428F`. Competitor cards: grey-lilac `#9A93A8`.
- Orange reads best on cool or neutral walls. On the warm sets (`garage-workshop`, `warehouse`, `stage-spotlight`) the blue cap and a cream card behind the mascot keep it off the wall.
- Sets are `Backdrop` images, one per scene, never the same backdrop on neighbouring scenes. `S11Payoff` is the one callback and returns to the `S01Hook` vault.
- **Format: a heist movie.** The target (S01, S11), the hideout (S02), casing the joint (S03), the getaway car (S04), meet the crew (S05), the job (S06), the loot (S07), the escape route (S08), the delay (S09), the tracking tag (S10), the briefing (S12), the call (S13). The narrator stays straight; the picture is the joke.
- **Frame column.** In the scene blocks, `frame` is an offset in frames from the onset of the named word (0 = on the word, -10 = ten frames before it). Scene agents read it as `cueOf(ID)(word, n) + offset`. The header seconds and frame counts come from a placeholder voice at 4.2 words a second and will move with a real take; the offsets will not.
- **Hook motion.** The cut out of the hook carries motion: S01 pulls back a hair, then pushes hard; S02 opens on an impact (the repo card slams onto the pegboard with a stamp) and the camera eases back from 1.17x. The title ends on the cut (`hook.hold` 2.6 s, S01 is 2.67 s).
- **Proof beat (S02Proof).** A real page capture taped onto a paper card with a red marker circle on the number. Echolark is invented, so this example draws a `RepoCard` and a `MarkerCircle`. In a real episode: `node $PAPERCUT_LIB/tools/capture.mjs <url> public/proof/repo.png` and the kit's `RealShot`.
- Humour pass: a costume prop per idea, one struggling beat (S09), a returning prop (the S01 price plate comes back as "$0/MO" in S13), one absurd unexplained moment (the masked pigeon in S01), no meme this time. Every gag reads in under a second and stays off the banner, the captions and the key number.
- No logos, no real company names, no numbers on screen beyond those in this file and `research/facts.md`.

## Staging table

One row per banner, written by `papercut-script`. Bold words in the VO column are the one or two words each line leans on; `papercut-voice` passes them to the TTS. Times are from the placeholder voice. A banner never repeats the VO.

Stressed words by line: l1 **$15**, **clone**. l2 **12,000**. l3 **renting**, **old laptop**. l4 **Echolark**. l5 **anything**. l6 **books**, **types**, **transcribes**. l7 **210**. l8 **slower**, **watermark**. l9 **cancel**, **nothing**. l10 **VOICE**.

| t (s) | VO words under it | BANNER | SET (room + bg colour) | HERO PROP | PRODUCT UI moment | MASCOT | GAG |
|---|---|---|---|---|---|---|---|
| 0.00-2.67 | Vocalyst charges **$15** a month to **clone** your voice. | VOCALYST'S FREE PLAN CAN'T CLONE (the hook title covers it until the cut) | `bank-vault`, steel | Vault door with brass plate "$15/MO"; old laptop wired to a socket plate on the door | Laptop shows the magenta "Clone voice" button and a progress bar, no app name yet | Plugging in the cable, pushes the plug home on "clone". Domino mask over the cap | A coin marked FREE bounces off the door. Absurd beat: a pigeon in a tiny mask on the deposit boxes |
| 2.67-4.77 | A **free** version just hit **12,000** stars. | ONE DEV WROTE ALMOST ALL OF IT | `garage-workshop`, warm | Pegboard hideout; repo card taped to it; a jar | Repo card, owner and name blurred: "The open-source, fully-local Vocalyst alternative", Star pressed, counter to 12,000, red marker circle | Points at the count. Welding goggles pushed up over the cap | Each star drops into the jar, and the jar overflows |
| 4.77-6.37 | So instead of **renting** your voice, | A DESKTOP APP, NOT A WEBSITE | `gallery-lobby`, cool | Reception desk with a brass bell; rate card "VOICE RENTAL $15/MO" | A rental slip: "MY VOICE (RENTED)" | Checks the slip. Monocle over the cap | The receipt printer spits one slip a month; twelve curl across the floor |
| 6.37-8.03 | run it on an **old laptop**. | NO GRAPHICS CARD NEEDED | `warehouse`, warm | Laptop under a dust sheet on a pallet; "10 YRS" sticker | Screen wakes with the outline of a window | Lifts the sheet. Head torch over the cap | Dust poofs. A graphics card in the corner wears a tag: NOT NEEDED |
| 8.03-10.03 | It's called **Echolark**. One clip of you, | IT ASKS FOR 5-15 CLEAN SECONDS | `stage-spotlight`, warm | App icon (magenta square, bird shape) on a pedestal in the spotlight; name pill ECHOLARK | Sample-length meter, 0-20 s, green zone 5-15 s, the tick lands at 10 s | MC with a mic, bowtie over the cap | A paper lark pops out of the curtain and echoes the mascot's note |
| 10.03-12.23 | and it reads **anything** in your voice. | PASTE, TYPE OR IMPORT ANY SCRIPT | `home-office-day`, day | Monitor with the script screen, typed "Local cat wins the election" | "Import script / Paste / Insert", "Clone voice" pressed, magenta waveform pulses | Listening. Headphones over the cap | A see-through copy of the mascot, pill CLONE, mouths the sentence in the same pose |
| 12.23-15.27 | It also reads **books** aloud, **types** for you, and **transcribes** audio. | IT LABELS WHO SAID WHAT | `library`, warm | Three props in a row: red book with a voice card, floating mic over a notes window, transcript panel | "The Librarian: warm UK audiobook narrator"; mic types into notes; "Upload & Transcribe", "Choose file...", rows Speaker 1 and Speaker 2 | Walks the lineup. Glasses over the cap | Two small critters trade speech bubbles, each tagged SPEAKER 1 or SPEAKER 2 |
| 15.27-17.93 | And get this: it dubs videos into **210** languages. | VOCALYST'S DUBBING: 40+ LANGUAGES | `airport-gate`, day | The departures board as a language list; big "210" card; Vocalyst's "40+" card taped to the seat wall | Dub steps Upload, Translate, Dub light up 1-2-3; "Manage languages" rows (Hausa, Māori, Polski) flip in | At the gate with a suitcase. Pilot goggles over the cap | The suitcase bursts open and language stickers pile up; Vocalyst's suitcase has three |
| 17.93-19.30 | But it's **slower** on old laptops, | A 10-MINUTE DUB TAKES ABOUT AN HOUR | `subway-platform`, night | Platform sign with a progress bar that barely moves; wall clock | "DUBBING..." with a crawling bar | Struggling beat: slumped on the bench, laptop on its knees. Nightcap over the cap | A cobweb grows between mascot and laptop. Freeze frame: "yep, that's me." |
| 19.30-21.07 | and clips carry a **watermark**. | DOCS: YOU CAN'T HEAR THE WATERMARK | `art-gallery`, day | Three framed waveforms; a speaker on a plinth | An "AI" tag stamps onto each waveform | Inspecting. Detective hat over the cap | Cups an ear at the speaker and hears nothing; the magnifier shows the stamp |
| 21.07-23.87 | Which means you can **cancel** Vocalyst, and **nothing** gets uploaded. | NO ACCOUNTS, NO CLOUD, NO API KEYS | `bank-vault` (callback to S01), steel | The "$15/MO" plate stamped CANCELLED; a sad paper cloud on a cable | "Translate model (Local, Heavy) · Offline" with a bar; the upload bar stuck empty | Walks off with the laptop in a sack. Domino mask back on | The cloud tries to plug in and the cable is too short |
| 23.87-25.17 | Good thing I made a **guide**. | ONE GUIDE FOR MAC, WINDOWS, LINUX | `classroom`, day | Chalkboard checklist, three rows MAC, WINDOWS, LINUX; guide card | Guide card with three ticks lighting 1-2-3 | Pointer stick in hand. Mortarboard over the cap | Each tick lands with a tiny chalk puff |
| 25.17-27.97 | For the link, comment **VOICE**. | COMMENT VOICE FOR THE SETUP | `CtaPhoneDM` template, teal room | Phone with the comment box; DM envelope with three cards | Comment box types VOICE and posts | Happy, cap only | Returning prop: the S01 plate comes out of the DM reading "$0/MO" |

Banner types covered: price translation (the hook title), credibility (S02), availability (S03, S12), headline stat (S05), feature claims (S06, S07), competitor contrast (S01, S08), honest caveat (S09), trust or safety (S10, S11), range or decision (S12), CTA (S13). 13 banners in 28 s.

## Camera / Cut table

One row per scene, added by `papercut-storyboard`. The cut column goes into `episode.json` `cuts`, keyed by the incoming scene.

| Scene | Camera (`paper/camera.tsx`) | Cut in (`CutSeries` kind) |
|---|---|---|
| S01Hook | `OrbitCamera` + `Depth`, `SnapZoom` on "$15" at the plate, accelerating push on the last 12 frames | none |
| S02Proof | `PullBack` from 1.17x on the repo card's star counter out to the pegboard | `zoomThrough` into the vault wheel (x 190, y 900) |
| S03Rent | `RackFocus` from the foreground bell to the rental slip | none (hard cut) |
| S04Laptop | `OrbitCamera` + `Depth`, `ForegroundPass` (block, from the left) | none |
| S05Name | `FocusHunt` on the app icon at "Echolark" | none |
| S06Demo | `CameraPush` toward the monitor, accent at "anything" | none |
| S07Stack | `CrabTrack` along the lineup: book, microphone, transcript | none |
| S08Peak | `SnapZoom` on the "210" card at "210" | `whip` |
| S09Slow | `FreezeFrame` at the end of "laptops," with the label "yep, that's me." | none |
| S10Mark | `FocusPulse` at "watermark" | `stampCut` |
| S11Payoff | `CameraPush` slowly toward the sad cloud | `tearAway` |
| S12Guide | `OrbitCamera` + `Depth` | none |
| S13Cta | `RackFocus` 5 px to 0 over the first 14 frames, around `CtaPhoneDM` | `tapePull` with the label "FREE" |

Plain `CameraPush` is on 2 of 13 scenes. One tear (S11), no page turn. One whip (S08) and one zoom-through (S02) are the only air sounds.

## Scene blocks

Four scenes in full: the hook, the number peak, the struggling beat and the CTA. The other nine follow the same format when their scene agent builds them; their rows are in the staging table above.

## S01Hook: the target  (0.00-2.67 s, 80 f)   BANNER: VOCALYST'S FREE PLAN CAN'T CLONE
Location/bg: `bank-vault` (steel, floorY 1450)   Camera: `OrbitCamera` (yaw 14, push 1.12, origin [540, 1450]) + `Depth`, `SnapZoom` at "$15" (x 190, y 900, to 1.25, settle 1.08), exit push   Cut in: none
Cast: mascot (orange `Critter`, blue cap, domino mask), a small grey pigeon (same `Critter`, tiny mask)   Caption band: y=0.745
Cues: Vocalyst@6 charges@17 $15@27 a@32 month@35 to@43 clone@47 your@55 voice.@62 (placeholder timing). The hook title covers the banner until frame 78, so the banner shows for 2 frames before the cut.

| VO word (stressed) | frame | event | motion spec |
|---|---|---|---|
| (frame 0) | 0 | Full, readable set: vault door at the left with the brass plate "$15/MO" (`Slab` + `Pill`); a `Laptop` on a crate, duct-taped lid, dust sheet half off, wired by `Cable` and `PlugHead` to a `SocketPlate` on the door; mascot mid-reach with the plug half in. Laptop screen: `AppWindow` with the magenta `Button` "Clone voice" and a `Progress` bar climbing. Title "$180 PER YEAR" already on screen | no fade-in; progress bar starts about 40% full |
| "Vocalyst" | 0 | Heavy boom. The pigeon pops onto the deposit-box grid. A glint crosses the plate | `PopIn` 8 f; `SparkleBurst` at the plate |
| "charges" | 0 | Mascot flicks a coin marked FREE at the door | arc over 9 f, spin on twos |
| "charges" | +9 | The coin hits the door and bonks back to the floor | rebound 12 f; plate shakes ±4 px, decays in 10 f |
| "$15" | 0 | The plate is the focal prop: `SnapZoom` punches in and the "$15/MO" text pops | `SnapZoom` `at` this frame; text scale 1 -> 1.25 -> 1 in 6 f |
| "month" | 0 | The vault wheel turns one notch with a click | rotate 30° in 4 f, hold |
| "clone" | 0 | Mascot shoves the plug home; the `SocketPlate` LED goes green | `lit` 0 -> 1 in 4 f; mascot lean +6° |
| "voice" | +2 | The progress bar reaches full, the laptop screen flashes, a sparkle | `Progress` ends; `SparkleBurst` at the laptop |
| (end of scene) | frames 68-79 | Pull back a hair, then push hard at the wheel. The title lifts away at frame 78 and the `zoomThrough` carries into S02Proof | scale 1.08 -> 1.04 over 3 f, then 1.04 -> 1.5 with an ease-in over 9 f |

Ambient: laptop waveform bars idle in the accent colour, vault lamp blinks at 4 Hz, mascot bob ±2 px, pigeon head-tilt on twos.
Boil: banner + labels ±1.5 px every 2 frames.
SFX: `hit` (frame 0), `toss`, `bonk`, `coin`, `click`, `plug`, `glint`. The rows are in `tools/cue_sheet.d/S01Hook.json`.

## S08Peak: the escape route  (15.27-17.93 s, 80 f)   BANNER: VOCALYST'S DUBBING: 40+ LANGUAGES
Location/bg: `airport-gate` (day, floorY 1440; departures-board frame at x 744-1080, y 460-710)   Camera: `SnapZoom` at "210" on the big card (x 640, y 590, to 1.25, settle 1.06)   Cut in: `whip`
Cast: mascot with pilot goggles over the cap and a suitcase   Caption band: y=0.745
Cues: And@2 get@8 this:@13 it@21 dubs@25 videos@32 into@41 210@48 languages.@53

| VO word (stressed) | frame | event | motion spec |
|---|---|---|---|
| (frame 0) | 0 | The whip has landed by frame 7. Full set: the board is dark; mascot at the gate desk with the suitcase; a `Monitor` on the desk shows the dubbing panel (`AppWindow`) with three dim steps | board dark; steps dim |
| "get" | 0 | Vocalyst's card (`NumberCard` "40+", grey-lilac, `TapeCorners`) slaps onto the seat wall at the left | `PopIn` 8 f, rot -3° |
| "dubs" | 0 | Step 1 "Upload" lights in magenta; a `Pointer` glides to it and clicks | `Pointer` keys: 10 f glide, click ripple |
| "videos" | 0 | Step 2 "Translate" lights | swap in 3 f |
| "into" | 0 | Step 3 "Dub" lights and its bar fills | `Progress` 10 f |
| "210" | -10 | The board switches on: language rows (Hausa, Māori, Polski, ...) flip in, one every 2 f. A big magenta `NumberCard` rises beside it and counts | `CountUp` `at` 38, `dur` 10, `to` 210, so it lands on the word |
| "210" | 0 | The number lands: `SnapZoom` on the card with a sparkle. Vocalyst's "40+" card shrinks a size | `SnapZoom` x 640, y 590; `SparkleBurst`; 40+ card scale 1 -> 0.9 in 6 f |
| "languages." | 0 | The suitcase bursts open and language stickers pile up. Vocalyst's tiny suitcase has three stickers | stickers `PopIn` staggered 2 f; `bob` on the pile |

Ambient: board rows keep flipping on twos, clouds drift 20 px/s, mascot bob ±2 px, the plane tail rolls.
Boil: banner + labels ±1.5 px every 2 frames.
SFX: `pop` on "get", `tick` on "dubs", "videos" and "into", `count` at "210" -10, `sparkle` on "210", `drop` on "languages.". The cut-in `whip` comes from `cutSfx`.

## S09Slow: the delay  (17.93-19.30 s, 41 f)   BANNER: A 10-MINUTE DUB TAKES ABOUT AN HOUR
Location/bg: `subway-platform` (night, floorY 1440; bench at the left edge, tunnel mouth at the right)   Camera: `FreezeFrame` `at` = cue("laptops") - 2 (frame 31), label "yep, that's me.", mark right   Cut in: none (hard cut)
Cast: mascot slumped on the bench with a nightcap over the cap   Caption band: y=0.745
Cues: But@2 it's@8 slower@14 on@23 old@27 laptops,@33

| VO word (stressed) | frame | event | motion spec |
|---|---|---|---|
| (frame 0) | 0 | Full set: mascot on the bench, `Laptop` on its knees; a platform sign over the tunnel with a `Progress` bar and a `Pill` "DUBBING..."; a wall clock | expr `worried` |
| "it's" | 0 | Mascot slumps further | lean 0 -> -8° in 6 f; expr `sleep` |
| "slower" | 0 | The bar creeps one notch and stops. A cobweb strand drops from the laptop to the bench | `Progress` +1 notch over 6 f, then still; strand grows over 10 f on twos |
| "old" | 0 | The clock hands spin two full turns | rotate 720° in 8 f |
| "laptops," | -2 | `FreezeFrame` holds the shot, drains the colour and darkens the edges. The label "yep, that's me." slaps onto the side of the frame | hold from frame 31; label stamp bounce 6 f |

Ambient: tunnel light flicker (`LampFlicker`), cobweb sway, mascot breathing. Everything stops at the freeze on purpose.
Boil: banner + labels ±1.5 px every 2 frames.
SFX: `squash` on "it's", `tick` on "slower" and again on "old", `scratch` at the freeze (frame 31).

## S13Cta: the call  (25.17-27.97 s, 84 f)   BANNER: COMMENT VOICE FOR THE SETUP
Location/bg: `CtaPhoneDM` scene template (teal `Room`)   Camera: `RackFocus` from 5 px to 0 over frames 0-14, around the template   Cut in: `tapePull` (label "FREE")
Cast: mascot at the right, blue cap only, happy   Caption band: y=0.745
Cues: For@2 the@8 link,@14 comment@22 VOICE.@32

```
<RackFocus from={5} to={0} at={0} dur={14}>
  <CtaPhoneDM dur={durOf(ID)} keyword="VOICE" typeAt={cue('comment')}
    sendAt={cue('voice') + 16} landAt={cue('voice') + 28} sparkleAt={cue('voice') + 34}
    itemW={300} itemH={360} whip={false}
    items={[<GuideCard/>, <OsChecklist/>, <PlateCard text="$0/MO"/>]}
    mascot={<You x={870} y={1420} size={260} expr="happy" />} />
</RackFocus>
```

| VO word (stressed) | frame | event | motion spec |
|---|---|---|---|
| (frame 0) | 0 | The tape strip has pulled away by frame 10. Phone at the left with an empty comment field, envelope closed, mascot at the right | `tapePull` 10 f; `RackFocus` 5 -> 0 px |
| "comment" | 0 | The comment box types V, O, I, C, E, one letter every 4 f | `PhoneComment` `fpc` 4, `postAt` defaults to `typeAt` + 22 |
| "VOICE." | +12 | Post: the comment row slides in under the box | `postAt` 44 |
| "VOICE." | +16 | The DM envelope opens and the flap flips | `sendAt` 48, 6 f |
| "VOICE." | +28 | Three cards fan out: the guide card, an OS checklist (MAC, WINDOWS, LINUX) and the brass plate, now reading "$0/MO" | `landAt` 60; fan spread 66° |
| "VOICE." | +34 | Sparkle over the fan, mascot hops | `sparkleAt` 66; `hop` 12 f |

Then a calm hold to frame 84.
Ambient: phone and envelope breathe ±1.2%, cards wiggle ±1.2°, mascot bob ±2 px.
Returning prop: the "$15/MO" plate from S01 is the third card, now "$0/MO".
Boil: banner + labels ±1.5 px every 2 frames.
SFX: `key` on "comment", `click` at "VOICE." +12, `rip` at +16, `pop3` at +28, `sparkle` at +34. The cut-in `tape-peel` comes from `cutSfx`.

## SFX plan

- Bed: `marimba-heist-Dm-112` (`episode.json` `bed`).
- `cutSfx`: `cut` by default, `zoom` into S02Proof, `whip` into S08Peak, `stamp` into S10Mark, `rip` into S11Payoff, `tape-peel` into S13Cta. Air sounds: 2 in 28 s, the budget is 11.
- Rows live in `tools/cue_sheet.d/<Scene>.json`, written by each scene agent. This example ships S01Hook's.

| Scene | SFX, in order |
|---|---|
| S01Hook | `hit`, `toss`, `bonk`, `coin`, `click`, `plug`, `glint` |
| S02Proof | `stamp` (card slams in), `count` (stars), `scribble` (marker circle), `drop` (jar overflows) |
| S03Rent | `ding` (bell), `printer` (slips), `drop` (slips land) |
| S04Laptop | `poof` (dust sheet), `click` (screen wakes), `pop` (NOT NEEDED tag) |
| S05Name | `curtain`, `glint` (icon), `tick` (meter), `birds` (the lark) |
| S06Demo | `key` (typing), `click` (Clone voice), `pop` (the clone appears), `sparkle` |
| S07Stack | `pop` x3 (book, mic, transcript), `keys` (notes typing), `tick` (speaker tags) |
| S08Peak | `pop`, `tick` x3, `count`, `sparkle`, `drop` |
| S09Slow | `squash`, `tick` x2, `scratch` |
| S10Mark | `tick` (stamps), `glint` (magnifier), `pop` |
| S11Payoff | `stamp` (CANCELLED), `unplug`, `drip` (the cloud's tear), `chime` |
| S12Guide | `tick` x3, `pop`, `sparkle` |
| S13Cta | `key`, `click`, `rip`, `pop3`, `sparkle` |

The Timing section below is generated by `tools/timing_md.py` after the voice step (stage 6). It is not part of what the storyboard stage writes.

## Timing (generated from the narration by tools/timing_md.py)

Total 839 frames (27.97 s).
Hook title (global): frames 0–78; the banner starts at frame 78.

| Scene | from (abs f) | dur (f) | dur (s) |
|---|---|---|---|
| S01Hook | 0 | 80 | 2.67 |
| S02Proof | 80 | 63 | 2.10 |
| S03Rent | 143 | 48 | 1.60 |
| S04Laptop | 191 | 50 | 1.67 |
| S05Name | 241 | 60 | 2.00 |
| S06Demo | 301 | 66 | 2.20 |
| S07Stack | 367 | 91 | 3.03 |
| S08Peak | 458 | 80 | 2.67 |
| S09Slow | 538 | 41 | 1.37 |
| S10Mark | 579 | 53 | 1.77 |
| S11Payoff | 632 | 84 | 2.80 |
| S12Guide | 716 | 39 | 1.30 |
| S13Cta | 755 | 84 | 2.80 |

Word cue frames (relative to each scene's start; `cueOf(ID)('word', n)` returns these):

```
S01Hook        Vocalyst@6 charges@17 $15@27 a@32 month@35 to@43 clone@47 your@55 voice.@62
S02Proof       A@3 free@6 version@13 just@23 hit@30 12,000@35 stars.@44
S03Rent        So@3 instead@7 of@18 renting@23 your@34 voice,@41
S04Laptop      run@3 it@9 on@14 an@18 old@23 laptop.@29
S05Name        It's@3 called@8 Echolark.@15 One@37 clip@43 of@50 you,@55
S06Demo        and@2 it@8 reads@13 anything@22 in@34 your@38 voice.@46
S07Stack       It@2 also@6 reads@12 books@20 aloud,@27 types@35 for@42 you,@47 and@54 transcribes@59 audio.@72
S08Peak        And@2 get@8 this:@13 it@21 dubs@25 videos@32 into@41 210@48 languages.@53
S09Slow        But@2 it's@8 slower@14 on@23 old@27 laptops,@33
S10Mark        and@3 clips@8 carry@16 a@23 watermark.@27
S11Payoff      Which@2 means@9 you@16 can@21 cancel@25 Vocalyst,@33 and@44 nothing@49 gets@57 uploaded.@63
S12Guide       Good@2 thing@9 I@18 made@21 a@28 guide.@32
S13Cta         For@2 the@8 link,@14 comment@22 VOICE.@32
```
