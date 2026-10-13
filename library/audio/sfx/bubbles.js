// @sfx bubbles | water | 0.6 | a run of bubbles | papercut-explainer
SFX['bubbles'] = (K, t) => { for (let k = 0; k < 9; k++) K.tone(500 + K.R() * 900, t + k * .06 + K.R() * .03, .07, {g: .08, f2: 1400 + K.R() * 900}); };
