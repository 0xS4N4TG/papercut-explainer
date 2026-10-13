// @sfx jar-rattle | foley, glass | 0.5 | a bug rattling in a glass jar: quick irregular glassy ticks | papercut-explainer
SFX['jar-rattle'] = (K, t) => {
  [[0, 1, 3300], [.04, .6, 4600], [.095, .9, 3800], [.13, .5, 5200], [.2, 1, 3500], [.235, .55, 4900], [.31, .8, 4100], [.36, .45, 5400], [.42, .5, 3700]].forEach(([d, a, f], k) => {
    K.tone(f, t + d, .045, {g: .3 * a}); K.tone(f * 1.51, t + d, .03, {g: .12 * a});
    K.noise(t + d, .012, {g: .2 * a, type: 'bandpass', f: f * 1.3, q: 3, env: 1, seed: 1001 + k});
  });
};
