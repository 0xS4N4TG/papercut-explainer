// @sfx whoosh | motion | 0.55 | rising air whoosh: entrances, camera moves, ignition | papercut-explainer
SFX['whoosh'] = (K, t) => K.noise(t, .55, {g: .3, f: 350, f2: 3000, q: .8, env: 1, seed: 21});
