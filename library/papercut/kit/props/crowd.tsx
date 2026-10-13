// A stadium of tiny sleepers, drawn cheaply: ~1100 people in 25 tiers (one SVG per tier, instanced <use>) so a full-frame crowd renders fast,
// with a few "hero" real <Critter>s seated in the rows who can lift, speak up and wake. Pan the stand sideways with `pan`; back tiers drift less.
//   Crowd         the stand: tiers, seat boards, floating z tags, and every hero that is still asleep or seated
//   AwakeHeroes   the heroes that are awake, drawn above any dim layer or glow so it never greys them out (render after your overlay)
//   placeHeroes / heroScreenX / CROWD_HEROES   where heroes sit; use them to aim sparkles, labels or arrows at a hero
// Layout (1080x1920 frame, no x/y props: the crowd fills the frame). Tier 0 (front) has 86 px critters on a baseline at y 1440; each tier behind
// is 0.93x the size and sits higher, up to a back row near y 710. Every tier is 1620 px wide from x -270, so `pan` can run -270..270 px (front
// tiers move `pan`, back tiers less) without showing an edge. Hero `x` is the screen x of the hero's feet when the stand is at `heroPan`.
import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {C, FONT} from '../tokens';
import {Paper, Slab, bob} from '../paper/kit';
import {Critter, type Acc, type Expr} from '../cast/Critter';

const CROWD_W = 1620, CROWD_X0 = -270;   // each tier is wider than the screen so the pan never shows an edge
const BODY = ['#C98B5B', '#8FB3A0', '#B9A2CF', '#E0B65C', '#7FA7C9', '#D98C8C', '#A9C27A'];
const BODY_LO = ['#9C6840', '#678A78', '#8B76A8', '#B38A38', '#5A82A5', '#B06666', '#7F9855'];
const HAT = ['#F3A53B', '#F3A53B', '#F3A53B', '#E8E2D2', '#E66F3C', '#F0D24A'];
const HAT_LO = ['#C07F22', '#C07F22', '#C07F22', '#BDB6A2', '#B4502A', '#C4A62C'];

type Tier = {k: number; size: number; B: number; pitch: number; n: number; px: number};
const buildTiers = (): Tier[] => {
  const out: Tier[] = [];
  let size = 86, B = 1440;
  for (let k = 0; k < 25; k++) {
    const pitch = size * 1.06;
    out.push({k, size, B, pitch, n: Math.ceil(CROWD_W / pitch), px: ((k * 0.37) % 1) * pitch});
    B -= 0.72 * size;
    size *= 0.93;
  }
  return out.reverse();   // back tier first = draw order
};
const TIERS = buildTiers();
const tierOf = (k: number) => TIERS.find((t) => t.k === k)!;
const tierShift = (t: Tier, pan: number) => -pan * Math.pow(t.size / 86, 0.8);   // parallax: back tiers drift less

