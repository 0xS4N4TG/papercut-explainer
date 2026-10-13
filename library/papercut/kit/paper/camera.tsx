// Camera moves for papercut sets: parallax orbit (OrbitCamera + Depth layers), foreground pass, rack focus, snap zoom, pull-back reveal and freeze frame.
// A fake camera moving through a paper diorama; all motion from useCurrentFrame(). Moves transform the whole frame, so the banner zone (y < 420) and the caption band (y 1420-1580) move too: keep key props and faces out of both.
import React, {createContext, useContext, useId} from 'react';
import {AbsoluteFill, Easing, Freeze, interpolate, random, useCurrentFrame} from 'remotion';
import {C, FONT, H, W} from '../tokens';
import {Disc, GRAIN, Paper, Slab, Boil} from './kit';
import {Cable, PlugHead} from '../props/cable';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const rad = (d: number) => (d * Math.PI) / 180;

// ---------- motion blur: a smooth zoom smear ----------
// The sharp current frame sits underneath. On top, n sub-frame samples of the same transform are averaged (copy i of n at time
// f - shutter * (n-1-i)/(n-1), opacity 1/(i+1)), a CSS blur sized to the zoom speed melts the gaps between the copies, and a radial
// mask keeps the middle of the zoom sharp so only the outer ring smears, like a real zoom blur.
const Smear: React.FC<{n: number; shutter: number; blur: number; center: [number, number]; at: (t: number) => string; origin: string; children: React.ReactNode}> = ({n, shutter, blur, center, at, origin, children}) => {
  const f = useCurrentFrame();
  const cur = {transform: at(f), transformOrigin: origin};
  if (n <= 1) return <AbsoluteFill style={cur}>{children}</AbsoluteFill>;
  const mask = `radial-gradient(circle at ${center[0]}px ${center[1]}px, transparent 0px, transparent 100px, #000 460px)`;
  return (
    <>
      <AbsoluteFill style={cur}>{children}</AbsoluteFill>
      <AbsoluteFill style={{filter: `blur(${blur.toFixed(1)}px)`, WebkitMaskImage: mask, maskImage: mask}}>
        {Array.from({length: n}).map((_, i) => {
          const t = f - (shutter * (n - 1 - i)) / (n - 1);
          return <AbsoluteFill key={i} style={{transform: at(t), transformOrigin: origin, opacity: i === 0 ? 1 : 1 / (i + 1)}}>{children}</AbsoluteFill>;
        })}
      </AbsoluteFill>
    </>
  );
};
// How many samples a move needs this frame: none when it is slow, more as it speeds up. `speed` = scale change per frame.
const samplesFor = (speed: number, on: boolean) => (!on ? 1 : speed > 0.05 ? 12 : speed > 0.02 ? 7 : speed > 0.008 ? 4 : 1);
const blurFor = (speed: number) => Math.min(12, speed * 85);

// ---------- 1. parallax orbit ----------
const PERSP = 1600;
// One camera state shared with every <Depth> layer: yaw/pitch (deg), pan (px), dolly (translateZ px), an extra zoom, and a world track
// (side / lift, px) that each layer follows by 1 + (z - focus) * parallax, so far layers travel less than near ones.
type Cam = {
  yaw: number; pitch: number; panX: number; panY: number; dolly: number; zoom: number; side: number; lift: number; parallax: number;
  span: number; focus: number; origin: [number, number]; yawMax: number; panMax: number; dollyEnd: number; zoomEnd: number;
};
const CamCtx = createContext<Cam | null>(null);
const baseCam = (o: Partial<Cam> & Pick<Cam, 'span' | 'focus' | 'origin'>): Cam => ({
  yaw: 0, pitch: 0, panX: 0, panY: 0, dolly: 0, zoom: 1, side: 0, lift: 0, parallax: 0, yawMax: 0, panMax: 0, dollyEnd: 0, zoomEnd: 1, ...o,
});

// Parallax orbit: the camera arcs `yaw` degrees (16) around the focal plane while dollying to `push`, so <Depth z> layers separate. `origin` = pivot px (near the floor line), `depth` = layer spacing, `drift` = pan px.
export const OrbitCamera: React.FC<{dur: number; yaw?: number; drift?: [number, number]; push?: number; focus?: number; depth?: number; origin?: [number, number]; children: React.ReactNode}> = ({dur, yaw = 16, drift = [0, 0], push = 1.08, focus = 0.45, depth = 800, origin = [540, 1000], children}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, Math.max(1, dur)], [0, 1], {...clamp, easing: Easing.bezier(0.4, 0, 0.3, 1)});
  const cam = baseCam({
    yaw: (t - 0.5) * yaw, panX: drift[0] * t, panY: drift[1] * t, dolly: PERSP * (1 - 1 / push) * t,
    span: depth, focus, origin, yawMax: Math.abs(yaw) / 2, panMax: Math.max(Math.abs(drift[0]), Math.abs(drift[1])),
  });
  return <CamCtx.Provider value={cam}><AbsoluteFill>{children}</AbsoluteFill></CamCtx.Provider>;
};

