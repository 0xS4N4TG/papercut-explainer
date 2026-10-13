// Everyday paper props that suit any episode. All paper (Slab / Disc / Pill inside <Paper>), motion only from useCurrentFrame().
//   Desk          small table with two legs and a rail, sits on a floor line
//   WallCalendar  hanging wall calendar whose month pages flip away to a big final date (+ optional pill)
//   BirthdayCake  two-tier cake on a stand with flickering candles
//   HomeSign      house-shaped enamel plaque with a word on it (default HOME)
//   Clipboard     technician's clipboard, made to ride a Critter's `holdR`
//   ThumbsUp      thumbs-up fist, made to ride a Critter's `holdR`
// Position conventions differ per prop and are in each doc line: Desk and WallCalendar take a top-left, BirthdayCake the floor point under it,
// HomeSign its middle. Clipboard and ThumbsUp are drawn around (0, 0) = the hand, so pass them as `holdR` and give `counterRot` = minus the arm's angle.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT} from '../tokens';
import {Disc, Paper, Pill, Slab} from '../paper/kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- desk ----------

// Small paper desk. (x, y) = top-left of the table top (w wide, 34 tall); the legs run down to the y of the `floor` line. top/topLo/topHi and legs/legsLo set the wood colours.
export const Desk: React.FC<{x: number; y: number; w: number; floor: number; top?: string; topLo?: string; topHi?: string; legs?: string; legsLo?: string}> = ({x, y, w, floor, top = '#D7A56E', topLo = '#A87A4C', topHi = '#E6BC88', legs = '#B98B5A', legsLo = '#94683F'}) => (
  <Paper lift={6}>
    <Slab x={x + 36} y={y + 20} w={40} h={floor - y - 20} r={4} color={legs} shade={legsLo} shadeH={0.2} />
    <Slab x={x + w - 76} y={y + 20} w={40} h={floor - y - 20} r={4} color={legs} shade={legsLo} shadeH={0.2} />
    <Slab x={x + 60} y={y + 120} w={w - 120} h={26} r={4} color={topLo} shade={legsLo} shadeH={0.3} />
    <Slab x={x} y={y} w={w} h={34} r={8} color={top} hi={topHi} hiH={0.3} shade={topLo} shadeH={0.25} />
  </Paper>
);

// ---------- wall calendar ----------

const DAYS = 7, WEEKS = 5;
const MonthGrid: React.FC<{w: number; h: number; top: number; tint: string; marks?: number[]}> = ({w, h, top, tint, marks = []}) => {
  const cw = (w - 40) / DAYS, ch = (h - top - 26) / WEEKS;
  return (
    <>
      {Array.from({length: DAYS * WEEKS}).map((_, i) => {
        const c = i % DAYS, r = Math.floor(i / DAYS);
        return <Slab key={i} x={20 + c * cw + 3} y={top + 8 + r * ch + 3} w={cw - 6} h={ch - 6} r={4} color={marks.includes(i) ? '#E7A39A' : tint} />;
      })}
    </>
  );
};

// One month page that flips away: its month word and the day-cell indexes (0-34) to mark in red.
export type CalendarPage = {month: string; marks?: number[]};

