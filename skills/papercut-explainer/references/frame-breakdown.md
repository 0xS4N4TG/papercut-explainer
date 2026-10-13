# Worked example: a ~30 s explainer, frame by frame

**This is an example of the style, not a template to copy.** Use it to calibrate pacing and density: how often events land, how long scenes run, how a metaphor maps onto a topic. For a new video, invent a new world, cast and props with the rules in `style-guide.md`.

The example is an invented feature-unlock explainer (28.3 s, 30 fps). The product ("Codewright", a coding assistant), its models ("Atlas 2" does the work, "Sage 3" advises) and the command are fictional. The world is a space mission control room, which gives the metaphor natural props for the actors, the work, the failure, the approval and the cost. Events are listed at 0.2 s steps, so each timing is good to about ±0.2 s. The caption column shows the word page on screen at that moment.

## Voiceover script

> Once Atlas 2 is your main model, stop leaving Sage 3 doing nothing. Because Codewright just added a command called advisor, and it puts Sage 3 to work reviewing what Atlas builds. Basically, Atlas keeps writing the code while Sage reads your whole session. Then Sage steps in at the exact moments mistakes happen, like right before Atlas builds the wrong thing or calls broken code finished. And get this: it costs less than running Sage 3 the whole time, because Sage stays quiet unless it's needed. Which means you get Sage's judgment on every big decision without burning through your limit. Good thing I made one prompt that sets it all up for you. For the link, comment ADVISOR.

About 120 words in 28 s, which is **4.3 words/s**.

> **Role-framing check. Confirm who does the work before you script.** In this feature the main model (Atlas 2) does *all* the execution, and the advisor model (Sage 3) does none. The advisor is the slower, costlier model, so it only gets called in at decision points. It doesn't read or run continuously. The lines "stop leaving Sage 3 doing nothing" and "Sage reads the whole session" suggest it is always active, which would be wrong. In a real script, keep the advisor idle by default ("radio silence") and show it waking only when the main model hits a big call. The visuals of scenes 5, 7 and 8 (alarm to transmit, fuel race, GO/NO-GO) already fit that model. Scene 4 should show the tape as the main model's own log, with the advisor looking at it only when called.

---

## Scene 1: Hook / launch (0.0 → 3.7 s)
Banner: `SAGE 3 CAN WATCH ATLAS 2` · Location: launch pad, dusty-blue sky, then tilting down to mission control

| t (s) | Caption page | Visual event |
|---|---|---|
| 0.0 | `Once` | Rocket on pad with the `ATLAS 2` pilot portrait in the nose porthole and a red arrow pointing at it. Crane arm attached. Small flame, smoke clusters left and right. |
| 0.4 | `Once Atlas` | Flame grows (scaleY up) |
| 0.6 | `Once Atlas 2` | Crane arm retracts |
| 1.0 | `is` | Page clears; rocket starts rising, smoke puffs expand |
| 1.2 | `is your` | Rocket accelerating upward, flame elongates |
| 1.4 | `main` | Rocket at top third |
| 1.6 | `main model` | Rocket leaving the top of frame |
| 1.8-2.4 | `stop` → `stop leaving` → `stop leaving Sage` | **Camera tilts down** in one continuous world: pad and smoke scroll up and out, a `MISSION CONTROL` building rises in. The Sage character is asleep at the console (flat-line eyes, rising `Z z z`), and an orbit sine-wave plays on the big screen. |
| 2.6-2.8 | `3` | Pink alarm beacon cone sweeps across the room from the `OFF COURSE` light |
| 3.0 | `3 doing` | One eye pops open (white bubble) |
| 3.2 | `nothing` | Shocked face: big eyes, O mouth, beacon sweeping |
| 3.4-3.6 | `nothing` | Eyes droop back toward sleep (the comedic beat) |

## Scene 2: The unlock (3.7 → 5.6 s)
Banner: `ONE COMMAND PUTS SAGE ON DUTY` · Location: mission control, dark slate

| t | Caption | Visual |
|---|---|---|
| 3.8 | `Because` | **Hard cut.** Terminal window as a paper prop in front of the world-map screen. User character (blue cap) at keyboard, arm extended to the keys. |
| 4.0 | `Because Codewright` | Input shows `/a` |
| 4.2 | `added` | `/advi`: each keystroke flashes a white spark on the keyboard |
| 4.4 | `added a` | `/advis` |
| 4.6 | `added a command` | `/advisor ` with caret |
| 4.8 | `called` | `/advisor sa` |
| 5.0 | `called advisor` | `/advisor sage` complete |
| 5.2 | `called advisor` | Green check line `✓ Advisor set to Sage 3` appears with a **sparkle burst** |
| 5.4 | `called advisor` | Second sparkle burst on the `FLIGHT` sign at the right |

