// @sfx ring | ui, phone | 0.5 | phone ring trill | papercut-explainer
SFX['ring'] = (K, t) => { for (let k = 0; k < 10; k++) K.tone(k % 2 ? 1250 : 1560, t + k * .05, .05, {g: .07, type: 'square'}); };
