// @sfx tick | ui | 0.14 | two square ticks (clock / checkbox) | papercut-explainer
SFX['tick'] = (K, t) => { K.tone(2400, t, .035, {g: .12, type: 'square'}); K.tone(1800, t + .1, .035, {g: .08, type: 'square'}); };
