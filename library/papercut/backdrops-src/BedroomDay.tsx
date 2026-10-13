// Backdrop bedroom-day: soft lilac wall, peach bed + bedside lamp at the left edge, window with curtains at the right edge,
// rug on a light wood floor, blank framed print, morning light. floorY 1450.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GRAIN, Paper, Slab, Disc} from '../lib/paper/kit';

const FY = 1450;
const PEACH = '#F2B79B', PEACHLO = '#D58E72', PEACHHI = '#F8CDB6';
const LILAC = '#B9A3D6', LILACLO = '#9783BA';
const WOOD = '#DDB98C', WOODLO = '#BF9868';
const WHITE = '#F7F1EA', WHITELO = '#DCD2C6';

export const BedroomDay: React.FC = () => (
  <AbsoluteFill>
    {/* wall */}
    <AbsoluteFill style={{backgroundColor: '#DDD0EC'}} />
    <AbsoluteFill style={{backgroundImage: `url(${GRAIN})`, backgroundSize: '520px', mixBlendMode: 'multiply', opacity: 0.55}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 900px 700px at 85% 40%, rgba(255,244,214,0.45), rgba(255,244,214,0) 70%), radial-gradient(ellipse 700px 600px at 10% 10%, rgba(255,255,255,0.3), rgba(255,255,255,0) 70%)'}} />

    {/* floor */}
    <Slab x={-20} y={FY} w={1120} h={1920 - FY + 20} color={WOOD} r={0} grain={0.6} />
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const y = FY + 60 + i * 72 + i * i * 4;
      return <div key={i} style={{position: 'absolute', left: 0, right: 0, top: y, height: 3, background: WOODLO, opacity: 0.55}} />;
    })}
    {Array.from({length: 7}).map((_, i) => Array.from({length: 7}).map((__, j) => {
      const y = FY + 60 + j * 72 + j * j * 4;
      const x = ((i * 233 + j * 97) % 1100);
      return <div key={`${i}_${j}`} style={{position: 'absolute', left: x - 40 + (j % 2) * 60, top: y, width: 3, height: 60 + j * 5, background: WOODLO, opacity: 0.4}} />;
    }))}
    <div style={{position: 'absolute', left: 0, top: FY, width: 1080, height: 480, background: 'linear-gradient(rgba(90,50,20,0.28), rgba(90,50,20,0) 90px)'}} />
    <Slab x={-20} y={FY - 34} w={1120} h={38} color={WHITE} hi="#FFFFFF" hiH={0.25} shade={WHITELO} shadeH={0.3} r={0} />

    {/* window light falling across the floor (from the right window, soft) */}
    <div style={{position: 'absolute', left: 380, top: FY + 4, width: 700, height: 360, background: 'linear-gradient(100deg, rgba(255,246,214,0) 0%, rgba(255,246,214,0.28) 60%, rgba(255,246,214,0.1) 100%)', clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 0 100%)', maskImage: 'linear-gradient(black 30%, transparent)'}} />

    {/* rug */}
    <Paper lift={4}>
      <Slab x={170} y={1572} w={740} h={250} color={LILACLO} r="50%" />
      <Slab x={170} y={1560} w={740} h={250} color={LILAC} r="50%" />
      <Slab x={215} y={1584} w={650} h={214} color={PEACHLO} r="50%" />
      <Slab x={215} y={1578} w={650} h={214} color={PEACH} r="50%" />
      <Slab x={290} y={1604} w={500} h={162} color="#F8DCC8" r="50%" />
    </Paper>

    {/* blank framed print above the bed */}
    <Paper lift={5}>
      <Slab x={80} y={720} w={190} h={250} color="#B8875A" hi="#D2A173" hiH={0.04} shade="#936A42" shadeH={0.06} r={4} />
      <Slab x={96} y={736} w={158} h={218} color={WHITE} r={2} shade={WHITELO} shadeH={0.04} />
      <Slab x={116} y={756} w={118} h={178} color="#EFE3D8" r={2} />
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d="M116 934 L116 880 Q150 850 176 884 Q200 850 234 878 L234 934 Z" fill="#E4CDBF" />
        <circle cx={190} cy={806} r={22} fill="#F6D4BE" />
      </svg>
    </Paper>

    {/* bed, left edge: headboard, mattress, quilt, pillow */}
    <Paper lift={9}>
      <Slab x={-30} y={1010} w={120} h={430} color={PEACHLO} hi={PEACH} hiH={0.04} shade="#B97358" shadeH={0.1} r="40px 40px 6px 6px" />
      <Slab x={-20} y={1226} w={150} h={86} color={PEACHHI} hi="#FFE6D6" hiH={0.2} shade={PEACH} shadeH={0.3} r={36} />
      <Slab x={-30} y={1300} w={250} h={150} color={WHITE} shade={WHITELO} shadeH={0.22} r={14} />
      <Slab x={-30} y={1270} w={250} h={150} color={LILAC} hi="#CDBBE6" hiH={0.1} shade={LILACLO} shadeH={0.12} r={22}>
        {[0, 1, 2, 3].map((c) => [0, 1, 2].map((r) => (
          <div key={`${c}${r}`} style={{position: 'absolute', left: 14 + c * 58, top: 30 + r * 40, width: 50, height: 32, background: (c + r) % 2 ? PEACHHI : '#E8DDF4', opacity: 0.85, borderRadius: 3}} />
        )))}
      </Slab>
      <Slab x={-30} y={1418} w={20} h={32} color={WOODLO} r={2} />
      <Slab x={186} y={1418} w={20} h={32} color={WOODLO} r={2} />
    </Paper>

    {/* bedside table + lamp */}
    <Paper lift={7}>
      <Slab x={218} y={1270} w={92} h={186} color="#C99F72" hi="#E0BA8E" hiH={0.06} shade="#A07B52" shadeH={0.12} r={4}>
        <div style={{position: 'absolute', left: 14, top: 22, width: 64, height: 56, background: 'rgba(0,0,0,0.13)', borderRadius: 3, boxShadow: 'inset 1.5px 1.5px 0 rgba(255,255,255,0.22)'}} />
        <div style={{position: 'absolute', left: 14, top: 98, width: 64, height: 56, background: 'rgba(0,0,0,0.13)', borderRadius: 3, boxShadow: 'inset 1.5px 1.5px 0 rgba(255,255,255,0.22)'}} />
        <Disc x={46} y={50} d={12} color="#7A5A3A" />
        <Disc x={46} y={126} d={12} color="#7A5A3A" />
      </Slab>
      <Slab x={212} y={1258} w={104} h={16} color="#D8B084" hi="#EBCBA2" hiH={0.3} r={4} />
      <Slab x={256} y={1170} w={10} h={90} color="#C9CFCF" r={4} />
      <Slab x={236} y={1236} w={50} h={24} color="#C9CFCF" r={10} />
    </Paper>
    <div style={{position: 'absolute', left: 150, top: 1030, width: 240, height: 240, background: 'radial-gradient(circle, rgba(255,226,160,0.5), rgba(255,226,160,0) 68%)'}} />
    <Paper lift={4}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d="M226 1086 L308 1086 L328 1176 L206 1176 Z" fill="#E9A987" transform="translate(4 5)" />
        <path d="M226 1086 L308 1086 L328 1176 L206 1176 Z" fill="#F8D3A8" />
        <path d="M222 1100 L260 1090 L262 1176 L206 1176 Z" fill="#FBE4C4" opacity={0.8} />
      </svg>
    </Paper>

    {/* window, right edge */}
    <Paper lift={8}>
      <Slab x={808} y={640} w={300} h={470} color={WHITE} shade={WHITELO} shadeH={0.05} r={6} />
      <Slab x={826} y={658} w={260} h={434} color="#BFE0F2" r={3} shade="#A6D2EA" shadeH={0.4} />
      <Slab x={826} y={868} w={260} h={224} color="#CFE9C9" r={3} shade="#B2D6AB" shadeH={0.3} style={{clipPath: 'ellipse(70% 90% at 30% 100%)'}} />
      <Slab x={890} y={730} w={110} h={34} color="#FFFFFF" r={17} />
      <Slab x={920} y={706} w={64} h={40} color="#FFFFFF" r={20} />
      <Slab x={950} y={874} w={16} h={218} color={WHITE} r={0} style={{display: 'none'}} />
      <Slab x={948} y={658} w={14} h={434} color={WHITE} r={2} shade={WHITELO} shadeH={0.03} />
      <Slab x={826} y={868} w={260} h={14} color={WHITE} r={2} />
      <Slab x={790} y={1108} w={320} h={26} color={WHITE} hi="#FFFFFF" hiH={0.3} shade={WHITELO} shadeH={0.4} r={5} />
    </Paper>
    <div style={{position: 'absolute', left: 826, top: 658, width: 260, height: 434, background: 'linear-gradient(115deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 45%)'}} />
    {/* curtains */}
    <Paper lift={7}>
      <Slab x={782} y={614} w={330} h={18} color="#9C7B58" hi="#B8956F" hiH={0.3} r={9} />
      <Slab x={800} y={626} w={92} h={560} color={PEACH} hi={PEACHHI} hiH={0.03} shade={PEACHLO} shadeH={0.08} r="6px 6px 40px 60px">
        {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 18 + i * 26, top: 0, width: 8, height: '100%', background: 'rgba(160,80,50,0.18)'}} />)}
      </Slab>
      <Slab x={1020} y={626} w={92} h={560} color={PEACH} hi={PEACHHI} hiH={0.03} shade={PEACHLO} shadeH={0.08} r="6px 6px 60px 40px">
        {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 18 + i * 26, top: 0, width: 8, height: '100%', background: 'rgba(160,80,50,0.18)'}} />)}
      </Slab>
    </Paper>

    {/* a small plant on the sill's corner is skipped: keep the edge calm. Morning light + grain */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(90,60,110,0.10) 100%)'}} />
    <AbsoluteFill style={{backgroundImage: `url(${GRAIN})`, backgroundSize: '520px', mixBlendMode: 'multiply', opacity: 0.3}} />
  </AbsoluteFill>
);
