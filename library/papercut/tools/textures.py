# Procedural paper and film textures (no image model, no third-party material). Everything is generated from fixed seeds,
# so a re-run reproduces the same files.
#   Film look, public/bg/textures/ (used by kit/paper/look.tsx; the filenames are what the code loads):
#     graph-paper.jpg      1080x1920  teal quad-ruled graph paper on warm off-white; GraphPaper backdrop / card surface (normal blend)
#     halftone-scan.jpg    1080x1920  mid-grey print scan: mottle, grain, faint 45 degree dot screen, fibres; Halftone (multiply, 0.2-0.4)
#     lens-dirt.jpg        1080x1920  near-black blue smudges, fingerprints, dust and scratches; LensDirt (screen, 0.35)
#     paper-scan-dark.jpg  2160x1441  dark film-scan grain, dust, hairline scratches; set dressing (screen, 0.35, 'auto 2200px')
#     felt-fibre.mp4       720x1280   62 frames at 12 fps (5.17 s = Loop durationInFrames=155 at 30 fps): dark felt nap with loose
#                                     curly fibres that tremble and fade; FeltFibre crushes the grey (contrast 3.2) and screens it
#                                     on at 0.3. Frame 0 follows frame 61 seamlessly. Needs ffmpeg on PATH.
#   Base paper, only on request (--base):
#     public/bg/grain.png      fine tooth + short fibres, tiles at 520 px on every paper piece
#     public/assets/wall.png   mottled construction-paper wall: soft blotches + fibres + faint speckle
# usage (numpy + Pillow; ffmpeg for the felt loop):
#   python tools/textures.py                        the five film-look textures -> public/bg/textures/
#   python tools/textures.py felt-fibre lens-dirt   only those
#   python tools/textures.py --base                 the five, plus grain.png and wall.png
#   python tools/textures.py base                   only grain.png and wall.png (the old behaviour)
#   python tools/textures.py --out DIR              write under DIR/bg, DIR/assets instead of public/
import argparse
import math
import os
import shutil
import subprocess
import sys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(HERE, '..', 'public')
rng = np.random.default_rng(7)   # base paper only; make_base() reseeds it so grain.png / wall.png never change


# ---------- base paper (grain.png, wall.png) ----------

def value_noise(n, cells):
    """Smooth tileable noise: random grid upsampled with cosine interpolation."""
    g = rng.random((cells, cells))
    g = np.vstack([g, g[:1]]); g = np.hstack([g, g[:, :1]])
    t = np.linspace(0, cells, n, endpoint=False)
    i = t.astype(int); f = t - i
    f = (1 - np.cos(f * np.pi)) / 2
    a = g[i][:, i]; b = g[i][:, i + 1]; c = g[i + 1][:, i]; d = g[i + 1][:, i + 1]
    fx = f[None, :]; fy = f[:, None]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def fibres(n, count, length, width, strength):
    """Short, slightly curved fibres, drawn as soft dark/light strokes (wraps at the edges)."""
    out = np.zeros((n, n))
    for _ in range(count):
        x, y = rng.random(2) * n
        ang = rng.random() * np.pi
        L = length * (0.5 + rng.random())
        s = (1 if rng.random() < 0.55 else -1) * strength * (0.4 + rng.random())
        curve = (rng.random() - 0.5) * 0.02
        for k in range(int(L)):
            a = ang + curve * k
            px = int(x + np.cos(a) * k) % n; py = int(y + np.sin(a) * k) % n
            for w in range(-width, width + 1):
                out[(py + w) % n, px] += s * (1 - abs(w) / (width + 1))
    return out


def shown(path):
    rel = os.path.relpath(path)
    return path if rel.startswith('..') else rel


def save_png(arr, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).convert('RGB').save(path)
    print(shown(path), arr.shape, f"mean {arr.mean():.0f} std {arr.std():.1f}")


