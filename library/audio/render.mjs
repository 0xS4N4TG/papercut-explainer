// Render a reel's music bed + foley offline in headless Chrome, from the shared library.
//   usage (from a Remotion project dir):
//     node $PAPERCUT_LIB/audio/render.mjs [--cues tools/cues.json] [--bed <preset name | path.json>] [--out public/audio]
//   The bed defaults to episode.json's "bed". Only the SFX files the cue sheet uses are loaded.
//   Needs puppeteer-core (in the project's devDependencies) and a Chrome or Chromium binary: set CHROME_PATH, or it tries the
//   usual macOS and Linux install paths.
//   Writes <out>/music.wav and <out>/fx.wav (separate so the music can duck under the voice).
import {createRequire} from 'node:module';
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const LIB = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const ep = existsSync('episode.json') ? JSON.parse(readFileSync('episode.json', 'utf8')) : {};
const cuesPath = arg('--cues', 'tools/cues.json'), outDir = arg('--out', 'public/audio');
const bedArg = arg('--bed', ep.bed || 'marimba-Am-120');
const bedPath = bedArg.endsWith('.json') ? bedArg : path.join(LIB, 'beds', `${bedArg}.json`);
const bed = JSON.parse(readFileSync(bedPath, 'utf8'));
const cues = JSON.parse(readFileSync(cuesPath, 'utf8'));

const types = [...new Set(cues.cues.map((c) => c.type))];
const missing = types.filter((t) => !existsSync(path.join(LIB, 'sfx', `${t}.js`)));
if (missing.length) { console.error('No SFX file for:', missing.join(', '), '(see audio/CATALOG.md, or add audio/sfx/<name>.js)'); process.exit(1); }
const js = [readFileSync(path.join(LIB, 'engine.js'), 'utf8'), ...types.map((t) => readFileSync(path.join(LIB, 'sfx', `${t}.js`), 'utf8'))].join('\n');

// puppeteer-core: from the project if it has it, else from the library's template project (if its dependencies are installed)
const chromePath = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => p && existsSync(p));
if (!chromePath) { console.error('No Chrome/Chromium found: set CHROME_PATH to the browser binary'); process.exit(1); }
const tryReq = (base) => { try { return createRequire(base)('puppeteer-core'); } catch { return null; } };
const puppeteer = tryReq(path.resolve('package.json')) || tryReq(path.join(LIB, '..', 'papercut', 'template', 'package.json'));
if (!puppeteer) { console.error('puppeteer-core not found: npm i -D puppeteer-core@24 in the project'); process.exit(1); }
const browser = await puppeteer.launch({executablePath: chromePath, headless: true, args: process.getuid?.() === 0 ? ['--no-sandbox'] : []});
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'warn' || m.type() === 'error') console.error('[page]', m.text()); });
await page.setContent(`<!doctype html><meta charset="utf-8"><script>${js}</script>`);
mkdirSync(outDir, {recursive: true});
for (const only of ['music', 'fx']) {
  const b64 = await page.evaluate((c, o, b) => window.renderScore(c, o, b), cues, only, bed);
  writeFileSync(path.join(outDir, `${only}.wav`), Buffer.from(b64, 'base64'));
}
await browser.close();
console.log(`${outDir}/music.wav + fx.wav`, cues.dur.toFixed(2), 's | bed', path.basename(bedPath), '|', types.length, 'sfx types,', cues.cues.length, 'cues');
