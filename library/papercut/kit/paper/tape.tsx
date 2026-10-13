// Tape corners: two strips of paper tape across the top corners of a card, so a wall-hung prop is never loose.
// (x, y, w, h) = the card's box and `rot` its own tilt (about its centre, like NumberCard / PRCard).
import React from 'react';
import {C} from '../tokens';
import {Paper, Slab} from './kit';

export const TapeCorners: React.FC<{x: number; y: number; w: number; h?: number; rot?: number; len?: number}> = ({x, y, w, h = 0, rot = 0, len = 64}) => (
  <div style={{position: 'absolute', inset: 0, transformOrigin: `${x + w / 2}px ${y + h / 2}px`, rotate: `${rot}deg`}}>
    <Paper lift={3}>
      <Slab x={x - len * 0.2} y={y - 8} w={len} h={22} color={C.tape} rot={-32} r={2} style={{opacity: 0.92}} />
      <Slab x={x + w - len * 0.8} y={y - 8} w={len} h={22} color={C.tape} rot={32} r={2} style={{opacity: 0.92}} />
    </Paper>
  </div>
);
