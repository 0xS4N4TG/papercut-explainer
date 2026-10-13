# Remotion recipes for the Papercut style

These are starting-point components, **not yet compiled against a project**. If you have the library, use its compiled kit (`library/papercut/kit/`, listed in `library/papercut/CATALOG.md`) instead and treat these as sketches of how the pieces work. Before writing real code, load `remotion:remotion-best-practices` → `remotion-markup` and adapt them to its current conventions (`Interactive.Div`, inline `interpolate()` in `style`, `scale`/`translate`/`rotate` properties instead of `transform`). All motion must be driven by `useCurrentFrame()`, because CSS animations and transitions do not render.

Imports (`remotion`, `../tokens`) are left out of most snippets for brevity.

## Project layout

```
src/
  Root.tsx                 # registers the main video + each scene as a connected composition
  PapercutVideo.tsx        # <Series> of scenes (hard cuts), <Audio> VO + music, <WordTagCaptions>, <TapeBanner>, <GrainOverlay>
  tokens.ts                # palette, fonts, timing constants (from style-guide.md sections 4, 5 and 9)
  paper/
    PaperDefs.tsx          # one <svg><defs> with the grain / rough-edge filters, mounted once
    Paper.tsx              # wrapper: grain + rough edge + drop shadow on any child
    PopIn.tsx              # spring pop with rotation settle
    TapeBanner.tsx
    WordTagCaptions.tsx
    SparkleBurst.tsx
    RadioWaves.tsx
    Typewriter.tsx
    CameraPush.tsx
    GrainOverlay.tsx
    Blink.tsx
  cast/
    Critter.tsx            # the mascot, with accessory + expression props
  scenes/
    S01Hook.tsx ... S10Cta.tsx
public/
  vo/voiceover.wav         # from the user's TTS (e.g. Qwen3-TTS)
  vo/captions.json         # Caption[] with word timings (from @remotion/captions transcription)
  music/bed.mp3
  sfx/*.mp3
  textures/paper-grain.png # optional scanned texture
  assets/*.png             # AI-generated props with transparent backgrounds
```

Composition: **1080×1920, 30 fps**. Get the duration from the voiceover (`calculateMetadata`). Each scene's `durationInFrames` comes from the caption timestamps of its first and last words.

## tokens.ts

```ts
export const C = {
  sky: '#567E97', skyGlow: '#BAD7E9', ground: '#BFB087',
  slate: '#132124', slateLow: '#121617', space: '#081027',
  wall: '#8A7A60', floor: '#452A15',
  cream: '#DACEC0', tape: '#C3B284', console: '#8A9A86', consoleShade: '#546054',
  panel: '#B1B9BC', smoke: '#726F68', board: '#2E3235', wood: '#7F5231',
  hero: '#D67354', heroLo: '#A9553B', you: '#D67354', youLo: '#A9553B',   // the critter's body colour
  tag: '#C9573C', tagText: '#F3E6D3',                  // caption tags
  purple: '#4E3881', ink: '#1C1B17', navy: '#293042',
  go: '#2DA34D', goDim: '#165329', nogo: '#D63A2B', nogoDim: '#4D140D',
  amber: '#F3A53B', violet: '#8154B9', capBlue: '#3968AD',
  flameCore: '#FBF9D0', flameOuter: '#F68B29',
  sparkYellow: '#F5C542', sparkPink: '#F4A7B9',
};
// Defaults only. Any font from the families in style-guide.md section 6 works; pick per video.
export const FONT = {
  banner: 'Archivo Black',   // heavy caps sans (or Poppins Black, Montserrat Black, Unbounded)
  caption: 'Fraunces',       // soft bold serif (or Recoleta, Cooper Black, Young Serif)
  label: 'Inter',            // 800 for pills/signage
  mono: 'JetBrains Mono',
};
export const T = { pop: 8, wordPop: 4, slide: 10, press: 6, blinkHz: 4 };
```

Load fonts through `@remotion/google-fonts` (see the `google-fonts.md` reference in the Remotion skill).

## PaperDefs + Paper wrapper (the core of the look)

