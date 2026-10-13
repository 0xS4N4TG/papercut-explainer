// Capture a real web page as a PNG for the papercut "proof" beat (kit/paper/proof.tsx <RealShot>).
//   usage (from any Remotion project dir):
//     node $PAPERCUT_LIB/tools/capture.mjs <url> <out.png> [--w 1280] [--h 900] [--clip x,y,w,h] [--scale 2] [--wait ms] [--full] [--hide "css selector, ..."]
//   <out.png> is written relative to the current dir; put it under the project's public/ (e.g. public/proof/glow.png) and pass
//   `proof/glow.png` to <RealShot src>. --w/--h = viewport in CSS px, --clip = region of the page to keep (CSS px, page coordinates),
//   --scale = device pixel ratio (2 = sharp on a 1080-wide reel), --wait = extra ms after load, --full = whole page height,
//   --hide = CSS selectors to remove first (cookie banners, sticky bars). Prints the pixel size and the height/width ratio RealShot wants.
// puppeteer-core is found the same way as audio/render.mjs: from the project if it has it, else from the template project.
// Needs a Chrome or Chromium binary: set CHROME_PATH, or it tries the usual macOS and Linux install paths.
import {createRequire} from 'node:module';
import {existsSync, mkdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const LIB = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const VALUE_FLAGS = ['--w', '--h', '--clip', '--scale', '--wait', '--hide'];
const pos = args.filter((a, i) => !a.startsWith('--') && !VALUE_FLAGS.includes(args[i - 1]));
const [url, out] = pos;
if (!url || !out) { console.error('usage: node capture.mjs <url> <out.png> [--w 1280] [--h 900] [--clip x,y,w,h] [--scale 2] [--wait ms] [--full] [--hide "sel, sel"]'); process.exit(1); }

const W = +arg('--w', 1280), H = +arg('--h', 900), scale = +arg('--scale', 2), wait = +arg('--wait', 1200);
const clip = arg('--clip', null)?.split(',').map(Number);
if (clip && (clip.length !== 4 || clip.some(Number.isNaN))) { console.error('--clip needs x,y,w,h'); process.exit(1); }

const tryReq = (base) => { try { return createRequire(base)('puppeteer-core'); } catch { return null; } };
const puppeteer = tryReq(path.resolve('package.json')) || tryReq(path.join(LIB, 'papercut', 'template', 'package.json'));
if (!puppeteer) { console.error('puppeteer-core not found: npm i -D puppeteer-core@24 in the project'); process.exit(1); }

const chromePath = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => p && existsSync(p));
if (!chromePath) { console.error('No Chrome/Chromium found: set CHROME_PATH to the browser binary'); process.exit(1); }
const browser = await puppeteer.launch({executablePath: chromePath, headless: true, args: ['--hide-scrollbars']});
try {
  const page = await browser.newPage();
  await page.setViewport({width: W, height: H, deviceScaleFactor: scale});
  await page.goto(url, {waitUntil: 'networkidle2', timeout: 60000});
  await new Promise((r) => setTimeout(r, wait));
  const hide = arg('--hide', '');
  if (hide) await page.addStyleTag({content: `${hide} { display: none !important; }`});
  mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
  const opts = {path: path.resolve(out), type: 'png'};
  if (clip) { opts.clip = {x: clip[0], y: clip[1], width: clip[2], height: clip[3]}; opts.captureBeyondViewport = true; }
  else if (flag('--full')) opts.fullPage = true;
  await page.screenshot(opts);
  const png = readFileSync(path.resolve(out));   // IHDR holds the pixel size
  const pw = png.readUInt32BE(16), ph = png.readUInt32BE(20);
  console.log(`${out}  ${pw}x${ph}px, ${Math.round(statSync(path.resolve(out)).size / 1024)} KB  ->  <RealShot src="${path.relative(path.resolve('public'), path.resolve(out))}" ratio={${(ph / pw).toFixed(4)}} />`);
} finally {
  await browser.close();
}
