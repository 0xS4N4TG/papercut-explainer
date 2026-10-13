// @sfx unplug | tech, negative | 0.55 | plug pulled + power-down tone | papercut-explainer
SFX['unplug'] = (K, t) => { K.tone(420, t, .05, {g: .16, type: 'square', f2: 180}); K.tone(600, t + .05, .5, {g: .1, f2: 90}); };
