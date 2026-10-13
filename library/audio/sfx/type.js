// @sfx type | ui, typing | 2.2 | 40 keystrokes of fast typing (long) | papercut-explainer
SFX['type'] = (K, t) => { for (let k = 0; k < 40; k++) { const tt = t + k * .055 + (K.R() - .5) * .02; K.tone(1600 + K.R() * 600, tt, .02, {g: .06, type: 'square'}); K.noise(tt, .02, {g: .06, f: 4000, q: 2, seed: 100 + k}); } };
