// @sfx pour | water, grains | 0.85 | pouring grains / salt / sand | papercut-explainer
SFX['pour'] = (K, t) => { for (let k = 0; k < 46; k++) { const tt = t + k * .018 + K.R() * .012; K.noise(tt, .012, {g: .09 + K.R() * .05, type: 'highpass', f: 3500 + K.R() * 3000, q: .7, seed: 210 + k}); } };
