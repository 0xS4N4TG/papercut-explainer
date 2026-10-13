// @sfx whip | transition | 0.3 | fast whip-pan swoosh (into the CTA) | papercut-explainer
SFX['whip'] = (K, t) => K.noise(t, .3, {g: .32, f: 600, f2: 5000, q: .7, env: 1, seed: 161});
