// @sfx radio | ui, signal | 0.25 | radio chirp: static + two beeps | papercut-explainer
SFX['radio'] = (K, t) => { K.noise(t, .25, {g: .1, f: 1800, q: 4, seed: 51}); K.tone(880, t + .05, .08, {g: .06, type: 'square'}); K.tone(1175, t + .15, .08, {g: .06, type: 'square'}); };
