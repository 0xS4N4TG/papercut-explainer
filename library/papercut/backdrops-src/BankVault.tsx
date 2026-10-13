// Backdrop bank-vault: steel wall, giant round vault door at the left edge, safe-deposit boxes at the right edge,
// polished grey-green floor with a faint reflection, velvet rope low at the left.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Disc, Paper, Slab} from '../lib/paper/kit';

const FLOOR = 1450;
const WALL = '#8D9CA7';
const STEEL = '#A9B6BF';
const STEEL_HI = '#C2CDD4';
const STEEL_LO = '#6F7F8B';
const STEEL_DK = '#4E5C67';
const BRASS = '#C9A95E';
const BRASS_LO = '#A5863F';

const VX = 36; // vault door centre
const VY = 960;

const VaultDoor: React.FC = () => {
  const bolts = Array.from({length: 16}).map((_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return {x: VX + Math.cos(a) * 262, y: VY + Math.sin(a) * 262};
  });
  const frameBolts = Array.from({length: 12}).map((_, i) => {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    return {x: VX + Math.cos(a) * 322, y: VY + Math.sin(a) * 322};
  });
  return (
    <>
      {/* recess shadow in the wall */}
      <Disc x={VX + 8} y={VY + 10} d={760} color="#3F4C57" />
      <Paper lift={10}>
        <Disc x={VX} y={VY} d={716} color={STEEL_DK} />
        <Disc x={VX} y={VY} d={676} color={STEEL_LO} />
        {frameBolts.map((b, i) => <Disc key={i} x={b.x} y={b.y} d={30} color={STEEL} shade={STEEL_LO} />)}
      </Paper>
      <Paper lift={12}>
        <Disc x={VX} y={VY} d={600} color={STEEL} />
        <Disc x={VX} y={VY} d={540} color="#9AA8B2" />
        <Disc x={VX} y={VY} d={440} color={STEEL_HI} />
        <Disc x={VX} y={VY} d={420} color="#A3B0BA" />
        {bolts.map((b, i) => <Disc key={i} x={b.x} y={b.y} d={36} color={STEEL_HI} shade={STEEL_LO} />)}
      </Paper>
      {/* hinges, right side of the door */}
      <Paper lift={8}>
        <Slab x={VX + 300} y={VY - 190} w={70} h={96} r={8} color={STEEL_DK} shade="#38444E" shadeH={0.3} />
        <Slab x={VX + 300} y={VY + 94} w={70} h={96} r={8} color={STEEL_DK} shade="#38444E" shadeH={0.3} />
      </Paper>
      {/* handwheel: six spokes, hub, blank dial */}
      <Paper lift={9}>
        {[0, 60, 120].map((r) => (
          <Slab key={r} x={VX - 190} y={VY - 13} w={380} h={26} r={13} color={BRASS} shade={BRASS_LO} shadeH={0.4} rot={r} />
        ))}
        {[0, 60, 120, 180, 240, 300].map((r) => {
          const a = (r * Math.PI) / 180;
          return <Disc key={r} x={VX + Math.cos(a) * 190} y={VY + Math.sin(a) * 190} d={50} color={BRASS} shade={BRASS_LO} />;
        })}
        <Disc x={VX} y={VY} d={168} color={STEEL_DK} shade="#38444E" />
        <Disc x={VX} y={VY} d={140} color={STEEL_HI} shade={STEEL_LO} />
        <Disc x={VX} y={VY} d={92} color={BRASS} shade={BRASS_LO} />
        <Disc x={VX} y={VY} d={30} color={STEEL_DK} />
      </Paper>
    </>
  );
};

const Boxes: React.FC = () => {
  const cols = 3, rows = 10, cw = 90, ch = 68;
  const x0 = 804, y0 = 700;
  return (
    <>
      <Paper lift={14}>
        <Slab x={x0 - 24} y={y0 - 40} w={cols * cw + 48 + 14} h={rows * ch + 80} r={5} color={STEEL_DK} shade="#38444E" shadeH={0.05} />
        {Array.from({length: rows}).map((_, r) => Array.from({length: cols}).map((__, c) => {
          const shade = (r * 3 + c) % 4;
          const colr = ['#B3BFC7', '#A9B6BF', '#B9C4CB', '#AEBAC3'][shade];
          return (
            <Slab key={`${r}-${c}`} x={x0 + c * cw} y={y0 + r * ch} w={cw - 8} h={ch - 8} r={4} color={colr} shade={STEEL_LO} shadeH={0.14} hi="rgba(255,255,255,0.28)" hiH={0.1}>
              {/* blank label slot + keyhole disc */}
              <div style={{position: 'absolute', left: 14, top: 10, width: cw - 36, height: 10, background: '#E5E9EC', opacity: 0.85, borderRadius: 2}} />
              <div style={{position: 'absolute', left: (cw - 8) / 2 - 9, top: 28, width: 18, height: 18, borderRadius: 9, background: BRASS, boxShadow: 'inset -2px -3px 0 rgba(0,0,0,0.18)'}} />
              <div style={{position: 'absolute', left: (cw - 8) / 2 - 2, top: 33, width: 4, height: 9, background: STEEL_DK, borderRadius: 2}} />
            </Slab>
          );
        }))}
      </Paper>
    </>
  );
};

