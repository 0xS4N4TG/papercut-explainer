// Scene template: the comment-keyword CTA, the last set of an episode. It whip-pans in, a paper phone types KEYWORD
// and posts it, and a paper DM envelope opens on "send" and fans out the deliverable cards (any count). There's a sparkle,
// then a calm hold. A whole CTA scene is ~10 lines:
//   const cue = cueOf(ID);
//   <CtaPhoneDM dur={durOf(ID)} keyword="GUIDE" typeAt={cue('Comment')} postAt={cue('and') + 2} sendAt={cue('send')}
//     landAt={cue('get')} sparkleAt={cue('files')} itemW={270} itemH={319}
//     items={[1, 2, 3, 4].map((n) => <NumberCard x={0} y={0} w={270} h={319} big={String(n)} />)} mascot={<You x={870} y={1420} size={260} expr="happy" />} />
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, FONT} from '../tokens';
import {CameraPush, Paper, Pill, Slab, SparkleBurst} from '../paper/kit';
import {Room, Sticky, WhipIn} from '../paper/sets';
import {PhoneComment} from '../ui/ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const mono = (...v: number[]) => v.reduce<number[]>((a, x) => [...a, a.length ? Math.max(a[a.length - 1] + 1, x) : x], []);
const KRAFT = '#CDB98F', KRAFT_LO = '#B09B70', KRAFT_HI = '#DCCBA5';

