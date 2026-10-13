// Hardware props: GamingPC (tower, glass panel, RGB fans; open = motherboard with GPU and RAM slots), GpuCard (graphics card; suitcase mode has a lid, zipper and luggage tag; GpuCase is the closed one), RamStick, ServerRack, Whale (the "125B" model), WhaleTail, PaperCloud, SpeedGauge.
// All cut paper (Slab/Disc/Card/Pill inside Paper, stacked shade pieces, no outlines). Light from the top-left. RGB light is the only gradient (soft screen glows).
// Motion comes only from useCurrentFrame(): fans spin, RGB strips cycle, LEDs blink on steps, the whale bobs. `s` scales a prop, `rot` turns it about its anchor.
// Every prop is drawn at a fixed design size and scaled; read the (x, y) anchor note above each export.
import React from 'react';
import {Easing, random, useCurrentFrame} from 'remotion';
import {C, FONT} from '../tokens';
import {Disc, Paper, Pill, Slab, bob} from '../paper/kit';

const c01 = (v: number) => Math.min(1, Math.max(0, v));
const lvl = (v: boolean | number | undefined, d: number) => (v === undefined ? d : v === true ? 1 : v === false ? 0 : v);
const hsl = (h: number, s = 88, l = 58) => `hsl(${((h % 360) + 360) % 360} ${s}% ${l}%)`;
const OFF = '#2E333A';
/** Mix a #RRGGBB colour toward black (amt < 0) or white (amt > 0). */
const mixHex = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16), t = amt < 0 ? 0 : 255, k = Math.abs(amt);
  const ch = (v: number) => Math.round(v + (t - v) * k).toString(16).padStart(2, '0');
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
};
/** RGB colour for part `off` at frame f: the cycling rainbow, or the fixed `glow` override. */
const rgb = (f: number, off: number, glow?: string, l = 58) => glow ?? hsl(f * 1.8 + off, 88, l);

// ---------- shared pieces (not exported) ----------

/** A prop's frame: the anchor (ax, ay) inside a w×h box sits at the scene point (x, y); scale and rotate about the anchor. `under` is drawn behind the paper (halos). */
const Frame: React.FC<{x: number; y: number; ax: number; ay: number; w: number; h: number; s?: number; rot?: number; lift?: number; under?: React.ReactNode; children?: React.ReactNode; style?: React.CSSProperties}> =
  ({x, y, ax, ay, w, h, s = 1, rot = 0, lift = 5, under, children, style}) => (
    <div style={{position: 'absolute', left: x - ax, top: y - ay, width: w, height: h, transformOrigin: `${ax}px ${ay}px`, scale: String(s), rotate: `${rot}deg`, ...style}}>
      {under}
      <Paper lift={lift}>{children}</Paper>
    </div>
  );

/** A paper piece cut to any silhouette: a Slab clipped by an SVG path given in the piece's own w×h box. Children are clipped to the shape too. */
const Cut: React.FC<{x: number; y: number; w: number; h: number; d: string; color: string; shade?: string; shadeH?: number; hi?: string; hiH?: number; rot?: number; style?: React.CSSProperties; children?: React.ReactNode}> =
  ({d, style, ...p}) => <Slab {...p} r={0} style={{boxShadow: 'none', clipPath: `path('${d}')`, ...style}} />;

/** A soft light: a blob, or a ring that hugs a fan rim. Screen-blended, so it only lightens what is under it. */
const Glow: React.FC<{cx: number; cy: number; rx: number; ry?: number; color: string; a?: number; ring?: boolean}> = ({cx, cy, rx, ry = rx, color, a = 0.5, ring}) => (
  <div style={{position: 'absolute', left: cx - rx, top: cy - ry, width: rx * 2, height: ry * 2, borderRadius: '50%', opacity: a, mixBlendMode: 'screen', pointerEvents: 'none',
    background: ring ? `radial-gradient(closest-side, transparent 48%, ${color} 70%, transparent 100%)` : `radial-gradient(closest-side, ${color} 0%, transparent 100%)`}} />
);

/** Fan angle in degrees: already spinning (spinAt < -999), or spinning up from frame `from` over `ramp` frames, then steady at `rate` deg/frame. */
const fanAng = (f: number, from = -9999, rate = 9, ramp = 16) => {
  if (from < -999) return f * rate;
  const t = f - from;
  if (t <= 0) return 0;
  return t < ramp ? (rate * t * t) / (2 * ramp) : rate * (t - ramp / 2);
};

/** A case or card fan: optional square frame, RGB rim, seven blades turning by `ang`; `blur` draws a spin haze. */
const Fan: React.FC<{cx: number; cy: number; d: number; ang: number; ring: string; frame?: boolean; blur?: number; glow?: number; blades?: number}> = ({cx, cy, d, ang, ring, frame = true, blur = 0, glow = 0, blades = 7}) => {
  const R = d / 2;
  return (
    <>
      {frame ? (
        <>
          <Slab x={cx - R * 1.1} y={cy - R * 1.1} w={R * 2.2} h={R * 2.2} color="#23272C" hi="#323840" hiH={0.08} shade="#16191C" shadeH={0.14} r={R * 0.22} />
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => <Disc key={i} x={cx + sx * R * 0.95} y={cy + sy * R * 0.95} d={R * 0.15} color="#0D0F11" />)}
        </>
      ) : <Disc x={cx} y={cy} d={d * 1.12} color="#16181C" shade="#0C0D0F" />}
      <Disc x={cx} y={cy} d={d} color={ring} />
      <Disc x={cx} y={cy} d={d * 0.9} color="#171A1E" shade="#0F1113" />
      <div style={{position: 'absolute', left: cx, top: cy, width: 0, height: 0, rotate: `${ang}deg`}}>
        {Array.from({length: blades}).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, rotate: `${(i * 360) / blades}deg`}}>
            <Slab x={R * 0.13} y={-R * 0.2} w={R * 0.7} h={R * 0.38} color="#4A5466" hi="#68748C" hiH={0.34} shade="#38414F" shadeH={0.25} r="25% 75% 70% 30% / 40% 60% 60% 40%" rot={-16} style={{opacity: blur > 0 ? 0.55 : 1}} />
          </div>
        ))}
      </div>
      {blur > 0 ? <div style={{position: 'absolute', left: cx - R * 0.88, top: cy - R * 0.88, width: R * 1.76, height: R * 1.76, borderRadius: '50%', background: `rgba(190,200,222,${0.32 * blur})`}} /> : null}
      <Disc x={cx} y={cy} d={R * 0.42} color="#5A6578" shade="#3E4757" />
      <Disc x={cx} y={cy} d={R * 0.17} color="#20242A" />
      {glow > 0 ? <Glow cx={cx} cy={cy} rx={R * 1.45} color={ring} a={0.55 * glow} ring /> : null}
    </>
  );
};

/** A row (or column) of RGB segments that cycle colour; `lit` 0 = dark grey. */
const Strip: React.FC<{x: number; y: number; w: number; h: number; n: number; vertical?: boolean; f: number; glow?: string; lit: number; gap?: number; glowPx?: number}> =
  ({x, y, w, h, n, vertical, f, glow, lit, gap = 2, glowPx = 10}) => {
    const sl = (vertical ? h : w) / n;
    return (
      <>
        {Array.from({length: n}).map((_, i) => {
          const col = lit > 0 ? rgb(f, (i * 300) / n, glow) : OFF;
          return (
            <Slab key={i} x={vertical ? x : x + i * sl} y={vertical ? y + i * sl : y} w={vertical ? w : sl - gap} h={vertical ? sl - gap : h} color={col} r={2}
              style={{opacity: lit > 0 ? 0.4 + 0.6 * Math.min(1, lit) : 1, boxShadow: lit > 0 ? `0 0 ${glowPx * lit}px ${col}` : 'none'}} />
          );
        })}
      </>
    );
  };

