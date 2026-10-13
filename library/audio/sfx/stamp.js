// @sfx stamp | impact, paper | 0.3 | rubber-stamp slam: low thump + paper hit | papercut-explainer
SFX['stamp'] = (K, t) => { K.tone(80, t, .3, {g: .55, f2: 42}); K.noise(t, .16, {g: .4, type: 'lowpass', f: 700, q: .7, seed: 41}); };
