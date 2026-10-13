// Backdrop diner: warm red + cream. Counter, stools and pie dome at the left edge, booth at the right edge,
// chequered floor, mint wall with a long window band, a blank neon arrow. floorY 1440.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {GRAIN, Paper, Slab, Disc} from '../lib/paper/kit';

const FY = 1440;
const RED = '#C9473D', REDLO = '#9E3029', REDHI = '#E0685A';
const CREAM = '#F2E6CF', CREAMLO = '#D9C9A8';
const CHROME = '#C9CFCF', CHROMELO = '#8E9697';

// Chequered floor in perspective: rows get taller toward the viewer, columns fan out from the centre.
const Checks: React.FC = () => {
  const rows: React.ReactNode[] = [];
  let y = FY;
  const n = 11;
  for (let r = 0; r < n; r++) {
    const h = 26 * Math.pow(1.22, r);
    const y2 = y + h;
    const s1 = 1 + r * 0.2, s2 = 1 + (r + 1) * 0.2; // column width scale at top and bottom edge of the row
    const w1 = 96 * s1, w2 = 96 * s2;
    for (let c = -14; c <= 14; c++) {
      const x1a = 540 + (c - 0.5) * w1, x1b = 540 + (c + 0.5) * w1;
      const x2a = 540 + (c - 0.5) * w2, x2b = 540 + (c + 0.5) * w2;
      if (x1b < -50 && x2b < -50) continue;
      if (x1a > 1130 && x2a > 1130) continue;
      const dark = (c + r) % 2 === 0;
      rows.push(<polygon key={`${r}_${c}`} points={`${x1a},${y} ${x1b},${y} ${x2b},${y2} ${x2a},${y2}`} fill={dark ? '#DE7468' : '#F3E8D2'} />);
    }
    y = y2;
  }
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <clipPath id="dfloor"><rect x={0} y={FY} width={1080} height={480} /></clipPath>
      <g clipPath="url(#dfloor)">{rows}</g>
    </svg>
  );
};

const Stool: React.FC<{x: number; y: number}> = ({x, y}) => (
  <>
    <Slab x={x - 8} y={y - 150} w={16} h={150} color={CHROME} shade={CHROMELO} shadeH={0.4} r={6} />
    <Slab x={x - 46} y={y - 14} w={92} h={18} color={CHROME} shade={CHROMELO} shadeH={0.5} r={9} />
    <Slab x={x - 56} y={y - 180} w={112} h={34} color={RED} hi={REDHI} hiH={0.3} shade={REDLO} shadeH={0.35} r={16} />
    <Slab x={x - 60} y={y - 150} w={120} h={14} color={CHROME} r={7} />
  </>
);

