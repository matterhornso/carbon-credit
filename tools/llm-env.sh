#!/usr/bin/env bash
# Resolve the LLM provider settings the services read (LLM_API_KEY, LLM_BASE_URL,
# LLM_MODEL). Source it, do not run it:
#
#     source tools/llm-env.sh
#
# Precedence per variable: a value already exported in the environment wins;
# otherwise the matching file under ~/.config/climat/ is read (override the
# directory with CLIMAT_LLM_CONFIG_DIR). Whitespace is stripped. Nothing is printed.
#
#     ~/.config/climat/llm.key        -> LLM_API_KEY    keep it chmod 600
#     ~/.config/climat/llm.base_url   -> LLM_BASE_URL   OpenAI-compatible root, ending in /v1
#     ~/.config/climat/llm.model      -> LLM_MODEL      an exact id from GET <base_url>/models
#
# No provider is named here on purpose: changing providers means changing these
# three files (or the Railway variables of the same names), never the repo.
# Requires bash (indirect expansion); the scripts that source it are bash.
_climat_llm_dir="${CLIMAT_LLM_CONFIG_DIR:-$HOME/.config/climat}"
for _pair in "LLM_API_KEY:llm.key" "LLM_BASE_URL:llm.base_url" "LLM_MODEL:llm.model"; do
  _var="${_pair%%:*}"; _file="$_climat_llm_dir/${_pair#*:}"
  if [ -z "${!_var:-}" ] && [ -s "$_file" ]; then
    printf -v "$_var" '%s' "$(tr -d '[:space:]' < "$_file")"
    export "$_var"
  fi
done
unset _climat_llm_dir _pair _var _file