// GpuBody: the graphics card drawn flat (460×160), shared by GpuCard and the PC's glass window.
const GpuBody: React.FC<{f: number; ang: number; glow?: string; rgbOn: number; label?: string}> = ({f, ang, glow, rgbOn, label}) => (
  <>
    {/* power connectors on the top edge */}
    <Slab x={296} y={-10} w={104} h={16} color="#101214" hi="#23272C" hiH={0.2} r="5px 5px 0 0" />
    <Slab x={308} y={-4} w={36} h={7} color="#2C3036" r={2} />
    <Slab x={352} y={-4} w={36} h={7} color="#2C3036" r={2} />
    {/* shroud */}
    <Slab x={26} y={0} w={434} h={134} color="#2B2F35" hi="#3F454E" hiH={0.07} shade="#1B1E22" shadeH={0.13} r={14} />
    {/* bracket */}
    <Slab x={0} y={8} w={32} h={150} color="#B1B9BC" hi="#CBD2D4" hiH={0.05} shade="#8C9598" shadeH={0.13} r="8px 2px 2px 8px" />
    {[0, 1, 2].map((i) => <Slab key={i} x={8} y={26 + i * 24} w={18} h={8} color="#6A7377" r={4} />)}
    {/* backplate edge */}
    <Slab x={26} y={134} w={434} h={14} color="#9AA3A7" hi="#C9D0D3" hiH={0.35} shade="#778186" shadeH={0.3} r={3} />
    {/* gold fingers with the key notch */}
    <Slab x={62} y={148} w={142} h={13} color={C.brass} hi="#E3BE72" hiH={0.3} shade={C.brassLo} shadeH={0.2} r={2} />
    <Slab x={216} y={148} w={84} h={13} color={C.brass} hi="#E3BE72" hiH={0.3} shade={C.brassLo} shadeH={0.2} r={2} />
    {Array.from({length: 24}).map((_, i) => <div key={i} style={{position: 'absolute', left: (i < 12 ? 66 : 222) + (i % 12) * (i < 12 ? 11.5 : 6.5), top: 150, width: 2, height: 9, background: C.brassLo, opacity: 0.7}} />)}
    {/* fans */}
    <Fan cx={108} cy={68} d={106} ang={ang} ring={rgbOn > 0 ? rgb(f, 0, glow) : OFF} frame={false} glow={rgbOn} />
    <Fan cx={262} cy={68} d={106} ang={ang} ring={rgbOn > 0 ? rgb(f, 70, glow) : OFF} frame={false} glow={rgbOn} />
    {/* RGB edge strip along the top edge */}
    <Strip x={44} y={5} w={382} h={7} n={19} f={f} glow={glow} lit={rgbOn} glowPx={9} />
    {/* info plate */}
    {label ? (
      <Slab x={346} y={40} w={102} h={58} color="#E7DDC9" hi="#F3ECDD" hiH={0.1} shade="#CDC0A8" shadeH={0.14} r={7} rot={-3}>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: FONT.label, fontWeight: 800, fontSize: 34, color: C.ink, whiteSpace: 'nowrap'}}>{label}</div>
      </Slab>
    ) : null}
  </>
);