## Scene 3: Roles (5.6 → 8.2 s)
Banner: `SAGE ADVISES, ATLAS FLIES`

| t | Caption | Visual |
|---|---|---|
| 5.6 | `and it` | **Hard cut.** Sage asleep behind the console, blank black monitor above, dim `GO` light, amber `FLIGHT` tag |
| 5.8 | `and it puts` | Purple headset drops onto Sage from above |
| 6.0 | `Sage` | Headset on, eyes open, `SAGE 3` pill appears above head |
| 6.4 | `Sage 3` | Monitor powers on: `LIVE · ORBIT` feed showing the Atlas astronaut beside the `LAB` module over the Earth curve |
| 6.6-7.0 | `to` → `to work` → `to work reviewing` | Slow camera push-in (the console grows about 8%) |
| 7.4-7.8 | `what` → `what Atlas` → `what Atlas builds` | `GO` light switches from dim to **lit green** |

## Scene 4: Mechanism 1 (8.2 → 11.2 s)
Banner: `IT SEES EVERY TOOL CALL` · **Split screen**: top 40% is space, bottom is mission control

| t | Caption | Visual |
|---|---|---|
| 8.2 | `Basically` | **Hard cut.** Top: Atlas astronaut presses `RUN` on the `LAB` module; a code monitor above shows `fix(auth): check token`. Bottom: **telemetry tape** (tool-call list with green dots) scrolls up out of a `TELEMETRY` box; Sage with headset watches. Amber radio arcs from the tape to Sage. |
| 8.8-9.2 | `Atlas` → `Atlas keeps` → `Atlas keeps writing` | Code lines type into the top monitor one by one. The tape keeps scrolling: `edit src/auth.ts`, `run npm test`, `└ 2 tests failed` (red), `└ 14 tests passed` (green) |
| 9.4-9.6 | `the` → `the code` | Code monitor scrolls as new lines arrive |
| 10.0-10.2 | `Sage` → `Sage reads` | Excess tape piles into a coil at the left of the box |
| 10.6 | `whole` | **Red hand-drawn ellipse** draws on around `2 tests failed` |
| 10.8-11.0 | `whole session` | Sage's arm extends to point at the circled line |

## Scene 5: Mechanism 2 (11.2 → 13.8 s)
Banner: `CALLED IN AT THE BIG MOMENTS`

| t | Caption | Visual |
|---|---|---|
| 11.2 | `Then` | **Hard cut.** `MASTER ALARM` panel lit red. Sage at a desk mic with a `TRANSMIT` button; the monitor shows Atlas with a hammer beside the `LAB`. |
| 11.4 | `Then` | Alarm blinks to dim (about 4 Hz on/off through the scene) |
| 11.8 | `Sage steps` | `TRANSMIT` lights; Sage's arm reaches toward the mic |
| 12.0 | `Sage steps in` | **Radio waves** pulse from the mic to the monitor |
| 12.2-12.4 | `at the` → `at the exact` | Waves reach the Atlas feed |
| 12.6-13.0 | `moment` → `moment mistakes` | **Strong camera push-in**: the desk rises and scales about 15%, and the LAB on the monitor gets a sparkle (fixed) |
| 13.4 | `moment mistakes happen` | Alarm dims |

## Scene 6: Concrete examples (13.8 → 16.8 s)
Banner: `A SECOND LOOK BEFORE 'DONE'` · Location: orbit, brushed-metal panel over the Earth curve

