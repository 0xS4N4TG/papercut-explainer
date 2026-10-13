// Stage props: an APPLAUSE sign that can be dark or lit, a paper phone whose comment field takes typed text and
// posts it as a new comment row (scene-driven, unlike the self-timed PhoneComment in ui), a studio phone tripod, and a DM notification bubble.
// All cut paper (Slab / Disc inside Paper).
import React from 'react';
import {random} from 'remotion';
import {C, FONT} from '../tokens';
import {Disc, Paper, Slab} from '../paper/kit';

const PLANE = 'polygon(0 0, 100% 50%, 0 100%, 18% 50%)';

/** Mix a #RRGGBB colour toward black (amt < 0) or white (amt > 0). */
const mixHex = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16), t = amt < 0 ? 0 : 255, k = Math.abs(amt);
  const ch = (v: number) => Math.round(v + (t - v) * k).toString(16).padStart(2, '0');
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
};

/**
 * Marquee sign hung on two straps (bulbs round the edge, red board, cream-gold `text`). `lit` = bulbs and glow on; `chase` 0/1 alternates the bulb brightness;
 * `flicker` 0-1 (default 1) scales the glow and bulb brightness (feed it flickerAt(f) for a failing sign); `color` = the lit board colour (default red), `fontSize` for long text.
 * (x, y) = top-left, `rot` swings it from the straps.
 */
export const ApplauseSign: React.FC<{x: number; y: number; w?: number; h?: number; rot?: number; lit?: boolean; chase?: number; flicker?: number; text?: string; fontSize?: number; color?: string}> =
  ({x, y, w = 380, h = 104, rot = 0, lit = false, chase = 0, flicker = 1, text = 'APPLAUSE', fontSize = 52, color}) => {
    const n = Math.floor(w / 42);
    const bulbs = [
      ...Array.from({length: n}, (_, i) => ({bx: 22 + i * ((w - 44) / (n - 1)), by: 14})),
      ...Array.from({length: n}, (_, i) => ({bx: 22 + i * ((w - 44) / (n - 1)), by: h - 14})),
    ];
    const P = color
      ? {body: lit ? color : mixHex(color, -0.42), shade: lit ? mixHex(color, -0.25) : mixHex(color, -0.58), hi: lit ? mixHex(color, 0.12) : mixHex(color, -0.35), inner: lit ? mixHex(color, -0.12) : mixHex(color, -0.5)}
      : {body: lit ? '#B3261E' : '#7E1F1A', shade: lit ? '#86190F' : '#5E1511', hi: lit ? '#C9382E' : '#8E2A24', inner: lit ? '#9E1F17' : '#6A1A15'};
    return (
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, rotate: `${rot}deg`, transformOrigin: '50% 0'}}>
        <Paper lift={6}>
          <Slab x={w * 0.2 - 5} y={-500} w={10} h={500} color={C.brassLo} r={3} />
          <Slab x={w * 0.8 - 5} y={-500} w={10} h={500} color={C.brassLo} r={3} />
          <Slab x={0} y={0} w={w} h={h} color={P.body} shade={P.shade} shadeH={0.2} r={14} hi={P.hi} hiH={0.1} />
          <Slab x={10} y={10} w={w - 20} h={h - 20} color={P.inner} r={9} />
        </Paper>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: FONT.banner, fontSize, letterSpacing: '0.04em',
          color: lit ? '#FFE9A8' : '#A8806E', textShadow: lit ? `0 0 14px rgba(255,214,90,${0.75 * flicker}), 2px 3px 0 #5E1009` : '2px 3px 0 #3E0C08', opacity: lit ? 0.6 + 0.4 * flicker : 1}}>{text}</div>
        {bulbs.map((b, i) => {
          const dim = lit && chase > 0 && (i + chase) % 2 === 1;
          return (
            <div key={i} style={{position: 'absolute', left: b.bx - 8, top: b.by - 8, width: 16, height: 16, borderRadius: '50%',
              background: lit ? (dim ? '#FFD45A' : '#FFE27A') : '#7A6638', opacity: lit ? 0.45 + 0.55 * flicker : 1,
              boxShadow: lit ? `0 0 ${dim ? 7 : 12}px ${dim ? 2 : 5}px rgba(255,214,90,${(dim ? 0.55 : 0.8) * flicker})` : 'none'}} />
          );
        })}
      </div>
    );
  };

