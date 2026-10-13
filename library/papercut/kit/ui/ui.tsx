// Rough papercut rebuilds of real UI: paper bezels around a near-black app
// panel, few big elements, one accent colour, fake interactions (typing, cursor clicks, counters).
import React from 'react';
import {Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../tokens';
import {Disc, Paper, Slab, Typewriter} from '../paper/kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- frames ----------
// Desktop monitor: dark bezel → screen panel → content → reflection sliver; stand below.
export const Monitor: React.FC<{x: number; y: number; w: number; h: number; stand?: boolean; screen?: string; children?: React.ReactNode}> = ({x, y, w, h, stand = true, screen = C.screen, children}) => (
  <Paper lift={6}>
    {stand ? (
      <>
        <Slab x={x + w / 2 - 34} y={y + h - 10} w={68} h={110} color="#3A3A40" shade="#28282C" shadeH={0.3} r={4} />
        <Slab x={x + w / 2 - 150} y={y + h + 92} w={300} h={30} color="#3A3A40" shade="#28282C" shadeH={0.4} r={10} />
      </>
    ) : null}
    <Slab x={x} y={y} w={w} h={h} color="#2B2B30" shade="#1E1E22" shadeH={0.06} r={22} />
    <Slab x={x + 22} y={y + 22} w={w - 44} h={h - 58} color={screen} r={10} grain={0.3}>
      {children}
      <div style={{position: 'absolute', left: '62%', top: -40, width: 46, height: h * 1.4, background: 'rgba(255,255,255,0.06)', rotate: '24deg'}} />
    </Slab>
    <Disc x={x + w / 2} y={y + h - 18} d={10} color="#55555C" />
  </Paper>
);

// Laptop: screen lid + keyboard deck seen front-on.
export const Laptop: React.FC<{x: number; y: number; w: number; h: number; children?: React.ReactNode}> = ({x, y, w, h, children}) => (
  <Paper lift={6}>
    <Slab x={x} y={y} w={w} h={h} color="#2B2B30" r={18} />
    <Slab x={x + 18} y={y + 18} w={w - 36} h={h - 36} color={C.screen} r={8} grain={0.3}>{children}</Slab>
    <Slab x={x - 50} y={y + h - 4} w={w + 100} h={34} color={C.metal} shade={C.metalLo} shadeH={0.4} r="4px 4px 16px 16px" />
    <Slab x={x + w / 2 - 70} y={y + h - 4} w={140} h={12} color={C.metalLo} r="0 0 8px 8px" />
  </Paper>
);

// App window chrome (inside a Monitor/Laptop or free-standing): title bar with three dots + title.
export const AppWindow: React.FC<{w: number; h: number; title: string; children?: React.ReactNode; bg?: string}> = ({w, h, title, children, bg = C.screen}) => (
  <div style={{position: 'absolute', inset: 0, width: w, height: h, background: bg}}>
    <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 52, background: C.screenHi}}>
      {['#E5534B', '#E6A23C', '#4CAF6A'].map((c, i) => <div key={c} style={{position: 'absolute', left: 20 + i * 30, top: 17, width: 18, height: 18, borderRadius: '50%', background: c}} />)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 11, textAlign: 'center', color: C.screenDim, fontFamily: FONT.label, fontWeight: 800, fontSize: 24}}>{title}</div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 52, bottom: 0}}>{children}</div>
  </div>
);

