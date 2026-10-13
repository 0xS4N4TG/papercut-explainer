// @sfx slosh | water | 0.5 | slosh of water | papercut-explainer
SFX['slosh'] = (K, t) => K.noise(t, .5, {g: .2, type: 'bandpass', f: 600, f2: 1400, q: 1.2, env: 1, seed: 280});
