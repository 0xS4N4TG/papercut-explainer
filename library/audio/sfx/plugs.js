// @sfx plugs | ui, tech | 0.85 | 16 plug-ins in a rising run (many tools connect) | papercut-explainer
SFX['plugs'] = (K, t) => { for (let k = 0; k < 16; k++) { K.tone(380 + k * 22, t + k * .053, .045, {g: .1, type: 'square', f2: 160 + k * 10}); K.noise(t + k * .053, .035, {g: .08, type: 'lowpass', f: 1600, seed: 150 + k}); } };