export const Diner: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{backgroundColor: '#C6E8D8'}} />
    <AbsoluteFill style={{backgroundImage: `url(${GRAIN})`, backgroundSize: '520px', mixBlendMode: 'multiply', opacity: 0.6}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 800px 500px at 70% 25%, rgba(255,255,255,0.18), rgba(255,255,255,0) 70%), radial-gradient(ellipse 600px 500px at 20% 60%, rgba(120,170,150,0.15), rgba(0,0,0,0) 70%)'}} />

    {/* cream wainscot with a red rail under the window band */}
    <Paper lift={3}>
      <Slab x={-10} y={1040} w={1100} h={FY - 1040 + 4} color="#F1E3C8" shade={CREAMLO} shadeH={0.1} r={0} />
      {Array.from({length: 12}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 6 + i * 92, top: 1062, width: 3, height: FY - 1062, background: 'rgba(120,90,50,0.16)'}} />
      ))}
      <Slab x={-10} y={1030} w={1100} h={22} color={RED} hi={REDHI} hiH={0.3} shade={REDLO} shadeH={0.4} r={0} />
    </Paper>

    {/* long window band */}
    <Paper lift={5}>
      <Slab x={-10} y={470} w={1100} h={190} color="#E8DCC0" r={0} shade={CREAMLO} shadeH={0.06} />
      <Slab x={14} y={492} w={1052} h={146} color="#BFDDE8" r={4} shade="#A8CCDA" shadeH={0.5} />
      {[0.25, 0.5, 0.75].map((p) => <Slab key={p} x={14 + 1052 * p - 8} y={492} w={16} h={146} color="#E8DCC0" r={2} />)}
      <Slab x={0} y={655} w={1080} h={14} color={CREAMLO} r={0} />
    </Paper>
    {/* sun streak across the glass, top-left light */}
    <div style={{position: 'absolute', left: 14, top: 492, width: 1052, height: 146, background: 'linear-gradient(105deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 40%)', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'}} />

    {/* blank neon arrow, right edge above the booth */}
    <div style={{position: 'absolute', left: 805, top: 730, width: 230, height: 190, background: 'radial-gradient(ellipse at 50% 50%, rgba(255,120,150,0.5), rgba(255,120,150,0) 68%)'}} />
    <Paper lift={2}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d="M830 836 L930 836 L930 800 L1010 850 L930 900 L930 864 L830 864 Z" fill="#6E1F3A" transform="translate(4 6)" />
        <path d="M830 836 L930 836 L930 800 L1010 850 L930 900 L930 864 L830 864 Z" fill="#F2A3B7" />
        <path d="M846 846 L942 846 L942 822 L988 850 L942 878 L942 854 L846 854 Z" fill="#FFE3EA" opacity={0.9} />
      </svg>
    </Paper>

    {/* floor */}
    <Slab x={-20} y={FY} w={1120} h={500} color="#F0E3CA" r={0} />
    <Checks />
    <div style={{position: 'absolute', left: 0, top: FY, width: 1080, height: 480, background: 'linear-gradient(rgba(60,25,15,0.35), rgba(60,25,15,0) 90px), radial-gradient(ellipse at 20% 0%, rgba(255,240,200,0.25), rgba(255,240,200,0) 60%)'}} />
    <Slab x={-20} y={FY - 22} w={1120} h={26} color={RED} hi={REDHI} hiH={0.3} shade={REDLO} shadeH={0.45} r={0} />

    {/* left: counter + stools + pie dome */}
    <Paper lift={8}>
      <Slab x={-20} y={1160} w={290} h={FY - 1160 - 20} color={RED} hi={REDHI} hiH={0.04} shade={REDLO} shadeH={0.12} r={4}>
        {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 36 + i * 76, top: 36, width: 62, height: 200, background: 'rgba(0,0,0,0.14)', borderRadius: 4, boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.18)'}} />)}
      </Slab>
      <Slab x={-20} y={1130} w={310} h={34} color={CREAM} hi="#FBF3E0" hiH={0.3} shade={CREAMLO} shadeH={0.35} r={5} />
      <Slab x={-20} y={1396} w={290} h={22} color={CHROME} shade={CHROMELO} shadeH={0.45} r={0} />
      {/* cake stand, pie, glass dome */}
      <Slab x={78} y={1104} w={96} h={26} color={CHROME} shade={CHROMELO} shadeH={0.5} r={8} />
      <Slab x={110} y={1080} w={32} h={30} color={CHROME} r={4} />
      <Slab x={42} y={1064} w={170} h={22} color={CHROME} shade={CHROMELO} shadeH={0.45} r={11} />
      <Slab x={64} y={1020} w={126} h={44} color="#E1A458" shade="#B97A33" shadeH={0.4} r="48% 48% 12% 12%" />
      <Slab x={72} y={1032} w={110} h={12} color="#F5DDB0" r={6} />
      <div style={{position: 'absolute', left: 52, top: 920, width: 150, height: 146, borderRadius: '50% 50% 8% 8%', background: 'linear-gradient(120deg, rgba(255,255,255,0.45), rgba(220,238,242,0.18) 55%, rgba(180,210,220,0.3))', boxShadow: 'inset 3px 3px 0 rgba(255,255,255,0.55), inset -3px -3px 6px rgba(120,160,170,0.3)'}} />
      <Disc x={127} y={910} d={26} color={CHROME} shade={CHROMELO} />
    </Paper>
    <Paper lift={8}>
      <Stool x={92} y={1486} />
      <Stool x={218} y={1486} />
    </Paper>

    {/* right: booth */}
    <Paper lift={8}>
      <Slab x={930} y={960} w={170} h={440} color={RED} hi={REDHI} hiH={0.05} shade={REDLO} shadeH={0.15} r={26}>
        {[0, 1].map((r) => [0, 1].map((c) => <div key={`${r}${c}`} style={{position: 'absolute', left: 36 + c * 70, top: 90 + r * 100, width: 14, height: 14, borderRadius: 14, background: REDLO, boxShadow: '1px 1px 0 rgba(255,255,255,0.2)'}} />))}
        <div style={{position: 'absolute', left: 0, top: 40, width: 4, height: 360, background: 'rgba(255,255,255,0.14)'}} />
      </Slab>
      <Slab x={800} y={1290} w={300} h={110} color={RED} hi={REDHI} hiH={0.22} shade={REDLO} shadeH={0.22} r={22} />
      <Slab x={800} y={1396} w={300} h={44} color={CREAM} shade={CREAMLO} shadeH={0.4} r={4} />
    </Paper>

    {/* warm lamp glow + paper grain */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 700px 600px at 10% 12%, rgba(255,236,190,0.35), rgba(255,236,190,0) 70%)', mixBlendMode: 'screen'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(80,30,10,0.12) 100%)'}} />
    <AbsoluteFill style={{backgroundImage: `url(${GRAIN})`, backgroundSize: '520px', mixBlendMode: 'multiply', opacity: 0.35}} />
  </AbsoluteFill>
);
