// Usage props: the LIMIT gauge (a paper fuel gauge, E to F, with crack and stamp) and the long paper chat scroll
// that conveys along a path. All cut paper (Slab / Disc inside Paper); motion comes from the props the scene passes in.
import React from 'react';
import {random} from 'remotion';
import {C, FONT} from '../tokens';
import {Disc, Paper, Slab} from '../paper/kit';

export type PathPt = [number, number];

const gaugeArc = (cx: number, cy: number, rr: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + Math.cos((a * Math.PI) / 180) * rr, cy + Math.sin((a * Math.PI) / 180) * rr];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0} ${y0} A${rr} ${rr} 0 0 1 ${x1} ${y1}`;
};

/**
 * LIMIT gauge: a paper fuel gauge, E (left, red zone) to F (right), with a needle. (x, y) = the dial's centre; r = radius (150).
 * `level` 0 = E, 1 = F, above 1 = wrapped past F (animate it). `crack` 0-1 draws the glass crack over it, `stamp` = scale of the stamped `stampText`
 * (0 = off, ~2.6 big to 1 landed), `squashY` < 1 squashes the dial from its base (impact), `flash` 0-1 = warm glow behind, `smoke` puffs off the top, `label` = the word under the hub.
 */
export const LimitGauge: React.FC<{x: number; y: number; r?: number; level: number; crack?: number; stamp?: number; stampText?: string; squashY?: number; flash?: number; smoke?: boolean; label?: string}> =
  ({x, y, r = 150, level, crack = 0, stamp = 0, stampText = '10x', squashY = 1, flash = 0, smoke, label = 'LIMIT'}) => {
    const ang = -150 + Math.min(level, 1.35) * 120; // -150 deg = E, -30 deg = F
    const ticks = Array.from({length: 7}, (_, i) => -150 + i * 20);
    const sxs = 1 + (1 - squashY) * 0.9;
    const L = r * 2;
    const path = `M${r * 1.25} ${r * 0.35} L${r * 1.05} ${r * 0.7} L${r * 1.3} ${r * 0.95} L${r * 1.1} ${r * 1.3} M${r * 1.05} ${r * 0.7} L${r * 0.8} ${r * 0.75}`;
    return (
      <>
        {flash > 0.02 && <div style={{position: 'absolute', left: x - r * 2.2, top: y - r * 2.2, width: r * 4.4, height: r * 4.4, opacity: flash, background: 'radial-gradient(circle, rgba(255,246,200,0.95) 0%, rgba(255,200,90,0.45) 38%, rgba(255,150,40,0) 70%)'}} />}
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${x}px ${y + r}px`, scale: `${sxs.toFixed(4)} ${squashY.toFixed(4)}`}}>
          <div style={{position: 'absolute', left: x - r, top: y - r, width: L, height: L}}>
            <Paper lift={5}>
              <Disc x={r} y={r} d={L} color={C.board} shade={C.boardLo} />
              <Disc x={r} y={r} d={r * 1.8} color={C.cream} />
            </Paper>
            <svg width={L} height={L} style={{position: 'absolute', inset: 0}}>
              <path d={gaugeArc(r, r, r * 0.74, -150, -125)} stroke={C.nogo} strokeWidth={r * 0.12} fill="none" />
              {ticks.map((t) => {
                const a = (t * Math.PI) / 180;
                return <line key={t} x1={r + Math.cos(a) * r * 0.62} y1={r + Math.sin(a) * r * 0.62} x2={r + Math.cos(a) * r * 0.8} y2={r + Math.sin(a) * r * 0.8} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />;
              })}
            </svg>
            <div style={{position: 'absolute', left: r * 0.36, top: r * 0.86, font: `900 ${r * 0.26}px ${FONT.label}`, color: C.nogo}}>E</div>
            <div style={{position: 'absolute', right: r * 0.36, top: r * 0.86, font: `900 ${r * 0.26}px ${FONT.label}`, color: C.ink}}>F</div>
            <div style={{position: 'absolute', left: 0, right: 0, top: r * 1.28, textAlign: 'center', font: `800 ${r * 0.2}px ${FONT.label}`, letterSpacing: 2, color: C.ink}}>{label}</div>
            <div style={{position: 'absolute', left: r, top: r - 6, width: r * 0.78, height: 12, background: C.nogo, borderRadius: 6, transformOrigin: '0 50%', rotate: `${ang}deg`, boxShadow: '1px 3px 4px rgba(0,0,0,.35)'}} />
            <Paper lift={3}><Disc x={r} y={r} d={r * 0.28} color={C.ink} /></Paper>
            {smoke && [0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: r * (0.7 + i * 0.25), top: -r * (0.15 + i * 0.22), width: r * (0.45 - i * 0.08), height: r * (0.45 - i * 0.08), borderRadius: '50%', background: '#cfc8c0', opacity: 0.85 - i * 0.2, boxShadow: '0 4px 8px rgba(0,0,0,.2)'}} />)}
          </div>
          {/* the crack lies over the glass and the needle */}
          {crack > 0 && (
            <svg width={L} height={L} style={{position: 'absolute', left: x - r, top: y - r}}>
              <path d={path} pathLength={1} stroke="#fff" strokeWidth={4} fill="none" opacity={0.95} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - crack} />
            </svg>
          )}
          {stamp > 0 && (
            <div style={{position: 'absolute', left: x - r, top: y - r, width: L, height: L, opacity: Math.min(1, stamp > 1.6 ? 0.55 : 1)}}>
              <Paper lift={1}>
                <div style={{position: 'absolute', left: r * 0.5, top: r * 0.38, scale: String(stamp), rotate: '-12deg', font: `900 ${r * 0.42}px ${FONT.banner}`, color: C.nogo,
                  border: `${r * 0.04}px solid ${C.nogo}`, padding: `0 ${r * 0.08}px`, borderRadius: 8, whiteSpace: 'nowrap'}}>{stampText}</div>
              </Paper>
            </div>
          )}
        </div>
      </>
    );
  };

