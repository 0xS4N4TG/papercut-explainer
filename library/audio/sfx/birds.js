// @sfx birds | nature, ambience | 1.2 | soft garden birds: 4 short sine chirps with fast pitch glides, quiet, sparse | papercut-explainer
SFX['birds'] = (K, t) => {
  const chirp = (d, f, g) => { K.tone(f, t + d, .055, {g, f2: f * 1.5}); K.tone(f * 1.5, t + d + .055, .05, {g: g * .8, f2: f * 1.15}); };
  chirp(0, 3000, .45); chirp(.14, 3400, .4);
  chirp(.62, 2600, .34);
  chirp(1.0, 3200, .3);
};
