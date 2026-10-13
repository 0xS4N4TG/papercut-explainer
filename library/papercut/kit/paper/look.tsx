// Film-look layers for papercut reels: gate weave and exposure flicker (FilmWeave), moving felt fibre (FeltFibre), lens dirt, lamp flicker,
// print halftone and graph paper. Overlays use the textures in public/bg/textures/ (synced by sync_kit.sh). Keep every one of them subtle.
// Overlays sit above the set and below the banner and captions; FilmWeave wraps the set.
import React from 'react';
import {AbsoluteFill, Img, Loop, OffthreadVideo, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {Paper} from './kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const TEX = (name: string) => staticFile(`bg/textures/${name}`);
type Blend = 'screen' | 'overlay' | 'multiply' | 'soft-light' | 'color-dodge' | 'normal';

// ---------- FilmWeave ----------

// Film gate weave plus exposure flicker, for a photographed, stop-motion feel: the frame drifts about 1.5 px with a hair of rotation, stepped on twos, and brightness wobbles 2.5% (seeded). `amp` / `flicker` scale each (1 = default).
export const FilmWeave: React.FC<{amp?: number; flicker?: number; seed?: string; children: React.ReactNode}> = ({amp = 1, flicker = 1, seed = 'weave', children}) => {
  const f = useCurrentFrame();
  const step = Math.floor(f / 2);
  const r = (k: string) => random(`${seed}${k}${step}`) * 2 - 1;
  // a slow drift under a small stepped jitter
  const dx = (Math.sin(f / 37) * 0.9 + r('x') * 0.8) * amp, dy = (Math.cos(f / 29) * 0.8 + r('y') * 0.7) * amp, rot = (Math.sin(f / 53) * 0.05 + r('r') * 0.045) * amp;
  const exposure = 1 + flicker * (r('e') * 0.02 + Math.sin(f / 6.5) * 0.008);
  const over = 1 + 0.012 * Math.max(1, amp);   // overscan so the drifting edge never shows
  return (
    <AbsoluteFill style={{transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${over})`, filter: `brightness(${exposure.toFixed(4)})`}}>
      {children}
    </AbsoluteFill>
  );
};

// ---------- FeltFibre ----------

// Moving felt-fibre overlay (felt-fibre.mp4, 12 fps on purpose, looped), a living alternative to GrainOverlay. The grey base is crushed to black so only the bright fibres show, then screened on at `opacity` 0.3.
export const FeltFibre: React.FC<{opacity?: number; blend?: Blend}> = ({opacity = 0.3, blend = 'screen'}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: blend, opacity}}>
    <Loop durationInFrames={155}>
      <OffthreadVideo src={TEX('felt-fibre.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(3.2) brightness(0.9)'}} />
    </Loop>
  </AbsoluteFill>
);

// ---------- LensDirt ----------

// Lens dirt (smudges, dust) for lit dioramas and FocusHunt moments: screened on, so it lifts the darks; (x, y, r) confines it to a lamp or flash. `at` = fade-in frame. Subtle at best; color-dodge hits only highlights but washes cream paper.
export const LensDirt: React.FC<{opacity?: number; at?: number; x?: number; y?: number; r?: number; blend?: Blend}> = ({opacity = 0.35, at = 0, x, y, r = 560, blend = 'screen'}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [at, at + 10], [0, 1], clamp);
  const mask = x !== undefined && y !== undefined ? `radial-gradient(circle at ${x}px ${y}px, #000 0px, rgba(0,0,0,0.5) ${r * 0.5}px, transparent ${r}px)` : undefined;
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: blend, opacity: opacity * k, WebkitMaskImage: mask, maskImage: mask}}>
      <Img src={TEX('lens-dirt.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

// ---------- LampFlicker ----------

// The brightness multiplier (about 0.3-1.03) of a flickering light at frame f: a gentle shimmer plus an occasional organic dip and recovery. Seeded, so a render never changes. `depth` = how far a dip goes, `every` = frames per chance of one.
export const flickerAt = (f: number, seed = 'lamp', depth = 0.4, every = 42) => {
  let v = 1 + 0.02 * Math.sin(f / 4.3 + random(`${seed}ph`) * 6) + 0.012 * Math.sin(f / 1.7);
  const slot = Math.floor(f / every);
  for (let s = slot - 1; s <= slot; s++) {
    if (random(`${seed}p${s}`) > 0.6) continue;
    const u = f - (s * every + random(`${seed}t${s}`) * (every - 12));
    if (u >= 0 && u < 16) v -= depth * (u < 2 ? u / 2 : Math.exp(-(u - 2) / 4.5)) * (0.8 + 0.2 * Math.cos(u * 1.7));
  }
  return Math.max(0.3, v);
};

// Wraps a light source's glow (a Glow, a lit lamp shade) so it flickers: occasional organic dips that recover, seeded per lamp. Use `flickerAt` for your own maths. Differ the `seed` between lamps.
export const LampFlicker: React.FC<{seed?: string; depth?: number; every?: number; children: React.ReactNode}> = ({seed = 'lamp', depth = 0.4, every = 42, children}) => {
  const v = flickerAt(useCurrentFrame(), seed, depth, every);
  return <AbsoluteFill style={{opacity: Math.min(1, v), filter: v < 0.99 ? `brightness(${(0.82 + 0.18 * v).toFixed(3)})` : undefined}}>{children}</AbsoluteFill>;
};

// ---------- Halftone ----------

// Print texture for "newspaper", "report" and "leak document" beats: a scanned print grain multiplied over the frame. With children it also washes the colour toward newsprint (`tone` 0-1 desaturation). `opacity` 0.4.
export const Halftone: React.FC<{opacity?: number; tone?: number; at?: number; blend?: Blend; children?: React.ReactNode}> = ({opacity = 0.2, tone = 0.45, at = 0, blend = 'multiply', children}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [at, at + 6], [0, 1], clamp);
  return (
    <>
      {children ? <AbsoluteFill style={{filter: `grayscale(${(tone * k).toFixed(3)}) sepia(${(0.25 * k).toFixed(3)}) contrast(${1 + 0.08 * k})`}}>{children}</AbsoluteFill> : null}
      <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: blend, opacity: opacity * k}}>
        <Img src={TEX('halftone-scan.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </>
  );
};

// ---------- GraphPaper ----------

// Graph paper for plan, sketch and maths beats. With no box it is a full-frame backdrop (`tint` multiplies a colour, `dim` darkens); with (x, y, w, h) it is a paper card surface with the usual rough edge and shadow, tilted by `rot`.
export const GraphPaper: React.FC<{x?: number; y?: number; w?: number; h?: number; rot?: number; tint?: string; dim?: number; children?: React.ReactNode}> = ({x, y, w, h, rot = 0, tint, dim = 0, children}) => {
  const tex = <Img src={TEX('graph-paper.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />;
  const shade = (
    <>
      {tint ? <AbsoluteFill style={{backgroundColor: tint, mixBlendMode: 'multiply'}} /> : null}
      {dim > 0 ? <AbsoluteFill style={{backgroundColor: '#000', opacity: Math.min(1, dim)}} /> : null}
    </>
  );
  if (x === undefined || y === undefined || !w || !h) return <AbsoluteFill>{tex}{shade}{children}</AbsoluteFill>;
  return (
    <div style={{position: 'absolute', inset: 0, transformOrigin: `${x + w / 2}px ${y + h / 2}px`, rotate: `${rot}deg`}}>
      <Paper lift={8}>
        <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', borderRadius: 4, boxShadow: 'inset 1.5px 1.5px 0 rgba(255,255,255,0.22)'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h}}>{tex}{shade}</div>
        </div>
      </Paper>
      {children}
    </div>
  );
};
