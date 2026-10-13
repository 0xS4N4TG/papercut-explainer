// @sfx vhs-blip | ui, tech | 0.2 | VHS/OSD tag appearing: square-wave blip + two lines of tape noise | papercut-explainer
SFX['vhs-blip'] = (K, t) => {
  K.tone(1320, t, .06, {g: .24, type: 'square'});
  K.noise(t, .03, {g: .4, type: 'bandpass', f: 4500, q: .8, env: 1, seed: 1011});
  K.noise(t + .13, .045, {g: .36, type: 'bandpass', f: 3200, q: .8, env: 1, seed: 1012});
  K.tone(990, t + .13, .06, {g: .13, type: 'square'});
};
