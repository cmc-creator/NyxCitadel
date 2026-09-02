#!/usr/bin/env bash
# NyxCitadel production / preview smoke checks for private beta.
#
# Usage:
#   BASE_URL=https://your-domain.com CRON_SECRET=... ./scripts/smoke-prod.sh
#
# Optional:
#   EXPECT_DEMO_DISABLED=1   # fail if demo reset endpoint is enabled (default: 1)

set -euo pipefail

BASE_URL="${BASE_URL:-}"
CRON_SECRET="${CRON_SECRET:-}"
EXPECT_DEMO_DISABLED="${EXPECT_DEMO_DISABLED:-1}"

if [[ -z "$BASE_URL" ]]; then
  echo "ERROR: BASE_URL is required (e.g. https://nyxcitadel.com)"
  exit 1
fi

# Strip trailing slash
BASE_URL="${BASE_URL%/}"

PASS=0
FAIL=0
WARN=0

green() { printf '\033[32m%s\033[0m\n' "$*"; }
red() { printf '\033[31m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }

check() {
  local name="$1"
  local expected="$2"
  local url="$3"
  shift 3
  local code
  code=$(curl -sS -o /tmp/nyx-smoke-body.txt -w '%{http_code}' "$@" "$url" || true)
  if [[ "$code" == "$expected" ]]; then
    green "PASS  $name (HTTP $code)"
    PASS=$((PASS + 1))
  else
    red "FAIL  $name (expected HTTP $expected, got $code) — $url"
    if [[ -s /tmp/nyx-smoke-body.txt ]]; then
      head -c 300 /tmp/nyx-smoke-body.txt | tr '\n' ' '
      echo
    fi
    FAIL=$((FAIL + 1))
  fi
}

echo "NyxCitadel smoke checks"
echo "BASE_URL=$BASE_URL"
echo

# Public pages should load
check "Landing page" "200" "$BASE_URL/"
check "Login page" "200" "$BASE_URL/login"
check "Signup page" "200" "$BASE_URL/signup"
check "Privacy page" "200" "$BASE_URL/privacy"
check "Terms page" "200" "$BASE_URL/terms"
check "Contact page" "200" "$BASE_URL/contact"

# Protected app routes should bounce unauthenticated users
# Middleware typically redirects to /login (307/308/302) or returns 401/403
DASH_CODE=$(curl -sS -o /dev/null -w '%{http_code}' -L --max-redirs 0 "$BASE_URL/dashboard" || true)
if [[ "$DASH_CODE" =~ ^(301|302|303|307|308|401|403)$ ]]; then
  green "PASS  Dashboard requires auth (HTTP $DASH_CODE)"
  PASS=$((PASS + 1))
else
  # Follow redirects and confirm we land on login
  FINAL=$(curl -sS -o /dev/null -w '%{url_effective}' -L "$BASE_URL/dashboard" || true)
  if [[ "$FINAL" == *"/login"* ]]; then
    green "PASS  Dashboard redirects to login ($FINAL)"
    PASS=$((PASS + 1))
  else
    red "FAIL  Dashboard did not require auth (HTTP $DASH_CODE, final=$FINAL)"
    FAIL=$((FAIL + 1))
  fi
fi

# Security headers (best-effort)
HEADERS=$(curl -sSI "$BASE_URL/" || true)
for h in "x-frame-options" "x-content-type-options" "strict-transport-security" "content-security-policy"; do
  if echo "$HEADERS" | grep -qi "^$h:"; then
    green "PASS  Header present: $h"
    PASS=$((PASS + 1))
  else
    yellow "WARN  Header missing: $h"
    WARN=$((WARN + 1))
  fi
done

# Cron auth checks
if [[ -z "$CRON_SECRET" ]]; then
  yellow "WARN  CRON_SECRET not set — skipping cron auth checks"
  WARN=$((WARN + 1))
else
  for path in \
    /api/cron/scrape \
    /api/cron/compliance-alerts \
    /api/cron/export-summaries
  do
    check "Cron unauthorized $path" "401" "$BASE_URL$path"
    check "Cron authorized $path" "200" "$BASE_URL$path" \
      -H "Authorization: Bearer $CRON_SECRET"
  done
fi

# Demo tooling must stay off in production
DEMO_CODE=$(curl -sS -o /tmp/nyx-smoke-body.txt -w '%{http_code}' \
  -X POST "$BASE_URL/api/admin/demo/reset" || true)
if [[ "$EXPECT_DEMO_DISABLED" == "1" ]]; then
  if [[ "$DEMO_CODE" =~ ^(401|403|404|405)$ ]]; then
    green "PASS  Demo reset disabled/unauthorized (HTTP $DEMO_CODE)"
    PASS=$((PASS + 1))
  else
    red "FAIL  Demo reset unexpected status HTTP $DEMO_CODE (expected 401/403/404 while ENABLE_DEMO_TOOLS is off)"
    FAIL=$((FAIL + 1))
  fi
fi

echo
echo "Results: $PASS passed, $FAIL failed, $WARN warnings"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi

green "All critical smoke checks passed."
