'use strict';
// Shared Web Audio engine for papercut reels.
//   - kit primitives (noise, tone, pop, chime, pluck, hz, R) that every SFX file in ./sfx uses
//   - one parametric music bed driven by a preset in ./beds/*.json
// render.mjs builds a page from this file + the SFX files a cue sheet needs + one bed preset, and renders offline.
// SFX files register themselves: SFX.<name> = (K, t) => { ... }   (K = the kit, t = seconds)
const SFX = {};

function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function makeKit(ac, DUR, only, bed) {
  const t0 = 0, master = ac.createGain(); master.gain.value = .9;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; master.connect(comp); comp.connect(ac.destination);
  const bus = g => { const n = ac.createGain(); n.gain.value = g; n.connect(master); return n; };
  const music = bus(only === 'fx' ? 0 : (bed.musicGain ?? .3)), fx = bus(only === 'music' ? 0 : .75);
  const R = rng(4242), hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const bedEnd = DUR - (bed.tailSec ?? 1.3);
  const K = {ac, R, hz, music, fx, bedEnd, bed, dur: DUR};
  // ---- music-bus instruments ----
  K.pluck = (f, t, d, g, bright = 1, force = false) => {
    if (!force && t > bedEnd) return;
    const kal = bed.instrument === 'kalimba';
    const o = ac.createOscillator(), o2 = ac.createOscillator(), e = ac.createGain(), lp = ac.createBiquadFilter(), g2 = ac.createGain();
    o.type = kal ? 'sine' : 'triangle'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * (kal ? 5.4 : 4); g2.gain.value = kal ? .07 : .12;
    lp.type = 'lowpass'; lp.frequency.value = (kal ? 3200 : 2800) * bright;
    o.connect(e); o2.connect(g2); g2.connect(e); e.connect(lp); lp.connect(music);
    e.gain.setValueAtTime(0, t0 + t); e.gain.linearRampToValueAtTime(g, t0 + t + (kal ? .004 : .006)); e.gain.exponentialRampToValueAtTime(.0005, t0 + t + d);
    o.start(t0 + t); o2.start(t0 + t); o.stop(t0 + t + d + .05); o2.stop(t0 + t + d + .05);
  };
  K.pad = (notes, t, d, g) => { if (t > bedEnd) return;
    const lp = ac.createBiquadFilter(), e = ac.createGain(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.connect(e); e.connect(music);
    e.gain.setValueAtTime(0, t0 + t); e.gain.linearRampToValueAtTime(g, t0 + t + .35); e.gain.setValueAtTime(g, t0 + t + d - .3); e.gain.linearRampToValueAtTime(0, t0 + t + d + .2);
    for (const m of notes) for (const det of [-6, 5]) { const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(m); o.detune.value = det; o.connect(lp); o.start(t0 + t); o.stop(t0 + t + d + .3); } };
  K.sub = (f, t, d, g) => { if (t > bedEnd) return; const o = ac.createOscillator(), e = ac.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(e); e.connect(music);
    e.gain.setValueAtTime(0, t0 + t); e.gain.linearRampToValueAtTime(g, t0 + t + .02); e.gain.setTargetAtTime(0, t0 + t + d * .5, d * .2); o.start(t0 + t); o.stop(t0 + t + d + .3); };
  const burst = (t, dur, pw, filt, f, q, g, dest, chop) => { const sr = ac.sampleRate, n = Math.ceil(sr * dur), b = ac.createBuffer(1, n, sr), ch = b.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (R() * 2 - 1) * Math.pow(1 - i / n, pw) * (chop && i < sr * .01 ? (Math.floor(i / (sr * .0035)) % 2 ? .5 : 1) : 1);
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), e = ac.createGain(); s.buffer = b; fl.type = filt; fl.frequency.value = f; if (q) fl.Q.value = q; e.gain.value = g;
    s.connect(fl); fl.connect(e); e.connect(dest); s.start(t0 + t); };
  K.shaker = (t, g, f = 6500) => { if (t > bedEnd) return; burst(t, .06, 3, 'highpass', f, 0, g, music); };
  K.clap = (t, g) => { if (t > bedEnd) return; burst(t, .12, 6, 'bandpass', 1500, .9, g, music, true); };
  K.snap = (t, g) => { if (t > bedEnd) return; burst(t, .05, 8, 'bandpass', 2600, 2.2, g, music); };
  K.plipBed = (t, g) => { if (t > bedEnd) return; const o = ac.createOscillator(), e = ac.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(700 + R() * 300, t0 + t); o.frequency.exponentialRampToValueAtTime(1700 + R() * 500, t0 + t + .05);
    e.gain.setValueAtTime(0, t0 + t); e.gain.linearRampToValueAtTime(g, t0 + t + .004); e.gain.exponentialRampToValueAtTime(.0005, t0 + t + .09); o.connect(e); e.connect(music); o.start(t0 + t); o.stop(t0 + t + .12); };
  // ---- fx-bus primitives (what SFX files call) ----
  K.noise = (t, d, {g = .3, type = 'bandpass', f = 2000, q = 1, f2 = null, env = 2, seed = 1} = {}) => {
    const sr = ac.sampleRate, n = Math.ceil(sr * d), b = ac.createBuffer(1, n, sr), ch = b.getChannelData(0), r = rng(seed);
    for (let i = 0; i < n; i++) ch[i] = r() * 2 - 1;
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), e = ac.createGain();
    s.buffer = b; fl.type = type; fl.frequency.setValueAtTime(f, t0 + t); fl.Q.value = q; if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + t + d);
    e.gain.setValueAtTime(0, t0 + t); e.gain.linearRampToValueAtTime(g, t0 + t + Math.min(.015, d * .2)); e.gain.setTargetAtTime(0, t0 + t + d * (env === 2 ? .3 : .8), d * .2);
    s.connect(fl); fl.connect(e); e.connect(fx); s.start(t0 + t); s.stop(t0 + t + d + .2);
  };
  K.tone = (f, t, d, {g = .2, type = 'sine', f2 = null} = {}) => {
    const o = ac.createOscillator(), e = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0 + t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + t + d);
    e.gain.setValueAtTime(0, t0 + t); e.gain.linearRampToValueAtTime(g, t0 + t + .004); e.gain.exponentialRampToValueAtTime(.0005, t0 + t + d); o.connect(e); e.connect(fx); o.start(t0 + t); o.stop(t0 + t + d + .05);
  };
  // paper pop = a short low "thup" of card on card + tiny tick
  K.pop = (t, f = 1) => { K.noise(t, .06, {g: .32, type: 'lowpass', f: 900 * f, q: .8, seed: Math.round(t * 100)}); K.tone(220 * f, t, .07, {g: .18, f2: 120 * f}); K.tone(1400 * f, t, .03, {g: .05}); };
  K.chime = t => { K.tone(1046.5, t, .9, {g: .15}); K.tone(1318.5, t + .07, .8, {g: .12}); K.tone(1568, t + .14, .7, {g: .1}); };

  // ---- night-bed primitives (music bus; used by playNight, "style": "night"). All seeded via rng(), no Math.random. ----
  const cosCurve = (a, b, n = 256) => { const c = new Float32Array(n); for (let i = 0; i < n; i++) c[i] = a + (b - a) * (.5 - .5 * Math.cos(Math.PI * i / (n - 1))); return c; };
  // gain node that fades in over `inS` and out over the last `outS` seconds of the render
  const envBus = (g, inS, outS, dest = music) => { const n = ac.createGain(); n.connect(dest); n.gain.setValueAtTime(0, 0); n.gain.setValueCurveAtTime(cosCurve(0, g), 0, inS);
    n.gain.setValueAtTime(g, DUR - outS - .001); n.gain.setValueCurveAtTime(cosCurve(g, 0), DUR - outS, outS); return n; };
  // slow, smooth, seeded gain wander so a layer never reads as a loop
  const drift = (node, base, step, depth, seed) => { const rr = rng(seed), m = Math.ceil(DUR / step) + 2, c = new Float32Array(m); let v = 0;
    for (let i = 0; i < m; i++) { v = (v + (rr() * 2 - 1) * .6) * .86; c[i] = base * (1 + depth * Math.tanh(v * 1.6)); } node.gain.setValueCurveAtTime(c, 0, DUR); };
  const rmsNorm = (b, rms) => { let e = 0, k = 0; for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) e += d[i] * d[i]; k += d.length; }
    const f = rms / Math.sqrt(e / k || 1); for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= f; } };
  const src = (b, dest) => { const s = ac.createBufferSource(); s.buffer = b; s.connect(dest); s.start(0); return s; };
  const filt = (type, f, q = .7) => { const n = ac.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; return n; };
  // Rain on glass: soft broadband hiss + band-limited patter (Poisson micro-drops) + sparse pinging ticks + a few slower, larger drips.
  //   o = {g: overall, hiss, patter, ticks, drips: levels, fade: end fade s, seed, tickRate: ticks/s, rv: reverb input node for the drips}
  K.rain = (o = {}) => {
    const sr = ac.sampleRate, n = Math.ceil(sr * DUR), seed = o.seed ?? 31, bus = envBus(o.g ?? 1, .15, o.fade ?? 1.5);
    const hiss = ac.createBuffer(2, n, sr), pat = ac.createBuffer(2, n, sr), tk = ac.createBuffer(2, n, sr);
    for (let c = 0; c < 2; c++) {
      const r1 = rng(seed * 11 + c), r2 = rng(seed * 13 + c + 5), r3 = rng(seed * 17 + c + 9), h = hiss.getChannelData(c), p = pat.getChannelData(c), q = tk.getChannelData(c), ph = [r2() * 6.28, r2() * 6.28];
      for (let i = 0; i < n; i++) h[i] = r1() * 2 - 1;
      for (let t = 0; t < DUR;) { const rate = 150 * (1 + .35 * Math.sin(.21 * t + ph[0]) + .2 * Math.sin(.53 * t + ph[1])); t += -Math.log(1 - r2() * .999) / rate;
        const i0 = Math.floor(t * sr), L = Math.floor(sr * (.0015 + .004 * r2())), a = Math.pow(r2(), 2.4); for (let i = 0; i < L && i0 + i < n; i++) p[i0 + i] += (r2() * 2 - 1) * a * Math.exp(-i / (L * .3)); }
      for (let t = 0; t < DUR;) { t += -Math.log(1 - r3() * .999) / ((o.tickRate ?? .9) * .5); const i0 = Math.floor(t * sr), f = 2200 + 4200 * r3(), tau = .0025 + .004 * r3(), a = (.25 + .75 * r3()) * (r3() < .5 ? 1 : .35);
        for (let i = 0; i < sr * .03 && i0 + i < n; i++) q[i0 + i] += a * Math.sin(2 * Math.PI * f * i / sr) * Math.exp(-i / sr / tau); }
    }
    rmsNorm(hiss, .25); rmsNorm(pat, .25);
    const lay = (b, chain, base, step, depth, sd) => { const gn = ac.createGain(); gn.gain.value = base; drift(gn, base, step, depth, sd); src(b, chain[0]); for (let i = 0; i < chain.length - 1; i++) chain[i].connect(chain[i + 1]); chain[chain.length - 1].connect(gn); gn.connect(bus); };
    lay(hiss, [filt('highpass', 420, .5), filt('lowpass', 6200, .5)], o.hiss ?? .1, 3.1, .22, seed + 1);
    lay(pat, [filt('highpass', 1500, .6), filt('lowpass', 7500, .6)], o.patter ?? .2, 2.3, .3, seed + 2);
    lay(tk, [filt('highpass', 1800, .5)], o.ticks ?? .05, 4.7, .25, seed + 3);
    // larger drips: a short rising sine "bloop" with a faint soft tick, one every ~5-9 s
    const rd = rng(seed * 19 + 3); for (let t = 2 + rd() * 3; t < DUR - 3; t += 5 + rd() * 4) {
      const f0 = 620 + 520 * rd(), pan = (rd() * 2 - 1) * .7, ge = ac.createGain(), pn = ac.createStereoPanner(), os = ac.createOscillator(), lp = filt('lowpass', 2600, .5); pn.pan.value = pan;
      os.frequency.setValueAtTime(f0, t); os.frequency.exponentialRampToValueAtTime(f0 * 1.55, t + .07); ge.gain.setValueAtTime(0, t); ge.gain.linearRampToValueAtTime(o.drips ?? .05, t + .004); ge.gain.exponentialRampToValueAtTime(.0004, t + .2);
      os.connect(lp); lp.connect(ge); ge.connect(pn); pn.connect(bus); if (o.rv) { const sd = ac.createGain(); sd.gain.value = .6; pn.connect(sd); sd.connect(o.rv); } os.start(t); os.stop(t + .25); }
    return bus;
  };
  // Room tone: a very low brown-noise floor.
  K.room = (g = .02, seed = 91) => {
    const sr = ac.sampleRate, n = Math.ceil(sr * DUR), b = ac.createBuffer(2, n, sr), bus = envBus(1, .15, 1.5);
    for (let c = 0; c < 2; c++) { const r = rng(seed + c * 7), d = b.getChannelData(c); let y = 0; for (let i = 0; i < n; i++) { y = (y + .02 * (r() * 2 - 1)) / 1.02; d[i] = y; } }
    rmsNorm(b, .3); const gn = ac.createGain(); gn.gain.value = g; drift(gn, g, 6.5, .25, seed + 3);
    const s = ac.createBufferSource(); s.buffer = b; const lp = filt('lowpass', 240, .5); s.connect(lp); lp.connect(gn); gn.connect(bus); s.start(0); return bus;
  };
  // Convolution reverb from a generated, seeded, decaying-noise impulse response (darkens as it decays). Returns the send node.
  K.reverb = (sec = 3, wet = .5, seed = 777) => {
    const sr = ac.sampleRate, n = Math.ceil(sr * sec), pre = Math.ceil(sr * .018), b = ac.createBuffer(2, n, sr), rt = sec * .9;
    for (let c = 0; c < 2; c++) { const r = rng(seed + c * 101), d = b.getChannelData(c); let y = 0;
      for (let i = pre; i < n; i++) { const t = (i - pre) / sr; y += (.12 + .55 * Math.exp(-t * 1.3)) * ((r() * 2 - 1) - y); d[i] = y * Math.exp(-6.9 * t / rt) * Math.min(1, t / .012); } }
    const cv = ac.createConvolver(), inp = ac.createGain(), w = ac.createGain(); cv.buffer = b; w.gain.value = wet; inp.connect(cv); cv.connect(w); w.connect(music); return inp;
  };
  let hamBuf = null;
  // Soft felt piano note: sine + decaying harmonics (slight inharmonicity), two detuned strings spread in stereo, soft attack, long exponential decay, gentle lowpass, faint hammer thump.
  //   f in Hz, t start, d decay length s, g peak gain, vel 0..1 (brightness), dest = bus node
  K.felt = (f, t, d, g, {vel = .55, pan = 0, dest = music} = {}) => {
    const att = .008 + .022 * (1 - vel), amps = [1, .36, .15, .07, .035];
    for (const [cents, sp] of [[-3.5, -.28], [3.5, .28]]) {
      const lp = filt('lowpass', 800 + 2400 * vel * Math.min(1, 900 / f + .35), .4), pn = ac.createStereoPanner(); pn.pan.value = Math.max(-1, Math.min(1, pan + sp)); lp.connect(pn); pn.connect(dest);
      amps.forEach((a, k) => { const n = k + 1, dn = d / (1 + .75 * k), o = ac.createOscillator(), e = ac.createGain();
        o.type = 'sine'; o.frequency.value = f * n * (1 + .0003 * n * n); o.detune.value = cents; if (f * n > 9000) return;
        e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g * a * .5, t + att); e.gain.exponentialRampToValueAtTime(.0008 * g, t + dn); o.connect(e); e.connect(lp); o.start(t); o.stop(t + dn + .05); });
    }
    if (!hamBuf) { const sr = ac.sampleRate, r = rng(55); hamBuf = ac.createBuffer(1, sr, sr); const d = hamBuf.getChannelData(0); for (let i = 0; i < sr; i++) d[i] = r() * 2 - 1; }
    const s = ac.createBufferSource(), lp = filt('lowpass', 260 + f * 1.2, .5), e = ac.createGain(); s.buffer = hamBuf; e.gain.setValueAtTime(g * .09, t); e.gain.exponentialRampToValueAtTime(.0001, t + .05);
    s.connect(lp); lp.connect(e); e.connect(dest); s.start(t, (t * 37.1) % .8, .06);
  };
  // Warm, very quiet pad: sine + soft triangle pairs under a slowly moving lowpass, slow attack and release.
  K.warm = (notes, t, d, g, {dest = music, att = 1.6, rel = 2} = {}) => {
    const lp = filt('lowpass', 520, .3), e = ac.createGain(), pn = ac.createStereoPanner(); lp.frequency.setValueAtTime(420, t); lp.frequency.linearRampToValueAtTime(760, t + d * .5); lp.frequency.linearRampToValueAtTime(420, t + d + rel);
    e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + att); e.gain.setValueAtTime(g, t + Math.max(att, d - rel * .2)); e.gain.linearRampToValueAtTime(0, t + d + rel); lp.connect(e); e.connect(dest);
    notes.forEach((m, i) => { for (const [ty, det, a] of [['sine', -5, 1], ['triangle', 6, .35]]) { const o = ac.createOscillator(), og = ac.createGain(), p = ac.createStereoPanner(); o.type = ty; o.frequency.value = hz(m); o.detune.value = det + i; og.gain.value = a; p.pan.value = ((i % 3) - 1) * .35;
      o.connect(og); og.connect(p); p.connect(lp); o.start(t); o.stop(t + d + rel + .05); } });
  };
  return K;
}

