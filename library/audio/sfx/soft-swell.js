// @sfx soft-swell | pad, emotional | 2 | warm low pad swell, 1 s in and 1 s out, for the emotional turn | papercut-explainer
SFX['soft-swell'] = (K, t) => { const {ac, hz, fx} = K, lp = ac.createBiquadFilter(), e = ac.createGain(), N = 128, sw = a => { const c = new Float32Array(N); for (let i = 0; i < N; i++) c[i] = a * Math.pow(Math.sin(Math.PI * i / (N - 1)), 2); return c; };
  lp.type = 'lowpass'; lp.Q.value = .3; lp.connect(e); e.connect(fx);
  e.gain.setValueAtTime(0, t); e.gain.setValueCurveAtTime(sw(.075), t, 2); lp.frequency.setValueAtTime(320, t); lp.frequency.setValueCurveAtTime(Float32Array.from(sw(1), v => 320 + 480 * v), t, 2);
  [41, 48, 53, 57, 60].forEach((m, i) => [-5, 6].forEach(d => { const o = ac.createOscillator(), og = ac.createGain(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = hz(m); o.detune.value = d; og.gain.value = i < 2 ? 1 : .6; o.connect(og); og.connect(lp); o.start(t); o.stop(t + 2.1); })); };
