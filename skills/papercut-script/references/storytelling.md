# Storytelling playbook: story and visuals together

A storytelling system for papercut explainer reels, shown through three worked examples. Every product, company and number in them is invented, so the examples make no claims about real companies.
- **C: Codewright advisor** (28 s): feature unlock / how-to
- **A: Echolark** (33 s): open-source drop / "free version of X"
- **B: Turbo Lane** (30 s): news launch / "is it worth it?"

The verbatim scripts are just below. The staging tables in sections 8 and 9 list each set with its time range.

### Verbatim scripts

**C: Codewright advisor (28 s, ~120 words)**
> Once Atlas 2 is your main model, stop leaving Sage 3 doing nothing. Because Codewright just added a command called advisor, and it puts Sage 3 to work reviewing what Atlas builds. Basically, Atlas keeps writing the code while Sage reads your whole session. Then Sage steps in at the exact moments mistakes happen, like right before Atlas builds the wrong thing or calls broken code finished. And get this: it costs less than running Sage 3 the whole time, because Sage stays quiet unless it's needed. Which means you get Sage's judgment on every big decision without burning through your limit. Good thing I made one prompt that sets it all up for you. For the link, comment ADVISOR.

**A: Echolark (33 s, ~115 words)**
> A solo dev just open-sourced a free version of Vocalyst, and it's already past 12,000 stars. So instead of paying Vocalyst every month to clone your voice, you can now do it on your own computer, even on the 10-year laptop you have sitting around in the basement. It's called Echolark, and you give it a short clip of you talking and it can read anything back in your voice. And cloning your voice is just the start, because it turns any book into an audiobook, types out whatever you want to say, and writes a transcript of any recording. But here's the part that's even crazier: it can dub your videos into 210 languages, which means you stop paying any more bills, since it runs on your computer and your voice never has to get uploaded anywhere. For the link and setup, comment VOICE.

**B: Turbo Lane (30 s, ~120 words)**
> You can now make Brightloom's smartest AI code 8 times faster for $500 a month. But is it actually worth it? Basically, it's called Turbo Lane, which Brightloom launched today, and it only runs on their best model, Nimbus 4. For example, on stage, Turbo Lane coded a rocket that took off before the normal version was even finished. And get this: that plan gives you 25 times the $20 plan's usage, and it works in other apps too. But if you're building apps with it, Turbo Lane costs 6 times as much to run. And even if you use Marlow or Brightloom, you already have a normal fast mode you can turn on with one command. Good thing I made a cheat sheet on which plan is actually worth it. For the link, comment FAST.

Role-framing check for C: in this invented feature the main model does all the work, and the advisor only weighs in when called. A new script should not say the advisor "reads your whole session" or "does nothing", because both imply it runs all the time. See the note in `../../papercut-explainer/references/frame-breakdown.md`.

---

## 1. The core idea: three tracks per beat

Every beat runs three tracks at once, and **they do different jobs**:

| Track | Job | Changes every | Example (A, 8.3-10.9 s) |
|---|---|---|---|
| **Voiceover** (shown as caption tags) | Tells the story: casual, second person, fast | sentence | "even on a 10-year-old laptop you have sitting around the basement" |
| **Banner** (the fact track) | Adds the hard fact, number or honest caveat the VO skips | 1.8-3 s | `RUNS ON A PLAIN CPU, JUST SLOWER` |
| **Set** (the visual track) | Literally illustrates a concrete noun or idea from the VO, plus the product UI doing the thing | with the banner | A basement laundry room: old laptop under a dust sheet, washing machine spinning, cat asleep in the laundry basket, mascot on a stool |

Rules:
- **The banner never repeats the VO.** It's a parallel fact sheet. Reading only the banners gives you a spec list, and listening only to the VO gives you a story. (C's banners lean closer to takeaways, while A and B are pure fact tracks. Prefer the fact-track style.)
- **The set comes from the VO's words, not the banner's.** "basement" gives a laundry room. "audiobook" gives a library. "$500 a month... worth it?" gives a balance scale with a toll sign. "launched today" gives a race-day stadium.
- **The product UI does the demo.** A rough paper rebuild of the real app (section 5) sits on a monitor or laptop in the set and acts out the feature: typing, a progress bar, a waveform, a language list scrolling.

---

## 2. The spoken spine (all three examples)

