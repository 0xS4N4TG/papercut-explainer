// @sfx chain-clink | foley, metal | 0.5 | small chain swaying: three light metal clinks, decaying | papercut-explainer
SFX['chain-clink'] = (K, t) => {
  [[0, 1, 0], [.16, .7, 1], [.33, .45, 2]].forEach(([d, a, k]) => {
    const base = 2900 + k * 260;
    K.tone(base, t + d, .22, {g: .15 * a}); K.tone(base * 1.62, t + d, .16, {g: .15 * a}); K.tone(base * 2.4, t + d, .08, {g: .07 * a});
    K.noise(t + d, .012, {g: .25 * a, type: 'highpass', f: 3500, env: 1, seed: 1021 + k * 3});
  });
};