// Depth layer in <OrbitCamera>: z 0 = backdrop (auto-oversized to cover), ~0.5 = props and cast, 1 = foreground. Lay each out at normal screen positions; the camera adds the parallax. Outside an OrbitCamera it is a plain fill.
export const Depth: React.FC<{z: number; cover?: boolean; children: React.ReactNode}> = ({z, cover, children}) => {
  const cam = useContext(CamCtx);
  if (!cam) return <AbsoluteFill>{children}</AbsoluteFill>;
  const tz = (z - cam.focus) * cam.span;
  const comp = (PERSP - tz) / PERSP;   // cancels the perspective shrink so the layer keeps its authored size at rest
  const sy = Math.sin(rad(cam.yawMax));
  // overscan so the layer's edges never show: its sideways shift, the far edge's foreshortening, a little vertical foreshortening
  const need = Math.abs(tz) * sy + cam.panMax + 540 * sy * (540 / PERSP) * 1.4 + 24;
  let bleed = (cover ?? z <= 0.1) ? 1.035 + need / 540 : 1;
  // a dolly zoom shrinks far layers: start them oversized by the shrink they will reach
  const endScale = ((PERSP - tz) / Math.max(60, PERSP - tz - cam.dollyEnd)) * cam.zoomEnd;
  if ((cover ?? z <= 0.1) && endScale < 1) bleed *= 1.03 / endScale;
  const trav = 1 + (z - cam.focus) * cam.parallax;   // how much of the world track this layer follows
  const tx = cam.panX - cam.side * trav, ty = cam.panY - cam.lift * trav;
  const d = Math.min(tz + cam.dolly, PERSP - 60);
  return (
    <AbsoluteFill style={{
      transformOrigin: `${cam.origin[0]}px ${cam.origin[1]}px`,
      transform: `perspective(${PERSP}px) translate(${tx}px, ${ty}px) rotateX(${cam.pitch}deg) rotateY(${cam.yaw}deg) translateZ(${d}px) scale(${comp * bleed * cam.zoom})`,
    }}>
      {children}
    </AbsoluteFill>
  );
};

// ---------- 2. foreground pass ----------
// A cut-paper monstera leaf, heart-shaped with slits cut in from the edge. Layers: a dark underside piece offset below, a light left
// half and darker right half, a lighter vein piece (midrib and side veins), and a stem. Drawn in a 760 x 1000 box; the stem joins at (380, 980).
const SLIT_Y = [800, 650, 510, 380];   // where each slit's tip sits, left of the midrib (the right side mirrors it)
const VEIN_Y = [790, 640, 505, 375, 270];
const BLADE = 'M380 880 C330 960 140 960 70 760 C10 600 60 300 200 130 C280 60 340 40 380 20 C420 40 480 60 560 130 C700 300 750 600 690 760 C620 960 430 960 380 880 Z';
const wedge = (tx: number, ty: number, side: 1 | -1) => {
  const dx = -0.82 * side, dy = -0.57, nx = -dy * side, ny = dx * side, L = 420, hw = 30;
  const pt = (px: number, py: number) => `${px.toFixed(1)},${py.toFixed(1)}`;
  const ex = tx + dx * L, ey = ty + dy * L;
  return `${pt(tx, ty)} ${pt(ex + nx * hw, ey + ny * hw)} ${pt(ex - nx * hw, ey - ny * hw)}`;
};
const MonsteraLeaf: React.FC<{light: string; dark: string; under: string; vein: string}> = ({light, dark, under, vein}) => {
  const id = useId().replace(/:/g, '');
  const veins = VEIN_Y.flatMap((vy, i) => ([1, -1] as const).map((side) => {
    const L = 250 - i * 22, dx = -0.82 * side, dy = -0.57, nx = -dy * side, ny = dx * side;
    const ex = 380 + dx * L, ey = vy + dy * L;
    return <polygon key={`${i}${side}`} points={`${380 + nx * 6},${vy + ny * 6} ${ex},${ey} ${380 - nx * 6},${vy - ny * 6}`} fill={vein} />;
  }));
  return (
    <>
      <defs>
        <mask id={`m${id}`} maskUnits="userSpaceOnUse" x={-200} y={-200} width={1200} height={1500}>
          <rect x={-200} y={-200} width={1200} height={1500} fill="#fff" />
          {SLIT_Y.flatMap((y) => ([1, -1] as const).map((side) => <polygon key={`${y}${side}`} points={wedge(380 - 85 * side, y, side)} fill="#000" />))}
        </mask>
        <clipPath id={`l${id}`}><rect x={-200} y={-200} width={580} height={1500} /></clipPath>
        <clipPath id={`r${id}`}><rect x={380} y={-200} width={580} height={1500} /></clipPath>
      </defs>
      <g mask={`url(#m${id})`}>
        <path d={BLADE} fill={under} transform="translate(10 14)" />
        <path d={BLADE} fill={light} clipPath={`url(#l${id})`} />
        <path d={BLADE} fill={dark} clipPath={`url(#r${id})`} />
        <polygon points="373,900 387,900 383,60 377,60" fill={vein} />
        {veins}
      </g>
      <polygon points="372,880 388,880 394,1320 366,1320" fill={dark} />
    </>
  );
};
const Leaf: React.FC = () => (
  <svg width={760} height={1000} viewBox="0 0 760 1000" style={{position: 'absolute', left: -380, top: -980, overflow: 'visible'}}>
    <g transform="rotate(-36 380 980) translate(60 120) scale(0.84)"><MonsteraLeaf light="#44703F" dark="#2F5532" under="#18301B" vein="#5E8A58" /></g>
    <MonsteraLeaf light="#6B9A5E" dark="#44744A" under="#1F3D22" vein="#A4C79A" />
  </svg>
);

// A chunky toy brick with two studs: front, lit top and shaded side. Centred on its middle.
const Brick: React.FC = () => (
  <svg width={620} height={480} viewBox="0 0 620 480" style={{position: 'absolute', left: -310, top: -240, overflow: 'visible'}}>
    <rect x={20} y={140} width={470} height={300} rx={16} fill="#C9573C" />
    <rect x={20} y={380} width={470} height={60} rx={16} fill="#A2432E" />
    <polygon points="490,140 590,50 590,350 490,440" fill="#9A3F2A" />
    <polygon points="20,140 110,50 590,50 490,140" fill="#E4795C" />
    {[[190, 96], [390, 96]].map(([cx, cy]) => (
      <g key={cx}>
        <rect x={cx - 56} y={cy - 4} width={112} height={34} fill="#B84C33" />
        <ellipse cx={cx} cy={cy + 30} rx={56} ry={20} fill="#B84C33" />
        <ellipse cx={cx} cy={cy - 4} rx={56} ry={20} fill="#F08C70" />
      </g>
    ))}
  </svg>
);

