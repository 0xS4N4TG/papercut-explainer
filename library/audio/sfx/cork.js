// @sfx cork | glass | 0.08 | cork pop | papercut-explainer
SFX['cork'] = (K, t) => { K.noise(t, .05, {g: .35, type: 'lowpass', f: 1200, seed: 270}); K.tone(500, t, .08, {g: .2, f2: 900}); };