def make_base(out):
    global rng
    rng = np.random.default_rng(7)
    n = 1024
    tooth = rng.normal(0, 1, (n, n))
    tooth = (tooth + np.roll(tooth, 1, 0) + np.roll(tooth, 1, 1)) / 3            # slightly soft tooth
    grain = 226 + 9 * tooth + 10 * (value_noise(n, 16) - 0.5) + 6 * (value_noise(n, 64) - 0.5)
    grain += fibres(n, 900, 26, 0, 9)
    save_png(grain, os.path.join(out, 'bg', 'grain.png'))

    wall = 222 + 26 * (value_noise(n, 5) - 0.5) + 14 * (value_noise(n, 13) - 0.5) + 6 * (value_noise(n, 40) - 0.5)
    wall += 4 * rng.normal(0, 1, (n, n))
    wall += fibres(n, 1400, 34, 1, 5)
    speck = rng.random((n, n)) > 0.9994
    wall[speck] -= 40
    save_png(wall, os.path.join(out, 'assets', 'wall.png'))


# ---------- helpers for the film-look textures ----------

def fbm(r, shape, beta=2.0, lo=0.0, hi=0.5, stretch=(1.0, 1.0)):
    """Band-limited power-law noise, zero mean and unit std. Wraps at the edges. lo/hi are cycles per pixel (1/wavelength);
    beta = spectral slope (0 white, 2 cloudy, 3 smooth); stretch = (y, x) elongation of the features."""
    h, w = shape
    fy = np.fft.fftfreq(h)[:, None] * stretch[0]
    fx = np.fft.rfftfreq(w)[None, :] * stretch[1]
    f = np.hypot(fx, fy)
    f[0, 0] = 1.0
    amp = f ** (-beta / 2)
    if lo > 0: amp = amp / (1 + (lo / f) ** 4)
    if hi < 0.5: amp = amp / (1 + (f / hi) ** 4)
    amp[0, 0] = 0.0
    a = np.fft.irfft2(np.fft.rfft2(r.standard_normal(shape)) * amp, s=shape)
    return (a - a.mean()) / (a.std() + 1e-12)


def blur(a, sigma):
    """Gaussian blur through the FFT (wraps at the edges); works on (h, w) and (h, w, c)."""
    if a.ndim == 3: return np.dstack([blur(a[..., i], sigma) for i in range(a.shape[2])])
    h, w = a.shape
    fy = np.fft.fftfreq(h)[:, None]; fx = np.fft.rfftfreq(w)[None, :]
    return np.fft.irfft2(np.fft.rfft2(a) * np.exp(-2 * (np.pi * sigma) ** 2 * (fx ** 2 + fy ** 2)), s=(h, w))


def draw_layer(shape, fn, ss=2):
    """Anti-aliased drawing: fn(draw, ss) paints 0-255 values on a supersampled canvas; returns a 0-1 float array."""
    h, w = shape
    im = Image.new('L', (w * ss, h * ss), 0)
    fn(ImageDraw.Draw(im), ss)
    if ss > 1: im = im.resize((w, h), Image.BOX)
    return np.asarray(im, dtype=np.float64) / 255.0


def walk(r, x, y, ang, length, step=2.0, curl=0.08, relax=0.9):
    """A wandering path with persistent curvature (hair, thread or scratch)."""
    pts = [(x, y)]; curv = 0.0
    for _ in range(max(2, int(length / step))):
        curv = relax * curv + r.normal(0, curl)
        ang += curv
        x += math.cos(ang) * step; y += math.sin(ang) * step
        pts.append((x, y))
    return np.array(pts)


def smooth_field(r, n, amp):
    """A smooth random 2D offset per path point, peak `amp` px."""
    a = np.cumsum(r.normal(0, 1, (n, 2)), axis=0)
    a = np.stack([np.convolve(np.pad(a[:, j], 4, mode='edge'), np.ones(9) / 9, 'valid') for j in range(2)], 1)
    a -= a.mean(0)
    return amp * a / (np.abs(a).max() + 1e-9)


def strokes(r, shape, count, length, width, curl, value, relax=0.9, angle=None, spread=math.pi):
    """`count` thin curly marks; length/value are (min, max); angle None = any direction."""
    h, w = shape

    def paint(d, ss):
        for _ in range(count):
            a = r.random() * 2 * math.pi if angle is None else angle + r.normal(0, spread)
            p = walk(r, r.random() * w, r.random() * h, a, r.uniform(*length), 2.0, curl, relax) * ss
            d.line([tuple(q) for q in p], fill=int(r.uniform(*value)), width=max(1, int(round(width * ss))))
    return draw_layer(shape, paint)