/** Accent-blue send disc with a paper-plane glyph. (x, y) = centre; `press` 0-1 squeezes it. */
export const SendDisc: React.FC<{x: number; y: number; d: number; press?: number}> = ({x, y, d, press = 0}) => {
  const dd = d * (1 - 0.16 * press);
  return (
    <Paper lift={3 - 2 * press}>
      <Disc x={x} y={y} d={dd} color={C.brand} shade={C.brandLo} />
      <Slab x={x - dd * 0.24} y={y - dd * 0.24} w={dd * 0.56} h={dd * 0.48} color="#F6F3EC" r={0} style={{clipPath: PLANE}} />
    </Paper>
  );
};

/** Paper smartphone driven by props (for the self-timed keyboard phone see PhoneComment in ui): a comment thread, and a comment field showing `typed` (with a caret) or a placeholder.
 *  `posted` 0-1 = the typed comment has been sent: it slides in as the top row and the others shift down. `press` 0-1 = send button squeeze.
 *  (x, y) = top-left. */
export const CommentPhone: React.FC<{x: number; y: number; w?: number; h?: number; typed?: string; caret?: boolean; posted?: number; press?: number; rot?: number; postedText?: string}> =
  ({x, y, w = 270, h = 540, typed = '', caret = true, posted = 0, press = 0, rot = 0, postedText = 'GUIDE'}) => {
    const bz = 14;
    const sw = w - bz * 2, sh = h - bz * 2;
    const fieldH = 74, fieldY = sh - fieldH - 26;
    const rowY = (i: number) => 102 + i * 82;
    return (
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, rotate: `${rot}deg`}}>
        <Paper lift={8}>
          <Slab x={0} y={0} w={w} h={h} color="#26232C" shade="#17141C" shadeH={0.04} r={44} hi="#3A3642" hiH={0.03} />
          <Slab x={bz} y={bz} w={sw} h={sh} color="#F1EDE4" r={32} grain={0.3} />
        </Paper>
        <div style={{position: 'absolute', left: bz, top: bz, width: sw, height: sh, overflow: 'hidden', borderRadius: 32}}>
          <div style={{position: 'absolute', left: sw / 2 - 34, top: 10, width: 68, height: 14, borderRadius: 7, background: '#26232C'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 36, textAlign: 'center', fontFamily: FONT.label, fontWeight: 800, fontSize: 24, color: C.ink}}>Comments</div>
          <div style={{position: 'absolute', left: 18, right: 18, top: 74, height: 3, borderRadius: 2, background: '#D8D0C3'}} />
          {/* the thread: the three others shift down one row when ours is posted */}
          <Paper lift={2}>
            {[0, 1, 2].map((i) => {
              const yy = rowY(i) + 82 * posted;
              return (
                <React.Fragment key={i}>
                  <Disc x={38} y={yy + 16} d={40} color={['#C9A04A', '#5D7FA3', '#8C7BA8'][i]} />
                  <Slab x={68} y={yy} w={86 + random(`s10c${i}`) * 60} h={12} r={6} color="#B9B0A2" grain={0} />
                  <Slab x={68} y={yy + 22} w={60 + random(`s10d${i}`) * 70} h={10} r={5} color="#D3CABD" grain={0} />
                </React.Fragment>
              );
            })}
          </Paper>
          {/* our comment: rises from the field into the top row */}
          {posted > 0.01 && (
            <div style={{position: 'absolute', left: 0, top: 0, width: sw, height: sh, opacity: Math.min(1, posted * 2)}}>
              {(() => {
                const yy = fieldY + 8 + (rowY(0) - (fieldY + 8)) * posted;
                return (
                  <>
                    <Paper lift={2}>
                      <Disc x={38} y={yy + 16} d={40} color={C.you} shade={C.youLo} />
                      <Slab x={68} y={yy - 6} w={118} h={44} r={14} color="#FFFFFF" shade="#E3DDD2" shadeH={0.12} />
                    </Paper>
                    <div style={{position: 'absolute', left: 82, top: yy - 6, height: 44, display: 'flex', alignItems: 'center', fontFamily: FONT.mono, fontWeight: 800, fontSize: 26, color: C.ink}}>{postedText}</div>
                  </>
                );
              })()}
            </div>
          )}
          {/* comment field: the typed keyword with a caret, or a placeholder; the send arrow */}
          <Paper lift={3}>
            <Slab x={10} y={fieldY} w={sw - 20} h={fieldH} r={fieldH / 2} color="#FFFFFF" shade="#E3DDD2" shadeH={0.12} />
          </Paper>
          <div style={{position: 'absolute', left: 30, top: fieldY, height: fieldH, display: 'flex', alignItems: 'center', fontFamily: FONT.mono, fontWeight: 800, fontSize: 36, color: C.ink, letterSpacing: '0.02em'}}>
            {typed.length === 0 && <span style={{display: 'inline-block', width: 4, height: 38, background: C.brand, marginRight: 8, opacity: caret ? 1 : 0}} />}
            {typed.length === 0 ? <span style={{fontFamily: FONT.label, fontWeight: 600, fontSize: 24, color: '#A89F90', letterSpacing: 0}}>Comment…</span> : typed}
            {typed.length > 0 && <span style={{display: 'inline-block', width: 4, height: 38, background: C.brand, marginLeft: 4, opacity: caret ? 1 : 0}} />}
          </div>
          <SendDisc x={sw - 10 - fieldH / 2} y={fieldY + fieldH / 2} d={fieldH - 14} press={press} />
        </div>
      </div>
    );
  };

