// @sfx click | ui | 0.02 | single mouse / button click | papercut-explainer
SFX['click'] = (K, t) => { K.tone(3200, t, .02, {g: .14, type: 'square'}); K.noise(t, .02, {g: .1, f: 5000, q: 2, seed: 131}); };
