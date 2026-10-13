// Paper transitions between scenes: whip, zoomThrough, pageTurn (curl), tearAway, tapePull (a kraft tape strip), stampCut, infiniteZoom (Droste), popUpBook (+ PopUpOpen) and keyhole. Use <CutSeries> in place of <Series> in PapercutVideo: cuts={{S05: {kind: 'pageTurn'}}}, keyed by the INCOMING scene, no entry = hard cut. Scene start frames stay on plan.json. Needs <PaperDefs/>.

// All of them are @remotion/transitions presentations too, so they also drop into a plain <TransitionSeries>. Everything is cut paper (shadows, torn edges, grain); none uses a 3D cube or a crossfade. Pick by story beat: whip = switch topic, zoomThrough = go inside, pageTurn = next step, tearAway = something breaks, tapePull = the default cut, stampCut = verdict, infiniteZoom = recursion joke, popUpBook = chapter or opener, keyhole = sneaking in, spying, a heist.
import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, Freeze, Sequence, interpolate, random, useCurrentFrame} from 'remotion';
import {linearTiming, TransitionSeries, type TransitionPresentation, type TransitionPresentationComponentProps} from '@remotion/transitions';
import {C, FONT, H, W} from '../tokens';
import {GRAIN, Paper, Slab} from './kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const cl01 = (x: number) => Math.min(1, Math.max(0, x));
type PP<P extends Record<string, unknown>> = TransitionPresentationComponentProps<P>;
type Pt = [number, number];
const pres = <P extends Record<string, unknown>>(component: React.FC<PP<P>>, props: P): TransitionPresentation<P> => ({component, props});
// Frame i of a T-frame transition is sampled at (i + 0.5) / T, so neither end repeats the plain frame next to it.
const useU = (p: number, T: number) => cl01((p * T + 0.5) / T);
const fill: React.CSSProperties = {position: 'absolute', inset: 0};
const GRAIN_BG = {backgroundImage: `url(${GRAIN})`, backgroundSize: '520px', backgroundBlendMode: 'multiply'} as const;
// Paper cut-away backing (kraft): what shows if a motion-blurred edge goes soft, so a seam never flashes the dark root.
const KRAFT = '#CDBFA6';

// ---------- geometry helpers ----------
const PAGE: Pt[] = [[0, 0], [W, 0], [W, H], [0, H]];
const polyStr = (pts: Pt[]) => (pts.length < 3 ? 'polygon(0px 0px, 0px 0px, 0px 0px)' : `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(', ')})`);
// Sutherland-Hodgman against the half-plane p.n >= d (keep = 1) or p.n <= d (keep = -1).
const clipHalf = (poly: Pt[], n: Pt, d: number, keep: 1 | -1): Pt[] => {
  const val = (p: Pt) => keep * (p[0] * n[0] + p[1] * n[1] - d);
  const out: Pt[] = [];
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    const va = val(a), vb = val(b);
    if (va >= 0) out.push(a);
    if (va >= 0 !== vb >= 0) { const t = va / (va - vb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  });
  return out;
};
// A full-frame CSS linear-gradient along the unit vector u. Stops are distances s (px) measured along u from the frame origin.
const alongGradient = (u: Pt, stops: [number, string][]) => {
  const A = Math.atan2(u[0], -u[1]);
  const L = Math.abs(W * Math.sin(A)) + Math.abs(H * Math.cos(A));
  const c = (W / 2) * u[0] + (H / 2) * u[1];
  return `linear-gradient(${(A * 180) / Math.PI}deg, ${stops.map(([s, col]) => `${col} ${(s - c + L / 2).toFixed(1)}px`).join(', ')})`;
};

