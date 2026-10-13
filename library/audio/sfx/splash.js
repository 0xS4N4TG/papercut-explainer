// @sfx splash | water | 0.7 | splash: wash + droplets | papercut-explainer
SFX['splash'] = (K, t) => { K.noise(t, .6, {g: .34, type: 'lowpass', f: 4000, f2: 500, q: .6, seed: 201}); K.noise(t + .02, .35, {g: .14, type: 'highpass', f: 3000, q: .5, seed: 202}); for (let k = 0; k < 6; k++) K.tone(500 + K.R() * 700, t + .2 + k * .07, .07, {g: .06, f2: 1600}); };