// Blurred paper object (kind leaf | cable | block) sweeps across the lens from the `from` side over `dur` frames from `at`, and a faint shadow dims the set. Put it last in the stack; `y` moves its anchor.
export const ForegroundPass: React.FC<{at: number; dur?: number; kind?: 'leaf' | 'cable' | 'block'; from?: 'left' | 'right'; y?: number; blur?: number; scale?: number; dim?: number}> = ({at, dur = 40, kind = 'leaf', from = 'left', y, blur: blurProp, scale = 1, dim = 0.2}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + dur) return null;
  const p = interpolate(f, [at, at + dur], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const dir = from === 'left' ? 1 : -1;
  const half = (kind === 'block' ? 400 : kind === 'cable' ? 260 : 620) * scale;
  const x = interpolate(p, [0, 1], from === 'left' ? [-half, W + half] : [W + half, -half]);
  const sway = interpolate(p, [0, 1], [-1, 1]) * dir;
  const shadow = dim * Math.sin(p * Math.PI);
  const cfg = {
    leaf: {y: 1850, rot: sway * 34, origin: '0 0'},
    cable: {y: -90, rot: sway * 11, origin: '0 0'},
    block: {y: 1330 - Math.sin(p * Math.PI) * 60, rot: sway * 14 - 6, origin: '0 0'},
  }[kind];
  const blur = blurProp ?? (kind === 'leaf' ? 8 : 14);   // the leaf is lit and detailed, so it gets less blur
  const filter = `drop-shadow(${14 * scale}px ${26 * scale}px ${26 * scale}px rgba(0,0,0,0.32)) blur(${blur}px)`;
  return (
    <>
      <AbsoluteFill style={{backgroundColor: '#000', opacity: shadow}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, pointerEvents: 'none', filter,
        transform: `translate(${x}px, ${y ?? cfg.y}px) rotate(${cfg.rot}deg) scale(${scale * (kind === 'leaf' ? 1.05 : 1)})`, transformOrigin: cfg.origin}}>
        {kind === 'leaf' ? <Leaf /> : null}
        {kind === 'block' ? <Brick /> : null}
        {kind === 'cable' ? (
          <div style={{position: 'absolute', left: -540, top: 0, width: W, height: H}}>
            <Cable d="M540 0 C520 340 600 560 560 900 C540 1040 520 1100 540 1180" color="#4A7DB5" lo="#355D8C" hi="#7BA7D8" width={130} />
            <PlugHead x={540} y={1250} rot={92} s={2.4} />
          </div>
        ) : null}
      </div>
    </>
  );
};

// ---------- 3. rack focus ----------