function mixHex(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
type Look = {haze: string; dusk: string};
const calm = (c: string, look: Look) => mixHex(c, look.dusk, 0.24);   // mute the bright critters toward the stage's dusk

// ---------- heroes: where they sit ----------

// A hero's seat: front-tier index k (0 = front row, up to about 8 stay big enough to read) and its screen x at `heroPan`.
export type HeroSpot = {k: number; x: number};
// A hero placed on a seat: `slot` is the seat in its tier, `x` the feet position when pan is 0 (add tierShift via heroScreenX for any pan).
export type PlacedHero = {k: number; slot: number; x: number};

// Ten hero seats in front tiers 2-6, clustered mid-screen (the default for Crowd and AwakeHeroes); x is the screen x when heroPan is 130.
export const CROWD_HEROES: HeroSpot[] = [
  {k: 2, x: 330}, {k: 2, x: 700}, {k: 3, x: 500}, {k: 3, x: 850}, {k: 4, x: 260},
  {k: 4, x: 610}, {k: 5, x: 420}, {k: 5, x: 770}, {k: 6, x: 560}, {k: 6, x: 330},
];

// Snap hero spots onto real seats so no sleeper overlaps a hero: pass the same `spots` and `heroPan` you give Crowd and AwakeHeroes.
export const placeHeroes = (spots: HeroSpot[] = CROWD_HEROES, heroPan = 130): PlacedHero[] => spots.map((h) => {
  const t = tierOf(h.k);
  const unpanned = h.x + heroPan * Math.pow(t.size / 86, 0.8);
  const slot = Math.round((unpanned - CROWD_X0 - t.px - t.pitch / 2) / t.pitch);
  return {k: h.k, slot, x: CROWD_X0 + t.px + slot * t.pitch + t.pitch / 2};
});

// Screen x of a placed hero's feet at a given pan; the feet y is that tier's baseline (about 1320 at k 2, 1128 at k 6).
export const heroScreenX = (h: PlacedHero, pan: number) => h.x + tierShift(tierOf(h.k), pan);

// ---------- one tier: seat board behind, sleeping critters on it ----------

const Person: React.FC<{id: string; u: number; body: string; lo: string; hat: string; hatLo: string; eyes: boolean; glasses: boolean}> = ({id, u, body, lo, hat, hatLo, eyes, glasses}) => (
  <g id={id}>
    <rect x={0} y={0} width={10 * u} height={7 * u} rx={Math.min(4, 0.5 * u)} fill={lo} />
    <rect x={0} y={0} width={10 * u} height={5.9 * u} rx={Math.min(4, 0.5 * u)} fill={body} />
    <rect x={0.2 * u} y={0.2 * u} width={9.6 * u} height={0.35 * u} rx={0.15 * u} fill="#fff" opacity={0.2} />
    <path d={`M${1 * u} ${0.3 * u} A${4 * u} ${2.6 * u} 0 0 1 ${9 * u} ${0.3 * u} Z`} fill={hat} />
    <rect x={0.2 * u} y={-0.1 * u} width={9.6 * u} height={0.75 * u} rx={0.3 * u} fill={hatLo} />
    <rect x={4.6 * u} y={-2.2 * u} width={0.8 * u} height={2.2 * u} fill={hatLo} />
    {eyes ? (
      <>
        <rect x={2.85 * u} y={2.8 * u} width={1.3 * u} height={Math.max(1, 0.28 * u)} rx={0.14 * u} fill={C.ink} />
        <rect x={5.85 * u} y={2.8 * u} width={1.3 * u} height={Math.max(1, 0.28 * u)} rx={0.14 * u} fill={C.ink} />
      </>
    ) : null}
    {glasses ? (
      <>
        <circle cx={3.5 * u} cy={2.9 * u} r={1.05 * u} fill="none" stroke={C.ink} strokeWidth={0.32 * u} />
        <circle cx={6.5 * u} cy={2.9 * u} r={1.05 * u} fill="none" stroke={C.ink} strokeWidth={0.32 * u} />
      </>
    ) : null}
  </g>
);

const TierRow: React.FC<{t: Tier; shift: number; seat: string; f: number; look: Look; placed: PlacedHero[]}> = ({t, shift, seat, f, look, placed}) => {
  const u = t.size / 10;
  const depth = t.k / 24;   // 0 front -> 1 back
  const {haze} = look, tHaze = Math.min(0.62, depth * 0.7);
  const top = t.B - 11.7 * u - 2, h = 11.7 * u + 4.6 * u + (t.k === 0 ? 34 : 0);
  const detail = t.size >= 28;
  const sway = bob(f, 70 + t.k * 3, Math.min(2.6, 0.04 * t.size + 0.4), t.k * 1.7);
  // seven variants per tier: body x hat x glasses, defined once as symbols
  const variants = Array.from({length: 7}).map((_, v) => ({
    id: `p${t.k}v${v}`, body: mixHex(calm(BODY[v], look), haze, tHaze), lo: mixHex(calm(BODY_LO[v], look), haze, tHaze),
    hat: mixHex(calm(HAT[(v * 3 + t.k) % HAT.length], look), haze, tHaze), hatLo: mixHex(calm(HAT_LO[(v * 3 + t.k) % HAT.length], look), haze, tHaze), glasses: detail && t.size >= 34 && v % 3 === 1,
  }));
  const people: React.ReactNode[] = [];
  for (let i = 0; i < t.n; i++) {
    if (placed.some((p) => p.k === t.k && p.slot === i)) continue;
    const r = random(`crowd-${t.k}-${i}`);
    const v = Math.floor(r * 7);
    const dy = (random(`cy-${t.k}-${i}`) - 0.5) * 0.5 * u;
    people.push(<use key={i} href={`#${variants[v].id}`} x={t.px + i * t.pitch + (t.pitch - 10 * u) / 2} y={11.7 * u - 9.2 * u + dy + 2} />);
  }
  const svg = (
    <svg width={CROWD_W} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>{variants.map((v) => <Person key={v.id} id={v.id} u={u} body={v.body} lo={v.lo} hat={v.hat} hatLo={v.hatLo} eyes={detail} glasses={v.glasses} />)}</defs>
      {people}
    </svg>
  );
  // seat board in front of the sleepers (covers their legs and the lowest sliver of body)
  const boardTop = 11.7 * u - 3.2 * u + 2;
  const board = <Slab x={0} y={boardTop} w={CROWD_W} h={h - boardTop} color={mixHex(seat, haze, tHaze * 0.9)} shade={mixHex('#34241C', haze, tHaze)} shadeH={0.22} hi={mixHex('#8A6548', haze, tHaze)} hiH={Math.min(0.2, 5 / (h - boardTop) + 0.01)} r={0} />;
  const box: React.CSSProperties = {position: 'absolute', left: CROWD_X0 + shift, top: top + sway, width: CROWD_W, height: h, opacity: interpolate(t.k, [15, 24], [1, 0.45], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})};
  return t.size >= 26 ? (
    <Paper lift={Math.max(2, t.size / 14)} style={{...box, inset: undefined}}>{svg}{board}</Paper>
  ) : (
    <div style={box}>{svg}{board}</div>
  );
};

