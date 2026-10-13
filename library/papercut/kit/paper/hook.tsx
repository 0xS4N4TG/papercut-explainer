// Hook title: the reel's cover title (torn paper tags) on screen from frame 0, so the muted first frame carries the hook
// and matches the profile-grid cover. It slaps in place over frames 0–10 (frame 0 is already the full title), boils on
// threes, then lifts away over 7 frames ending at `outAt`. PapercutVideo holds the taped banner back until `outAt`.
// Configure in episode.json "hook" (build_vo.py copies it into plan.json with `outAt`). Words in `hot` get the yellow tag.
import React from 'react';
import {Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {C, FONT} from '../tokens';
import {GRAIN} from './kit';

export type TornTitleProps = {lines: string[][]; hot?: string[]; size?: number; seed?: string; jitter?: number};

// One torn paper word tag, the same look as the reel covers.
export const TornTag: React.FC<{word: string; hot: boolean; size: number; seed: string; jitter?: number}> = ({word, hot, size, seed, jitter = 0}) => (
  <div style={{
    backgroundColor: hot ? C.sparkYellow : C.tag, backgroundImage: `url(${GRAIN})`, backgroundSize: '420px', backgroundBlendMode: 'multiply',
    color: hot ? C.ink : C.tagText, fontFamily: FONT.caption, fontWeight: 900, fontSize: size, lineHeight: 1, padding: `${size * 0.16}px ${size * 0.26}px ${size * 0.24}px`,
    rotate: `${(random(seed) - 0.5) * 9 + jitter}deg`, translate: `0px ${(random(seed + 'y') - 0.5) * 14}px`,
    filter: 'url(#torn) drop-shadow(3px 8px 9px rgba(0,0,0,0.42))', whiteSpace: 'nowrap',
  }}>{word}</div>
);

// Lines of torn tags, centred.
export const TornTitle: React.FC<TornTitleProps & {step?: number}> = ({lines, hot = [], size = 112, seed = 'cover', step}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.2}}>
    {lines.map((ln, i) => (
      <div key={i} style={{display: 'flex', gap: size * 0.14, justifyContent: 'center'}}>
        {ln.map((w, j) => {
          const s = `${seed}-${i}-${j}-${w}`;
          return <TornTag key={j} word={w} hot={hot.includes(w)} size={size} seed={s} jitter={step === undefined ? 0 : (random(`${s}-${step}`) - 0.5) * 1.4} />;
        })}
      </div>
    ))}
  </div>
);

export type HookTitleProps = {lines: string[][]; hot?: string[]; outAt: number; top?: number; size?: number};

export const HookTitle: React.FC<HookTitleProps> = ({lines, hot = [], outAt, top = 220, size = 108}) => {
  const f = useCurrentFrame();
  const slap = f < 10 ? Math.sin(f * 1.7) * (1 - f / 10) * 0.045 : 0;
  const out = interpolate(f, [Math.max(1, outAt - 7), Math.max(2, outAt)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.back(1.6))});
  return (
    <div style={{position: 'absolute', top, left: 30, right: 30, transformOrigin: '50% 40%', scale: String(1 + slap),
      translate: `0px ${-out * 640}px`, rotate: `${out * -4}deg`, opacity: 1 - out * 0.4}}>
      <TornTitle lines={lines} hot={hot} size={size} seed="cover" step={Math.floor(f / 3)} />
    </div>
  );
};
