// Example scene 1: a backdrop, a critter on the floor line, a few paper props, a parallax orbit and one cue-timed pop.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../lib/tokens';
import {Backdrop, BACKDROPS} from '../lib/paper/backdrops';
import {OrbitCamera, Depth} from '../lib/paper/camera';
import {Paper, PopIn, Slab, Pill} from '../lib/paper/kit';
import {Critter} from '../lib/cast/Critter';
import {cueOf, durOf} from '../scene';

const ID = 'S01Hello';
export const S01Hello: React.FC = () => {
  const cue = cueOf(ID);
  const f = useCurrentFrame();
  const floor = BACKDROPS['home-office-day'].floorY;
  return (
    <AbsoluteFill>
      <OrbitCamera dur={durOf(ID)} yaw={14} push={1.12} origin={[540, floor]}>
        <Depth z={0}><Backdrop name="home-office-day" /></Depth>
        <Depth z={0.5}>
          <PopIn at={cue('cut')}>
            <Paper><Slab x={610} y={floor - 230} w={300} h={230} color={C.wood} shade={C.woodLo} shadeH={0.22} hi={C.woodHi} hiH={0.1} r={6} /></Paper>
          </PopIn>
          <Critter x={400} y={floor} size={300} color={C.hero} shade={C.heroLo} expr={f > cue('paper') ? 'happy' : 'idle'} acc="cap" />
        </Depth>
        <Depth z={1}>
          <PopIn at={cue('camera')}><Pill x={540} y={floor - 420} text="PARALLAX" bg={C.tag} color={C.tagText} size={46} rot={-4} center /></PopIn>
        </Depth>
      </OrbitCamera>
    </AbsoluteFill>
  );
};
