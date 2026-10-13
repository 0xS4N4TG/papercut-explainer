// @sfx crackle | fire, ambience | 0.6 | campfire crackle + low rumble | papercut-explainer
SFX['crackle'] = (K, t) => { K.noise(t, .6, {g: .06, type: 'lowpass', f: 400, env: 1, seed: 199}); for (let k = 0; k < 10; k++) K.noise(t + k * .045 + K.R() * .02, .02, {g: .1 + K.R() * .08, f: 2500 + K.R() * 2000, q: 3, seed: 200 + k}); };
