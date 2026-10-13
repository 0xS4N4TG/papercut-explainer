// Backdrop courtroom: oak bench + gavel (left), witness stand (right), sage wall over oak panelling, blank seal disc, honey floor.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Disc, Paper, Slab} from '../lib/paper/kit';

const FLOOR = 1450;
const OAK = '#A87444';
const OAK_HI = '#B98655';
const OAK_LO = '#7E5429';
const OAK_DK = '#6E4A28';
const SAGE = '#A9B795';
const SAGE_LO = '#8FA07C';

// A raised panel: a darker recess with a lighter inset slab on top (stacked paper).
const RaisedPanel: React.FC<{x: number; y: number; w: number; h: number; base?: string; inset?: string; shade?: string}> = ({x, y, w, h, base = OAK_LO, inset = OAK_HI, shade = OAK}) => (
  <>
    <Slab x={x} y={y} w={w} h={h} r={3} color={base} />
    <Slab x={x + 7} y={y + 8} w={w - 14} h={h - 14} r={3} color={inset} shade={shade} shadeH={0.1} hi="rgba(255,255,255,0.12)" hiH={0.05} />
  </>
);

export const Courtroom: React.FC = () => {
  const wainY = 880;
  return (
    <AbsoluteFill style={{backgroundColor: SAGE}}>
      {/* sage upper wall */}
      <Slab x={-20} y={-20} w={1120} h={wainY + 40} r={0} color={SAGE} grain={0.6} />
      {/* faint vertical wallpaper stripes of lighter paper */}
      {Array.from({length: 9}).map((_, i) => (
        <div key={i} style={{position: 'absolute', left: 30 + i * 125, top: 0, width: 60, height: wainY, background: 'rgba(255,255,255,0.06)'}} />
      ))}

      {/* oak wainscot panelling across the back wall */}
      <Paper lift={5}>
        <Slab x={-20} y={wainY} w={1120} h={FLOOR - wainY + 10} r={0} color={OAK} hi="rgba(255,255,255,0.1)" hiH={0.02} />
        {Array.from({length: 6}).map((_, i) => (
          <RaisedPanel key={i} x={-10 + i * 190} y={wainY + 70} w={175} h={FLOOR - wainY - 150} base={OAK_LO} inset={i % 2 ? OAK : OAK_HI} shade={OAK_LO} />
        ))}
        {/* chair rail */}
        <Slab x={-20} y={wainY - 4} w={1120} h={46} r={3} color={OAK_HI} shade={OAK_LO} shadeH={0.3} hi="rgba(255,255,255,0.2)" hiH={0.2} />
        <Slab x={-20} y={wainY + 40} w={1120} h={14} r={0} color={OAK_DK} />
        {/* skirting */}
        <Slab x={-20} y={FLOOR - 40} w={1120} h={46} r={0} color={OAK_LO} shade={OAK_DK} shadeH={0.4} />
      </Paper>

      {/* crown moulding at the very top (kept plain/dark-ish, no detail) */}
      <Slab x={-20} y={-10} w={1120} h={40} r={0} color={SAGE_LO} />

      {/* blank round seal: stacked discs */}
      <Paper lift={7}>
        <Disc x={540} y={520} d={226} color={OAK_DK} />
        <Disc x={540} y={520} d={196} color="#D6B36A" shade="#B38F45" />
        <Disc x={540} y={520} d={150} color="#E6C97F" shade="#C9A75A" />
        <Disc x={540} y={520} d={96} color="#D6B36A" shade="#B38F45" />
      </Paper>

      {/* honey floor */}
      <Paper lift={4}>
        <Slab x={-20} y={FLOOR} w={1120} h={1920 - FLOOR + 20} r={0} color="#D9A85C" grain={0.7} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{position: 'absolute', left: -10, right: -10, top: FLOOR + 36 + i * 76 + (i % 2) * 6, height: 4, background: '#B58238', opacity: 0.75}} />
        ))}
        {/* butt joints, staggered */}
        {[0, 1, 2, 3, 4, 5].map((i) => [0, 1, 2].map((j) => (
          <div key={`${i}-${j}`} style={{position: 'absolute', left: ((i * 233 + j * 387 + 80) % 1100), top: FLOOR + 40 + i * 76 + (i % 2) * 6, width: 4, height: 72, background: '#B58238', opacity: 0.6}} />
        )))}
      </Paper>
      <AbsoluteFill style={{top: FLOOR, height: 90, background: 'linear-gradient(rgba(60,30,0,0.35), rgba(0,0,0,0))'}} />

      {/* judge's bench, left edge (taller than the wainscot, lighter oak, deep shadow) */}
      <Paper lift={20}>
        <Slab x={-20} y={780} w={316} h={FLOOR - 780} r={4} color="#CF9A62" shade={OAK} shadeH={0.06} />
        {[0, 1].map((i) => (
          <RaisedPanel key={i} x={-4 + i * 138} y={900} w={134} h={FLOOR - 900 - 80} base={OAK_LO} inset="#DDAE76" shade="#C28F58" />
        ))}
        <Slab x={-20} y={FLOOR - 62} w={326} h={70} r={3} color={OAK} shade={OAK_LO} shadeH={0.4} />
        <Slab x={-30} y={744} w={350} h={46} r={5} color="#E0B27A" shade="#B98550" shadeH={0.35} hi="rgba(255,255,255,0.25)" hiH={0.22} />
        <Slab x={-30} y={788} w={340} h={36} r={3} color={OAK_LO} />
      </Paper>
      {/* gavel (upright, tilted) and sound block */}
      <Paper lift={9}>
        <Slab x={176} y={716} w={96} h={30} r={5} color={OAK_DK} shade="#4C3219" shadeH={0.4} />
        <div style={{position: 'absolute', left: 60, top: 600, width: 130, height: 150, rotate: '-22deg'}}>
          <Slab x={44} y={50} w={26} h={104} r={9} color="#DDB07A" shade={OAK_LO} shadeH={0.3} />
          <Slab x={4} y={0} w={122} h={64} r={10} color={OAK_LO} shade={OAK_DK} shadeH={0.32} hi="rgba(255,255,255,0.16)" hiH={0.18} />
          <Slab x={14} y={0} w={14} h={64} r={3} color="#D6B36A" shade="#B38F45" shadeH={0.3} />
          <Slab x={102} y={0} w={14} h={64} r={3} color="#D6B36A" shade="#B38F45" shadeH={0.3} />
        </div>
      </Paper>

      {/* witness stand, right edge */}
      <Paper lift={18}>
        <Slab x={816} y={1000} w={290} h={FLOOR - 1000} r={4} color="#CF9A62" shade={OAK} shadeH={0.06} />
        <RaisedPanel x={836} y={1080} w={110} h={FLOOR - 1080 - 80} base={OAK_LO} inset="#DDAE76" shade="#C28F58" />
        <RaisedPanel x={960} y={1080} w={110} h={FLOOR - 1080 - 80} base={OAK_LO} inset="#DDAE76" shade="#C28F58" />
        <Slab x={810} y={FLOOR - 56} w={300} h={64} r={3} color={OAK_LO} shade={OAK_DK} shadeH={0.4} />
        {/* rail with spindles */}
        {Array.from({length: 6}).map((_, i) => (
          <Slab key={i} x={836 + i * 50} y={930} w={20} h={74} r={8} color="#E0B27A" shade="#B98550" shadeH={0.4} />
        ))}
        <Slab x={806} y={900} w={300} h={38} r={5} color="#E0B27A" shade={OAK_LO} shadeH={0.35} hi="rgba(255,255,255,0.2)" hiH={0.2} />
        <Slab x={806} y={996} w={300} h={30} r={4} color="#E0B27A" shade={OAK_LO} shadeH={0.4} />
      </Paper>

      {/* soft top-left light + edge shading */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 12% 6%, rgba(255,244,214,0.38) 0%, rgba(255,244,214,0) 55%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(40,25,10,0.28) 100%)'}} />
    </AbsoluteFill>
  );
};
