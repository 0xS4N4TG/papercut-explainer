// @sfx crack | impact, glass | 0.2 | glass crack, three snaps | papercut-explainer
SFX['crack'] = (K, t) => { K.noise(t, .05, {g: .3, f: 3500, q: 2, seed: 270}); K.noise(t + .06, .05, {g: .22, f: 2800, q: 2, seed: 271}); K.noise(t + .11, .08, {g: .18, f: 2200, q: 2, seed: 272}); };