// Blur wrapper: eases blur `from` to `to` px over `dur` frames from `at`. Wrap the backdrop (set `bleed` to hide its soft edge) or a hero prop; use opposite pairs on two planes to pull focus between them. `returnAt` / `holdFrames` make it a there-and-back pull (host -> monitor -> host): after reaching `to` it holds, then eases back to `from` over `dur` frames, starting at `returnAt` (or at + dur + holdFrames).
export const RackFocus: React.FC<{from?: number; to?: number; at?: number; dur?: number; bleed?: boolean; returnAt?: number; holdFrames?: number; children: React.ReactNode}> = ({from = 0, to = 16, at = 0, dur = 14, bleed = false, returnAt, holdFrames, children}) => {
  const f = useCurrentFrame();
  let u = interpolate(f, [at, at + Math.max(1, dur)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  if (returnAt !== undefined || holdFrames !== undefined) {
    const rs = returnAt ?? at + Math.max(1, dur) + Math.max(0, holdFrames ?? 0);
    u *= 1 - interpolate(f, [rs, rs + Math.max(1, dur)], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  }
  const b = from + (to - from) * u;
  // a defocused plane breathes a touch larger; `bleed` adds the overscan that hides the blurred edge fading out
  const s = 1 + b * 0.0006 + (bleed ? b * 0.0045 : 0);
  return <AbsoluteFill style={{filter: b > 0.05 ? `blur(${b.toFixed(2)}px)` : undefined, transform: s > 1.0001 ? `scale(${s})` : undefined}}>{children}</AbsoluteFill>;
};

// ---------- 4. snap zoom ----------
const noise = (seed: string, t: number) => {
  const k = Math.floor(t), a = random(`${seed}${k}`) * 2 - 1, b = random(`${seed}${k + 1}`) * 2 - 1;
  return a + (b - a) * (t - k);
};
const snapAt = (t: number, to: number, settle: number) => {
  if (t < 0) return 1;
  const up = interpolate(t, [0, 4], [1, to], {...clamp, easing: Easing.out(Easing.cubic)});
  const relax = interpolate(t, [4, 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const creep = interpolate(t, [18, 90], [0, 1], clamp) * 0.015;
  return t <= 4 ? up : to + (settle - to) * relax + creep;
};

// Punch-in to the focal point (x, y): 1 to `to` (1.25) in 4 frames with radial motion blur, a 3-frame shake and a little roll, then settles at `settle`. For numbers and joke landings: `at` = the frame the thing lands.
export const SnapZoom: React.FC<{at: number; x?: number; y?: number; to?: number; settle?: number; shake?: number; roll?: number; blur?: boolean; children: React.ReactNode}> = ({at, x = 540, y = 960, to = 1.25, settle = 1.17, shake = 18, roll = 1.4, blur = true, children}) => {
  const f = useCurrentFrame();
  const tf = (t: number) => {
    const u = t - at;
    const s = snapAt(u, to, settle);
    const k = Math.max(0, u - 2.5);
    const amp = u < 2.5 ? 0 : shake * Math.exp(-k / 1.3);
    const dx = amp * noise('sz-x', u), dy = amp * 0.8 * noise('sz-y', u);
    const rr = u < 2.5 ? 0 : roll * Math.exp(-k / 2.6) * Math.sin(k * 1.9);
    const pull = (s - 1) * 0.3;   // the focal point drifts a little toward the middle of the frame
    return `translate(${dx + (540 - x) * pull}px, ${dy + (960 - y) * pull}px) rotate(${rr}deg) scale(${s})`;
  };
  const speed = Math.abs(snapAt(f - at, to, settle) - snapAt(f - at - 1, to, settle));
  return <Smear n={samplesFor(speed, blur)} shutter={0.9} blur={blurFor(speed)} center={[x, y]} at={tf} origin={`${x}px ${y}px`}>{children}</Smear>;
};

// ---------- 5. pull-back reveal ----------
const pullAt = (t: number, dur: number, from: number) => interpolate(t, [0, Math.max(1, dur)], [from, 1], {...clamp, easing: Easing.bezier(0.16, 0.84, 0.3, 1)});

// Pull-back reveal: starts `from`x (2.8) tight on the detail at (x, y), eases out to the whole set over `dur` frames with motion blur on the first frames. Edges stay covered. Shows scale.
export const PullBack: React.FC<{dur: number; x: number; y: number; from?: number; at?: number; blur?: boolean; children: React.ReactNode}> = ({dur, x, y, from = 2.8, at = 0, blur = true, children}) => {
  const f = useCurrentFrame();
  // where the detail should sit at the start: screen middle, clamped so no edge of the set shows
  const t0x = Math.min(0, Math.max(W * (1 - from), W / 2 - from * x));
  const t0y = Math.min(0, Math.max(H * (1 - from), 880 - from * y));
  const tf = (t: number) => {
    const s = pullAt(t - at, dur, from), u = (s - 1) / Math.max(0.001, from - 1);
    return `translate(${t0x * u}px, ${t0y * u}px) scale(${s})`;
  };
  const speed = Math.abs(pullAt(f - at, dur, from) - pullAt(f - at - 1, dur, from));
  // the zoom's fixed point (where the smear stays sharp) is constant: -t0 / (from - 1)
  return <Smear n={samplesFor(speed / 2, blur)} shutter={0.8} blur={blurFor(speed / 2)} center={[-t0x / (from - 1), -t0y / (from - 1)]} at={tf} origin="0px 0px">{children}</Smear>;
};

// ---------- 6. freeze frame ----------
const RecordMark: React.FC<{cx: number; cy: number; t: number}> = ({cx, cy, t}) => {
  const pop = interpolate(t, [0, 2, 4, 6], [0.2, 1.25, 0.94, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const spin = Math.sin(t * 1.15) * 38 * Math.exp(-t / 9);   // scrubbed back and forth, then stops
  const D = 164;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${cx}px ${cy}px`, transform: `scale(${pop}) rotate(${spin}deg)`}}>
        <Paper lift={5}>
          <Disc x={cx} y={cy} d={D} color="#2A2A30" shade="#1A1A1F" />
          <Disc x={cx} y={cy} d={D * 0.76} color="#34343B" />
          <Disc x={cx} y={cy} d={D * 0.52} color="#2A2A30" />
          <Disc x={cx} y={cy} d={D * 0.34} color={C.tag} />
          <Slab x={cx - 4} y={cy - D / 2 + 6} w={8} h={D / 2 - 14} color="#5A5A66" r={3} style={{transformOrigin: '50% 100%', opacity: 0.6}} />
          <Disc x={cx} y={cy} d={9} color={C.creamHi} />
        </Paper>
      </div>
      {/* the scratch: a cut zigzag across the disc, plus three screech marks */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${cx}px ${cy}px`, transform: `scale(${pop}) rotate(-12deg)`, opacity: t < 1 ? 0 : 1}}>
        <Paper lift={3}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
            <polygon fill={C.creamHi} points={`${cx - 92},${cy - 26} ${cx - 34},${cy - 6} ${cx - 54},${cy + 2} ${cx + 6},${cy + 22} ${cx - 10},${cy + 26} ${cx + 94},${cy + 50} ${cx + 12},${cy + 8} ${cx + 34},${cy} ${cx - 28},${cy - 22} ${cx - 8},${cy - 26}`} />
          </svg>
          {[-58, -18, 22].map((a, i) => (
            <Slab key={a} x={cx + 78} y={cy - 4 - i * 0} w={44 - i * 6} h={9} r={4} color={C.creamHi} rot={a} style={{transformOrigin: `-78px 4px`}} />
          ))}
        </Paper>
      </div>
    </>
  );
};

// Meme beat: holds the child on frame `at` (Freeze), desaturates, darkens the edges, then slaps on a torn paper `label` (at x, y) with a stamp bounce and a record-scratch mark (left|right). Pair with SFX `scratch` at `at`.
export const FreezeFrame: React.FC<{at: number; label?: string; x?: number; y?: number; rot?: number; size?: number; mark?: 'left' | 'right' | false; children: React.ReactNode}> = ({at, label, x = 540, y = 1190, rot = -3, size: sizeProp, mark = 'right', children}) => {
  const f = useCurrentFrame();
  const t = f - at;
  const on = t >= 0;
  const sat = interpolate(t, [0, 4], [1, 0.55], clamp);
  const punch = interpolate(t, [0, 3], [1, 1.035], {...clamp, easing: Easing.out(Easing.cubic)});
  const vig = interpolate(t, [0, 6], [0, 1], clamp);
  const flash = interpolate(t, [0, 1, 3], [0.4, 0.4, 0], clamp);
  const lt = t - 3;   // the label lands three frames after the freeze
  const size = sizeProp ?? (label ? Math.max(46, Math.min(92, 880 / (0.52 * label.length))) : 80);
  const lw = label ? size * 0.52 * label.length + 100 : 0;
  const sc = interpolate(lt, [0, 2, 4, 7], [2.4, 0.9, 1.06, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const lrot = rot + interpolate(lt, [0, 7], [-9, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: on ? `saturate(${sat.toFixed(3)}) contrast(1.05)` : undefined, transform: `scale(${punch})`}}>
        <Freeze frame={at} active={on}>{children}</Freeze>
      </AbsoluteFill>
      {on ? <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.62) 100%)', opacity: vig}} /> : null}
      {on ? <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash}} /> : null}
      {on && label && lt >= 0 ? (
        <Boil amp={1.4} rot={0.25} seed="freeze">
          <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${lrot}deg) scale(${sc})`}}>
            <div style={{position: 'absolute', inset: 0, translate: '10px 12px', rotate: '2.2deg', backgroundColor: C.tag, backgroundImage: `url(${GRAIN})`, backgroundSize: '420px', backgroundBlendMode: 'multiply', filter: 'url(#torn)'}} />
            <div style={{
              position: 'relative', backgroundColor: C.cream, backgroundImage: `url(${GRAIN})`, backgroundSize: '520px', backgroundBlendMode: 'multiply',
              padding: '16px 48px 26px', fontFamily: FONT.caption, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: C.ink, whiteSpace: 'nowrap',
              filter: 'url(#torn) drop-shadow(3px 9px 10px rgba(0,0,0,0.5))',
            }}>{label}</div>
            {[{left: -26, rotate: '-34deg'}, {right: -26, rotate: '34deg'}].map((p, i) => (
              <div key={i} style={{position: 'absolute', top: -14, width: 92, height: 36, background: C.tape, opacity: 0.8, filter: 'url(#torn)', ...p}} />
            ))}
          </div>
          {mark ? <RecordMark cx={mark === 'left' ? Math.max(110, x - lw / 2 + 30) : Math.min(W - 110, x + lw / 2 - 20)} cy={y - 112} t={lt - 2} /> : null}
        </Boil>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- 7. dolly zoom ----------

// Dolly zoom for the REALISATION beat ("oh no"): the subject layer (z = focus) holds its size, near layers swell and the backdrop shrinks and spreads. Build it from <Depth z> layers. `strength` 1.5; <1 reverses.
export const DollyZoom: React.FC<{dur: number; at?: number; strength?: number; grow?: number; focus?: number; depth?: number; origin?: [number, number]; children: React.ReactNode}> = ({dur, at = 0, strength = 1.5, grow = 0.04, focus = 0.45, depth = 1100, origin = [540, 1100], children}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [at, at + Math.max(1, dur)], [0, 1], {...clamp, easing: Easing.bezier(0.5, 0, 0.25, 1)});
  const Z = 1 + (strength - 1) * t;   // the subject plane scales by Z from the dolly, then 1/Z from the zoom: it stays put
  const cam = baseCam({
    dolly: PERSP * (1 - 1 / Z), zoom: (1 + grow * t) / Z, span: depth, focus, origin,
    dollyEnd: PERSP * (1 - 1 / strength), zoomEnd: (1 + grow) / strength,
  });
  return <CamCtx.Provider value={cam}><AbsoluteFill>{children}</AbsoluteFill></CamCtx.Provider>;
};

// ---------- 8. crab track ----------
// A horizontal blur that follows the speed of a track; `amount` is the blur in px (0 = none).
const TrackBlur: React.FC<{axis: 'x' | 'y'; amount: number; children: React.ReactNode}> = ({axis, amount, children}) => {
  const id = useId().replace(/:/g, '');
  const on = amount > 0.4;
  return (
    <AbsoluteFill style={{filter: on ? `url(#tb${id})` : undefined}}>
      {on ? <svg width={0} height={0} style={{position: 'absolute'}}><filter id={`tb${id}`} x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation={axis === 'x' ? `${amount.toFixed(1)} 0` : `0 ${amount.toFixed(1)}`} /></filter></svg> : null}
      {children}
    </AbsoluteFill>
  );
};

// Total frames a CrabTrack takes: a hold at every stop and a move between stops.
export const crabFrames = (stops: number[], hold = 14, move = 10) => stops.length * hold + (stops.length - 1) * move;

// Crab track (a flat side-on track) for LISTS, lineups and comparisons: slides along a set wider than the frame, easing to each x in `stops` (world px) and holding `hold` frames. Put layers in <Depth> (z 0.45 = items).
export const CrabTrack: React.FC<{stops: number[]; hold?: number; move?: number; at?: number; parallax?: number; focus?: number; blur?: boolean; children: React.ReactNode}> = ({stops, hold = 14, move = 10, at = 0, parallax = 0.5, focus = 0.45, blur = true, children}) => {
  const f = useCurrentFrame();
  const sideAt = (ff: number) => {
    const k = Math.max(0, ff - at), period = hold + move, i = Math.min(stops.length - 1, Math.floor(k / period));
    if (i >= stops.length - 1) return stops[stops.length - 1] - 540;
    const u = interpolate(k - i * period, [hold, hold + move], [0, 1], {...clamp, easing: Easing.bezier(0.6, 0, 0.2, 1)});
    return stops[i] + (stops[i + 1] - stops[i]) * u - 540;   // each stop puts its item on the frame's centre line
  };
  const cam = baseCam({side: sideAt(f), parallax, span: 1000, focus, origin: [540, 960]});
  const speed = Math.abs(sideAt(f) - sideAt(f - 1));
  return <CamCtx.Provider value={cam}><TrackBlur axis="x" amount={blur ? Math.min(18, speed * 0.13) : 0}>{children}</TrackBlur></CamCtx.Provider>;
};

// ---------- 9. crane ----------

// Crane for SCALE reveals and "meanwhile, below": a vertical move through a tall set (layers in <Depth>, world y = screen y at the top). `drop` descends `height` px through dollhouse floors; `rise` climbs and tilts to a high angle.
export const Crane: React.FC<{dur: number; height: number; mode?: 'rise' | 'drop'; at?: number; pitch?: number; parallax?: number; focus?: number; blur?: boolean; origin?: [number, number]; children: React.ReactNode}> = ({dur, height, mode = 'drop', at = 0, pitch, parallax = 0.35, focus = 0.45, blur = true, origin = [540, 1000], children}) => {
  const f = useCurrentFrame();
  const e = (ff: number) => interpolate(ff, [at, at + Math.max(1, dur)], [0, 1], {...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1)});
  const liftAt = (ff: number) => (mode === 'drop' ? height * e(ff) : height * (1 - e(ff)));
  const tilt = (pitch ?? (mode === 'rise' ? 14 : 0)) * (mode === 'rise' ? e(f) : 0);
  const cam = baseCam({lift: liftAt(f), pitch: tilt, parallax, span: 1000, focus, origin});
  const speed = Math.abs(liftAt(f) - liftAt(f - 1));
  return <CamCtx.Provider value={cam}><TrackBlur axis="y" amount={blur ? Math.min(20, speed * 0.1) : 0}>{children}</TrackBlur></CamCtx.Provider>;
};

// ---------- 10. POV mask ----------
const ring = (outer: string, inner: string) => `${outer}${inner}`;
const circleD = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const keyholeD = (x: number, y: number, s: number) => {
  const r = 200 * s, cy = y - 110 * s, a = 66 * s, yi = cy + Math.sqrt(r * r - a * a), yb = yi + 560 * s;
  return `M${x - a} ${yi}A${r} ${r} 0 1 1 ${x + a} ${yi}L${x + 170 * s} ${yb}L${x - 170 * s} ${yb}Z`;
};
const binoD = (x: number, y: number, s: number) => {
  const r = 320 * s, d = 205 * s, h = Math.sqrt(r * r - d * d);
  return `M${x} ${y - h}A${r} ${r} 0 1 0 ${x} ${y + h}A${r} ${r} 0 1 0 ${x} ${y - h}Z`;
};
const roundRectD = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
const FRAME_D = `M-2000 -2000H4000V4000H-2000Z`;
const clip = (d: string) => `path(evenodd, "${d}")`;

// POV mask for SPY and PRIVACY beats: the child is seen through a paper keyhole, lens, binoculars or phone viewfinder (`kind`) in a dark surround, with handheld sway and a crosshair `reticle`. (x, y) = view centre; `at` = raise frame.
export const PovMask: React.FC<{kind?: 'keyhole' | 'lens' | 'binoculars' | 'phone'; x?: number; y?: number; size?: number; reticle?: boolean; at?: number; sway?: number; zoom?: number; children: React.ReactNode}> = ({kind = 'binoculars', x = 540, y = 900, size = 1, reticle = true, at = 0, sway = 1, zoom = 1.12, children}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [at, at + 10], [2.4, 1], {...clamp, easing: Easing.out(Easing.cubic)});   // raising it: the hole shrinks onto the view
  const s = size * k;
  const sx = Math.sin(f / 11) * 9 * sway * (k > 1.05 ? 0 : 1), sy = Math.cos(f / 13) * 7 * sway * (k > 1.05 ? 0 : 1);
  const cx = x + sx, cy = y + sy;
  const inner = kind === 'keyhole' ? keyholeD(cx, cy, s) : kind === 'lens' ? circleD(cx, cy, 360 * s) : kind === 'binoculars' ? binoD(cx, cy, s) : roundRectD(cx - 430 * s, cy - 640 * s, 860 * s, 1280 * s, 64 * s);
  const view = interpolate(k, [1, 2.4], [zoom, 1], clamp);
  const trim = 24 * s;
  const rim = kind === 'keyhole' ? keyholeD(cx, cy, s * 1.16) : kind === 'lens' ? circleD(cx, cy, 360 * s + trim) : kind === 'binoculars' ? binoD(cx, cy, s * 1.06) : roundRectD(cx - 430 * s - 16, cy - 640 * s - 16, 860 * s + 32, 1280 * s + 32, 76 * s);
  const rimColor = kind === 'keyhole' || kind === 'lens' ? '#C89B4A' : '#2B2833';
  const paper = {backgroundImage: `url(${GRAIN})`, backgroundSize: '520px', backgroundBlendMode: 'multiply'} as const;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transformOrigin: `${x}px ${y}px`, transform: `translate(${-sx * 0.7}px, ${-sy * 0.7}px) scale(${view})`}}>{children}</AbsoluteFill>
      {/* the rim, then the dark surround; its shadow falls into the hole so the cut reads as thick paper */}
      <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0px 5px 7px rgba(0,0,0,0.55))'}}>
        <div style={{position: 'absolute', inset: 0, clipPath: clip(ring(rim, inner)), backgroundColor: rimColor, ...paper}} />
      </div>
      <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0px 7px 12px rgba(0,0,0,0.6))'}}>
        <div style={{position: 'absolute', inset: 0, clipPath: clip(ring(FRAME_D, rim)), backgroundColor: '#15131B', ...paper}} />
      </div>
      {kind === 'lens' ? (
        <div style={{position: 'absolute', inset: 0, rotate: '42deg', transformOrigin: `${cx}px ${cy}px`}}>
          <Paper lift={7}>
            <Slab x={cx + 360 * s + trim - 10} y={cy - 38 * s} w={460 * s} h={76 * s} color="#7F5231" shade="#5E3B22" shadeH={0.4} hi="#95653F" hiH={0.2} r={`${38 * s}px`} />
          </Paper>
        </div>
      ) : null}
      {kind === 'phone' ? <PhoneUi cx={cx} cy={cy} s={s} f={f} /> : null}
      {reticle ? <Reticle cx={cx} cy={cy} s={s} focusBox={kind === 'phone'} /> : null}
    </AbsoluteFill>
  );
};

