# Shared environment for the papercut library scripts. Source it; do not execute it.
#   . "$(dirname "${BASH_SOURCE[0]}")/../env.sh"      (adjust the relative path)
#
# Reads the installer's config file, then fills defaults. Variables already set in the
# environment win over the file. Bash 3.2 compatible (macOS default).
#
#   PAPERCUT_LIB      this library folder
#   PAPERCUT_PY       python with numpy + Pillow (contact sheets, textures)   default: python3
#   QWEN_TTS_PY       python with qwen-tts installed (voice/narrate)          default: python3
#   ASR_PY            python with an ASR backend (voice/asr)                  default: python3
#   PAPERCUT_CONFIG   config file path   default: ${XDG_CONFIG_HOME:-~/.config}/papercut-explainer/config.env

_pc_cfg="${PAPERCUT_CONFIG:-${XDG_CONFIG_HOME:-$HOME/.config}/papercut-explainer/config.env}"

if [ -f "$_pc_cfg" ]; then
  while IFS='=' read -r _k _v || [ -n "$_k" ]; do
    case "$_k" in ''|'#'*|*[!A-Za-z0-9_]*) continue ;; esac
    eval "_cur=\"\${$_k:-}\""   # indirect lookup that works in bash 3.2 and zsh
    [ -n "$_cur" ] || export "$_k=$_v"
  done < "$_pc_cfg"
fi

# a PAPERCUT_LIB from the config file that no longer exists (moved or deleted checkout) is ignored
if [ -n "${PAPERCUT_LIB:-}" ] && [ ! -d "$PAPERCUT_LIB" ]; then unset PAPERCUT_LIB; fi
if [ -z "${PAPERCUT_LIB:-}" ] && [ -n "${BASH_SOURCE[0]:-}" ]; then
  PAPERCUT_LIB="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi
export PAPERCUT_LIB
: "${PAPERCUT_PY:=python3}"; : "${QWEN_TTS_PY:=python3}"; : "${ASR_PY:=python3}"
export PAPERCUT_PY QWEN_TTS_PY ASR_PY

# papercut_config_set KEY VALUE: write or replace one line in the config file.
papercut_config_set() {
  mkdir -p "$(dirname "$_pc_cfg")"; touch "$_pc_cfg"
  { grep -v "^$1=" "$_pc_cfg" || true; printf '%s=%s\n' "$1" "$2"; } > "$_pc_cfg.tmp"
  mv "$_pc_cfg.tmp" "$_pc_cfg"
}

# papercut_find_chrome: print the Chrome or Chromium binary the audio render would use (same list as audio/render.mjs); fail if none.
papercut_find_chrome() {
  local p
  for p in "${CHROME_PATH:-}" "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" /Applications/Chromium.app/Contents/MacOS/Chromium \
           /usr/bin/google-chrome /usr/bin/google-chrome-stable /usr/bin/chromium /usr/bin/chromium-browser; do
    if [ -n "$p" ] && [ -e "$p" ]; then printf '%s\n' "$p"; return 0; fi
  done
  return 1
}
