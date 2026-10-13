// @sfx door | impact, building | 0.27 | door slam + latch click | papercut-explainer
SFX['door'] = (K, t) => { K.tone(120, t, .18, {g: .35, f2: 70}); K.noise(t, .08, {g: .2, type: 'lowpass', f: 900, seed: 240}); K.tone(2200, t + .09, .025, {g: .08, type: 'square'}); };