// One parametric bed: 4-chord loop, sub on 1 (+ beat 2 or 2.5), 8th-note plucks over a pattern, shaker on the off-8ths,
// optional pad / clap or snap on 2 and 4 / water plips / a top-note sparkle every 4th bar. See beds/*.json.
function playBed(K, bed) {
  if (bed.style === 'night') return playNight(K, bed);
  const beat = 60 / bed.bpm, bar = beat * 4, {hz} = K;
  const skip = (k, b) => (bed.skip || []).some(([kk, mod, rem]) => k === kk && b % mod === rem);
  for (let b = 0, t = 0; t < K.bedEnd; b++, t += bar) {
    const [root, ch] = bed.prog[b % bed.prog.length];
    const [s1, s2] = bed.sub || [[0, 1.6, .45], [2, 1.6, .35]];
    K.sub(hz(root - 12), t + s1[0] * beat, beat * s1[1], s1[2]); K.sub(hz(root - 12), t + s2[0] * beat, beat * s2[1], s2[2]);
    if (bed.pad) K.pad(ch.slice(0, 3), t, bar, bed.pad);
    for (let k = 0; k < 8; k++) {
      const tt = t + k * beat / 2; if (skip(k, b)) continue;
      K.pluck(hz(ch[bed.pattern[k]] + (bed.octave || 0)), tt, bed.pluckDecay ?? .35, k % 2 ? (bed.pluckGain?.[1] ?? .1) : (bed.pluckGain?.[0] ?? .15), .9);
      K.shaker(tt + beat / 4, bed.shaker?.[0] ?? .035, bed.shaker?.[1] ?? 6500);
    }
    if (bed.sparkleEvery4th) { if (b % 4 === 3) K.pluck(hz(ch[3] + 12), t + beat * 3.5, .7, .06, 1.2); }
    if (bed.perc && b > 0) { const g = bed.percGain ?? .16; K[bed.perc](t + beat, g); K[bed.perc](t + beat * 3, g); }
    if (bed.plips && b % 2 === 1) K.plipBed(t + beat * 3.5 + K.R() * .1, bed.plips);
  }
}

