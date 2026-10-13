// @sfx poof | comic, paper | 0.35 | knocked-out critter turns into a puff of confetti dust: soft breathy puff with a tiny glittery tail | papercut-explainer
SFX['poof'] = (K, t) => {
  K.noise(t, .18, {g: .32, type: 'lowpass', f: 1400, f2: 500, q: .6, env: 1, seed: 1111});     // the puff
  K.tone(160, t, .14, {g: .2, type: 'triangle', f2: 70});
  [.1, .15, .2, .26].forEach((d, k) => K.tone(2400 + k * 420, t + d, .05, {g: .05 - k * .008})); // confetti glints
};
