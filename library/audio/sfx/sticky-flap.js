// @sfx sticky-flap | paper, comic | 0.25 | sticky note slapped and flapping: pat + two small paper flutters | papercut-explainer
SFX['sticky-flap'] = (K, t) => {
  K.noise(t, .05, {g: .85, type: 'lowpass', f: 1700, q: .8, seed: 971}); K.tone(320, t, .05, {g: .16, f2: 180});    // pat
  [[.1, 3600], [.17, 3000]].forEach(([d, f], k) => { K.noise(t + d, .025, {g: .22, f, q: 2, seed: 972 + k * 2}); K.noise(t + d + .022, .025, {g: .14, f: f - 500, q: 2, seed: 973 + k * 2}); }); // flutters
};
