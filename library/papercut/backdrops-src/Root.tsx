import '../index.css';
import React from 'react';
import {Composition} from 'remotion';
import {PaperDefs} from '../lib/paper/kit';
import {Courtroom} from './Courtroom';
import {BankVault} from './BankVault';
import {Warehouse} from './Warehouse';
import {MissionControl} from './MissionControl';
import {AirportGate} from './AirportGate';
import {SubwayPlatform} from './SubwayPlatform';
import {Diner} from './Diner';
import {BedroomDay} from './BedroomDay';

// One 1080x1920 composition per library backdrop (id = backdrop name), rendered at frame 0 by render_backdrops.sh.
const ALL: Record<string, React.FC> = {'courtroom': Courtroom, 'bank-vault': BankVault, 'warehouse': Warehouse, 'mission-control': MissionControl, 'airport-gate': AirportGate, 'subway-platform': SubwayPlatform, 'diner': Diner, 'bedroom-day': BedroomDay};

export const BackdropsRoot: React.FC = () => (
  <>
    {Object.entries(ALL).map(([id, C]) => (
      <Composition key={id} id={id} component={() => <><PaperDefs /><C /></>} durationInFrames={1} fps={30} width={1080} height={1920} />
    ))}
  </>
);