// floating z tags over a few front sleepers
const ZZ: {k: number; slot: number}[] = [{k: 0, slot: 2}, {k: 0, slot: 8}, {k: 1, slot: 5}, {k: 1, slot: 11}, {k: 2, slot: 4}, {k: 2, slot: 10}, {k: 3, slot: 7}, {k: 3, slot: 13}];

// What a hero is doing this frame: lift (px up off the seat), expression, arms up 0-1, wave (deg), awake (true = AwakeHeroes draws it, Crowd skips it).
export type HeroState = {lift?: number; expr?: Expr; armUp?: number; awake?: boolean; wave?: number};

const HeroCritter: React.FC<{t: Tier; x: number; i: number; lift: number; expr: Expr; arm: number; seat: string; look: Look; acc: Acc; board?: boolean; wave?: number}> = ({t, x, i, lift, expr, arm, seat, look, acc, board, wave = 0}) => {
  const a = Math.max(0, Math.min(1, arm));
  const hatI = i % 3 === 0 ? 3 : 0;
  const tHaze = Math.min(0.62, (t.k / 24) * 0.7);
  return (
    <>
      <Critter x={x} y={t.B} size={t.size} color={calm(BODY[(i * 3 + 1) % 7], look)} shade={calm(BODY_LO[(i * 3 + 1) % 7], look)} acc={acc} accColor={calm(HAT[hatI], look)} accShade={calm(HAT_LO[hatI], look)}
        expr={expr} lift={lift} phase={i * 5 + 2} idle={lift > 0.5 ? false : true} armL={a * 0.6} armLAngle={-(20 + a * 55) + wave} armR={a * 0.6} armRAngle={-(20 + a * 55) - wave} />
      {/* the seat board hides the sleeper's lap; a copy sits in front of the hero so it sinks into the row when seated */}
      {board ? <Paper lift={Math.max(2, t.size / 14)} style={{inset: undefined, left: x - t.size, top: t.B - 3.2 * (t.size / 10) + 2, width: t.size * 2, height: 3.6 * (t.size / 10)}}>
        <Slab x={0} y={0} w={t.size * 2} h={3.6 * (t.size / 10)} color={mixHex(seat, look.haze, tHaze * 0.9)} r={0} hi={mixHex('#8A6548', look.haze, tHaze)} hiH={0.12} shade={mixHex('#34241C', look.haze, tHaze)} shadeH={0.2} />
      </Paper> : null}
    </>
  );
};

