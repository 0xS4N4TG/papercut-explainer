// @sfx toss | motion, paper | 0.35 | toss through the air, then a paper pop landing | papercut-explainer
SFX['toss'] = (K, t) => { K.noise(t, .25, {g: .1, f: 900, f2: 2400, q: 1, env: 1, seed: 90}); K.pop(t + .25, .8); };
