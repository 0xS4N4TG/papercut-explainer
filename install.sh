#!/usr/bin/env bash
# papercut-explainer installer. Asks how much you want to set up, then does only that.
#
#   ./install.sh                         interactive (asks for a mode)
#   ./install.sh --mode standard --yes   no questions
#   ./install.sh --doctor                check what is installed
#   ./install.sh --uninstall             remove the skill links this script made
#
# Modes
#   minimal   the skills only. Strategy, hook, script, storyboard and style prompts work; nothing renders.
#   standard  minimal + everything needed to render silent reels: dependency check, Remotion skills,
#             Python tools (numpy + Pillow + soundfile), a self-test render.
#   full      standard + local voiceover: Qwen3-TTS venv (~1.5 GB), model download (2.3-4.2 GB), word-timing ASR.
#   custom    choose each component.
#
# Options
#   --mode M              minimal | standard | full | custom
#   --components a,b,c    with --mode custom: skills,deps,remotion-skills,pytools,tts,verify
#   --target T            claude | opencode | all (default all: install for both agents)
#   --skills-dir DIR      where skills go (overrides --target with a single dir);
#                         the subagent goes in the sibling folder DIR/../agents
#   --project DIR         install skills into DIR/.claude/skills and DIR/.opencode/skills
#                         instead (one project only; --target filters which of the two)
#   --claude-model M      model for the papercut-scene subagent in Claude Code:
#                         sonnet (default) | opus | haiku | inherit (use the session model) | a full model id
#   --opencode-model M    model for it in opencode: inherit (default, session model) | provider/model-id
#   --copy                copy the skills instead of symlinking them (no live updates from this checkout)
#   --tts-model 1.7B|0.6B model size for the voice step (default 1.7B)
#   --with-clone          also download the voice-cloning model
#   --yes, -y             accept defaults, never prompt
#   --dry-run             print what would happen, change nothing
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB="$ROOT/library"
CFG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/papercut-explainer"
DATA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/papercut-explainer"
export PAPERCUT_CONFIG="$CFG_DIR/config.env"
. "$LIB/env.sh"
export PAPERCUT_LIB="$LIB"   # this checkout wins over a stale path left in an older config file

MODE=""; COMPONENTS=""; TARGET="all"; TARGET_EXPLICIT=0; SKILLS_DIR=""; SKILLS_DIR_EXPLICIT=0; PROJECT_DIR=""
COPY=0; YES=0; DRY=0
CLAUDE_MODEL=sonnet; OPENCODE_MODEL=inherit
TTS_MODEL=1.7B; WITH_CLONE=0; DOCTOR=0; UNINSTALL=0
while [ $# -gt 0 ]; do
  case "$1" in
    --mode) MODE=${2:?--mode needs a value}; shift 2 ;;
    --components) COMPONENTS=${2:?--components needs a value}; shift 2 ;;
    --target) TARGET=${2:?--target needs claude, opencode or all}; TARGET_EXPLICIT=1; shift 2 ;;
    --skills-dir) SKILLS_DIR=${2:?--skills-dir needs a value}; SKILLS_DIR_EXPLICIT=1; shift 2 ;;
    --project) [ -d "${2:?--project needs a folder}" ] || { echo "--project: $2 is not a folder" >&2; exit 2; }
               PROJECT_DIR="$(cd "$2" && pwd)"; shift 2 ;;
    --claude-model) CLAUDE_MODEL=${2:?--claude-model needs sonnet, opus, haiku, inherit or a model id}; shift 2 ;;
    --opencode-model) OPENCODE_MODEL=${2:?--opencode-model needs inherit or provider/model-id}; shift 2 ;;
    --copy) COPY=1; shift ;;
    --tts-model) TTS_MODEL=${2:?--tts-model needs 1.7B or 0.6B}; shift 2 ;;
    --with-clone) WITH_CLONE=1; shift ;;
    --yes|-y) YES=1; shift ;;
    --dry-run) DRY=1; shift ;;
    --doctor) DOCTOR=1; shift ;;
    --uninstall) UNINSTALL=1; shift ;;
    -h|--help) sed -n '2,/^set -euo/p' "$0" | sed '$d'; exit 0 ;;
    *) echo "unknown option: $1 (see --help)" >&2; exit 2 ;;
  esac
