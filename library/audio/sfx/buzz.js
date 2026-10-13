// @sfx buzz | negative | 0.35 | low detuned saw buzz (bad, error) | papercut-explainer
SFX['buzz'] = (K, t) => { K.tone(110, t, .35, {g: .1, type: 'sawtooth'}); K.tone(116, t, .35, {g: .08, type: 'sawtooth'}); };