// paper crosshair (or a viewfinder focus box)
const Reticle: React.FC<{cx: number; cy: number; s: number; focusBox: boolean}> = ({cx, cy, s, focusBox}) => {
  const c = focusBox ? '#F5C542' : '#E8DFD3', t = 6;
  const arm = (x0: number, y0: number, w: number, h: number) => <Slab key={`${x0}${y0}`} x={x0} y={y0} w={w} h={h} r={2} color={c} style={{opacity: 0.9}} />;
  if (focusBox) {
    const b = 130 * s;
    const sq = (x0: number, y0: number, w: number, h: number) => arm(x0, y0, w, h);
    return <Paper lift={2}>{[sq(cx - b, cy - b, b * 2, t), sq(cx - b, cy + b - t, b * 2, t), sq(cx - b, cy - b, t, b * 2), sq(cx + b - t, cy - b, t, b * 2)]}</Paper>;
  }
  const L = 110 * s, g = 34 * s;
  return <Paper lift={2}>{[arm(cx - g - L, cy - t / 2, L, t), arm(cx + g, cy - t / 2, L, t), arm(cx - t / 2, cy - g - L, t, L), arm(cx - t / 2, cy + g, t, L), <Disc key="d" x={cx} y={cy} d={10} color={c} />]}</Paper>;
};

