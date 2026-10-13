---
name: papercut-setup
description: Install, check or upgrade the papercut toolchain. Runs the doctor, asks how much to set up (Minimal, Standard, Full), then runs install.sh with flags and fixes dependency errors. Use for "check my papercut install", "set up the voice", "why won't it render".
---

# Papercut setup

A guided wrapper around `install.sh`. It checks what is installed, asks how much the user wants, runs the installer non-interactively and reports. Use it whenever another papercut skill finds something missing.

## Preflight

- Find the repo root (where `install.sh` lives): `readlink ~/.claude/skills/papercut-setup` (or the same under `<project>/.claude/skills`) ends in `<root>/skills/papercut-setup`; failing that, `PAPERCUT_HOME=` in `${XDG_CONFIG_HOME:-~/.config}/papercut-explainer/config.env`. If neither exists, the skills probably came from `npx skills add` (skills only, no library). Ask where to clone the repo (default `~/papercut-explainer`), run `git clone https://github.com/0xS4N4TG/papercut-explainer <dir>`, and use that as the root. The installer then replaces the copied skill folders with links into the checkout (it backs up real folders first). Never guess a path.
- Run every `install.sh` command from that root. It needs bash, and macOS or Linux (Windows: use WSL).
- The installer's own prompts need a terminal, which the Bash tool lacks. Always pass `--yes` and the answers as flags. Tell the user they can run `./install.sh` themselves for the interactive menu.

## 1. Doctor

```
./install.sh --doctor
```

Add `--project DIR` or `--skills-dir DIR` if the skills went somewhere other than `~/.claude/skills`; the doctor only looks where you point it. It prints `[ok]`, `[--]` (missing) or `[!!]` (wrong). Summarise it in plain words:
- skills installed, config file and `PAPERCUT_LIB`
- node 20+, npm, ffmpeg, python3
- Remotion agent skills, Python tools (numpy + Pillow)
- voice: `qwen_tts` importable, a CustomVoice model in the Hugging Face cache
- library files present

Then say which install mode that adds up to (see `papercut-explainer`, Install modes).

## 2. Ask (AskUserQuestion)

Ask only what is still open, in one call:

| Question | Options |
|---|---|
| How much? | **Minimal**: skills only, seconds. **Standard**: render with a placeholder voice, ~0.7 GB and a few minutes. **Full**: Standard + local voiceover, +4-6 GB (a 1.5 GB venv plus a 2.3 or 4.2 GB model) and a 2-minute smoke test. **Custom**: pick components. |
| Where do the skills go? | User-wide (`~/.claude/skills`, the default) or one project (`--project DIR`). |
| Copy or link? | Symlink (default, updates with `git pull`) or `--copy` (a snapshot). |
| TTS model size (Full) | 1.7B, better prosody, ~4.2 GB (default). 0.6B, lighter and faster, ~2.3 GB. |
| Voice-clone model (Full) | No (default), or `--with-clone`: the Base model of the same size again. |

Confirm before any multi-GB download. On a machine with no GPU (not Apple Silicon, no NVIDIA), TTS generation takes minutes per line; suggest recording the voiceover or the placeholder voice instead.

## 3. Install

```
./install.sh --mode <minimal|standard|full> --yes [--skills-dir DIR | --project DIR] [--copy] [--tts-model 1.7B|0.6B] [--with-clone]
./install.sh --mode custom --components skills,deps,remotion-skills,pytools,tts,verify --yes
```

- Add `--dry-run` first if the user wants to see the plan; it changes nothing.
- Standard and Full take minutes (npm install, Remotion's Chrome, venvs, model download). Run them in the background and check the output; do not hold a foreground call.
- What each mode does: Minimal links the skills and the scene-builder agent. Standard adds a dependency check, the Remotion agent skills (`npx skills add remotion-dev/skills -g`), a Python venv with numpy, Pillow and soundfile, and a self-test render. Full adds `library/voice/setup_tts.sh`: a voice venv with Qwen3-TTS, an ASR backend (mlx-whisper on Apple Silicon, faster-whisper elsewhere), the model download and a one-line smoke test.
- The installer writes `PAPERCUT_HOME`, `PAPERCUT_LIB`, `PAPERCUT_PY`, `QWEN_TTS_PY` and `ASR_PY` into `~/.config/papercut-explainer/config.env`. An existing skill folder is backed up as `<name>.bak-<timestamp>`.

## 4. Verify and report

Run `./install.sh --doctor` again with the same `--project` or `--skills-dir`. Report what is installed, what failed (the installer prints `needs attention:` with component names), and the fix. A new Claude Code session picks up newly linked skills. Then suggest: "make a papercut explainer about <link>", or one stage at a time ("write a hook for...", "storyboard this script", "set up the voice").

## Troubleshooting

| Symptom | Fix |
|---|---|
| `node` older than 20, or missing | Install Node 20+ (nodejs.org, `brew install node`), then `./install.sh --mode custom --components deps,verify --yes`. |
| `ffmpeg` missing | `brew install ffmpeg` or `apt install ffmpeg`. |
| Voice venv: "need Python 3.10-3.12" | Qwen3-TTS has no wheels for newer Python. Install `uv` (https://docs.astral.sh/uv/) or `brew install python@3.12`, rerun the `tts` component. |
| Hugging Face download stalls or fails | Rerun; finished files are kept and the script retries 3 times. It sets `HF_HUB_DISABLE_XET=1`; set it yourself for manual downloads. |
| First render is slow | Remotion downloads its headless Chrome once. The audio render and `capture.mjs` use your own Chrome; set `CHROME_PATH` if it isn't in a usual place. |
| Self-test fails | Run `library/tools/selftest.sh` directly to see the failing step. |
| Skills don't show in Claude Code | Start a new session. Check `ls ~/.claude/skills` (or `<project>/.claude/skills`). |
| Move from Minimal to Standard | `./install.sh --mode custom --components deps,remotion-skills,pytools,verify --yes` |
| Add the voice later | `./install.sh --mode custom --components tts --yes [--tts-model 0.6B] [--with-clone]` |
| Remove it | `./install.sh --uninstall` removes the links it recorded. It leaves `config.env`, the venvs under `~/.local/share/papercut-explainer` and the Hugging Face cache; delete those by hand for the space. |
| Windows | Not supported directly. Use WSL. |

## Hand-off

Return to the skill that sent you here, or to `papercut-explainer` for the stage table. Files hold the state: `config.env` carries the library path, so the other skills resolve it without asking again.
