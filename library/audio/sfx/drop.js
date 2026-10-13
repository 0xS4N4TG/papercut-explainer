// @sfx drop | paper | 0.75 | eight pops in a row (a pile or stack lands) | papercut-explainer
SFX['drop'] = (K, t) => { for (let k = 0; k < 8; k++) K.pop(t + k * .09, .8 + (k % 3) * .12); };