// ============================================================ whip
type WhipOpts = {blur?: number; overlap?: number};
const EASE_WHIP = Easing.bezier(0.55, 0, 0.2, 1);
const Whip: React.FC<PP<WhipOpts>> = ({children, presentationDirection: dir, presentationProgress: p, presentationDurationInFrames: T, passedProps: {blur = 46, overlap = 140}}) => {
  const u = useU(p, T), e = EASE_WHIP(u);
  const exiting = dir === 'exiting';
  const sd = blur * Math.pow(Math.sin(Math.PI * e), 0.75);
  // The outgoing sheet leaves slightly slower than the incoming arrives, so the two always overlap a little (no gap, no dark seam).
  const x = exiting ? -e * W + overlap * Math.sin(Math.PI * e) : (1 - e) * W;
  const shake = (random(`whip${Math.round(u * T)}`) - 0.5) * 2 * 7 * Math.sin(Math.PI * e);
  const id = exiting ? 'tr-whip-out' : 'tr-whip-in';
  return (
    <AbsoluteFill>
      {exiting ? <div style={{...fill, background: KRAFT}} /> : null}
      <AbsoluteFill style={{translate: `${x}px ${shake}px`, filter: sd > 0.5 ? `url(#${id})` : undefined}}>
        {sd > 0.5 ? (
          <svg width={0} height={0} style={{position: 'absolute'}}>
            <filter id={id} x="-25%" y="0" width="150%" height="100%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation={`${sd.toFixed(1)} 0`} /></filter>
          </svg>
        ) : null}
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================ zoomThrough
type ZoomOpts = {x?: number; y?: number; scale?: number; trails?: number};
const ZoomThrough: React.FC<PP<ZoomOpts>> = ({children, presentationDirection: dir, presentationProgress: p, presentationDurationInFrames: T, passedProps: {x = 540, y = 900, scale = 7, trails = 4}}) => {
  const u = useU(p, T);
  if (dir === 'exiting') {
    // Exponential push into (x, y); the point glides to the frame centre while the scene swells. Several time-offset copies stack into a radial streak.
    const at = (uu: number) => { const e = Math.pow(cl01(uu), 1.5); return {s: Math.exp(Math.log(scale) * e), m: e}; };
    const layers = Array.from({length: trails + 1}, (_, k) => at(u - (trails - k) * (0.6 / (T * trails))));
    const e = at(u).m;
    return (
      <AbsoluteFill>
        <div style={{...fill, background: KRAFT}} />
        <AbsoluteFill style={{filter: `blur(${(2 + 22 * Math.pow(e, 1.2)).toFixed(1)}px)`}}>
          {layers.map((l, k) => (
            <div key={k} style={{...fill, opacity: 1 / (k + 1), transformOrigin: `${x}px ${y}px`, transform: `translate(${(W / 2 - x) * l.m}px, ${(H / 2 - y) * l.m}px) scale(${l.s})`}}>
              {children}
            </div>
          ))}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  const v = cl01((u - 0.3) / 0.7);
  const s = 1.15 - 0.15 * Easing.out(Easing.cubic)(v);
  const flash = 0.22 * Math.sin(Math.PI * cl01((u - 0.25) / 0.45));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: smooth(cl01((u - 0.28) / 0.34)), filter: v < 1 ? `blur(${(16 * (1 - v)).toFixed(1)}px)` : undefined, transform: `scale(${s})`}}>{children}</AbsoluteFill>
      <div style={{...fill, background: '#FFF4DE', opacity: flash}} />
    </AbsoluteFill>
  );
};
const smooth = (x: number) => x * x * (3 - 2 * x);

// ============================================================ pageTurn
type PageOpts = {angle?: number; from?: 'bottom' | 'top'; back?: string; style?: 'curl' | 'fold'};
const BACK = '#EFE7D8';
const ov = (v: number) => (v < 1 ? `rgba(52,34,14,${((1 - v) * 0.85).toFixed(3)})` : `rgba(255,255,255,${Math.min(0.8, (v - 1) * 1.6).toFixed(3)})`);

// ---- style 'fold': a flat diagonal fold line sweeping across the sheet ----
const EASE_PAGE = Easing.bezier(0.4, 0.05, 0.8, 0.8);
// Fold line {p : p.n = d}: starts at the lifted corner and sweeps to the opposite one, straightening as it goes.
const foldAt = (u: number, angle: number, dir: 1 | -1) => {
  const e = 0.05 + 0.95 * EASE_PAGE(u);     // starts with the corner already lifted, so frame 0 shows a page turning
  const phi = (angle * (1 - 0.65 * e) * dir * Math.PI) / 180;
  const n: Pt = [Math.cos(phi), Math.sin(phi)];
  const dots = PAGE.map(([px, py]) => px * n[0] + py * n[1]);
  const dmax = Math.max(...dots), dmin = Math.min(...dots);
  const d = dmax - (dmax - dmin) * Math.min(1, e * 1.04);
  const front = clipHalf(PAGE, n, d, -1);
  // The part right of the fold turns over: its mirror image across the fold line is the paper's back.
  const flap = clipHalf(PAGE, n, d, 1).map(([px, py]): Pt => { const k = 2 * (px * n[0] + py * n[1] - d); return [px - k * n[0], py - k * n[1]]; });
  return {e, n, d, front, flap, R: 36 + 84 * e};
};
const PageFold: React.FC<PP<PageOpts>> = ({children, presentationDirection: dir, presentationProgress: p, presentationDurationInFrames: T, passedProps: {angle = 34, from = 'bottom', back = BACK}}) => {
  const u = useU(p, T);
  const f = foldAt(u, angle, from === 'bottom' ? 1 : -1);
  const [nx, ny] = f.n;
  if (dir === 'entering') {
    // The lifted sheet shades the page beneath: a soft penumbra right of the fold that widens as the curl rises.
    const S = 170 + 190 * f.e, a = 0.58 * (1 - 0.35 * f.e);
    return (
      <AbsoluteFill>
        {children}
        <div style={{...fill, background: alongGradient(f.n, [[f.d - 4, `rgba(20,12,4,${a})`], [f.d + S * 0.25, `rgba(20,12,4,${a * 0.5})`], [f.d + S, 'rgba(20,12,4,0)']])}} />
      </AbsoluteFill>
    );
  }
  const u2: Pt = [-nx, -ny];   // gradient runs from the fold into the flap
  const R = f.R;
  const flapShade = alongGradient(u2, [
    [-f.d, 'rgba(60,40,20,0.55)'], [-f.d + 2, 'rgba(255,250,240,0.75)'], [-f.d + 5, 'rgba(60,40,20,0.32)'],
    [-f.d + R * 0.55, 'rgba(255,255,255,0.0)'], [-f.d + R * 0.95, 'rgba(255,255,255,0.42)'], [-f.d + R * 1.7, 'rgba(255,255,255,0.0)'],
    [-f.d + R * 3.2, 'rgba(60,40,20,0.10)'], [-f.d + 2400, 'rgba(60,40,20,0.14)'],
  ]);
  return (
    <AbsoluteFill style={{zIndex: 2, filter: 'drop-shadow(10px 8px 14px rgba(15,8,0,0.38))'}}>
      <div style={{...fill, clipPath: polyStr(f.front)}}>{children}</div>
      <div style={{...fill, filter: 'url(#rough) drop-shadow(-3px 5px 9px rgba(15,8,0,0.45))'}}>
        <div style={{...fill, clipPath: polyStr(f.flap)}}>
          <div style={{...fill, backgroundColor: back, ...GRAIN_BG}} />
          {/* the front's print shows faintly through the back, mirrored */}
          <div style={{...fill, transformOrigin: '0 0', transform: `matrix(${1 - 2 * nx * nx}, ${-2 * nx * ny}, ${-2 * nx * ny}, ${1 - 2 * ny * ny}, ${2 * f.d * nx}, ${2 * f.d * ny})`, opacity: 0.13, mixBlendMode: 'multiply', filter: 'grayscale(0.7)'}}>{children}</div>
          <div style={{...fill, background: flapShade}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---- style 'curl' (default): the page rolls over a cylinder, like a book page being turned ----
// Work in page coordinates (s along the curl direction n, tau across it). The page is flat for s <= a; beyond that it wraps a
// cylinder of radius R whose axis sits at s = a (screen position a + R sin(theta), theta = (s - a) / R) and, past theta = pi,
// lies flat again, face down, heading back over the page. From the front you see: the flat page, the page's own front
// bending away toward the roll's edge (compressed), and over it the paper back (cylinder shading, then flat).
const EASE_CURL = Easing.bezier(0.4, 0.05, 0.8, 0.8);
type Chord = (s: number) => [number, number] | null;
const chordFn = (cs: Pt[]): Chord => (s) => {
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < cs.length; i++) {
    const [s0, t0] = cs[i], [s1, t1] = cs[(i + 1) % cs.length];
    if (s0 === s1) { if (s0 === s) { lo = Math.min(lo, t0, t1); hi = Math.max(hi, t0, t1); } continue; }
    if ((s0 - s) * (s1 - s) <= 0) { const t = t0 + ((t1 - t0) * (s - s0)) / (s1 - s0); lo = Math.min(lo, t); hi = Math.max(hi, t); }
  }
  return lo <= hi ? [lo, hi] : null;
};
const curlAt = (u: number, angle: number, dir: 1 | -1) => {
  const e = 0.04 + 0.96 * EASE_CURL(u);
  const phi = (angle * (1 - 0.55 * e) * dir * Math.PI) / 180;
  const n: Pt = [Math.cos(phi), Math.sin(phi)], t: Pt = [-n[1], n[0]];
  const cs = PAGE.map(([px, py]): Pt => [px * n[0] + py * n[1], px * t[0] + py * t[1]]);
  const sMax = Math.max(...cs.map((c) => c[0])), sMin = Math.min(...cs.map((c) => c[0]));
  const R = 64 + 126 * e;
  const a0 = sMax - 210, a1 = sMin - 190 - 60;                // axis: tip just lifted ... roll fully off the left edge
  const a = a0 + (a1 - a0) * Math.min(1, e * 1.03);
  const chord = chordFn(cs);
  const kinks = cs.map((c) => c[0]);
  const spanTo = (from: number, to: number, k: number): number[] => {
    const out = new Set<number>();
    for (let i = 0; i <= k; i++) out.add(from + ((to - from) * i) / k);
    kinks.forEach((v) => { if (v > from && v < to) out.add(v); });
    return [...out].sort((x, y) => x - y);
  };
  const strip = (ss: number[], map: (s: number) => number): Pt[] => {
    const hi: Pt[] = [], lo: Pt[] = [];
    for (const s of ss) {
      const c = chord(Math.min(sMax, Math.max(sMin, s)));
      if (!c) continue;
      const sp = map(s);
      hi.push([sp * n[0] + c[1] * t[0], sp * n[1] + c[1] * t[1]]);
      lo.push([sp * n[0] + c[0] * t[0], sp * n[1] + c[0] * t[1]]);
    }
    return [...hi, ...lo.reverse()];
  };
  const wrap = (s: number) => (s <= a ? s : s <= a + Math.PI * R ? a + R * Math.sin((s - a) / R) : 2 * a + Math.PI * R - s);
  const thExt = Math.max(0, (sMax - a) / R);                  // how far round the cylinder the free edge has gone
  const thM = Math.min(thExt, Math.PI / 2);
  const front = clipHalf(PAGE, n, a, -1);
  const curve = thM > 0.02 ? strip(spanTo(a, a + R * thM, 12), wrap) : [];
  const back = thExt > Math.PI / 2 ? strip(spanTo(a + (Math.PI / 2) * R, Math.min(sMax, a + Math.PI * R), 14).concat(sMax > a + Math.PI * R ? spanTo(a + Math.PI * R, sMax, 1) : []), wrap) : [];
  return {e, n, a, R, sMax, thExt, thM, front, curve, back, xs: a + R * Math.sin(thM)};
};
// Brightness of the paper back across the roll: flat -> cylinder highlight band -> dark silhouette edge with a thin rim light.
const rollStops = (a: number, R: number): [number, string][] => {
  const stops: [number, string][] = [[a - 3200, ov(0.95)], [a, ov(0.97)]];
  const K = 22;
  for (let i = 1; i <= K; i++) {
    const q = i / K;                                           // 0 at the flat side, 1 at the silhouette
    const th = Math.PI - Math.asin(Math.min(1, q));
    const dif = Math.max(0, Math.sin(th) * 0.3 + -Math.cos(th) * 0.95);
    let v = 0.5 + 0.5 * dif + 0.24 * Math.exp(-(((q - 0.5) / 0.2) ** 2)) - 0.5 * Math.pow(q, 4);
    if (q > 0.955) v += 0.38 * ((q - 0.955) / 0.045);
    stops.push([a + q * R, ov(v)]);
  }
  stops.push([a + R + 0.5, 'rgba(0,0,0,0)']);
  return stops;
};
const PageCurl: React.FC<PP<PageOpts>> = ({children, presentationDirection: dir, presentationProgress: p, presentationDurationInFrames: T, passedProps: {angle = 22, from = 'bottom', back = BACK}}) => {
  const u = useU(p, T);
  const g = curlAt(u, angle, from === 'bottom' ? 1 : -1);
  const [nx, ny] = g.n;
  if (dir === 'entering') {
    // The curl's cast shadow on the page beneath: starts at the roll's silhouette, widens with the height of the roll.
    const S = 120 + 2.6 * g.R, A = 0.66;
    return (
      <AbsoluteFill>
        {children}
        <div style={{...fill, background: alongGradient(g.n, [[g.xs - 8, `rgba(20,12,4,${A})`], [g.xs + S * 0.28, `rgba(20,12,4,${A * 0.5})`], [g.xs + S, 'rgba(20,12,4,0)']])}} />
      </AbsoluteFill>
    );
  }
  // The front surface bending away: the page content squeezed toward the roll, darkening to the silhouette.
  const kk = (g.thM > 0.001 ? Math.sin(g.thM) / g.thM : 1) - 1;
  const squeeze = `matrix(${1 + kk * nx * nx}, ${kk * nx * ny}, ${kk * nx * ny}, ${1 + kk * ny * ny}, ${-kk * g.a * nx}, ${-kk * g.a * ny})`;
  const curveShade = alongGradient(g.n, [[g.a, 'rgba(30,18,6,0)'], [g.a + g.R * Math.sin(g.thM) * 0.6, 'rgba(30,18,6,0.14)'], [g.a + g.R * Math.sin(g.thM), 'rgba(30,18,6,0.6)']]);
  const s0 = g.a + (Math.PI / 2) * g.R;                         // the back's flat part mirrors the front across this line
  const mir = `matrix(${1 - 2 * nx * nx}, ${-2 * nx * ny}, ${-2 * nx * ny}, ${1 - 2 * ny * ny}, ${2 * s0 * nx}, ${2 * s0 * ny})`;
  return (
    <AbsoluteFill style={{zIndex: 2, filter: 'drop-shadow(8px 6px 12px rgba(15,8,0,0.34))'}}>
      <div style={{...fill, clipPath: polyStr(g.front)}}>{children}</div>
      {g.curve.length >= 3 ? (
        <div style={{...fill, clipPath: polyStr(g.curve)}}>
          <div style={{...fill, transformOrigin: '0 0', transform: squeeze}}>{children}</div>
          <div style={{...fill, background: curveShade}} />
        </div>
      ) : null}
      {g.back.length >= 3 ? (
        <div style={{...fill, filter: 'url(#rough) drop-shadow(-4px 5px 10px rgba(15,8,0,0.5))'}}>
          <div style={{...fill, clipPath: polyStr(g.back)}}>
            <div style={{...fill, backgroundColor: back, ...GRAIN_BG}} />
            <div style={{...fill, transformOrigin: '0 0', transform: mir, opacity: 0.12, mixBlendMode: 'multiply', filter: 'grayscale(0.7)'}}>{children}</div>
            <div style={{...fill, background: alongGradient(g.n, rollStops(g.a, g.R))}} />
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
const PageTurn: React.FC<PP<PageOpts>> = (props) => (props.passedProps.style === 'fold' ? <PageFold {...props} /> : <PageCurl {...props} />);

// ============================================================ tearAway
type TearOpts = {x?: number; jag?: number; seed?: string};
const tearGeometry = (seed: string, x: number, jag: number) => {
  const step = 16, n = Math.ceil((H + 120) / step);
  const line: Pt[] = [], wl: number[] = [], wr: number[] = [];
  for (let i = 0; i <= n; i++) {
    const y = -60 + i * step;
    const big = Math.sin(y / 230 + random(`${seed}p`) * 6.3) * jag * 0.75 + Math.sin(y / 71 + random(`${seed}q`) * 6.3) * jag * 0.3;
    const fine = (random(`${seed}f${i}`) - 0.5) * 12 + (random(`${seed}t${i}`) > 0.86 ? (random(`${seed}s${i}`) - 0.5) * 34 : 0);
    line.push([x + big + fine, y]);
    wl.push(8 + random(`${seed}l${i}`) * 20);
    wr.push(8 + random(`${seed}r${i}`) * 20);
  }
  return {line, wl, wr};
};
const TEAR_WHITE = '#F7F3EA';
const TearHalf: React.FC<{side: -1 | 1; geo: ReturnType<typeof tearGeometry>; yf: number; x: number; tf: string; children: React.ReactNode}> = ({side, geo, yf, x, tf, children}) => {
  const {line, wl, wr} = geo;
  const wid = side < 0 ? wl : wr;
  const far = side < 0 ? -90 : W + 90;
  const white: Pt[] = [[far, -90], ...line, [far, H + 90]];
  const scene: Pt[] = [[far, -90], ...line.map(([px, py], i): Pt => [px + side * wid[i] * cl01((yf - py) / 70), py]), [far, H + 90]];
  return (
    <div style={{...fill, transformOrigin: `${x}px ${H}px`, transform: tf, filter: 'drop-shadow(0px 14px 18px rgba(15,8,0,0.42))'}}>
      <div style={{...fill, filter: 'url(#torn)'}}>
        <div style={{...fill, clipPath: polyStr(white), backgroundColor: TEAR_WHITE, ...GRAIN_BG}} />
      </div>
      <div style={{...fill, clipPath: polyStr(scene)}}>{children}</div>
    </div>
  );
};
const TearAway: React.FC<PP<TearOpts>> = ({children, presentationDirection: dir, presentationProgress: p, presentationDurationInFrames: T, passedProps: {x = 540, jag = 34, seed = 'tear'}}) => {
  const u = useU(p, T);
  const geo = useMemo(() => tearGeometry(seed, x, jag), [seed, x, jag]);
  if (dir === 'entering') return <AbsoluteFill>{children}<div style={{...fill, background: '#0F0800', opacity: 0.38 * (1 - u)}} /></AbsoluteFill>;
  const yf = -60 + (H + 400) * cl01(u / 0.28);          // the tear tip runs down the sheet first
  const th = 21 * Math.pow(u, 1.5);                      // then the halves open like a V, hinged at the bottom
  const v = cl01((u - 0.12) / 0.88), fall = Math.pow(v, 2.3);
  const tfL = `translate(${-(60 * v + 170 * fall)}px, ${1950 * fall}px) rotate(${-th}deg)`;
  const tfR = `translate(${70 * v + 190 * fall}px, ${2100 * fall}px) rotate(${th * 1.15}deg)`;
  return (
    <AbsoluteFill style={{zIndex: 2}}>
      <TearHalf side={-1} geo={geo} yf={yf} x={x} tf={tfL}>{children}</TearHalf>
      <TearHalf side={1} geo={geo} yf={yf} x={x} tf={tfR}>{children}</TearHalf>
    </AbsoluteFill>
  );
};

// ============================================================ tapePull
type TapeOpts = {y?: number; label?: string};
const TAPE_HI = '#D8CA9E', TAPE_LO = '#B2A06C', INK = '#1F1D17';
const TapeStrip: React.FC<{y: number; label?: string; u: number}> = ({y, label, u}) => {
  const w = 760, h = 150;
  const slap = interpolate(u, [0, 0.12], [1.35, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const peel = interpolate(u, [0.05, 0.35], [0, 1], clamp);   // the free end lifts as the yank starts
  const teeth = (side: 'l' | 'r'): string => Array.from({length: 11}, (_, i) => (side === 'l' ? `${i % 2 ? 10 : 0}px ${(i * 100) / 10}%` : `calc(100% - ${i % 2 ? 10 : 0}px) ${((10 - i) * 100) / 10}%`)).join(', ');
  const poly = `polygon(${teeth('l')}, ${teeth('r')})`;
  return (
    <div style={{position: 'absolute', left: W / 2 - w / 2, top: y - h / 2, width: w, height: h, rotate: `${-2.4 - 7 * peel}deg`, scale: String(slap), transformOrigin: '100% 50%', filter: 'drop-shadow(2px 6px 7px rgba(15,8,0,0.4))'}}>
      <div style={{...fill, clipPath: poly, backgroundColor: C.tape, ...GRAIN_BG}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: '17%', background: TAPE_HI, opacity: 0.85}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: '17%', background: TAPE_LO, opacity: 0.8}} />
        {label ? (
          <div style={{...fill, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: 'url(#torn)'}}>
            <span style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 118, color: INK, letterSpacing: '0.04em', transform: 'translateY(-4px)'}}>{label}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
const TapePull: React.FC<PP<TapeOpts>> = ({children, presentationDirection: dir, presentationProgress: p, presentationDurationInFrames: T, passedProps: {y = 175, label}}) => {
  const u = useU(p, T);
  if (dir === 'entering') return <AbsoluteFill>{children}<div style={{...fill, background: '#0F0800', opacity: 0.34 * (1 - u)}} /></AbsoluteFill>;
  const v = cl01((u - 0.1) / 0.9);
  const dip = interpolate(u, [0, 0.1], [0, 12], {...clamp, easing: Easing.out(Easing.quad)}) * (1 - cl01((u - 0.1) / 0.08));
  const ty = dip - (H + 460) * Math.pow(v, 1.9);
  const rot = -10 * Math.pow(v, 1.3);
  const flap = 15 * Math.sin(Math.PI * cl01(v * 1.25)) * (1 - 0.3 * v);
  return (
    <AbsoluteFill style={{zIndex: 2}}>
      <div style={{...fill, transformOrigin: `760px ${y}px`, transform: `translateY(${ty}px) perspective(2400px) rotateX(${flap}deg) rotate(${rot}deg)`, filter: 'drop-shadow(0px 22px 26px rgba(15,8,0,0.45))'}}>
        <div style={{...fill, borderRadius: 14, overflow: 'hidden'}}>{children}</div>
        <TapeStrip y={y} label={label} u={u} />
      </div>
    </AbsoluteFill>
  );
};

// ============================================================ stampCut
type StampOpts = {x?: number; y?: number; ink?: string};
const SW = 640, SH = 760;
const WOOD = {beech: '#D8B684', beechHi: '#EBD3AC', beechLo: '#B58F5A', beechSide: '#A98350', walnut: '#8A5A36', walnutHi: '#A87248', walnutLo: '#6B4326', knob: '#9A6741', knobHi: '#BC875D', knobLo: '#744A2B'};
// A face of the stamp, given as a polygon in the stamp's own coordinates (origin = middle of the rubber's bottom edge, y up is negative).
const OX = 560, OY = 820;
const Face: React.FC<{pts: Pt[]; color: string; opacity?: number}> = ({pts, color, opacity = 1}) => (
  <div style={{position: 'absolute', left: -OX, top: -OY, width: 2 * OX, height: OY + 80, clipPath: polyStr(pts.map(([x, y]): Pt => [x + OX, y + OY])), backgroundColor: color, opacity, ...GRAIN_BG}} />
);
// A paper rubber stamp in 3/4 view: wooden knob, turned neck, beech block (front, top and side faces), rubber pad wet with ink.
const StampTool: React.FC<{ink: string}> = ({ink}) => (
  <>
    <Face pts={[[-300, -10], [300, -10], [300, 2], [-300, 2]]} color={ink} />
    <Slab x={-300} y={-58} w={600} h={52} color="#3A2E2A" shade="#241B18" shadeH={0.3} r={8} />
    <Face pts={[[-336, -58], [336, -58], [336, -232], [-336, -232]]} color={WOOD.beech} />
    <Face pts={[[-336, -58], [336, -58], [336, -86], [-336, -86]]} color={WOOD.beechLo} opacity={0.55} />
    <Face pts={[[-336, -232], [336, -232], [412, -268], [-262, -268]]} color={WOOD.beechHi} />
    <Face pts={[[336, -232], [412, -268], [412, -94], [336, -58]]} color={WOOD.beechSide} />
    {/* neck: turned walnut, flaring at both ends */}
    <Face pts={[[-70, -262], [150, -262], [112, -440], [-32, -440]]} color={WOOD.walnut} />
    <Face pts={[[-70, -262], [-24, -262], [-14, -440], [-32, -440]]} color={WOOD.walnutHi} />
    <Face pts={[[104, -262], [150, -262], [112, -440], [96, -440]]} color={WOOD.walnutLo} />
    {/* knob */}
    <Slab x={-96} y={-612} w={300} h={196} r="50%" color={WOOD.knob} shade={WOOD.knobLo} shadeH={0.34} />
    <Slab x={-50} y={-590} w={150} h={70} r="50%" color={WOOD.knobHi} style={{opacity: 0.75}} />
  </>
);
// Wavering ink: rough edge, uneven density and a few dry specks, like a real rubber stamp pressed by hand.
const InkDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id="tr-ink" x="-6%" y="-6%" width="112%" height="112%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={3} seed={21} result="n1" />
      <feDisplacementMap in="SourceGraphic" in2="n1" scale={10} xChannelSelector="R" yChannelSelector="G" result="rough" />
      <feTurbulence type="fractalNoise" baseFrequency="0.011 0.018" numOctaves={2} seed={5} result="n2" />
      <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.4 -0.45" result="density" />
      <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={1} seed={9} result="n3" />
      <feColorMatrix in="n3" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 14 -4.9" result="specks" />
      <feComposite in="rough" in2="density" operator="in" result="d1" />
      <feComposite in="d1" in2="specks" operator="in" />
    </filter>
  </svg>
);
const StampCut: React.FC<PP<StampOpts>> = ({children, presentationDirection: dir, presentationProgress: p, presentationDurationInFrames: T, passedProps: {x = 540, y = 930, ink = C.tag}}) => {
  const u = useU(p, T);
  const hit = 0.27;
  // a short hard shake right after the thump (alternating each frame, dying out)
  const shk = cl01((u - hit + 0.01) / 0.01) * (1 - cl01((u - hit) / 0.2));
  const fi = Math.floor(u * T), sgn = fi % 2 ? 1 : -1;
  const sx = sgn * 15 * shk, sy = -sgn * 9 * shk;
  if (dir === 'exiting') return <AbsoluteFill style={{translate: `${sx}px ${sy}px`}}>{children}</AbsoluteFill>;
  // the stamp: drops in from above (accelerating), squashes on the page, springs up and out the top. One pass, no fade.
  const drop = Easing.in(Easing.cubic)(cl01(u / hit));
  const rise = Easing.in(Easing.quad)(cl01((u - hit - 0.07) / 0.2));
  const off = u < hit ? -(y - 200) * (1 - drop) : -(y + 900) * rise;
  const sq = u < hit ? 0 : u < hit + 0.05 ? 1 : 1 - cl01((u - hit - 0.05) / 0.06);
  const stretch = u < hit ? 0.1 * drop : 0.12 * rise;
  const stampT = `translate(${x}px, ${y + off}px) scale(${1 + 0.1 * sq - stretch * 0.5}, ${1 - 0.15 * sq + stretch})`;
  const open = u >= hit;
  const w = cl01((u - hit - 0.2) / 0.55);
  const ew = Easing.inOut(Easing.cubic)(w);
  const zs = 1 + 3.4 * ew;                                  // window scale on screen: ink outline -> past the frame
  const rot = -4 * (1 - ew);
  const pc = Easing.out(Easing.cubic)(cl01(w / 0.5));
  const cs = 0.62 + 0.38 * pc;                              // the incoming scene's own scale inside the impression (full size and home by w 0.5)
  // its centre drifts from the stamp's centre (x, y) to the frame centre, so it lands exactly in place (it used to land ~30 x zoom px low)
  const gx = (W / 2 - x) * pc, gy = (H / 2 - y) * pc;
  // The ink outline is gone before it can reach the frame edge (no red bands); by then a full-frame copy of the incoming scene sits under the
  // window, so the last frames land clean instead of showing a strip of the outgoing scene round the window's edge.
  const inkA = 1 - smooth(cl01((w - 0.15) / 0.3));
  const backA = cl01((w - 0.3) / 0.15);
  const bx = x + gx - W / 2, by = y + gy - H / 2;
  const wl = x - SW / 2, wt = y - SH / 2;
  return (
    <AbsoluteFill style={{translate: `${sx}px ${sy}px`}}>
      <InkDefs />
      {/* the incoming scene, seen inside the ink impression */}
      <div style={{position: 'absolute', left: wl, top: wt, width: SW, height: SH, borderRadius: 52, overflow: 'hidden', visibility: open ? 'visible' : 'hidden', transform: `rotate(${rot}deg) scale(${zs})`}}>
        <div style={{position: 'absolute', left: SW / 2 - W / 2 + gx / zs, top: SH / 2 - H / 2 + gy / zs, width: W, height: H, transform: `rotate(${-rot}deg) scale(${cs / zs})`}}>{children}</div>
      </div>
      {backA > 0 ? <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: backA, transform: `translate(${bx}px, ${by}px) scale(${cs})`}}>{children}</div> : null}
      {/* the impression: a double ink line, rough and uneven */}
      {open && inkA > 0 ? (
        <div style={{position: 'absolute', left: wl, top: wt, width: SW, height: SH, transform: `rotate(${rot}deg) scale(${zs})`, opacity: inkA, filter: 'url(#tr-ink)'}}>
          <div style={{...fill, border: `22px solid ${ink}`, borderRadius: 52, boxSizing: 'border-box'}} />
          <div style={{position: 'absolute', inset: 40, border: `9px solid ${ink}`, borderRadius: 28, boxSizing: 'border-box'}} />
        </div>
      ) : null}
      {/* the stamp */}
      {off > -(y + 880) ? (
        <Paper lift={16}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformOrigin: '0 0', transform: stampT}}>
            <StampTool ink={ink} />
          </div>
        </Paper>
      ) : null}
    </AbsoluteFill>
  );
};

// ============================================================ infiniteZoom (Droste)
type DrosteOpts = {levels?: number; x?: number; y?: number; w?: number; bezel?: string};
const EASE_DROSTE = Easing.bezier(0.45, 0, 0.6, 0.9);
// A paper screen (rounded bezel) around the window rectangle (fx, fy, fw, fh), drawn in the scene's own coordinates.
const Bezel: React.FC<{fx: number; fy: number; fw: number; fh: number; color: string; r: number}> = ({fx, fy, fw, fh, color, r}) => (
  <div style={{position: 'absolute', left: fx - 30, top: fy - 30, width: fw + 60, height: fh + 60, borderRadius: r + 30, backgroundColor: color, ...GRAIN_BG, filter: 'url(#rough)', boxShadow: '0 18px 40px rgba(15,8,0,0.5), inset 3px 3px 0 rgba(255,255,255,0.14)'}} />
);
const Droste: React.FC<PP<DrosteOpts>> = ({children, presentationDirection: dir, presentationProgress: p, presentationDurationInFrames: T, passedProps: {levels = 2, x = 540, y = 1000, w = 560, bezel = '#2B2723'}}) => {
  const u = useU(p, T);
  const N = Math.max(1, Math.round(levels));
  // The window shows the scene scaled by s into the rect (fx, fy, w, fh); A(p) = (fx, fy) + s p has the fixed point c*, and level k
  // is the scene scaled by s^k about c*. Zooming z levels in is a scale of s^(k - z) about c*: z = 1 puts level 1 exactly where level 0 was.
  const s = w / W, fh = H * s, fx = x - w / 2, fy = y - fh / 2;
  const cx = fx / (1 - s), cy = fy / (1 - s);
  const z = N * EASE_DROSTE(Math.min(1, u * 1.03));
  const reveal = smooth(cl01(u / 0.1));
  const R0 = 34;
  const origin = `${cx}px ${cy}px`;
  const layer = (k: number) => {
    const sc = Math.pow(s, k - z);
    const r = k > 0 ? (R0 / s) * cl01((1 - sc) / (1 - s)) : 0;     // rounded window corners, squaring off as the level fills the frame
    return {sc, clip: k > 0 ? `inset(0px round ${r.toFixed(1)}px)` : undefined};
  };
  const recess = <div style={{...fill, boxShadow: 'inset 0 0 90px rgba(15,8,0,0.5)'}} />;
  if (dir === 'exiting') {
    const k0 = Math.floor(z + 1e-6);
    const ks: number[] = [];
    for (let k = k0; k < N && k <= k0 + 3; k++) ks.push(k);
    return (
      <AbsoluteFill>
        {ks.map((k) => {
          const {sc, clip} = layer(k);
          return (
            <div key={k} style={{...fill, transformOrigin: origin, transform: `scale(${sc})`, clipPath: clip, opacity: k > 0 ? reveal : 1}}>
              {children}
              {k > 0 ? recess : null}
              <div style={{...fill, opacity: k > 0 ? 1 : reveal}}><Bezel fx={fx} fy={fy} fw={w} fh={fh} color={bezel} r={R0} /></div>
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }
  const {sc, clip} = layer(N);
  return (
    <AbsoluteFill>
      <div style={{...fill, transformOrigin: origin, transform: `scale(${sc})`, clipPath: clip, opacity: reveal}}>{children}{recess}</div>
    </AbsoluteFill>
  );
};

// ============================================================ popUpBook
type PopOpts = {style?: 'dim' | 'kraft'};
const GUT = 1420;                                           // the gutter: where the wall stands up from the base page
const POP_LAYERS = [
  {top: 0, bottom: GUT, hinge: GUT, a: 0.08, b: 0.52, z: 0},       // the backdrop (wall)
  {top: 640, bottom: 1500, hinge: 1500, a: 0.16, b: 0.62, z: 130},  // the props zone, standing in front
  {top: 1060, bottom: 1580, hinge: 1580, a: 0.24, b: 0.72, z: 260}, // the foreground
];
const EASE_POP = Easing.out(Easing.back(1.7));
const COVER = '#7B5636', PAGE_CREAM = '#EFE6D4';
// The pop-up rig: the set (children) cut into three cards that rise out of the open book's gutter, each hinged at its own line.
// The book's lower page then slides down out of frame, uncovering the set's own floor.
const PAGE_BARS = Array.from({length: 11}, (_, i) => ({y: GUT + 250 + i * 46, w: 520 + ((i * 97) % 330), x: i % 5 === 4 ? 150 : 110}));
const PopUpStage: React.FC<{u: number; children: React.ReactNode}> = ({u, children}) => {
  const drop = smooth(cl01((u - 0.56) / 0.3));
  const slide = (1 - Easing.out(Easing.cubic)(cl01(u / 0.26))) * 560;
  const sc = 0.86 + 0.14 * Easing.inOut(Easing.cubic)(cl01(u / 0.85));
  const thetas = POP_LAYERS.map((L) => 90 * (1 - EASE_POP(cl01((u - L.a) / (L.b - L.a)))));
  return (
    <div style={{...fill, transformOrigin: '50% 72%', transform: `translateY(${slide}px) scale(${sc})`}}>
      <div style={{...fill, perspective: 2100, perspectiveOrigin: '50% 12%'}}>
        <div style={{...fill, clipPath: `inset(${GUT}px 0px 0px 0px)`}}>{children}</div>
        {/* the open book: back page lying flat behind the gutter until the wall stands up, base page in front */}
        <div style={{...fill, opacity: 1 - smooth(cl01((u - 0.4) / 0.2))}}>
          <div style={{position: 'absolute', left: -44, right: -44, top: 0, height: GUT, transformOrigin: `50% ${GUT}px`, transform: 'rotateX(89.6deg)', background: COVER, ...GRAIN_BG}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: GUT, transformOrigin: `50% ${GUT}px`, transform: 'rotateX(89.6deg)', background: PAGE_CREAM, ...GRAIN_BG}} />
        </div>
        <div style={{...fill, transform: `translateY(${(drop * 900).toFixed(1)}px)`}}>
          <div style={{position: 'absolute', left: -44, right: -44, top: GUT - 30, height: 1200, background: COVER, ...GRAIN_BG, boxShadow: '0 -6px 30px rgba(15,8,0,0.5)'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: GUT, height: 1200, background: PAGE_CREAM, ...GRAIN_BG}} />
          {PAGE_BARS.map((b, i) => <div key={i} style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: 12, borderRadius: 6, background: 'rgba(90,70,48,0.2)'}} />)}
          <div style={{position: 'absolute', left: 0, right: 0, top: GUT, height: 200, background: 'linear-gradient(rgba(60,38,14,0.36), rgba(60,38,14,0))'}} />
          {/* paper-fold shadows on the base page, one per hinge */}
          {POP_LAYERS.map((L, i) => {
            const sn = Math.sin((Math.max(0, thetas[i]) * Math.PI) / 180);
            return <div key={i} style={{position: 'absolute', left: 0, right: 0, top: L.hinge, height: 40 + 190 * sn, background: `linear-gradient(rgba(15,8,0,${(0.5 * sn).toFixed(3)}), rgba(15,8,0,0))`}} />;
          })}
        </div>
        {POP_LAYERS.map((L, i) => {
          const th = thetas[i], sn = Math.sin((Math.max(0, th) * Math.PI) / 180);
          const z = L.z * cl01(th / 90);
          return (
            <div key={`l${i}`} style={{...fill, clipPath: `inset(${L.top}px 0px ${H - L.bottom}px 0px)`, transformOrigin: `50% ${L.hinge}px`, transform: `translateZ(${z.toFixed(1)}px) rotateX(${th.toFixed(2)}deg)`}}>
              {children}
              <div style={{...fill, background: '#0F0800', opacity: 0.42 * sn}} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
const PopUpBook: React.FC<PP<PopOpts>> = ({children, presentationDirection: dir, presentationProgress: p, presentationDurationInFrames: T, passedProps: {style = 'dim'}}) => {
  const u = useU(p, T);
  const k = style === 'kraft' ? 1 : 0;
  if (dir === 'exiting') return <AbsoluteFill>{children}</AbsoluteFill>;
  const e = cl01(u / 0.93);
  return (
    <AbsoluteFill>
      <div style={{...fill, background: k ? KRAFT : '#150C04', opacity: (k ? 1 : 0.62) * smooth(cl01(u / 0.14)) * (1 - smooth(cl01((u - 0.78) / 0.2)))}} />
      <PopUpStage u={e}>{children}</PopUpStage>
    </AbsoluteFill>
  );
};

// ============================================================ keyhole
type KeyholeOpts = {x?: number; y?: number; x2?: number; y2?: number; ink?: string};
const EASE_KH_IN = Easing.in(Easing.quad), EASE_KH_OUT = Easing.out(Easing.quad);
const KH_PAD = 40;                                          // the card is bigger than the frame, so its torn edge never shows at the frame edge
// Keyhole outline, circle radius r: circle (cx, cy) plus a slot from the centre down 2.6r, 0.9r wide at the top, 1.5r at the bottom.
const keyholeD = (cx: number, cy: number, r: number) => {
  const dy = Math.sqrt(1 - 0.45 * 0.45) * r;
  return `M ${(cx - 0.45 * r).toFixed(1)} ${(cy + dy).toFixed(1)} L ${(cx - 0.75 * r).toFixed(1)} ${(cy + 2.6 * r).toFixed(1)} L ${(cx + 0.75 * r).toFixed(1)} ${(cy + 2.6 * r).toFixed(1)} L ${(cx + 0.45 * r).toFixed(1)} ${(cy + dy).toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(cx - 0.45 * r).toFixed(1)} ${(cy + dy).toFixed(1)} Z`;
};
const inKeyhole = (px: number, py: number, cx: number, cy: number, r: number) => {
  if ((px - cx) ** 2 + (py - cy) ** 2 <= r * r) return true;
  const t = (py - cy) / (2.6 * r);
  return t >= 0 && t <= 1 && Math.abs(px - cx) <= (0.45 + 0.3 * t) * r;
};
// A radius whose keyhole, centred on (x, y), covers the whole frame with room to spare (the smallest covering radius x 1.35), so the card is gone, not just mostly gone.
const keyholeFull = (x: number, y: number) => {
  const pts: Pt[] = [];
  for (let a = 0; a <= W; a += 90) { pts.push([a, 0], [a, H]); }
  for (let b = 0; b <= H; b += 90) { pts.push([0, b], [W, b]); }
  let lo = 100, hi = 6000;
  for (let i = 0; i < 28; i++) {
    const m = (lo + hi) / 2;
    const cy = y - 0.8 * m;
    if (pts.every(([a, b]) => inKeyhole(a, b, x, cy, m))) hi = m; else lo = m;
  }
  return hi * 1.35;                                         // a margin, so the first and last frames are clean and the slot's slanted edges start off-screen
};
// The black paper card with a keyhole window. (x, y) is the middle of the keyhole's height; r = 0 is a solid card.
const KeyholeCard: React.FC<{x: number; y: number; r: number; ink: string}> = ({x, y, r, ink}) => {
  const hole = r > 0.5;
  const cx = x + KH_PAD, cy = y - 0.8 * r + KH_PAD;
  const BW = W + 2 * KH_PAD, BH = H + 2 * KH_PAD;
  const d = hole ? keyholeD(cx, cy, r) : '';
  const clip = hole ? `path(evenodd, 'M 0 0 H ${BW} V ${BH} H 0 Z ${d}')` : undefined;
  return (
    <div style={{position: 'absolute', left: -KH_PAD, top: -KH_PAD, width: BW, height: BH, filter: 'url(#torn) drop-shadow(0px 6px 22px rgba(0,0,0,0.6))'}}>
      <div style={{...fill, backgroundColor: ink, ...GRAIN_BG, clipPath: clip}}>
        {hole ? (
          <svg width={BW} height={BH} style={{position: 'absolute', left: 0, top: 0}}>
            {/* the cut edge: a lighter brown lip of paper thickness (only the card half of each stroke survives the clip), brightest on the top-left */}
            <path d={d} fill="none" stroke="#6B4A31" strokeWidth={9} strokeLinejoin="round" />
            <path d={d} fill="none" stroke="#A67B52" strokeWidth={3.2} strokeLinejoin="round" transform="translate(-0.8 -1.2)" opacity={0.85} />
          </svg>
        ) : null}
      </div>
    </div>
  );
};
const Keyhole: React.FC<PP<KeyholeOpts>> = ({children, presentationDirection: dir, presentationProgress: p, presentationDurationInFrames: T, passedProps: {x = 540, y = 900, x2, y2, ink = '#120D0A'}}) => {
  const u = useU(p, T);
  const hold = Math.min(0.3, 2 / T);                        // ~2 frames of solid black between close and open
  const shut = (1 - hold) / 2, reopen = shut + hold;
  const exiting = dir === 'exiting';
  if (exiting) {
    // closing: the window shrinks over the outgoing scene (slow in, then it snaps shut), then plain black until the reopen starts
    if (u >= reopen) return <AbsoluteFill style={{background: ink}} />;
    const R = keyholeFull(x, y);
    const r = u >= shut ? 0 : R * (1 - EASE_KH_IN(cl01(u / shut)));
    return (
      <AbsoluteFill style={{background: ink}}>
        {r > 0.5 ? <AbsoluteFill>{children}</AbsoluteFill> : null}
        <KeyholeCard x={x} y={y} r={r} ink={ink} />
      </AbsoluteFill>
    );
  }
  if (u < reopen) return <AbsoluteFill />;
  // opening: the window grows over the incoming scene (fast out, easing to the frame), and the scene settles from 1.04 to 1
  const ox = x2 ?? x, oy = y2 ?? y;
  const v = cl01((u - reopen) / (1 - reopen));
  const R = keyholeFull(ox, oy);
  const r = R * EASE_KH_OUT(v);
  return (
    <AbsoluteFill style={{background: ink}}>
      <AbsoluteFill style={{transformOrigin: `${ox}px ${oy}px`, transform: `scale(${1 + 0.04 * (1 - EASE_KH_OUT(v))})`}}>{children}</AbsoluteFill>
      {v < 1 && r < R * 0.999 ? <KeyholeCard x={ox} y={oy} r={r} ink={ink} /> : null}
    </AbsoluteFill>
  );
};

// ============================================================ burnAway
type BurnOpts = {x?: number; y?: number; seed?: string};
const BURN_N = 168;                                         // samples around the ignition point
// Circular value noise, 0..1, a = fraction of the turn: three octaves (5, 11, 27 lobes) so the front has fingers AND teeth.
const circNoise = (seed: string, a: number) => {
  let sum = 0;
  for (const [fq, w] of [[5, 0.5], [11, 0.3], [27, 0.2]] as const) {
    const q = a * fq, k = Math.floor(q), fr = q - k, sm = fr * fr * (3 - 2 * fr);
    const r0 = random(`${seed}b${fq}-${k % fq}`), r1 = random(`${seed}b${fq}-${(k + 1) % fq}`);
    sum += w * (r0 + (r1 - r0) * sm);
  }
  return sum;
};
// The two edges of the burn at angle fraction a and progress v: rc = where the paper starts to char, rb = where the char has fallen away (the hole).
const burnEdge = (seed: string, a: number, v: number, rmax: number, i: number) => {
  const n = circNoise(seed, a), lag = 0.6;
  const local = cl01(v * (1 + lag) - lag * n);              // the high-noise directions ignite late, but everything is gone by v = 1
  const e = local * (0.55 + 0.45 * local);
  const rc = (rmax + 140) * e;
  const wc = (36 + 74 * circNoise(`${seed}w`, a)) * cl01(local * 7);
  const rb = Math.max(0, rc - wc - (random(`${seed}j${i}`) - 0.5) * 12);
  return {rc, rb};
};
const burnPath = (r: number[], cx: number, cy: number) => r.map((d, i) => {
  const th = (i / BURN_N) * Math.PI * 2;
  return `${i ? 'L' : 'M'}${(cx + Math.cos(th) * d).toFixed(1)} ${(cy + Math.sin(th) * d).toFixed(1)}`;
}).join(' ') + ' Z';
const EMBERS = 46;
const Burn: React.FC<PP<BurnOpts>> = ({children, presentationDirection: dir, presentationProgress: p, presentationDurationInFrames: T, passedProps: {x = 540, y = 1500, seed = 'burn'}}) => {
  const f = useCurrentFrame();
  const u = useU(p, T);
  const v = cl01(u / (1 - 0.5 / T));                        // the last frame sampled at u = (T - .5) / T is fully burnt away
  if (dir === 'entering') {
    // the incoming scene catches a faint warm light from the fire
    return (
      <AbsoluteFill>
        {children}
        <div style={{...fill, background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,120,30,${(0.26 * (1 - v)).toFixed(3)}) 0px, rgba(255,90,20,${(0.1 * (1 - v)).toFixed(3)}) 900px, rgba(255,90,20,0) 1700px)`, mixBlendMode: 'screen'}} />
      </AbsoluteFill>
    );
  }
  const rmax = Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y)) + 20;
  const edges = Array.from({length: BURN_N}, (_, i) => burnEdge(seed, i / BURN_N, v, rmax, i));
  const rc = edges.map((e) => e.rc), rb = edges.map((e) => e.rb);
  const off = (r: number[], d: number) => r.map((q) => Math.max(0, q + d));
  const hole = burnPath(rb, x, y);
  const ring = (a: number[], b: number[]) => `${burnPath(a, x, y)} ${burnPath(b, x, y)}`;
  const flick = 0.82 + 0.18 * random(`${seed}fl${f}`);
  // embers and ash lifting off the front: born where the front passes at birth time, then drift up and fade
  const bits = Array.from({length: EMBERS}, (_, j) => {
    const a = random(`${seed}ea${j}`), vb = 0.06 + 0.82 * random(`${seed}ev${j}`), s = (v - vb) / (0.2 + 0.14 * random(`${seed}el${j}`));
    if (s < 0 || s >= 1) return null;
    const ed = burnEdge(seed, a, vb, rmax, Math.floor(a * BURN_N)), th = a * Math.PI * 2;
    const r0 = ed.rc - random(`${seed}ei${j}`) * (ed.rc - ed.rb);
    const bx = x + Math.cos(th) * r0 + (random(`${seed}ex${j}`) - 0.5) * 150 * s + Math.sin(s * 9 + j) * 14 * s;
    const by = y + Math.sin(th) * r0 - (90 + 230 * random(`${seed}ey${j}`)) * s;
    return {j, bx, by, s, ash: j % 3 === 0, size: 3 + 5 * random(`${seed}es${j}`), rot: random(`${seed}er${j}`) * 360 + s * 200};
  });
  return (
    <AbsoluteFill style={{zIndex: 2}}>
      <div style={{...fill, clipPath: `path(evenodd, 'M0 0 H${W} V${H} H0 Z ${hole}')`}}>{children}</div>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <filter id="burnB3" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3" /></filter>
          <filter id="burnB6" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="6" /></filter>
          <filter id="burnB14" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="14" /></filter>
          <filter id="burnB28" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="28" /></filter>
          <clipPath id="burnHole"><path d={hole} /></clipPath>
        </defs>
        {/* warm light thrown from the burning edge onto the incoming scene, only inside the hole */}
        <g clipPath="url(#burnHole)" style={{mixBlendMode: 'screen'}}>
          <path d={hole} fill="none" stroke="#FF7A22" strokeWidth={80} opacity={0.34 * flick * (1 - 0.5 * v)} filter="url(#burnB28)" />
        </g>
        {/* scorched, browning paper just outside the front */}
        <path d={ring(off(rc, 56), off(rc, -6))} fillRule="evenodd" fill="#331503" opacity={0.75} filter="url(#burnB14)" />
        {/* the char: charcoal paper between the front and the hole, with a crumbly grey ash lip */}
        <path d={ring(rc, rb)} fillRule="evenodd" fill="#19120E" />
        <path d={ring(off(rb, 7), rb)} fillRule="evenodd" fill="#5A4E44" opacity={0.75} />
        {/* heat: dull red char just behind the bright line, then the glowing front itself, patchy like real embers */}
        <path d={ring(rc, off(rc, -30))} fillRule="evenodd" fill="#8A2208" opacity={0.85 * flick} filter="url(#burnB6)" />
        <path d={burnPath(rc, x, y)} fill="none" stroke="#FF5A14" strokeWidth={10} strokeLinejoin="round" strokeDasharray="210 26 120 18 300 34 90 20" strokeDashoffset={f * 17} opacity={0.9 * flick} filter="url(#burnB3)" />
        <path d={burnPath(off(rc, -2), x, y)} fill="none" stroke="#FF9A2E" strokeWidth={6} strokeLinejoin="round" strokeDasharray="210 26 120 18 300 34 90 20" strokeDashoffset={f * 17} opacity={flick} />
        <path d={burnPath(off(rc, -3), x, y)} fill="none" stroke="#FFE08A" strokeWidth={2.4} strokeLinejoin="round" strokeDasharray="150 40 100 30 220 50" strokeDashoffset={f * 23} opacity={flick} />
        {bits.map((b) => b && (
          b.ash
            ? <rect key={b.j} x={-b.size} y={-b.size * 0.6} width={b.size * 2} height={b.size * 1.2} fill="#2B231D" opacity={1 - b.s * b.s} transform={`translate(${b.bx.toFixed(1)} ${b.by.toFixed(1)}) rotate(${b.rot.toFixed(0)})`} />
            : (
              <g key={b.j} opacity={1 - b.s * b.s} transform={`translate(${b.bx.toFixed(1)} ${b.by.toFixed(1)})`}>
                <circle r={b.size * 2.4 * (1 - 0.4 * b.s)} fill="#FF7A22" opacity={0.35} filter="url(#burnB3)" />
                <circle r={b.size * (1 - 0.5 * b.s)} fill={b.s < 0.45 ? '#FFD27A' : '#FF6A1C'} />
              </g>
            )
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ============================================================ public API

// Story beats: whip topic switch, zoomThrough go inside, pageTurn next step, tearAway something breaks, tapePull the default cut, stampCut verdict, infiniteZoom recursion joke, popUpBook chapter or opener, keyhole sneaking in / spying / a heist. Frames, SFX: CUT_DEFAULTS.
export type CutKind = 'whip' | 'zoomThrough' | 'pageTurn' | 'tearAway' | 'tapePull' | 'stampCut' | 'infiniteZoom' | 'popUpBook' | 'keyhole' | 'burnAway';
// Default frames and suggested SFX per kind: whip 7 'whip', zoomThrough 8 'zoom', pageTurn 12 'page-flip', tearAway 10 'rip', tapePull 10 'tape-peel', stampCut 12 'stamp' (+3 frames, on the thump), infiniteZoom 24 'zoom', popUpBook 20 'pop3', keyhole 14 'click' (fire it 5 frames in, as the card shuts), burnAway 14 'burn-away'. Fire the others' SFX on the transition's first frame.
export const CUT_DEFAULTS: Record<CutKind, {frames: number; sfx: string}> = {
  whip: {frames: 7, sfx: 'whip'}, zoomThrough: {frames: 8, sfx: 'zoom'}, pageTurn: {frames: 12, sfx: 'page-flip'},
  tearAway: {frames: 10, sfx: 'rip'}, tapePull: {frames: 10, sfx: 'tape-peel'}, stampCut: {frames: 12, sfx: 'stamp'},
  infiniteZoom: {frames: 24, sfx: 'zoom'}, popUpBook: {frames: 20, sfx: 'pop3'}, keyhole: {frames: 14, sfx: 'click'},
  burnAway: {frames: 14, sfx: 'burn-away'},
};
// whip, 7 frames, SFX whip: the outgoing scene shoots off left, the incoming arrives from the right, both with a strong horizontal motion smear. For a fast topic switch or a "meanwhile". blur = peak smear in px (46).
export const whip = (o: {blur?: number; overlap?: number} = {}) => pres(Whip, o);
// zoomThrough, 8 frames, SFX zoom: pushes hard into the focal point (x, y px) of the outgoing scene until it fills the frame and blurs; the incoming scene scales 1.15 -> 1 and unblurs. For going inside a screen, door or mirror.
export const zoomThrough = (o: {x?: number; y?: number; scale?: number; trails?: number} = {}) => pres(ZoomThrough, o);
// pageTurn, 12 frames, SFX page-flip: the outgoing scene is a sheet of paper whose corner curls over like a book page (cylindrical highlight, paper back, cast shadow). For "next step", "turn the page", a new chapter. style 'fold' = flat fold; angle, from.
export const pageTurn = (o: {style?: 'curl' | 'fold'; angle?: number; from?: 'bottom' | 'top'; back?: string} = {}) => pres(PageTurn, o);
// tearAway, 10 frames, SFX rip: the outgoing scene rips in two along a jagged vertical tear (x px, default 540) with white fibrous edges; the halves fall away. For a broken promise, a leak, "ripped off", cancelling something. jag = roughness.
export const tearAway = (o: {x?: number; jag?: number; seed?: string} = {}) => pres(TearAway, o);
// tapePull, 10 frames, SFX tape-peel: a kraft strip (plain, or printed with `label`) slaps across the top of the outgoing sheet (y px, 175) and is yanked up, dragging the sheet off with a tilt and a flap. A good default cut.
export const tapePull = (o: {y?: number; label?: string} = {}) => pres(TapePull, o);
// stampCut, 12 frames, SFX stamp: a 3/4-view paper rubber stamp slams into the middle (x, y px), squashes, shakes the sheet and springs out the top, leaving an inked impression with the incoming scene inside it, which grows to fill the frame. For verdicts: approved, denied, case closed.
export const stampCut = (o: {x?: number; y?: number; ink?: string} = {}) => pres(StampCut, o);
// infiniteZoom, 24 frames, SFX zoom: Droste. A paper screen (x, y, w px) appears in the outgoing scene showing a smaller copy of it; the camera dives through `levels` nested copies (2) and lands in the incoming scene. For recursion jokes: cards in cards, agents spawning agents.
export const infiniteZoom = (o: {levels?: number; x?: number; y?: number; w?: number; bezel?: string} = {}) => pres(Droste, o);
// popUpBook, 20 frames, SFX pop3: the previous scene dims, an open book slides up, and the incoming set rises out of its gutter as three pop-up cards (backdrop, props, foreground) with fold shadows. For a chapter change or "let me show you". style 'kraft' = plain kraft table. Opener on frame 0: <PopUpOpen>.
export const popUpBook = (o: {style?: 'dim' | 'kraft'} = {}) => pres(PopUpBook, o);
// keyhole, 14 frames, SFX click: a heist iris. A near-black paper card closes over the outgoing scene leaving a keyhole window (middle at x, y px) that shrinks until shut, holds ~2 frames on black, then the window re-opens on the incoming scene from (x2, y2) (default x, y) until the card is gone. For sneaking in, spying, a heist. ink = card colour (#120D0A).
export const keyhole = (o: KeyholeOpts = {}) => pres(Keyhole, o);
// burnAway, 14 frames, SFX burn-away: the outgoing scene is paper that catches light. A glowing orange-red scorched edge eats outward from the ignition point (x, y px, default bottom-centre 540, 1500) along an irregular noise-driven front; the burnt paper goes charcoal and falls away to reveal the incoming scene, with embers and ash lifting off the front and a warm glow on the incoming set. For destroying, deleting, burning evidence, "gone". seed = changes the shape of the front.
export const burnAway = (o: BurnOpts = {}) => pres(Burn, o);
// PopUpOpen: the popUpBook as an opener, with no outgoing scene. Wrap the first scene's set: the book is already open on frame 0 (from = starting progress, 0.15) and the set pops up over `dur` frames (20). table = what the book lies on (kraft).
export const PopUpOpen: React.FC<{dur?: number; from?: number; table?: string; children: React.ReactNode}> = ({dur = 20, from = 0.15, table = KRAFT, children}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{...fill, background: table}} />
      <PopUpStage u={cl01(from + (1 - from) * (f / dur))}>{children}</PopUpStage>
    </AbsoluteFill>
  );
};

type CutBase = {frames?: number; align?: 'after' | 'mid' | 'before'};
// One cut: kind + options (whip blur; zoomThrough x, y, scale; pageTurn style, angle, from; tearAway x, jag; tapePull y, label; stampCut x, y, ink; infiniteZoom levels, x, y, w; popUpBook style; keyhole x, y, x2, y2, ink; burnAway x, y, seed), frames (overlap length), align: 'after' (default, plays over the incoming scene's first frames), 'mid' or 'before' (over the outgoing's last frames).
export type CutSpec = CutBase & (({kind: 'whip'} & WhipOpts) | ({kind: 'zoomThrough'} & ZoomOpts) | ({kind: 'pageTurn'} & PageOpts) | ({kind: 'tearAway'} & TearOpts) | ({kind: 'tapePull'} & TapeOpts) | ({kind: 'stampCut'} & StampOpts) | ({kind: 'infiniteZoom'} & DrosteOpts) | ({kind: 'popUpBook'} & PopOpts) | ({kind: 'keyhole'} & KeyholeOpts) | ({kind: 'burnAway'} & BurnOpts));
// One scene of a CutSeries: its id (plan.json), component and plan duration in frames.
export type CutScene = {id: string; component: React.ComponentType; durationInFrames: number};

const presentationOf = (spec: CutSpec): TransitionPresentation<Record<string, unknown>> => {
  const {kind, frames: _f, align: _a, ...opts} = spec;
  void _f; void _a;
  const make = {whip, zoomThrough, pageTurn, tearAway, tapePull, stampCut, infiniteZoom, popUpBook, keyhole, burnAway}[kind] as (o: Record<string, unknown>) => TransitionPresentation<Record<string, unknown>>;
  return make(opts);
};
// The incoming scene plays its own frame 0 at the plan's start frame; the `lead` frames before that hold its frame 0 still.
const Aligned: React.FC<{lead: number; children: React.ReactNode}> = ({lead, children}) => (lead <= 0 ? <>{children}</> : (
  <>
    <Sequence layout="none" durationInFrames={lead}><Freeze frame={0}>{children}</Freeze></Sequence>
    <Sequence layout="none" from={lead}>{children}</Sequence>
  </>
));
// CutSeries: drop-in for <Series> (scenes = {id, component, durationInFrames} from plan.json). cuts = {INCOMING_SCENE_ID: spec}, no entry = hard cut. Every scene's frame 0 stays on its plan.json frame and the total is unchanged: the outgoing scene is padded to play under the overlap, so the VO stays in sync.
// Why: a TransitionSeries overlaps two scenes and so shortens the timeline by the overlap. CutSeries lengthens each outgoing sequence by the overlap (`after`) or holds the incoming frame 0 still before the cut (`mid`, `before`); an outgoing scene therefore plays past its plan duration, so scenes should hold their last pose.
export const CutSeries: React.FC<{scenes: CutScene[]; cuts?: Record<string, CutSpec>}> = ({scenes, cuts = {}}) => {
  const specs = scenes.map((s, i) => (i === 0 ? null : cuts[s.id] ?? null));
  const T = specs.map((sp) => (sp ? Math.max(2, sp.frames ?? CUT_DEFAULTS[sp.kind].frames) : 0));
  const lead = specs.map((sp, i) => (sp ? Math.min(T[i], sp.align === 'before' ? T[i] : sp.align === 'mid' ? Math.round(T[i] / 2) : 0) : 0));
  const kids: React.ReactElement[] = [];
  scenes.forEach((s, i) => {
    const sp = specs[i];
    if (sp) kids.push(<TransitionSeries.Transition key={`t-${s.id}`} timing={linearTiming({durationInFrames: T[i]})} presentation={presentationOf(sp)} />);
    const tail = specs[i + 1] ? T[i + 1] - lead[i + 1] : 0;
    const Scene = s.component;
    kids.push(
      <TransitionSeries.Sequence key={s.id} name={s.id} durationInFrames={lead[i] + s.durationInFrames + tail}>
        <Aligned lead={lead[i]}><Scene /></Aligned>
      </TransitionSeries.Sequence>,
    );
  });
  // isolation keeps the page's z-index (the outgoing sheet rides above the incoming one) from climbing over the banner and captions.
  return <AbsoluteFill style={{isolation: 'isolate'}}><TransitionSeries>{kids}</TransitionSeries></AbsoluteFill>;
};
