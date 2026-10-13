// Proof beat: a real browser capture laid on a paper card (RealShot) with hand-drawn red marker strokes over it (MarkerCircle, MarkerUnderline, MarkerArrow).
// Use it once per reel, on the proof beat: it is the one place a real page, real logos and real UI appear. Capture the page with lib/tools/capture.mjs.
// Marker strokes are filled ribbons (varying width, rough ends) revealed by a stroke-dashoffset mask, drawn on from `at` over `dur` frames.
import React, {useId} from 'react';
import {Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT, H, W} from '../tokens';
import {Boil, GRAIN, Paper, PopIn, Slab} from './kit';
import {TapeCorners} from './tape';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const MARKER = '#DE3B2D';

// ---------- RealShot ----------

// A real screenshot (public/ PNG from tools/capture.mjs) on a paper card: tape corners, shadow, print grain, pop-in at `at`. `ratio` = image h/w (capture.mjs prints it); `chrome` = URL text for a paper browser bar; children share the tilt.
export const RealShot: React.FC<{src: string; x: number; y: number; w: number; ratio?: number; rot?: number; tape?: boolean; at?: number; chrome?: string; children?: React.ReactNode}> = ({src, x, y, w, ratio = 0.5625, rot = 0, tape = true, at = 0, chrome, children}) => {
  const pad = 16, bar = chrome ? 64 : 0;
  const iw = w - pad * 2, ih = iw * ratio, h = pad + bar + ih + pad + 6;
  const cx = x + w / 2, cy = y + h / 2;
  return (
    <PopIn at={at} seed={`rs${src}`} origin={`${cx}px ${cy}px`}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${cx}px ${cy}px`, rotate: `${rot}deg`}}>
        <Paper lift={10}>
          <Slab x={x} y={y} w={w} h={h} color={C.creamHi} shade={C.creamLo} shadeH={0.025} r={6} />
          {chrome ? <Slab x={x + pad} y={y + pad} w={iw} h={bar} color="#D4CBBC" r="8px 8px 0 0" /> : null}
        </Paper>
        {chrome ? (
          <>
            {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: x + pad + 24 + i * 28, top: y + pad + bar / 2 - 8, width: 16, height: 16, borderRadius: '50%', backgroundColor: ['#C9573C', '#C89B4A', '#7C9A6B'][i], opacity: 0.85}} />)}
            <div style={{position: 'absolute', left: x + pad + 126, top: y + pad + 10, width: iw - 126 - 20, height: bar - 20, borderRadius: 14, backgroundColor: C.creamHi, padding: '0 18px', overflow: 'hidden', boxSizing: 'border-box',
              fontFamily: FONT.mono, fontSize: 24, lineHeight: `${bar - 20}px`, color: C.inkSoft, whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>{chrome}</div>
          </>
        ) : null}
        <div style={{position: 'absolute', left: x + pad, top: y + pad + bar, width: iw, height: ih, overflow: 'hidden', backgroundColor: '#fff'}}>
          <Img src={staticFile(src)} style={{display: 'block', width: '100%', height: '100%'}} />
          <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${GRAIN})`, backgroundSize: '520px', mixBlendMode: 'multiply', opacity: 0.3}} />
        </div>
        {tape ? <TapeCorners x={x} y={y} w={w} h={h} /> : null}
        {children}
      </div>
    </PopIn>
  );
};

// ---------- marker strokes ----------

type Pt = [number, number];
// smooth seeded wobble in about -1..1
const wob = (seed: string, t: number) => (Math.sin(t * 11 + random(`${seed}a`) * 6.28) * 0.5 + Math.sin(t * 23 + random(`${seed}b`) * 6.28) * 0.3 + Math.sin(t * 41 + random(`${seed}c`) * 6.28) * 0.2);
const taper = (t: number) => Math.min(1, 0.32 + (t / 0.05) * 0.68, 0.4 + ((1 - t) / 0.07) * 0.6);