const Rope: React.FC = () => (
  <>
    {/* velvet rope sagging between two brass posts, low at the left */}
    <Paper lift={8}>
      {[70, 320].map((x) => (
        <React.Fragment key={x}>
          <Slab x={x - 44} y={FLOOR - 18} w={88} h={22} r="50%" color={BRASS} shade={BRASS_LO} shadeH={0.4} />
          <Slab x={x - 9} y={FLOOR - 250} w={18} h={240} r={8} color={BRASS} shade={BRASS_LO} shadeH={0.35} />
          <Disc x={x} y={FLOOR - 262} d={44} color="#D8BE78" shade={BRASS_LO} />
        </React.Fragment>
      ))}
    </Paper>
    <Paper lift={6}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d="M70 1198 C 140 1330, 250 1330, 320 1198 L 320 1226 C 250 1358, 140 1358, 70 1226 Z" fill="#7B1F2E" />
        <path d="M70 1198 C 140 1330, 250 1330, 320 1198 L 320 1210 C 250 1342, 140 1342, 70 1210 Z" fill="#A3303F" />
      </svg>
    </Paper>
  </>
);

export const BankVault: React.FC = () => {
  const reflect = (
    <>
      <VaultDoor />
      <Boxes />
    </>
  );
  return (
    <AbsoluteFill style={{backgroundColor: WALL}}>
      {/* steel wall: big plates with seams and rivet rows */}
      <Slab x={-20} y={-20} w={1120} h={FLOOR + 40} r={0} color={WALL} grain={0.6} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Slab key={i} x={-20} y={-20 + i * 330} w={1120} h={320} r={0} color={i % 2 ? WALL : '#94A3AE'} style={{opacity: 0.55}} />
      ))}
      {[330, 660, 990, 1320].map((y) => (
        <div key={y} style={{position: 'absolute', left: 0, right: 0, top: y - 20, height: 6, background: STEEL_LO, opacity: 0.55}} />
      ))}
      {/* skirting band */}
      <Paper lift={4}>
        <Slab x={-20} y={FLOOR - 70} w={1120} h={78} r={0} color={STEEL_LO} shade={STEEL_DK} shadeH={0.3} />
      </Paper>

      {/* polished floor + reflection */}
      <Slab x={-20} y={FLOOR} w={1120} h={1920 - FLOOR + 20} r={0} color="#7F968B" grain={0.7} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: FLOOR + 60 + i * i * 22 + i * 70, height: 4, background: '#667D72', opacity: 0.7}} />
      ))}
      {[180, 540, 900].map((x) => (
        <div key={x} style={{position: 'absolute', top: FLOOR, height: 470, left: x, width: 4, background: '#667D72', opacity: 0.55}} />
      ))}
      <div style={{position: 'absolute', left: 0, top: FLOOR, width: 1080, height: 330, overflow: 'hidden', opacity: 0.22, filter: 'blur(5px)',
        WebkitMaskImage: 'linear-gradient(rgba(0,0,0,1), rgba(0,0,0,0))', maskImage: 'linear-gradient(rgba(0,0,0,1), rgba(0,0,0,0))'}}>
        <div style={{position: 'absolute', left: 0, top: -FLOOR, width: 1080, height: 1920, transformOrigin: `0 ${FLOOR}px`, transform: 'scaleY(-1)'}}>
          {reflect}
        </div>
      </div>
      <AbsoluteFill style={{top: FLOOR, height: 80, background: 'linear-gradient(rgba(10,30,30,0.35), rgba(0,0,0,0))'}} />
      {/* soft sheen across the floor */}
      <div style={{position: 'absolute', left: -100, top: FLOOR + 90, width: 700, height: 160, background: 'radial-gradient(ellipse, rgba(255,255,255,0.14), rgba(255,255,255,0) 70%)'}} />

      <VaultDoor />
      <Boxes />
      <Rope />

      {/* cool top-left light and edge shading */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 14% 4%, rgba(235,246,255,0.36) 0%, rgba(235,246,255,0) 55%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,20,30,0.3) 100%)'}} />
    </AbsoluteFill>
  );
};
