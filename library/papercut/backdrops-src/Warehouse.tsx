// Backdrop warehouse: orange steel shelving + kraft boxes at both edges, pallet stack (right), closed roll-up shutter
// across the middle back wall, concrete floor with a yellow stripe, hanging industrial lamp top-left.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Disc, Paper, Slab} from '../lib/paper/kit';

const FLOOR = 1450;
const WALL = '#D8C8AC';
const KRAFT = ['#BE8F58', '#B38450', '#C79A62', '#AB7C48'];
const KRAFT_LO = '#8F6535';
const TAPE = '#DDBF8F';
const STEEL = '#CC6A2C';
const STEEL_LO = '#9E4C1C';

// A kraft carton: body, darker underside, lighter packing-tape strip, blank white label on some.
const Box: React.FC<{x: number; y: number; w: number; h: number; i?: number; label?: boolean; rot?: number}> = ({x, y, w, h, i = 0, label, rot = 0}) => (
  <Slab x={x} y={y} w={w} h={h} r={3} color={KRAFT[i % 4]} shade={KRAFT_LO} shadeH={0.1} hi="rgba(255,255,255,0.14)" hiH={0.1} rot={rot}>
    <div style={{position: 'absolute', left: w / 2 - w * 0.09, top: 0, width: w * 0.18, height: '38%', background: TAPE, opacity: 0.9}} />
    {label ? <div style={{position: 'absolute', left: w * 0.12, top: h * 0.56, width: w * 0.34, height: h * 0.22, background: '#EFE8DA', opacity: 0.9}} /> : null}
  </Slab>
);

// One shelving bay. Boxes per level are [dx, w, h] relative to the bay's left edge.
const BEAMS = [640, 870, 1100, 1330];
const Bay: React.FC<{x: number; w: number; levels: Array<Array<[number, number, number]>>}> = ({x, w, levels}) => (
  <Paper lift={12}>
    {/* dark back of the bay */}
    <Slab x={x} y={470} w={w} h={FLOOR - 470 - 20} r={0} color="#8A6F4F" style={{opacity: 0.45}} />
    {levels.map((boxes, li) => boxes.map(([dx, bw, bh], bi) => (
      <Box key={`${li}-${bi}`} x={x + dx} y={BEAMS[li] - bh} w={bw} h={bh} i={li + bi} label={(li + bi) % 3 === 0} />
    )))}
    {BEAMS.map((y) => (
      <Slab key={y} x={x - 6} y={y} w={w + 12} h={24} r={2} color={STEEL} shade={STEEL_LO} shadeH={0.4} hi="rgba(255,255,255,0.22)" hiH={0.2} />
    ))}
    {[x - 4, x + w - 20].map((ux) => (
      <Slab key={ux} x={ux} y={450} w={24} h={FLOOR - 450} r={2} color={STEEL} shade={STEEL_LO} shadeH={0.1} hi="rgba(255,255,255,0.2)" hiH={0.03} />
    ))}
    {[x - 4, x + w - 20].map((ux) => (
      <Slab key={`f${ux}`} x={ux - 8} y={FLOOR - 14} w={40} h={16} r={2} color={STEEL_LO} />
    ))}
  </Paper>
);

const Pallet: React.FC<{x: number; w: number}> = ({x, w}) => (
  <Paper lift={12}>
    {[0, 1, 2].map((i) => (
      <Slab key={i} x={x + i * (w - 56) / 2} y={FLOOR - 52} w={56} h={44} r={2} color="#B9915C" shade="#8A6535" shadeH={0.3} />
    ))}
    <Slab x={x - 10} y={FLOOR - 70} w={w + 20} h={22} r={2} color="#CDA56B" shade="#9B7440" shadeH={0.4} hi="rgba(255,255,255,0.2)" hiH={0.2} />
    {[0, 1, 2, 3, 4].map((i) => (
      <Slab key={`p${i}`} x={x + 6 + i * ((w - 22) / 5)} y={FLOOR - 94} w={(w - 22) / 5 - 8} h={24} r={2} color="#C79F65" shade="#9B7440" shadeH={0.35} />
    ))}
    {/* stack of cartons, a bit hand-placed */}
    <Box x={x + 2} y={FLOOR - 212} w={110} h={118} i={0} label rot={-0.6} />
    <Box x={x + 114} y={FLOOR - 224} w={112} h={130} i={2} rot={0.5} />
    <Box x={x + 6} y={FLOOR - 340} w={104} h={126} i={3} rot={0.8} />
    <Box x={x + 112} y={FLOOR - 336} w={108} h={112} i={1} label rot={-0.5} />
    <Box x={x + 30} y={FLOOR - 450} w={150} h={110} i={2} rot={-0.4} />
  </Paper>
);

