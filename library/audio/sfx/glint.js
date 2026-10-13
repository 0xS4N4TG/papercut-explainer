// @sfx glint | positive, magic | 0.4 | three very high glints (shine, reveal) | papercut-explainer
SFX['glint'] = (K, t) => [3136, 4186, 5274].forEach((f, k) => K.tone(f, t + k * .04, .35, {g: .045}));
