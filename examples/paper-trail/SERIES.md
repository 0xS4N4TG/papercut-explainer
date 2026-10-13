# Paper Trail: series file

Invented for illustration. "Paper Trail" is a made-up faceless series about free versions of paid tools. Echolark and Vocalyst are made up too, so nothing here is a claim about a real product or company.

This is the file `papercut-strategy` reads first and `papercut-hook`, `papercut-script`, `papercut-storyboard` and `papercut-qa` check against. In a real series it sits at the series root, next to `episodes/`.

## Audience

- **Who:** people who make things on a computer: podcasters, video editors, students, indie makers. They pay for two to five subscriptions and resent at least one.
- **Level:** curious non-developer. They know what "the cloud", "open source" and "a laptop" mean. They have never opened a terminal on purpose. The feeling to leave behind: you're not behind, and now you know something most people don't.
- **Vocabulary:** plain words. "Reads it aloud", not "synthesises speech". "Writes out the recording", not "transcribes with diarisation". One number per sentence at most.
- **Regions:** global English. Prices in dollars. No references that only one country gets (a national sport, a local TV show). Aim for the US, UK and India; avoid idioms that don't travel.

## Voice

- Narrator: warm, a little amused, speaking to one person. Second person, contractions, short clauses joined by "and", "because", "which means".
- Delivery: ~3.75 words a second, a real pause at every sentence end, the stress on the number or the twist word. Tempo stays 1.0. Settings: `voice/voice.json` (Ryan, Qwen3-TTS CustomVoice).
- The narrator never jokes. The picture does.

## Format and look

- Style: papercut (the `papercut-explainer` look). 1080x1920, 30 fps, 22-30 s.
- Each episode picks one familiar format for every set and gag. Episode 01: a heist movie.

## Palette

Kit defaults, by role (`library/papercut/kit/tokens.ts`), with these series choices:

| Role | Value | Note |
|---|---|---|
| Mascot ("you") | hero `#D67354`, shade `#A9553B` | An orange base Critter with the blue cap (`#3968AD`, `C.cap`) always on. Orange reads best on cool or neutral walls. On warm sets (`garage-workshop`, `warehouse`, `stage-spotlight`) put a cream card or the blue cap against it so it doesn't melt into the wall. |
| Caption tags | coral `#C9573C`, cream text | Kit default. |
| Product UI accent | magenta-pink `#D6428F` (shade `#A62F6E`) | Echolark's own colour: the "Clone voice" button, waveform bars, progress fill, number badges. |
| Competitor cards | grey-lilac `#9A93A8` on cream | Muted on purpose. A competitor is a card pinned in the set, never the hero. |
| State signals | kit go / no-go / amber | Standard green, red and amber, with a dim twin each. |
| Room colours | kit `ROOM` set and the backdrop library | Rotate every set. Neighbouring scenes never share a backdrop. |

## Mascot notes

- One base Critter, eyes only, stubby limbs. It is the viewer: it reacts, it never speaks, it has no name pill.
- The blue cap stays on. Each idea gets one more paper prop on top (a domino mask, goggles, a monocle). The Critter has no accessory slot for these, so they are drawn in the scene file and are harvest candidates.
- Extra characters (a clone, a crowd, a bird) are the same Critter in another colour. No people, no real faces, no logos.
- Competitors are cards and signs. They are never characters.

## CTA style

- Spoken: "Good thing I made [the freebie]. For the link, comment KEYWORD." The keyword is one short word tied to the topic and repeats the hook's key word where it can.
- On screen: the comment box types the keyword, a DM envelope opens and fans out the deliverable cards (the `CtaPhoneDM` scene template).
- Delivery: by DM, slow and spaced.
- Caption: the hook as the first line, a follow line so the DM lands, "READ BELOW" with the useful part written out, one send prompt ("Send this to the friend who pays for three subscriptions"), 3-5 hashtags.

## Banned words and moves

- Hype: game-changer, revolutionary, insane, mind-blowing, next-level, supercharge, unleash, seamless, leverage, "dive in", "unlock the power of".
- News framing in the hook: "breaking", "just dropped", "just launched", "just released", "someone just".
- Jargon above the audience level: inference, quantised, parameters, open weights, latency, diarisation, ASR, TTS. The banners may say "IT LABELS WHO SAID WHAT", never "diarisation".
- Real company, product or person names. Invented ones only, and say so in the facts file.
- Claims that can't be traced to `research/facts.md`.

## Keyword log

| Ep | Keyword | Freebie |
|---|---|---|
| 01 | VOICE | Echolark setup guide |

## What has worked so far

Nothing yet: this is the first episode, and it is fictional. After the first real reel, write the autopsy to `research/analytics/` and put what changed here.
