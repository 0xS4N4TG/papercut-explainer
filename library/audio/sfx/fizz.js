// @sfx fizz | water | 0.9 | fizz / carbonation hiss | papercut-explainer
SFX['fizz'] = (K, t) => K.noise(t, .9, {g: .16, type: 'highpass', f: 5000, f2: 9000, q: .5, env: 1, seed: 260});