| # | Beat | Formula | A: Echolark | B: Turbo Lane | C: Codewright advisor |
|---|---|---|---|---|---|
| 1 | **Hook** (0-3 s) | Big-brand name + concrete number or promise | "A solo dev just open-sourced a free version of Vocalyst" | "You can now make Brightloom's smartest AI code 8 times faster for $500 a month." | "Once Atlas 2 is your main model, stop leaving Sage 3 doing nothing." |
| 2 | **Proof or tension** | Social proof, or the doubt the viewer feels | "and it's already past 12,000 stars." | "But is it actually worth it?" | none |
| 3 | **Reframe** | "So instead of [paying/doing X], you can [Y]" | "So instead of paying Vocalyst every month to clone your voice, you can now do it on your own computer, even on the 10-year laptop you have sitting around in the basement." | none | "Because Codewright added a command called advisor..." |
| 4 | **Name reveal** | "It's called ___" (after the hook, never before) | "It's called Echolark," | "Basically, it's called Turbo Lane, which Brightloom launched today," | (named in beat 3) |
| 5 | **How it works / demo** | One concrete example the viewer can picture | "and you give it a short clip of you talking and it can read anything back in your voice." | "and it only runs on their best model, Nimbus 4. For example, on stage, Turbo Lane coded a rocket that took off before the normal version was even finished." | "Basically, Atlas keeps writing the code while Sage reads your whole session..." |
| 6 | **Escalation** | "And [X] is just the start, because..." + a stack of three features | "And cloning your voice is just the start, because it turns any book into an audiobook, types out whatever you want to say, and writes a transcript of any recording." | none | "Then Sage steps in at the exact moment mistakes happen, like..." |
| 7 | **Peak** | "But here's the part that's even crazier:" / "And get this:" + the biggest number | "But here's the part that's even crazier: it can dub your videos into 210 languages," | "And get this: that plan gives you 25 times the $20 plan's usage, and it works in other apps too." | "And get this: it costs less than running Sage 3 the whole time..." |
| 8 | **Catch** (honest counterpoint) | "But if you're [X], ..." / "And even if..." | (carried by the banners: `JUST SLOWER`, `AI WATERMARK`) | "But if you're building apps with it, Turbo Lane costs 6 times as much to run. And even if you use Marlow or Brightloom, you already have a normal fast mode you can turn on with one command." | (in banners) |
| 9 | **Payoff** | "which means..." + the viewer benefit | "which means you stop paying any more bills, since it runs on your computer and your voice never has to get uploaded anywhere." | none | "Which means you get Sage's judgment on every big decision without burning through your limit." |
| 10 | **CTA** | "Good thing I made [a freebie]... For the link, comment KEYWORD." | "For the link and setup, comment VOICE." | "Good thing I made a cheat sheet on which plan is actually worth it. For the link, comment FAST." | "Good thing I made one prompt that sets it all up for you. For the link, comment ADVISOR." |

### Phrase bank (use these connectives)
"A solo dev just..." · "You can now..." · "Once X is your Y, stop..." · "and it's already past N stars" · "But is it actually worth it?" · "So instead of... you can..." · "even on a..." · "It's called..." · "Basically," · "For example," · "And X is just the start, because..." · "But here's the part that's even crazier:" · "And get this:" · "But if you're..." · "which means..." · "Good thing I made..." · "For the link (and setup), comment KEYWORD."

### Script rules
- **75-95 words for 22-30 s.** The worked examples run longer, 105-120 words for 28-33 s. Shorten beats rather than speeding up the voice. Short clauses joined by "and", "because", "which means".
- Second person ("you", "your computer", "your voice"). Contractions. Vocabulary at the audience level in `SERIES.md` (`../../papercut-strategy/SKILL.md`, audience level).
- **Hook update:** the "stated as news" formula in beat 1 (for example "A solo dev just open-sourced...") gets skipped. Open the gap and the stake instead (`../../papercut-hook/SKILL.md`). The rest of the spine stands.
- **Name a big brand in the first sentence** (Vocalyst, Brightloom and Marlow in the examples) even when the subject is something else. Viewers already know the brand, so the stakes land without setup.
- Every number in the VO is concrete and sourced: 12,000 stars, 210 languages, 8x, $500, 25x.
- A feature stack is always **three items**.
- **Honesty is part of the format.** Include at least one real limitation, in the VO or the banners. It builds trust and gives the "is it worth it" tension somewhere to land.
- The CTA keyword is one short word tied to the topic (VOICE, FAST, ADVISOR).