// Desktop tower, seen from the glass side. (x, y) = the floor point under the middle of the case; the case is 300×560 at s = 1 (about 575 tall with feet).
// on: boolean or 0–1 (lights, glow and fan spin); glow: fixed RGB colour such as '#3DDC84' instead of the cycling rainbow; spinAt: frame the fans spin up from (omit = already spinning).
// open: boolean or 0–1, the glass panel slides off to the left and fades. With it off you see the motherboard: gpuIn 0–1 slides a GpuBody into its slot (0 = empty slot, nothing drawn),
// ramIn 0–1 drops two sticks into the RAM slots with a click (0 = four empty slots). Closed, the card and sticks are always in place.
export const GamingPC: React.FC<{x: number; y: number; s?: number; rot?: number; on?: boolean | number; glow?: string; open?: boolean | number; gpuIn?: number; ramIn?: number; spinAt?: number}> =
  ({x, y, s = 1, rot = 0, on = true, glow, open = false, gpuIn = 1, ramIn = 1, spinAt = -9999}) => {
    const f = useCurrentFrame();
    const lit = c01(lvl(on, 1));
    const op = c01(lvl(open, 0));
    const PL = 290, PT = 260, PR = 70, PB = 40, CW = 300, CH = 560;
    const ang = lit > 0 ? fanAng(f, spinAt) : 0;
    const col = (off: number, l = 58) => (lit > 0 ? rgb(f, off, glow, l) : OFF);
    const glowCol = glow ?? hsl(f * 1.8 + 140, 90, 56);
    const seated = gpuIn >= 0.999;
    const gE = Easing.out(Easing.cubic)(c01(gpuIn));
    const ramStick = (slot: number, k: number) => {
      const p = c01(ramIn * 1.5 - k * 0.5);
      const e = Easing.out(Easing.back(1.8))(p);
      if (p <= 0) return null;
      const sx = 204 + slot * 12.6;
      return (
        <React.Fragment key={slot}>
          <Slab x={sx + 0.5} y={20 - (1 - e) * 230} w={9.5} h={140} color="#5C6574" hi="#7C8697" hiH={0.04} shade="#434B58" shadeH={0.06} r={2} />
          <Slab x={sx + 0.5} y={20 - (1 - e) * 230} w={9.5} h={14} color={col(slot * 50 + 40)} r={2} style={{boxShadow: lit > 0 ? `0 0 10px ${col(slot * 50 + 40)}` : 'none'}} />
        </React.Fragment>
      );
    };
    return (
      <Frame x={x} y={y} ax={PL + CW / 2} ay={PT + CH + 14} w={PL + CW + PR} h={PT + CH + 14 + PB} s={s} rot={rot} lift={7}
        under={lit > 0 ? <Glow cx={PL + 150} cy={PT + 290} rx={330} ry={400} color={glowCol} a={0.36 * lit} /> : null}>
        <div style={{position: 'absolute', left: PL, top: PT, width: CW, height: CH + 14}}>
          {/* feet */}
          <Slab x={28} y={CH - 4} w={56} h={18} color="#15171A" r={5} />
          <Slab x={216} y={CH - 4} w={56} h={18} color="#15171A" r={5} />
          {/* body and the side strip that gives it depth */}
          <Slab x={0} y={0} w={CW} h={CH} color="#343A40" hi="#474E56" hiH={0.03} shade="#23272B" shadeH={0.05} r={16} />
          <Slab x={274} y={0} w={26} h={CH} color="#252A2F" hi="#2F353B" hiH={0.03} shade="#1A1D21" shadeH={0.05} r="0 16px 16px 0" />
          {/* power button with its LED ring */}
          <Disc x={238} y={15} d={25} color={lit > 0 ? '#8CFFB8' : '#3A3F45'} style={{boxShadow: lit > 0 ? '0 0 12px #6CFFAA' : 'none'}} />
          <Disc x={238} y={15} d={15} color="#B7BEC1" shade="#8C9598" />
          <Slab x={60} y={9} w={70} h={9} color="#1F2327" r={4} />
          {/* window recess + interior */}
          <Slab x={10} y={26} w={260} h={508} color="#1B1E22" r={9} />
          <Slab x={14} y={30} w={252} h={500} color="#14171B" r={6}>
            {/* motherboard */}
            <Slab x={118} y={0} w={134} h={420} color="#2B4D44" hi="#3B6759" hiH={0.012} shade="#1F3A33" shadeH={0.03} r={0} />
            {[[130, 112, 3, 120], [134, 112, 40, 3], [214, 176, 3, 54], [214, 176, 28, 3], [140, 420 - 40, 70, 3]].map(([tx, ty, tw, th], i) => (
              <Slab key={i} x={tx} y={ty} w={tw} h={th} color="#4C8070" r={1} style={{opacity: 0.55}} />
            ))}
            {/* CPU cooler: fins and its own small fan */}
            <Slab x={124} y={20} w={74} h={78} color="#3A4048" hi="#535B66" hiH={0.1} shade="#262B31" shadeH={0.2} r={8} />
            {[0, 1, 2, 3, 4].map((i) => <Slab key={i} x={130} y={31 + i * 12} w={62} h={3} color="#242830" r={1} />)}
            <Fan cx={161} cy={59} d={46} ang={ang * 1.2} ring={col(120)} frame={false} glow={lit} />
            {/* RAM slots (sticks are drawn above) */}
            {[0, 1, 2, 3].map((i) => <Slab key={i} x={204 + i * 12.6} y={16} w={11} h={150} color="#0B0C0E" r={2} />)}
            {/* PCIe slots with gold contacts */}
            <Slab x={118} y={298} w={124} h={13} color="#0B0C0E" r={3}><div style={{position: 'absolute', left: 4, top: 4, right: 4, height: 4, background: C.brass, opacity: 0.8, borderRadius: 2}} /></Slab>
            <Slab x={118} y={330} w={84} h={11} color="#0B0C0E" r={3} />
            <Slab x={150} y={352} w={56} h={56} color="#8C9598" hi="#B1B9BC" hiH={0.12} shade="#6B7478" shadeH={0.2} r={6}>{[0, 1, 2, 3, 4].map((i) => <div key={i} style={{position: 'absolute', left: 6, right: 6, top: 9 + i * 9, height: 3, background: '#5E676C', borderRadius: 2}} />)}</Slab>
            {/* front fans */}
            <Fan cx={60} cy={76} d={88} ang={ang} ring={col(0)} glow={lit} />
            <Fan cx={60} cy={180} d={88} ang={ang} ring={col(60)} glow={lit} />
            <Fan cx={60} cy={372} d={88} ang={ang} ring={col(120)} glow={lit} />
            {/* PSU shroud with vents and cables */}
            <Slab x={0} y={426} w={252} h={74} color="#1D2024" hi="#2A2E34" hiH={0.07} shade="#121417" shadeH={0.18} r={0} />
            {Array.from({length: 9}).map((_, i) => <Slab key={i} x={20 + i * 24} y={444} w={14} h={5} color="#0C0D0F" r={2} />)}
            <Slab x={236} y={332} w={11} h={96} color="#101214" r={5} />
            <Slab x={221} y={344} w={11} h={84} color="#101214" r={5} />
            {/* RGB strips: the front edge and under the top */}
            <Strip x={2} y={10} w={8} h={410} n={22} vertical f={f} glow={glow} lit={lit} glowPx={9} />
            <Strip x={122} y={2} w={126} h={6} n={10} f={f} glow={glow} lit={lit} glowPx={8} />
            {/* the card in its slot, closed view */}
            {gpuIn > 0 && !(op > 0 && gpuIn < 1) ? (
              <div style={{position: 'absolute', left: 26, top: 232, width: 460, height: 162, transformOrigin: '0 0', scale: '0.46'}}>
                <GpuBody f={f} ang={ang} glow={glow} rgbOn={lit} label="12 GB" />
              </div>
            ) : null}
          </Slab>
          {/* GPU arriving (open view): drawn above the interior so it can fly in from outside the window */}
          {gpuIn > 0 && op > 0 && gpuIn < 1 ? (
            <div style={{position: 'absolute', left: 14 + 26 - (1 - gE) * 230, top: 30 + 232 - (1 - gE) * 170, width: 460, height: 162, transformOrigin: '0 0', scale: '0.46', rotate: `${-(1 - gE) * 12}deg`}}>
              <GpuBody f={f} ang={seated ? ang : 0} glow={glow} rgbOn={lit} label="12 GB" />
            </div>
          ) : null}
          {/* RAM sticks dropping in */}
          <div style={{position: 'absolute', left: 14, top: 30, width: 252, height: 500}}>{ramStick(1, 0)}{ramStick(3, 1)}</div>
          {/* glass panel: tint + reflections; slides off and fades as `open` rises */}
          <div style={{position: 'absolute', left: 14 - op * 310, top: 30, width: 252, height: 500, overflow: 'hidden', borderRadius: 6, opacity: 1 - c01(op * 1.25), background: 'rgba(70,92,140,0.16)'}}>
            <div style={{position: 'absolute', left: -40, top: -60, width: 70, height: 700, rotate: '18deg', background: 'rgba(255,255,255,0.075)'}} />
            <div style={{position: 'absolute', left: 78, top: -60, width: 22, height: 700, rotate: '18deg', background: 'rgba(255,255,255,0.06)'}} />
          </div>
        </div>
      </Frame>
    );
  };

