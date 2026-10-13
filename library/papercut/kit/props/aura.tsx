// Power-up aura: a flame aura in cut paper. Flames CLIMB from the feet (the aura layers are revealed
// bottom to top with a flame-toothed front), close over the head and burst into the full fitted aura (spring, overshoot), and the whole
// fire changes colour through a list of stages (red -> orange -> gold -> blue-white by default; the last stage flips through a near-white
// hot point) with paper lightning on the flip. The mascot goes in as `children`, drawn between the back and front flames. Everything is
// drawn at a 1080x1920 reference with the feet at (540, 1285) and a 340 px mascot, then moved and scaled to (x, y, size).
// No cueOf here: the scene passes frames in (stageAt, burstAt, holdAt).
import React from 'react';
import {Easing, interpolate, random, spring} from 'remotion';
import {Paper} from '../paper/kit';

const CX = 540;            // reference: the mascot's centre line
const FEET_Y = 1285;       // reference: ground point under the mascot
const REF_SIZE = 340;      // reference: mascot size
const FIRE_CY = 1035;      // reference: centre of the halo
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = (f: number, a: number, b: number, e: (t: number) => number = Easing.bezier(0.33, 0, 0.2, 1)) => interpolate(f, [a, Math.max(b, a + 1)], [0, 1], {...clamp, easing: e});
const kf = (f: number, pts: [number, number][], easing?: (t: number) => number) => {
  const xs: number[] = [];
  pts.forEach(([x], i) => xs.push(i ? Math.max(x, xs[i - 1] + 1) : x));
  return interpolate(f, xs, pts.map((p) => p[1]), {...clamp, easing});
};
const osc = (f: number, at: number, amp: number, tau: number, w: number) => (f < at ? 0 : amp * Math.exp(-(f - at) / tau) * Math.cos(w * (f - at)));

type Pt = [number, number];
const rnd = (s: string) => random(s);
const f1 = (n: number) => n.toFixed(1);
const clampN = (v: number) => Math.max(0, Math.min(1, v));
const Full: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>{children}</svg>
);
const P = (a: Pt[]) => a.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' ');

/** Catmull-Rom through the points, as cubic Beziers: rounded paper cuts instead of polygons. */
const smooth = (pts: Pt[], closed = true): string => {
  const n = pts.length;
  const g = (i: number) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + (closed ? ' Z' : '');
};
const shift = (pts: Pt[], dx: number, dy: number): Pt[] => pts.map(([x, y]) => [x + dx, y + dy]);
const about = (sx: number, sy: number, ox = CX, oy = FEET_Y, tx = 0, ty = 0) => `translate(${f1(ox + tx)} ${f1(oy + ty)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-ox} ${-oy})`;


