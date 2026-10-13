// @sfx x | ui, negative | 0.18 | wrong / cross-out buzz | papercut-explainer
SFX['x'] = (K, t) => { K.noise(t, .1, {g: .3, f: 2600, q: 1.2, f2: 1200, seed: 11}); K.tone(140, t, .18, {g: .14, type: 'square', f2: 70}); };
