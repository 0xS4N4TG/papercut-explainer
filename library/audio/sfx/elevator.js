// @sfx elevator | ambience | 0.9 | low elevator rumble | papercut-explainer
SFX['elevator'] = (K, t) => { K.noise(t, .9, {g: .07, type: 'lowpass', f: 300, q: .7, env: 1, seed: 190}); };
