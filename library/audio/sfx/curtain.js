// @sfx curtain | motion, theatre | 0.6 | heavy curtain swish | papercut-explainer
SFX['curtain'] = (K, t) => K.noise(t, .6, {g: .14, type: 'lowpass', f: 600, f2: 1400, q: .6, env: 1, seed: 260});