```tsx
// PaperDefs.tsx: mount once at the root, zero-size
export const PaperDefs = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      {/* grain multiplied into the fill, clipped to the shape */}
      <filter id="paper" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={4} seed={3} result="noise" />
        <feColorMatrix in="noise" type="saturate" values="0" result="grey" />
        <feComponentTransfer in="grey" result="soft">
          <feFuncA type="linear" slope={0.12} />
        </feComponentTransfer>
        <feComposite in="soft" in2="SourceAlpha" operator="in" result="grainClip" />
        {/* rough, scissor-cut edge */}
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={7} result="edgeNoise" />
        <feDisplacementMap in="SourceGraphic" in2="edgeNoise" scale={2.5} result="rough" />
        <feBlend in="grainClip" in2="rough" mode="multiply" />
      </filter>
      {/* torn edge for banner + caption tags: stronger displacement */}
      <filter id="torn">
        <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves={3} seed={11} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={6} />
      </filter>
    </defs>
  </svg>
);

// Paper.tsx: wrap any prop to make it paper
export const Paper: React.FC<{children: React.ReactNode; lift?: number; torn?: boolean; style?: React.CSSProperties}> =
  ({children, lift = 4, torn, style}) => (
    <div style={{
      filter: `url(#${torn ? 'torn' : 'paper'}) drop-shadow(0 ${lift}px ${lift * 2}px rgba(0,0,0,0.35))`,
      ...style,
    }}>
      {children}
    </div>
  );
```

Add the lighter cut-edge rim with `box-shadow: inset 1px 1px 0 rgba(255,255,255,0.18)` on rectangular parts. For SVG shapes, use a 1.5 px lighter stroke offset up and to the left.

**Performance:** SVG filters on many layers slow rendering. If a preview frame takes over ~300 ms, bake static paper props into PNGs (render a `<Still>` or use AI-generated assets) and keep live filters only on animated parts.

## PopIn

```tsx
import {spring, useCurrentFrame, useVideoConfig, random} from 'remotion';

