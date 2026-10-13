// @sfx hit | impact, hook | 0.6 | deep boom for the first frame / hook | papercut-explainer
SFX['hit'] = (K, t) => { K.tone(55, t, .6, {g: .5, f2: 38}); K.noise(t, .3, {g: .18, type: 'lowpass', f: 1200, seed: 7}); };