// "style": "night" bed: rain on glass + room tone + a sparse felt piano (4-chord loop, 1-3 notes a bar, a melody fragment every 4th bar) + a faint warm pad, all through a long reverb.
// Preset fields: bpm, prog [[bassMidi, [chord midi ×4]] ×4], seed, musicGain, rainGain/hiss/patter/ticks/drips/tickRate, roomGain, pianoGain, padGain, reverbSec, reverbWet, tailSec,
//   thinFrom/thinTo (s: piano drops to single soft notes), resolveAt (s: one warm full soft chord; `resolve` = its midi notes), resolveGain.
function playNight(K, bed) {
  if (K.music.gain.value === 0) return; // fx-only pass: nothing to build
  const {ac, hz, music, dur: DUR} = K, beat = 60 / bed.bpm, bar = beat * 4, r = rng(bed.seed ?? 20260), fade = Math.max(1.5, bed.tailSec ?? 1.5);
  const rv = K.reverb(bed.reverbSec ?? 3, bed.reverbWet ?? .55);
  K.room(bed.roomGain ?? .02);
  K.rain({g: bed.rainGain ?? 1, hiss: bed.hiss ?? .1, patter: bed.patter ?? .2, ticks: bed.ticks ?? .05, drips: bed.drips ?? .05, tickRate: bed.tickRate ?? .9, fade, rv});
  const stop = K.bedEnd - .8, mk = (g, send) => { const b = ac.createGain(), s = ac.createGain(); b.gain.setValueAtTime(g, 0); b.gain.setValueAtTime(g, stop); b.gain.linearRampToValueAtTime(0, DUR - .1); s.gain.value = send; b.connect(music); b.connect(s); s.connect(rv); return b; };
  const piano = mk(bed.pianoGain ?? 1, bed.pianoSend ?? .7), pad = mk(bed.padGain ?? .05, bed.padSend ?? 1);
  const thin = t => bed.thinFrom != null && t >= bed.thinFrom && t < bed.thinTo, ra = bed.resolveAt;
  const note = (m, t, d, g, vel, pan = 0) => { if (t > stop - 1 || (ra != null && t > ra - .35)) return; K.felt(hz(m), Math.max(.02, t + (r() - .5) * .04), d, g * (.92 + .16 * r()), {vel, pan, dest: piano}); };
  for (let b = 0, t = 0; t < K.bedEnd; b++, t += bar) {
    const [root, ch] = bed.prog[b % bed.prog.length];
    if (!(ra != null && t > ra - .5)) K.warm(ch.map(m => m - 12 + (bed.padShift ?? 0)), t, bar, 1, {dest: pad});
    const mel = b % 4 === 3, pick = r(), up = i => ch[i] + 12, pn = () => (r() - .5) * .7;
    if (thin(t + bar / 2)) { // emotional turn: one soft single note a bar
      if (b % 2) note(ch[1 + Math.floor(r() * 2)], t + .05, 4.5, .26, .3, pn()); else note(root + (bed.bassShift ?? 0), t, 6, .3 * (bed.bassGain ?? 1), .3);
      continue;
    }
    note(root + (bed.bassShift ?? 0), t, 6.5, (mel ? .3 : .38) * (bed.bassGain ?? 1), .4);   // bass, beat 1 (bassShift/bassGain thin the low end)
    if (b === 0) { note(ch[2], t + beat * 2, 4.5, .3, .4, pn()); continue; }
    if (mel) { // melody fragment: 2 notes in the upper voice, stepping down
      const shape = [[3, 2], [2, 1], [3, 1]][Math.floor(r() * 3)], o = [1.5, 2.75];
      shape.forEach((ci, i) => note(up(ci), t + beat * o[i], 4, .4 - i * .05, .55, .25 + pn() * .3)); continue;
    }
    if (pick < .38) { const [a, c] = [[0, 2], [1, 3], [0, 3]][Math.floor(r() * 3)]; note(ch[a], t + beat * 2, 5, .27, .45, -.15); note(ch[c], t + beat * 2 + .03, 5, .25, .45, .15); } // two-note interval
    else if (pick < .72) note(ch[1 + Math.floor(r() * 3)], t + beat * 2.5, 4.5, .3, .45, pn());
    else { note(ch[2], t + beat * 1.5, 4.5, .27, .42, pn()); note(ch[3], t + beat * 3, 4.5, .25, .42, pn()); }
  }
  if (ra != null) { const rc = bed.resolve || [41, 53, 57, 60, 64, 69]; rc.forEach((m, i) => K.felt(hz(m), ra + i * .075, 8, (bed.resolveGain ?? .36) * (i ? 1 : 1.2), {vel: .4, pan: (i - 2.5) * .12, dest: piano}));
    K.warm([41, 48, 53, 57].map(m => m), ra - .3, 3, 1.4, {dest: pad, att: 1.4, rel: 1.5}); }
}

window.renderScore = async ({dur, cues}, only, bed) => {
  const sr = 48000, ac = new OfflineAudioContext(2, Math.ceil(sr * dur), sr);
  const K = makeKit(ac, dur, only, bed);
  playBed(K, bed);
  for (const c of cues) { const fn = SFX[c.type]; if (fn) fn(K, c.t); else console.warn('missing sfx', c.type); }
  const buf = await ac.startRendering(), n = buf.length, L = buf.getChannelData(0), Rr = buf.getChannelData(1);
  const out = new DataView(new ArrayBuffer(44 + n * 4)), w = (o, s) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
  out.setUint32(24, sr, true); out.setUint32(28, sr * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { out.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); out.setInt16(46 + i * 4, Math.max(-1, Math.min(1, Rr[i])) * 32767, true); }
  const u = new Uint8Array(out.buffer); let b = ''; for (let k = 0; k < u.length; k += 32768) b += String.fromCharCode.apply(null, u.subarray(k, k + 32768));
  return btoa(b);
};