def specks(r, shape, count, radius, value):
    """Round dust specks; radius and value are (min, max), radius in px; most are small (squared draw)."""
    h, w = shape

    def paint(d, ss):
        for _ in range(count):
            x, y = r.random() * w * ss, r.random() * h * ss
            rad = (radius[0] + (radius[1] - radius[0]) * r.random() ** 3) * ss
            d.ellipse([x - rad, y - rad, x + rad, y + rad], fill=int(r.uniform(*value)))
    return draw_layer(shape, paint)


def screen(base, top):
    return 255 - (255 - base) * (255 - top) / 255


def save_jpg(arr, path, quality=85, subsampling=2):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    a = np.clip(arr + 0.5, 0, 255).astype(np.uint8)
    Image.fromarray(a if a.ndim == 3 else np.dstack([a] * 3)).save(path, quality=quality, optimize=True, subsampling=subsampling)
    print(shown(path), f"{a.shape[1]}x{a.shape[0]}", f"mean {arr.mean():.0f}", f"{os.path.getsize(path) / 1024:.0f} KB")


# ---------- graph-paper.jpg ----------

def make_graph_paper(r, path, w=1080, h=1920):
    shape = (h, w)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    pitch = 54.0
    a = math.radians(0.14)                                     # a hair of skew, as if scanned
    u = xx * math.cos(a) + yy * math.sin(a) + 0.9 * fbm(r, shape, 3, 0.0006, 0.004) + r.uniform(0, pitch)
    v = -xx * math.sin(a) + yy * math.cos(a) + 0.9 * fbm(r, shape, 3, 0.0006, 0.004) + r.uniform(0, pitch)

    def rule(t):
        d = np.abs(((t + pitch / 2) % pitch) - pitch / 2)
        idx = np.floor((t + pitch / 2) / pitch).astype(int)
        idx -= idx.min()
        amp = 0.78 + 0.22 * r.random(idx.max() + 1)           # each printed rule is a touch lighter or darker
        return np.exp(-0.5 * (d / 0.8) ** 2) * amp[idx]
    lines = np.maximum(rule(u), rule(v))
    ink = np.clip(0.82 + 0.11 * fbm(r, shape, 2, 0.004, 0.08) + 0.07 * fbm(r, shape, 0, 0.2, 0.5), 0.5, 1.0)
    alpha = 0.66 * lines * ink

    paper = np.array([221.0, 218.0, 207.0])[None, None, :] * np.ones((h, w, 1))
    shade = 4.0 * fbm(r, shape, 3, 0.0005, 0.006) + 1.3 * fbm(r, shape, 2, 0.01, 0.06)
    tooth = 2.4 * blur(r.standard_normal(shape), 0.6)
    fib = strokes(r, shape, 520, (10, 36), 0.5, 0.08, (70, 150), relax=0.8) - strokes(r, shape, 260, (10, 30), 0.5, 0.08, (40, 100), relax=0.8)
    dust = specks(r, shape, 60, (0.6, 2.2), (90, 190))
    rad = ((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2
    paper += (shade + tooth + 5.0 * fib - 40 * dust)[..., None] * np.array([1.0, 1.0, 1.05])
    paper *= (1 - 0.045 * rad)[..., None]
    absorb = np.array([0.88, 0.40, 0.36])                      # teal ink: absorbs red most
    out = paper * (1 - alpha[..., None] * absorb)
    save_jpg(out, path, subsampling=0)


# ---------- halftone-scan.jpg ----------

def make_halftone(r, path, w=1080, h=1920):
    shape = (h, w)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    mottle = 3.0 * fbm(r, shape, 2.6, 0.0015, 0.03, stretch=(3, 1)) + 2.6 * fbm(r, shape, 3, 0.0008, 0.006)
    grain = 7.5 * blur(r.standard_normal(shape), 0.6) + 2.5 * blur(r.standard_normal(shape), 2.0) * 3
    s = (xx + yy) / math.sqrt(2); t = (xx - yy) / math.sqrt(2); p = 7.0                     # 45 degree dot screen
    dots = (np.cos(2 * np.pi * s / p) + np.cos(2 * np.pi * t / p)) / 2
    dots *= 2.8 * (0.7 + 0.3 * fbm(r, shape, 2.5, 0.002, 0.03))
    fib = strokes(r, shape, 230, (10, 46), 0.8, 0.05, (120, 255), relax=0.86)              # pale curly fibres
    dark = specks(r, shape, 90, (0.5, 1.8), (150, 255))
    streak = np.zeros(shape)                                                                # a few faint vertical scan streaks
    for _ in range(6):
        x = int(r.integers(30, w - 30)); y0 = int(r.integers(0, h // 2)); y1 = int(min(h, y0 + r.integers(h // 4, h)))
        streak[y0:y1, x] += r.choice([-1, 1]) * r.uniform(5, 11)
    streak = blur(streak, 0.9) * (0.6 + 0.4 * fbm(r, shape, 2, 0.002, 0.05))
    out = 146 + mottle + grain + dots + 34 * fib - 36 * dark + streak
    save_jpg(out, path)


# ---------- lens-dirt.jpg ----------

def fingerprint(r, shape, cx, cy, rx, ry, rot, pitch, strength):
    """A smudged whorl of ridges (0-1 float field) centred at (cx, cy)."""
    h, w = shape
    pad = int(max(rx, ry) * 1.4)
    x0, x1, y0, y1 = max(0, int(cx) - pad), min(w, int(cx) + pad), max(0, int(cy) - pad), min(h, int(cy) + pad)
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float64)
    dx, dy = xx - cx, yy - cy
    c, s = math.cos(rot), math.sin(rot)
    u = (dx * c + dy * s) / rx; v = (-dx * s + dy * c) / ry
    ph = np.hypot(u, v * (1 + 0.2 * u)) + 0.02 * fbm(r, u.shape, 3, 0.004, 0.03) + 0.12 * np.arctan2(v, u + 1.2) / (2 * np.pi)
    ridges = 0.5 + 0.5 * np.cos(2 * np.pi * ph * rx / pitch)
    ridges = np.clip((ridges - 0.3) * 1.8, 0, 1)
    mask = np.clip((1.0 - np.hypot(u, v)) * 3.0, 0, 1) * np.clip(0.55 + 0.7 * fbm(r, u.shape, 3, 0.004, 0.04), 0, 1)
    out = np.zeros(shape)
    out[y0:y1, x0:x1] = ridges * mask * strength
    return blur(out, 0.7)


def make_lens_dirt(r, path, w=1080, h=1920):
    shape = (h, w)
    # wipe marks: fat curved strokes, blurred, then streaked along the wipe direction
    def wipes(d, ss):
        for _ in range(26):
            p = walk(r, r.random() * w, r.random() * h, r.uniform(0.3, 2.9), r.uniform(240, 900), 12.0, 0.008, 0.95) * ss
            d.line([tuple(q) for q in p], fill=int(r.uniform(70, 255)), width=int(r.uniform(35, 130) * ss), joint='curve')
    smear = blur(draw_layer(shape, wipes, ss=1), 18)
    streak = np.clip(0.55 + 0.45 * fbm(r, shape, 2.2, 0.002, 0.08, stretch=(3, 1)) + 0.25 * fbm(r, shape, 1.2, 0.02, 0.3, stretch=(2, 1)), 0, 1) ** 1.2
    smear = smear * (0.3 + 0.7 * streak)
    haze = np.clip(fbm(r, shape, 3, 0.0008, 0.01) * 0.5 + 0.1, 0, 1) ** 2
    prints = fingerprint(r, shape, w * 0.28, h * 0.31, 105, 150, 0.2, 9.0, 0.5) + fingerprint(r, shape, w * 0.66, h * 0.7, 95, 135, -0.6, 9.0, 0.28)
    dust = specks(r, shape, 520, (0.5, 2.6), (80, 255))
    cluster = np.zeros(shape)
    for _ in range(3):
        cx, cy = r.random() * w, r.random() * h
        pts = np.stack([cx + r.normal(0, 28, 40), cy + r.normal(0, 22, 40)], 1)
        for px, py in pts:
            if 0 <= px < w and 0 <= py < h: cluster[int(py), int(px)] = r.uniform(0.4, 1)
    cluster = np.clip(blur(cluster, 1.0) * 9, 0, 1)
    hairs = strokes(r, shape, 14, (40, 200), 0.9, 0.012, (110, 230), relax=0.95)
    scratch = strokes(r, shape, 34, (150, 620), 0.5, 0.0012, (60, 150), relax=0.99, angle=-0.9, spread=0.4)
    base = np.array([5.0, 9.0, 13.0])
    smudge_col = np.array([86.0, 112.0, 138.0])
    out = base[None, None, :] + smear[..., None] * smudge_col * 0.5 + haze[..., None] * np.array([44.0, 58.0, 70.0]) * 0.32
    out += prints[..., None] * np.array([104.0, 124.0, 142.0])
    out += (dust + cluster)[..., None] * np.array([205.0, 208.0, 212.0]) + hairs[..., None] * np.array([150.0, 165.0, 180.0])
    out += scratch[..., None] * np.array([120.0, 135.0, 150.0])
    out += 1.6 * blur(r.standard_normal(shape), 0.8)[..., None]
    save_jpg(out, path)


# ---------- paper-scan-dark.jpg ----------

def make_paper_scan_dark(r, path, w=2160, h=1441):
    shape = (h, w)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    lit = np.clip(xx / w, 0, 1) ** 1.3 * 20 + np.clip(0.4 - yy / h, 0, 1) * 6                # lighter on the right, like an uneven scan lid
    clouds = 6.0 * fbm(r, shape, 3, 0.0004, 0.004) + 1.8 * fbm(r, shape, 2.4, 0.003, 0.02)
    grain = 4.6 * blur(r.standard_normal(shape), 0.75)
    bits = (r.random(shape) > 0.985).astype(np.float64)
    bits = blur(bits, 0.8) * 70
    ramp = np.clip((yy / h - 0.8) / 0.2, 0, 1) ** 1.5                                         # dirty speckle thickens toward the bottom edge
    dirt = blur((r.random(shape) < 0.05 * ramp).astype(np.float64), 1.0) * 140
    dust = specks(r, shape, 70, (0.7, 2.2), (150, 255))
    hairs = strokes(r, shape, 24, (20, 110), 0.9, 0.03, (90, 200), relax=0.93)
    gate = np.clip(0.6 + 0.5 * fbm(r, (1, w), 2, 0.002, 0.05), 0, 1)[0][None, :]               # scratches come and go along their length
    lines = np.zeros(shape)
    for yf, k, x0f, x1f in [(0.052, 150, 0.0, 1.0), (0.24, 52, 0.22, 0.95), (0.71, 46, 0.05, 0.8)]:
        y = int(yf * h); x0, x1 = int(x0f * w), int(x1f * w)
        lines[y, x0:x1] = k
        lines[y + 1, x0:x1] = k * 0.28
    lines = lines * gate
    vert = strokes(r, shape, 12, (120, 520), 0.5, 0.0006, (40, 110), relax=0.99, angle=math.pi / 2 + 0.05, spread=0.12)
    out = 25 + lit + clouds + grain + bits + dirt + 0.78 * dust * 255 + 0.5 * hairs * 255 + lines + 0.22 * vert * 255
    save_jpg(np.maximum(out, 3), path)


# ---------- felt-fibre.mp4 ----------

FELT_FRAMES, FELT_FPS = 62, 12


def make_felt_fibre(r, path, w=720, h=1280, n=FELT_FRAMES, fps=FELT_FPS):
    """Dark felt nap (value ~64) with loose curly fibres. All motion is periodic over n frames (the nap crossfades around a circle
    between two noise fields; each fibre wobbles, trembles and fades on integer harmonics), plus a small independent jitter and a few
    dust specks per frame, so frame 0 follows frame n-1 exactly like any other pair of frames."""
    if not shutil.which('ffmpeg'): sys.exit('felt-fibre.mp4 needs ffmpeg on PATH')
    shape = (h, w)
    napA, napB = [0.9 * fbm(r, shape, 0.9, 0.1, 0.42) + 0.55 * fbm(r, shape, 2.2, 0.015, 0.1) for _ in range(2)]
    fibs = []
    for i in range(66):                                                           # one fibre per cell of a jittered 6 x 11 grid
        length = float(np.clip(55 * math.exp(r.normal(0, 0.8)), 25, 380))
        p = walk(r, 0, 0, r.random() * 2 * math.pi, length, 3.0, 0.05, 0.92)
        p -= p.mean(0)
        wob = [smooth_field(r, len(p), 1.6) for _ in range(2)]                        # tremble fields along the fibre
        fibs.append(dict(
            p=p, wob=wob, c=(np.array([i % 6, i // 6]) + r.random(2)) * [w / 6, h / 11], val=r.uniform(130, 255), wd=int(r.choice([1, 2, 2])),
            k=r.integers(1, 4, 3), ph=r.random(4) * 2 * math.pi, amp=r.uniform(0.6, 2.4), rot=math.radians(r.uniform(0.5, 3.5)),
            kt=int(r.integers(5, 9)), gate=(int(r.integers(1, 4)), r.random() * 2 * math.pi) if r.random() < 0.35 else None))

    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'gray', '-s', f'{w}x{h}', '-r', str(fps), '-i', '-',
                           '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', path],
                          stdin=subprocess.PIPE)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    for t in range(n):
        th = 2 * math.pi * t / n
        nap = math.cos(7 * th) * napA + math.sin(7 * th) * napB
        nap = np.exp(0.6 * nap); nap = (nap - nap.mean()) / nap.std()
        frame = 64 + 10.5 * nap

        def paint(d, ss):
            for f in fibs:
                g = 1.0 if f['gate'] is None else float(np.clip((math.cos(f['gate'][0] * th + f['gate'][1]) + 0.35) / 0.7, 0, 1))
                if g <= 0.02: continue
                rot = f['rot'] * math.cos(f['k'][2] * th + f['ph'][2]) + r.normal(0, 0.004)
                c, s = math.cos(rot), math.sin(rot)
                q = f['p'] @ np.array([[c, s], [-s, c]])
                q = q + f['wob'][0] * math.cos(f['kt'] * th) + f['wob'][1] * math.sin(f['kt'] * th)
                q = q + f['c'] + f['amp'] * np.array([math.cos(f['k'][0] * th + f['ph'][0]), math.sin(f['k'][1] * th + f['ph'][1])]) + r.normal(0, 0.45, 2)
                d.line([tuple(x) for x in q * ss], fill=int(f['val'] * g), width=f['wd'], joint='curve')
            for _ in range(int(r.integers(5, 11))):                                      # film dust: only on this frame
                x, y, rad = r.random() * w * ss, r.random() * h * ss, (0.6 + 1.6 * r.random() ** 2) * ss
                d.ellipse([x - rad, y - rad, x + rad, y + rad], fill=int(r.uniform(160, 255)))
        fib = draw_layer(shape, paint)
        glow = blur(fib, 1.4) * 0.22
        frame = screen(frame, np.clip(fib + glow, 0, 1) * 255)
        ff.stdin.write(np.clip(frame + 0.5, 0, 255).astype(np.uint8).tobytes())
    ff.stdin.close()
    if ff.wait() != 0: sys.exit('ffmpeg failed')
    print(shown(path), f"{w}x{h}", f"{n} frames @ {fps} fps", f"{os.path.getsize(path) / 1024:.0f} KB")


# ---------- main ----------

FILM = {                                   # name -> (file, seed offset, generator)
    'graph-paper': ('graph-paper.jpg', 1, make_graph_paper),
    'halftone-scan': ('halftone-scan.jpg', 2, make_halftone),
    'lens-dirt': ('lens-dirt.jpg', 3, make_lens_dirt),
    'paper-scan-dark': ('paper-scan-dark.jpg', 4, make_paper_scan_dark),
    'felt-fibre': ('felt-fibre.mp4', 5, make_felt_fibre),
}
SEED = 20261013


def main():
    ap = argparse.ArgumentParser(description='Procedural paper and film textures for the papercut kit.')
    ap.add_argument('names', nargs='*', metavar='NAME', help='any of: ' + ', '.join(FILM) + ', base (grain.png + wall.png). Default: the five film-look textures')
    ap.add_argument('--base', action='store_true', help='also regenerate public/bg/grain.png and public/assets/wall.png')
    ap.add_argument('--out', default=PUBLIC, help='output root holding bg/ and assets/ (default: ../public)')
    args = ap.parse_args()
    bad = [n for n in args.names if n not in FILM and n != 'base']
    if bad: ap.error('unknown texture: ' + ', '.join(bad))
    names = args.names or list(FILM)
    out = os.path.abspath(args.out)
    for name in names:
        if name == 'base': continue
        fname, off, gen = FILM[name]
        gen(np.random.default_rng(SEED + off), os.path.join(out, 'bg', 'textures', fname))
    if args.base or 'base' in names:
        make_base(out)


if __name__ == '__main__':
    main()
