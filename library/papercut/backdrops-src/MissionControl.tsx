// Backdrop mission-control: cool night. Navy wall, console desk left, monitor wall right, blank central screen, dark carpet. floorY 1440.
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {GRAIN, Paper, Slab} from '../lib/paper/kit';

const FLOOR = 1440;
const TEAL = '#3FD6C4';
const AMBER = '#F2A93B';

const Monitor: React.FC<{x: number; y: number; w: number; h: number; hue?: 'teal' | 'blue' | 'off'; rot?: number}> = ({x, y, w, h, hue = 'teal', rot = 0}) => {
  const glow = hue === 'teal' ? 'rgba(63,214,196,0.55)' : hue === 'blue' ? 'rgba(88,150,230,0.5)' : 'rgba(40,70,90,0.25)';
  const base = hue === 'teal' ? '#0F3A44' : hue === 'blue' ? '#10304F' : '#0B1626';
  return (
    <>
      {hue !== 'off' ? <div style={{position: 'absolute', left: x - 30, top: y - 30, width: w + 60, height: h + 60, borderRadius: 30, background: glow, filter: 'blur(26px)', opacity: 0.35}} /> : null}
      <Slab x={x} y={y} w={w} h={h} r={8} color="#0A1220" rot={rot} shade="#060B15" shadeH={0.08}>
        <Slab x={8} y={8} w={w - 16} h={h - 20} r={4} color={base} grain={0.35} style={{background: `radial-gradient(ellipse at 30% 25%, ${glow} 0%, rgba(0,0,0,0) 80%), ${base}`}} />
        <div style={{position: 'absolute', right: 10, bottom: 5, width: 6, height: 6, borderRadius: 3, background: hue === 'off' ? '#1A2536' : AMBER, boxShadow: hue === 'off' ? undefined : `0 0 6px ${AMBER}`}} />
      </Slab>
    </>
  );
};

