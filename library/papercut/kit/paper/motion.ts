// Small keyframe helpers every hand-animated scene reuses (so scene files do not each carry a copy).
// keyed = piecewise eased value through [frame, value] keys; swing = decaying follow-through; onN = stepped "on twos";
// clamp01 and lcg are the usual 0-1 clamp and a seeded random.
import {Easing} from 'remotion';

/** Piecewise value through [frame, value] keys with an ease on each segment. */
export const keyed = (f: number, keys: [number, number][], ease: (t: number) => number = Easing.out(Easing.cubic)) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb] = keys[i];
      return va + (vb - va) * ease((f - a) / Math.max(1, b - a));
    }
  }
  return keys[keys.length - 1][1];
};
/** A decaying swing that starts at frame `at` (pendulum follow-through: 2 cycles, then still). */
export const swing = (f: number, at: number, amp: number, tau = 9, period = 14) =>
  f < at ? 0 : amp * Math.exp(-(f - at) / tau) * Math.sin(((f - at) / period) * Math.PI * 2);
/** Hold each value for `n` frames (hand-made, stepped motion). */
export const onN = (f: number, n = 2) => f - (f % n);
/** Clamp to 0-1. */
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Seeded random in [0, 1) from a counter. */
export const lcg = (seed: number) => { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; };