---

## 3. The banner track (fact layer)

3-7 words, ALL CAPS, one fact each, about every 2-3 s. That works out to 10-18 banners per video, more than there are VO sentences.

| Banner type | Purpose | Examples |
|---|---|---|
| Headline stat | The number behind the hook | `UP TO 300 TOKENS A SECOND` |
| Price translation | Makes a cost feel real | `THAT'S $6,000 A YEAR` |
| Credibility | Who made it, how proven | `ONE DEV WROTE ALMOST ALL OF IT` · `OPEN SOURCE, ON GITHUB` |
| Format/availability | What it is, where it runs | `A DESKTOP APP, NOT A WEBSITE` · `IN THE APP, THE CLI AND THE API` |
| **Honest caveat** | The fine print, said plainly | `RUNS ON A PLAIN CPU, JUST SLOWER` · `NIMBUS 4 MINI GETS IT LATER` · `ON MAX 500 IT USES LIMITS 8X FASTER` |
| Trust/safety | Removes an objection | `EVERY CLIP CARRIES AN AI WATERMARK` · `YOUR RECORDINGS STAY ON YOUR MACHINE` |
| Feature claim | One capability per banner | `A WHOLE BOOK, READ IN YOUR VOICE` · `A FLOATING MIC THAT TYPES FOR YOU` · `UPLOAD, TRANSLATE, DUB` |
| **Competitor contrast** | Puts the rival's number next to ours | `VOCALYST'S DUBBING: 40+ LANGUAGES` (while the VO says 210) · `MARLOW'S IS UP TO 2.5X FASTER` |
| Proof setup | Frames a demo | `SAME PROMPT, SIDE BY SIDE` |
| Range/decision | Sets up the CTA freebie | `EVERY PLAN, $20 TO $500` |

---

## 4. The visual track (set staging)

### Set rules
1. **One set per banner, hard cut between them.** In A, 18 sets in 33 s (about 1.8 s each). In B, 12 sets in 30 s (about 2.5 s).
2. **Pick the set from a concrete noun or idea in the VO line** under that banner. It's a visual pun or a literal picture:

| VO words | Set | Hero prop / action |
|---|---|---|
| "clone your voice" (hook) | Wardrobe / closet vocal booth (the classic DIY voiceover booth) | Mascot on a cushion, studio mic, the app on a monitor recording |
| "past 12,000 stars" | Dark desk wall with sticky notes, desk lamp, mug | A GitHub repo card from the real page, Star button |
| "paying Vocalyst every month" | Wall with plan cards | Pricing cards (Starter / Paid) |
| "your own computer" | Home desk by a window | Monitor with the app, cursor moving |
| "10-year-old laptop... basement" | Basement laundry room | Old laptop under a dust sheet, washing machine, sleeping cat |
| "It's called Echolark" | Desk | OS dock; the cursor clicks the app icon |
| "read anything back in your voice" | Living room | A shopping list (milk, eggs, bread, coffee) next to the script UI: it reads your shopping list in your voice |
| "turns any book into an audiobook" | Library with shelves | A red book; the app's narrator preset |
| "types out whatever you want to say" | Office | Notes app being typed into |
| "dub your videos" | Film set (terracotta wall, clapperboard) | 3-step Upload, Translate, Dub UI |
| "210 languages" | Corkboard | Competitor card (Vocalyst 40+) pinned beside a scrolling list of 210 languages |
| "stop paying any more bills" | Back to the plan-cards wall (callback) | A plan card flies away |
| "never has to get uploaded anywhere" | Brick wall, night city | Upload cloud stuck at 0% |
| "eight times faster... $500" | Rocket lab | Two rockets labelled STANDARD / TURBO LANE built from code panels; a price thermometer; the mascot pulls a lever and Turbo Lane launches |
| "is it actually worth it?" | Purple room | Balance scale with a `TURBO LANE TOLL $500 EVERY MONTH` sign; mascot shocked (O mouth) |
| "launched today" | Race-day stadium | Jumbotron showing the launch keynote image from the announcement page, a ticker, a crowd of mascots, cars racing |
| "only runs on their best model" | Pit lane | A crane holds the other model's engine waiting ("gets it later") |
| "on stage... coded a rocket" | Event stage | Prompt card plus two screens building the same thing side by side; the winner gets confetti |
| "25 times the $20 plan's usage" | Teal room | One `BASIC $20` can multiplies into a wall of 25; a gauge goes to 25x; red ellipse around the key line |
| "works in other apps too" | Khaki room | App icons pop in, then a `+14 MORE` chip |
| "costs six times as much to run" | Blue room | STANDARD vs TURBO LANE meters filling with gold coins; mascot plugs in an API cable |
| "fast mode... one command" | Race track | The terminal window as a car body, racing |
| "a sheet on which plan..." | Callback to the scale room | Plan-picker card slides in; whip-pan to the CTA |

