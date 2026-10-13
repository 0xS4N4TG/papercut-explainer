// @sfx plug | ui, tech | 0.05 | single plug-in click | papercut-explainer
SFX['plug'] = (K, t) => { K.tone(420, t, .05, {g: .16, type: 'square', f2: 180}); K.noise(t, .04, {g: .14, type: 'lowpass', f: 1500, seed: 141}); };