export const CtaPhoneDM: React.FC<{
  dur: number; keyword: string;
  typeAt: number; postAt?: number; sendAt: number; landAt: number; sparkleAt: number;   // scene-relative frames (use cue words)
  items: React.ReactNode[]; itemW: number; itemH: number;   // deliverable cards, each drawn with its top-left at (0, 0)
  room?: string; mascot?: React.ReactNode; count?: boolean; label?: string; fpc?: number; whip?: boolean;
  env?: {x: number; y: number; w: number; h: number}; spread?: number;   // envelope box; total fan angle in degrees
  supports?: boolean;   // a bench under the phone and a bracketed shelf under the envelope, so neither floats
}> = ({dur, keyword, typeAt, postAt, sendAt, landAt, sparkleAt, items, itemW, itemH, room = 'teal', mascot, count = true, label = 'DM', fpc = 4,
       whip = true, env = {x: 560, y: 800, w: 440, h: 260}, spread = 66, supports = true}) => {
  const f = useCurrentFrame();
  const tPost = postAt ?? typeAt + keyword.length * fpc + 2;
  const E = env, pivot = {x: E.x + E.w / 2, y: E.y + E.h * 0.54};
  const prog = interpolate(f, mono(sendAt, sendAt + 6), [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const flapY = Math.cos(prog * Math.PI);
  const breathe = 1 + 0.012 * Math.sin(f / 11);
  const N = items.length, gap = 3;
  const starts = items.map((_, i) => Math.max(sendAt + 4, landAt - (N - 1 - i) * gap));
  const hold = Math.max(0, Math.min(1, (f - (landAt + 20)) / 20));
  const flap = (
    <div style={{position: 'absolute', left: E.x, top: E.y, width: E.w, height: E.h * 0.58, transformOrigin: '50% 0', scale: `1 ${flapY}`}}>
      <Slab x={0} y={0} w={E.w} h={E.h * 0.58} color={flapY >= 0 ? KRAFT_HI : KRAFT_LO} r={0} style={{clipPath: 'polygon(0 0, 100% 0, 50% 100%)', overflow: 'visible'}} />
    </div>
  );
  const body = (
    <CameraPush dur={dur} to={1.035} origin="50% 58%">
      <Room color={room} />
      <Sticky x={900} y={452} s={90} rot={5} />
      <Sticky x={780} y={470} s={80} color="#E99BB0" rot={-6} />
      {supports ? (
        <>
          <Paper lift={6}>
            <Slab x={-20} y={1350} w={580} h={26} color={C.woodHi} shade={C.wood} shadeH={0.4} r={4} />
            <Slab x={0} y={1376} w={540} h={30} color={C.wood} shade={C.woodLo} shadeH={0.2} r={2} />
            <Slab x={24} y={1404} w={30} h={16} color={C.woodLo} r={2} />
            <Slab x={486} y={1404} w={30} h={16} color={C.woodLo} r={2} />
          </Paper>
          <Paper lift={5}>
            <Slab x={E.x + 28} y={E.y + E.h} w={E.w + 6} h={22} color={C.woodHi} shade={C.wood} shadeH={0.4} r={3} />
            <Slab x={E.x + 50} y={E.y + E.h + 22} w={46} h={58} color={C.woodLo} r={2} style={{clipPath: 'polygon(0 0, 100% 0, 0 100%)'}} />
            <Slab x={E.x + E.w - 56} y={E.y + E.h + 22} w={46} h={58} color={C.woodLo} r={2} style={{clipPath: 'polygon(0 0, 100% 0, 100% 100%)'}} />
          </Paper>
        </>
      ) : null}
      <PhoneComment x={34} y={470} keyword={keyword} typeAt={typeAt} fpc={fpc} postAt={tPost} scale={0.88} />
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${pivot.x}px ${E.y + E.h}px`, scale: String(breathe)}}>
        <Paper lift={7}><Slab x={E.x} y={E.y} w={E.w} h={E.h} color={KRAFT_LO} r={8} /></Paper>
        {prog >= 0.5 ? <Paper lift={3}>{flap}</Paper> : null}
        {items.map((node, i) => {
          const u = interpolate(f, mono(starts[i], starts[i] + 9), [0, 1], clamp);
          const up = Easing.out(Easing.back(1.25))(u), open = Easing.out(Easing.cubic)(u);
          const ang = N > 1 ? -spread / 2 + (spread * i) / (N - 1) : 0;
          const wig = Math.sin((f + i * 9) / 8) * 1.2 * hold + Math.sin(f / 5 + i * 2) * 0.35 * hold;
          const rise = interpolate(up, [0, 1], [itemH + 20, 40]);
          return (
            <div key={i} style={{position: 'absolute', left: pivot.x, top: pivot.y, width: 0, height: 0, rotate: `${ang * open + wig}deg`, opacity: f < starts[i] ? 0 : 1}}>
              <div style={{position: 'absolute', left: -itemW / 2, top: -itemH + rise, width: itemW, height: itemH}}>{node}</div>
            </div>
          );
        })}
        <Paper lift={4}>
          <Slab x={E.x} y={E.y + E.h * 0.4} w={E.w} h={E.h * 0.6} color={KRAFT} shade={KRAFT_LO} shadeH={0.1} r="0 0 8px 8px" />
          <Slab x={E.x} y={E.y + E.h * 0.4} w={E.w} h={E.h * 0.6} color={KRAFT_HI} r={0} style={{clipPath: 'polygon(0 0, 50% 55%, 0 100%)'}} />
          <Slab x={E.x} y={E.y + E.h * 0.4} w={E.w} h={E.h * 0.6} color={KRAFT_HI} r={0} style={{clipPath: 'polygon(100% 0, 50% 55%, 100% 100%)'}} />
          <Slab x={E.x} y={E.y + E.h * 0.4} w={E.w} h={E.h * 0.6} color={KRAFT_LO} r={0} style={{clipPath: 'polygon(0 100%, 50% 55%, 100% 100%)', opacity: 0.55}} />
        </Paper>
        {prog < 0.5 ? <Paper lift={4}>{flap}</Paper> : null}
        <Pill x={E.x + 70} y={E.y + E.h - 62} text={label} bg={C.brand} color="#fff" size={30} rot={-6} />
        {count && N > 1 ? (
          <div style={{position: 'absolute', left: E.x + E.w - 40, top: E.y + E.h - 62, translate: '-100% -50%', display: 'flex', gap: 14, padding: '9px 22px 11px', borderRadius: 16, background: C.ink,
            fontFamily: FONT.label, fontWeight: 800, fontSize: 34, boxShadow: '1px 3px 5px rgba(0,0,0,0.35)'}}>
            {items.map((_, i) => <span key={i} style={{color: f >= starts[i] + 4 ? C.amber : '#6C6678'}}>{i + 1}</span>)}
          </div>
        ) : null}
      </div>
      {mascot}
      <SparkleBurst at={sparkleAt} x={pivot.x} y={E.y - 20} seed="ctafiles" spread={2.6} />
      <SparkleBurst at={tPost + 1} x={34 + 0.88 * 330} y={470 + 0.88 * 420} seed="ctapost" spread={1.2} />
      <SparkleBurst at={sparkleAt + 38} x={pivot.x - 90} y={E.y - 50} seed="ctalate" spread={2.2} />
    </CameraPush>
  );
  return <AbsoluteFill>{whip ? <WhipIn>{body}</WhipIn> : body}</AbsoluteFill>;
};
