// Shared papercut palette by role: neutrals, props, cast, captions, signals, room walls, fonts, timings.
// Episode themes extend this in their own src/theme.ts (e.g. role or category colours); never edit the synced copy.
import './fonts';   // local font files, loaded before any frame renders (see fonts.ts)

export const C = {
  // neutrals
  cream: '#DACEC0', creamHi: '#E8DFD3', creamLo: '#BFB2A2', tape: '#C3B284', ink: '#1C1B17', inkSoft: '#3A3832',
  // props
  wood: '#7F5231', woodLo: '#5E3B22', woodHi: '#95653F', floor: '#4A3020', floorLo: '#36221A',
  brass: '#C89B4A', brassLo: '#9C7433', metal: '#B1B9BC', metalLo: '#8C9598',
  board: '#2E3235', boardLo: '#202326', boardHi: '#3E4347', sage: '#8A9A86', sageLo: '#667563',
  screen: '#1B1726', screenHi: '#2A2438', screenText: '#E9E2F2', screenDim: '#8E86A0',
  // cast: everyone is the same clay critter; `hero` is the default body colour, `you` the viewer stand-in (same colour)
  hero: '#D67354', heroLo: '#A9553B', you: '#D67354', youLo: '#A9553B',
  cap: '#3968AD', capLo: '#284C80',
  // captions
  tag: '#C9573C', tagText: '#F3E6D3', purple: '#4E3881',
  // signals (each with a dim twin)
  go: '#2DA34D', goDim: '#165329', nogo: '#D63A2B', nogoDim: '#4D140D', amber: '#F3A53B', amberDim: '#6B4716',
  sparkYellow: '#F5C542', sparkPink: '#F4A7B9',
  // accent for rebuilt UI buttons and progress bars
  brand: '#2563EB', brandLo: '#1A47A8',
};

// Room wall colours: rotate one per set so every cut reads as a new idea.
export const ROOM = {
  sage: '#7E8C78', navy: '#27324A', khaki: '#8A7A60', slate: '#4E6378', purple: '#5B4A6E',
  teal: '#2F5A5A', terracotta: '#9A5A42', mustard: '#A88A45', grey: '#6E6A64', dusk: '#5D7896',
} as const;
export type RoomColor = keyof typeof ROOM;

export const FONT = {banner: 'Archivo Black', caption: 'Fraunces', label: 'Inter', mono: 'JetBrains Mono'};

export const T = {pop: 8, wordPop: 4, slide: 10, press: 6, blinkHz: 4};
export const W = 1080;
export const H = 1920;
