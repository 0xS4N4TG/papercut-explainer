// @sfx zoom | motion | 0.7 | big rising zoom sweep + saw | papercut-explainer
SFX['zoom'] = (K, t) => { K.noise(t, .7, {g: .25, f: 300, f2: 4200, q: 1.3, env: 1, seed: 120}); K.tone(150, t, .6, {g: .07, type: 'sawtooth', f2: 600}); };
