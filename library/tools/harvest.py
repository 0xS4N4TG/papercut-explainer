# After an episode: find what should move into the shared library so the next episode doesn't rewrite it.
#   usage: python3 $PAPERCUT_LIB/tools/harvest.py <papercut project dir>
# Reports (1) kit files the project changed locally (fixes to promote), (2) episode-local components and props that other
# episodes could reuse, (3) SFX the cue sheet uses that the library lacks, (4) a beat-pattern checklist for scene templates.
# Read-only: it prints a report and changes nothing.
import filecmp, glob, json, os, re, sys
LIB = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
P = os.path.abspath(sys.argv[1]); src = f"{P}/src"
kit = f"{LIB}/papercut/kit"
base = f"{src}/lib" if os.path.isdir(f"{src}/lib") else src          # the synced kit lives in src/lib
print(f"# Harvest report for {P}\n")
print("## 1. Kit files changed in this project (promote the fix to papercut/kit in the library, or discard it)")
n = 0
for k in sorted(glob.glob(f"{kit}/**/*.ts*", recursive=True)):
    rel = os.path.relpath(k, kit); q = f"{base}/{rel}"
    if os.path.exists(q) and not filecmp.cmp(k, q, shallow=False): print(f"- {rel}: differs (diff {k} {q})"); n += 1
print("- none" if not n else "  (a file also shows up here when the library changed after this project was last synced; read the diff to tell which side moved)")
print("\n## 2. Episode-local building blocks (candidates for papercut/kit/props or a scene template)")
local = [p for p in glob.glob(f"{src}/**/*.tsx", recursive=True) if not os.path.relpath(p, src).startswith("lib" + os.sep) and os.path.basename(p) not in ("Root.tsx", "PapercutVideo.tsx")]
kit_names = {m for k in glob.glob(f"{kit}/**/*.ts*", recursive=True) for m in re.findall(r"export (?:const|function) (\w+)", open(k).read())}
for p in sorted(local):
    names = [m for m in re.findall(r"^(?:export )?const (\w+): React\.FC", open(p).read(), re.M) if m not in kit_names and not re.match(r"S\d\d", m)]
    if names: print(f"- {os.path.relpath(p, P)}: {', '.join(names)}")
print("\n## 3. SFX used here but missing from audio/sfx")
used = set()
if os.path.exists(f"{P}/tools/cues.json"): used |= {c["type"] for c in json.load(open(f"{P}/tools/cues.json"))["cues"]}
miss = sorted(t for t in used if not os.path.exists(f"{LIB}/audio/sfx/{t}.js"))
print("- " + (", ".join(miss) if miss else "none") + (" (write each as audio/sfx/<name>.js with an @sfx header)" if miss else ""))
print("\n## 4. Scene-template checklist (promote a scene to papercut/kit/scenes when the same beat recurs across episodes)")
print("- CTA (phone comment + keyword + deliverable fan), terminal reveal, repo card + star count-up, stat columns / NumberCard reveal,")
print("  corkboard of files, callback desk. Parameterise the text/props and keep cue words as props (e.g. cue={{post: 'KEYWORD'}}).")
print(f"\nThen: python3 {LIB}/tools/catalog.py, and note the promotion in {LIB}/CHANGELOG.md.")
