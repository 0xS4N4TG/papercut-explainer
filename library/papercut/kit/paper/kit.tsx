// Papercut kit: every prop is paper (grain + rough cut edge + drop shadow), shading is stacked
// cut pieces, motion is transforms driven by useCurrentFrame(). No CSS animations.
import React from 'react';
import {
  AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import {C, FONT} from '../tokens';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const GRAIN = staticFile('bg/grain.png');

// ---------- filters, mounted once at the root ----------
export const PaperDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="rough" x="-4%" y="-4%" width="108%" height="108%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={3} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="torn" x="-6%" y="-10%" width="112%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves={3} seed={11} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={7} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
);

// Paper wrapper for a whole prop: rough edge + drop shadow (light from the top-left).
export const Paper: React.FC<{children: React.ReactNode; lift?: number; torn?: boolean; style?: React.CSSProperties}> = ({children, lift = 4, torn, style}) => (
  <div style={{position: 'absolute', inset: 0, filter: `url(#${torn ? 'torn' : 'rough'}) drop-shadow(${lift * 0.5}px ${lift}px ${lift * 2}px rgba(0,0,0,0.38))`, ...style}}>
    {children}
  </div>
);

// One cut piece of paper. `shade` adds a darker underside strip, `hi` a lighter top strip.
export const Slab: React.FC<{
  x: number; y: number; w: number; h: number; color: string; r?: number | string;
  shade?: string; shadeH?: number; hi?: string; hiH?: number; rot?: number; grain?: number;
  children?: React.ReactNode; style?: React.CSSProperties;
}> = ({x, y, w, h, color, r = 4, shade, shadeH = 0.18, hi, hiH = 0.12, rot = 0, grain = 0.55, children, style}) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, overflow: 'hidden', rotate: `${rot}deg`,
    backgroundColor: color, backgroundImage: `url(${GRAIN})`, backgroundSize: '520px', backgroundBlendMode: 'multiply',
    boxShadow: 'inset 1.5px 1.5px 0 rgba(255,255,255,0.22)', ...style,
  }}>
    {hi ? <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: `${hiH * 100}%`, background: hi}} /> : null}
    {shade ? <div style={{position: 'absolute', left: 0, bottom: 0, width: '100%', height: `${shadeH * 100}%`, background: shade}} /> : null}
    {children}
  </div>
);

export const Disc: React.FC<{x: number; y: number; d: number; color: string; shade?: string; children?: React.ReactNode; style?: React.CSSProperties}> = ({x, y, d, color, shade, children, style}) => (
  <Slab x={x - d / 2} y={y - d / 2} w={d} h={d} r="50%" color={color} shade={shade} shadeH={0.28} style={style}>{children}</Slab>
);

// Pill label: bold sans caps.
export const Pill: React.FC<{x: number; y: number; text: string; bg?: string; color?: string; size?: number; rot?: number; center?: boolean}> = ({x, y, text, bg = C.ink, color = '#F3EEE6', size = 30, rot = 0, center = true}) => (
  <div style={{
    position: 'absolute', left: x, top: y, translate: center ? '-50% -50%' : undefined, rotate: `${rot}deg`, whiteSpace: 'nowrap',
    background: bg, color, fontFamily: FONT.label, fontWeight: 800, fontSize: size, letterSpacing: '0.02em',
    padding: `${size * 0.22}px ${size * 0.5}px ${size * 0.26}px`, borderRadius: size * 0.28,
    backgroundImage: `url(${GRAIN})`, backgroundSize: '400px', backgroundBlendMode: 'multiply',
    boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.18), 1px 3px 5px rgba(0,0,0,0.35)',
  }}>{text}</div>
);

// Cream paper card with grey "text" bars.
export const Card: React.FC<{x: number; y: number; w: number; h: number; lines?: number; rot?: number; color?: string; children?: React.ReactNode; seed?: string}> = ({x, y, w, h, lines = 3, rot = 0, color = C.cream, children, seed = 'card'}) => (
  <Slab x={x} y={y} w={w} h={h} color={color} r={3} rot={rot} shade={C.creamLo} shadeH={0.06}>
    {Array.from({length: lines}).map((_, i) => (
      <div key={i} style={{position: 'absolute', left: w * 0.1, top: h * 0.2 + i * Math.min(26, (h * 0.66) / Math.max(1, lines)), height: 9, width: w * (0.55 + random(`${seed}${i}`) * 0.3), borderRadius: 4, background: '#9B9184'}} />
    ))}
    {children}
  </Slab>
);

