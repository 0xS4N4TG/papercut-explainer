// Papercut episode: hard-cut sets (src/scenes, one per banner) over the narration.
// Global layers sit outside the <Series>: VO, score, hook title, taped banner, word-tag captions, grain.
// plan.json "hook" (from episode.json via build_vo.py) puts the cover title on screen from frame 0 and holds the banner back until it leaves.
import React from 'react';
import type {Caption} from '@remotion/captions';
import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, staticFile} from 'remotion';
import {CutSeries, type CutSpec} from './lib/paper/transitions';
import {GrainOverlay, PaperDefs} from './lib/paper/kit';
import {HookTitle, type HookTitleProps} from './lib/paper/hook';
import {TapeBanner, WordTagCaptions} from './lib/paper/overlays';
import {PLAN} from './scene';
import {SCENES} from './scenes';
import captionsJson from '../public/vo/captions.json';
import EP from '../episode.json';

const captions = captionsJson as Caption[];
// Duck the music bed under the voice: 0.45 during words, easing back to 1.0 over 0.4 s of silence.
const SPEECH = captions.map((c) => [c.startMs, c.endMs]);
const musicVolume = (f: number) => {
  const ms = (f / 30) * 1000;
  const gap = Math.min(...SPEECH.map(([a, b]) => (ms < a ? a - ms : ms > b ? ms - b : 0)));
  return 0.45 + 0.55 * Math.min(1, Math.max(0, (gap - 150) / 400));
};
const fromOf = (id: string) => PLAN.scenes.find((s) => s.id === id)!;
const HOOK = (PLAN as {hook?: HookTitleProps}).hook;
// Cuts into a scene, from episode.json "cuts": {"S04Name": {"kind": "tearAway"}}. Keyed by the incoming scene; no entry = hard cut.
const CUTS = ((EP as {cuts?: Record<string, CutSpec>}).cuts ?? {});
const bannerFrom = (from: number) => (HOOK ? Math.max(from, HOOK.outAt) : from);

export const PapercutVideo: React.FC = () => {
  const bandAt = (ms: number) => {
    const f = (ms / 1000) * PLAN.fps;
    let band = SCENES[0].band;
    for (const s of SCENES) if (fromOf(s.id).from <= f + 1) band = s.band;
    return band;
  };
  return (
    <AbsoluteFill style={{backgroundColor: '#1a1a1a'}}>
      <PaperDefs />
      <CutSeries scenes={SCENES.map(({id, component}) => ({id, component, durationInFrames: fromOf(id).durationInFrames}))} cuts={CUTS} />
      {SCENES.map(({id, banner}) => {
        const s = fromOf(id), a = bannerFrom(s.from), d = s.from + s.durationInFrames - a;
        return d > 0 ? (
          <Sequence key={id} name={`Banner ${id}`} from={a} durationInFrames={d}>
            <TapeBanner text={banner} seed={id} />
          </Sequence>
        ) : null;
      })}
      {HOOK ? (
        <Sequence name="Hook title" durationInFrames={HOOK.outAt + 1}>
          <HookTitle {...HOOK} />
        </Sequence>
      ) : null}
      <WordTagCaptions captions={captions} bandY={bandAt} />
      <GrainOverlay />
      <Audio src={staticFile('vo/voiceover.wav')} />
      <Audio src={staticFile('audio/music.wav')} volume={(f) => musicVolume(f)} />
      <Audio src={staticFile('audio/fx.wav')} volume={0.9} />
    </AbsoluteFill>
  );
};
