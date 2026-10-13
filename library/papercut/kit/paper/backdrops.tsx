// Backdrops: 24 paper-diorama sets (1080x1920 JPEGs in public/bg/backdrops/) to use instead of <Room>, so each scene can sit in its own place.
// Layout contract for every set: floor line near y 1420 (measured per set in BACKDROPS), calm middle band for props and UI, calm top for the banner,
// plain bottom for captions, light from the top-left, no people or text baked in. Stand props and critters on BACKDROPS[name].floorY.
// Catalogue with descriptions and bestFor: public/bg/backdrops/backdrops.json (also listed in lib/papercut/CATALOG.md).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

// Every backdrop name with its measured floor line (px y at 1080x1920) and mood (day, night, warm, cool). Props and critters stand on floorY.
export const BACKDROPS = {
  'gamer-bedroom': {floorY: 1379, mood: 'night'},
  'server-room': {floorY: 1435, mood: 'cool'},
  'home-office-day': {floorY: 1432, mood: 'day'},
  'cafe': {floorY: 1481, mood: 'warm'},
  'startup-office': {floorY: 1289, mood: 'day'},
  'rooftop-day': {floorY: 1501, mood: 'day'},
  'city-street-night': {floorY: 1430, mood: 'night'},
  'garage-workshop': {floorY: 1452, mood: 'warm'},
  'library': {floorY: 1414, mood: 'warm'},
  'classroom': {floorY: 1519, mood: 'day'},
  'lab': {floorY: 1469, mood: 'cool'},
  'stage-spotlight': {floorY: 1438, mood: 'warm'},
  'kitchen': {floorY: 1530, mood: 'day'},
  'park-day': {floorY: 1419, mood: 'day'},
  'art-gallery': {floorY: 1420, mood: 'day'},
  'gallery-lobby': {floorY: 1420, mood: 'cool'},
  'courtroom': {floorY: 1450, mood: 'warm'},
  'bank-vault': {floorY: 1450, mood: 'cool'},
  'warehouse': {floorY: 1450, mood: 'warm'},
  'mission-control': {floorY: 1440, mood: 'night'},
  'airport-gate': {floorY: 1440, mood: 'day'},
  'subway-platform': {floorY: 1440, mood: 'night'},
  'diner': {floorY: 1440, mood: 'warm'},
  'bedroom-day': {floorY: 1450, mood: 'day'},
} as const;

// Union of the backdrop names, for typing a scene's `backdrop` prop.
export type BackdropName = keyof typeof BACKDROPS;

// Backdrop: full-frame generated set (object-fit cover), a drop-in for <Room>. Optional `tint` multiplies a colour over it, `dim` (0-1) darkens it toward black.
export const Backdrop: React.FC<{name: BackdropName; tint?: string; dim?: number}> = ({name, tint, dim = 0}) => (
  <AbsoluteFill>
    <Img src={staticFile(`bg/backdrops/${name}.jpg`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
    {tint ? <AbsoluteFill style={{backgroundColor: tint, mixBlendMode: 'multiply'}} /> : null}
    {dim > 0 ? <AbsoluteFill style={{backgroundColor: '#000', opacity: Math.min(1, dim)}} /> : null}
  </AbsoluteFill>
);
