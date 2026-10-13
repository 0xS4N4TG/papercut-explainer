// @sfx scratch | comic, motion | 0.5 | record scratch: three scrubbed vinyl strokes, "wik-wik-wiiip" (freeze-frame meme beat) | papercut-explainer
SFX['scratch'] = (K, t) => {
  const stroke = (dt, d, a, b, seed) => { K.tone(a, t + dt, d, {g: .16, type: 'sawtooth', f2: b}); K.noise(t + dt, d, {g: .24, f: a * 2.4, f2: b * 2.4, q: 1.6, env: 1, seed}); };
  stroke(0, .14, 1000, 240, 301);
  stroke(.13, .1, 260, 1150, 302);
  stroke(.22, .22, 1300, 130, 303);
  K.tone(70, t + .4, .1, {g: .22, f2: 45});   // needle thump as it stops
};
