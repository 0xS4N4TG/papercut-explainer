// Fonts from local files in public/fonts/: the exact woff2 files @remotion/google-fonts used to fetch at render time.
// Two problems this fixes:
//  1. Network: every render tab fetched the fonts from fonts.gstatic.com, so a Wi-Fi blip failed the whole render.
//  2. Banner jitter: TapeBanner sizes its text with fitText(). A tab that measured before the font arrived cached the
//     fallback width, so the banner jumped between two sizes from frame to frame (whichever tab rendered it).
// Every face loads under one delayRender; `fontsReady` resolves when all are in document.fonts. Measure text only after it.
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

const LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';
const FACES: [family: string, weight: string, file: string][] = [
  ['Archivo Black', '400', 'archivo-black-400'],
  ['Fraunces', '900', 'fraunces-900'],
  ['Inter', '800', 'inter-800'],
  ['JetBrains Mono', '700', 'jetbrains-mono-700'],
];

let loaded = false;
const handle = delayRender('Loading local fonts (public/fonts)');
/** Resolves once every kit font is loaded and added to document.fonts. */
export const fontsReady: Promise<void> = Promise.all(
  FACES.flatMap(([family, weight, file]) => [['latin', LATIN], ['latin-ext', LATIN_EXT]].map(async ([sub, range]) => {
    const face = new FontFace(family, `url(${staticFile(`fonts/${file}-${sub}.woff2`)}) format('woff2')`, {weight, style: 'normal', unicodeRange: range, display: 'block'});
    document.fonts.add(await face.load());
  })),
).then(() => {
  loaded = true;
  continueRender(handle);
}).catch((err) => cancelRender(err));

/** True once fontsReady has resolved (synchronous check for components). */
export const fontsLoaded = () => loaded;