export const Warehouse: React.FC = () => {
  const slats = Array.from({length: 24});
  return (
    <AbsoluteFill style={{backgroundColor: WALL}}>
      {/* back wall with faint corrugated seams */}
      <Slab x={-20} y={-20} w={1120} h={FLOOR + 40} r={0} color={WALL} grain={0.6} />
      {Array.from({length: 7}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: i * 180 + 20, top: 0, width: 5, height: FLOOR, background: '#B7A688', opacity: 0.45}} />
      ))}
      <Slab x={-20} y={1200} w={1120} h={FLOOR - 1200} r={0} color="#BDAE92" style={{opacity: 0.5}} />

      {/* roll-up shutter */}
      <Paper lift={10}>
        <Slab x={286} y={540} w={508} h={90} r={4} color="#8C8472" shade="#6D6656" shadeH={0.3} hi="rgba(255,255,255,0.12)" hiH={0.1} />
        <Slab x={290} y={620} w={26} h={FLOOR - 620 - 8} r={2} color="#8C8472" />
        <Slab x={764} y={620} w={26} h={FLOOR - 620 - 8} r={2} color="#8C8472" />
        <Slab x={316} y={626} w={448} h={780} r={0} color="#B9B09B" />
        {slats.slice(0, 21).map((_, i) => (
          <Slab key={i} x={316} y={626 + i * 36} w={448} h={34} r={2} color={i % 2 ? '#BDB4A0' : '#B7AE98'} shade="#9A917D" shadeH={0.22} hi="rgba(255,255,255,0.14)" hiH={0.1} />
        ))}
        <Slab x={316} y={1380} w={448} h={50} r={3} color="#7B745F" shade="#5F5947" shadeH={0.3} />
        <Slab x={500} y={1390} w={80} h={20} r={8} color="#4F4A3C" />
      </Paper>

      {/* concrete floor */}
      <Slab x={-20} y={FLOOR} w={1120} h={1920 - FLOOR + 20} r={0} color="#A79F92" grain={0.8} />
      <AbsoluteFill style={{top: FLOOR, height: 90, background: 'linear-gradient(rgba(40,30,20,0.35), rgba(0,0,0,0))'}} />
      {[300, 700].map((x) => (
        <div key={x} style={{position: 'absolute', left: x, top: FLOOR + 40, width: 4, height: 430, background: '#8A8276', opacity: 0.55}} />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: FLOOR + 210, height: 4, background: '#8A8276', opacity: 0.5}} />
      <div style={{position: 'absolute', left: 120, top: FLOOR + 130, width: 520, height: 170, borderRadius: '50%', background: 'rgba(60,50,40,0.1)', filter: 'blur(30px)'}} />
      {/* yellow floor stripe */}
      <Paper lift={2}>
        <Slab x={-20} y={FLOOR + 38} w={1120} h={26} r={0} color="#E3B92F" shade="#C79A16" shadeH={0.3} />
      </Paper>

      <Bay x={14} w={236} levels={[
        [[10, 84, 112], [100, 114, 90], [122, 0, 0]].slice(0, 2) as Array<[number, number, number]>,
        [[10, 110, 130], [126, 96, 104]],
        [[12, 70, 82], [86, 70, 64], [162, 66, 100]],
        [[10, 104, 118], [122, 100, 90]],
      ]} />
      <Bay x={830} w={236} levels={[
        [[14, 100, 96], [122, 100, 120]],
        [[12, 76, 100], [94, 120, 84]],
        [[14, 110, 112], [132, 90, 78]],
        [[12, 90, 94], [112, 108, 120]],
      ]} />
      <Pallet x={784} w={236} />

      {/* hanging industrial lamp, top-left */}
      <div style={{position: 'absolute', left: 60, top: 0, width: 420, height: 560, background: 'radial-gradient(ellipse at 38% 22%, rgba(255,232,170,0.5) 0%, rgba(255,232,170,0) 62%)'}} />
      <Paper lift={6}>
        <Slab x={175} y={-10} w={6} h={290} r={2} color="#3F3A33" />
        <Slab x={166} y={270} w={24} h={26} r={4} color="#4F4A42" />
        <svg width={1080} height={400} style={{position: 'absolute', left: 0, top: 0}}>
          <path d="M178 290 C 120 290, 98 336, 84 366 L 272 366 C 258 336, 236 290, 178 290 Z" fill="#3E4A40" />
          <path d="M178 290 C 120 290, 98 336, 84 366 L 112 366 C 124 336, 146 304, 178 296 Z" fill="#566456" />
        </svg>
        <Slab x={84} y={362} w={188} h={10} r={5} color="#2C342E" />
        <Disc x={178} y={378} d={56} color="#FFE9A8" />
      </Paper>

      {/* warm top-left light and edge shading */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 14% 4%, rgba(255,240,200,0.3) 0%, rgba(255,240,200,0) 55%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(50,30,10,0.3) 100%)'}} />
    </AbsoluteFill>
  );
};
