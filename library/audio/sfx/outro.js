// @sfx outro | music, ending | 1.9 | rising arpeggio of the bed's outro notes (bed preset `outro`), lands ~40 frames before the end | papercut-explainer
SFX['outro'] = (K, t) => (K.bed.outro || [69, 72, 76, 81, 84]).forEach((m, k) => K.pluck(K.hz(m), t + k * .09, 1.5, .13, 1.1, true));