export const MissionControl: React.FC = () => {
  const rows = 6;
  return (
    <AbsoluteFill style={{backgroundColor: '#142039', overflow: 'hidden'}}>
      {/* wall paper grain + panel seams */}
      <AbsoluteFill style={{backgroundImage: `url(${GRAIN})`, backgroundSize: '700px', backgroundBlendMode: 'multiply', opacity: 0.9, mixBlendMode: 'multiply'}} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', left: 270 * i + 20, top: 0, width: 270, height: FLOOR, background: i % 2 ? 'rgba(8,14,30,0.18)' : 'rgba(255,255,255,0.025)', borderLeft: '2px solid rgba(5,10,22,0.35)'}} />
      ))}
      {/* ceiling shade (calm top) */}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 420, background: 'linear-gradient(rgba(6,10,22,0.55), rgba(6,10,22,0))'}} />
      {/* wainscot band */}
      <Slab x={-20} y={1290} w={1120} h={150} r={0} color="#1A2845" shade="#101A30" shadeH={0.3} hi="rgba(255,255,255,0.06)" hiH={0.04} />

      {/* big central screen on a wall bracket */}
      <Paper lift={8}>
        <Slab x={296} y={520} w={480} h={400} r={14} color="#1D2B47" shade="#0F182C" shadeH={0.1}>
          <Slab x={16} y={16} w={448} h={364} r={6} color="#0A1426" grain={0.3} style={{background: 'radial-gradient(ellipse at 28% 22%, rgba(63,150,170,0.20) 0%, rgba(0,0,0,0) 70%), #0A1426'}}>
            <div style={{position: 'absolute', left: -60, top: -40, width: 260, height: 520, background: 'rgba(255,255,255,0.05)', transform: 'rotate(24deg)'}} />
            <div style={{position: 'absolute', left: 170, top: -40, width: 90, height: 520, background: 'rgba(255,255,255,0.03)', transform: 'rotate(24deg)'}} />
          </Slab>
        </Slab>
        <Slab x={500} y={920} w={72} h={90} r={4} color="#121C33" shade="#0B1325" shadeH={0.3} />
        <Slab x={420} y={1000} w={232} h={24} r={8} color="#1A2845" shade="#0F182C" shadeH={0.4} />
      </Paper>

      {/* monitor wall, right edge */}
      <Paper lift={10}>
        <Slab x={800} y={440} w={300} h={1000} r={0} color="#0E1729" shade="#080F1D" shadeH={0.1} />
        {Array.from({length: rows}).map((_, i) => {
          const hues: ('teal' | 'blue' | 'off')[] = ['teal', 'off', 'blue', 'teal', 'off', 'blue', 'off', 'teal', 'blue', 'teal', 'off', 'teal'];
          const y = 462 + i * 164;
          return (
            <React.Fragment key={i}>
              <Monitor x={822} y={y} w={120} h={140} hue={hues[i * 2]} rot={i % 2 ? 0.4 : -0.3} />
              <Monitor x={954} y={y + (i % 2 ? 8 : -4)} w={120} h={140} hue={hues[i * 2 + 1]} rot={i % 2 ? -0.4 : 0.5} />
            </React.Fragment>
          );
        })}
        <Slab x={794} y={430} w={20} h={1010} r={2} color="#1B2A47" shade="#0E1729" shadeH={0.2} />
      </Paper>

      {/* console desk, left edge */}
      <Paper lift={9}>
        {[[18, 970, 108, 140, 'teal', -1.5], [140, 1000, 96, 112, 'blue', 0.5], [244, 1030, 78, 84, 'teal', 1]].map(([x, y, w, h, hue, r], i) => (
          <Monitor key={i} x={x as number} y={y as number} w={w as number} h={h as number} hue={hue as 'teal' | 'blue'} rot={r as number} />
        ))}
        <Slab x={-20} y={1120} w={350} h={60} r={6} color="#2A3B5E" shade="#1A2745" shadeH={0.45} hi="rgba(255,255,255,0.12)" hiH={0.2} />
        <Slab x={-20} y={1180} w={330} h={FLOOR - 1180} r={0} color="#18233C" shade="#0E1729" shadeH={0.2} />
        {/* keys */}
        {[0, 1, 2].map((r) => Array.from({length: 9}).map((_, c) => (
          <Slab key={`${r}-${c}`} x={4 + c * 30 + r * 6} y={1128 + r * 15} w={24} h={11} r={3} color="#3C506F" shade="#26364F" shadeH={0.4} />
        )))}
        {/* drawer fronts + LED dots */}
        {[0, 1].map((i) => <Slab key={i} x={20 + i * 150} y={1215} w={130} h={80} r={4} color="#202E4B" shade="#131D33" shadeH={0.2} hi="rgba(255,255,255,0.06)" hiH={0.1} />)}
        {[[30, 1330, TEAL], [52, 1330, TEAL], [74, 1330, AMBER], [96, 1330, TEAL], [170, 1330, AMBER], [192, 1330, TEAL]].map(([x, y, c], i) => (
          <div key={i} style={{position: 'absolute', left: x as number, top: y as number, width: 9, height: 9, borderRadius: 5, background: c as string, boxShadow: `0 0 8px ${c}`}} />
        ))}
      </Paper>

      {/* dark carpet floor */}
      <Slab x={-20} y={FLOOR} w={1120} h={1920 - FLOOR + 20} r={0} color="#161D2C" grain={0.7} />
      <div style={{position: 'absolute', left: 0, top: FLOOR, width: 1080, height: 90, background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0))'}} />
      <div style={{position: 'absolute', left: 0, top: FLOOR + 6, width: 340, height: 160, background: 'radial-gradient(ellipse at 20% 0%, rgba(63,214,196,0.16), rgba(0,0,0,0) 70%)'}} />
      <div style={{position: 'absolute', left: 760, top: FLOOR + 6, width: 320, height: 200, background: 'radial-gradient(ellipse at 80% 0%, rgba(63,214,196,0.18), rgba(0,0,0,0) 70%)'}} />
      <Slab x={-20} y={FLOOR - 6} w={1120} h={10} r={0} color="#0B1220" />
      {[300, 440, 600, 720].map((x, i) => <div key={i} style={{position: 'absolute', left: x, top: FLOOR + 30 + i * 6, width: 80 + i * 20, height: 3, background: 'rgba(255,255,255,0.025)', borderRadius: 2}} />)}

      {/* paper fibre + dust scan */}
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'soft-light', opacity: 0.75}}>
        <filter id="mcfibre"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves={3} seed={4} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.4 -0.2" /></filter>
        <rect width={1080} height={1920} filter="url(#mcfibre)" />
      </svg>
      <AbsoluteFill style={{backgroundImage: `url(${staticFile('bg/textures/paper-scan-dark.jpg')})`, backgroundSize: 'auto 2200px', backgroundPosition: '-300px -240px', mixBlendMode: 'screen', opacity: 0.35}} />
      {/* soft top-left light + vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 15% 8%, rgba(150,190,255,0.14) 0%, rgba(0,0,0,0) 55%), radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)'}} />
    </AbsoluteFill>
  );
};
