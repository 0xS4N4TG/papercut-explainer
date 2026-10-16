# Harness table for install.sh. Sourced, not run. Bash 3.2 safe (macOS default): no associative arrays.
#
# One line per harness:
#   name | user skills dir | project skills dir | agent kind | user agents dir | project agents dir
#        | `npx skills` agent id | detect command | detect dir
#
# Skills: most harnesses read the shared ~/.agents/skills (project: .agents/skills). Claude Code, Kiro, Qwen Code,
# Windsurf and OpenCode v1 have their own folders, so they get their own rows. Paths follow each vendor's docs
# (checked 2026-10-17); only Claude Code and OpenCode 1.x have been run against this installer.
#
# Agent kind is the file format of the papercut-scene subagent:
#   claude    markdown, Claude Code frontmatter (also read by Cursor, Copilot in VS Code and Goose from .claude/agents)
#   opencode  markdown, opencode frontmatter (no `tools:`: opencode 1.x rejects Claude's comma list)
#   codex     TOML (name, description, developer_instructions, model, model_reasoning_effort)
#   gemini    markdown, strict frontmatter (name, description, model)
#   none      no file-defined subagents; papercut-build falls back to a general agent or builds the scenes itself
#
# To add a harness: add a line. Nothing else needs to change.
HARNESS_TABLE='
claude|~/.claude/skills|.claude/skills|claude|~/.claude/agents|.claude/agents|claude-code|claude|~/.claude
opencode|~/.config/opencode/skills|.opencode/skills|opencode|~/.config/opencode/agents|.opencode/agents|opencode|opencode|~/.config/opencode
codex|~/.agents/skills|.agents/skills|codex|~/.codex/agents|.codex/agents|codex|codex|~/.codex
gemini|~/.agents/skills|.agents/skills|gemini|~/.gemini/agents|.gemini/agents|gemini-cli|gemini|~/.gemini
cursor|~/.agents/skills|.agents/skills|none|-|-|cursor|cursor-agent|~/.cursor
copilot|~/.agents/skills|.agents/skills|none|-|-|github-copilot|copilot|~/.copilot
amp|~/.agents/skills|.agents/skills|none|-|-|amp|amp|~/.config/amp
goose|~/.agents/skills|.agents/skills|none|-|-|goose|goose|~/.config/goose
cline|~/.agents/skills|.agents/skills|none|-|-|cline|cline|~/.cline
roo|~/.agents/skills|.agents/skills|none|-|-|roo|-|~/.roo
kilo|~/.agents/skills|.agents/skills|none|-|-|kilo|kilo|~/.kilo
zed|~/.agents/skills|.agents/skills|none|-|-|zed|zed|-
droid|~/.agents/skills|.agents/skills|none|-|-|droid|droid|~/.factory
warp|~/.agents/skills|.agents/skills|none|-|-|warp|-|~/.warp
augment|~/.agents/skills|.agents/skills|none|-|-|augment|auggie|~/.augment
junie|~/.agents/skills|.agents/skills|none|-|-|junie|junie|~/.junie
openhands|~/.agents/skills|.agents/skills|none|-|-|openhands|openhands|~/.openhands
crush|~/.agents/skills|.agents/skills|none|-|-|crush|crush|~/.config/crush
kiro|~/.kiro/skills|.kiro/skills|none|-|-|kiro-cli|kiro-cli|~/.kiro
qwen|~/.qwen/skills|.qwen/skills|none|-|-|qwen-code|qwen|~/.qwen
windsurf|~/.codeium/windsurf/skills|.windsurf/skills|none|-|-|windsurf|windsurf|~/.codeium/windsurf
agents|~/.agents/skills|.agents/skills|none|-|-|universal|-|-
'

h_names() { printf '%s\n' "$HARNESS_TABLE" | awk -F'|' 'NF > 1 { print $1 }'; }
h_known() { h_names | grep -qx "$1"; }
h_row() { printf '%s\n' "$HARNESS_TABLE" | awk -F'|' -v n="$1" '$1 == n { print; exit }'; }
h_field() {  # h_field NAME COLUMN (1-based); expands a leading ~ to $HOME; "-" becomes empty
  local v; v="$(h_row "$1" | awk -F'|' -v c="$2" '{ print $c }')"
  case "$v" in "~/"*) v="$HOME/${v#\~/}" ;; "-") v="" ;; esac
  printf '%s' "$v"
}
h_detected() {  # does this harness look installed? (command on PATH or its config folder exists)
  local cmd dir; cmd="$(h_field "$1" 8)"; dir="$(h_field "$1" 9)"
  [ -n "$cmd" ] && command -v "$cmd" >/dev/null 2>&1 && return 0
  [ -n "$dir" ] && [ -d "$dir" ] && return 0
  return 1
}

# resolve_targets SPEC -> TARGET_LIST (array of harness names)
#   auto (the default): every harness that looks installed, else claude
#   all: every harness in the table      a,b,c: exactly those
resolve_targets() {
  local spec="$1" n; TARGET_LIST=()
  case "$spec" in
    auto) for n in $(h_names); do [ "$n" = agents ] && continue; h_detected "$n" && TARGET_LIST+=("$n"); done
          [ "${#TARGET_LIST[@]}" -gt 0 ] || TARGET_LIST=(claude) ;;
    all)  for n in $(h_names); do TARGET_LIST+=("$n"); done ;;
    *)    for n in $(printf '%s' "$spec" | tr ',' ' '); do
            h_known "$n" || { echo "unknown --target '$n'. Known: $(h_names | tr '\n' ' ')| auto | all" >&2; exit 2; }
            TARGET_LIST+=("$n")
          done ;;
  esac
}

in_array() {  # in_array VALUE ITEM...  (call with "${ARR[@]+"${ARR[@]}"}" so an empty array is fine under set -u)
  local v="$1" x; shift
  for x in "$@"; do [ "$x" = "$v" ] && return 0; done
  return 1
}

# Per-harness model for the scene agent. AGENT_MODELS is a space-separated list of name=model; the last entry wins.
agent_model() {  # agent_model NAME -> model string, "inherit" when none was set
  local kv m=inherit
  for kv in $AGENT_MODELS; do [ "${kv%%=*}" = "$1" ] && m="${kv#*=}"; done
  printf '%s' "$m"
}
valid_model() {  # valid_model NAME MODEL -> 0 if the string is acceptable for that harness
  case "$2" in ""|*[!A-Za-z0-9._:/#\[\]-]*) return 1 ;; esac
  [ "$2" = inherit ] && return 0
  [ "$1" = opencode ] && { case "$2" in */*) case "$2" in /*|*/) return 1 ;; esac ;; *) return 1 ;; esac; }
  return 0
}
