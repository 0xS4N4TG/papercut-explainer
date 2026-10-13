// The one base creature for the whole cast: a boxy paper critter with eyes only and stubby limbs.
// Cast members differ by colour, accessory and name pill. (x, y) is the ground point under the body.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../tokens';
import {Disc, Paper, Pill, Slab, bob} from '../paper/kit';

export type Expr = 'idle' | 'sleep' | 'shock' | 'happy' | 'worried' | 'blink' | 'squint';
export type Acc = 'none' | 'postCap' | 'monocle' | 'headphones' | 'visor' | 'cap' | 'hardhat' | 'beret' | 'glasses' | 'headset' | 'bowtie';
// Hat-like accessories push the name pill up.
const HAT: Acc[] = ['postCap', 'headphones', 'cap', 'hardhat', 'beret'];

export const Critter: React.FC<{
  x: number; y: number; size?: number; color?: string; shade?: string;
  expr?: Expr; acc?: Acc; tag?: string; tagColor?: string;
  armR?: number; armRAngle?: number; armL?: number; armLAngle?: number;   // reach 0–1, angle deg (negative = up)
  lean?: number; lift?: number; face?: 1 | -1; tape?: boolean; phase?: number; idle?: boolean;
  holdR?: React.ReactNode;   // drawn at the tip of the right arm
  accColor?: string; accShade?: string;   // colour for cap / hardhat / beret / headset / bowtie (role colour for agents)
}> = ({x, y, size = 240, color = C.hero, shade = C.heroLo, expr = 'idle', acc = 'none', tag, tagColor = C.purple, accColor, accShade, armR = 0, armRAngle = 0, armL = 0, armLAngle = 0, lean = 0, lift = 0, face = 1, tape, phase = 0, idle = true, holdR}) => {
  const f = useCurrentFrame();
  const u = size / 10;
  const b = idle ? bob(f, 36, 3, phase) : 0;
  const bLag = idle ? bob(f - 2, 36, 3, phase) : 0;
  const blink = expr === 'idle' && (f + Math.round(phase * 7)) % 83 < 3;
  const bodyW = 10 * u, bodyH = 7 * u, legH = 2.2 * u;
  const top = -legH - bodyH;   // body top, relative to ground
  const e = expr === 'blink' || blink ? 'blink' : expr;
  const eyeW = u * (e === 'shock' ? 1.3 : 1), eyeH = u * (e === 'shock' ? 2.1 : 1.6);
  const eyes = [[3 * u, 2 * u], [6 * u, 2 * u]];
  const arm = (side: 1 | -1, reach: number, ang: number) => {
    const len = 2.3 * u + reach * 5 * u;
    const ax = side === 1 ? bodyW - 0.4 * u : 0.4 * u;
    return (
      <div style={{position: 'absolute', left: ax, top: 3.4 * u, width: 0, height: 0, rotate: `${side === 1 ? ang : -ang}deg`}}>
        <Slab x={side === 1 ? 0 : -len} y={-0.7 * u} w={len} h={1.4 * u} color={color} shade={shade} shadeH={0.3} r={3} />
        {side === 1 && holdR ? <div style={{position: 'absolute', left: len, top: 0}}>{holdR}</div> : null}
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, scale: `${face} 1`}}>
      <div style={{position: 'absolute', left: 0, top: -lift + b, width: 0, height: 0, rotate: `${lean}deg`, transformOrigin: '0 0'}}>
        <div style={{position: 'absolute', left: -bodyW / 2, top: top, width: bodyW, height: bodyH + legH}}>
          <Paper lift={5}>
            {/* legs: four stubs */}
            {[1.2, 3.3, 5.7, 7.8].map((lx, i) => (
              <Slab key={i} x={lx * u} y={bodyH - 0.3 * u} w={1 * u} h={legH + 0.3 * u} color={color} shade={shade} shadeH={0.35} r={2} />
            ))}
            {arm(-1, armL, armLAngle)}
            <Slab x={0} y={0} w={bodyW} h={bodyH} color={color} shade={shade} shadeH={0.16} r={4} />
            {arm(1, armR, armRAngle)}
            {/* eyes */}
            {eyes.map(([ex, ey], i) =>
              e === 'sleep' || e === 'blink' || e === 'happy' ? (
                <div key={i} style={{position: 'absolute', left: ex - 0.15 * u, top: ey + (e === 'happy' ? 0.3 * u : 0.8 * u), width: 1.3 * u, height: 0.28 * u, background: C.ink, borderRadius: e === 'happy' ? '50% 50% 0 0' : 2}} />
              ) : (
                <div key={i} style={{position: 'absolute', left: ex + (e === 'worried' ? (i ? -0.2 : 0.2) * u : 0) + (1 * u - eyeW) / 2, top: ey + (e === 'squint' ? 0.5 * u : 0), width: eyeW, height: e === 'squint' ? 0.6 * u : eyeH, background: C.ink, borderRadius: 2}} />
              ),
            )}
            {e === 'shock' ? <div style={{position: 'absolute', left: 4.4 * u, top: 4.5 * u, width: 1.1 * u, height: 1.1 * u, borderRadius: '50%', background: C.ink}} /> : null}
            {e === 'happy' ? <div style={{position: 'absolute', left: 4 * u, top: 4.4 * u, width: 2 * u, height: 0.3 * u, background: C.ink, borderRadius: 3}} /> : null}
            {tape ? <Slab x={2.6 * u} y={4.1 * u} w={4.8 * u} h={1.3 * u} color={C.tape} rot={-6} r={2} style={{opacity: 0.92}} /> : null}
            {/* accessories */}
            {acc === 'postCap' ? (
              <>
                <Slab x={1.2 * u} y={-1.9 * u} w={7.6 * u} h={2.1 * u} color={C.cap} shade={C.capLo} shadeH={0.3} r="40% 40% 6px 6px" />
                <Slab x={5.4 * u} y={-0.1 * u} w={4.6 * u} h={0.7 * u} color={C.capLo} r={3} />
                <Slab x={4.3 * u} y={-1.5 * u} w={1.3 * u} h={1.1 * u} color={C.brass} shade={C.brassLo} r={3} />
              </>
            ) : null}
            {acc === 'monocle' ? (
              <>
                <div style={{position: 'absolute', left: 5.5 * u, top: 1.5 * u, width: 2 * u, height: 2 * u, borderRadius: '50%', border: `${0.35 * u}px solid ${C.brass}`, boxSizing: 'border-box', background: 'rgba(255,255,255,0.12)'}} />
                <div style={{position: 'absolute', left: 6.4 * u, top: 3.5 * u, width: 0.2 * u, height: 2.4 * u, background: C.brassLo, rotate: '-12deg'}} />
                <Slab x={3.4 * u} y={6.3 * u} w={3.2 * u} h={1.3 * u} color={C.nogo} shade={C.nogoDim} r="40%" />
              </>
            ) : null}
            {acc === 'headphones' ? (
              <>
                <div style={{position: 'absolute', left: 0.6 * u, top: -1.6 * u, width: 8.8 * u, height: 4 * u, borderRadius: '50% 50% 0 0', border: `${0.6 * u}px solid ${C.board}`, borderBottom: 'none', boxSizing: 'border-box'}} />
                <Slab x={-0.4 * u} y={1.4 * u} w={1.5 * u} h={2.4 * u} color={C.board} r={6} />
                <Slab x={8.9 * u} y={1.4 * u} w={1.5 * u} h={2.4 * u} color={C.board} r={6} />
              </>
            ) : null}
            {acc === 'visor' ? <Slab x={0.8 * u} y={-0.8 * u} w={9.6 * u} h={1.2 * u} color={accColor ?? C.go} shade={accShade ?? C.goDim} shadeH={0.4} r={4} /> : null}
            {acc === 'cap' ? (
              // "you": blue baseball cap, brim forward (to the right)
              <>
                <Slab x={1.4 * u} y={-2.1 * u} w={7.2 * u} h={2.4 * u} color={accColor ?? C.cap} shade={accShade ?? C.capLo} shadeH={0.28} r="50% 50% 4px 4px" />
                <Slab x={6.2 * u} y={0} w={4.4 * u} h={0.75 * u} color={accShade ?? C.capLo} r="3px 40% 40% 3px" />
                <Disc x={5 * u} y={-2 * u} d={0.9 * u} color={accShade ?? C.capLo} />
              </>
            ) : null}
            {acc === 'hardhat' ? (
              <>
                <Slab x={1 * u} y={-2.3 * u} w={8 * u} h={2.6 * u} color={accColor ?? C.amber} shade={accShade ?? C.amberDim} shadeH={0.22} r="50% 50% 3px 3px" />
                <Slab x={0.2 * u} y={0} w={9.6 * u} h={0.7 * u} color={accShade ?? C.amberDim} r={3} />
                <Slab x={4.6 * u} y={-2.2 * u} w={0.8 * u} h={2.2 * u} color={accShade ?? C.amberDim} r={2} />
              </>
            ) : null}
            {acc === 'beret' ? (
              <>
                <Slab x={1.6 * u} y={-1.5 * u} w={7.6 * u} h={1.9 * u} color={accColor ?? C.ink} shade={accShade ?? '#000'} shadeH={0.3} r="55% 45% 40% 40%" rot={-6} />
                <Slab x={4.8 * u} y={-2.1 * u} w={0.6 * u} h={0.9 * u} color={accColor ?? C.ink} r={3} />
              </>
            ) : null}
            {acc === 'glasses' ? (
              <>
                {[[2.4, 1.6], [5.6, 1.6]].map(([gx, gy], i) => (
                  <div key={i} style={{position: 'absolute', left: gx * u, top: gy * u, width: 2.1 * u, height: 2.1 * u, borderRadius: '50%', border: `${0.32 * u}px solid ${C.ink}`, boxSizing: 'border-box', background: 'rgba(255,255,255,0.14)'}} />
                ))}
                <div style={{position: 'absolute', left: 4.4 * u, top: 2.5 * u, width: 1.3 * u, height: 0.3 * u, background: C.ink}} />
              </>
            ) : null}
            {acc === 'headset' ? (
              <>
                <div style={{position: 'absolute', left: 0.4 * u, top: -1.2 * u, width: 9.2 * u, height: 3.4 * u, borderRadius: '50% 50% 0 0', border: `${0.45 * u}px solid ${C.board}`, borderBottom: 'none', boxSizing: 'border-box'}} />
                <Slab x={-0.3 * u} y={1.6 * u} w={1.3 * u} h={2 * u} color={accColor ?? C.board} r={6} />
                <div style={{position: 'absolute', left: 0.3 * u, top: 3.4 * u, width: 3.2 * u, height: 0.3 * u, background: C.board, rotate: '18deg', transformOrigin: '0 0'}} />
                <Disc x={3.5 * u} y={4.5 * u} d={0.8 * u} color={C.board} />
              </>
            ) : null}
            {acc === 'bowtie' ? (
              <>
                <Slab x={3.5 * u} y={6 * u} w={1.5 * u} h={1.4 * u} color={accColor ?? C.nogo} r="40% 10% 10% 40%" />
                <Slab x={5 * u} y={6 * u} w={1.5 * u} h={1.4 * u} color={accColor ?? C.nogo} r="10% 40% 40% 10%" />
                <Disc x={5 * u} y={6.7 * u} d={0.8 * u} color={accShade ?? C.nogoDim} />
              </>
            ) : null}
          </Paper>
        </div>
        {tag ? (
          <div style={{position: 'absolute', left: 0, top: top - (HAT.includes(acc) ? 3.3 : 1.6) * u + (bLag - b), scale: `${face} 1`}}>
            <Pill x={0} y={0} text={tag} bg={tagColor} size={Math.max(24, 0.13 * size)} />
          </div>
        ) : null}
      </div>
    </div>
  );
};
