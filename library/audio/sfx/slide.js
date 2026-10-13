// @sfx slide | motion | 0.35 | paper sliding across paper | papercut-explainer
SFX['slide'] = (K, t) => K.noise(t, .35, {g: .16, f: 700, f2: 1500, q: .9, env: 1, seed: 31});