// A graphics card, side on: dark shroud, two fans that spin, bracket, backplate edge, gold fingers, an RGB edge strip and a "12 GB" plate. No brand marks.
// (x, y) = the middle of the card's front face. Plain card is 460×160 at s = 1. rgb 0–1 = how lit the edge strip and fan rims are (0 = grey); spinAt = frame the fans spin up from (omit = spinning);
// fanAngle = fan angle in degrees, set by the scene (overrides spinAt; integrate your own speed curve to spin the fans up); label = the plate text ('' hides it). glow = fixed RGB colour.
//
// SUITCASE MODE (suitcase): the same card as a hard-shell case, 560×270 at s = 1, front face centred on (x, y): corner guards, two fan faces, RGB strip along the bottom, a backplate end, a brass zipper along the seam and a
// luggage tag. open 0–1 swings the lid up on its back hinge (0 = shut, 1 = standing open); zip 0–1 runs the slider left to right along the closed seam (an unzipped V-gap opens ahead of it);
// strain 0–1 makes the teeth shudder and a few pop out (the open case being overstuffed); tag = tag text ('12 GB'); lining = the colour of the inside of the case and lid (default dusty maroon), tagSide = which corner it hangs from ('left' default, or 'right'), tagSwing = tag tilt in degrees, tagFlash 0–1 = it flashes and puffs up;
// tail > 0 lets a whale tail peek out of the right end of the seam (amplitude of its wag; the zipper then stops short of the end).
// children are drawn INSIDE the case, between the lid and the front face, in scene coordinates (not scaled by s): put the Whale there and the front face hides its lower half.
export const GpuCard: React.FC<{x: number; y: number; s?: number; rot?: number; rgb?: number; spinAt?: number; fanAngle?: number; label?: string; glow?: string;
  suitcase?: boolean; open?: number; zip?: number; strain?: number; lining?: string; tag?: string; tagSide?: 'left' | 'right'; tagSwing?: number; tagFlash?: number; tail?: number; children?: React.ReactNode}> =
  ({x, y, s = 1, rot = 0, rgb: rgbAmt = 1, spinAt = -9999, fanAngle, label = '12 GB', glow, suitcase = false, open = 0, zip = 0, strain = 0, lining = '#7A3B4A', tag = '12 GB', tagSide = 'left', tagSwing = 0, tagFlash = 0, tail = 0, children}) => {
    const f = useCurrentFrame();
    const ang = fanAngle ?? fanAng(f, spinAt);
    const lit = c01(rgbAmt);
    if (!suitcase) {
      return (
        <Frame x={x} y={y} ax={80 + 230} ay={50 + 80} w={460 + 160} h={160 + 100} s={s} rot={rot} lift={6}
          under={lit > 0 ? <Glow cx={310} cy={130} rx={300} ry={130} color={glow ?? hsl(f * 1.8 + 100, 90, 56)} a={0.26 * lit} /> : null}>
          <div style={{position: 'absolute', left: 80, top: 50, width: 460, height: 162}}>
            <GpuBody f={f} ang={ang} glow={glow} rgbOn={lit} label={label || undefined} />
          </div>
        </Frame>
      );
    }
    // geometry of the suitcase, local box coordinates (box = padL 70, padT 70)
    const SW = 560, LMAX = 250, TD = 70, FY = 320, FH = 270, PL = 70, PT = 80;
    const th = c01(open) * (105 * Math.PI) / 180;
    const Yf = LMAX + TD * Math.cos(th) - LMAX * Math.sin(th);   // y of the lid's free edge
    const inner = Yf < LMAX;
    const lidTop = Math.min(LMAX, Yf), lidH = Math.max(2, Math.abs(LMAX - Yf));
    const SHELL = '#2B2F35', SHELL_HI = '#3F454E', LINING = lining, LINING_LO = mixHex(lining, -0.3), LINING_HI = mixHex(lining, 0.14), LINING_DK = mixHex(lining, -0.6);
    const closed = open < 0.12;
    const slot = 34 + c01(zip) * (SW - 68 - (tail > 0 ? 96 : 0));   // zipper slider x
    const gapMax = 34;
    const rgbEdge = lit > 0 ? 1 : 0;
    const fans = [170, 390];
    // zipper teeth
    const tooth = (key: string, tx: number, ty: number, r = 0, sizeW = 11, sizeH = 9, ofs = 0) => (
      <Slab key={key} x={tx - sizeW / 2} y={ty - sizeH / 2 + ofs} w={sizeW} h={sizeH} color={C.brass} hi="#E3BE72" hiH={0.3} shade={C.brassLo} shadeH={0.3} r={2} rot={r} />
    );
    const pop = (i: number) => (strain > 0 && i % 6 === 2 ? -(8 + random(`pop${i}`) * 20) * strain : 0);
    const jit = (i: number) => (strain > 0 ? (random(`j${i}-${Math.floor(f / 2)}`) - 0.5) * 6 * strain : 0);
    const teethOpen: React.ReactNode[] = [];
    if (!closed) {
      for (let i = 0; i < 33; i++) {
        const tx = 22 + i * 16.2;
        teethOpen.push(tooth(`b${i}`, tx, FY + 2, 0, 11, 11, (i % 2 ? 2 : -2) + pop(i) * 0.4 + jit(i)));
      }
    }
    const teethClosed: React.ReactNode[] = [];
    if (closed) {
      for (let i = 0; i < 40; i++) {
        const tx = 22 + i * 13.4;
        if (tx < slot - 8) teethClosed.push(tooth(`z${i}`, tx, FY + 1, 0, 11, 9, i % 2 ? 2.5 : -2.5));
        else if (tx > slot + 14 && zip < 1 - 1e-6 || (tail > 0 && tx > slot + 14)) {
          const gap = Math.min(gapMax, (tx - slot) * 0.16);
          teethClosed.push(tooth(`l${i}`, tx, FY + 3, 0, 11, 9, 0));
          teethClosed.push(tooth(`u${i}`, tx, FY - 6 - gap, -Math.atan(0.16) * 57.3, 11, 9, 0));
        }
      }
    }
    const peekX = SW - 52;
    const tagFlashC = c01(tagFlash);
    return (
      <>
        {/* back layers: interior, lid, seam opening, tail */}
        <Frame x={x} y={y} ax={PL + SW / 2} ay={PT + FY + FH / 2} w={SW + 2 * PL} h={PT + FY + FH + 90} s={s} rot={rot} lift={6}>
          <div style={{position: 'absolute', left: PL, top: PT, width: SW, height: FY + FH}}>
            {/* interior opening (top face): dusty lining with a darker back wall */}
            <Slab x={0} y={LMAX} w={SW} h={TD + 8} color={LINING_LO} hi={LINING} hiH={0.35} r="14px 14px 0 0" />
            <Slab x={8} y={LMAX + 10} w={SW - 16} h={TD - 4} color={LINING_DK} r="10px 10px 0 0" style={{opacity: 0.7}} />
            {/* lid */}
            <div style={{position: 'absolute', left: 0, top: lidTop, width: SW, height: lidH}}>
              {inner ? (
                <Slab x={0} y={0} w={SW} h={lidH} color={LINING} hi={LINING_HI} hiH={0.06} shade={LINING_LO} shadeH={0.1} r="18px 18px 0 0">
                  {[0.3, 0.52, 0.74].map((p, i) => <div key={i} style={{position: 'absolute', left: 22, right: 22, top: lidH * p, height: 4, background: LINING_LO, opacity: 0.6, borderRadius: 2}} />)}
                  <Slab x={SW * 0.1} y={lidH * 0.5} w={SW * 0.3} h={Math.max(0, lidH * 0.28)} color={mixHex(lining, 0.08)} shade={LINING_LO} shadeH={0.25} r={8} />
                  {/* free edge with zipper teeth */}
                  <Slab x={10} y={4} w={SW - 20} h={14} color="#14161A" r={7} />
                  {Array.from({length: 33}).map((_, i) => tooth(`lt${i}`, 24 + i * 16.2, 11, 0, 11, 9, (i % 2 ? -2 : 2) + jit(i + 50)))}
                </Slab>
              ) : (
                <Slab x={0} y={0} w={SW} h={lidH} color={SHELL} hi={SHELL_HI} hiH={0.22} shade="#1E2125" shadeH={0.2} r="18px 18px 4px 4px">
                  {lidH > 40 ? (
                    <>
                      <Slab x={SW / 2 - 70} y={lidH * 0.18} w={140} h={Math.min(34, lidH * 0.5)} color="#15171A" r={17} />
                      <Slab x={SW / 2 - 56} y={lidH * 0.18 + 6} w={112} h={Math.min(22, lidH * 0.3)} color="#0A0B0D" r={11} />
                      <Disc x={SW / 2 - 70} y={lidH * 0.18 + Math.min(34, lidH * 0.5) / 2} d={13} color={C.brass} />
                      <Disc x={SW / 2 + 70} y={lidH * 0.18 + Math.min(34, lidH * 0.5) / 2} d={13} color={C.brass} />
                    </>
                  ) : null}
                  <Slab x={24} y={lidH - 12} w={SW - 48} h={4} color="#8C9598" r={2} style={{opacity: 0.8}} />
                </Slab>
              )}
            </div>
            {/* the opening on the seam while the lid is shut but the zipper has not reached the end */}
            {closed && (zip < 1 - 1e-6 || tail > 0) ? (
              <Cut x={slot - 4} y={FY - gapMax - 14} w={SW - slot} h={gapMax + 22} d={`M0 ${gapMax + 14} L${SW - slot} ${14} L${SW - slot} ${gapMax + 22} L0 ${gapMax + 22} Z`} color="#120A0D" style={{opacity: 0.96}} />
            ) : null}
            {tail > 0 ? (
              <div style={{position: 'absolute', left: peekX, top: FY - 2, width: 0, height: 0, scale: '0.62', transformOrigin: '0 0'}}>
                <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, rotate: `${90 + Math.sin(f / 7) * 14 * c01(tail)}deg`}}><TailPiece /></div>
              </div>
            ) : null}
          </div>
        </Frame>
        {children}
        {/* front layers: the face with fans, zipper, tag */}
        <Frame x={x} y={y} ax={PL + SW / 2} ay={PT + FY + FH / 2} w={SW + 2 * PL} h={PT + FY + FH + 90} s={s} rot={rot} lift={8}
          under={lit > 0 ? <Glow cx={PL + SW / 2} cy={PT + FY + FH - 6} rx={330} ry={90} color={glow ?? hsl(f * 1.8 + 100, 90, 56)} a={0.28 * lit} /> : null}>
          <div style={{position: 'absolute', left: PL, top: PT, width: SW, height: FY + FH}}>
            <Slab x={0} y={FY} w={SW} h={FH} color={SHELL} hi={SHELL_HI} hiH={0.05} shade="#1A1D21" shadeH={0.12} r="8px 8px 28px 28px" />
            {/* backplate end */}
            <Slab x={SW - 52} y={FY + 22} w={36} h={FH - 56} color="#9AA3A7" hi="#C9D0D3" hiH={0.06} shade="#778186" shadeH={0.08} r={6} />
            {[0, 1, 2, 3, 4].map((i) => <Slab key={i} x={SW - 44} y={FY + 44 + i * 36} w={20} h={9} color="#59626A" r={4} />)}
            {/* corner guards */}
            <Slab x={-6} y={FY - 6} w={54} h={54} color="#B1B9BC" hi="#D2D8DA" hiH={0.1} shade="#8C9598" shadeH={0.2} r="24px 6px 6px 6px" />
            <Slab x={SW - 48} y={FY - 6} w={54} h={54} color="#B1B9BC" hi="#D2D8DA" hiH={0.1} shade="#8C9598" shadeH={0.2} r="6px 24px 6px 6px" />
            <Slab x={-6} y={FY + FH - 48} w={54} h={54} color="#B1B9BC" hi="#D2D8DA" hiH={0.1} shade="#8C9598" shadeH={0.2} r="6px 6px 6px 26px" />
            <Slab x={SW - 48} y={FY + FH - 48} w={54} h={54} color="#B1B9BC" hi="#D2D8DA" hiH={0.1} shade="#8C9598" shadeH={0.2} r="6px 6px 26px 6px" />
            {[[16, FY + 12], [SW - 24, FY + 12], [16, FY + FH - 20], [SW - 24, FY + FH - 20]].map(([cx, cy], i) => <Disc key={i} x={cx + 6} y={cy + 6} d={9} color="#6A7377" />)}
            {/* fans */}
            {fans.map((cx, i) => <Fan key={i} cx={cx} cy={FY + 136} d={168} ang={ang} ring={lit > 0 ? rgb(f, i * 80, glow) : OFF} frame={false} glow={lit} />)}
            {/* RGB strip along the bottom edge */}
            <Strip x={44} y={FY + FH - 22} w={410} h={9} n={19} f={f} glow={glow} lit={rgbEdge * lit} glowPx={12} />
            {/* zipper: track, then teeth, then the slider */}
            <Slab x={12} y={FY - 9} w={SW - 24} h={17} color="#121417" r={8} />
            {teethOpen}
            {teethClosed}
            {closed ? (
              <>
                <Slab x={slot - 16} y={FY - 16} w={34} h={30} color={C.brass} hi="#E3BE72" hiH={0.3} shade={C.brassLo} shadeH={0.3} r={7} />
                <div style={{position: 'absolute', left: slot + 1, top: FY + 10, width: 0, height: 0, rotate: `${Math.sin(f / 7) * 3 + 6}deg`}}>
                  <Slab x={-8} y={0} w={16} h={44} color="#C9573C" shade="#9C3F2A" shadeH={0.25} r={8}><Disc x={8} y={11} d={7} color="#2B2F35" /></Slab>
                </div>
              </>
            ) : null}
            {/* luggage tag, tied to the left corner guard */}
            <div style={{position: 'absolute', left: tagSide === 'right' ? SW - 58 : 58, top: FY + 24, width: 0, height: 0, rotate: `${tagSwing}deg`, scale: String(1 + 0.12 * tagFlashC), transformOrigin: '0 0'}}>
              {tagFlashC > 0 ? <Glow cx={6} cy={78} rx={140} ry={90} color="#FFD36B" a={0.7 * tagFlashC} /> : null}
              <Slab x={-4} y={-6} w={8} h={36} color="#14161A" r={4} />
              <Disc x={0} y={-8} d={22} color={C.brass} shade={C.brassLo} />
              <Disc x={0} y={-8} d={10} color="#14161A" />
              <Slab x={tagSide === 'right' ? -84 : -66} y={22} w={150} h={84} color={tagFlashC > 0.5 ? '#FFF0B0' : '#E8D6A0'} hi="#F5E9C4" hiH={0.08} shade="#CDB87E" shadeH={0.12} r={10}>
                <Disc x={20} y={20} d={14} color="#2B2F35" />
                <div style={{position: 'absolute', left: 10, right: 0, top: 22, bottom: 0, display: 'grid', placeItems: 'center', fontFamily: FONT.label, fontWeight: 800, fontSize: 46, color: C.ink, whiteSpace: 'nowrap'}}>{tag}</div>
              </Slab>
            </div>
          </div>
        </Frame>
      </>
    );
  };

