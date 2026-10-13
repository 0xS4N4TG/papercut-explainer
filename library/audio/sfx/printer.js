// @sfx printer | machine, paper | 0.45 | adding machine / receipt printer ratchet | papercut-explainer
SFX['printer'] = (K, t) => { for (let k = 0; k < 6; k++) { K.tone(260, t + k * .07, .04, {g: .12, type: 'square'}); K.noise(t + k * .07, .05, {g: .1, f: 1800, q: 1.5, seed: 230 + k}); } };