// Hanging wall calendar, w x h at (x, y) = top-left of the sheet (nail and string reach 58 px above). `pages` flip up and away one every `flipEvery` frames from `flipAt`, first page first, then the `final` page shows a huge day and an optional pill `label`. bump 0-1 pops it.
export const WallCalendar: React.FC<{x: number; y: number; flipAt: number; w?: number; h?: number; flipEvery?: number; rot?: number; bump?: number; pages?: CalendarPage[]; final?: {month: string; day: string; label?: string}; head?: string; headLo?: string; labelBg?: string}> = ({
  x, y, flipAt, w = 300, h = 340, flipEvery = 4, rot = -2.5, bump = 0, pages = [{month: 'JAN'}, {month: 'FEB', marks: [11, 12]}], final = {month: 'MAR', day: '1'}, head = '#C9573C', headLo = '#A6422B', labelBg = C.tag,
}) => {
  const f = useCurrentFrame();
  const headH = 74;
  const flipOf = (i: number) => interpolate(f, [flipAt + i * flipEvery, flipAt + i * flipEvery + 4], [0, 1], clamp);
  const endAt = flipAt + pages.length * flipEvery;
  const landed = interpolate(f, [endAt - 1, endAt + 2, endAt + 8], [0, 1, 0], clamp);
  const sheet = (month: string, children: React.ReactNode, key: string, extra?: React.CSSProperties) => (
    <Slab key={key} x={0} y={0} w={w} h={h} r={6} color="#F4EFE5" shade="#DAD2C2" shadeH={0.02} style={extra}>
      <Slab x={0} y={0} w={w} h={headH} r="6px 6px 0 0" color={head} shade={headLo} shadeH={0.12}>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: FONT.banner, fontSize: 40, color: C.tagText, letterSpacing: '0.08em'}}>{month}</div>
      </Slab>
      {children}
    </Slab>
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, rotate: `${rot}deg`, scale: String(1 + 0.08 * bump + 0.04 * landed), transformOrigin: '50% 0'}}>
      <Paper lift={7}>
        {/* string and nail */}
        <Slab x={w / 2 - 3} y={-52} w={6} h={56} r={3} color="#8A7A5C" />
        <Disc x={w / 2} y={-58} d={22} color={C.metal} shade={C.metalLo} />
        {/* the final page sits at the bottom of the stack */}
        {sheet(final.month, (
          <>
            <div style={{position: 'absolute', left: 0, right: 0, top: headH + 4, textAlign: 'center', fontFamily: FONT.banner, fontSize: Math.round(h * 0.44), lineHeight: 1.1, color: C.ink}}>{final.day}</div>
            {final.label ? <Pill x={w / 2} y={h - 62} text={final.label} bg={labelBg} color={C.tagText} size={32} center rot={-3} /> : null}
          </>
        ), 'final')}
        {pages.map((_, n) => pages.length - 1 - n).map((i) => {
          const p = pages[i];
          const u = flipOf(i);   // page 0 is on top (drawn last) and flips first
          if (u >= 1) return null;
          return sheet(p.month, <MonthGrid w={w} h={h} top={headH} tint="#DDD6C8" marks={p.marks} />, `p${i}`, {
            transformOrigin: '50% 0', scale: `1 ${Math.max(0.02, 1 - u * 1.05)}`, rotate: `${-u * 5}deg`, translate: `0 ${-u * 14}px`,
            opacity: 1 - Math.max(0, u - 0.8) * 5,
          });
        })}
      </Paper>
    </div>
  );
};

// ---------- birthday cake ----------

// Two-tier cake on a stand, about 330 px wide and 320 tall at s = 1. (x, y) = the floor point under the stand; `candles` (up to about 12) are spaced across the top tier; lit = flames on. color/colorLo = pink tier, topColor/topLo = cream tier.
export const BirthdayCake: React.FC<{x: number; y: number; s?: number; candles?: number; lit?: boolean; color?: string; colorLo?: string; topColor?: string; topLo?: string}> = ({x, y, s = 1, candles = 10, lit = true, color = '#E9A1B4', colorLo = '#CB7F95', topColor = '#F4E4C8', topLo = '#D9C39B'}) => {
  const f = useCurrentFrame();
  const candleCols = ['#6FA8DC', '#F4A7B9', '#F5C542', '#8FD0A0'];
  const cxOf = (i: number) => (candles > 1 ? -81 + (i * 162) / (candles - 1) : 0);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, scale: String(s), transformOrigin: '0 0'}}>
      <Paper lift={6}>
        {/* stand: foot, stem, plate */}
        <Slab x={-70} y={-16} w={140} h={16} r={8} color="#E9E1D2" shade="#C9BFAB" shadeH={0.4} />
        <Slab x={-18} y={-76} w={36} h={64} r={6} color="#E9E1D2" shade="#C9BFAB" shadeH={0.3} />
        <Slab x={-165} y={-98} w={330} h={26} r={13} color="#F2EBDD" shade="#CFC4AE" shadeH={0.4} hi="#FBF7EE" hiH={0.25} />
        {/* bottom tier with a frosting edge */}
        <Slab x={-125} y={-188} w={250} h={94} r="14px 14px 8px 8px" color={color} shade={colorLo} shadeH={0.2} hi="#F2BCCB" hiH={0.14} />
        <Slab x={-125} y={-188} w={250} h={26} r="14px 14px 0 0" color="#FBF3E6" />
        {[-100, -62, -20, 22, 64, 98].map((dx, i) => <Slab key={i} x={dx - 11} y={-170} w={22} h={22 + (i % 3) * 10} r={11} color="#FBF3E6" />)}
        {/* top tier */}
        <Slab x={-88} y={-244} w={176} h={62} r="12px 12px 4px 4px" color={topColor} shade={topLo} shadeH={0.2} hi="#FBF1DD" hiH={0.14} />
        <Slab x={-88} y={-244} w={176} h={20} r="12px 12px 0 0" color={color} />
        {/* candles */}
        {Array.from({length: candles}).map((_, i) => (
          <Slab key={i} x={cxOf(i) - 4} y={-282} w={8} h={40} r={3} color={candleCols[i % 4]} shade="rgba(0,0,0,0.18)" shadeH={0.3} />
        ))}
      </Paper>
      {/* flames: warm glow plus a flickering paper teardrop on each candle */}
      {lit ? Array.from({length: candles}).map((_, i) => {
        const cx = cxOf(i);
        const fl = 0.85 + 0.25 * Math.sin(f * 0.9 + i * 1.7);
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: cx - 15, top: -321, width: 30, height: 36, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,120,0.55), rgba(255,214,120,0))', mixBlendMode: 'screen'}} />
            <Slab x={cx - 6} y={-306 - 2 * fl} w={12} h={22 * fl} r={6} color="#F7B23B" style={{clipPath: 'polygon(50% 0, 100% 62%, 78% 100%, 22% 100%, 0 62%)'}}>
              <Slab x={3} y={8 * fl} w={6} h={11 * fl} r={3} color="#FFE9A8" />
            </Slab>
          </React.Fragment>
        );
      }) : null}
    </div>
  );
};

