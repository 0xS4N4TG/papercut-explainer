// Code-hosting and data-leak props: paper screenshot cards, a public/private visibility pill, a repo page
// with a file list, and a pull-request card with an image attachment slot.
// Rough papercut rebuilds of generic code-hosting UI: no logos, plain text names only.
import React from 'react';
import {interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../tokens';
import {Paper, Slab} from '../paper/kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const INK_BLUE = '#1F4FB0', CARD = '#F1EDE4';

// ---------- visibility pill ----------
// "Public" (globe, amber-red when `alarm`) or "Private" (padlock, green). (x, y) = top-left. size = font px.
export const VisPill: React.FC<{x: number; y: number; vis: 'public' | 'private'; size?: number; alarm?: boolean; rot?: number}> = ({x, y, vis, size = 30, alarm = false, rot = 0}) => {
  const pub = vis === 'public';
  const col = pub ? (alarm ? C.nogo : '#6E6A64') : C.go;
  const g = size * 1.05;
  return (
    <div style={{position: 'absolute', left: x, top: y, rotate: `${rot}deg`, display: 'flex', alignItems: 'center', gap: size * 0.3,
      padding: `${size * 0.18}px ${size * 0.5}px ${size * 0.2}px ${size * 0.38}px`, borderRadius: size, border: `${Math.max(2, size * 0.1)}px solid ${col}`,
      background: pub && alarm ? '#F6D9D2' : CARD, fontFamily: FONT.label, fontWeight: 800, fontSize: size, color: col, whiteSpace: 'nowrap'}}>
      {pub ? (
        <svg width={g} height={g} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="none" stroke={col} strokeWidth="2.4" />
          <ellipse cx="12" cy="12" rx="4.2" ry="9.5" fill="none" stroke={col} strokeWidth="2" /><path d="M3 12h18M5 7h14M5 17h14" stroke={col} strokeWidth="1.8" /></svg>
      ) : (
        <svg width={g} height={g} viewBox="0 0 24 24"><rect x="4.5" y="10.5" width="15" height="11" rx="2" fill={col} /><path d="M8 10.5V7.5a4 4 0 018 0v3" fill="none" stroke={col} strokeWidth="2.6" /></svg>
      )}
      {pub ? 'Public' : 'Private'}
    </div>
  );
};

// ---------- screenshot card ----------
// A paper screenshot (window chrome + simplified content). (x, y) = top-left, w = width (height = 0.68 w).
// kind picks the content; redact draws black bars over the sensitive bits; tape adds two tape corners; label = file name strip.
export type ShotKind = 'dashboard' | 'billing' | 'design' | 'chat' | 'code';
export const Screenshot: React.FC<{x: number; y: number; w?: number; kind: ShotKind; rot?: number; tape?: boolean; label?: string; redact?: boolean; seed?: string; lift?: number}> = ({x, y, w = 300, kind, rot = 0, tape = false, label, redact = false, seed = 'shot', lift = 5}) => {
  const h = Math.round(w * 0.68), u = w / 300, bar = 22 * u;
  const r = (k: string) => random(`${seed}-${k}`);
  const block = (l: number, t: number, ww: number, hh: number, bg: string, key: string, br = 4) => (
    <div key={key} style={{position: 'absolute', left: l * u, top: t * u, width: ww * u, height: hh * u, background: bg, borderRadius: br * u}} />
  );
  const content: React.ReactNode[] = [];
  if (kind === 'dashboard') {
    content.push(block(14, 14, 120, 54, '#2E3A52', 'k1', 6), block(144, 14, 140, 54, '#2E3A52', 'k2', 6));
    [0.55, 0.8, 0.4, 0.95, 0.7, 0.6, 0.85].forEach((v, i) => content.push(block(20 + i * 38, 170 - v * 80, 24, v * 80, i === 3 ? C.amber : '#5D7FA3', `b${i}`, 3)));
  } else if (kind === 'billing') {
    content.push(block(14, 12, 140, 16, '#3E4347', 'title', 3));
    for (let i = 0; i < 5; i++) {
      content.push(block(14, 40 + i * 26, 150, 12, '#4A5058', `r${i}`, 3));
      content.push(block(220, 38 + i * 26, 64, 16, redact ? '#111' : '#2DA34D', `v${i}`, 3));
    }
  } else if (kind === 'design') {
    content.push(block(14, 12, 272, 70, '#C9573C', 'hero', 6), block(14, 92, 84, 84, '#8C7BA8', 'c1', 6), block(108, 92, 84, 84, '#5D7FA3', 'c2', 6), block(202, 92, 84, 84, '#C9A04A', 'c3', 6));
    content.push(<div key="tag" style={{position: 'absolute', left: 24 * u, top: 30 * u, fontFamily: FONT.label, fontWeight: 900, fontSize: 18 * u, color: C.tagText}}>UNRELEASED</div>);
  } else if (kind === 'chat') {
    [0, 1, 2, 3].forEach((i) => content.push(block(i % 2 ? 110 : 14, 14 + i * 40, 176, 30, i % 2 ? '#5D7FA3' : '#3E4347', `m${i}`, 14)));
  } else {
    for (let i = 0; i < 7; i++) content.push(block(14 + (i % 3) * 16, 14 + i * 22, 90 + r(`c${i}`) * 170, 11, ['#C678DD', '#61AFEF', '#98C379', '#E5C07B'][i % 4], `l${i}`, 3));
  }
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h + (label ? 34 * u : 0), rotate: `${rot}deg`}}>
      <Paper lift={lift}>
        <Slab x={0} y={0} w={w} h={h + (label ? 34 * u : 0)} color={CARD} r={8 * u} shade={C.creamLo} shadeH={0.04}>
          <div style={{position: 'absolute', left: 8 * u, top: 8 * u, width: w - 16 * u, height: h - 16 * u, background: C.screen, borderRadius: 6 * u, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: bar, background: C.screenHi}}>
              {['#E5534B', '#E6A23C', '#4CAF6A'].map((c, i) => <div key={c} style={{position: 'absolute', left: (10 + i * 15) * u, top: 7 * u, width: 9 * u, height: 9 * u, borderRadius: '50%', background: c}} />)}
            </div>
            <div style={{position: 'absolute', left: 0, top: bar, right: 0, bottom: 0}}>{content}</div>
          </div>
          {label ? <div style={{position: 'absolute', left: 12 * u, bottom: 6 * u, fontFamily: FONT.mono, fontWeight: 700, fontSize: Math.max(16, 19 * u), color: C.inkSoft, whiteSpace: 'nowrap'}}>{label}</div> : null}
        </Slab>
      </Paper>
      {tape ? [{left: -18 * u, top: -10 * u, rotate: '-32deg'}, {right: -18 * u, top: -10 * u, rotate: '32deg'}].map((p, i) => (
        <div key={i} style={{position: 'absolute', width: 74 * u, height: 26 * u, background: C.tape, opacity: 0.85, filter: 'url(#torn)', ...p}} />
      )) : null}
    </div>
  );
};