// ---------- terminal session ----------
// Lines appear at their frame; 'you' lines type in (2 frames per character), others pop in whole.
export type TermLine = {at: number; text: string; kind?: 'you' | 'out' | 'ok' | 'dim' | 'warn'};
export const Terminal: React.FC<{w: number; h: number; lines: TermLine[]; title?: string; size?: number; fpc?: number}> = ({w, h, lines, title = 'terminal', size = 30, fpc = 1.5}) => {
  const f = useCurrentFrame();
  const col = {you: C.screenText, out: C.screenText, ok: '#7BD88F', dim: C.screenDim, warn: C.amber};
  return (
    <AppWindow w={w} h={h} title={title}>
      <div style={{position: 'absolute', left: 28, right: 24, top: 24, fontFamily: FONT.mono, fontSize: size, lineHeight: 1.35}}>
        {lines.filter((l) => f >= l.at).map((l, i) => (
          <div key={i} style={{color: col[l.kind ?? 'out'], marginBottom: size * 0.35, display: 'flex', gap: size * 0.4}}>
            {l.kind === 'you' ? <span style={{color: C.hero}}>&gt;</span> : l.kind === 'ok' ? <span>✓</span> : <span style={{color: C.screenDim}}>•</span>}
            <span style={{whiteSpace: 'pre-wrap'}}>{l.kind === 'you' ? <Typewriter text={l.text} at={l.at} fpc={fpc} /> : l.text}</span>
          </div>
        ))}
      </div>
    </AppWindow>
  );
};

// ---------- numbers as props ----------
export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
// Count from `from` to `to` between frames [at, at+dur] (ease-out), formatted with commas.
export const useCount = (at: number, dur: number, to: number, from = 0) => {
  const f = useCurrentFrame();
  return interpolate(f, [at, at + dur], [from, to], {...clamp, easing: Easing.out(Easing.cubic)});
};
export const CountUp: React.FC<{at: number; dur: number; to: number; from?: number; prefix?: string; suffix?: string}> = ({at, dur, to, from = 0, prefix = '', suffix = ''}) => (
  <span style={{fontVariantNumeric: 'tabular-nums'}}>{prefix}{fmt(useCount(at, dur, to, from))}{suffix}</span>
);

// ---------- repo card (paper card pinned in the set) ----------
const STAR = 'M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z';
// Repo card pinned in the set: at frame `starsAt` the Star button is pressed and its count runs from `starsFrom` (default 0) up to `stars`; forks count up beside it.
export const RepoCard: React.FC<{x: number; y: number; w?: number; owner: string; repo: string; desc: string; starsAt: number; stars: number; starsFrom?: number; forks?: number; starDur?: number; rot?: number}> = ({x, y, w = 820, owner, repo, desc, starsAt, stars, starsFrom = 0, forks, starDur = 36, rot = -1.5}) => {
  const f = useCurrentFrame();
  const pressed = f >= starsAt && f < starsAt + 4;
  return (
    <Paper lift={7}>
      <Slab x={x} y={y} w={w} h={430} color="#F1EDE4" shade={C.creamLo} shadeH={0.03} r={14} rot={rot}>
        <div style={{position: 'absolute', left: 44, top: 40, right: 40}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT.label, fontWeight: 800, fontSize: 40, color: '#2B5CC4'}}>
            <svg width={40} height={40} viewBox="0 0 16 16"><rect x="3" y="1.8" width="10" height="12.4" rx="1.3" fill="none" stroke="#6E6A64" strokeWidth="1.5" /><path d="M3 11h10M6 5h4" fill="none" stroke="#6E6A64" strokeWidth="1.5" /></svg>
            <span>{owner} / <span style={{color: '#1F4FB0'}}>{repo}</span></span>
          </div>
          <div style={{marginTop: 26, fontFamily: FONT.label, fontWeight: 800, fontSize: 34, lineHeight: 1.25, color: C.inkSoft}}>{desc}</div>
          <div style={{marginTop: 34, display: 'flex', gap: 22, alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderRadius: 12, background: pressed ? '#E3DED3' : '#EAE5DB', border: '3px solid #CFC8BA', fontFamily: FONT.label, fontWeight: 800, fontSize: 34, color: C.ink, scale: pressed ? '0.95' : '1'}}>
              <svg width={34} height={34} viewBox="0 0 24 24"><path d={STAR} fill={f >= starsAt ? '#E3B341' : 'none'} stroke="#8A8274" strokeWidth={2} /></svg>
              Star <span style={{marginLeft: 6, padding: '2px 14px', borderRadius: 20, background: '#D9D2C4'}}><CountUp at={starsAt} dur={starDur} to={stars} from={starsFrom} /></span>
            </div>
            {forks ? <div style={{fontFamily: FONT.label, fontWeight: 800, fontSize: 30, color: '#6E6A64'}}>⑂ <CountUp at={starsAt + 8} dur={starDur} to={forks} /> forks</div> : null}
          </div>
        </div>
      </Slab>
    </Paper>
  );
};