// The sleeping stadium, full frame. pan = px to scroll (-270..270); hero(i) = state of hero i (index into `heroes`); zz = floating z tags; seat = seat-board colour; haze/dusk = depth fog and mood tint.
export const Crowd: React.FC<{pan?: number; seat?: string; hero?: (i: number) => HeroState; zz?: boolean; heroes?: HeroSpot[]; heroPan?: number; haze?: string; dusk?: string; heroAcc?: Acc}> = ({pan = 0, seat = '#6A4A38', hero, zz = true, heroes = CROWD_HEROES, heroPan = 130, haze = '#2A2433', dusk = '#6A5A5E', heroAcc = 'hardhat'}) => {
  const f = useCurrentFrame();
  const look: Look = {haze, dusk};
  const placed = placeHeroes(heroes, heroPan);
  return (
    <>
      {TIERS.map((t) => {
        const shift = tierShift(t, pan);
        return (
          <React.Fragment key={t.k}>
            <TierRow t={t} shift={shift} seat={seat} f={f} look={look} placed={placed} />
            {placed.map((h, i) => {
              if (h.k !== t.k) return null;
              const st = hero?.(i) ?? {};
              if (st.awake) return null;
              return <HeroCritter key={i} t={t} x={h.x + shift} i={i} lift={st.lift ?? 0} expr={st.expr ?? 'sleep'} arm={st.armUp ?? 0} seat={seat} look={look} acc={heroAcc} board />;
            })}
            {zz && t.k <= 3 ? ZZ.filter((z) => z.k === t.k).map((z, j) => {
              const zx = CROWD_X0 + shift + t.px + z.slot * t.pitch + t.pitch * 0.9;
              const zy = t.B - 11.4 * (t.size / 10) - 4;
              const ph = ((f + z.slot * 9 + j * 5) % 54) / 54;
              return (
                <div key={`z${j}`} style={{position: 'absolute', left: zx, top: zy - ph * 34, fontFamily: FONT.banner, fontSize: Math.max(26, t.size * 0.4), color: '#E6EEF5', opacity: interpolate(ph, [0, 0.15, 0.75, 1], [0, 0.95, 0.8, 0]), rotate: '-8deg', textShadow: '1px 2px 0 rgba(0,0,0,0.35)', pointerEvents: 'none'}}>z</div>
              );
            }) : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

// The awake heroes (hero(i).awake), drawn above everything with a brightness lift; use the same pan, seat, heroes, heroPan, haze, dusk and heroAcc as Crowd.
export const AwakeHeroes: React.FC<{hero: (i: number) => HeroState; pan?: number; seat?: string; heroes?: HeroSpot[]; heroPan?: number; haze?: string; dusk?: string; heroAcc?: Acc}> = ({pan = 0, hero, seat = '#6A4A38', heroes = CROWD_HEROES, heroPan = 130, haze = '#2A2433', dusk = '#6A5A5E', heroAcc = 'hardhat'}) => {
  const look: Look = {haze, dusk};
  const placed = placeHeroes(heroes, heroPan);
  return (
    <div style={{position: 'absolute', inset: 0, filter: 'brightness(1.14) saturate(1.18)'}}>
      {placed.map((h, i) => {
        const st = hero(i);
        if (!st.awake) return null;
        const t = tierOf(h.k);
        return <HeroCritter key={i} t={t} x={h.x + tierShift(t, pan)} i={i} lift={st.lift ?? 0} expr={st.expr ?? 'happy'} arm={st.armUp ?? 0} wave={st.wave ?? 0} seat={seat} look={look} acc={heroAcc} />;
      })}
    </div>
  );
};
