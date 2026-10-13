// @sfx gulp | comic | 0.3 | comic gulp: short low glottal blip with a quick upward pitch bend | papercut-explainer
SFX['gulp'] = (K, t) => {
  K.tone(95, t, .11, {g: .6, type: 'triangle', f2: 250});                  // glunk, bending up
  K.tone(190, t, .11, {g: .1, f2: 500});
  K.noise(t, .03, {g: .18, type: 'lowpass', f: 700, q: 1, env: 1, seed: 991});
  K.tone(80, t + .15, .18, {g: .32, type: 'triangle', f2: 150});          // small swallow after-blip
};
