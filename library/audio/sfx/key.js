// @sfx key | ui, typing | 0.45 | four keyboard taps, 0.133 s apart | papercut-explainer
SFX['key'] = (K, t) => { for (let k = 0; k < 4; k++) { K.tone(1900, t + k * .133, .03, {g: .1, type: 'square'}); K.noise(t + k * .133, .025, {g: .08, f: 4500, q: 2, seed: 170 + k}); } };
