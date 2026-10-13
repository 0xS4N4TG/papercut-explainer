// @sfx scribble | paper, writing | 0.3 | pencil scribble | papercut-explainer
SFX['scribble'] = (K, t) => { for (let k = 0; k < 5; k++) K.noise(t + k * .06, .05, {g: .08, f: 3000 + k * 300, q: 2.5, seed: 80 + k}); };
