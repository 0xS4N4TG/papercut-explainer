// @sfx burn-away | fire, transition, paper | 0.55 | paper catching fire and burning off: short warm whump, then a crackly rising sizzle (burnAway transition) | papercut-explainer
SFX['burn-away'] = (K, t) => {
  const ac = K.ac, sr = ac.sampleRate;
  const swell = (d, att, g, type, f, f2, q, seed) => {
    const n = Math.ceil(sr * (d + .1)), b = ac.createBuffer(1, n, sr), c = b.getChannelData(0); let s = seed;
    for (let i = 0; i < n; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; c[i] = s / 2147483648 - 1; }
    const src = ac.createBufferSource(), fl = ac.createBiquadFilter(), e = ac.createGain(); src.buffer = b; fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f, t); fl.frequency.exponentialRampToValueAtTime(f2, t + d);
    e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + att); e.gain.setTargetAtTime(0, t + att, (d - att) * .22);
    src.connect(fl); fl.connect(e); e.connect(K.fx); src.start(t); src.stop(t + d + .1); };
  K.tone(95, t, .22, {g: .35, f2: 52});                                                  // warm whump
  K.noise(t, .2, {g: .4, type: 'lowpass', f: 450, q: .7, seed: 931});
  swell(.5, .36, .34, 'highpass', 2500, 6500, .6, 21);                                   // rising sizzle
  swell(.45, .3, .2, 'bandpass', 1200, 2600, .9, 22);
  for (let k = 0; k < 16; k++) { const at = .06 + k * .028 + (k * 5 % 3) * .006; K.noise(t + at, .018, {g: .07 + at * .22, f: 2000 + (k * 811 % 3500), q: 3, seed: 940 + k}); } // crackle gets denser/louder
};
