// Scene registry: id (must match src/plan.json) → component, banner (fact track, never repeats the VO), caption band.
// Regenerate the stubs with: python3 <lib>/papercut/stubs.py   (reads episode.json scenes + banners)
import React from 'react';

export type SceneDef = {id: string; component: React.FC; banner: string; band: number};
export const SCENES: SceneDef[] = [];
