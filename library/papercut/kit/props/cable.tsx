// Plugging in: a fat ribbed paper cable (a cubic curve between two points), a plug head that rides its end, and a socket plate to plug into.
//   cablePath    builds the `d` for <Cable> from a start point S and an end point E, with a slack amount
//   Cable        the ribbed cable along any SVG path `d` (full frame; coordinates are frame pixels)
//   PlugHead     two-prong plug with a ribbed boot; place it on the cable's end point and rotate it to the cable's last tangent
//   SocketPlate  dark port block with two sockets and an LED, bolted to the side of a prop
// All paper (Slab / Disc inside <Paper>). Animate by moving S/E/`rot` from useCurrentFrame() in the scene; nothing here runs on its own.
import React from 'react';
import {C, H, W} from '../tokens';
import {Disc, Paper, Slab} from '../paper/kit';

// A point in frame pixels (1080 x 1920).
export type Pt = {x: number; y: number};

// Path for <Cable> from S to E: hangs from S, enters E from the left; slack 1 = lazy floor loop, 0 = near taut. Returns {d, c2}; aim a PlugHead along E - c2.
export const cablePath = (S: Pt, E: Pt, slack: number, sagS = 300, back = 150) => {
  const c1 = {x: S.x + 20, y: S.y + sagS * (0.35 + 0.65 * slack)};
  const c2 = {x: E.x - back * (0.6 + 0.4 * slack), y: E.y + 80 * slack};
  return {d: `M ${S.x} ${S.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${E.x} ${E.y}`, c2};
};

// A fat ribbed paper cable drawn along the SVG path `d` (frame pixels, use cablePath or your own); `width` = thickness px, `color`/`lo`/`hi` = body, rib/shadow and highlight.
export const Cable: React.FC<{d: string; color?: string; lo?: string; hi?: string; width?: number}> = ({d, color = '#4A7DB5', lo = '#355D8C', hi = '#7BA7D8', width = 30}) => (
  <Paper lift={4}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={d} fill="none" stroke={lo} strokeWidth={width + 7} strokeLinecap="round" transform="translate(2 4)" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
      <path d={d} fill="none" stroke={lo} strokeWidth={width} strokeLinecap="butt" strokeDasharray="3 25" opacity={0.5} />
      <path d={d} fill="none" stroke={hi} strokeWidth={5} strokeLinecap="round" transform="translate(-6 -7)" opacity={0.6} />
    </svg>
  </Paper>
);

// Two-prong plug, about 140 px long at s = 1. (x, y) = middle of the connector body; it points right and `rot` (deg) turns it about that middle, `s` scales it. boot/bootLo/bootHi = the ribbed boot's colours.
export const PlugHead: React.FC<{x: number; y: number; rot?: number; s?: number; boot?: string; bootLo?: string; bootHi?: string}> = ({x, y, rot = 0, s = 1, boot = '#4A7DB5', bootLo = '#355D8C', bootHi = '#6B9AD0'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, rotate: `${rot}deg`, scale: String(s), transformOrigin: '0 0'}}>
    <Paper lift={5}>
      {/* prongs */}
      <Slab x={30} y={-17} w={34} h={10} r={3} color={C.metal} shade={C.metalLo} shadeH={0.4} />
      <Slab x={30} y={7} w={34} h={10} r={3} color={C.metal} shade={C.metalLo} shadeH={0.4} />
      {/* body */}
      <Slab x={-26} y={-30} w={60} h={60} r={9} color="#E4E7E8" hi="#F6F7F7" hiH={0.14} shade="#B1B9BC" shadeH={0.22} />
      <Slab x={-8} y={-17} w={24} h={34} r={5} color="#C5CBCD" />
      {/* boot */}
      <Slab x={-74} y={-24} w={54} h={48} r={10} color={boot} hi={bootHi} hiH={0.14} shade={bootLo} shadeH={0.25} />
      {[-62, -48, -34].map((bx) => <Slab key={bx} x={bx} y={-24} w={5} h={48} r={2} color={bootLo} style={{opacity: 0.55}} />)}
    </Paper>
  </div>
);

// Port block bolted to a prop's side, 44 x 90 px. (x, y) = its top-left; `lit` 0-1 turns the LED on (glows `led`, default green) once above 0.1.
export const SocketPlate: React.FC<{x: number; y: number; lit?: number; led?: string}> = ({x, y, lit = 0, led = '#6CFFAA'}) => (
  <Paper lift={4}>
    <Slab x={x} y={y} w={44} h={90} r={8} color="#2A2F34" hi="#434A52" hiH={0.08} shade="#1B1E22" shadeH={0.15} />
    <Slab x={x + 6} y={y + 12} w={32} h={20} r={4} color="#0B0C0E" />
    <Slab x={x + 6} y={y + 40} w={32} h={20} r={4} color="#0B0C0E" />
    <Disc x={x + 22} y={y + 76} d={12} color={lit > 0.1 ? led : '#3A3F45'} style={{boxShadow: lit > 0.1 ? `0 0 12px ${led}` : 'none'}} />
  </Paper>
);