// A closed, zipped GpuCard suitcase with a whale tail peeking out of the end of the zipper. (x, y) = the middle of the front face; tag = luggage tag text;
// zip 0–1 (default 1 = zipped as far as the tail allows); tail = wag amplitude 0–1 (0 = no tail); rgb, s, rot as GpuCard. children go inside the case, in scene coordinates.
export const GpuCase: React.FC<{x: number; y: number; s?: number; rot?: number; tag?: string; tagSide?: 'left' | 'right'; tagSwing?: number; tagFlash?: number; zip?: number; tail?: number; rgb?: number; children?: React.ReactNode}> =
  ({x, y, s = 1, rot = 0, tag = '12 GB', tagSide = 'left', tagSwing = 0, tagFlash = 0, zip = 1, tail = 1, rgb: r = 1, children}) => (
    <GpuCard suitcase x={x} y={y} s={s} rot={rot} tag={tag} tagSide={tagSide} tagSwing={tagSwing} tagFlash={tagFlash} open={0} zip={zip} tail={tail} rgb={r}>{children}</GpuCard>
  );

// A memory module: green board, six chips, a cream label, gold fingers with the key notch, eject clips at both ends. (x, y) = the middle of the board; 360×84 at s = 1. label = text on the label ('16 GB'); rot turns it (90 = standing up).
export const RamStick: React.FC<{x: number; y: number; s?: number; rot?: number; label?: string}> = ({x, y, s = 1, rot = 0, label = '16 GB'}) => (
  <Frame x={x} y={y} ax={40 + 180} ay={30 + 48} w={440} h={168} s={s} rot={rot} lift={5}>
    <div style={{position: 'absolute', left: 40, top: 30, width: 360, height: 100}}>
      <Slab x={-4} y={30} w={10} h={26} color="#B1B9BC" shade="#8C9598" shadeH={0.25} r={3} />
      <Slab x={354} y={30} w={10} h={26} color="#B1B9BC" shade="#8C9598" shadeH={0.25} r={3} />
      <Slab x={0} y={0} w={360} h={84} color="#3D8A5E" hi="#52A476" hiH={0.05} shade="#2B6745" shadeH={0.1} r={6} />
      <Slab x={8} y={84} w={186} h={13} color={C.brass} hi="#E3BE72" hiH={0.3} shade={C.brassLo} shadeH={0.2} r={2} />
      <Slab x={208} y={84} w={144} h={13} color={C.brass} hi="#E3BE72" hiH={0.3} shade={C.brassLo} shadeH={0.2} r={2} />
      {Array.from({length: 26}).map((_, i) => <div key={i} style={{position: 'absolute', left: (i < 13 ? 12 : 212) + (i % 13) * (i < 13 ? 13.4 : 10.8), top: 86, width: 2, height: 9, background: C.brassLo, opacity: 0.7}} />)}
      {[12, 52, 92, 238, 278, 318].map((cx, i) => (
        <Slab key={i} x={cx} y={14} w={36} h={54} color="#1F2326" hi="#353B41" hiH={0.14} shade="#14171A" shadeH={0.14} r={3}>
          <Disc x={8} y={9} d={6} color="#5A626A" />
        </Slab>
      ))}
      <Slab x={130} y={12} w={102} h={52} color="#E7DDC9" hi="#F3ECDD" hiH={0.1} shade="#CDC0A8" shadeH={0.14} r={5}>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: FONT.mono, fontWeight: 700, fontSize: 28, color: C.ink, whiteSpace: 'nowrap'}}>{label}</div>
      </Slab>
    </div>
  </Frame>
);

