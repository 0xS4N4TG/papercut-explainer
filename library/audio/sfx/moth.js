// @sfx moth | comic, nature | 0.5 | fluttering moth wings (empty wallet gag) | papercut-explainer
SFX['moth'] = (K, t) => { for (let k = 0; k < 12; k++) K.noise(t + k * .04, .02, {g: .06, f: 900 + (k % 2) * 300, q: 2, seed: 220 + k}); };
