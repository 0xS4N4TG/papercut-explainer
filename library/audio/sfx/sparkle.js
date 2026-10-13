// @sfx sparkle | positive, magic | 0.45 | four high glints (something good appears) | papercut-explainer
SFX['sparkle'] = (K, t) => [2093, 2637, 3136, 4186].forEach((f, k) => K.tone(f, t + k * .05, .3, {g: .05}));