// ---------- pointer ----------
// A mouse pointer that glides between keyframes; a click (k.click) squashes it and drops a ripple ring.
export type PointerKey = {f: number; x: number; y: number; click?: boolean};
export const Pointer: React.FC<{keys: PointerKey[]; size?: number}> = ({keys, size = 64}) => {
  const f = useCurrentFrame();
  if (f < keys[0].f) return null;
  const xs = keys.map((k) => k.x), ys = keys.map((k) => k.y), fs = keys.map((k) => k.f);
  const opt = {...clamp, easing: Easing.inOut(Easing.cubic)};
  const x = keys.length > 1 ? interpolate(f, fs, xs, opt) : xs[0];
  const y = keys.length > 1 ? interpolate(f, fs, ys, opt) : ys[0];
  const click = keys.find((k) => k.click && f >= k.f && f < k.f + 14);
  const dt = click ? f - click.f : 99;
  return (
    <>
      {click ? <div style={{position: 'absolute', left: click.x - 10 - dt * 4, top: click.y - 10 - dt * 4, width: 20 + dt * 8, height: 20 + dt * 8, borderRadius: '50%', border: `5px solid ${C.sparkYellow}`, opacity: 1 - dt / 14}} /> : null}
      <svg width={size} height={size} viewBox="0 0 24 24" style={{position: 'absolute', left: x, top: y, scale: dt < 4 ? '0.85' : '1', transformOrigin: '0 0', filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.4))'}}>
        <path d="M3 2l7.5 19 2.6-7.4L21 11z" fill="#F7F3EC" stroke={C.ink} strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </>
  );
};

// ---------- small UI pieces ----------
// Primary button in the accent colour; `pressAt` dips it.
export const Button: React.FC<{x: number; y: number; w: number; h?: number; text: string; color?: string; pressAt?: number; size?: number}> = ({x, y, w, h = 84, text, color = C.brand, pressAt, size = 34}) => {
  const f = useCurrentFrame();
  const down = pressAt !== undefined && f >= pressAt && f < pressAt + 5;
  return (
    <div style={{position: 'absolute', left: x, top: y + (down ? 4 : 0), width: w, height: h, borderRadius: 16, background: color, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: FONT.label, fontWeight: 800, fontSize: size, boxShadow: down ? 'none' : `0 5px 0 rgba(0,0,0,0.35)`}}>{text}</div>
  );
};

// Progress bar that fills between [at, at+dur].
export const Progress: React.FC<{x: number; y: number; w: number; at: number; dur: number; color?: string; to?: number}> = ({x, y, w, at, dur, color = C.brand, to = 1}) => {
  const p = useCount(at, dur, to);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: 26, borderRadius: 13, background: '#3A3348'}}>
      <div style={{width: `${p * 100}%`, height: '100%', borderRadius: 13, background: color}} />
    </div>
  );
};

// A tool card for "works in 17 tools": cream card with a coloured glyph block and the tool's name (no logos).
export const ToolCard: React.FC<{x: number; y: number; name: string; color: string; glyph?: string; w?: number; rot?: number}> = ({x, y, name, color, glyph, w = 280, rot = 0}) => (
  <Paper lift={6}>
    <Slab x={x} y={y} w={w} h={150} color={C.creamHi} shade={C.creamLo} shadeH={0.05} r={14} rot={rot}>
      <Slab x={22} y={33} w={84} h={84} color={color} r={18}>
        <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: FONT.banner, fontSize: 44}}>{glyph ?? name[0]}</div>
      </Slab>
      <div style={{position: 'absolute', left: 124, right: 10, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontFamily: FONT.label, fontWeight: 800, fontSize: Math.min(40, (w - 140) / (name.length * 0.62)), color: C.ink}}>{name}</div>
    </Slab>
  </Paper>
);