// A tall dark rack of 1U units with vents, drive bays, blinking LEDs (stepped, seeded) and the odd fan. (x, y) = the floor point under the middle; w wide, h tall (before s).
// seed varies the blink pattern; fanSpeed 0 = fans still, 1 = steady, 3+ = roaring (spin haze); cascadeAt = frame a green wave runs down the units (top to bottom, 2 frames apart).
export const ServerRack: React.FC<{x: number; y: number; s?: number; w?: number; h?: number; seed?: string; fanSpeed?: number; cascadeAt?: number}> =
  ({x, y, s = 1, w = 210, h = 640, seed = 'rack', fanSpeed = 1, cascadeAt}) => {
    const f = useCurrentFrame();
    const PAD = 40, gap = 7;
    const n = Math.max(2, Math.floor((h - 70) / 59));
    const uh = (h - 52 - gap * (n - 1)) / n;
    const ledCols = [C.go, C.amber, '#4DA3FF', C.go];
    const ang = fanAng(f, -9999, 9 * fanSpeed);
    const blur = fanSpeed > 2.2 ? c01((fanSpeed - 2.2) / 2) : 0;
    return (
      <Frame x={x} y={y} ax={PAD + w / 2} ay={PAD + h + 16} w={w + 2 * PAD} h={h + 16 + 2 * PAD} s={s} lift={7}>
        <div style={{position: 'absolute', left: PAD, top: PAD, width: w, height: h + 16}}>
          <Slab x={12} y={h - 2} w={46} h={16} color="#15171A" r={4} />
          <Slab x={w - 58} y={h - 2} w={46} h={16} color="#15171A" r={4} />
          <Slab x={-5} y={-9} w={w + 10} h={16} color="#3A4047" hi="#4F565E" hiH={0.3} shade="#252A30" shadeH={0.3} r={5} />
          <Slab x={0} y={0} w={w} h={h} color="#2B2F34" hi="#3C4249" hiH={0.012} shade="#1B1E22" shadeH={0.03} r={8} />
          <Slab x={13} y={16} w={w - 26} h={h - 34} color="#14171A" r={4} />
          {Array.from({length: n}).map((_, i) => {
            const uy = 20 + i * (uh + gap);
            const casc = cascadeAt === undefined ? 0 : c01(1 - Math.abs(f - (cascadeAt + i * 2 + 3)) / 4);
            const hasFan = i % 4 === 1;
            const bays = i % 4 === 3;
            return (
              <React.Fragment key={i}>
                <Slab x={19} y={uy} w={w - 38} h={uh} color={casc > 0 ? '#3F5A48' : '#3B4148'} hi="#535A63" hiH={0.1} shade="#272B31" shadeH={0.25} r={4} />
                {!hasFan && !bays ? Array.from({length: 9}).map((_, k) => <Slab key={k} x={32 + k * 9} y={uy + 12} w={4} h={uh - 24} color="#15181B" r={2} />) : null}
                {bays ? Array.from({length: 4}).map((_, k) => (
                  <Slab key={k} x={30 + k * 28} y={uy + 9} w={23} h={uh - 18} color="#262A30" hi="#363B43" hiH={0.2} r={3}><Slab x={4} y={uh - 18 - 11} w={9} h={4} color="#14171A" r={2} /></Slab>
                )) : null}
                {hasFan ? <Fan cx={w - 80} cy={uy + uh / 2} d={uh - 12} ang={ang * (i % 8 === 1 ? 1 : -1)} ring="#2A2F36" frame={false} blur={blur} /> : null}
                {[0, 1, 2].map((k) => {
                  const per = 4 + Math.floor(random(`${seed}p${i}${k}`) * 6);
                  const on = random(`${seed}s${i}${k}${Math.floor(f / per)}`) > 0.42 || casc > 0.3;
                  const col = casc > 0.3 ? C.go : ledCols[(i + k) % ledCols.length];
                  return <Disc key={k} x={w - 38 - 18 - k * 19} y={uy + uh - 15} d={13} color={on ? col : '#1D2125'} style={{boxShadow: on ? `0 0 9px ${col}` : 'none'}} />;
                })}
              </React.Fragment>
            );
          })}
        </div>
      </Frame>
    );
  };

const WB = '#4F8FC0', WB_HI = '#7DB6DD', WB_LO = '#3A73A1', WF = '#3D77A3', WF_LO = '#2E5F86', WBELLY = '#EADFC9', WBELLY_LO = '#CFC3AE', WINK = '#1C2A3A';

// The whale's tail in its own frame: pivot at (0, 0), pointing left (-x). Stalk plus two-lobed flukes; rotate the wrapper to aim it.
const TailPiece: React.FC = () => (
  <>
    <Cut x={-110} y={-28} w={124} h={56} d="M124 0 C84 6 44 14 0 19 L0 37 C44 42 84 50 124 56 Z" color={WB} hi={WB_HI} hiH={0.2} shade={WB_LO} shadeH={0.28} />
    <Cut x={-238} y={-82} w={134} h={164} d="M134 82 C110 62 84 24 14 2 C40 34 48 58 52 82 C48 106 40 130 14 162 C84 140 110 100 134 82 Z" color={WF} hi="#5B93BF" hiH={0.18} shade={WF_LO} shadeH={0.22} />
    <Cut x={-206} y={-6} w={90} h={12} d="M0 6 C28 0 60 0 90 6 C60 12 28 12 0 6 Z" color={WF_LO} style={{opacity: 0.55}} />
  </>
);

// A whale tail on its own (peeking out of a case, or from behind a wall). (x, y) = where the stalk starts; rot 0 = pointing straight up, positive turns it clockwise; wag 0–1 sways it; s scales (1 = about 240 px long).
export const WhaleTail: React.FC<{x: number; y: number; s?: number; rot?: number; wag?: number}> = ({x, y, s = 1, rot = 0, wag = 0.6}) => {
  const f = useCurrentFrame();
  return (
    <Frame x={x} y={y} ax={290} ay={290} w={580} h={580} s={s} lift={5}>
      <div style={{position: 'absolute', left: 290, top: 290, width: 0, height: 0, rotate: `${90 + rot + Math.sin(f / 8) * 14 * wag}deg`}}><TailPiece /></div>
    </Frame>
  );
};

