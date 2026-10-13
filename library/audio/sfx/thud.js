// @sfx thud | impact | 0.25 | dull heavy thud (something lands) | papercut-explainer
SFX['thud'] = (K, t) => { K.tone(95, t, .25, {g: .45, f2: 55}); K.noise(t, .1, {g: .2, type: 'lowpass', f: 500, seed: 91}); };