// phone viewfinder furniture: corner brackets and a blinking REC dot
const PhoneUi: React.FC<{cx: number; cy: number; s: number; f: number}> = ({cx, cy, s, f}) => {
  const w = 430 * s, h = 640 * s, m = 34, L = 74, t = 8, c = '#F3EEE6';
  const corner = (sx: 1 | -1, sy: 1 | -1) => (
    <React.Fragment key={`${sx}${sy}`}>
      <Slab x={sx > 0 ? cx + w - m - L : cx - w + m} y={sy > 0 ? cy + h - m - t : cy - h + m} w={L} h={t} r={2} color={c} />
      <Slab x={sx > 0 ? cx + w - m - t : cx - w + m} y={sy > 0 ? cy + h - m - L : cy - h + m} w={t} h={L} r={2} color={c} />
    </React.Fragment>
  );
  return (
    <>
      <Paper lift={2}>{[corner(1, 1), corner(-1, 1), corner(1, -1), corner(-1, -1)]}</Paper>
      {Math.floor(f / 8) % 2 === 0 ? <Paper lift={2}><Disc x={cx - w + m + 30} y={cy - h + m + 64} d={26} color="#E04030" /></Paper> : null}
      <div style={{position: 'absolute', left: cx - w + m + 56, top: cy - h + m + 44, fontFamily: FONT.label, fontWeight: 800, fontSize: 28, color: c, letterSpacing: '0.08em'}}>REC</div>
    </>
  );
};

