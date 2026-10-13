// @sfx bonk | impact, comic | 0.16 | comic bonk (bubble hits a wall) | papercut-explainer
SFX['bonk'] = (K, t) => { K.tone(330, t, .16, {g: .22, type: 'triangle', f2: 210}); K.noise(t, .05, {g: .12, type: 'lowpass', f: 1200, seed: 250}); };