// ---------------------------------------------------------------- the palette: deep red -> orange -> gold -> blue-white (one entry per stage)
type Hex = string;
export type AuraPal = {
  aura: [Hex, Hex, Hex][];     // 4 layers outer -> core: [fill, under, highlight]
  tier: [Hex, Hex][];          // 3 front-flame tiers: [fill, under]
  glow: [Hex, Hex, Hex];       // soft halo: inner, mid, outer
  seam: [Hex, Hex];            // cracked-ring seam: outer, inner
  pool: [Hex, Hex];            // firelight pool on the floor
  ember: Hex[];                // 5 fleck colours
  bg: [Hex, Hex, Hex];         // backdrop radial: centre, mid, edge
  wedge: [Hex, Hex];           // the two ray sets
  plate: [Hex, Hex, Hex];      // floor plates
  edge: Hex;                   // lit edge of a plate
  pebble: Hex;                 // lit top of a pebble
};
export const AURA_STAGES: AuraPal[] = [
  {   // 0 deep red
    aura: [['#6A0C0A', '#340405', '#8A1410'], ['#9C1610', '#520806', '#BC2418'], ['#CE2A12', '#7C1008', '#EC4A26'], ['#F2602A', '#A82E0E', '#FF8848']],
    tier: [['#C42A14', '#7A1008'], ['#F0602A', '#A83410'], ['#FFA050', '#D06A22']],
    glow: ['#FF6A40', '#E02A18', '#B01008'], seam: ['#E8501C', '#FF8A3A'], pool: ['#FF8A44', '#E8401E'],
    ember: ['#FF7A3A', '#E8401E', '#FF9A5A', '#FFB070', '#D83018'],
    bg: ['#5E120A', '#340805', '#120202'], wedge: ['#54110A', '#7A1D0E'],
    plate: ['#5E1A0E', '#6E2212', '#521609'], edge: '#B04A24', pebble: '#9A3A1C',
  },
  {   // 1 orange
    aura: [['#B8290F', '#6A1207', '#D8431A'], ['#EE5A16', '#A3320A', '#FF8236'], ['#FFA51E', '#D2700B', '#FFC757'], ['#FFD890', '#EBA040', '#FFEBC0']],
    tier: [['#EE5A16', '#A3320A'], ['#FFA51E', '#D2700B'], ['#FFE0A0', '#F0B050']],
    glow: ['#FFC46E', '#FF8232', '#DC4614'], seam: ['#FF9A2E', '#FFD066'], pool: ['#FFBE50', '#FF6E1E'],
    ember: ['#FFD84A', '#FFA020', '#FF6A1A', '#FFF0B0', '#FFBE38'],
    bg: ['#5E120A', '#340805', '#120202'], wedge: ['#54110A', '#7A1D0E'],
    plate: ['#5E1A0E', '#6E2212', '#521609'], edge: '#C2582A', pebble: '#B5532A',
  },
  {   // 2 gold
    aura: [['#E8900E', '#9C5006', '#FAB22A'], ['#FFB820', '#C87A0A', '#FFD455'], ['#FFDA50', '#E2A41C', '#FFEA8A'], ['#FFF7D0', '#F8DC80', '#FFFFF0']],
    tier: [['#FFB820', '#C87A0A'], ['#FFDA50', '#E2A41C'], ['#FFF6C8', '#F8DC80']],
    glow: ['#FFE49A', '#FFBE40', '#F08A14'], seam: ['#FFC040', '#FFEFA8'], pool: ['#FFD86E', '#FF9E24'],
    ember: ['#FFE66A', '#FFC830', '#FFB020', '#FFF8C8', '#FFDA50'],
    bg: ['#6A1A0C', '#3C0C06', '#140302'], wedge: ['#5C150A', '#8A2810'],
    plate: ['#6A2210', '#7C2C14', '#5C1A0C'], edge: '#E0902C', pebble: '#D08A3A',
  },
  {   // 3 electric blue-white
    aura: [['#1C62F0', '#0A2A94', '#4A8CFF'], ['#3A9CFF', '#1650C4', '#70BEFF'], ['#8AD2FF', '#4896E8', '#C0EAFF'], ['#F4FCFF', '#B8E0FF', '#FFFFFF']],
    tier: [['#3A9CFF', '#1650C4'], ['#9ADAFF', '#4896E8'], ['#F4FCFF', '#BCE2FF']],
    glow: ['#CFEEFF', '#5AA6FF', '#2058E0'], seam: ['#4A9CFF', '#D8F2FF'], pool: ['#9AD6FF', '#3A78F0'],
    ember: ['#FFFFFF', '#9AD6FF', '#5AA6FF', '#D8F2FF', '#7EC0FF'],
    bg: ['#3A1450', '#1E0A34', '#0A0318'], wedge: ['#34124A', '#4A1E78'],
    plate: ['#34204A', '#3E2858', '#2C183E'], edge: '#6A8CE0', pebble: '#6A8CE0',
  },
];
const hx = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
const mixHex = (a: string, b: string, t: number) => {
  const A = hx(a), B = hx(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
/** Blend two palettes (or any nested colour structure) by `t`. */
export const mixPal = <T,>(a: T, b: T, t: number): T => {
  if (t <= 0) return a;
  if (t >= 1) return b;
  if (typeof a === 'string') return mixHex(a, b as unknown as string, t) as unknown as T;
  if (Array.isArray(a)) return a.map((x, i) => mixPal(x, (b as unknown as unknown[])[i], t)) as unknown as T;
  return Object.fromEntries(Object.keys(a as object).map((k) => [k, mixPal((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], t)])) as T;
};
const paint = <T,>(a: T, hex: string): T => (typeof a === 'string' ? (hex as unknown as T) : Array.isArray(a) ? (a.map((x) => paint(x, hex)) as unknown as T) : (Object.fromEntries(Object.keys(a as object).map((k) => [k, paint((a as Record<string, unknown>)[k], hex)])) as T));
const FIRE_KEYS: (keyof AuraPal)[] = ['aura', 'tier', 'glow', 'seam', 'pool', 'ember'];
/** The "10x" flip a -> b: the fire colours go through a near-white hot point (no muddy green midway); the set (backdrop, floor) blends directly. */
export const flipPal = (a: AuraPal, b: AuraPal, t: number): AuraPal => {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const out: AuraPal = mixPal(a, b, t);
  FIRE_KEYS.forEach((k) => {
    (out as Record<string, unknown>)[k] = t < 0.5 ? mixPal(a[k], paint(a[k], '#EEF8FF'), t * 2) : mixPal(paint(b[k], '#EEF8FF'), b[k], (t - 0.5) * 2);
  });
  return out;
};
const rgba = (h: string, a: number) => { const [r, g, b] = hx(h); return `rgba(${r},${g},${b},${a})`; };


/** Tapered ribbon along a polyline (paper cut): `w0` wide at the start, a point at the end. */
const ribbon = (pts: Pt[], w0: number, w1 = 0.8): Pt[] => {
  const n = pts.length, left: Pt[] = [], right: Pt[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const w = (w0 * (1 - i / (n - 1)) + w1) * 0.5;
    left.push([p[0] - (dy / l) * w, p[1] + (dx / l) * w]);
    right.push([p[0] + (dy / l) * w, p[1] - (dx / l) * w]);
  });
  return [...left, ...right.reverse()];
};
/** The first `p` (0-1) of a polyline's length. */
const partial = (pts: Pt[], p: number): Pt[] => {
  if (p >= 1) return pts;
  const segs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  let left = segs.reduce((a, b) => a + b, 0) * p;
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < segs.length && left > 0; i++) {
    const k = Math.min(1, left / segs[i]);
    out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]);
    left -= segs[i];
  }
  return out;
};
const CRACK_SPEC: {a: number; len: number; seed: string}[] = [
  {a: 0.06, len: 300, seed: 'c0'}, {a: 0.24, len: 240, seed: 'c1'}, {a: 0.44, len: 120, seed: 'c2'}, {a: 0.62, len: 130, seed: 'c3'},
  {a: 0.78, len: 250, seed: 'c4'}, {a: 0.94, len: 310, seed: 'c5'}, {a: 1.1, len: 200, seed: 'c6'}, {a: 1.9, len: 210, seed: 'c7'},
];
const CRACKS: Pt[][] = CRACK_SPEC.map(({a, len, seed}) => {
  const A = a * Math.PI;
  const dir: Pt = [Math.cos(A), Math.sin(A) * 0.5];
  const dl = Math.hypot(dir[0], dir[1]);
  const ux = dir[0] / dl, uy = dir[1] / dl, nx = -uy, ny = ux;
  const x0 = CX + Math.cos(A) * 370 * 1.1, y0 = FEET_Y + 20 + Math.sin(A) * 80 * 1.1;
  const n = Math.round(len / 40);
  return Array.from({length: n + 1}).map((_, i): Pt => {
    const along = (i / n) * len, jig = i === 0 ? 0 : (rnd(seed + i) - 0.5) * 30 * (i % 2 ? 1 : -0.8);
    return [x0 + ux * along + nx * jig, y0 + uy * along * 0.9 + ny * jig * 0.6];
  });
});
/** The floor splitting: `p` 0-1 = how far the slits have run (staggered). */
const FloorCracks: React.FC<{p: number; pal: AuraPal}> = ({p, pal}) => (
  <Paper lift={3}>
    <Full>
      {CRACKS.map((pts, i) => {
        const pi = clampN((p * 1.6 - i * 0.09) / 0.75);
        if (pi <= 0.02) return null;
        const part = partial(pts, pi);
        if (part.length < 2) return null;
        return (
          <g key={i}>
            <polygon points={P(ribbon(part, 20, 5))} fill={pal.seam[0]} opacity={0.85} />
            <polygon points={P(ribbon(part, 11, 1.2))} fill="#150302" />
          </g>
        );
      })}
    </Full>
  </Paper>
);


