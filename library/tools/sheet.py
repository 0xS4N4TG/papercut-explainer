# Labelled contact sheet: sheet.py DIR OUTPREFIX NTH PER_SHEET COLS WIDTH [FRAME_OFFSET]
# Labels show absolute frame numbers (offset + index * NTH).
import sys, glob
from PIL import Image, ImageDraw
d, outp, nth, per, cols, W = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6])
off = int(sys.argv[7]) if len(sys.argv) > 7 else 0
fs = sorted(glob.glob(f"{d}/element-*.jpeg"), key=lambda p: int(p.rsplit('-', 1)[1].split('.')[0]))
for s in range(0, len(fs), per):
    chunk = fs[s:s + per]; ims = []
    for f in chunk:
        im = Image.open(f); im = im.resize((W, round(im.height * W / im.width)))
        n = off + int(f.rsplit('-', 1)[1].split('.')[0]) * nth
        ImageDraw.Draw(im).rectangle([0, 0, 64, 22], fill='black'); ImageDraw.Draw(im).text((4, 4), f"f{n}", fill='yellow')
        ims.append(im)
    w, h = ims[0].size; rows = (len(ims) + cols - 1) // cols
    sh = Image.new('RGB', (w * cols, h * rows), 'white')
    for i, im in enumerate(ims): sh.paste(im, ((i % cols) * w, (i // cols) * h))
    p = f"{outp}_{s // per}.jpg"; sh.save(p, quality=82); print(p, len(ims), sh.size)