// ---------- repo page ----------
// A code-hosting repo page: owner / repo, a visibility pill, and a file list whose rows pop in one by one from filesAt.
// (x, y) = top-left. The image files get a small picture glyph. alarm turns the Public pill red.
export const RepoPage: React.FC<{x: number; y: number; w?: number; owner: string; repo: string; vis: 'public' | 'private'; files: string[]; filesAt?: number; every?: number; alarm?: boolean; rot?: number; rows?: number}> = ({x, y, w = 760, owner, repo, vis, files, filesAt = 0, every = 3, alarm = false, rot = -1, rows = 6}) => {
  const f = useCurrentFrame();
  const shown = files.slice(0, rows);
  const h = 150 + rows * 62 + 30 + (files.length > rows ? 44 : 0);   // room for the "+ N more" line
  return (
    <Paper lift={7}>
      <Slab x={x} y={y} w={w} h={h} color={CARD} shade={C.creamLo} shadeH={0.03} r={14} rot={rot}>
        <div style={{position: 'absolute', left: 36, top: 34, right: 36, display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONT.label, fontWeight: 800, fontSize: 38, color: '#2B5CC4', whiteSpace: 'nowrap'}}>
          <svg width={38} height={38} viewBox="0 0 16 16"><rect x="3" y="1.8" width="10" height="12.4" rx="1.3" fill="none" stroke="#6E6A64" strokeWidth="1.5" /><path d="M3 11h10M6 5h4" fill="none" stroke="#6E6A64" strokeWidth="1.5" /></svg>
          <span>{owner} / <span style={{color: INK_BLUE}}>{repo}</span></span>
        </div>
        <VisPill x={w - 36 - 190} y={96} vis={vis} size={30} alarm={alarm} />
        <div style={{position: 'absolute', left: 30, right: 30, top: 160, borderTop: '3px solid #D9D2C4'}}>
          {shown.map((name, i) => {
            const at = filesAt + i * every;
            const s = interpolate(f, [at, at + 5], [0, 1], clamp);
            const img = /\.(png|jpe?g|gif|webp)$/i.test(name);
            return (
              <div key={name} style={{height: 62, display: 'flex', alignItems: 'center', gap: 16, borderBottom: '2px solid #E3DDD1', opacity: s, translate: `${(1 - s) * 30}px 0`,
                fontFamily: FONT.mono, fontWeight: 700, fontSize: 28, color: C.inkSoft, whiteSpace: 'nowrap'}}>
                {img ? (
                  <svg width={32} height={32} viewBox="0 0 24 24"><rect x="2.5" y="4" width="19" height="16" rx="2" fill="none" stroke="#6E6A64" strokeWidth="2" /><circle cx="8.5" cy="9.5" r="2" fill="#6E6A64" /><path d="M4 18l5-5 4 4 3-3 4 4" fill="none" stroke="#6E6A64" strokeWidth="2" /></svg>
                ) : (
                  <svg width={32} height={32} viewBox="0 0 24 24"><path d="M6 2.5h8l4 4V21.5H6z" fill="none" stroke="#6E6A64" strokeWidth="2" /></svg>
                )}
                {name}
              </div>
            );
          })}
          {files.length > rows && f >= filesAt + rows * every + 3 ? <div style={{marginTop: 8, fontFamily: FONT.label, fontWeight: 800, fontSize: 26, color: '#8A8274'}}>+ {files.length - rows} more</div> : null}
        </div>
      </Slab>
    </Paper>
  );
};