3. **The mascot is "you".** It wears the blue cap and stays on screen as the viewer's proxy, reacting: shocked at prices, pointing at the key number, holding a flag, pulling the lever, plugging in the cable. Extra mascots become crowds and crews (caps and hard hats with labels like CREW and PIT).
4. **Show numbers with physical props:** price signs and toll boards, balance scales, multiplier walls (N copies of one prop), gauges, counters, meters filling with coins, side-by-side races, a progress bar stuck at 0%.
5. **Show competitors as cards pinned in the set,** never as the hero. Their number sits next to ours.
6. **Callbacks:** return to an earlier set for the payoff or CTA (A returns to the plan-cards wall, B returns to the scale room, C returns to the launch pad).
7. **Background colour rotates** every set (sage, navy, khaki, slate blue, purple, teal, terracotta, mustard) so each cut reads as a new idea. Keep the floor or desk band at the bottom as the constant.
8. **Transitions:** mostly hard cuts on the banner change, plus whip-pans with blur on topic changes, a zoom-through for going "inside" something, at most one page turn or tear, and the **tape pull** into the CTA set. See `../../papercut-storyboard/SKILL.md`.
9. **One format for the whole reel, and a gag per set** (`../../papercut-strategy/SKILL.md` for the format, the humour pass in `../SKILL.md` for the gags). The set is still the visual pun from the VO's noun, but it lives inside the format's world (the courtroom, the heist, the cooking show). The mascot wears a costume prop for the idea.

---

## 5. Rough product UI from a URL

The user gives the project's link, and the video rebuilds a rough version of the UI as papercut props. It's not a screen recording.

1. **Collect from the source** (WebFetch or web search for text, any available browser tool for screenshots):
   - product name and logo
   - primary or accent colour
   - the 2-4 key screens (from site screenshots, README images, docs)
   - real labels and button text
   - every number (stars, languages, price, speed)
   - hero or keynote images
   - competitor names mentioned
2. **Write a facts list with a source per fact.** Every banner and every UI label must trace back to it. Never invent features or numbers.
3. **Rebuild 1-3 screens as simplified components:**
   - a dark rounded app panel inside a **paper monitor or laptop bezel** (bezel, stand, paper shadow)
   - only the elements that matter for the beat (6 at most): title bar, the one primary button in the brand accent colour (for example "Clone voice"), a dropdown, a list, a waveform, a progress bar
   - real labels, simplified layout, legible at phone size
4. **Animate fake interactions:**
   - the cursor glides and clicks (with a ripple)
   - text types in
   - progress bars fill
   - waveforms pulse
   - lists scroll
   - step lists light up 1, 2, 3
   - a toggle flips
5. **Third-party cards** (a GitHub repo card, a competitor feature card, a keynote photo) become paper cards or frames pinned in the set. Blur private handles or names when needed.
6. Keep the UI the brightest, crispest thing in the set, but give its panel a paper shadow and a light grain so it belongs in the world.

---

