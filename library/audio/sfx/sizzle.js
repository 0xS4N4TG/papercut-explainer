// @sfx sizzle | fire | 0.7 | hot sizzle hiss | papercut-explainer
SFX['sizzle'] = (K, t) => K.noise(t, .7, {g: .12, type: 'highpass', f: 5000, q: .7, env: 1, seed: 210});
