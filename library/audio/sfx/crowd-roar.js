// @sfx crowd-roar | crowd, ambience | 1.4 | arena crowd swelling to a cheer and fading: shaped band-passed noise (a paper-stand murmur, not realistic) | papercut-explainer
SFX['crowd-roar'] = (K, t) => {
  K.noise(t, 1.3, {g: .22, type: 'bandpass', f: 600, f2: 1100, q: .45, env: 2, seed: 1131});    // body of the roar
  K.noise(t + .1, 1.1, {g: .1, type: 'bandpass', f: 1800, f2: 2600, q: .7, env: 2, seed: 1132}); // upper "yay" air
  K.tone(150, t, 1.2, {g: .05, type: 'triangle', f2: 190});                                      // low swell
};