// ---------- pull request card ----------
// A PR page: an Open pill, title, #number, and a description box. `attach` = what sits in the image slot:
// 'none' (empty), 'dashed' (a dashed "drop image here" box that shakes from shakeAt, i.e. the agent can't attach),
// or 'image' (children drawn inside the slot, e.g. a <Screenshot/> or a link chip). (x, y) = top-left.
export const PRCard: React.FC<{x: number; y: number; w?: number; title: string; num: number; attach?: 'none' | 'dashed' | 'image'; shakeAt?: number; rot?: number; children?: React.ReactNode}> = ({x, y, w = 800, title, num, attach = 'dashed', shakeAt, rot = 1, children}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shake = shakeAt != null && f >= shakeAt ? Math.sin((f - shakeAt) * 2.2) * 8 * Math.max(0, 1 - (f - shakeAt) / 14) : 0;
  const pop = shakeAt != null ? spring({frame: f - shakeAt, fps, config: {damping: 12}}) : 0;
  const h = 560;
  return (
    <Paper lift={7}>
      <Slab x={x} y={y} w={w} h={h} color={CARD} shade={C.creamLo} shadeH={0.03} r={14} rot={rot}>
        <div style={{position: 'absolute', left: 36, top: 34, display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{padding: '8px 22px 10px', borderRadius: 30, background: C.go, color: '#fff', fontFamily: FONT.label, fontWeight: 800, fontSize: 28}}>Open</div>
          <div style={{fontFamily: FONT.label, fontWeight: 800, fontSize: 30, color: '#8A8274'}}>Pull request #{num}</div>
        </div>
        <div style={{position: 'absolute', left: 36, right: 36, top: 100, fontFamily: FONT.label, fontWeight: 900, fontSize: 40, lineHeight: 1.15, color: C.ink}}>{title}</div>
        <div style={{position: 'absolute', left: 36, right: 36, top: 200, height: 320, borderRadius: 12, background: '#E9E3D7', border: '3px solid #D9D2C4'}}>
          {[0, 1].map((i) => <div key={i} style={{position: 'absolute', left: 24, top: 24 + i * 30, width: Math.max(80, w - 72 - 48) * (i ? 0.62 : 0.94), height: 14, borderRadius: 4, background: '#CFC8BA'}} />)}
          {attach === 'dashed' ? (
            <div style={{position: 'absolute', left: 24, right: 24, top: 96, bottom: 24, borderRadius: 10, border: `4px dashed ${shakeAt != null && f >= shakeAt ? C.nogo : '#B5AD9E'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', translate: `${shake}px 0`, fontFamily: FONT.label, fontWeight: 800, fontSize: 30, color: shakeAt != null && f >= shakeAt ? C.nogo : '#8A8274'}}>
              <span style={{scale: String(1 + 0.08 * pop)}}>{shakeAt != null && f >= shakeAt ? "can't attach image" : 'drop an image here'}</span>
            </div>
          ) : attach === 'image' ? (
            <div style={{position: 'absolute', left: 24, right: 24, top: 96, bottom: 24}}>{children}</div>
          ) : null}
        </div>
      </Slab>
    </Paper>
  );
};

// ---------- paper camera ----------
// A small paper camera (body, lens, flash window). (x, y) = centre, s = width. flashAt fires a soft white flash
// (radial glow is allowed for light sources) that fades over ~6 frames.
export const PaperCamera: React.FC<{x: number; y: number; s?: number; rot?: number; flashAt?: number}> = ({x, y, s = 120, rot = 0, flashAt}) => {
  const f = useCurrentFrame();
  const u = s / 120, h = 78 * u;
  const fl = flashAt == null ? 0 : interpolate(f, [flashAt, flashAt + 1, flashAt + 7], [0, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: x - s / 2, top: y - h / 2, width: s, height: h, rotate: `${rot}deg`}}>
      <Paper lift={4}>
        <Slab x={18 * u} y={-12 * u} w={34 * u} h={16 * u} color="#3E4347" r={3 * u} />
        <Slab x={0} y={0} w={s} h={h} color="#2E3235" shade="#202326" shadeH={0.25} hi="#4A5056" hiH={0.12} r={10 * u} />
        <Slab x={s - 34 * u} y={10 * u} w={22 * u} h={14 * u} color={fl > 0.2 ? '#FFFFFF' : '#CFC8BA'} r={3 * u} />
        <div style={{position: 'absolute', left: s / 2 - 27 * u, top: h / 2 - 25 * u, width: 54 * u, height: 54 * u, borderRadius: '50%', background: '#B1B9BC', boxShadow: `inset 0 -${5 * u}px 0 #8C9598`}}>
          <div style={{position: 'absolute', left: 10 * u, top: 10 * u, width: 34 * u, height: 34 * u, borderRadius: '50%', background: '#1B1726'}} />
          <div style={{position: 'absolute', left: 16 * u, top: 15 * u, width: 9 * u, height: 9 * u, borderRadius: '50%', background: '#8E86A0'}} />
        </div>
      </Paper>
      {fl > 0 ? <div style={{position: 'absolute', left: s - 23 * u - 160 * u, top: 17 * u - 160 * u, width: 320 * u, height: 320 * u, borderRadius: '50%', opacity: fl,
        background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,250,235,0.5) 30%, rgba(255,250,235,0) 70%)', pointerEvents: 'none'}} /> : null}
    </div>
  );
};
