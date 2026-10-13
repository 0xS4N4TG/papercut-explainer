// @sfx rip | paper | 0.25 | paper tear / envelope opening | papercut-explainer
SFX['rip'] = (K, t) => { for (let k = 0; k < 7; k++) K.noise(t + k * .03, .05, {g: .14, f: 2200 - k * 150, q: 1.6, seed: 180 + k}); };
