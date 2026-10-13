// Backdrop subway-platform: night, teal tile. Bench left edge, glowing tunnel mouth right edge, blank sign frames, yellow safety line. floorY 1440.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GRAIN, Paper, Slab} from '../lib/paper/kit';

const FLOOR = 1440;

const Sign: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => (
  <Paper lift={6}>
    <Slab x={x} y={y} w={w} h={h} r={8} color="#E3E9DD" shade="#BFCABD" shadeH={0.12} />
    <Slab x={x + 12} y={y + 12} w={w - 24} h={h - 24} r={4} color="#24666A" shade="#1A4D52" shadeH={0.1} hi="rgba(255,255,255,0.08)" hiH={0.2} />
  </Paper>
);

export const SubwayPlatform: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#9CC4B9', overflow: 'hidden'}}>
    {/* tile wall: grain, grout lines, night wash */}
    <AbsoluteFill style={{backgroundImage: `url(${GRAIN})`, backgroundSize: '720px', mixBlendMode: 'multiply', opacity: 0.6}} />
    {Array.from({length: Math.ceil(FLOOR / 52)}).map((_, i) => (
      <div key={i} style={{position: 'absolute', left: 0, top: i * 52, width: 1080, height: 52, borderTop: '3px solid rgba(25,70,70,0.24)', backgroundImage: 'repeating-linear-gradient(90deg, rgba(25,70,70,0.20) 0 3px, rgba(0,0,0,0) 3px 104px)', backgroundPosition: `${i % 2 ? 52 : 0}px 0`}} />
    ))}
    {/* darker tile band */}
    <Paper lift={5}>
      <Slab x={-20} y={1040} w={1120} h={170} r={0} color="#2B7C7A" shade="#1E5D5E" shadeH={0.25} hi="rgba(255,255,255,0.12)" hiH={0.06} />
      <Slab x={-20} y={1028} w={1120} h={16} r={0} color="#DDE8DD" shade="#B7C6BB" shadeH={0.4} />
    </Paper>
    <div style={{position: 'absolute', left: 0, top: 1040, width: 1080, height: 170, backgroundImage: 'repeating-linear-gradient(90deg, rgba(10,50,50,0.3) 0 3px, rgba(0,0,0,0) 3px 104px)'}} />
    {/* top-left fluorescent wash */}
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 700, background: 'radial-gradient(ellipse at 14% 0%, rgba(235,255,200,0.30), rgba(0,0,0,0) 65%)'}} />

    {/* blank sign frames */}
    <Sign x={26} y={500} w={250} h={120} />
    <Sign x={806} y={470} w={250} h={110} />

    <div style={{position: 'absolute', left: 560, top: 640, width: 700, height: 900, background: 'radial-gradient(ellipse at 70% 55%, rgba(225,255,190,0.28), rgba(0,0,0,0) 65%)'}} />
    {/* tunnel mouth: stacked arches getting darker, glow inside */}
    <Paper lift={10}>
      <Slab x={750} y={780} w={380} h={FLOOR - 780 + 8} r="190px 190px 0 0" color="#C9D6CC" shade="#9CAEA5" shadeH={0.05} />
      <Slab x={772} y={802} w={340} h={FLOOR - 802 + 8} r="170px 170px 0 0" color="#3E5F62" />
      <Slab x={794} y={828} w={296} h={FLOOR - 828 + 8} r="148px 148px 0 0" color="#1D3A40" />
      <Slab x={826} y={868} w={232} h={FLOOR - 868 + 8} r="116px 116px 0 0" color="#102229">
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 100%, rgba(240,255,200,0.9) 0%, rgba(140,235,210,0.5) 38%, rgba(0,0,0,0) 75%)'}} />
        <div style={{position: 'absolute', left: 60, bottom: 40, width: 120, height: 60, borderRadius: 60, background: 'rgba(255,255,230,0.5)', filter: 'blur(16px)'}} />
      </Slab>
    </Paper>
    {/* rails glimpsed at the tunnel foot */}
    <div style={{position: 'absolute', left: 840, top: FLOOR - 10, width: 220, height: 6, background: '#2A3A3C'}} />

    {/* bench, left edge */}
    <Paper lift={8}>
      {[0, 1, 2].map((i) => <Slab key={i} x={-20} y={1200 + i * 30} w={300} h={22} r={4} color="#8A6F55" shade="#6E5640" shadeH={0.4} hi="rgba(255,255,255,0.16)" hiH={0.2} />)}
      <Slab x={-20} y={1190} w={14} h={110} r={2} color="#3A4A4C" />
      <Slab x={250} y={1190} w={14} h={110} r={2} color="#3A4A4C" />
      {[0, 1].map((i) => <Slab key={i} x={-20} y={1316 + i * 28} w={310} h={22} r={4} color="#9A7E62" shade="#7A6049" shadeH={0.4} hi="rgba(255,255,255,0.18)" hiH={0.2} />)}
      <Slab x={10} y={1366} w={16} h={FLOOR - 1366} r={2} color="#3A4A4C" />
      <Slab x={230} y={1366} w={16} h={FLOOR - 1366} r={2} color="#3A4A4C" />
    </Paper>

    {/* concrete floor, kickplate, yellow safety line */}
    <Slab x={-20} y={FLOOR} w={1120} h={1920 - FLOOR + 20} r={0} color="#6C7878" grain={0.9} />
    <Slab x={-20} y={FLOOR - 14} w={1120} h={22} r={0} color="#1F4B4D" />
    <div style={{position: 'absolute', left: 0, top: FLOOR, width: 1080, height: 90, background: 'linear-gradient(rgba(5,25,30,0.45), rgba(0,0,0,0))'}} />
    <Slab x={-20} y={1468} w={1120} h={24} r={0} color="#E5B93A" shade="#C39A28" shadeH={0.35} hi="rgba(255,255,255,0.2)" hiH={0.25} />
    <div style={{position: 'absolute', left: 0, top: 1492, width: 1080, height: 428, background: 'rgba(8,25,30,0.18)'}} />
    <div style={{position: 'absolute', left: 520, top: FLOOR + 4, width: 580, height: 260, background: 'radial-gradient(ellipse at 85% 0%, rgba(235,255,190,0.34), rgba(0,0,0,0) 70%)'}} />
    {[[150, 1560, 90], [420, 1640, 60], [660, 1580, 110], [300, 1720, 70]].map(([x, y, w], i) => <div key={i} style={{position: 'absolute', left: x, top: y, width: w, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2}} />)}

    {/* fibre + night wash + vignette */}
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'soft-light', opacity: 0.6}}>
      <filter id="spfibre"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves={3} seed={13} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.2" /></filter>
      <rect width={1080} height={1920} filter="url(#spfibre)" />
    </svg>
    <AbsoluteFill style={{background: 'linear-gradient(rgba(6,28,38,0.45), rgba(6,28,38,0.35))', mixBlendMode: 'multiply'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,10,15,0.4) 100%)'}} />
  </AbsoluteFill>
);
