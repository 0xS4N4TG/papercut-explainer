// @sfx rope-tap | foley, impact | 0.14 | jump rope slapping the ground: soft dull slap with a tiny whip-zip before it (quiet, slow-rhythm friendly) | papercut-explainer
SFX['rope-tap'] = (K, t) => {
  K.noise(t, .05, {g: .14, type: 'bandpass', f: 2600, f2: 5200, q: 1.2, env: 1, seed: 961});               // zip
  K.noise(t + .065, .06, {g: .6, type: 'lowpass', f: 650, q: .7, seed: 962}); K.tone(130, t + .065, .08, {g: .4, f2: 70}); // dull slap
};
