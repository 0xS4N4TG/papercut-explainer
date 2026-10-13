// @sfx cheer | positive, comic | 0.9 | quick major fanfare arpeggio (YES!) | papercut-explainer
SFX['cheer'] = (K, t) => { [72, 76, 79, 84].forEach((m, k) => K.tone(K.hz(m), t + k * .06, .5, {g: .1, type: 'triangle'})); K.tone(K.hz(84), t + .24, .8, {g: .07, type: 'square'}); };