export const PopIn: React.FC<{at: number; seed: string; children: React.ReactNode}> = ({at, seed, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 180, mass: 0.6}});
  const tilt = (random(seed) - 0.5) * 8;            // ±4° start tilt
  return (
    <div style={{
      scale: String(s),                                // overshoots ~1.08 then settles
      rotate: `${tilt * (1 - s)}deg`,
      opacity: frame < at ? 0 : 1,
    }}>{children}</div>
  );
};
```

## WordTagCaptions

Get word timings with the `remotion-captions` skill (`transcribe-captions.md`). Then page them 1–3 words at a time, breaking on punctuation or a gap > 250 ms:

```tsx
import type {Caption} from '@remotion/captions';
import {random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../tokens';

type Page = {words: Caption[]; startMs: number; endMs: number};

export const pageWords = (caps: Caption[], max = 3): Page[] => {
  const pages: Page[] = [];
  let cur: Caption[] = [];
  caps.forEach((w, i) => {
    cur.push(w);
    const next = caps[i + 1];
    const punct = /[.,!?:;]$/.test(w.text.trim());
    const gap = next ? next.startMs - w.endMs > 250 : true;
    if (cur.length >= max || punct || gap) {
      pages.push({words: cur, startMs: cur[0].startMs, endMs: next ? next.startMs : w.endMs});
      cur = [];
    }
  });
  return pages;
};

export const WordTagCaptions: React.FC<{captions: Caption[]; bandY: number /* 0.68–0.80 */}> = ({captions, bandY}) => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const page = pageWords(captions).find(p => ms >= p.startMs && ms < p.endMs);
  if (!page) return null;
  return (
    <div style={{position: 'absolute', top: height * bandY, width: '100%', display: 'flex', justifyContent: 'center', gap: 10}}>
      {page.words.filter(w => ms >= w.startMs).map((w, i) => {
        const s = spring({frame: frame - Math.round((w.startMs / 1000) * fps), fps, config: {damping: 14, stiffness: 260}});
        const key = `${w.startMs}-${w.text}`;
        return (
          <div key={key} style={{
            background: C.tag, color: C.tagText, fontFamily: FONT.caption, fontWeight: 800,
            fontSize: 64, lineHeight: 1, padding: '10px 16px 14px',
            rotate: `${(random(key) - 0.5) * 10}deg`,
            translate: `0px ${(random(key + 'y') - 0.5) * 12 + (1 - s) * -10}px`,
            scale: String(0.6 + 0.4 * s),
            filter: 'url(#torn) drop-shadow(0 4px 6px rgba(0,0,0,0.35))',
          }}>{w.text.trim()}</div>
        );
      })}
    </div>
  );
};
```

## TapeBanner

```tsx
export const TapeBanner: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', top: '14%', left: '6%', width: '88%', rotate: '-1deg'}}>
    <div style={{
      background: C.cream, padding: '28px 36px', textAlign: 'center',
      fontFamily: FONT.banner, fontSize: 60, color: C.ink, letterSpacing: '-0.01em', textTransform: 'uppercase',
      filter: 'url(#torn) drop-shadow(0 5px 8px rgba(0,0,0,0.35))',
    }}>{text}</div>
    {[{left: -28, rotate: '-35deg'}, {right: -28, rotate: '35deg'}].map((p, i) => (
      <div key={i} style={{position: 'absolute', top: -18, width: 110, height: 44, background: C.tape, opacity: 0.8, ...p}} />
    ))}
  </div>
);
```

Auto-shrink long banner text with `fitText()` from `@remotion/layout-utils` (see `measuring-text.md`).

## SparkleBurst

```tsx
export const SparkleBurst: React.FC<{at: number; x: number; y: number; seed: string}> = ({at, x, y, seed}) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 12) return null;
  const cols = [C.sparkYellow, C.sparkPink, '#FFFFFF'];
  return <>{Array.from({length: 6}).map((_, i) => {
    const a = (i / 6) * Math.PI * 2 + random(seed + i);
    const d = 30 + 30 * (f / 12);
    const sc = Math.sin((f / 12) * Math.PI);            // 0 → 1 → 0
    return <svg key={i} width={28} height={28} viewBox="-10 -10 20 20" style={{
      position: 'absolute', left: x + Math.cos(a) * d, top: y + Math.sin(a) * d,
      scale: String(sc), rotate: `${f * 15}deg`,
    }}><path d="M0-10 L2-2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2-2Z" fill={cols[i % 3]} /></svg>;
  })}</>;
};
```

## Boil (stop-motion paper jitter, measured on a finished reel)

Wrap the banner and its labels. They hold for 2 frames, then jump to a new random offset. Don't wrap world props: the world layer only moves through `CameraPush`.

```tsx
export const Boil: React.FC<{amp?: number; rot?: number; seed?: string; children: React.ReactNode}> =
  ({amp = 1.5, rot = 0.2, seed = 'boil', children}) => {
  const step = Math.floor(useCurrentFrame() / 2);        // re-roll every 2 frames (15 Hz)
  return (
    <div style={{
      translate: `${(random(`${seed}x${step}`) - 0.5) * 2 * amp}px ${(random(`${seed}y${step}`) - 0.5) * 2 * amp}px`,
      rotate: `${(random(`${seed}r${step}`) - 0.5) * 2 * rot}deg`,
    }}>{children}</div>
  );
};
// Usage: <Boil><TapeBanner text="..." /></Boil>. amp 1.5 px at 1080 w ≈ ±1 px at 720 w.
```

Caption tags get a gentler, smooth float instead: `translate: 0 ${Math.sin((frame + seedOffset) / 9) * 1.2}px`.

## RadioWaves, Blink, CameraPush, Typewriter, GrainOverlay

```tsx
// RadioWaves: 3 amber arcs pulsing from (x,y) toward angle `dir`
export const RadioWaves: React.FC<{x: number; y: number; dir: number}> = ({x, y, dir}) => {
  const f = useCurrentFrame();
  return <svg style={{position: 'absolute', left: x - 60, top: y - 60, rotate: `${dir}deg`}} width={120} height={120} viewBox="-60 -60 120 120">
    {[0, 1, 2].map(i => { const p = ((f + i * 4) % 15) / 15; const r = 12 + p * 40;
      return <path key={i} d={`M ${r * Math.cos(-0.7)} ${r * Math.sin(-0.7)} A ${r} ${r} 0 0 1 ${r * Math.cos(0.7)} ${r * Math.sin(0.7)}`}
        stroke={C.amber} strokeWidth={6} strokeLinecap="round" fill="none" opacity={1 - p} />; })}
  </svg>;
};