// ---------- sign ----------

// House-shaped enamel plaque, 168 x 140 px at s = 1. (x, y) = its middle; `text` is the word on it (4-5 capitals fit at 40 px), color/colorLo/colorHi the enamel.
export const HomeSign: React.FC<{x: number; y: number; s?: number; text?: string; color?: string; colorLo?: string; colorHi?: string; textColor?: string}> = ({x, y, s = 1, text = 'HOME', color = '#2F6FB0', colorLo = '#245A92', colorHi = '#4D8CCB', textColor = '#F6F1E4'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, scale: String(s), transformOrigin: '0 0'}}>
    <Paper lift={5}>
      <Slab x={-84} y={-70} w={168} h={140} r={6} color="#F2EBDC" shade="#CFC4AE" shadeH={0.12} style={{clipPath: 'polygon(50% 0, 100% 36%, 100% 100%, 0 100%, 0 36%)'}} />
      <Slab x={-74} y={-52} w={148} h={116} r={4} color={color} hi={colorHi} hiH={0.1} shade={colorLo} shadeH={0.14} style={{clipPath: 'polygon(50% 0, 100% 34%, 100% 100%, 0 100%, 0 34%)'}} />
      <div style={{position: 'absolute', left: -74, top: 8, width: 148, textAlign: 'center', fontFamily: FONT.banner, fontSize: 40, color: textColor, letterSpacing: '0.04em'}}>{text}</div>
      <Disc x={-52} y={-2} d={8} color={C.metal} />
      <Disc x={52} y={-2} d={8} color={C.metal} />
    </Paper>
  </div>
);

// ---------- held props ----------

// Clipboard held at a hand: drawn around (0, 0) = the hand, so pass it as a Critter's `holdR`; size = the critter's size, counterRot = minus the arm angle so it stays upright; board/boardLo = the wood.
export const Clipboard: React.FC<{size: number; counterRot?: number; board?: string; boardLo?: string}> = ({size, counterRot = 0, board = '#9A6B3E', boardLo = '#7A5230'}) => {
  const w = size * 0.34, h = size * 0.44;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, rotate: `${counterRot}deg`}}>
      <Paper lift={4}>
        <Slab x={-w * 0.25} y={-h * 0.82} w={w} h={h} r={4} color={board} shade={boardLo} shadeH={0.12} />
        <Slab x={-w * 0.25 + w * 0.09} y={-h * 0.82 + h * 0.13} w={w * 0.82} h={h * 0.78} r={2} color="#F4EFE5">
          {[0.2, 0.38, 0.56, 0.74].map((p, i) => <div key={i} style={{position: 'absolute', left: '12%', top: `${p * 100}%`, width: `${i === 3 ? 38 : 72}%`, height: 5, borderRadius: 3, background: '#B6AE9E'}} />)}
        </Slab>
        <Slab x={-w * 0.25 + w * 0.3} y={-h * 0.82 - h * 0.03} w={w * 0.4} h={h * 0.12} r={3} color={C.metal} shade={C.metalLo} shadeH={0.4} />
      </Paper>
    </div>
  );
};

// Thumbs-up fist held at a hand: drawn around (0, 0) = the hand, so pass it as a Critter's `holdR`; size = about 1.45x the critter's size, counterRot = minus the arm angle keeps the thumb up, show 0-1 pops it in (scale).
export const ThumbsUp: React.FC<{size: number; counterRot?: number; color?: string; shade?: string; show?: number}> = ({size, counterRot = 0, color = C.hero, shade = C.heroLo, show = 1}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, rotate: `${counterRot}deg`, scale: String(show)}}>
    <Paper lift={3}>
      <Slab x={-size * 0.1} y={-size * 0.34} w={size * 0.17} h={size * 0.3} r={size * 0.08} color={color} shade={shade} shadeH={0.2} />
      <Slab x={-size * 0.17} y={-size * 0.13} w={size * 0.3} h={size * 0.26} r={size * 0.08} color={color} shade={shade} shadeH={0.25} />
    </Paper>
  </div>
);
