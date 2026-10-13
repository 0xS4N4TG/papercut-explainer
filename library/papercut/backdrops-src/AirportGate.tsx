// Backdrop airport-gate: day, cool grey-blue. Window wall + plane tail left, grey seats left edge, blank board top-right, gate desk right. floorY 1440.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GRAIN, Paper, Slab} from '../lib/paper/kit';

const FLOOR = 1440;

const Cloud: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <Paper lift={3}>
    <Slab x={x} y={y + 30 * s} w={230 * s} h={50 * s} r={30 * s} color="#F4F8FB" shade="#D5E2EC" shadeH={0.4} />
    <Slab x={x + 36 * s} y={y} w={90 * s} h={72 * s} r="50%" color="#F8FBFD" shade="#DCE8F0" shadeH={0.3} />
    <Slab x={x + 100 * s} y={y + 14 * s} w={80 * s} h={60 * s} r="50%" color="#F8FBFD" shade="#DCE8F0" shadeH={0.3} />
  </Paper>
);

const Seat: React.FC<{x: number; y: number}> = ({x, y}) => (
  <>
    <Slab x={x} y={y} w={92} h={110} r="22px 22px 8px 8px" color="#7F8C9B" shade="#66727F" shadeH={0.22} hi="rgba(255,255,255,0.14)" hiH={0.2} />
    <Slab x={x - 4} y={y + 100} w={100} h={44} r={12} color="#8E9AA8" shade="#6C7886" shadeH={0.35} hi="rgba(255,255,255,0.14)" hiH={0.25} />
  </>
);

