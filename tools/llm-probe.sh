#!/usr/bin/env bash
# Prove the configured LLM endpoint works, without starting the app:
#   1. GET  <base>/models            is the key accepted, and is LLM_MODEL in the catalogue?
#   2. POST <base>/chat/completions  does a 5-token completion come back?
# Prints status codes, latency, the reply and token usage. The key is never printed.
#
#     ./tools/llm-probe.sh              # settings from tools/llm-env.sh
#     LLM_MODEL=some/other ./tools/llm-probe.sh
set -u
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source tools/llm-env.sh
[ -n "${LLM_API_KEY:-}" ]  || { echo "no LLM_API_KEY — put it in ~/.config/climat/llm.key (see tools/llm-env.sh)"; exit 2; }
[ -n "${LLM_BASE_URL:-}" ] || { echo "no LLM_BASE_URL — put it in ~/.config/climat/llm.base_url"; exit 2; }
base="${LLM_BASE_URL%/}"
echo "endpoint : $base"
echo "model    : ${LLM_MODEL:-(unset)}"
echo "key      : ${LLM_API_KEY:0:4}… (${#LLM_API_KEY} chars)"
tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT

out="$(curl -sS -o "$tmp" -w '%{http_code} %{time_total}' --max-time 30 -H "Authorization: Bearer $LLM_API_KEY" "$base/models")"
code="${out%% *}"; secs="${out#* }"
echo "GET  /models           -> HTTP $code  (${secs}s)"
if [ "$code" = 200 ]; then
  models="$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); print("\n".join(sorted(str(m.get("id","")) for m in d.get("data",[]))))' "$tmp" 2>/dev/null || true)"
  echo "catalogue: $(printf '%s\n' "$models" | grep -c .) models"
  printf '%s\n' "$models" | sed 's/^/           /'
  if [ -n "${LLM_MODEL:-}" ]; then
    if printf '%s\n' "$models" | grep -qxF -- "$LLM_MODEL"; then echo "LLM_MODEL is in the catalogue"
    else echo "WARNING: LLM_MODEL '$LLM_MODEL' is not in the catalogue above"; fi
  fi
else
  echo "body     : $(head -c 300 "$tmp")"
fi

[ -n "${LLM_MODEL:-}" ] || { echo "skipping completion: set LLM_MODEL (~/.config/climat/llm.model) to one of the ids above"; exit 1; }
body="$(printf '{"model":"%s","messages":[{"role":"user","content":"Reply with the single word: ready"}],"max_tokens":5,"temperature":0}' "$LLM_MODEL")"
out="$(curl -sS -o "$tmp" -w '%{http_code} %{time_total}' --max-time 120 -H "Authorization: Bearer $LLM_API_KEY" -H 'Content-Type: application/json' -d "$body" "$base/chat/completions")"
code="${out%% *}"; secs="${out#* }"
echo "POST /chat/completions -> HTTP $code  (${secs}s)"
if [ "$code" = 200 ]; then
  python3 - "$tmp" <<'PY'
import json, sys
d = json.load(open(sys.argv[1])); c = d["choices"][0]; u = d.get("usage") or {}
print("reply    :", repr((c.get("message") or {}).get("content", "").strip()))
print("finish   :", c.get("finish_reason"))
print("usage    :", u.get("prompt_tokens"), "prompt /", u.get("completion_tokens"), "completion tokens")
print("served as:", d.get("model"))
PY
  echo "OK — this key and model work end to end"
else
  echo "body     : $(head -c 300 "$tmp")"; exit 1
fi