done

case "$TARGET" in
  claude|opencode|all) ;;
  *) echo "--target needs claude, opencode or all (got: $TARGET)" >&2; exit 2 ;;
esac

case "$CLAUDE_MODEL" in
  ""|*[!A-Za-z0-9._:-]*) echo "--claude-model needs sonnet, opus, haiku, inherit or a model id (got: $CLAUDE_MODEL)" >&2; exit 2 ;;
esac
case "$OPENCODE_MODEL" in
  inherit) ;;
  */*) case "$OPENCODE_MODEL" in *[!A-Za-z0-9._:/-]*|/*|*/) echo "--opencode-model needs inherit or provider/model-id (got: $OPENCODE_MODEL)" >&2; exit 2 ;; esac ;;
  *) echo "--opencode-model needs inherit or provider/model-id, e.g. anthropic/claude-sonnet-5-5 (got: $OPENCODE_MODEL)" >&2; exit 2 ;;
esac

# Skill destinations. One entry per agent target, so both Claude Code and
# opencode pick the skills up (opencode also reads ~/.claude/skills, but the
# native path keeps discovery explicit and survives config changes).
# --skills-dir overrides the list with a single dir (legacy behaviour);
# --project scopes the install to one project folder instead of user-wide.
SKILLS_DIRS=()
if [ "$SKILLS_DIR_EXPLICIT" = 1 ]; then
  SKILLS_DIRS=("$SKILLS_DIR")
else
  if [ -n "$PROJECT_DIR" ]; then
    case "$TARGET" in
      claude)   SKILLS_DIRS=("$PROJECT_DIR/.claude/skills") ;;
      opencode) SKILLS_DIRS=("$PROJECT_DIR/.opencode/skills") ;;
      all)      SKILLS_DIRS=("$PROJECT_DIR/.claude/skills" "$PROJECT_DIR/.opencode/skills") ;;
    esac
  else
    case "$TARGET" in
      claude)   SKILLS_DIRS=("$HOME/.claude/skills") ;;
      opencode) SKILLS_DIRS=("$HOME/.config/opencode/skills") ;;
      all)      SKILLS_DIRS=("$HOME/.claude/skills" "$HOME/.config/opencode/skills") ;;
    esac
  fi
fi

if [ -t 1 ]; then B=$'\033[1m'; G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; N=$'\033[0m'; else B=""; G=""; Y=""; R=""; N=""; fi
say()  { printf '%s==>%s %s\n' "$B" "$N" "$*"; }
ok()   { printf '  %s[ok]%s %s\n' "$G" "$N" "$*"; }
miss() { printf '  %s[--]%s %s\n' "$Y" "$N" "$*"; }
bad()  { printf '  %s[!!]%s %s\n' "$R" "$N" "$*"; }
run()  { if [ "$DRY" = 1 ]; then printf '  (dry run) %s\n' "$*"; else "$@"; fi; }
interactive() { [ "$YES" = 0 ] && [ -t 0 ]; }
confirm() {  # confirm "question" default(y|n)
  interactive || { [ "$2" = y ]; return; }
  local hint="[Y/n]"; [ "$2" = n ] && hint="[y/N]"
  printf '%s %s ' "$1" "$hint"; read -r a
  case "$(printf '%s' "$a" | tr 'A-Z' 'a-z')" in y|yes) return 0 ;; n|no) return 1 ;; *) [ "$2" = y ] ;; esac
}

