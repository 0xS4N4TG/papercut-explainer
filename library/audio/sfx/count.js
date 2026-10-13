// @sfx count | ui, numbers | 1.0 | fast ticking counter (number counting up) | papercut-explainer
SFX['count'] = (K, t) => { for (let k = 0; k < 14; k++) K.tone(1700 + k * 40, t + k * .07, .025, {g: .07 * (1 - k / 20), type: 'square'}); };
