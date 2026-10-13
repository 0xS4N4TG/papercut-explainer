// @sfx whip-crack | impact, comic, paper | 0.22 | dry cartoon whip crack: sharp broadband paper-snap, fast pitch-dropping tail, tiny paper rattle (no air sweep) | papercut-explainer
SFX['whip-crack'] = (K, t) => {
  K.noise(t, .035, {g: .6, type: 'highpass', f: 1200, q: .7, env: 1, seed: 901});           // the snap: broadband transient
  K.noise(t, .05, {g: .35, type: 'bandpass', f: 4200, f2: 2200, q: .8, seed: 902});
  K.tone(2600, t, .17, {g: .26, type: 'triangle', f2: 280});                                  // fast pitch-dropping tail
  K.tone(170, t, .08, {g: .3, f2: 80});                                                       // tiny body
  [.085, .125, .165].forEach((d, k) => K.noise(t + d, .035, {g: .14 - k * .03, f: 3600 - k * 500, q: 2.2, seed: 910 + k})); // paper rattle
};
