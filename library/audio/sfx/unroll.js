// @sfx unroll | paper | 1.1 | a scroll / tape unrolling (16 ticks) | papercut-explainer
SFX['unroll'] = (K, t) => { for (let k = 0; k < 16; k++) K.noise(t + k * .07, .06, {g: .07, f: 1100 + k * 90, q: 1.4, seed: 60 + k}); };