// ---------- motion ----------
export const PopIn: React.FC<{at: number; seed?: string; children: React.ReactNode; origin?: string; style?: React.CSSProperties}> = ({at, seed = 'pop', children, origin = '50% 50%', style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 180, mass: 0.6}});
  const tilt = (random(seed) - 0.5) * 8;
  return (
    <div style={{position: 'absolute', inset: 0, transformOrigin: origin, scale: String(s), rotate: `${tilt * (1 - s)}deg`, opacity: frame < at ? 0 : 1, ...style}}>
      {children}
    </div>
  );
};

export const SlideIn: React.FC<{at: number; dx?: number; dy?: number; dur?: number; children: React.ReactNode}> = ({at, dx = 0, dy = 0, dur = 10, children}) => {
  const frame = useCurrentFrame();
  const u = interpolate(frame, [at, at + dur], [1, 0], {...clamp, easing: Easing.bezier(0.16, 1.25, 0.3, 1)});
  return <div style={{position: 'absolute', inset: 0, translate: `${dx * u}px ${dy * u}px`, opacity: frame < at ? 0 : 1}}>{children}</div>;
};

// Stop-motion boil for screen-space paper overlays: hold 2 frames, then jump.
export const Boil: React.FC<{amp?: number; rot?: number; seed?: string; children: React.ReactNode}> = ({amp = 1.5, rot = 0.2, seed = 'boil', children}) => {
  const step = Math.floor(useCurrentFrame() / 2);
  return (
    <div style={{position: 'absolute', inset: 0, translate: `${(random(`${seed}x${step}`) - 0.5) * 2 * amp}px ${(random(`${seed}y${step}`) - 0.5) * 2 * amp}px`, rotate: `${(random(`${seed}r${step}`) - 0.5) * 2 * rot}deg`}}>
      {children}
    </div>
  );
};

// Scene camera: smooth push toward a focal point, plus an optional accent push at `accent`.
export const CameraPush: React.FC<{dur: number; to?: number; origin?: string; drift?: [number, number]; accent?: number; children: React.ReactNode}> = ({dur, to = 1.07, origin = '50% 45%', drift = [0, 0], accent, children}) => {
  const f = useCurrentFrame();
  const base = interpolate(f, [0, dur], [1, to], {...clamp, easing: Easing.inOut(Easing.quad)});
  const acc = accent === undefined ? 0 : interpolate(f, [accent, accent + 30], [0, 0.1], {...clamp, easing: Easing.bezier(0.2, 0.9, 0.3, 1)});
  const p = interpolate(f, [0, dur], [0, 1], clamp);
  return (
    <AbsoluteFill style={{transformOrigin: origin, scale: String(base + acc), translate: `${drift[0] * p}px ${drift[1] * p}px`}}>
      {children}
    </AbsoluteFill>
  );
};

export const Bg: React.FC<{src: string; tint?: string}> = ({src, tint}) => (
  <AbsoluteFill>
    <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    {tint ? <AbsoluteFill style={{background: tint, mixBlendMode: 'multiply'}} /> : null}
  </AbsoluteFill>
);

export const Blink: React.FC<{on: React.ReactNode; off: React.ReactNode; hz?: number; from?: number}> = ({on, off, hz = 4, from = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <>{f >= from && Math.floor(((f - from) / fps) * hz * 2) % 2 === 0 ? on : off}</>;
};

const STAR = 'M0-10 L2-2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2-2Z';
export const SparkleBurst: React.FC<{at: number; x: number; y: number; seed?: string; spread?: number}> = ({at, x, y, seed = 'sp', spread = 1}) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 12) return null;
  const cols = [C.sparkYellow, C.sparkPink, '#FFFFFF'];
  return (
    <>
      {Array.from({length: 6}).map((_, i) => {
        const a = (i / 6) * Math.PI * 2 + random(seed + i);
        const d = (34 + 34 * (f / 12)) * spread;
        return (
          <svg key={i} width={34} height={34} viewBox="-10 -10 20 20" style={{position: 'absolute', left: x + Math.cos(a) * d - 17, top: y + Math.sin(a) * d - 17, scale: String(Math.sin((f / 12) * Math.PI)), rotate: `${f * 15}deg`}}>
            <path d={STAR} fill={cols[i % 3]} />
          </svg>
        );
      })}
    </>
  );
};

