// Screen-space overlays: taped headline banner (boils on twos) and word-pop torn caption tags.
import React, {useEffect, useState} from 'react';
import type {Caption} from '@remotion/captions';
import {fitText} from '@remotion/layout-utils';
import {continueRender, delayRender, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../tokens';
import {fontsLoaded, fontsReady} from '../fonts';
import {Boil, GRAIN} from './kit';

export const TapeBanner: React.FC<{text: string; seed: string}> = ({text, seed}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 14, stiffness: 220, mass: 0.6}});
  // Measure only once the banner font is loaded in this tab (fonts.ts): measuring early caches the fallback width.
  const [ready, setReady] = useState(fontsLoaded());
  useEffect(() => {
    if (ready) return;
    const h = delayRender('TapeBanner: waiting for fonts');
    fontsReady.then(() => { setReady(true); continueRender(h); });
  }, [ready]);
  const size = ready ? Math.min(62, fitText({text, withinWidth: 820, fontFamily: FONT.banner, fontWeight: '400', textTransform: 'uppercase', validateFontIsLoaded: true}).fontSize) : 62;
  return (
    <Boil seed={`b${seed}`}>
      <div style={{position: 'absolute', top: 1920 * 0.14, left: 1080 * 0.06, width: 1080 * 0.88, rotate: `${-1 + (random(seed) - 0.5) * 0.8}deg`, scale: String(0.94 + 0.06 * s)}}>
        <div style={{
          backgroundColor: C.cream, backgroundImage: `url(${GRAIN})`, backgroundSize: '520px', backgroundBlendMode: 'multiply',
          padding: '30px 36px 32px', textAlign: 'center', fontFamily: FONT.banner, fontSize: size, lineHeight: 1.05, color: C.ink,
          letterSpacing: '-0.01em', textTransform: 'uppercase', whiteSpace: 'nowrap',
          filter: 'url(#torn) drop-shadow(2px 6px 8px rgba(0,0,0,0.38))',
        }}>{text}</div>
        {[{left: -34, rotate: '-35deg'}, {right: -34, rotate: '35deg'}].map((p, i) => (
          <div key={i} style={{position: 'absolute', top: -16, width: 124, height: 46, background: C.tape, opacity: 0.8, filter: 'url(#torn)', ...p}} />
        ))}
      </div>
    </Boil>
  );
};

type Page = {words: Caption[]; startMs: number; endMs: number};
export const pageWords = (caps: Caption[], max = 3): Page[] => {
  const pages: Page[] = [];
  let cur: Caption[] = [];
  caps.forEach((w, i) => {
    cur.push(w);
    const next = caps[i + 1];
    const punct = /[.,!?:;…]$/.test(w.text.trim());
    const gap = next ? next.startMs - w.endMs > 250 : true;
    if (cur.length >= max || punct || gap) {
      pages.push({words: cur, startMs: cur[0].startMs, endMs: next ? next.startMs : w.endMs + 400});
      cur = [];
    }
  });
  return pages;
};

export const WordTagCaptions: React.FC<{captions: Caption[]; bandY: (ms: number) => number}> = ({captions, bandY}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const pages = React.useMemo(() => pageWords(captions), [captions]);
  const page = pages.find((p) => ms >= p.startMs - 40 && ms < p.endMs);
  if (!page) return null;
  return (
    <div style={{position: 'absolute', top: 1920 * bandY(page.startMs), left: 60, right: 60, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12}}>
      {page.words.filter((w) => ms >= w.startMs - 40).map((w) => {
        const at = Math.round((w.startMs / 1000) * fps) - 1;
        const s = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 260, mass: 0.5}});
        const key = `${w.startMs}-${w.text}`;
        const word = w.text.trim().replace(/[.,:…]+$/, '');
        return (
          <div key={key} style={{
            backgroundColor: C.tag, backgroundImage: `url(${GRAIN})`, backgroundSize: '420px', backgroundBlendMode: 'multiply',
            color: C.tagText, fontFamily: FONT.caption, fontWeight: 900, fontSize: 70, lineHeight: 1, padding: '12px 20px 18px',
            rotate: `${(random(key) - 0.5) * 10}deg`,
            translate: `0px ${(random(key + 'y') - 0.5) * 12 + (1 - s) * -10 + Math.sin((frame + random(key) * 40) / 9) * 1.2}px`,
            scale: String(0.6 + 0.4 * s),
            filter: 'url(#torn) drop-shadow(2px 5px 6px rgba(0,0,0,0.38))',
          }}>{word}</div>
        );
      })}
    </div>
  );
};