// ---------- phone CTA: comments sheet + keyboard that types the keyword ----------
const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
export const PhoneComment: React.FC<{x: number; y: number; keyword: string; typeAt: number; fpc?: number; postAt?: number; scale?: number}> = ({x, y, keyword, typeAt, fpc = 5, postAt, scale = 1}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = Math.max(0, Math.min(keyword.length, Math.floor((f - typeAt) / fpc) + 1));
  const typed = f >= typeAt ? keyword.slice(0, n) : '';
  // the key lights only while typing (it used to keep flashing the last key forever after the word was done)
  const lit = f >= typeAt && f - typeAt < keyword.length * fpc && (f - typeAt) % fpc < 3 ? keyword[n - 1] : '';
  const posted = postAt !== undefined && f >= postAt;
  const pop = posted ? spring({frame: f - postAt!, fps, config: {damping: 12, stiffness: 200}}) : 0;
  const W = 520, H = 1000;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: W, height: H, scale: String(scale), transformOrigin: '0 0'}}>
      <Paper lift={8}>
        <Slab x={0} y={0} w={W} h={H} color="#26232C" r={64} />
        <Slab x={18} y={18} w={W - 36} h={H - 36} color="#F1EDE4" r={50} grain={0.3}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: FONT.label, fontWeight: 800, fontSize: 30, color: C.ink}}>Comments</div>
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              <Disc x={60} y={130 + i * 92} d={52} color={['#C9A04A', '#5D7FA3', '#8C7BA8'][i]} />
              <div style={{position: 'absolute', left: 100, top: 114 + i * 92, width: 180 + random(`c${i}`) * 140, height: 14, borderRadius: 7, background: '#B9B0A2'}} />
              <div style={{position: 'absolute', left: 100, top: 138 + i * 92, width: 120 + random(`d${i}`) * 120, height: 12, borderRadius: 6, background: '#D3CABD'}} />
            </React.Fragment>
          ))}
          {posted ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 400, scale: String(pop), transformOrigin: '20% 50%'}}>
              <Disc x={60} y={20} d={52} color={C.cap} />
              <div style={{position: 'absolute', left: 100, top: 0, fontFamily: FONT.label, fontWeight: 800, fontSize: 34, color: C.ink}}>{keyword}</div>
            </div>
          ) : null}
          {/* input row */}
          <div style={{position: 'absolute', left: 24, right: 24, top: 510, height: 76, borderRadius: 38, background: '#E3DDD2', border: '3px solid #CFC8BA'}}>
            <div style={{position: 'absolute', left: 30, right: 128, top: typed && !posted ? 14 : 19, overflow: 'hidden', whiteSpace: 'nowrap', fontFamily: FONT.label, fontWeight: 800, fontSize: typed && !posted ? 38 : 30, color: typed && !posted ? C.ink : '#9B9184'}}>
              {posted ? 'Add a comment…' : typed || 'Add a comment…'}{typed && !posted && Math.floor(f / 8) % 2 === 0 ? '|' : ''}
            </div>
            <div style={{position: 'absolute', right: 10, top: 9, padding: '10px 22px', borderRadius: 26, background: typed.length === keyword.length && !posted ? C.brand : '#B9B0A2', color: '#fff', fontFamily: FONT.label, fontWeight: 800, fontSize: 26, scale: postAt !== undefined && f >= postAt - 3 && f < postAt + 1 ? '0.9' : '1'}}>Post</div>
          </div>
          {/* keyboard */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 620, bottom: 0, background: '#D6CFC3'}}>
            {ROWS.map((row, r) => (
              <div key={r} style={{display: 'flex', justifyContent: 'center', gap: 6, marginTop: r ? 10 : 18}}>
                {row.split('').map((k) => (
                  <div key={k} style={{width: 40, height: 58, borderRadius: 8, display: 'grid', placeItems: 'center', fontFamily: FONT.label, fontWeight: 800, fontSize: 28, background: k === lit ? C.brand : '#F4F0E8', color: k === lit ? '#fff' : C.ink, scale: k === lit ? '1.18' : '1', boxShadow: '0 2px 0 rgba(0,0,0,0.25)'}}>{k}</div>
                ))}
              </div>
            ))}
          </div>
        </Slab>
      </Paper>
    </div>
  );
};