// Blink: hard on/off at ~4 Hz; pass the lit/dim children
export const Blink: React.FC<{on: React.ReactNode; off: React.ReactNode; hz?: number}> = ({on, off, hz = 4}) => {
  const {fps} = useVideoConfig();
  return <>{Math.floor((useCurrentFrame() / fps) * hz * 2) % 2 === 0 ? on : off}</>;
};

// CameraPush: slow scale toward a focal point, whole scene
export const CameraPush: React.FC<{to?: number; origin?: string; children: React.ReactNode}> = ({to = 1.08, origin = '50% 45%', children}) => {
  const {durationInFrames} = useVideoConfig();
  const f = useCurrentFrame();
  return <AbsoluteFill style={{transformOrigin: origin, scale: String(interpolate(f, [0, durationInFrames], [1, to], {easing: Easing.inOut(Easing.quad)}))}}>{children}</AbsoluteFill>;
};

// Typewriter: ~2 frames per char, block caret
export const Typewriter: React.FC<{text: string; at: number; fpc?: number}> = ({text, at, fpc = 2}) => {
  const f = useCurrentFrame() - at;
  const n = Math.max(0, Math.min(text.length, Math.floor(f / fpc)));
  return <span style={{fontFamily: FONT.mono}}>{text.slice(0, n)}<span style={{opacity: Math.floor(f / 8) % 2 ? 0 : 1}}>▌</span></span>;
};

// GrainOverlay: full-frame animated grain, 3% opacity
export const GrainOverlay = () => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.35}}>
    <svg width="100%" height="100%"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={useCurrentFrame() % 8} /></filter>
      <rect width="100%" height="100%" filter="url(#g)" opacity={0.1} /></svg>
  </AbsoluteFill>
);
```

## Critter (the mascot)

Build it from rectangles so every part can be posed:

```tsx
type Expr = 'idle' | 'sleep' | 'shock' | 'happy' | 'worried';
type Acc = 'none' | 'capBlue' | 'capRed' | 'capGreen' | 'capPurple' | 'headset' | 'helmet';

export const Critter: React.FC<{size?: number; expr?: Expr; acc?: Acc; armReach?: number /* 0–1 */; tag?: string; tagColor?: string}> =
  ({size = 220, expr = 'idle', acc = 'none', armReach = 0, tag, tagColor = C.purple}) => {
  const f = useCurrentFrame();
  const bob = Math.sin((f / 36) * Math.PI * 2) * 3;
  const u = size / 10;                                   // grid unit
  // body 10u × 6u in C.hero (a C.heroLo strip for the underside), eyes 1u × 1.6u at (3u,2u) and (6u,2u), arms 2u × 1.4u from the sides (right arm extends by armReach × 6u),
  // legs: four 1u × 2.4u rectangles under the body at 1.5u spacing
  // sleep → eyes 1.2u × 0.25u lines; shock → eyes scale 1.4 + 1u circle mouth; happy → 2u × 0.3u smile
  // accessories are separate absolutely positioned paper parts above the body
  // tag pill follows with a 2-frame lag: compute bob at (f - 2)
  return null; // implement per the spec above; wrap every part in <Paper>
};
```

(The body is left as a spec rather than full JSX because it's mostly positioning boilerplate. Build it once, preview it with a `<Still>`, then reuse it across every video.)

## Scene assembly (hard cuts)

```tsx
import {Series} from 'remotion';
<Series>
  <Series.Sequence name="S01 Hook" durationInFrames={111}><S01Hook /></Series.Sequence>
  <Series.Sequence name="S02 Unlock" durationInFrames={57}><S02Unlock /></Series.Sequence>
  {/* ... */}
</Series>
```

Put the banner, captions, grain and audio **outside** the `<Series>`, as siblings in the root `AbsoluteFill`, so they run on the global timeline. Pass the banner text from a `scenes[]` array keyed by start frame.