export const RadioWaves: React.FC<{x: number; y: number; dir?: number; color?: string; from?: number}> = ({x, y, dir = 0, color = C.amber, from = 0}) => {
  const f = useCurrentFrame() - from;
  if (f < 0) return null;
  return (
    <svg style={{position: 'absolute', left: x - 70, top: y - 70, rotate: `${dir}deg`}} width={140} height={140} viewBox="-70 -70 140 140">
      {[0, 1, 2].map((i) => {
        const p = ((f + i * 5) % 15) / 15;
        const r = 14 + p * 46;
        return <path key={i} d={`M ${r * Math.cos(-0.7)} ${r * Math.sin(-0.7)} A ${r} ${r} 0 0 1 ${r * Math.cos(0.7)} ${r * Math.sin(0.7)}`} stroke={color} strokeWidth={7} strokeLinecap="round" fill="none" opacity={1 - p} />;
      })}
    </svg>
  );
};

export const Typewriter: React.FC<{text: string; at: number; fpc?: number; caret?: boolean}> = ({text, at, fpc = 2, caret = true}) => {
  const f = useCurrentFrame() - at;
  const n = Math.max(0, Math.min(text.length, Math.floor(f / fpc)));
  return (
    <span>
      {text.slice(0, n)}
      {caret && n < text.length && f >= 0 ? <span style={{opacity: Math.floor(f / 8) % 2 ? 0 : 1}}>▌</span> : null}
    </span>
  );
};

// Hand-drawn red annotation ellipse, drawn on over ~8 frames.
export const DrawOnEllipse: React.FC<{at: number; x: number; y: number; w: number; h: number; color?: string; stroke?: number; dur?: number}> = ({at, x, y, w, h, color = C.nogo, stroke = 7, dur = 8}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  if (p <= 0) return null;
  const L = Math.PI * (w + h) * 0.55 * 1.08;
  return (
    <svg style={{position: 'absolute', left: x - w / 2 - 12, top: y - h / 2 - 12}} width={w + 24} height={h + 24}>
      <path d={`M ${w * 0.62 + 12} ${14} C ${w + 30} ${10}, ${w + 22} ${h + 10}, ${w / 2 + 12} ${h + 10} C ${-8} ${h + 12}, ${2} ${8}, ${w * 0.72 + 12} ${18}`} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} />
    </svg>
  );
};

// Rubber-stamp mark: ink rectangle with a rough double border, lands with a thump.
export const StampMark: React.FC<{at: number; x: number; y: number; text: string; color?: string; size?: number; rot?: number}> = ({at, x, y, text, color = C.nogo, size = 64, rot = -12}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = interpolate(f, [at, at + 5], [1.5, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  return (
    <div style={{position: 'absolute', left: x, top: y, translate: '-50% -50%', rotate: `${rot}deg`, scale: String(s), filter: 'url(#torn)', opacity: 0.92}}>
      <div style={{border: `${size * 0.09}px solid ${color}`, borderRadius: size * 0.16, padding: `${size * 0.06}px`, }}>
        <div style={{border: `${size * 0.04}px solid ${color}`, borderRadius: size * 0.1, padding: `${size * 0.08}px ${size * 0.3}px`, color, fontFamily: FONT.banner, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap', letterSpacing: '0.03em'}}>{text}</div>
      </div>
    </div>
  );
};

export const GrainOverlay: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.07, mixBlendMode: 'multiply'}}>
      <Img src={GRAIN} style={{width: '140%', height: '140%', objectFit: 'cover', translate: `${(random(`g${Math.floor(f / 2)}`) - 0.5) * 60}px ${(random(`h${Math.floor(f / 2)}`) - 0.5) * 60}px`}} />
    </AbsoluteFill>
  );
};

// Idle helpers
export const bob = (f: number, period = 36, amp = 3, phase = 0) => Math.sin(((f + phase) / period) * Math.PI * 2) * amp;
export const hop = (f: number, at: number, dur = 12, h = 14) => { const u = (f - at) / dur; return u > 0 && u < 1 ? Math.sin(u * Math.PI) * h : 0; };
export const reach = (f: number, at: number, back?: number) => {
  const out = interpolate(f, [at, at + 6], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  return back === undefined ? out : out * interpolate(f, [back, back + 5], [1, 0], clamp);
};