// ---------- 11. time ramp ----------
const smooth = (u: number) => { const k = Math.min(1, Math.max(0, u)); return k * k * (3 - 2 * k); };

// Time ramp (speed ramp / bullet time) for the DRAMATIC beat: remaps the child's clock. `segments` = [{until (outer frame), rate}]: 0.2 = slow-mo, 0 = frozen, >1 = fast with a trail; 1 after the last. `start` = inner frame at 0.
export const TimeRamp: React.FC<{segments: {until: number; rate: number}[]; start?: number; trail?: boolean; push?: number; children: React.ReactNode}> = ({segments, start = 0, trail = true, push = 0.05, children}) => {
  const f = useCurrentFrame();
  const E = 6;   // frames to blend from one rate to the next
  const rateAt = (t: number) => {
    let r = segments[0]?.rate ?? 1;
    for (let j = 0; j < segments.length; j++) r += ((segments[j + 1]?.rate ?? 1) - segments[j].rate) * smooth((t - segments[j].until) / E + 0.5);
    return r;
  };
  const clockAt = (t: number) => {   // integrate the rate curve from outer 0 to t
    let g = start;
    for (let u = 0; u < t; u += 0.5) g += rateAt(u + 0.25) * Math.min(0.5, t - u);
    return Math.max(0, g);
  };
  const r = rateAt(f);
  const slow = Math.min(1, Math.max(0, 1 - r));
  const zoom = 1 + push * slow;
  const n = trail && r > 1.3 ? 5 : 1;
  const shutter = 0.9;
  return (
    <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 55%', filter: slow > 0.05 ? `saturate(${(1 - 0.25 * slow).toFixed(3)})` : undefined}}>
      {Array.from({length: n}).map((_, i) => {
        const t = n === 1 ? f : f - (shutter * (n - 1 - i)) / (n - 1);
        return <AbsoluteFill key={i} style={{opacity: i === 0 ? 1 : 1 / (i + 1)}}><Freeze frame={clockAt(t)}>{children}</Freeze></AbsoluteFill>;
      })}
    </AbsoluteFill>
  );
};

// ---------- 12. dutch tilt, tilt shift ----------

// Dutch tilt for "things going wrong": the frame rolls to `deg` (10) with a back-ease snap from `at`, then judders on twos. Scaled up so the rotated frame still covers the canvas (a big crop at 1080 x 1920, so keep key props central).
export const DutchTilt: React.FC<{deg?: number; at?: number; judder?: number; children: React.ReactNode}> = ({deg = 10, at = 0, judder = 1, children}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [at, at + 7], [0, 1], {...clamp, easing: Easing.out(Easing.back(2.2))});
  const step = Math.floor(f / 2);
  const j = (random(`dj${step}`) * 2 - 1) * judder, j2 = (random(`dk${step}`) * 2 - 1) * judder, j3 = (random(`dl${step}`) * 2 - 1) * judder;
  const a = Math.abs(deg) + 1.2 * judder;
  const cover = Math.cos(rad(a)) + (H / W) * Math.sin(rad(a));
  const live = Math.min(1, Math.max(0, k));
  return (
    <AbsoluteFill style={{transform: `translate(${j2 * 6 * live}px, ${j3 * 5 * live}px) rotate(${deg * k + j * 0.9 * live}deg) scale(${1 + (cover - 1) * live})`}}>{children}</AbsoluteFill>
  );
};

