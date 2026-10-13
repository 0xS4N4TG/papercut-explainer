// @sfx cut | transition | 0.14 | soft paper swish on a hard cut | papercut-explainer
SFX['cut'] = (K, t) => K.noise(t, .14, {g: .08, f: 1600, q: .7, seed: 3});
