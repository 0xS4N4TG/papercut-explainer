// Council props: the idea (a paper lightbulb), a flattering AI ("yes-bot"), a four-agent council,
// agent .md files, verdict cards, speech bubbles, a campfire and a skewer. Light from the top-left; everything is paper.
import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {C, FONT} from '../tokens';
import {TapeCorners} from '../paper/tape';
import {Disc, Paper, Pill, Slab, bob} from '../paper/kit';
import {Acc, Critter, Expr} from '../cast/Critter';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- cast ----------
// Every council member is the same clay critter; the role reads from accessory + name-pill colour + held prop.
// Each role gets one colour (red / green / orange / yellow); the pill, the accessory and the file's `color:` line all use it.
export type RoleId = 'skeptic' | 'customer' | 'competitor' | 'investor';
export const ROLE: Record<RoleId, {tag: string; acc: Acc; color: string; lo: string; file: string; job: string}> = {
  skeptic: {tag: 'SKEPTIC', acc: 'glasses', color: '#D9483B', lo: '#A3342A', file: 'skeptic.md', job: 'Find the fatal flaw'},
  customer: {tag: 'CUSTOMER', acc: 'beret', color: '#2E9E5B', lo: '#1F7442', file: 'customer.md', job: 'Would I really pay?'},
  competitor: {tag: 'COMPETITOR', acc: 'visor', color: '#E7782F', lo: '#B0581E', file: 'competitor.md', job: 'How I would crush you'},
  investor: {tag: 'INVESTOR', acc: 'bowtie', color: '#D9A629', lo: '#A57B16', file: 'investor.md', job: 'Does the math work?'},
};
export const ROLES: RoleId[] = ['skeptic', 'customer', 'competitor', 'investor'];

// A council member: Critter with the role's accessory, accessory colour and name pill.
export const Agent: React.FC<{role: RoleId; x: number; y: number; size?: number; expr?: Expr; tag?: boolean;
  armR?: number; armRAngle?: number; armL?: number; armLAngle?: number; lean?: number; lift?: number; face?: 1 | -1; phase?: number; holdR?: React.ReactNode}> =
  ({role, tag = true, size = 200, ...p}) => {
    const r = ROLE[role];
    // visor uses the go-green in Critter; recolour via accColor where the accessory supports it
    return <Critter {...p} size={size} acc={r.acc} accColor={r.color} accShade={r.lo} tag={tag ? r.tag : undefined} tagColor={r.color} />;
  };

// "You": the viewer stand-in, clay with the blue cap.
export const You: React.FC<React.ComponentProps<typeof Critter>> = (p) => <Critter acc="cap" {...p} />;

// The flattering AI ("yes-bot"): a lilac critter in a headset with an "AI" pill. Always eager to agree.
export const YESBOT = {color: '#9A86C2', lo: '#7563A0'};
export const YesBot: React.FC<React.ComponentProps<typeof Critter>> = (p) => (
  <Critter color={YESBOT.color} shade={YESBOT.lo} acc="headset" accColor={C.board} tag="AI" tagColor={C.purple} {...p} />
);

