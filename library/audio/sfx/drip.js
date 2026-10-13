// @sfx drip | water | 0.15 | water drip | papercut-explainer
SFX['drip'] = (K, t) => { K.tone(1200, t, .07, {g: .16, f2: 2400}); K.tone(600, t + .03, .12, {g: .06, f2: 300}); };