// ---------------------------------------------------------------- flame tongues
type Tongue = {x: number; y: number; h: number; w: number; ang: number; s: 1 | -1};
const N_T = 10;
const tongueFrame = (t: Tongue) => {
  const a = (t.ang * Math.PI) / 180;
  const up: Pt = [Math.sin(a), -Math.cos(a)], rt: Pt = [Math.cos(a), Math.sin(a)];
  const off = (u: number) => t.s * t.w * (0.5 * Math.sin(Math.PI * 1.5 * u) - 0.3 * u ** 3 - 0.85 * u ** 6);
  const spine = (u: number): Pt => [t.x + up[0] * t.h * u + rt[0] * off(u), t.y + up[1] * t.h * u + rt[1] * off(u)];
  const r = (u: number) => t.w * (1 - u) ** 1.25 * (1 + 0.9 * u) + 0.02 * t.w;
  const norm = (u: number): Pt => {
    const p0 = spine(Math.max(0, u - 0.02)), p1 = spine(Math.min(1, u + 0.02));
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1], l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  };
  return {spine, r, norm, up};
};
const tonguePts = (t: Tongue): Pt[] => {
  const {spine, r, norm, up} = tongueFrame(t);
  const us = Array.from({length: N_T}).map((_, i) => i / N_T);
  const left = us.map((u): Pt => {const p = spine(u), n = norm(u), rr = r(u); return [p[0] - n[0] * rr, p[1] - n[1] * rr];});
  const right = us.map((u): Pt => {const p = spine(u), n = norm(u), rr = r(u); return [p[0] + n[0] * rr, p[1] + n[1] * rr];}).reverse();
  const base: Pt = [t.x - up[0] * t.w * 0.7, t.y - up[1] * t.w * 0.7];
  return [base, ...left, spine(1), ...right];
};
const tongueHi = (t: Tongue): Pt[] => {
  const {spine, r, norm} = tongueFrame(t);
  const us = Array.from({length: 8}).map((_, i) => 0.08 + (i / 7) * 0.78);
  const edge = (k: number) => us.map((u): Pt => {const p = spine(u), n = norm(u), rr = r(u); return [p[0] - n[0] * rr * k, p[1] - n[1] * rr * k];});
  return [...edge(0.86), ...edge(0.32).reverse()];
};
/** Boil: variant `step % 4` of a tongue, shaped so variant 0 is exactly the still. `amt` = how wild. */
const boilT = (t: Tongue, seed: string, i: number, step: number, amt: number): Tongue => {
  if (amt <= 0) return t;
  const k = step % 4;
  const r = (s: string) => rnd(`${seed}${s}${i}_${k}`) - rnd(`${seed}${s}${i}_0`);
  return {...t, h: t.h * (1 + r('h') * 0.26 * amt), w: t.w * (1 + r('w') * 0.12 * amt), ang: t.ang + r('a') * 9 * amt, x: t.x + r('x') * 7 * amt};
};

