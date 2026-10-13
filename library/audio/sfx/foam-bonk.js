// @sfx foam-bonk | impact, comic | 0.2 | foam sword bonk: soft hollow "bwop" with a muffled thump and a tiny squeak of foam, no sharp transient | papercut-explainer
SFX['foam-bonk'] = (K, t) => {
  K.tone(210, t, .12, {g: .42, type: 'triangle', f2: 110});                                   // hollow body
  K.noise(t, .05, {g: .22, type: 'lowpass', f: 700, q: .7, env: 1, seed: 1101});               // muffled thump
  K.tone(900, t + .02, .08, {g: .06, f2: 520});                                                // foam squeak
};
