# Objective proxies for voice quality: median pitch, pitch spread (expressiveness), voiced fraction, clipping.
#   usage: python analyze.py a.wav b.wav ... > pitch.txt     (needs librosa + numpy; pick.py reads the table)
import sys, numpy as np, librosa
print(f"{'file':42s} dur  f0med  f0IQR(st) voiced  peak  rms")
for p in sys.argv[1:]:
    y, sr = librosa.load(p, sr=24000)
    f0, vf, _ = librosa.pyin(y, fmin=70, fmax=700, sr=sr, frame_length=1024)
    f0 = f0[vf & ~np.isnan(f0)]
    st = 12 * np.log2(f0 / np.median(f0)) if len(f0) else np.array([0])
    print(f"{p.split('/')[-1]:42s} {len(y)/sr:4.1f} {np.median(f0) if len(f0) else 0:6.0f} {np.subtract(*np.percentile(st,[90,10])):8.1f} {vf.mean():6.2f} {np.abs(y).max():5.2f} {np.sqrt((y**2).mean()):.3f}")