// ---------- the idea: a paper lightbulb ----------
// (x, y) = centre of the glass. lit 0–1 (glow + warm glass), crack 0–1 (a jagged crack draws down the glass),
// patch: a strip of tape over the crack (the improved idea). Rays wiggle while lit.
export const Idea: React.FC<{x: number; y: number; s?: number; lit?: number; crack?: number; patch?: boolean; rot?: number; seed?: string}> =
  ({x, y, s = 1, lit = 1, crack = 0, patch = false, rot = 0, seed = 'idea'}) => {
    const f = useCurrentFrame();
    const d = 150 * s;
    const glass = lit > 0.5 ? '#F6D36B' : '#D9D2C4';
    const glassLo = lit > 0.5 ? '#E3B347' : '#BDB4A3';
    const pts = [[0.52, 0.06], [0.44, 0.28], [0.58, 0.42], [0.47, 0.62], [0.55, 0.8]];
    const n = Math.max(0, Math.min(pts.length, Math.round(crack * pts.length)));
    return (
      <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, rotate: `${rot}deg`}}>
        {lit > 0 ? (
          <div style={{position: 'absolute', left: -d * 1.1, top: -d * 1.1, width: d * 2.2, height: d * 2.2, borderRadius: '50%', opacity: 0.55 * lit,
            background: 'radial-gradient(circle, rgba(255,226,140,0.95) 0%, rgba(255,214,110,0.35) 45%, rgba(255,214,110,0) 70%)'}} />
        ) : null}
        <Paper lift={6}>
          {/* rays */}
          {lit > 0.5 ? Array.from({length: 7}).map((_, i) => {
            const a = -150 + i * 20; const w = Math.round(f / 3) % 2 ? 4 : 0;
            return <div key={i} style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, rotate: `${a}deg`}}>
              <Slab x={d * 0.72 + w} y={-5 * s} w={d * 0.26} h={10 * s} color="#F6D36B" r={5} /></div>;
          }) : null}
          {/* glass */}
          <Slab x={-d / 2} y={-d / 2} w={d} h={d} r="50%" color={glass} shade={glassLo} shadeH={0.22} hi="rgba(255,255,255,0.35)" hiH={0.12}>
            <div style={{position: 'absolute', left: d * 0.2, top: d * 0.16, width: d * 0.16, height: d * 0.3, borderRadius: '50%', background: 'rgba(255,255,255,0.55)', rotate: '20deg'}} />
            {/* filament */}
            <div style={{position: 'absolute', left: d * 0.38, top: d * 0.5, width: d * 0.24, height: d * 0.22, borderRadius: '0 0 50% 50%', border: `${4 * s}px solid ${lit > 0.5 ? '#B4561F' : '#7D766A'}`, borderTop: 'none', boxSizing: 'border-box'}} />
            {/* crack */}
            {n > 1 ? (
              <svg width={d} height={d} style={{position: 'absolute', left: 0, top: 0}}>
                <polyline points={pts.slice(0, n).map(([px, py]) => `${px * d},${py * d}`).join(' ')} fill="none" stroke={C.ink} strokeWidth={5 * s} strokeLinejoin="miter" />
              </svg>
            ) : null}
          </Slab>
          {/* neck + screw base */}
          <Slab x={-d * 0.26} y={d * 0.38} w={d * 0.52} h={d * 0.16} color={glassLo} r={4} />
          {[0, 1, 2].map((i) => <Slab key={i} x={-d * 0.24} y={d * (0.52 + i * 0.1)} w={d * 0.48} h={d * 0.09} color={i % 2 ? C.metalLo : C.metal} r={4} />)}
          <Slab x={-d * 0.12} y={d * 0.81} w={d * 0.24} h={d * 0.08} color={C.inkSoft} r="0 0 40% 40%" />
          {patch ? <Slab x={-d * 0.42} y={d * 0.02} w={d * 0.84} h={d * 0.2} color={C.tape} r={2} rot={-28} style={{opacity: 0.93}} /> : null}
        </Paper>
      </div>
    );
  };

// ---------- paper speech bubble ----------
// (x, y) = top-left. tail: which corner the tail points from ('bl' | 'br' | 'none').
export const Bubble: React.FC<{x: number; y: number; w: number; h: number; text?: string; size?: number; tail?: 'bl' | 'br' | 'none'; color?: string; ink?: string; rot?: number; children?: React.ReactNode}> =
  ({x, y, w, h, text, size = 40, tail = 'bl', color = C.creamHi, ink = C.ink, rot = 0, children}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, rotate: `${rot}deg`}}>
      <Paper lift={5}>
        {tail !== 'none' ? <Slab x={tail === 'bl' ? w * 0.16 : w * 0.7} y={h - 22} w={44} h={44} color={color} r={4} rot={45} /> : null}
        <Slab x={0} y={0} w={w} h={h} color={color} r={Math.min(40, h / 2.4)} shade={C.creamLo} shadeH={0.08}>
          {text ? <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', fontFamily: FONT.banner, fontSize: size, color: ink, lineHeight: 1.05, padding: '0 16px'}}>{text}</div> : null}
          {children}
        </Slab>
      </Paper>
    </div>
  );