/** Studio phone tripod: a clamp under the phone, a pole and three splayed legs to the floor. (x) = pole centre. */
export const PhoneTripod: React.FC<{x: number; top: number; floor: number}> = ({x, top, floor}) => {
  const legTop = floor - 120;
  return (
    <Paper lift={6}>
      <Slab x={x - 6} y={legTop} w={12} h={132} color="#2A2630" r={4} rot={28} style={{transformOrigin: '50% 0'}} />
      <Slab x={x - 6} y={legTop} w={12} h={132} color="#2A2630" r={4} rot={-28} style={{transformOrigin: '50% 0'}} />
      <Slab x={x - 5} y={legTop} w={10} h={116} color="#1E1B23" r={4} />
      <Slab x={x - 9} y={top} w={18} h={legTop - top + 8} color="#34303C" shade="#22202A" shadeH={0.1} r={5} />
      <Slab x={x - 22} y={legTop - 10} w={44} h={22} color={C.brassLo} r={6} />
      <Slab x={x - 46} y={top - 14} w={92} h={26} color="#34303C" shade="#22202A" shadeH={0.3} r={8} />
    </Paper>
  );
};

/** DM notification bubble: accent disc with a send glyph, "New message" and the line `text`. (x, y) = top-left; `dot` scales the unread dot. */
export const DmBubble: React.FC<{x: number; y: number; w?: number; h?: number; text: string; rot?: number; dot?: number}> = ({x, y, w = 340, h = 96, text, rot = 0, dot = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, rotate: `${rot}deg`}}>
    <Paper lift={7}>
      <Slab x={0} y={0} w={w} h={h} color={C.creamHi} shade={C.creamLo} shadeH={0.08} r={26} />
      <Slab x={46} y={h - 4} w={34} h={26} color={C.creamHi} r={0} style={{clipPath: 'polygon(0 0, 100% 0, 10% 100%)'}} />
    </Paper>
    <SendDisc x={50} y={h / 2} d={60} />
    <Paper lift={2}><Disc x={74} y={22} d={20 * dot} color={C.nogo} /></Paper>
    <div style={{position: 'absolute', left: 96, top: 12, fontFamily: FONT.label, fontWeight: 700, fontSize: 24, color: '#7A7163', letterSpacing: '0.02em'}}>New message</div>
    <div style={{position: 'absolute', left: 96, top: 38, fontFamily: FONT.label, fontWeight: 800, fontSize: 34, lineHeight: '44px', color: C.ink, whiteSpace: 'nowrap'}}>{text}</div>
  </div>
);