### UI treatment used in the Echolark example
- **Frame:** a near-black, slightly purple app panel with rounded corners inside a paper monitor, laptop or phone bezel (stand, grain, drop shadow). Paper props overlap its edges: sticky notes, clipboards, a lamp, the mascot peeking around.
- **Accent:** one brand colour does everything (magenta-pink here): the primary button ("Clone voice"), waveform bars, progress fill, number badges. Success is a green check badge popping in, and blocked is a red cross disc.
- **Few, big elements:** 3-6 per screen, at phone-legible size. Sample text is typed in large and is often funny ("Every voice has a story.", "Local cat wins the election").
- **Third-party proof as paper cards:** GitHub repo card (handle blurred, Star button, counter ticking up), competitor pricing card (Free with a cross / Starter with a tick, then "Cancelled"), competitor feature card (Vocalyst "40+") next to our number stamped big in the accent colour ("210" with a sparkle).
- **Stickers and tags:** a green "FREE" starburst, an "OPEN SOURCE" luggage tag, pink marker underlines under key phrases.
- **Interactions:** cursor glide + click, OS-dock launch with a tooltip, typing, a meter with a target zone, list items lighting up 1, 2, 3, a Wi-Fi toggle switching off, an upload cloud stuck at 0% with a red cross.
- **CTA device:** a phone mock with a Comments sheet and a QWERTY keyboard whose keys light up as the keyword is typed (the kit's `CtaPhoneDM` scene template).

## 6. Modes (pick one per video)

| Mode | When | Hook formula | Middle | Close |
|---|---|---|---|---|
| **Open-source drop** (A) | A free or local alternative to a paid product | "A solo dev just open-sourced a free version of [BIG BRAND]" + stars | reframe (instead of paying...), name, demo, "just the start" stack of 3, "even crazier" peak, payoff (stop paying, privacy) | "For the link and setup, comment KEYWORD" |
| **News launch / worth-it** (B) | A new paid tier, model or feature from a big company | "You can now make [BRAND]'s [best thing] [N]x [better] for $[price]", then "But is it actually worth it?" | name + launch date, requirement, on-stage demo, "And get this" perk, "But if you're..." catch, competitor alternative | "Good thing I made a sheet on which [plan] is actually worth it for you. For the link, comment KEYWORD" |
| **Feature unlock / how-to** (C) | A hidden setting or command that changes how a tool works | "Once [X] is your [Y], stop leaving [Z] doing nothing" | the command, how it works x2-3, concrete example, "And get this" cost win, payoff | "Good thing I made one prompt that sets it all up for you. Comment KEYWORD" |

(The hook formulas above are the examples' originals. Apply the hook update in section 2 and `../../papercut-hook/SKILL.md` when you write a new one.)

---

## 7. The storytelling prompt (copy-paste)

Use this to turn a source (URL, release notes, repo) into a script plus visual staging. Fill in the brackets.

```
You are writing a ~30-second vertical papercut explainer reel. Output a script AND its visual staging.

SOURCE: [URL(s) / notes]
MODE: [open-source drop | news launch / worth-it | feature unlock]   (pick if blank)
CTA KEYWORD: [ONE WORD]        FREEBIE: [setup guide | comparison sheet | prompt | link]
AUDIENCE: [who, their level]

STEP 1: FACTS. Read the source. List every concrete fact with its source: product name, maker,
price, numbers (stars, speed, languages, limits), where it runs, requirements, limitations,
competitor numbers. Mark anything uncertain. Use ONLY these facts below.

STEP 1b: FORMAT. Name the one familiar format the whole reel lives in (courtroom, pitch show, cooking
show, heist, nature doc, character-select screen, ...) and why it fits the topic's tension.

STEP 1c: HOOK (the most important step). Write it as three lines that point at ONE idea:
SAY (first spoken sentence) / WRITE (frame-0 title, 2-5 words, not the spoken words) /
SHOW (frame 0, mid-action, readable muted) / ALIGN (the one idea). Write 5 variants; pick one.

STEP 2: SCRIPT (75-95 words, 22-30 s, second person, contractions, ~3.5-4 words/sec, vocabulary at
the series' audience level). Follow the spine:
hook (gap + stake + big-brand name, NOT news framing) -> proof or "But is it actually worth it?" ->
reframe ("So instead of..., you can...") -> name reveal ("It's called...") -> one concrete demo ->
"And X is just the start, because..." with exactly three features -> peak ("But here's the part
that's even crazier:" / "And get this:") with the biggest number -> honest catch ("But if
you're...") -> payoff ("which means...") -> "Good thing I made [FREEBIE]. For the link, comment [KEYWORD]."

STEP 3: BANNER TRACK. 10-18 banners, 3-7 words, ALL CAPS, one fact each, one every 2-3 s.
They must NOT repeat the VO. Mix: headline stat, price translation, credibility, availability,
at least 1 honest caveat, at least 1 trust/safety fact, feature claims, at least 1 competitor
contrast, and a range/decision banner before the CTA.

STEP 4: STAGING TABLE. One row per banner:
| t (s) | VO words under it | BANNER | SET (room + bg colour) | HERO PROP / visual pun from the VO's
concrete noun | PRODUCT UI moment (rough rebuild: which screen, what animates) | MASCOT ("you",
blue cap): action/expression + costume prop | GAG (acts out the point) | camera move | transition |
Rules: a new set for every banner (rotate background colours); the set illustrates a word in the
VO line, not the banner; numbers become physical props (price signs, scales, multiplier walls,
gauges, meters, races); competitors appear as pinned cards; one callback to an earlier set before
the CTA; hard cuts, with a slide/whip-pan into the CTA set; the CTA set shows a comment box typing
the KEYWORD.

STEP 5: UI SPEC. For each product screen used: elements (6 at most), real labels from the source,
accent colour, the fake interaction (cursor click, typing, progress, waveform, list scroll).

STEP 6: CHECK. Every number and banner traces to STEP 1; at least one honest limitation; feature
stack is exactly three; word count 75-95; banners alone read as a fact sheet; one format throughout;
a gag per set, a struggling-mascot beat on the catch, a frame-0 prop that returns changed in the CTA,
at most one meme; the last line repeats the hook's key word.
```

---

## 8. Worked staging: A (Echolark), full

| t (s) | VO | Banner | Set, then hero prop / UI |
|---|---|---|---|
| 0.0-2.5 | A solo dev just open-sourced a free version of Vocalyst | CLONES YOUR VOICE WITHOUT THE CLOUD | Wardrobe vocal booth, sage wall, hanging clothes, an OPEN SOURCE tag. App on the monitor: REC, pink waveform, "Clone voice". Mascot on a cushion at the mic; letter-block prop |
| 2.5-4.6 | and it's already past 12,000 stars. | ONE DEV WROTE ALMOST ALL OF IT | Navy wall, sticky notes, lamp, mug. GitHub card "The open-source, fully-local Vocalyst alternative" (handle blurred), Star button. Mascot peeks over the card |
| 4.6-6.9 | So instead of paying Vocalyst every month to clone your voice, you can now | VOCALYST'S FREE PLAN CAN'T CLONE | Corkboard with a white Vocalyst pricing card: Free with a cross on voice cloning vs Starter with a tick; a "my voice" pill gets ticked |
| 6.9-8.3 | do it on your own computer, | A DESKTOP APP, NOT A WEBSITE | Khaki room with a window and plant. Voice-cloning screen, cursor moves. Mascot beside a mouse |
| 8.3-10.9 | even on the 10-year laptop you have sitting around in the basement. | RUNS ON A PLAIN CPU, JUST SLOWER | Basement laundry: laptop under a dust sheet, washing machine spinning, cat in a basket, mascot on a stool |
| 10.9-11.7 | It's called Echolark, | OPEN SOURCE, ON GITHUB | Desk monitor with a sunset wallpaper; dock icons; cursor clicks the app icon |
| 11.7-13.3 | and you give it a short clip of you talking | IT ASKS FOR 5-15 CLEAN SECONDS | Purple room with string lights; sample-length meter (0-20 s) with the 5-15 s green zone and a tick; mascot talks (O mouth) at the mic |
| 13.3-15.2 | and it can read anything back in your voice. | EVERY CLIP CARRIES AN AI WATERMARK | Living room; Script screen ("Import script / Paste / Insert"); a shopping-list note; speaker |
| 15.2-16.9 | And cloning your voice is just the start, because | EVERY MODEL INSTALLS LOCALLY | Blue wall; tall Models panel (LLM, Translation, Diarisation, Dictation, ASR, TTS); plant |
| 16.9-18.6 | it turns any book into an audiobook, | A WHOLE BOOK, READ IN YOUR VOICE | Library shelves; "The Librarian: warm UK audiobook narrator" voice-design card; red book |
| 18.6-20.0 | types out whatever you want to say, | A FLOATING MIC THAT TYPES FOR YOU | Grey office; Notes window typing; sticky notes; mug |
| 20.0-21.7 | and writes a transcript of any recording. | IT LABELS WHO SAID WHAT | Khaki office with a clock; Upload & Transcribe panel ("Choose file...") above Speaker 1 / Speaker 2 transcript rows |
| 21.7-23.4 | But here's the part that's even crazier: | UPLOAD, TRANSLATE, DUB | Terracotta film set; 3-step list lighting up; clapperboard |
| 23.4-24.6 | it can dub your videos into | YOUR VOICE, NOW SPEAKING SPANISH | Sage room, lamp; English original vs Español dubbed waveforms; language tabs |
| 24.6-26.3 | 210 languages, | VOCALYST'S DUBBING: 40+ LANGUAGES | Corkboard: Vocalyst "40+" card pinned, the "Manage languages" list scrolling (Hausa, Māori, Polski...) |
| 26.3-28.0 | which means you stop paying any more bills, | CANCEL THE VOCALYST PLAN | Callback to the corkboard pricing card: the Starter plan flips to "Cancelled" |
| 28.0-29.3 | since it runs on your computer | TRANSLATION RUNS OFFLINE TOO | Night window with mustard curtains; laptop "Translate model (Local, Heavy) · Offline", progress bar |
| 29.3-31.0 | and your voice never has to get uploaded anywhere. | YOUR RECORDINGS STAY ON YOUR MACHINE | Brick wall, night city; laptop: "No accounts, no cloud, no API keys"; upload cloud stuck at 0% |
| 31.0-33.0 | For the link and setup, comment VOICE. | COMMENT VOICE FOR THE SETUP | Slide-push into a sage room with a striped awning: a phone with Comments, a QWERTY keyboard typing "VOI..." (keys light up), a link chip, and a clipboard with ticks; mascot beside it |

## 9. Worked staging: B (Turbo Lane), full

| t (s) | VO | Banner | Set, then hero prop / UI |
|---|---|---|---|
| 0.0-3.6 | You can now make Brightloom's smartest AI code 8 times faster for $500 a month. | UP TO 300 TOKENS A SECOND | Rocket lab: STANDARD / TURBO LANE rockets built from code panels, a "Turbo Lane" sign from the announcement, a $500 thermometer, an 8X tag. Mascot pulls the lever; TURBO LANE launches in smoke; code stickers rain down |
| 3.6-4.7 | But is it actually worth it? | THAT'S $6,000 A YEAR | Purple room, string lights, night window; balance scale with `TURBO LANE TOLL $500 EVERY MONTH`; mascot shocked |
| 4.7-7.4 | Basically, it's called Turbo Lane, which Brightloom launched today, | IN THE APP, THE CLI AND THE API | Stadium: jumbotron with the keynote image, ticker "300 TOKENS/SECOND · TURBO LANE", mascot crowd, cars racing, checkered flag |
| 7.4-10.0 | and it only runs on their best model, Nimbus 4. | NIMBUS 4 MINI GETS IT LATER | Pit lane: TURBO LANE car, a crane dangles the "NIMBUS 4 MINI" engine block, crew in CREW / PIT hard hats |
| 10.0-14.6 | For example, on stage, Turbo Lane coded a rocket that took off before the normal version was even finished. | SAME PROMPT, SIDE BY SIDE | Event stage: prompt card ("...white rocket with a big porthole, in the launch-event colors"); two screens (Turbo Lane / Regular) building it; confetti; EXIT sign |
| 14.6-17.9 | And get this: that plan gives you 25 times the $20 plan's usage, | NO SESSION CAP | Teal room: Max 500 card (red ellipse on "25x usage of Basic"), a 1x-25x gauge, one BASIC $20 can multiplying into a wall of cans, x25 |
| 17.9-19.1 | and it works in other apps too. | 16 PARTNER APPS AT LAUNCH | Khaki room; app plugs pop; "+14 MORE" chip |
| 19.1-22.2 | But if you're building apps with it, Turbo Lane costs 6 times as much to run. | ON MAX 500 IT USES LIMITS 8X FASTER | Blue room: Standard vs Turbo Lane text-stream screens; meters (the base rate / per token) filling with coins; mascot plugs in the API cable |
| 22.2-26.5 | And even if you use Marlow or Brightloom, you already have a normal fast mode you can turn on with one command. | MARLOW'S IS UP TO 2.5X FASTER | Race track: the terminal window as a car; crowd in the stands |
| 26.5-29.1 | Good thing I made a cheat sheet on which plan is actually worth it. | EVERY PLAN, $20 TO $500 | Callback to the purple scale room: toll sign vs rocket on the pans; a plan-picker card slides in (locked); **whip-pan** out |
| 29.1-30.3 | For the link, comment FAST. | COMMENT FAST | Dark purple room; a comment field types "FAS..." then Post; link chip; a locked "WHICH PLAN?" card pinned top-right |

Example C's full staging is in `../../papercut-explainer/references/frame-breakdown.md`.
