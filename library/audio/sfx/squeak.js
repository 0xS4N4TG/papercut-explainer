// @sfx squeak | comic | 0.3 | rubber squeak (duck, toy) | papercut-explainer
SFX['squeak'] = (K, t) => { K.tone(900, t, .18, {g: .12, type: 'triangle', f2: 1500}); K.tone(1500, t + .18, .12, {g: .1, type: 'triangle', f2: 1100}); };