// ---------- agent file (.md with YAML frontmatter) ----------
// (x, y) = top-left, w ≈ 300–420. Shows the filename tab, `---`, name / description / color, `---`, then body bars.
export const AgentFile: React.FC<{x: number; y: number; w?: number; role: RoleId; rot?: number; lines?: number; scale?: number}> = ({x, y, w = 360, role, rot = 0, lines = 3, scale = 1}) => {
  const r = ROLE[role];
  const h = w * 1.18;
  const fs = w * 0.062;
  const row = (k: string, v: string, col?: string) => (
    <div style={{fontFamily: FONT.mono, fontSize: fs, lineHeight: 1.45, color: C.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden'}}>
      <span style={{color: '#7A5BA8'}}>{k}:</span> <span style={{color: col ?? C.ink}}>{v}</span>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, rotate: `${rot}deg`, scale: String(scale)}}>
      <Paper lift={5}>
        <Slab x={0} y={-w * 0.1} w={w * 0.62} h={w * 0.14} color={r.color} r="10px 10px 0 0">
          <div style={{position: 'absolute', left: 14, top: 4, fontFamily: FONT.mono, fontWeight: 700, fontSize: fs * 1.05, color: '#fff'}}>{r.file}</div>
        </Slab>
        <Slab x={0} y={0} w={w} h={h} color={C.creamHi} r="0 8px 8px 8px" shade={C.creamLo} shadeH={0.04}>
          <div style={{position: 'absolute', left: w * 0.07, top: w * 0.06, right: w * 0.05}}>
            <div style={{fontFamily: FONT.mono, fontSize: fs, color: '#9B9184', lineHeight: 1.45}}>---</div>
            {row('name', role)}
            {/* description value on its own indented line (a YAML plain scalar may continue there), so it never clips */}
            <div style={{fontFamily: FONT.mono, fontSize: fs, lineHeight: 1.45, color: '#7A5BA8'}}>description:</div>
            <div style={{fontFamily: FONT.mono, fontSize: fs, lineHeight: 1.45, color: C.ink, paddingLeft: fs * 1.2, whiteSpace: 'nowrap'}}>{r.job}</div>
            {row('color', ROLE_COLOR_NAME[role], r.color)}
            <div style={{fontFamily: FONT.mono, fontSize: fs, color: '#9B9184', lineHeight: 1.45}}>---</div>
            {Array.from({length: lines}).map((_, i) => (
              <div key={i} style={{height: fs * 0.55, width: `${62 + random(`af${role}${i}`) * 32}%`, borderRadius: 4, background: '#B6AC9C', marginTop: fs * 0.62}} />
            ))}
          </div>
        </Slab>
      </Paper>
    </div>
  );
};
const ROLE_COLOR_NAME: Record<RoleId, string> = {skeptic: 'red', customer: 'green', competitor: 'orange', investor: 'yellow'};

// ---------- verdict card: a cream card with a rubber-stamped verdict ----------
// stampAt: frame the stamp slams down (relative to the scene). (x, y) = top-left.
export const Verdict: React.FC<{x: number; y: number; w?: number; role: RoleId; text: string; stampAt: number; rot?: number}> = ({x, y, w = 300, role, text, stampAt, rot = 0}) => {
  const f = useCurrentFrame();
  const r = ROLE[role];
  const h = w * 0.62;
  const s = interpolate(f, [stampAt - 3, stampAt, stampAt + 3], [1.8, 0.94, 1], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, rotate: `${rot}deg`}}>
      <Paper lift={5}>
        <Slab x={0} y={0} w={w} h={h} color={C.creamHi} r={6} shade={C.creamLo} shadeH={0.06}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h * 0.24, background: r.color}} />
          <div style={{position: 'absolute', left: 14, top: h * 0.035, fontFamily: FONT.label, fontWeight: 800, fontSize: h * 0.15, color: '#fff'}}>{r.tag}</div>
          {[0.36, 0.5].map((t, i) => <div key={i} style={{position: 'absolute', left: w * 0.08, top: h * t, height: 8, width: w * (0.5 + 0.3 * random(`vd${role}${i}`)), borderRadius: 4, background: '#B6AC9C'}} />)}
          {f >= stampAt - 3 ? (
            <div style={{position: 'absolute', left: '50%', top: h * 0.7, translate: '-50% -50%', rotate: '-8deg', scale: String(s), whiteSpace: 'nowrap',
              border: `5px solid ${C.nogo}`, borderRadius: 8, padding: '2px 12px', fontFamily: FONT.banner, fontSize: h * 0.17, color: C.nogo, opacity: 0.9}}>{text}</div>
          ) : null}
        </Slab>
      </Paper>
    </div>
  );
};

