# Transcribe wavs with whisper-large-v3-turbo; print text + word timestamps as JSON.
#   usage: python asr.py a.wav b.wav ... > asr.json     ({path: {"text", "words": [{"w", "s", "e"}], "dur"}}, seconds)
#   backends, first one that imports wins:
#     mlx-whisper     pip install mlx-whisper       (Apple Silicon; the one this pipeline was written against)
#     faster-whisper  pip install faster-whisper    (CUDA or CPU; env FASTER_WHISPER_MODEL overrides the model name, default
#                                                    large-v3-turbo; try small.en on a slow CPU). Written later, less tested.
#   Any other ASR that writes the same JSON works too: pick.py, split_take.py and build_timing.py only read that file.
import sys, json, wave, os

try:
    import mlx_whisper

    def transcribe(p):
        r = mlx_whisper.transcribe(p, path_or_hf_repo="mlx-community/whisper-large-v3-turbo", word_timestamps=True, language="en")
        words = [{"w": w["word"].strip(), "s": round(w["start"], 3), "e": round(w["end"], 3)} for seg in r["segments"] for w in seg.get("words", [])]
        return r["text"].strip(), words
except ImportError:
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("asr.py needs mlx-whisper (Apple Silicon) or faster-whisper: pip install mlx-whisper  |  pip install faster-whisper")
    _model = None

    def transcribe(p):
        global _model
        if _model is None:
            try:
                import torch
                cuda = torch.cuda.is_available()
            except ImportError:
                cuda = False
            _model = WhisperModel(os.environ.get("FASTER_WHISPER_MODEL", "large-v3-turbo"), device="cuda" if cuda else "cpu",
                                  compute_type="float16" if cuda else "int8")
        segs, _ = _model.transcribe(p, word_timestamps=True, language="en")
        segs = list(segs)
        words = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for seg in segs for w in (seg.words or [])]
        return " ".join(seg.text.strip() for seg in segs).strip(), words

out = {}
for p in sys.argv[1:]:
    text, words = transcribe(p)
    w_ = wave.open(p); out[p] = {"text": text, "words": words, "dur": w_.getnframes() / w_.getframerate()}
print(json.dumps(out))
