// @sfx fire-flare | fire | 0.7 | flames flaring: soft rising noisy whump + crackle burst that decays | papercut-explainer
SFX['fire-flare'] = (K, t) => {
  const ac = K.ac, sr = ac.sampleRate;
  const swell = (d, att, g, type, f, f2, q, seed) => { // noise with a RISING envelope (K.noise attacks too fast)
    const n = Math.ceil(sr * (d + .1)), b = ac.createBuffer(1, n, sr), c = b.getChannelData(0); let s = seed;
    for (let i = 0; i < n; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; c[i] = s / 2147483648 - 1; }
    const src = ac.createBufferSource(), fl = ac.createBiquadFilter(), e = ac.createGain(); src.buffer = b; fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f, t); fl.frequency.exponentialRampToValueAtTime(f2, t + att);
    e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + att); e.gain.setTargetAtTime(0, t + att, (d - att) * .3);
    src.connect(fl); fl.connect(e); e.connect(K.fx); src.start(t); src.stop(t + d + .1); };
  swell(.7, .2, .9, 'lowpass', 260, 1100, .7, 11);
  swell(.6, .22, .22, 'bandpass', 1500, 3000, .8, 12);
  K.tone(70, t, .35, {g: .3, f2: 48});
  for (let k = 0; k < 12; k++) K.noise(t + .12 + k * .035 + (k * 7 % 5) * .008, .02, {g: .16 - k * .008, f: 2200 + (k * 613 % 2400), q: 3, seed: 920 + k});
};