SKILL_NAMES() { for d in "$ROOT"/skills/*/; do [ -f "${d}SKILL.md" ] && basename "$d"; done; }
ver_ge() { [ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -1)" = "$2" ]; }   # ver_ge have need

# The scene agent is written as a copy so the model is the user's choice. Claude Code and opencode name
# models differently, so the source file carries no model line; this adds one (or none for "inherit").
agent_with_model() {  # agent_with_model SRC MODEL
  awk -v model="$2" '
    NR == 1 && $0 == "---" { fm = 1; print; next }
    fm == 1 && /^model:/ { next }
    fm == 1 && /^name:/ { print; if (model != "inherit") print "model: " model; next }
    fm == 1 && $0 == "---" { fm = 2; print; print "<!-- papercut-explainer install.sh (generated): rerun the installer to change the model -->"; next }
    { print }
  ' "$1"
}

# ---------------------------------------------------------------- doctor
doctor() {
  say "papercut-explainer: status (target: $TARGET)"
  local n=0 t=0 L_SKILLS=0 L_STD=1 L_FULL=0
  local best=0 dir_n nskills misses=() complete=()
  for dir in "${SKILLS_DIRS[@]}"; do
    dir_n=0
    for s in $(SKILL_NAMES); do
      if [ -e "$dir/$s/SKILL.md" ]; then dir_n=$((dir_n+1)); else misses+=("skill $s not in $dir"); fi
    done
    n=$((n+dir_n)); t=$((t+$(SKILL_NAMES | wc -w)))
    [ "$dir_n" -gt "$best" ] && best=$dir_n
    if [ "$dir_n" = "$(SKILL_NAMES | wc -w | tr -d " ")" ]; then complete+=("$dir"); fi
  done
  nskills=$(SKILL_NAMES | wc -w | tr -d " ")
  # No explicit --target: Claude-only and opencode-only installs are both fine, so one complete location passes.
  if [ "$TARGET_EXPLICIT" = 0 ] && [ "$SKILLS_DIR_EXPLICIT" = 0 ] && [ "${#complete[@]}" -gt 0 ]; then
    ok "skills: $nskills/$nskills in ${complete[*]}"; L_SKILLS=1
  elif [ "$n" = "$t" ] && [ "$t" -gt 0 ]; then ok "skills: $n/$t in ${SKILLS_DIRS[*]}"; L_SKILLS=1
  else for m in "${misses[@]}"; do miss "$m"; done; bad "skills: $n/$t installed"; fi
  [ -f "$PAPERCUT_CONFIG" ] && ok "config: $PAPERCUT_CONFIG (PAPERCUT_LIB=$PAPERCUT_LIB)" || miss "config file missing ($PAPERCUT_CONFIG)"
  if command -v node >/dev/null 2>&1; then v="$(node -v | sed 's/^v//')"; if ver_ge "$v" 20; then ok "node $v"; else bad "node $v (need 20+)"; L_STD=0; fi; else miss "node (need 20+)"; L_STD=0; fi
  command -v npm >/dev/null 2>&1 && ok "npm" || { miss "npm"; L_STD=0; }
  command -v ffmpeg >/dev/null 2>&1 && ok "ffmpeg" || { miss "ffmpeg"; L_STD=0; }
  command -v rsync >/dev/null 2>&1 && ok "rsync" || { miss "rsync"; L_STD=0; }
  command -v python3 >/dev/null 2>&1 && ok "python3 $(python3 -c 'import platform;print(platform.python_version())')" || { miss "python3"; L_STD=0; }
  local remo_found=0 d
  for d in "${SKILLS_DIRS[@]}" "$HOME/.claude/skills" "$HOME/.config/opencode/skills" "$HOME/.agents/skills"; do
    [ -f "$d/remotion-best-practices/SKILL.md" ] && remo_found=1
  done
  if [ $remo_found = 1 ]; then ok "remotion skills"; else miss "remotion skills (npx skills add remotion-dev/skills, see step_remotion)"; L_STD=0; fi
  if "$PAPERCUT_PY" -c 'import numpy, PIL, soundfile' >/dev/null 2>&1; then ok "python tools: numpy + Pillow + soundfile ($PAPERCUT_PY)"; else miss "python tools (numpy + Pillow + soundfile)"; L_STD=0; fi
  if papercut_find_chrome >/dev/null; then ok "Chrome or Chromium (sound effects and music render)"; else miss "Chrome/Chromium (only the SFX and music render needs it)"; fi
  if "$QWEN_TTS_PY" -c 'import qwen_tts' >/dev/null 2>&1; then
    ok "voice: qwen-tts importable ($QWEN_TTS_PY)"
    if ls -d "$HOME"/.cache/huggingface/hub/models--Qwen--Qwen3-TTS-12Hz-*-CustomVoice >/dev/null 2>&1; then ok "voice: CustomVoice model cached"; L_FULL=1; else miss "voice: no CustomVoice model in the Hugging Face cache"; fi
  else miss "voice: qwen-tts not installed (optional; ./install.sh --mode custom --components tts)"; fi
  for f in kit/paper/camera.tsx public/bg/backdrops/backdrops.json public/bg/textures/felt-fibre.mp4; do
    [ -e "$LIB/papercut/$f" ] && ok "library: $f" || { bad "library file missing: $f"; L_STD=0; }
  done
  local level="none (skills not installed)"
  if [ $L_SKILLS = 1 ]; then level="Minimal"; [ $L_STD = 1 ] && level="Standard" && [ $L_FULL = 1 ] && level="Full"; fi
  say "Install level: $level"
}

uninstall() {
  say "removing skill links made by this installer"
  local rec="$CFG_DIR/installed.txt"; [ -f "$rec" ] || { echo "nothing recorded in $rec"; return; }
  while IFS= read -r p; do
    [ -n "$p" ] || continue
    if [ -L "$p" ]; then
      case "$(readlink "$p")" in "$ROOT"/*) run rm "$p"; ok "removed $p" ;; *) miss "kept $p (link points elsewhere)" ;; esac
    elif [ -d "$p" ] && [ -f "$p/.papercut-installed" ]; then run rm -rf "$p"; ok "removed $p"
    elif [ -f "$p" ] && [ -f "$ROOT/agents/$(basename "$p")" ] && { cmp -s "$p" "$ROOT/agents/$(basename "$p")" || grep -q 'papercut-explainer install.sh (generated)' "$p"; }; then run rm "$p"; ok "removed $p"
    elif [ -e "$p" ]; then miss "kept $p (not an unmodified copy from this installer)"; fi
  done < "$rec"
  run rm -f "$rec"
  echo "Left in place: $CFG_DIR/config.env, venvs under $DATA_DIR, Hugging Face model cache. Delete them by hand if you want the space back."
}

[ "$DOCTOR" = 1 ] && { doctor; exit 0; }
[ "$UNINSTALL" = 1 ] && { uninstall; exit 0; }

# ---------------------------------------------------------------- mode
if [ -z "$MODE" ]; then
  if interactive; then
    cat <<EOF
${B}papercut-explainer setup${N}

How much do you want to set up?

  1) Minimal   The skills only (hook, script, storyboard, strategy, style prompts).
               Nothing renders. Takes seconds.
  2) Standard  Minimal + render silent reels: dependency check, Remotion skills,
               Python tools, a self-test render.             ~0.7 GB, a few minutes.
  3) Full      Standard + local voiceover: Qwen3-TTS + word-timing ASR.
                                                              +4-6 GB (1.5 GB venv + model).
  4) Custom    Pick each component.

EOF
    printf 'Choose 1-4 [2]: '; read -r c
    case "${c:-2}" in 1) MODE=minimal ;; 2) MODE=standard ;; 3) MODE=full ;; 4) MODE=custom ;; *) echo "pick 1-4" >&2; exit 2 ;; esac
  else
    echo "no terminal to ask on: pass --mode minimal|standard|full|custom (and --yes)" >&2; exit 2
  fi
fi

C_SKILLS=0; C_DEPS=0; C_REMO=0; C_PY=0; C_TTS=0; C_VERIFY=0
case "$MODE" in
  minimal)  C_SKILLS=1 ;;
  standard) C_SKILLS=1; C_DEPS=1; C_REMO=1; C_PY=1; C_VERIFY=1 ;;
  full)     C_SKILLS=1; C_DEPS=1; C_REMO=1; C_PY=1; C_TTS=1; C_VERIFY=1 ;;
  custom)
    if [ -n "$COMPONENTS" ]; then
      for c in $(printf '%s' "$COMPONENTS" | tr ',' ' '); do
        case "$c" in skills) C_SKILLS=1 ;; deps) C_DEPS=1 ;; remotion-skills) C_REMO=1 ;; pytools) C_PY=1 ;; tts) C_TTS=1 ;; verify) C_VERIFY=1 ;;
          *) echo "unknown component: $c" >&2; exit 2 ;; esac
      done
    else
      interactive || { echo "--mode custom needs --components or a terminal" >&2; exit 2; }
      confirm "Install the skills (links into ${SKILLS_DIRS[*]})?" y && C_SKILLS=1
      confirm "Check dependencies (node 20+, npm, ffmpeg, python3)?" y && C_DEPS=1
      confirm "Install the Remotion agent skills (npx skills add remotion-dev/skills)?" y && C_REMO=1
      confirm "Set up Python tools (venv with numpy + Pillow, for QA contact sheets)?" y && C_PY=1
      if confirm "Set up local voiceover (Qwen3-TTS + ASR; 4-6 GB of disk)?" n; then
        C_TTS=1
        printf 'Model size: 1) 1.7B better, 4.2 GB   2) 0.6B lighter, 2.3 GB  [1]: '; read -r m
        [ "$m" = 2 ] && TTS_MODEL=0.6B
        confirm "Also download the voice-cloning model (same size again)?" n && WITH_CLONE=1
      fi
      confirm "Run a self-test render at the end?" y && C_VERIFY=1
    fi ;;
  *) echo "unknown mode: $MODE" >&2; exit 2 ;;
esac

if [ "$MODE" != custom ] && interactive; then
  say "Plan ($MODE)"
  [ $C_SKILLS = 1 ] && echo "  - link the skills into ${SKILLS_DIRS[*]} (target: $TARGET)"
  [ $C_DEPS = 1 ]   && echo "  - check node, npm, ffmpeg, python3"
  [ $C_REMO = 1 ]   && echo "  - install the Remotion agent skills (global)"
  [ $C_PY = 1 ]     && echo "  - create a Python venv with numpy + Pillow"
  [ $C_TTS = 1 ]    && echo "  - build a voice venv and download Qwen3-TTS $TTS_MODEL (~$([ "$TTS_MODEL" = 1.7B ] && echo 4.2 || echo 2.3) GB)"
  [ $C_VERIFY = 1 ] && echo "  - scaffold a throwaway project and render one still (npm install runs once)"
  confirm "Go?" y || { echo "cancelled"; exit 0; }
fi
[ "$MODE" = full ] && interactive && ! confirm "Full mode asks for a multi-GB model download. Keep model size $TTS_MODEL?" y && { echo "rerun with --tts-model 0.6B or --mode standard"; exit 0; }

# ---------------------------------------------------------------- steps
FAILED=""; SKIPPED=""; DONE=""
note_fail() { FAILED="$FAILED $1"; bad "$1 failed: $2"; }

step_config() {
  say "config"
  run mkdir -p "$CFG_DIR"
  if [ "$DRY" = 0 ]; then
    papercut_config_set PAPERCUT_HOME "$ROOT"
    papercut_config_set PAPERCUT_LIB "$LIB"
  fi
  ok "$PAPERCUT_CONFIG"
}

step_skills() {
  local onedir adir
  for onedir in "${SKILLS_DIRS[@]}"; do
    say "skills -> $onedir"
    run mkdir -p "$onedir" "$CFG_DIR"
    local ts bak; ts="$(date +%Y%m%d-%H%M%S)"; bak="$CFG_DIR/backups"
    for s in $(SKILL_NAMES); do
      local src="$ROOT/skills/$s" dst="$onedir/$s"
      if [ -L "$dst" ]; then
        run rm "$dst"
      elif [ -e "$dst" ]; then
        if [ -f "$dst/.papercut-installed" ] || diff -rq "$src" "$dst" >/dev/null 2>&1; then
          run rm -rf "$dst"   # an earlier --copy install or an identical copy (npx skills add): refresh it
        elif confirm "$dst exists and differs from this checkout. Back it up and replace?" y; then
          # backups live outside the skills folder, so agents do not load them as duplicate skills
          run mkdir -p "$bak"; run mv "$dst" "$bak/$s.$ts"; miss "backed up to $bak/$s.$ts"
        else miss "kept existing $s"; continue; fi
      fi
      if [ "$COPY" = 1 ]; then run cp -R "$src" "$dst"; [ "$DRY" = 1 ] || touch "$dst/.papercut-installed"; else run ln -s "$src" "$dst"; fi
      [ "$DRY" = 1 ] || echo "$dst" >> "$CFG_DIR/installed.txt"
      ok "$s ($onedir)"
    done
    # the scene-builder subagent sits next to the skills dir:
    # ~/.claude/agents, ~/.config/opencode/agents, or <project>/.claude|opencode/agents
    adir="$(dirname "$onedir")/agents"
    run mkdir -p "$adir"
    local akind=claude amodel="$CLAUDE_MODEL" agen
    case "$onedir" in */.opencode/skills|*/opencode/skills) akind=opencode; amodel="$OPENCODE_MODEL" ;; esac
    local asrc="$ROOT/agents"; [ "$akind" = opencode ] && asrc="$ROOT/agents/opencode"
    for a in "$asrc"/*.md; do
      [ -f "$a" ] || continue
      local adst="$adir/$(basename "$a")"
      agen="$(mktemp)"; agent_with_model "$a" "$amodel" > "$agen"
      if [ -L "$adst" ]; then run rm "$adst"
      elif [ -e "$adst" ]; then
        if cmp -s "$agen" "$adst" || cmp -s "$a" "$adst"; then run rm "$adst"   # identical copy: refresh it
        elif grep -q 'papercut-explainer install.sh (generated)' "$adst" 2>/dev/null; then run rm "$adst"   # an earlier run with another model
        elif confirm "$adst exists and differs from this checkout. Back it up and replace?" y; then
          run mkdir -p "$CFG_DIR/backups"; run mv "$adst" "$CFG_DIR/backups/$(basename "$a" .md).$ts.md"; miss "backed up to $CFG_DIR/backups"
        else miss "kept existing agent $(basename "$a")"; rm -f "$agen"; continue; fi
      fi
      run cp "$agen" "$adst"; rm -f "$agen"
      [ "$DRY" = 1 ] || echo "$adst" >> "$CFG_DIR/installed.txt"
      ok "agent $(basename "$a" .md) ($akind, model: $amodel) -> $adir"
    done
  done
  [ "$DRY" = 1 ] || [ ! -f "$CFG_DIR/installed.txt" ] || sort -u "$CFG_DIR/installed.txt" -o "$CFG_DIR/installed.txt"
}

step_deps() {
  say "dependencies"
  local miss_any=0
  if command -v node >/dev/null 2>&1; then v="$(node -v | sed 's/^v//')"; if ver_ge "$v" 20; then ok "node $v"; else bad "node $v, need 20+"; miss_any=1; fi
  else bad "node not found. Install Node 20+: https://nodejs.org or 'brew install node'"; miss_any=1; fi
  command -v npm >/dev/null 2>&1 && ok "npm" || { bad "npm not found (ships with node)"; miss_any=1; }
  command -v ffmpeg >/dev/null 2>&1 && ok "ffmpeg" || { bad "ffmpeg not found: 'brew install ffmpeg' or 'apt install ffmpeg'"; miss_any=1; }
  command -v rsync >/dev/null 2>&1 && ok "rsync" || { bad "rsync not found (the kit sync uses it): 'brew install rsync' or 'apt install rsync'"; miss_any=1; }
  if papercut_find_chrome >/dev/null; then
    ok "Chrome or Chromium (sound effects and music render)"
  else miss "Chrome/Chromium not found: only the SFX and music render needs it (set CHROME_PATH or install Chrome); video renders do not"; fi
  command -v python3 >/dev/null 2>&1 && ok "python3" || { bad "python3 not found"; miss_any=1; }
  if [ $miss_any = 1 ]; then note_fail deps "install the items above, then rerun with --mode custom --components deps,verify"; return 1; fi
}

step_remotion() {
  say "Remotion agent skills (target: $TARGET)"
  local need_cc=0 need_oc=0
  case "$TARGET" in
    claude)   need_cc=1 ;;
    opencode) need_oc=1 ;;
    all)      need_cc=1; need_oc=1 ;;
  esac
  [ -f "$HOME/.claude/skills/remotion-best-practices/SKILL.md" ] && need_cc=0
  [ -f "$HOME/.config/opencode/skills/remotion-best-practices/SKILL.md" ] && need_oc=0
  # opencode also discovers ~/.claude/skills, so a Claude-side install covers both;
  # the native opencode install below just makes it explicit.
  if [ $need_cc = 0 ] && [ $need_oc = 0 ]; then ok "already installed"; return; fi
  command -v npx >/dev/null 2>&1 || { note_fail remotion-skills "npx not found"; return 1; }
  if [ $need_cc = 1 ]; then
    if ! run npx -y skills@latest add remotion-dev/skills -g -y -a claude-code; then note_fail remotion-skills "npx skills add failed for claude-code; run it by hand"; fi
  fi
  if [ $need_oc = 1 ]; then
    if ! run npx -y skills@latest add remotion-dev/skills -g -y -a opencode; then note_fail remotion-skills "npx skills add failed for opencode; run it by hand"; fi
  fi
}

step_pytools() {
  say "Python tools (numpy + Pillow + soundfile)"
  local V="$DATA_DIR/tools-venv"
  command -v python3 >/dev/null 2>&1 || { note_fail pytools "python3 missing"; return 1; }
  run mkdir -p "$DATA_DIR"
  if [ ! -x "$V/bin/python" ]; then
    run python3 -m venv "$V" || { rm -rf "$V"; note_fail pytools "could not create a venv (on Debian/Ubuntu: apt install python3-venv, then rerun with --mode custom --components pytools,verify)"; return 1; }
  fi
  run "$V/bin/python" -m pip install -q -U pip numpy pillow soundfile || { note_fail pytools "pip install failed"; return 1; }
  [ "$DRY" = 1 ] || papercut_config_set PAPERCUT_PY "$V/bin/python"
  ok "PAPERCUT_PY=$V/bin/python"
}

step_tts() {
  say "local voiceover"
  local args="--model $TTS_MODEL --yes"; [ "$WITH_CLONE" = 1 ] && args="$args --with-clone"
  # shellcheck disable=SC2086
  run bash "$LIB/voice/setup_tts.sh" $args || note_fail tts "see the output above; rerun: library/voice/setup_tts.sh"
}

step_verify() {
  say "self-test render"
  run bash "$LIB/tools/selftest.sh" || note_fail verify "self-test failed; run library/tools/selftest.sh to see why"
}

step_config
[ $C_SKILLS = 1 ] && step_skills
if [ $C_DEPS = 1 ]; then step_deps || C_VERIFY=0; fi
[ $C_REMO = 1 ] && step_remotion
[ $C_PY = 1 ] && step_pytools
[ $C_TTS = 1 ] && step_tts
[ $C_VERIFY = 1 ] && step_verify

# ---------------------------------------------------------------- summary
echo
say "Done ($MODE)"
if [ -n "$FAILED" ]; then bad "needs attention:$FAILED"; echo "After fixing, rerun the failed part with --mode custom --components <names>, or check everything with ./install.sh --doctor."; exit 1; fi
cat <<EOF

Next: open Claude Code or opencode and say
  "make a papercut explainer about <link>"
or run one stage on its own: "write a hook for ...", "storyboard this script", "set up the voice".

Check the setup any time: ./install.sh --doctor [--target claude|opencode|all]
EOF
