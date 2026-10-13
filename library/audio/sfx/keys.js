// @sfx keys | ui, typing | 0.55 | four keyboard taps, 0.167 s apart (slower) | papercut-explainer
SFX['keys'] = (K, t) => { for (let k = 0; k < 4; k++) { K.tone(1900, t + k * .167, .03, {g: .1, type: 'square'}); K.noise(t + k * .167, .025, {g: .08, f: 4500, q: 2, seed: 300 + k}); } };