// A filled ribbon around the centre line `pts`, half-width hw(t), with rough chisel-cut ends.
const ribbon = (pts: Pt[], hw: (t: number) => number, seed: string) => {
  const L: Pt[] = [], R: Pt[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len, h = hw(i / (pts.length - 1));
    L.push([p[0] + nx * h, p[1] + ny * h]);
    R.push([p[0] - nx * h, p[1] - ny * h]);
  });
  const cap = (i: number, dir: 1 | -1): Pt => {
    const p = pts[i], q = pts[i + dir] ?? pts[i], len = Math.hypot(p[0] - q[0], p[1] - q[1]) || 1;
    const k = hw(i / (pts.length - 1)) * (0.7 + random(`${seed}cap${i}`) * 0.7);
    return [p[0] + ((p[0] - q[0]) / len) * k, p[1] + ((p[1] - q[1]) / len) * k];
  };
  const ring = [...L, cap(pts.length - 1, -1), ...R.reverse(), cap(0, 1)];
  return `M${ring.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}Z`;
};

// One marker stroke, revealed to `p` (0-1) along its centre line. `bleed` = felt-tip on paper: a ragged, softly feathered edge, a darker core, and ink pooling where the pen lands and lifts.
const Stroke: React.FC<{pts: Pt[]; width: number; p: number; color: string; seed: string; bleed?: boolean}> = ({pts, width, p, color, seed, bleed = false}) => {
  const id = useId().replace(/:/g, '');
  if (p <= 0.001) return null;
  const hw = (t: number) => (width / 2) * (0.8 + 0.2 * wob(seed + 'w', t)) * taper(t);
  const centre = `M${pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('L')}`;
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]), pad = width * 2 + 20;
  const box = {x: Math.min(...xs) - pad, y: Math.min(...ys) - pad, width: Math.max(...xs) - Math.min(...xs) + pad * 2, height: Math.max(...ys) - Math.min(...ys) + pad * 2};
  const rr = random(`${seed}f`) * 40 | 0;
  const pool = Math.min(1, Math.max(0, (p - 0.96) / 0.04));   // the pen lifts: ink gathers at the end
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <mask id={`k${id}`} maskUnits="userSpaceOnUse" x={-W} y={-H} width={W * 3} height={H * 3}>
          <path d={centre} pathLength={1} fill="none" stroke="#fff" strokeWidth={width * 2.3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 2" strokeDashoffset={1 - Math.min(1, p)} />
        </mask>
        <filter id={`b${id}`} filterUnits="userSpaceOnUse" {...box}>
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves={3} seed={rr} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={width * 0.55} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation={0.7} />
        </filter>
      </defs>
      {bleed ? (
        <g filter={`url(#b${id})`} style={{mixBlendMode: 'multiply'}} opacity={0.93}>
          <path d={ribbon(pts, hw, seed)} fill={color} mask={`url(#k${id})`} />
          <path d={ribbon(pts, (t) => hw(t) * 0.5, `${seed}c`)} fill="#8A1A12" opacity={0.3} mask={`url(#k${id})`} />
          <circle cx={pts[0][0]} cy={pts[0][1]} r={hw(0.04) * 1.5} fill="#8A1A12" opacity={0.5} />
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={hw(0.97) * 1.6} fill="#8A1A12" opacity={0.55 * pool} />
        </g>
      ) : (
        <path d={ribbon(pts, hw, seed)} fill={color} opacity={0.93} mask={`url(#k${id})`} filter="url(#rough)" style={{mixBlendMode: 'multiply'}} />
      )}
    </svg>
  );
};

// Draw-on progress for a stroke: a quick hand stroke, slightly eased at both ends.
const useDraw = (at: number, dur: number) => {
  const f = useCurrentFrame();
  return interpolate(f, [at, at + Math.max(1, dur)], [0, 1], {...clamp, easing: Easing.bezier(0.35, 0, 0.5, 1)});
};

// Hand-drawn red marker ellipse around the centre (x, y), w x h, drawn on over `dur` frames from `at` (default 10). Overshoots its start (`loops` 1.15). `bleed` (on) = felt-tip ink: ragged edge, pooling at start and end. `width` = pen px.
export const MarkerCircle: React.FC<{x: number; y: number; w: number; h: number; at: number; dur?: number; color?: string; loops?: number; seed?: string; width?: number; bleed?: boolean}> = ({x, y, w, h, at, dur = 10, color = MARKER, loops = 1.15, seed = 'mc', width = 13, bleed = true}) => {
  const p = useDraw(at, dur);
  const N = Math.ceil(80 * loops), th0 = -2.5 + (random(`${seed}s`) - 0.5) * 0.7, spiral = width * 3.3;
  const pts: Pt[] = Array.from({length: N + 1}, (_, i) => {
    const t = i / N, th = th0 + t * loops * Math.PI * 2, grow = -spiral / 2 + t * spiral;
    const rx = w / 2 + grow + wob(`${seed}x`, t) * w * 0.018, ry = h / 2 + grow + wob(`${seed}y`, t) * h * 0.03;
    return [x + rx * Math.cos(th) + wob(`${seed}cx`, t) * 3, y + ry * Math.sin(th) + wob(`${seed}cy`, t) * 3];
  });
  return <Boil amp={0.9} rot={0.12} seed={seed}><Stroke pts={pts} width={width} p={p} color={color} seed={seed} bleed={bleed} /></Boil>;
};