// A big friendly cut-paper whale facing right (face = -1 flips it), with a stitched tag on its flank. (x, y) = the middle of the whale; len = tip of tail to nose in px (300–800 works), default 700.
// squash 0–1 squeezes it (shorter and taller, the stuffed-in look); tailWag 0–1 sways the tail (default 0.5); tailUp = extra degrees the tail is raised; expr 'happy' | 'strain' | 'sleepy';
// tag = the stitched text ('125B'); tagScale pops the tag bigger (1 = normal); bob = idle float in px (default 3); rot turns it about its middle; spout 0–1 shows a little water fountain.
export const Whale: React.FC<{x: number; y: number; len?: number; rot?: number; face?: 1 | -1; squash?: number; tailWag?: number; tailUp?: number; expr?: 'happy' | 'strain' | 'sleepy'; tag?: string; tagScale?: number; bob?: number; spout?: number}> =
  ({x, y, len = 700, rot = 0, face = 1, squash = 0, tailWag = 0.5, tailUp = 0, expr = 'happy', tag = '125B', tagScale = 1, bob: bobAmp = 3, spout = 0}) => {
    const f = useCurrentFrame();
    const s = len / 800;
    const L = 270, T = 170, BW = 1000, BH = 620;
    const sq = c01(squash);
    const tailAng = tailUp + Math.sin(f / 9) * 13 * tailWag;
    const fin = 10 + Math.sin(f / 11) * 6;
    const body = 'M20 150 C70 146 130 128 200 100 C280 66 370 24 450 18 C530 12 584 62 588 138 C592 206 556 262 484 290 C410 318 316 322 240 288 C170 258 90 200 20 178 Z';
    return (
      <Frame x={x} y={y + bob(f, 52, bobAmp)} ax={L + 180} ay={T + 165} w={BW} h={BH} s={s} rot={rot} lift={9} style={{scale: `${s * face} ${s}`}}>
        <div style={{position: 'absolute', left: L, top: T, width: 590, height: 330, transformOrigin: '180px 165px', scale: `${1 - 0.2 * sq} ${1 + 0.15 * sq}`}}>
          {/* tail behind the body */}
          <div style={{position: 'absolute', left: 26, top: 164, width: 0, height: 0, rotate: `${tailAng}deg`}}><TailPiece /></div>
          {/* optional spout */}
          {spout > 0 ? [0, 1, 2].map((i) => {
            const u = ((f + i * 6) % 18) / 18;
            return <Cut key={i} x={456 + (i - 1) * 26 + (u - 0.5) * (i - 1) * 24} y={-34 - Math.sin(u * Math.PI) * 70 * spout} w={22} h={30} d="M11 0 C18 14 22 22 11 30 C0 22 4 14 11 0 Z" color="#BFE3F2" shade="#8FC4DE" shadeH={0.3} style={{opacity: 0.95 * spout}} />;
          }) : null}
          {/* body, belly and face details are clipped to the body outline */}
          <Cut x={0} y={0} w={590} h={330} d={body} color={WB} hi={WB_HI} hiH={0.22} shade={WB_LO} shadeH={0.2}>
            <Cut x={-10} y={0} w={620} h={340} d="M-10 164 C100 190 220 232 330 232 C440 232 540 202 600 164 L600 340 L-10 340 Z" color={WBELLY} shade={WBELLY_LO} shadeH={0.14} />
            {[0, 1, 2, 3].map((i) => (
              <Cut key={i} x={392 + i * 8} y={236 + i * 14} w={150 - i * 10} h={14} d="M0 5 C40 14 100 14 150 -2 C108 22 40 24 0 5 Z" color={WBELLY_LO} style={{opacity: 0.8}} />
            ))}
            <Disc x={522} y={198} d={64} color="#F2A39C" style={{opacity: expr === 'strain' ? 0.85 : 0.6}} />
          </Cut>
          {/* fins */}
          <Cut x={236} y={48} w={78} h={52} d="M0 52 C16 34 34 10 58 0 C58 24 66 40 78 52 Z" color={WF} hi="#5B93BF" hiH={0.2} shade={WF_LO} shadeH={0.25} />
          <Cut x={258} y={214} w={160} h={84} d="M0 8 C42 -8 116 4 158 66 C108 84 44 70 0 8 Z" color={WF} hi="#5B93BF" hiH={0.18} shade={WF_LO} shadeH={0.28} rot={fin} />
          {/* tag with stitches */}
          <div style={{position: 'absolute', left: 338 - 90, top: 118 - 52, width: 180, height: 104, rotate: '-4deg', scale: `${tagScale * face} ${tagScale}`, transformOrigin: '50% 50%'}}>
            <Slab x={0} y={0} w={180} h={104} color="#E8DCC0" hi="#F3EAD2" hiH={0.08} shade="#CDBE9C" shadeH={0.1} r={12}>
              <div style={{position: 'absolute', left: 7, top: 7, right: 7, bottom: 7, border: `3px dashed ${C.tag}`, borderRadius: 8}} />
              <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: FONT.banner, fontSize: 66, color: C.ink, letterSpacing: '0.02em', whiteSpace: 'nowrap'}}>{tag}</div>
            </Slab>
          </div>
          {/* face */}
          {expr === 'happy' ? (
            <>
              <Disc x={538} y={122} d={52} color="#1B2735" />
              <Disc x={528} y={110} d={17} color="#FFFFFF" />
              <Disc x={548} y={134} d={8} color="#FFFFFF" />
              <div style={{position: 'absolute', left: 486, top: 176, width: 92, height: 34, borderBottom: `8px solid ${WINK}`, borderRadius: '0 0 50% 50% / 0 0 100% 100%'}} />
            </>
          ) : null}
          {expr === 'sleepy' ? (
            <>
              <div style={{position: 'absolute', left: 520, top: 122, width: 46, height: 22, borderBottom: `8px solid ${WINK}`, borderRadius: '0 0 50% 50% / 0 0 100% 100%'}} />
              <div style={{position: 'absolute', left: 494, top: 186, width: 78, height: 24, borderBottom: `7px solid ${WINK}`, borderRadius: '0 0 50% 50% / 0 0 100% 100%'}} />
              <div style={{position: 'absolute', left: 566, top: 36 - Math.sin(f / 14) * 6, fontFamily: FONT.banner, fontSize: 54, color: '#CFE3F2', opacity: 0.9}}>z</div>
              <div style={{position: 'absolute', left: 600, top: -4 - Math.sin(f / 14 + 1) * 6, fontFamily: FONT.banner, fontSize: 40, color: '#CFE3F2', opacity: 0.8}}>z</div>
            </>
          ) : null}
          {expr === 'strain' ? (
            <>
              {/* squeezed eye: a > chevron, a big sweat drop and gritted teeth */}
              <Slab x={514} y={104} w={46} h={12} color={WINK} r={5} rot={32} />
              <Slab x={514} y={130} w={46} h={12} color={WINK} r={5} rot={-32} />
              <Slab x={494} y={84} w={66} h={10} color={WINK} r={4} rot={-14} />
              <Cut x={470 + Math.sin(f / 3) * 3} y={52 + ((f * 2) % 40)} w={30} h={42} d="M15 0 C24 18 30 28 15 42 C0 28 6 18 15 0 Z" color="#BFE3F2" shade="#8FC4DE" shadeH={0.3} />
              <Slab x={484} y={178} w={92} h={34} color={WINK} r={9}>
                {Array.from({length: 6}).map((_, i) => <Slab key={i} x={5 + i * 14} y={4} w={11} h={11} color="#FFFFFF" r={2} />)}
                {Array.from({length: 6}).map((_, i) => <Slab key={i} x={5 + i * 14} y={19} w={11} h={11} color="#FFFFFF" r={2} />)}
              </Slab>
            </>
          ) : null}
        </div>
      </Frame>
    );
  };

