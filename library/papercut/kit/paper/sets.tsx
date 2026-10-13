// Set building blocks: a room per set (tinted paper wall + floor band), generated decor props,
// and the whip-pan into the CTA. Light from the top-left everywhere.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, ROOM, RoomColor} from '../tokens';
import {Paper, Slab} from './kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Room: flat wall colour × mottled paper wall texture (multiply) + vignette, then a floor band.
// floorY is the floor line (characters stand on it). Captions sit on the floor band (y ≈ 1430–1560); keep faces above y 1400.
export const Room: React.FC<{color: RoomColor | string; floorY?: number; floor?: 'wood' | 'dark' | 'none'; skirting?: boolean}> = ({color, floorY = 1420, floor = 'wood', skirting = true}) => {
  const wall = color in ROOM ? ROOM[color as RoomColor] : color;
  return (
    <AbsoluteFill style={{backgroundColor: wall}}>
      <Img src={staticFile('assets/wall.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.85}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.32) 100%)'}} />
      {floor !== 'none' ? (
        <>
          <Slab x={-20} y={floorY} w={1120} h={1920 - floorY + 20} r={0} color={floor === 'wood' ? C.floor : C.boardLo} grain={0.6} />
          {floor === 'wood' ? [0.18, 0.43, 0.71].map((p, i) => (
            <div key={i} style={{position: 'absolute', left: 0, right: 0, top: floorY + 40 + i * 150 + p * 10, height: 4, background: C.floorLo, opacity: 0.8}} />
          )) : null}
          {skirting ? <Slab x={-20} y={floorY - 26} w={1120} h={30} r={0} color={C.woodLo} shade={C.floorLo} shadeH={0.35} /> : null}
          <AbsoluteFill style={{top: floorY, background: 'linear-gradient(rgba(0,0,0,0.28), rgba(0,0,0,0) 60px)', height: 80}} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// Decor props, cut from paper in code. (x, y) is the top-left; s scales the whole prop.
export const Plant: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 220 * s, height: 300 * s}}>
    <Paper lift={5}>
      {[[-38, 70, 20], [30, 40, -18], [-6, 10, 4], [52, 92, -40], [-62, 104, 38]].map(([dx, dy, r], i) => (
        <Slab key={i} x={(80 + dx) * s} y={dy * s} w={62 * s} h={150 * s} color={i % 2 ? '#4E7A4A' : '#3F6A3E'} hi="#6A9461" hiH={0.2} r="50% 50% 50% 50% / 70% 70% 30% 30%" rot={r} />
      ))}
      <Slab x={44 * s} y={170 * s} w={132 * s} h={120 * s} color="#B8643E" shade="#93492B" shadeH={0.2} r={`${6 * s}px ${6 * s}px ${22 * s}px ${22 * s}px`} />
      <Slab x={34 * s} y={160 * s} w={152 * s} h={28 * s} color="#C9744C" shade="#A2593A" shadeH={0.35} r={4} />
    </Paper>
  </div>
);
export const Lamp: React.FC<{x: number; y: number; s?: number; on?: boolean}> = ({x, y, s = 1, on = true}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 200 * s, height: 300 * s}}>
    {on ? <div style={{position: 'absolute', left: 10 * s, top: 92 * s, width: 180 * s, height: 200 * s, background: 'rgba(255,226,140,0.16)', clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0 100%)'}} /> : null}
    <Paper lift={5}>
      <Slab x={40 * s} y={20 * s} w={120 * s} h={80 * s} color={C.amber} shade={C.amberDim} shadeH={0.18} r={`${50 * s}px ${50 * s}px 4px 4px`} />
      <Slab x={95 * s} y={96 * s} w={12 * s} h={170 * s} color={C.inkSoft} r={3} />
      <Slab x={52 * s} y={262 * s} w={96 * s} h={22 * s} color={C.inkSoft} r={8} />
    </Paper>
  </div>
);
export const Corkboard: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => (
  <Paper lift={6}>
    <Slab x={x} y={y} w={w} h={h} color={C.woodHi} shade={C.wood} shadeH={0.04} r={8} />
    <Slab x={x + 22} y={y + 22} w={w - 44} h={h - 44} color="#B98B5B" shade="#A27748" shadeH={0.06} r={4} grain={0.9}>
      {Array.from({length: 40}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: `${(i * 37) % 97}%`, top: `${(i * 53) % 95}%`, width: 6, height: 6, borderRadius: '50%', background: '#8F6539', opacity: 0.6}} />
      ))}
    </Slab>
  </Paper>
);
export const Window: React.FC<{x: number; y: number; w?: number; h?: number; night?: boolean}> = ({x, y, w = 300, h = 400, night = true}) => (
  <Paper lift={4}>
    <Slab x={x} y={y} w={w} h={h} color={C.creamLo} r={4} />
    <Slab x={x + 18} y={y + 18} w={w - 36} h={h - 36} color={night ? '#1F2A44' : '#9DB7C9'} r={2}>
      {night ? [[0.2, 0.2], [0.7, 0.3], [0.4, 0.6], [0.8, 0.75], [0.15, 0.85]].map(([sx, sy], i) => <div key={i} style={{position: 'absolute', left: `${sx * 100}%`, top: `${sy * 100}%`, width: 6, height: 6, borderRadius: '50%', background: '#F3E6D3'}} />) : null}
      <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 10, background: C.creamLo}} />
      <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: 10, background: C.creamLo}} />
    </Slab>
    <Slab x={x - 34} y={y - 10} w={70} h={h + 20} color="#C9A04A" shade="#A8853B" shadeH={0.05} r="4px 4px 30px 30px" />
    <Slab x={x + w - 36} y={y - 10} w={70} h={h + 20} color="#C9A04A" shade="#A8853B" shadeH={0.05} r="4px 4px 30px 30px" />
  </Paper>
);
// Wall shelf with a few book spines.
export const Shelf: React.FC<{x: number; y: number; w: number; books?: number}> = ({x, y, w, books = 4}) => (
  <Paper lift={4}>
    {Array.from({length: books}).map((_, i) => (
      <Slab key={i} x={x + 20 + i * 52} y={y - 110 + (i % 2) * 14} w={44} h={110 - (i % 2) * 14} color={['#B8643E', '#5D7FA3', '#C9A04A', '#8A9A86', '#8C7BA8'][i % 5]} shade="rgba(0,0,0,0.18)" shadeH={0.1} r={3} />
    ))}
    <Slab x={x} y={y} w={w} h={22} color={C.wood} shade={C.woodLo} shadeH={0.4} r={3} />
  </Paper>
);

// Sticky note on a wall.
export const Sticky: React.FC<{x: number; y: number; s?: number; color?: string; rot?: number}> = ({x, y, s = 90, color = '#E8C95A', rot = 0}) => (
  <Paper lift={3}><Slab x={x} y={y} w={s} h={s} color={color} rot={rot} r={2} shade="rgba(0,0,0,0.1)" shadeH={0.15} /></Paper>
);

// Whip-pan into a set: the frame arrives from the right with a horizontal motion smear (~7 frames).
export const WhipIn: React.FC<{dur?: number; from?: number; children: React.ReactNode}> = ({dur = 7, from = 1080, children}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, dur], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const blur = Math.round(p * 60);
  return (
    <AbsoluteFill style={{translate: `${p * from}px 0px`, filter: blur > 0 ? 'url(#whip)' : undefined}}>
      {blur > 0 ? (
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <filter id="whip" x="-10%" y="0" width="120%" height="100%"><feGaussianBlur stdDeviation={`${blur} 0`} /></filter>
        </svg>
      ) : null}
      {children}
    </AbsoluteFill>
  );
};