// ---------------------------------------------------------------- the aura: a burning outline hugging the mascot
const SIL: Pt[] = [
  [CX - 160, FEET_Y + 14], [CX - 176, 1200], [CX - 180, 1080], [CX - 183, 985], [CX - 194, 915],
  [CX - 184, 850], [CX - 146, 788], [CX - 92, 748], [CX, 726],
];
const MID = SIL.length - 1;   // index of the top point in SIL_LINE
const SIL_LINE: Pt[] = [...SIL, ...SIL.slice(0, -1).reverse().map(([x, y]): Pt => [2 * CX - x, y])];
const offsetLine = (d: number, top: number): Pt[] => SIL_LINE.map((p, i) => {
  const a = SIL_LINE[Math.max(0, i - 1)], b = SIL_LINE[Math.min(SIL_LINE.length - 1, i + 1)];
  const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
  const upness = Math.max(0, Math.min(1, (985 - p[1]) / 260));
  return [p[0] + (ty / l) * d, p[1] + (-tx / l) * d - top * upness];
});
type AuraSpec = {d: number; top: number; n: number; hMin: number; hMax: number; topK: number; wMin: number; wMax: number; seed: string};
const BOTTOM: Pt[] = [[CX + 110, FEET_Y + 36], [CX, FEET_Y + 42], [CX - 110, FEET_Y + 36]];
const auraMass = (L: AuraSpec): Pt[] => [...offsetLine(L.d, L.top), ...BOTTOM];
const auraTongues = (L: AuraSpec): Tongue[] => {
  const line = offsetLine(L.d, L.top);
  const seg = line.slice(1).map((p, i) => Math.hypot(p[0] - line[i][0], p[1] - line[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const at = (d: number) => {
    let i = 0;
    while (i < seg.length - 1 && d > seg[i]) {d -= seg[i]; i++;}
    const k = Math.min(1, d / seg[i]), p = line[i], q = line[i + 1];
    const tx = (q[0] - p[0]) / seg[i], ty = (q[1] - p[1]) / seg[i];
    return {p: [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k] as Pt, n: [ty, -tx] as Pt};
  };
  return Array.from({length: L.n}).map((_, i) => {
    const d = total * (0.03 + 0.94 * ((i + 0.5 + (rnd(L.seed + 'j' + i) - 0.5) * 0.5) / L.n));
    const {p, n} = at(d);
    const upness = Math.max(0, -n[1]);
    const lean = (Math.atan2(n[0], -n[1]) * 180) / Math.PI;
    const w = L.wMin + rnd(L.seed + 'w' + i) * (L.wMax - L.wMin);
    const h = (L.hMin + rnd(L.seed + 'h' + i) * (L.hMax - L.hMin)) * (1 - (1 - L.topK) * upness);
    return {x: p[0] - n[0] * w * 0.5, y: p[1] - n[1] * w * 0.5, w, h, ang: Math.max(-10, Math.min(10, lean * 0.14)), s: rnd(L.seed + 's' + i) > 0.5 ? 1 : -1};
  });
};

const LAYERS: {spec: AuraSpec; lift: number}[] = [
  {spec: {d: 50, top: 16, n: 18, hMin: 135, hMax: 205, topK: 0.4, wMin: 36, wMax: 48, seed: 'aA'}, lift: 6},
  {spec: {d: 34, top: 10, n: 18, hMin: 105, hMax: 160, topK: 0.45, wMin: 30, wMax: 40, seed: 'aB'}, lift: 6},
  {spec: {d: 18, top: 4, n: 16, hMin: 70, hMax: 115, topK: 0.55, wMin: 24, wMax: 32, seed: 'aC'}, lift: 5},
  {spec: {d: 2, top: 0, n: 14, hMin: 36, hMax: 58, topK: 0.7, wMin: 16, wMax: 22, seed: 'aD'}, lift: 4},
];
const TONGUES = LAYERS.map((L) => ({line: offsetLine(L.spec.d, L.spec.top), mass: auraMass(L.spec), tongues: auraTongues(L.spec)}));

/** The aura's body clipped to what the climbing fire has reached: everything below `front` (a y), with a row of small flame teeth
 *  along the top edge that boil with `step`. `null` once the front is above the head (then the whole body shows). */
const massBelow = (li: number, front: number, step: number): Pt[] | null => {
  const line = TONGUES[li].line, n = line.length, topY = line[MID][1];
  if (front <= topY) return null;
  if (front >= line[0][1] - 6) return [];
  let i = 0;
  while (i < MID - 1 && line[i + 1][1] >= front) i++;
  let j = MID + 1;
  while (j < n - 1 && line[j][1] < front) j++;
  const cut = (a: Pt, b: Pt): Pt => {const k = (a[1] - front) / (a[1] - b[1] || 1); return [a[0] + (b[0] - a[0]) * k, front];};
  const cutL = cut(line[i], line[i + 1]), cutR = cut(line[j], line[j - 1]);
  const width = Math.abs(cutR[0] - cutL[0]);
  const K = Math.max(2, Math.min(6, Math.round(width / 58)));
  const seed = LAYERS[li].spec.seed + 'tt';
  const teeth: Pt[] = [];
  for (let k = 0; k < K; k++) {
    const u0 = k / K, u1 = (k + 0.5) / K, mid = 1 - 0.45 * Math.abs(2 * u1 - 1);
    const hh = 64 * mid * (0.75 + 0.5 * rnd(seed + k + '_' + (step % 4))) * (li === 3 ? 0.55 : 1);
    teeth.push([cutR[0] + (cutL[0] - cutR[0]) * u0, front + 8], [cutR[0] + (cutL[0] - cutR[0]) * u1 + (rnd(seed + 'x' + k + (step % 4)) - 0.5) * 14, front - hh]);
  }
  return [
    cutL, ...line.slice(0, i + 1).reverse(), ...BOTTOM.slice().reverse(), ...line.slice(j).reverse(), cutR, ...teeth,
  ];
};
/** How far a tongue whose base sits at `y` has grown, 0..~1.08, for a climbing front: grows as the front passes it, in a stagger. */
const tongueGrow = (y: number, front: number, i: number, seed: string): number => {
  const jit = (rnd(seed + 'g' + i) - 0.5) * 46;
  return Easing.out(Easing.back(1.5))(clampN((y - front + jit) / 120));
};

/** A soft halo behind the mascot (light, not paper). `k` scales it with the aura. */
const Glow: React.FC<{k?: number; strength?: number; pal: AuraPal}> = ({k = 1, strength = 1, pal}) => (
  <div style={{position: 'absolute', left: CX - 520, top: FIRE_CY - 620, width: 1040, height: 1180, opacity: Math.min(1, strength), transformOrigin: `50% ${FEET_Y - (FIRE_CY - 620)}px`, scale: String(k),
    background: `radial-gradient(ellipse at 50% 50%, ${rgba(pal.glow[0], 0.6)} 0%, ${rgba(pal.glow[1], 0.3)} 32%, ${rgba(pal.glow[2], 0.1)} 52%, ${rgba(pal.glow[2], 0)} 68%)`}} />
);
/** Fire layer 0 = outer rim, 1 = body, 2 = bright, 3 = core hugging the body (colours from `pal`).
 *  (sx, sy) scale it about the mascot's feet; `step` picks the boil variant; `amt` = how wild the tongues are;
 *  `front` = the y the fire has climbed to (smaller = higher; above ~560 the whole aura shows). */
const Fire: React.FC<{layer: 0 | 1 | 2 | 3; sx: number; sy: number; step: number; amt: number; pal: AuraPal; front: number}> = ({layer, sx, sy, step, amt, pal, front}) => {
  const L = LAYERS[layer], T = TONGUES[layer];
  const [fill, under, hi] = pal.aura[layer];
  const mass = massBelow(layer, front, step) ?? T.mass;
  const tongues = T.tongues.map((t, i) => {
    const g = tongueGrow(t.y, front, i, L.spec.seed);
    if (g <= 0.03) return null;
    const b = boilT(t, L.spec.seed, i, step, amt);
    return {...b, h: b.h * g, w: b.w * (0.5 + 0.5 * Math.min(1, g))};
  }).filter((t): t is Tongue => t !== null);
  return (
    <Paper lift={L.lift}>
      <Full>
        <g transform={about(sx, sy)}>
          {mass.length > 2 && <path d={smooth(shift(mass, 5, 8))} fill={under} />}
          {tongues.map((t, i) => <path key={'u' + i} d={smooth(shift(tonguePts(t), 5, 8))} fill={under} />)}
          {mass.length > 2 && <path d={smooth(mass)} fill={fill} />}
          {tongues.map((t, i) => <path key={'m' + i} d={smooth(tonguePts(t))} fill={fill} />)}
          {tongues.map((t, i) => <path key={'h' + i} d={smooth(tongueHi(t))} fill={hi} />)}
        </g>
      </Full>
    </Paper>
  );
};

/** Small flames in FRONT of the mascot (feet and lower body edges): a cartoon flame cut in three nested tiers. */
const FRONT: Tongue[] = [
  {x: CX - 226, y: FEET_Y + 14, h: 150, w: 46, ang: -8, s: 1},
  {x: CX + 230, y: FEET_Y + 14, h: 158, w: 48, ang: 8, s: -1},
  {x: CX - 162, y: FEET_Y + 22, h: 96, w: 34, ang: -4, s: -1},
  {x: CX + 166, y: FEET_Y + 22, h: 104, w: 34, ang: 5, s: 1},
  {x: CX - 77, y: FEET_Y + 28, h: 62, w: 24, ang: -3, s: 1},
  {x: CX + 78, y: FEET_Y + 28, h: 48, w: 20, ang: 4, s: -1},
  {x: CX - 186, y: FEET_Y - 70, h: 120, w: 28, ang: -10, s: 1},
  {x: CX + 190, y: FEET_Y - 80, h: 124, w: 28, ang: 10, s: -1},
];
/** `growth[i]` (0-1) = how far front flame i has risen (0 = hidden); the flame grows out of its base. */
const FrontFlames: React.FC<{sx: number; sy: number; step: number; amt: number; pal: AuraPal; growth: number[]}> = ({sx, sy, step, amt, pal, growth}) => {
  const tiers: [number, number][] = [[1, 1], [0.72, 0.66], [0.44, 0.38]];
  return (
    <Paper lift={6}>
      <Full>
        <g transform={about(sx, sy)}>
          {FRONT.map((t0, i) => {
            const g = growth[i];
            if (g <= 0.03) return null;
            const b = boilT(t0, 'ff', i, step, amt);
            const t: Tongue = {...b, h: b.h * g, w: b.w * (0.55 + 0.45 * Math.min(1, g))};
            return (
              <g key={i}>
                {tiers.map(([hk, wk], k) => {
                  const [col, under] = pal.tier[k];
                  const tt: Tongue = {...t, h: t.h * hk, w: t.w * wk, y: t.y - (k ? 6 : 0)};
                  return (
                    <g key={k}>
                      <path d={smooth(shift(tonguePts(tt), 4, 7))} fill={under} />
                      <path d={smooth(tonguePts(tt))} fill={col} />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      </Full>
    </Paper>
  );
};

// ---------------------------------------------------------------- paper lightning: a few small zig-zag bolts around the maxed-out aura
const BOLTS: {x: number; y: number; ang: number; len: number; w: number}[] = [
  {x: CX - 215, y: 960, ang: -150, len: 190, w: 26},
  {x: CX - 235, y: 1150, ang: 190, len: 170, w: 24},
  {x: CX + 215, y: 930, ang: -32, len: 200, w: 26},
  {x: CX + 240, y: 1130, ang: 8, len: 150, w: 22},
  {x: CX - 110, y: 780, ang: -115, len: 150, w: 22},
  {x: CX + 120, y: 770, ang: -65, len: 150, w: 22},
];
const boltPts = (b: (typeof BOLTS)[number], variant: string, grow: number): Pt[] => {
  const a = (b.ang * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux, N = 5, len = b.len * grow;
  return Array.from({length: N + 1}).map((_, i): Pt => {
    const along = (i / N) * len, zig = i === 0 || i === N ? 0 : (i % 2 ? 1 : -1) * len * 0.15 * (0.6 + 0.8 * rnd(variant + i));
    return [b.x + ux * along + nx * zig, b.y + uy * along + ny * zig];
  });
};
/** `t` = frames since the "10x" flip. Round one fires on t 0-13; two later pairs re-strike for 3 f each. Variant redrawn every 2 f. */
const Bolts: React.FC<{t: number; step: number}> = ({t, step}) => {
  if (t < 0) return null;
  const strikes = [22, 39];
  const pair = strikes.findIndex((s) => t >= s && t < s + 3);
  const live = BOLTS.map((b, i) => {
    if (t < 14) {
      const start = i % 3, end = 11 + (i % 3) * 2;
      return t >= start && t < end ? Math.min(1, 0.35 + (t - start) * 0.3) : 0;
    }
    if (pair >= 0 && (i === (pair * 2 + 1) % BOLTS.length || i === (pair * 2 + 4) % BOLTS.length)) return 0.9;
    return 0;
  });
  if (!live.some((v) => v > 0)) return null;
  return (
    <Paper lift={7}>
      <Full>
        {BOLTS.map((b, i) => {
          if (live[i] <= 0) return null;
          const pts = boltPts(b, `bolt${i}_${step % 4}`, live[i]);
          return (
            <g key={i}>
              <polygon points={P(shift(ribbon(pts, b.w * 1.9, 5), 5, 7))} fill="#2A5CE0" />
              <polygon points={P(ribbon(pts, b.w * 1.5, 3))} fill="#9AD8FF" />
              <polygon points={P(ribbon(pts, b.w * 0.8, 2))} fill="#FFFFFF" />
            </g>
          );
        })}
      </Full>
    </Paper>
  );
};

// ---------------------------------------------------------------- embers: small paper flecks that rise and fade
const avoid = (x: number, y: number) => y < 680 || (Math.abs(x - CX) < 262 && y > 640) || (y > 1400 && y < 1600);
type Ember = {x: number; y: number; r: number; rot: number; ci: number; P: number; u0: number; R: number; sway: number; ph: number; extra: boolean};
const EMBERS: Ember[] = (() => {
  const out: Ember[] = [];
  const n = 24, base = 16;
  for (let i = 0; out.length < n && i < n * 12; i++) {
    const a = Math.PI * (0.95 + rnd('ea' + i) * 1.1);
    const rr = 300 + rnd('er' + i) * 170;
    const x = CX + Math.cos(a) * rr * 1.05, y = FIRE_CY + 40 + Math.sin(a) * rr * 1.35;
    if (x < 30 || x > 1050 || y < 200 || avoid(x, y)) continue;
    const k = out.length;
    out.push({x, y, r: 4 + rnd('es' + i) * 7, rot: (rnd('et' + i) - 0.5) * 120, ci: i % 5,
      P: 62 + rnd('ep' + i) * 40, u0: 0.28 + rnd('eu' + i) * 0.24, R: 130 + rnd('eR' + i) * 90, sway: 5 + rnd('ew' + i) * 9, ph: rnd('eh' + i) * 6.28, extra: k >= base});
  }
  return out;
})();
const fleck = (r: number, seed: string): string => {
  const k = 4 + Math.floor(rnd(seed + 'k') * 2);
  const pts: Pt[] = Array.from({length: k}).map((_, j) => {
    const a = (j / k) * Math.PI * 2 + rnd(seed + 'a' + j) * 0.6;
    const rr = r * (0.7 + rnd(seed + 'r' + j) * 0.5);
    return [Math.cos(a) * rr * 0.75, Math.sin(a) * rr * 1.25];
  });
  return smooth(pts);
};
/** Embers rise, sway and fade out (and are reborn lower). `extra` 0–1 brings in 8 more. `ceil` = the highest y they may appear at
 *  (they only exist above the flames that made them), `cols` = the palette's 5 fleck colours. */
const Embers: React.FC<{f: number; extra: number; speed?: number; ceil?: number; cols: Hex[]}> = ({f, extra, speed = 1, ceil = 0, cols}) => (
  <Paper lift={4}>
    <Full>
      {EMBERS.map((e, i) => {
        const ff = f * speed;
        const u = ((ff + e.u0 * e.P) % e.P) / e.P;
        const y = e.y - e.R * (u - e.u0);
        const x = e.x + e.sway * (Math.sin(ff / 14 + e.ph) - Math.sin(e.ph));
        let s = Math.min(1, u / 0.12, (1 - u) / 0.3);
        s *= clampN((y - 590) / 90) * clampN((y - ceil) / 100) * (e.extra ? extra : 1);
        if (avoid(x, y + 60) && y > 640) s = 0;
        if (s <= 0.02) return null;
        const rot = e.rot + ff * 2.2 * (i % 2 ? 1 : -1);
        return (
          <g key={i} transform={`translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${s.toFixed(3)})`}>
            <path d={fleck(e.r, 'fl' + i)} transform="translate(2 3)" fill="#7A1C06" />
            <path d={fleck(e.r, 'fl' + i)} fill={cols[e.ci]} />
          </g>
        );
      })}
    </Full>
  </Paper>
);


// ---------------------------------------------------------------- the component

const W_LAYER = [1, 0.85, 0.6, 0.15];   // how much of the growth each aura layer takes (the core keeps hugging the body)
const LAG = [0, 24, 50, 80];            // px each inner layer's flame front trails the outer one while climbing

/** The aura's colour at frame f: ramps (7 f) from stage i-1 to stage i at `stageAt[i]`; with `flipLast` the final stage is reached through the near-white flip. */
export const auraPal = (f: number, stageAt: number[], stages: AuraPal[] = AURA_STAGES, flipLast = true): AuraPal => {
  let pal = stages[0];
  for (let i = 1; i < stages.length; i++) {
    const last = flipLast && i === stages.length - 1;
    const r = ease(f, stageAt[i] - 1, stageAt[i] + (last ? 5 : 6), Easing.inOut(Easing.quad));
    pal = last ? flipPal(pal, stages[i], r) : mixPal(pal, stages[i], r);
  }
  return pal;
};

/**
 * Power-up aura: fire climbs from the feet, bursts into the fitted aura, shifts colour per stage, lightning on the last flip. `f` = scene frame.
 * (x, y) = ground point under the mascot, `size` = the mascot's size (aura scales with it); put the mascot in `children` at the same (x, y) (it is drawn between the back and front flames).
 * Frames: `stageAt` = when each palette stage begins (stage 0 at 0; default [0, 20, 44, 66]), `burstAt` = the flames close over the head and burst
 * (default stageAt[2]), `holdAt` = from here the aura flickers and holds (default never). `climb` = [frame, front y] keys in reference px (smaller = higher; default from burstAt).
 * `stages` = AuraPal list (AURA_STAGES), `pal` overrides the computed colour, `bolts` / `embers` toggle the lightning and flecks, `cracks` 0-1 draws floor cracks.
 */
export const PowerUpAura: React.FC<{
  f: number; x?: number; y?: number; size?: number; children?: React.ReactNode;
  stageAt?: number[]; burstAt?: number; holdAt?: number; climb?: [number, number][];
  stages?: AuraPal[]; pal?: AuraPal; bolts?: boolean; embers?: boolean; cracks?: number;
}> = ({f, x = CX, y = FEET_Y, size = REF_SIZE, children, stageAt = [0, 20, 44, 66], burstAt, holdAt = Infinity, climb, stages = AURA_STAGES, pal: palIn, bolts = true, embers = true, cracks = 0}) => {
  const sc = burstAt ?? stageAt[2] ?? 44;
  const flipAt = stageAt[stageAt.length - 1];
  const pal = palIn ?? auraPal(f, stageAt, stages);
  const inOut = Easing.inOut(Easing.quad);
  const keys = climb ?? [[0, 1185], [Math.round(sc * 0.4), 1105], [Math.round(sc * 0.66), 1030], [Math.round(sc * 0.9), 950], [sc - 1, 958]] as [number, number][];
  const climbY = kf(f, keys);
  const frontOf = (L: number) => {
    const s = ease(f, sc - 1 + L, sc + 6 + L, Easing.out(Easing.cubic));
    return (climbY + LAG[L]) * (1 - s) + 470 * s;
  };
  const growth = FRONT.map((_, i) => (i < 6 ? 0.45 + 0.55 * ease(f, i * 2, i * 2 + 18, Easing.out(Easing.quad)) : ease(f, 12 + (i - 6) * 5, 30 + (i - 6) * 5, Easing.out(Easing.back(1.5)))));
  const g = f < sc ? 0 : spring({frame: f - sc, fps: 30, config: {damping: 8, stiffness: 200, mass: 0.6}});
  const aS = f < sc ? 0.88 - 0.04 * ease(f, sc - 9, sc - 1, inOut) : 0.84 + 0.16 * g;
  const pulse = osc(f, flipAt, 0.05, 6, 0.6);
  const flick = f >= holdAt ? (random('fl' + Math.floor(f / 2)) - 0.5) * 0.05 : 0;
  const breathe = (ph: number) => 0.015 * (Math.sin((2 * Math.PI * f) / 40 + ph) - Math.sin(ph));
  const layer = (L: number) => {
    const w = W_LAYER[L], d = aS - 1 + pulse + flick;
    return {sx: 1 + d * w + breathe(L * 0.9), sy: 1 + d * 1.1 * w + breathe(L * 0.9) * 0.7, step: Math.floor((f + (L % 2)) / 2)};
  };
  const wild = f < sc ? 1 : f < holdAt ? 1.4 : 1.2;
  const growK = 0.55 + 0.3 * ease(f, 0, sc) + 0.15 * g + (pulse + flick) * 0.9;
  const lit = 0.5 + 0.5 * ease(f, 0, sc + 4);
  const ff = f + 0.5 * Math.max(0, f - sc);
  const frame: React.CSSProperties = {position: 'absolute', inset: 0, transformOrigin: `${CX}px ${FEET_Y}px`, translate: `${x - CX}px ${y - FEET_Y}px`, scale: String(size / REF_SIZE)};
  return (
    <>
      <div style={frame}>
        {cracks > 0 && <FloorCracks p={cracks} pal={pal} />}
        <Glow k={growK} strength={lit} pal={pal} />
        <Fire layer={0} {...layer(0)} amt={wild} pal={pal} front={frontOf(0)} />
        <Fire layer={1} {...layer(1)} amt={wild} pal={pal} front={frontOf(1)} />
        <Fire layer={2} {...layer(2)} amt={wild} pal={pal} front={frontOf(2)} />
        <Fire layer={3} {...layer(3)} amt={wild} pal={pal} front={frontOf(3)} />
        {bolts && <Bolts t={f - flipAt} step={Math.floor(f / 2)} />}
      </div>
      {children}
      <div style={frame}>
        <FrontFlames {...layer(1)} amt={wild} pal={pal} growth={growth} />
        {embers && <Embers f={ff} extra={ease(f, sc, sc + 10)} ceil={frontOf(0) - 260} cols={pal.ember} />}
      </div>
    </>
  );
};