// ---------- path following ----------

const catmull = (p: PathPt[], per = 14): PathPt[] => {
  const q = [p[0], ...p, p[p.length - 1]];
  const out: PathPt[] = [];
  for (let i = 1; i < q.length - 2; i++) {
    const [p0, p1, p2, p3] = [q[i - 1], q[i], q[i + 1], q[i + 2]];
    for (let s = 0; s < per; s++) {
      const t = s / per, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)) as PathPt);
    }
  }
  out.push(p[p.length - 1]);
  return out;
};

export type PathT = {L: number; at: (s: number) => {x: number; y: number; ang: number}};

/** A smooth path through the control points, addressable by arc length s (0..L). */
export const makePath = (ctrl: PathPt[], per = 14): PathT => {
  const dense = catmull(ctrl, per);
  const cum: number[] = [0];
  for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const L = cum[cum.length - 1];
  const pos = (s: number): PathPt => {
    const t = Math.min(L, Math.max(0, s));
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (cum[m] <= t) lo = m; else hi = m;
    }
    const seg = cum[hi] - cum[lo] || 1, k = (t - cum[lo]) / seg;
    return [dense[lo][0] + (dense[hi][0] - dense[lo][0]) * k, dense[lo][1] + (dense[hi][1] - dense[lo][1]) * k];
  };
  const at = (s: number) => {
    const p = pos(s), a = pos(s - 8), b = pos(s + 8);
    return {x: p[0], y: p[1], ang: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI};
  };
  return {L, at};
};

const TINTS = ['#F0E8DC', '#A9C3E2', '#F0E8DC', '#E4B3A8'];

const groupsOf = (seed: string, n: number) => {
  const group: number[] = [], first: boolean[] = [];
  let g = 0, left = 0;
  for (let i = 0; i < n; i++) {
    first.push(left === 0);
    if (left === 0) { g++; left = 5 + Math.floor(random(`${seed}g${g}`) * 5); }
    group.push(g);
    left--;
  }
  return {group, first};
};

/**
 * The long paper chat scroll as a conveyor: chunk i of the strip sits at arc length i*seg + shift along the path, so changing
 * `shift` slides the whole strip along its path (positive = towards the end; chunks past the end vanish, chunks before the start
 * are not drawn yet). `win` draws only chunks whose current arc length is inside [a, b), so a prop can sit between two layers.
 */
export const ScrollFeed: React.FC<{path: PathT; shift?: number; width?: number; seg?: number; seed?: string; lift?: number; win?: [number, number]}> = ({
  path, shift = 0, width = 80, seg = 18, seed = 'scroll', lift = 6, win,
}) => {
  const n = Math.ceil(path.L / seg) + 1;
  const {group, first} = groupsOf(seed, n);
  const L = seg + 12;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const s = i * seg + shift;
    if (s < 0 || s > path.L) continue;
    if (win && (s < win[0] || s >= win[1])) continue;
    const p = path.at(s);
    const side = group[i] % 2;
    out.push(
      <Slab key={i} x={p.x - L / 2} y={p.y - width / 2} w={L} h={width} rot={p.ang} r={2} color={TINTS[group[i] % TINTS.length]} shade={C.creamLo} shadeH={0.1}
        style={{boxShadow: first[i] ? 'inset 3px 0 0 rgba(60,50,40,0.28)' : undefined}}>
        {[0, 1].map((k) => {
          const bh = width * (0.38 + random(`${seed}${i}${k}`) * 0.4);
          return <div key={k} style={{position: 'absolute', left: 6 + k * 12, top: side ? width - bh - width * 0.1 : width * 0.1, width: 6, height: bh, borderRadius: 3, background: '#8F857A'}} />;
        })}
      </Slab>,
    );
  }
  return <Paper lift={lift}>{out}</Paper>;
};

