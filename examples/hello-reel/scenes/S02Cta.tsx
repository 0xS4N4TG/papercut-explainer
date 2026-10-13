// Example scene 2: the comment-keyword CTA template (whip-pans in, a paper phone types the keyword, a DM fans out the deliverable).
import React from 'react';
import {Card} from '../lib/paper/kit';
import {CtaPhoneDM} from '../lib/scenes/CtaPhoneDM';
import {cueOf, durOf} from '../scene';

const ID = 'S02Cta';
export const S02Cta: React.FC = () => {
  const cue = cueOf(ID);
  return (
    <CtaPhoneDM
      dur={durOf(ID)} keyword="PAPER" typeAt={cue('comment')} sendAt={cue('yours')} landAt={cue('yours') + 8} sparkleAt={cue('yours') + 14}
      whip={false} itemW={300} itemH={380} items={[<Card key="kit" x={0} y={0} w={300} h={380} lines={5} seed="kit" />]}
    />
  );
};
