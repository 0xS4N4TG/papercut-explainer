// @sfx monitor-beeps | tech, tension | 1.6 | heart-rate monitor that speeds up: clean 1 kHz sine beeps (60 ms) at accelerating intervals, 0.5 s down to 0.15 s | papercut-explainer
SFX['monitor-beeps'] = (K, t) => {
  const ac = K.ac;
  [0, .5, .83, 1.07, 1.25, 1.4, 1.55].forEach(d => {
    const o = ac.createOscillator(), e = ac.createGain(), s = t + d; o.type = 'sine'; o.frequency.value = 1000;
    e.gain.setValueAtTime(0, s); e.gain.linearRampToValueAtTime(.45, s + .004); e.gain.setValueAtTime(.45, s + .052); e.gain.linearRampToValueAtTime(0, s + .06);
    o.connect(e); e.connect(K.fx); o.start(s); o.stop(s + .07); });
};
