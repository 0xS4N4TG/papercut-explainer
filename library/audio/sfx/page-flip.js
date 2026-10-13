// @sfx page-flip | transition, paper | 0.45 | a paper page turning: soft lift, airy swish, a flutter of small flaps, a flat landing (pageTurn transition) | papercut-explainer
SFX['page-flip'] = (K, t) => {
  K.noise(t, .09, {g: .08, type: 'lowpass', f: 700, q: .6, seed: 301});
  K.noise(t + .03, .26, {g: .17, f: 800, f2: 3800, q: .8, env: 1, seed: 302});
  for (let k = 0; k < 7; k++) K.noise(t + .14 + k * .034, .018, {g: .07 * (1 - k / 9), f: 2600 + (k % 2) * 800, q: 2.2, seed: 310 + k});
  K.noise(t + .34, .06, {g: .1, type: 'lowpass', f: 900, q: .7, seed: 320});
};