| t | Caption | Visual |
|---|---|---|
| 13.8 | `like` | **Hard cut.** Atlas (helmet) pushes a wooden crate toward the porthole; seismograph screen and `MISSION COMPLETE` lever on the panel |
| 14.0-14.8 | `like right before` → `Atlas builds the` | Crate at the porthole; a small amber radio signal hits Atlas; Atlas looks worried (O mouth) |
| 15.0-15.2 | `wrong` → `wrong thing` | Atlas presses a green button; the crate is ejected, tumbling |
| 15.4 | `wrong thing or` | Porthole ring turns **green**; crate flies off the top right |
| 15.6-15.8 | `calls` → `calls broken` | Atlas slides down to the seismograph; sparkles on the screen; arm reaches for the lever |
| 16.0 | `calls broken code` | Spark and smoke puff from the seismograph (it's broken) |
| 16.2-16.4 | `finished` | Red `NO-GO` tag pops above the lever |
| 16.6 | `finished` | Tape patch slapped over the screen; the tag flips to green `GO` |

## Scene 7: Cost objection (16.8 → 21.8 s)
Banner: `SAGE ONLY RUNS WHEN CALLED` · Location: launch pad (callback to the hook)

| t | Caption | Visual |
|---|---|---|
| 16.8 | `And` | **Hard cut.** Two rockets, `SAGE 3` (left) and `ATLAS 2` (right), each with a `FUEL LEFT` gauge. Labels: red `SAGE FLIES IT`, green `ATLAS FLIES, SAGE ADVISES`. Small Sage controller at a `RADIO SILENCE` console, bottom right. |
| 17.0-17.2 | `And get` → `And get this` | Both rockets ignite; smoke puffs spawn |
| 17.4-18.0 | `it` → `it costs` → `it costs less` | Left rocket climbs **faster**; its gauge needle drops quickly |
| 18.2-18.6 | `than` → `than running` → `than running Sage` | Left rocket high; left needle nearing E; right rocket steady, needle barely moves |
| 18.8-19.2 | `3` | Left gauge at E; `NO-GO` tag pops under it |
| 19.4-19.6 | `whole` → `whole time` | Left engine **coughs a white puff**; flame dies |
| 19.8-20.4 | `because` → `because Sage stays` | Left rocket tilts and sinks back down; right rocket rising steadily |
| 20.6-21.2 | `quiet` → `quiet unless it's` | `RADIO SILENCE` sign lit amber |
| 21.4 | *(no caption)* | Sage controller transmits: radio arcs toward the right rocket |
| 21.6 | `needed` | Right rocket keeps climbing |

## Scene 8: Benefit (21.8 → 25.1 s)
Banner: `BIG CALLS GET A GO / NO-GO`

| t | Caption | Visual |
|---|---|---|
| 21.8 | `Which` | **Hard cut.** `GO / NO-GO` board with 3 rows (`SWAP THE DATABASE?`, `DELETE THE OLD API?`, `LAUNCH TONIGHT?`), all dim. `YOUR LIMIT` gauge at right. Crew of three (red, green, purple caps) at consoles, Sage with headset at right edge. |
| 22.0-22.8 | `Which means` → `get Sage's judgment` | `FLIGHT` tag lights amber |
| 23.2 | `on every` | Row 1 lights `GO` with sparkles; a `GO` card flies to the red-cap crew member |
| 23.4 | `on every big` | Row 2 flips to red `NO-GO` with sparkles; card flies to green-cap |
| 23.6 | `decision` | Row 3 `GO` (flower-shaped sparkle); card to purple-cap |
| 24.0-24.2 | `decision without` → `decision without burning` | Small flame flickers on the `YOUR LIMIT` gauge |
| 24.4-24.8 | `through your limit` | Flame replaced by a green check; camera drifts right |
| 25.0 | `through your limit` | Check scales up (celebrate) |

## Scene 9: Offer (25.1 → 27.0 s)
Banner: `ONE PROMPT DOES THE SETUP` · Location: briefing room, khaki wall, brown floor

| t | Caption | Visual |
|---|---|---|
| 25.2 | `Good thing` | **Hard cut.** `PRE-FLIGHT CHECKLIST` on an easel with 5 unchecked lines (`"model": "atlas"`, `"advisorModel": "sage"`, `version 2.1+`, `CODEWRIGHT.md: when to ask`, `new session, then go`). A locked `PROMPT` card with a gold `?` padlock sits over it. `PROMPT` machine at right with a slot and indicator dots; dim `ALL SYSTEMS GO` sign. User (blue cap) bottom left. |
| 25.4-25.8 | `made` → `made one` → `made one prompt` | The prompt card flies in an arc into the machine's slot |
| 26.0-26.2 | `that` → `that sets` | Checkboxes start ticking top to bottom, about 1 per 0.2 s |
| 26.4-26.6 | `all` → `all up for` | 3, then 4 checked |
| 26.8 | `you` | All 5 checked; `ALL SYSTEMS GO` lights with sparkles; user smiles |

## Scene 10: CTA (27.0 → 28.3 s)
Banner: `COMMENT ADVISOR`

| t | Caption | Visual |
|---|---|---|
| 27.0 | `for` | **Hard cut.** Dark screen panel, user character below at a row of consoles. A link chip pops in; a social comment box `Add a comment… Post` |
| 27.2 | `for the` | Locked `PROMPT` card pops in at top right (the reward) |
| 27.4 | `comment` | (no new event) |
| 27.6 | `comment` | Comment box types `AD`… |
| 27.8 | `comment ADVISOR` | …`ADVISO` |
| 28.0 | `comment ADVISOR` | `ADVISOR` complete; **Post** button bursts with sparkles |

---

## Pacing stats
- 10 scenes in 28.3 s, **2.8 s average**. Shortest are 1.3 s (CTA) and 1.9 s (unlock), and the longest is 5.0 s (the cost race, the one argument that needs a mini-story).
- Caption pages hold 1-3 words (one 4-word page), and a new page starts about every **0.6 s**.
- Each scene has **2-4 discrete visual events** (a state change, a prop entrance, a character action) on top of continuous ambient motion. A visual event lands about every 0.4-0.8 s, tied to a stressed word in the voiceover.
