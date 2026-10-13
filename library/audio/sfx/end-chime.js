// @sfx end-chime | positive, ending | 1.4 | warm two-note resolving chime for the follow card (G to C), softer than `chime` | papercut-explainer
SFX['end-chime'] = (K, t) => {
  K.tone(783.99, t, .8, {g: .25}); K.tone(1568, t, .35, {g: .03});
  K.tone(1046.5, t + .22, 1.5, {g: .29}); K.tone(2093, t + .22, .5, {g: .03}); K.tone(523.25, t + .22, 1.3, {g: .06});
};