export const AirportGate: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#B3C3D1', overflow: 'hidden'}}>
    {/* wall grain + faint panel seams */}
    <AbsoluteFill style={{backgroundImage: `url(${GRAIN})`, backgroundSize: '720px', backgroundBlendMode: 'multiply', mixBlendMode: 'multiply', opacity: 0.55}} />
    {[640, 860].map((x, i) => <div key={i} style={{position: 'absolute', left: x, top: 0, width: 3, height: FLOOR, background: 'rgba(60,85,110,0.14)'}} />)}
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 440, background: 'linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0))'}} />
    <Slab x={-20} y={1330} w={1120} h={110} r={0} color="#9DB0C1" shade="#8396AA" shadeH={0.3} hi="rgba(255,255,255,0.2)" hiH={0.06} />

    {/* window wall: pale sky, tarmac, plane tail far outside */}
    <Paper lift={10}>
      <Slab x={-30} y={470} w={640} h={840} r={4} color="#8398AB" shade="#6F8497" shadeH={0.03} />
      <Slab x={-10} y={490} w={600} h={800} r={2} color="#CDE5F3" style={{background: 'linear-gradient(#B7DAEE, #E3F1F8 70%, #EEF6FA)'}} grain={0.3}>
        <div style={{position: 'absolute', left: 0, top: 620, width: '100%', height: 190, background: '#A3B0BA'}} />
        <div style={{position: 'absolute', left: 0, top: 620, width: '100%', height: 18, background: '#8D9BA6'}} />
        <div style={{position: 'absolute', left: 0, top: 700, width: '100%', height: 8, background: '#E9D96A', opacity: 0.8}} />
        {/* soft top-left sun wash on the glass */}
        <div style={{position: 'absolute', left: -60, top: -40, width: 260, height: 900, background: 'rgba(255,255,255,0.18)', transform: 'rotate(18deg)'}} />
      </Slab>
    </Paper>
    <Cloud x={380} y={600} s={0.9} />
    <Cloud x={20} y={780} s={0.7} />
    {/* plane tail (cut paper): shade copy offset, then the fin */}
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(2px 4px 4px rgba(40,60,80,0.28))'}}>
      <defs><clipPath id="agwin"><rect x={-10} y={490} width={600} height={800} /></clipPath></defs>
      <g clipPath="url(#agwin)">
        <path d="M320 1085 L450 800 Q462 782 482 792 L500 1060 L440 1085 Z" fill="#C3CFDA" transform="translate(6 6)" />
        <path d="M60 1085 L420 1085 Q480 1085 530 1040 L545 1050 Q510 1170 420 1175 L60 1175 Z" fill="#C3CFDA" transform="translate(5 6)" />
        <path d="M60 1085 L420 1085 Q480 1085 530 1040 L545 1050 Q510 1170 420 1175 L60 1175 Z" fill="#F3F6F9" />
        <path d="M320 1085 L450 800 Q462 782 482 792 L500 1060 L440 1085 Z" fill="#F7F9FB" />
        <path d="M413 880 L450 800 Q462 782 482 792 L488 880 Z" fill="#3E8FA6" />
        <path d="M60 1160 L420 1160 Q500 1155 520 1110 L545 1050 Q510 1170 420 1175 L60 1175 Z" fill="#DCE4EB" />
        {[90, 130, 170, 210, 250, 290, 330].map((x) => <circle key={x} cx={x} cy={1120} r={8} fill="#8FA6B8" />)}
      </g>
    </svg>
    {/* mullions + sill, drawn over the glass */}
    <Paper lift={6}>
      <Slab x={178} y={490} w={22} h={800} r={2} color="#8398AB" shade="#6F8497" shadeH={0.15} />
      <Slab x={392} y={490} w={22} h={800} r={2} color="#8398AB" shade="#6F8497" shadeH={0.15} />
      <Slab x={-30} y={1278} w={660} h={44} r={4} color="#A5B6C6" shade="#7E92A5" shadeH={0.4} hi="rgba(255,255,255,0.3)" hiH={0.2} />
    </Paper>

    {/* seats row, left edge */}
    <Paper lift={8}>
      <Slab x={-30} y={1328} w={330} h={14} r={4} color="#5E6A78" />
      {[-6, 94, 194].map((x, i) => <Seat key={i} x={x} y={1210 + (i % 2) * 2} />)}
      {[24, 220].map((x, i) => <Slab key={i} x={x} y={1346} w={14} h={94} r={3} color="#5B6672" shade="#3F4954" shadeH={0.2} />)}
      <Slab x={-30} y={1424} w={360} h={14} r={5} color="#4F5A66" />
    </Paper>

    {/* blank departures board, top-right edge */}
    <Paper lift={8}>
      <Slab x={744} y={460} w={380} h={250} r={12} color="#3A4756" shade="#28323E" shadeH={0.1} hi="rgba(255,255,255,0.12)" hiH={0.03} />
      <Slab x={762} y={478} w={344} h={214} r={6} color="#1D2733" grain={0.35}>
        {[1, 2, 3, 4, 5].map((i) => <div key={i} style={{position: 'absolute', left: 0, top: i * 35.5, width: '100%', height: 2, background: 'rgba(120,150,175,0.12)'}} />)}
        <div style={{position: 'absolute', left: -50, top: -30, width: 160, height: 300, background: 'rgba(255,255,255,0.05)', transform: 'rotate(22deg)'}} />
      </Slab>
    </Paper>

    {/* gate desk, right edge */}
    <Paper lift={9}>
      <Slab x={908} y={1000} w={190} h={120} r={8} color="#2D3947" shade="#1D2631" shadeH={0.12}>
        <Slab x={8} y={8} w={174} h={92} r={4} color="#496C80" style={{background: 'radial-gradient(ellipse at 30% 25%, #6FA0B5, #3F6275 80%)'}} grain={0.3} />
      </Slab>
      <Slab x={988} y={1116} w={22} h={50} r={2} color="#2D3947" />
      <Slab x={800} y={1150} w={300} h={44} r={6} color="#4D5E70" shade="#38475A" shadeH={0.4} hi="rgba(255,255,255,0.22)" hiH={0.25} />
      <Slab x={812} y={1194} w={300} h={FLOOR - 1194} r={0} color="#DDE5EC" shade="#BAC7D3" shadeH={0.12}>
        <div style={{position: 'absolute', left: 0, top: 60, width: '100%', height: 54, background: '#4B86A0'}} />
        <div style={{position: 'absolute', left: 0, top: 114, width: '100%', height: 8, background: 'rgba(0,0,0,0.12)'}} />
      </Slab>
    </Paper>

    {/* carpet floor with a pale stripe */}
    <Slab x={-20} y={FLOOR} w={1120} h={1920 - FLOOR + 20} r={0} color="#67788A" grain={0.8} />
    <div style={{position: 'absolute', left: 0, top: FLOOR, width: 1080, height: 80, background: 'linear-gradient(rgba(10,25,45,0.35), rgba(0,0,0,0))'}} />
    <Slab x={-20} y={FLOOR - 8} w={1120} h={12} r={0} color="#4A5A6A" />
    <div style={{position: 'absolute', left: -20, top: 1478, width: 1120, height: 36, background: '#A8B8C6', opacity: 0.85}} />
    <div style={{position: 'absolute', left: 0, top: FLOOR + 4, width: 560, height: 210, background: 'linear-gradient(100deg, rgba(255,255,255,0.20), rgba(255,255,255,0))', clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0 100%)'}} />

    {/* paper fibre */}
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'soft-light', opacity: 0.6}}>
      <filter id="agfibre"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves={3} seed={9} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.2" /></filter>
      <rect width={1080} height={1920} filter="url(#agfibre)" />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 12% 6%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0) 55%), radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(20,35,55,0.22) 100%)'}} />
  </AbsoluteFill>
);
