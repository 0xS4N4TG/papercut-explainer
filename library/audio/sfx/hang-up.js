// @sfx hang-up | tech, phone, impact | 0.45 | plastic phone handset dropped on its cradle: dry click-clack, then a very short descending dial-tone blip | papercut-explainer
SFX['hang-up'] = (K, t) => {
  K.noise(t, .02, {g: .55, type: 'bandpass', f: 2400, q: 1.2, env: 1, seed: 951}); K.tone(190, t, .05, {g: .25, type: 'triangle', f2: 110});          // click
  K.noise(t + .045, .03, {g: .5, type: 'bandpass', f: 1300, q: 1.4, env: 1, seed: 952}); K.tone(2100, t + .045, .03, {g: .08, type: 'triangle'});   // clack
  K.tone(440, t + .2, .25, {g: .15, f2: 330}); K.tone(350, t + .2, .25, {g: .15, f2: 262});                                                        // dial-tone blip, falling
};
