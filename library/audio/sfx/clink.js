// @sfx clink | glass | 0.6 | glass clink (three partials) | papercut-explainer
SFX['clink'] = (K, t) => { [2380, 3710, 5230].forEach((f, k) => K.tone(f, t + k * .004, .6 - k * .12, {g: .08})); };
