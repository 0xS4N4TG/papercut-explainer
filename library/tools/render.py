#!/usr/bin/env python3
"""Fast cached render for papercut Remotion projects (and dialogue projects, see below). render.sh calls this.

  python3 $PAPERCUT_LIB/tools/render.py [--workers 3] [--conc 4] [--force] [--keep]     (run from the Remotion project dir)
  -> out/<episode.json "out">.mp4, plus decode-error count, stream info and loudness.
  env: PAPERCUT_PY  python with numpy + soundfile, used for the audio mix (tools/mix.py). Default python3.
  Needs node/npx (Remotion), ffmpeg and ffprobe on PATH.

What makes it faster than three fresh `remotion render` chunks:
  1. Bundle once. `remotion bundle` runs only when a source file changed; every segment renders from that bundle.
  2. One segment per scene, cached. A segment's key hashes the shared files (everything except scene-owned files:
     kit, plan.json, captions, banners, public images, package-lock) plus the files its scene imports from
     src/scenes/ (S06ShowWork.tsx, S06ShowWork.parts.tsx, a shared Tape.parts.tsx...). After a fix to
     one scene, only that scene re-renders; a VO/plan/kit change re-renders everything. Audio isn't in any key.
  3. ProRes HQ intermediates (all-intra, cheap to encode, so Chrome gets the CPU), joined with the concat demuxer
     and encoded to H.264 once. The old path encoded x264 twice (chunks and final).
  4. Audio mix + loudnorm runs in parallel with the video render.
Frames are captured as JPEG q95 (Remotion's default is q80): +2.4 dB PSNR on the intermediate for ~8% more capture time.
Colour: Remotion tags ProRes bt470bg but encodes with the BT.709 matrix in limited range; checked against a
`remotion still` PNG (BT.709 in = 36.3 dB, BT.601 in = 33.3 dB after the final encode).
Dialogue projects (src/timeline.json from dialogue_timeline.py, no scenes) render as three equal segments keyed on all sources.
No template for them ships with the library; the branch is kept for projects that bring their own.
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor

LIB = os.path.dirname(os.path.abspath(__file__))
PY_AUDIO = os.environ.get('PAPERCUT_PY', 'python3')
FPS_FLAGS = ['--codec=prores', '--prores-profile=hq', '--image-format=jpeg', '--jpeg-quality=95', '--gl=angle',
             '--muted', '--timeout=120000', '--log=error']
AUDIO_EXT = ('.wav', '.mp3', '.m4a', '.aac', '.flac', '.ogg')
IMPORT_RE = re.compile(r'''(?:from|import)\s*\(?\s*['"](\.{1,2}/[^'"]+)['"]''')
CACHE = 'out/cache'


def sha(*parts):
    h = hashlib.sha1()
    for p in parts:
        h.update(p if isinstance(p, bytes) else str(p).encode())
        h.update(b'\0')
    return h.hexdigest()


def file_sha(path, memo={}):
    if path not in memo:
        with open(path, 'rb') as f:
            memo[path] = hashlib.sha1(f.read()).hexdigest()
    return memo[path]


def walk(root, skip_ext=()):
    out = []
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if not x.startswith('.') and x != 'node_modules']
        out += [os.path.normpath(os.path.join(d, f)) for f in files if not f.startswith('.') and not f.endswith(skip_ext)]
    return sorted(out)


def resolve(base, spec):
    p = os.path.normpath(os.path.join(os.path.dirname(base), spec))
    for c in (p, p + '.tsx', p + '.ts', p + '.json', p + '.js', os.path.join(p, 'index.tsx'), os.path.join(p, 'index.ts')):
        if os.path.isfile(c):
            return c
    return None


def closure(entry):
    """Local files reachable from entry through relative imports."""
    seen, todo = set(), [entry]
    while todo:
        f = todo.pop()
        if f in seen or not f:
            continue
        seen.add(f)
        if f.endswith(('.ts', '.tsx', '.js', '.jsx')):
            todo += [resolve(f, s) for s in IMPORT_RE.findall(open(f, encoding='utf-8', errors='ignore').read())]
    return seen


def segments():
    """[(name, from, frames, key_parts)] plus the total frame count and the bundle key."""
    src = walk('src')
    pub = walk('public', AUDIO_EXT) if os.path.isdir('public') else []
    conf = [f for f in ('package.json', 'package-lock.json', 'remotion.config.ts', 'tsconfig.json') if os.path.isfile(f)]
    bundle_key = sha(*[f + file_sha(f) for f in src + pub + conf])
    if os.path.isfile('src/plan.json'):
        plan = json.load(open('src/plan.json'))
        owned = {}
        for s in plan['scenes']:
            entry = f"src/scenes/{s['id']}.tsx"
            files = closure(entry) if os.path.isfile(entry) else set()
            owned[s['id']] = sorted(f for f in files if f.startswith('src/scenes/') and not f.endswith('scenes/index.ts'))
        mine = set().union(*owned.values())
        shared = sha(*[f + file_sha(f) for f in src + pub + conf if f not in mine])
        segs = [(s['id'], s['from'], s['durationInFrames'], [shared] + [f + file_sha(f) for f in owned[s['id']]])
                for s in plan['scenes']]
        return segs, plan['durationInFrames'], bundle_key
    n = json.load(open('src/timeline.json'))['dur']
    allk = sha(*[f + file_sha(f) for f in src + pub + conf])
    cuts = [0, n // 3, 2 * n // 3, n]
    return [(f'part{i}', cuts[i], cuts[i + 1] - cuts[i], [allk]) for i in range(3)], n, bundle_key


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode:
        sys.exit(f"failed: {' '.join(cmd[:6])}...\n{r.stdout[-2000:]}\n{r.stderr[-2000:]}")
    return r


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--workers', type=int, default=3, help='segments rendered at once')
    ap.add_argument('--conc', type=int, default=int(os.environ.get('CONC', 4)), help='Chrome tabs per segment')
    ap.add_argument('--force', action='store_true', help='ignore the segment cache')
    ap.add_argument('--keep', action='store_true', help='keep superseded cache files')
    a = ap.parse_args()
    t0 = time.time()
    ep = json.load(open('episode.json'))
    comp, out = ep['comp'], f"out/{ep['out']}.mp4"
    os.makedirs(f'{CACHE}/seg', exist_ok=True)
    for stale in os.listdir(f'{CACHE}/seg'):  # leftovers from an interrupted run
        if stale.startswith('_job'):
            os.remove(f'{CACHE}/seg/{stale}')
    os.makedirs('out/chunks', exist_ok=True)

    # audio in the background: mix.py, then limiter + loudnorm (as before)
    # clear old results first, so a failed audio step can never mux the previous run's audio
    for old in ('out/chunks/mix_raw.wav', 'out/chunks/audio.wav'):
        if os.path.exists(old):
            os.remove(old)
    audio_err = []

    def audio():
        try:
            run([PY_AUDIO, f'{LIB}/mix.py'])  # mix.py reads/writes relative to the project dir (cwd)
            run(['ffmpeg', '-v', 'error', '-y', '-i', 'out/chunks/mix_raw.wav', '-af',
                 'alimiter=limit=0.89:level=false,loudnorm=I=-14:TP=-1.0:LRA=11', '-ar', '48000', 'out/chunks/audio.wav'])
        except SystemExit as e:  # sys.exit inside a thread is silent; hand the message to the main thread
            audio_err.append(str(e.code))
    at = threading.Thread(target=audio)
    at.start()

    segs, n, bkey = segments()
    flags = FPS_FLAGS + [f'--concurrency={a.conc}']
    bundle = f'{CACHE}/bundle'
    kf = f'{CACHE}/bundle.key'
    fresh = os.path.isfile(f'{bundle}/index.html') and os.path.isfile(kf) and open(kf).read() == bkey
    if not fresh:
        tb = time.time()
        shutil.rmtree(bundle, ignore_errors=True)
        run(['npx', 'remotion', 'bundle', '--out-dir', bundle, '--log=error'])
        open(kf, 'w').write(bkey)
        print(f'bundle {time.time() - tb:.0f}s')
    else:
        print('bundle cached')

    jobs, files = [], []
    for name, f0, d, parts in segs:
        key = sha(comp, f0, d, ' '.join(flags), *parts)[:12]
        path = f'{CACHE}/seg/{name}-{key}.mov'
        files.append(path)
        if not a.keep:
            for old in os.listdir(f'{CACHE}/seg'):
                if old.startswith(name + '-') and f'{CACHE}/seg/{old}' != path:
                    os.remove(f'{CACHE}/seg/{old}')
        if a.force or not os.path.isfile(path):
            jobs.append((name, f0, d, path))
    todo = sum(j[2] for j in jobs)
    print(f'{len(segs) - len(jobs)}/{len(segs)} segments cached, rendering {todo} of {n} frames')

    # Each `remotion render` call costs a Chrome launch and a composition load, so dirty scenes that sit next to each
    # other render as one call, cut at scene boundaries into about `workers` calls of similar length. ProRes is
    # all-intra, so the call's output splits back into per-scene cache files with a lossless stream copy.
    target = max(1, -(-todo // a.workers))
    groups, cur = [], []
    for j in jobs:
        if cur and (cur[-1][1] + cur[-1][2] != j[1] or sum(x[2] for x in cur) >= target):
            groups.append(cur)
            cur = []
        cur.append(j)
    if cur:
        groups.append(cur)

    def render(group):
        ts = time.time()
        f0, f1 = group[0][1], group[-1][1] + group[-1][2] - 1
        tmp = f'{CACHE}/seg/_job{f0}.mov'
        run(['npx', 'remotion', 'render', bundle, comp, tmp, f'--frames={f0}-{f1}'] + flags)
        if len(group) == 1:
            os.replace(tmp, group[0][3])
        else:
            cuts = ','.join(str(j[1] - f0) for j in group[1:])
            pat = f'{CACHE}/seg/_job{f0}_%03d.mov'
            run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-map', '0', '-c', 'copy', '-f', 'segment', '-segment_frames', cuts,
                 '-reset_timestamps', '1', pat])
            for i, j in enumerate(group):
                piece = pat % i
                got = re.findall(r'\d+', run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=nb_frames',
                                              '-of', 'csv=p=0', piece]).stdout)
                if got[:1] != [str(j[2])]:
                    sys.exit(f'split error: {j[0]} has {got} frames, expected {j[2]}')
                os.replace(piece, j[3])
            os.remove(tmp)
        return f"{'+'.join(j[0] for j in group)} {f1 - f0 + 1}f {time.time() - ts:.0f}s"
    tv = time.time()
    with ThreadPoolExecutor(a.workers) as pool:  # longest first, so the pool ends together
        for msg in pool.map(render, sorted(groups, key=lambda g: -sum(j[2] for j in g))):
            print(' ', msg, flush=True)
    print(f'video segments {time.time() - tv:.0f}s')
    at.join()
    if audio_err:
        sys.exit('audio step failed:\n' + audio_err[0])

    with open(f'{CACHE}/concat.txt', 'w') as f:
        f.writelines(f"file '{os.path.abspath(p)}'\n" for p in files)
    te = time.time()
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{CACHE}/concat.txt', '-i', 'out/chunks/audio.wav',
         '-vf', 'scale=in_range=limited:out_range=limited:in_color_matrix=bt709:out_color_matrix=bt709,format=yuv420p',
         '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high', '-level', '4.2',
         '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
         '-c:a', 'aac', '-b:a', '320k', '-shortest', '-movflags', '+faststart', out])
    print(f'final encode {time.time() - te:.0f}s, total {time.time() - t0:.0f}s')

    errs = subprocess.run(['ffmpeg', '-v', 'error', '-i', out, '-f', 'null', '-'], capture_output=True, text=True).stderr
    print(f"decode errors: {len(errs.splitlines())}")
    info = run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries',
                'stream=codec_name,width,height,pix_fmt,color_range,nb_read_frames:format=duration,bit_rate', '-of', 'compact', out]).stdout
    print(info.strip().replace('\n', ' '))
    frames = re.search(r'nb_read_frames=(\d+)', info)
    if frames and int(frames.group(1)) != n:
        print(f'WARNING: {frames.group(1)} frames, plan has {n}')
    loud = subprocess.run(['ffmpeg', '-nostats', '-i', out, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    print(' '.join(' '.join(l.split()) for l in loud.splitlines() if re.match(r'^\s+(I:|Peak:)', l)))


if __name__ == '__main__':
    main()
