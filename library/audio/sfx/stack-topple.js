// @sfx stack-topple | impact, paper | 0.9 | a tall stack of scrolls toppling: a creak, then eight cardboard-tube clonks tumbling and decaying | papercut-explainer
SFX['stack-topple'] = (K, t) => {
  K.tone(300, t, .12, {g: .06, type: 'sawtooth', f2: 380});                                     // creak
  [.14, .2, .27, .33, .42, .5, .6, .72].forEach((d, k) => {
    K.tone(260 - k * 14, t + d, .09, {g: .3 - k * .025, type: 'triangle', f2: 120});           // tube clonk
    K.noise(t + d, .04, {g: .14 - k * .012, type: 'lowpass', f: 900, env: 1, seed: 1141 + k});
  });
};