// Tilt shift for MINIATURE scale ("a tiny paper world"): blurs the top and bottom bands so the diorama reads as a toy model, and lifts saturation. `focus` = sharp band centre (0-1), `band` = its height, `blur` = px at the edges.
export const TiltShift: React.FC<{focus?: number; band?: number; blur?: number; sat?: number; children: React.ReactNode}> = ({focus = 0.5, band = 0.3, blur = 14, sat = 1.15, children}) => {
  const pct = (v: number) => `${Math.min(100, Math.max(0, v * 100)).toFixed(1)}%`;
  const lo = focus - band / 2, hi = focus + band / 2;
  const mask = (soft: number, edge: number) => `linear-gradient(to bottom, #000 0%, #000 ${pct(lo - edge)}, transparent ${pct(lo + soft)}, transparent ${pct(hi - soft)}, #000 ${pct(hi + edge)}, #000 100%)`;
  const m1 = mask(0.03, 0.14), m2 = mask(0.0, 0.07);
  const layer = (b: number, m: string, key: string) => <AbsoluteFill key={key} style={{filter: `blur(${b}px) saturate(${sat})`, WebkitMaskImage: m, maskImage: m, transform: `scale(${1 + b * 0.005})`}}>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: `saturate(${sat}) contrast(1.04)`}}>{children}</AbsoluteFill>
      {layer(blur * 0.45, m1, 'a')}
      {layer(blur, m2, 'b')}
    </AbsoluteFill>
  );
};

// ---------- 13. focus hunt ----------
// The lens "hunting" for focus: a blur envelope with keys at 0, 4, 8, 13, 18 of 18 frames = radius 0, 8, 18, 5, 0, mapped to CSS px (peak ~12.6).
const huntBlur = (k: number) => 0.7 * interpolate(k, [0, 4 / 18, 8 / 18, 13 / 18, 1], [0, 8, 18, 5, 0], clamp);

// Focus pulse, the hunt alone on a static shot: it goes soft and snaps back over `dur` frames (18) from `at`. For REVEALS and emphasis (a number lands, a prop is named) without moving the camera.
export const FocusPulse: React.FC<{at: number; dur?: number; children: React.ReactNode}> = ({at, dur = 18, children}) => {
  const f = useCurrentFrame();
  const b = huntBlur(Math.min(1, Math.max(0, (f - at) / Math.max(2, dur))));
  return <AbsoluteFill style={{filter: b > 0.05 ? `blur(${b.toFixed(2)}px)` : undefined, transform: b > 0.05 ? `scale(${1 + b * 0.0045})` : undefined}}>{children}</AbsoluteFill>;
};

// Focus hunt for REVEALS: pushes in on a number or key prop at (x, y) from 1x to 1+`amount` (1 = 2x) over `dur` frames (30) with a hard ease, and the lens hunts for focus part-way through (starts at 10/30 of dur, lasts 18/30).
export const FocusHunt: React.FC<{at: number; dur?: number; amount?: number; x?: number; y?: number; children: React.ReactNode}> = ({at, dur = 30, amount = 1, x = 540, y = 960, children}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [at, at + Math.max(1, dur)], [0, 1], {...clamp, easing: Easing.bezier(0.8, 0, 0.2, 1)});
  const start = at + Math.round((10 * dur) / 30), len = Math.max(2, Math.round((18 * dur) / 30));
  return (
    <AbsoluteFill style={{transformOrigin: `${x}px ${y}px`, transform: `scale(${1 + amount * z})`}}>
      <FocusPulse at={start} dur={len}>{children}</FocusPulse>
    </AbsoluteFill>
  );
};

// ---------- handheld ----------
// Handheld camera for lit-by-fire and tense scenes: a slow, deterministic multi-sine drift (x, y, roll) plus a faint breathing scale. `amount` = px of drift, `roll` = deg, `rate` = frames per drift cycle; `settleAt` = the frame it eases (10 frames) to a locked-off shot. Scaled up just enough that the drifting frame still covers the canvas, so keep key props out of the outer ~15 px.
export const Handheld: React.FC<{amount?: number; roll?: number; rate?: number; settleAt?: number; children: React.ReactNode}> = ({amount = 6, roll = 0.35, rate = 54, settleAt, children}) => {
  const f = useCurrentFrame();
  const k = settleAt === undefined ? 1 : 1 - interpolate(f, [settleAt, settleAt + 10], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const w = (ph: number) => (0.6 * Math.sin((2 * Math.PI * f) / rate + ph) + 0.3 * Math.sin((2 * Math.PI * f) / (rate * 0.47) + ph * 1.7 + 1.3) + 0.15 * Math.sin((2 * Math.PI * f) / (rate * 0.23) + ph * 2.3 + 2.1)) / 1.05;
  const dx = amount * w(0.4) * k, dy = amount * 0.8 * w(2.5) * k, dr = roll * w(4.4) * k;
  const breathe = 0.004 * Math.sin((2 * Math.PI * f) / (rate * 1.6) + 0.9) * k;
  // the scale that keeps a frame translated by `amount` and rolled by `roll` covering the canvas (>= 1.012)
  const r = rad(roll);
  const need = Math.max(1.012, Math.cos(r) + (H / W) * Math.sin(r) + (2 * amount) / W + 0.004);
  const sc = 1 + (need - 1) * k + breathe;
  return <AbsoluteFill style={{transformOrigin: '50% 50%', transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${dr.toFixed(3)}deg) scale(${sc.toFixed(4)})`}}>{children}</AbsoluteFill>;
};
