#!/bin/bash
# Fail if the SEO/deploy core was dropped (typical AI Studio overwrite).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail() { echo "check-seo: FAIL $*" >&2; exit 1; }
ok() { echo "check-seo: ok $*"; }

test -f server.ts || fail "server.ts missing"
test -f server/seo.ts || fail "server/seo.ts missing"
test -f server/auth.ts || fail "server/auth.ts missing"
test -f .forgejo/workflows/deploy.yml || fail "Forgejo workflow missing"
grep -q 'CANONICAL_ORIGIN = "https://www.toyooran.com"' server/seo.ts || fail "canonical origin changed"
grep -q 'injectSeoTags' server.ts || fail "injectSeoTags not used in server.ts"
grep -q 'seo-prerender' server/seo.ts || fail "prerender block missing"
grep -q 'Disallow: /admin' server/seo.ts || fail "robots admin disallow missing"
grep -q 'Disallow: /api/' server/seo.ts || fail "robots api disallow missing"
grep -q 'lang="fa-IR"' index.html || fail "index.html lang"
grep -q 'id="root"' index.html || fail "index.html #root"
grep -q 'tsx server.ts' package.json || fail "package.json dev script"
grep -q 'esbuild server.ts' package.json || fail "package.json build script"
grep -q 'from "./server/seo"' server.ts || fail "server.ts must import server/seo"
ok "core files and canonical contract"

if curl -fsS --max-time 2 http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
  html="$(curl -fsS --max-time 5 http://127.0.0.1:3000/)"
  echo "$html" | grep -q 'rel="canonical"' || fail "live HTML missing canonical"
  echo "$html" | grep -q 'https://www.toyooran.com/' || fail "live HTML missing www.toyooran.com"
  echo "$html" | grep -q 'application/ld+json' || fail "live HTML missing JSON-LD"
  echo "$html" | grep -q 'seo-prerender' || fail "live HTML missing prerender"
  curl -fsS --max-time 5 http://127.0.0.1:3000/robots.txt | grep -q 'Disallow: /admin' || fail "live robots"
  curl -fsS --max-time 5 http://127.0.0.1:3000/sitemap.xml | grep -q 'www.toyooran.com' || fail "live sitemap"
  ok "live HTTP SEO"
else
  echo "check-seo: skip live HTTP (app not on :3000)"
fi
