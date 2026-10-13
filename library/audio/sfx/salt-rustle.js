// @sfx salt-rustle | foley, glass | 0.4 | soft granular shimmer of salt crystals shifting in a dish, very quiet, glassy-dry | papercut-explainer
SFX['salt-rustle'] = (K, t) => { const r = rng(Math.round(t * 1000) + 17);
  for (let i = 0; i < 16; i++) { const tt = t + Math.pow(r(), 1.3) * .32, f = 4200 + r() * 4500, a = .035 + r() * .06;
    K.noise(tt, .012 + r() * .02, {g: a, type: 'bandpass', f, q: 2.5 + r() * 3, seed: 100 + i});
    if (r() < .4) K.tone(f * (.55 + r() * .3), tt, .035, {g: .012 + r() * .01}); } };