// ---------- campfire + skewer ----------
// (x, y) = ground centre of the fire. Flames flicker on twos (stepped, like replacement cels).
export const Campfire: React.FC<{x: number; y: number; s?: number; on?: number}> = ({x, y, s = 1, on = 1}) => {
  const f = useCurrentFrame();
  const step = Math.floor(f / 2);
  const flame = (k: number, col: string, w: number, h: number, dx: number) => {
    const j = (random(`fl${k}${step}`) - 0.5) * 0.18;
    return <Slab key={k + col} x={dx * s - (w * s) / 2} y={-h * s * (1 + j) * on} w={w * s} h={h * s * (1 + j) * on} color={col} r="50% 50% 30% 30% / 70% 70% 30% 30%" rot={j * 30} />;
  };
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0}}>
      <div style={{position: 'absolute', left: -220 * s, top: -330 * s, width: 440 * s, height: 400 * s, borderRadius: '50%', opacity: 0.4 * on,
        background: 'radial-gradient(circle, rgba(255,170,70,0.9) 0%, rgba(255,140,50,0.25) 45%, rgba(255,140,50,0) 70%)'}} />
      <Paper lift={5}>
        {on > 0 ? <>{flame(1, '#E2562F', 150, 210, -10)}{flame(2, '#F08A2E', 110, 160, 14)}{flame(3, '#F6C64C', 64, 96, 0)}</> : null}
        <Slab x={-140 * s} y={-34 * s} w={280 * s} h={44 * s} color={C.woodHi} shade={C.woodLo} shadeH={0.4} r={20} rot={-12} />
        <Slab x={-140 * s} y={-34 * s} w={280 * s} h={44 * s} color={C.wood} shade={C.woodLo} shadeH={0.4} r={20} rot={12} />
        {[-150, -80, 0, 80, 150].map((dx, i) => <Disc key={i} x={dx * s} y={8 * s} d={(46 + (i % 2) * 14) * s} color="#8D877C" shade="#6F6A61" />)}
      </Paper>
    </div>
  );
};

// A long roasting fork; (x, y) = handle end, len in px, angle in degrees (0 = pointing right, negative = up).
export const Skewer: React.FC<{x: number; y: number; len?: number; angle?: number; children?: React.ReactNode}> = ({x, y, len = 420, angle = -20, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, rotate: `${angle}deg`}}>
    <Paper lift={4}>
      <Slab x={0} y={-9} w={110} h={18} color={C.wood} shade={C.woodLo} shadeH={0.4} r={8} />
      <Slab x={108} y={-4} w={len - 108} h={8} color={C.metal} shade={C.metalLo} shadeH={0.5} r={3} />
    </Paper>
    {children ? <div style={{position: 'absolute', left: len, top: 0}}>{children}</div> : null}
  </div>
);

// Small stat card with a big number (numbers are physical props). (x, y) = top-left.
// tape: two tape strips across the top corners so a wall-hung card is never loose.
export const NumberCard: React.FC<{x: number; y: number; w: number; h: number; big: string; small?: string; color?: string; ink?: string; rot?: number; tape?: boolean}> =
  ({x, y, w, h, big, small, color = C.creamHi, ink = C.ink, rot = 0, tape = false}) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, rotate: `${rot}deg`}}>
      <Paper lift={5}>
        <Slab x={0} y={0} w={w} h={h} color={color} r={10} shade="rgba(0,0,0,0.12)" shadeH={0.07}>
          <div style={{position: 'absolute', left: 0, right: 0, top: small ? '10%' : 0, bottom: small ? '30%' : 0, display: 'grid', placeItems: 'center', fontFamily: FONT.banner, fontSize: h * (small ? 0.46 : 0.6), color: ink, lineHeight: 1}}>{big}</div>
          {small ? <div style={{position: 'absolute', left: 0, right: 0, bottom: '9%', textAlign: 'center', fontFamily: FONT.label, fontWeight: 800, fontSize: h * 0.14, color: ink, opacity: 0.8}}>{small}</div> : null}
        </Slab>
      </Paper>
      {tape ? <TapeCorners x={0} y={0} w={w} h={h} len={Math.max(48, Math.min(80, w * 0.22))} /> : null}
    </div>
  );

export {Pill};

// Where a Critter's arm tip is, so a scene can place a held prop that stays upright (Critter's own holdR rotates
// with the arm). Matches Critter's geometry; ignores `lean`. side 1 = right arm, -1 = left arm.
export const armTip = (o: {x: number; y: number; size?: number; reach: number; angle: number; face?: 1 | -1; lift?: number; f?: number; phase?: number; side?: 1 | -1; idle?: boolean}) => {
  const {x, y, size = 240, reach, angle, face = 1, lift = 0, f = 0, phase = 0, side = 1, idle = true} = o;
  const u = size / 10, bodyW = 10 * u, bodyH = 7 * u, legH = 2.2 * u;
  const b = idle ? bob(f, 36, 3, phase) : 0;
  const len = 2.3 * u + reach * 5 * u;
  const ax = side === 1 ? bodyW / 2 - 0.4 * u : -bodyW / 2 + 0.4 * u;
  const ay = -legH - bodyH + 3.4 * u - lift + b;
  const a = ((side === 1 ? angle : 180 - angle) * Math.PI) / 180;
  const tx = ax + Math.cos(a) * len, ty = ay + Math.sin(a) * len;
  return {x: x + face * tx, y: y + ty};
};
