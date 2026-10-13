// @sfx tape-peel | transition, paper | 0.55 | sticky tape ripping off paper: a rising crackly peel, then a light flap (tapePull transition) | papercut-explainer
SFX['tape-peel'] = (K, t) => {
  K.noise(t, .36, {g: .09, f: 900, f2: 4200, q: 1.8, env: 1, seed: 330});
  for (let k = 0; k < 24; k++) K.noise(t + .36 * Math.pow(k / 24, .8), .012, {g: .08 + .05 * (k / 24), f: 1900 + k * 150, q: 3, seed: 340 + k});
  K.noise(t + .4, .08, {g: .14, type: 'lowpass', f: 800, f2: 300, q: .8, seed: 370});
  K.noise(t + .45, .04, {g: .07, f: 1800, q: 1.5, seed: 371});
};