// Where a point of the whale's body lands in the scene, so a scene can aim arms, badges or sparkles at it. (bx, by) are in the whale's body box: tail root (26, 164), eye (538, 122), nose (588, 138), tag middle (338, 118), belly bottom (300, 322).
// Pass the same x, y, len, rot, face, squash as the <Whale>; bob must be 0 on the Whale (the idle float is not modelled).
export const whalePoint = (o: {x: number; y: number; len?: number; rot?: number; face?: 1 | -1; squash?: number}, bx: number, by: number) => {
  const {x, y, len = 700, rot = 0, face = 1, squash = 0} = o;
  const s = len / 800, sq = c01(squash);
  const dx = (bx - 180) * (1 - 0.2 * sq) * s * face, dy = (by - 165) * (1 + 0.15 * sq) * s;
  const a = (rot * Math.PI) / 180;
  return {x: x + dx * Math.cos(a) - dy * Math.sin(a), y: y + dx * Math.sin(a) + dy * Math.cos(a)};
};

// A puffy paper cloud with a cable socket on its underside. (x, y) = the middle of the cloud; w wide (height about 0.6 w). sad 0–1 fades in a worried face with a falling tear (0 = a plain cloud);
// deflate 0–1 squashes it flat; socket = draw the port; float = bob in px (default 4). cloudSocket() gives the port's scene position.
export const PaperCloud: React.FC<{x: number; y: number; w?: number; rot?: number; sad?: number; deflate?: number; socket?: boolean; float?: number}> = ({x, y, w = 380, rot = 0, sad = 0, deflate = 0, socket = true, float: fl = 4}) => {
  const f = useCurrentFrame();
  const s = w / 380, dfl = c01(deflate);
  const bumps: [number, number, number][] = [[-118, 26, 124], [-48, -26, 172], [52, -52, 192], [128, 8, 140], [4, 34, 156]];
  const face = c01(sad);
  const tear = (f % 44) / 44;
  return (
    <Frame x={x} y={y + bob(f, 64, fl)} ax={250} ay={200} w={500} h={400} s={s} rot={rot} lift={7} style={{scale: `${s * (1 + 0.07 * dfl)} ${s * (1 - 0.4 * dfl)}`, transformOrigin: '250px 270px'}}>
      <div style={{position: 'absolute', left: 250, top: 200, width: 0, height: 0}}>
        {/* shade layer, offset down and right */}
        <Slab x={-176 + 7} y={22 + 9} w={352} h={84} color="#B3BFCF" r={42} />
        {bumps.map(([bx, by, d], i) => <Disc key={`s${i}`} x={bx + 7} y={by + 9} d={d} color="#B3BFCF" />)}
        {/* front layer */}
        <Slab x={-176} y={22} w={352} h={84} color="#EEF2F6" shade="#D3DBE5" shadeH={0.3} r={42} />
        {bumps.map(([bx, by, d], i) => <Disc key={i} x={bx} y={by} d={d} color={i % 2 ? '#F1F4F8' : '#EBEFF4'} shade="#D3DBE5" />)}
        <Slab x={-150} y={22} w={300} h={66} color="#EEF2F6" r={33} style={{boxShadow: 'none'}} />
        {face > 0 ? (
          <div style={{position: 'absolute', left: 0, top: 0, opacity: face}}>
            {[-44, 44].map((ex, i) => (
              <React.Fragment key={i}>
                <Slab x={ex - 10} y={4} w={21} h={30} color="#2A3340" r="50%"><Disc x={8} y={9} d={8} color="#FFFFFF" /></Slab>
                <Slab x={ex - 21} y={-16 + (i ? 0 : 0)} w={42} h={7} color="#2A3340" r={3} rot={i ? 16 : -16} />
              </React.Fragment>
            ))}
            <div style={{position: 'absolute', left: -36, top: 50, width: 72, height: 30, borderTop: '8px solid #2A3340', borderRadius: '50% 50% 0 0 / 100% 100% 0 0'}} />
            <Cut x={-66} y={34 + tear * 54} w={16} h={24} d="M8 0 C13 10 16 15 8 24 C0 15 3 10 8 0 Z" color="#8EC5E6" style={{opacity: 1 - tear * 0.7}} />
          </div>
        ) : null}
        {socket ? (
          <>
            <Slab x={-44} y={86} w={88} h={42} color="#343A41" hi="#4A525B" hiH={0.2} shade="#22262B" shadeH={0.2} r={10} />
            <Slab x={-28} y={98} w={56} h={22} color="#0C0D0F" r={8} />
            <Slab x={-14} y={104} w={6} h={11} color={C.brass} r={2} />
            <Slab x={8} y={104} w={6} h={11} color={C.brass} r={2} />
          </>
        ) : null}
      </div>
    </Frame>
  );
};

/** Scene position of a PaperCloud's cable socket (the middle of the port), matching the cloud's x, y, w (ignores float and deflate). */
export const cloudSocket = (o: {x: number; y: number; w?: number}) => ({x: o.x, y: o.y + 109 * ((o.w ?? 380) / 380)});

// A paper speed dial: ticks, a green top band, a red needle that swings to value/max, and a pill label under the hub. (x, y) = the middle of the dial; d = outer diameter (default 360).
// value / max set the needle (it sweeps -125° to +125°; animate `value` from the scene, e.g. with a spring); label = text in the pill ('tok/s'); no numbers are printed on the dial.
export const SpeedGauge: React.FC<{x: number; y: number; d?: number; value: number; max?: number; label?: string; rot?: number}> = ({x, y, d = 360, value, max = 100, label = 'tok/s', rot = 0}) => {
  const f = useCurrentFrame();
  const sc = d / 360, v = c01(value / max);
  const a = -125 + 250 * v + Math.sin(f / 3) * 0.7 * (v > 0.02 ? 1 : 0);
  const marks = Array.from({length: 51}).map((_, i) => i);
  return (
    <Frame x={x} y={y} ax={230} ay={230} w={460} h={460} s={sc} rot={rot} lift={7}>
      <div style={{position: 'absolute', left: 230, top: 230, width: 0, height: 0}}>
        <Disc x={0} y={0} d={360} color="#2A2E33" shade="#1B1E22" />
        <Disc x={0} y={0} d={340} color="#3C4249" shade="#2A2F35" />
        <Disc x={0} y={0} d={318} color="#E6DCCA" shade="#CFC3AE" />
        {marks.map((i) => {
          const major = i % 5 === 0;
          const frac = i / 50;
          const col = frac > 0.68 ? C.go : frac < 0.18 ? C.nogo : C.ink;
          return (
            <div key={i} style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, rotate: `${-125 + frac * 250}deg`}}>
              <Slab x={-(major ? 4 : 2.5)} y={-148} w={major ? 8 : 5} h={major ? 34 : 20} color={major ? col : '#6A645A'} r={2} />
            </div>
          );
        })}
        {/* needle with a soft shadow, then hub */}
        <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, rotate: `${a}deg`}}>
          <div style={{position: 'absolute', left: -4, top: -118, width: 10, height: 160, background: 'rgba(0,0,0,0.25)', borderRadius: 5, translate: '5px 6px'}} />
          <Slab x={-5} y={-124} w={10} h={162} color={C.nogo} hi="#F0705F" hiH={0.2} shade="#A02A1E" shadeH={0.3} r="5px 5px 3px 3px" />
        </div>
        <Disc x={0} y={0} d={46} color="#2A2E33" shade="#1B1E22" />
        <Disc x={0} y={0} d={20} color={C.brass} shade={C.brassLo} />
        <Pill x={0} y={86} text={label} bg="#2A2E33" color="#EFE6D6" size={32} />
        <div style={{position: 'absolute', left: -150, top: -150, width: 300, height: 300, borderRadius: '50%', clipPath: 'polygon(0 0, 62% 0, 0 62%)', background: 'rgba(255,255,255,0.14)'}} />
      </div>
    </Frame>
  );
};
