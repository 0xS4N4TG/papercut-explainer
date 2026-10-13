// @sfx gong | impact, tone | 1.2 | small round paper-gong: soft mallet hit, inharmonic partials ringing down (round start, not epic) | papercut-explainer
SFX['gong'] = (K, t) => {
  K.noise(t, .03, {g: .3, type: 'lowpass', f: 900, env: 1, seed: 1121});                       // mallet
  [[196, .26, 1.1], [293.7, .16, .95], [412, .11, .8], [590, .07, .6], [830, .04, .45]].forEach(([f, g, d]) => K.tone(f, t, d, {g, f2: f * .985}));
};