// Hand-drawn red marker underline from (x, y) across `w` px, left to right, with a slight slope and wobble; `double` adds a second pass back underneath.
export const MarkerUnderline: React.FC<{x: number; y: number; w: number; at: number; dur?: number; color?: string; double?: boolean; seed?: string; width?: number; bleed?: boolean}> = ({x, y, w, at, dur = 9, color = MARKER, double = false, seed = 'mu', width = 11, bleed = true}) => {
  const p = useDraw(at, dur * (double ? 1.8 : 1));
  const slope = (random(`${seed}sl`) - 0.5) * 14;
  const line = (yy: number, dir: 1 | -1, sd: string): Pt[] => Array.from({length: 40}, (_, i) => {
    const t = i / 39, u = dir === 1 ? t : 1 - t;
    return [x + w * u, yy + slope * u + wob(sd, t) * 3.2];
  });
  const p1 = double ? Math.min(1, p / 0.55) : p, p2 = Math.max(0, (p - 0.55) / 0.45);
  return (
    <Boil amp={0.9} rot={0.1} seed={seed}>
      <Stroke pts={line(y, 1, `${seed}1`)} width={width} p={p1} color={color} seed={`${seed}1`} bleed={bleed} />
      {double ? <Stroke pts={line(y + width * 1.9, -1, `${seed}2`)} width={width * 0.9} p={p2} color={color} seed={`${seed}2`} bleed={bleed} /> : null}
    </Boil>
  );
};

// Hand-drawn red marker arrow from (x, y) to the tip (tx, ty): a slightly bowed shaft, then two barbs. `bend` = how much the shaft bows (0.14 of its length).
export const MarkerArrow: React.FC<{x: number; y: number; tx: number; ty: number; at: number; dur?: number; color?: string; bend?: number; seed?: string; width?: number; bleed?: boolean}> = ({x, y, tx, ty, at, dur = 12, color = MARKER, bend = 0.14, seed = 'ma', width = 13, bleed = true}) => {
  const p = useDraw(at, dur);
  const dx = tx - x, dy = ty - y, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  const cx = (x + tx) / 2 + nx * len * bend, cy = (y + ty) / 2 + ny * len * bend;
  const shaft: Pt[] = Array.from({length: 36}, (_, i) => {
    const t = i / 35, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
    return [a * x + b * cx + c * tx + wob(`${seed}s`, t) * 2.5, a * y + b * cy + c * ty + wob(`${seed}t`, t) * 2.5];
  });
  const tdx = tx - cx, tdy = ty - cy, tl = Math.hypot(tdx, tdy) || 1, ang = Math.atan2(tdy, tdx), bl = Math.min(64, len * 0.3);
  const barb = (da: number, k: string): Pt[] => Array.from({length: 12}, (_, i) => {
    const t = i / 11, a = ang + Math.PI + da;
    return [tx + Math.cos(a) * bl * t + wob(`${seed}${k}`, t) * 1.5, ty + Math.sin(a) * bl * t + wob(`${seed}${k}y`, t) * 1.5];
  });
  void tl;
  const ps = Math.min(1, p / 0.7), pb1 = Math.max(0, Math.min(1, (p - 0.7) / 0.15)), pb2 = Math.max(0, Math.min(1, (p - 0.85) / 0.15));
  return (
    <Boil amp={0.9} rot={0.1} seed={seed}>
      <Stroke pts={shaft} width={width} p={ps} color={color} seed={`${seed}a`} bleed={bleed} />
      <Stroke pts={barb(0.5, 'b1')} width={width * 0.92} p={pb1} color={color} seed={`${seed}b`} bleed={bleed} />
      <Stroke pts={barb(-0.5, 'b2')} width={width * 0.92} p={pb2} color={color} seed={`${seed}c`} bleed={bleed} />
    </Boil>
  );
};
