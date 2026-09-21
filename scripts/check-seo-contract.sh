#!/bin/bash
# Fail if the SEO/deploy core was dropped (typical AI Studio overwrite).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail() { echo "check-seo: FAIL $*" >&2; exit 1; }
ok() { echo "check-seo: ok $*"; }

test -f server.ts || fail "server.ts missing"
test -f server/seo.ts || fail "server/seo.ts missing"
test -f server/catalog.ts || fail "server/catalog.ts missing"
test -f src/seo/resolveSeo.ts || fail "src/seo/resolveSeo.ts missing"
test -f server/auth.ts || fail "server/auth.ts missing"
test -f .forgejo/workflows/deploy.yml || fail "Forgejo workflow missing"
grep -q 'CANONICAL_ORIGIN = "https://www.toyooran.com"' src/seo/resolveSeo.ts || fail "canonical origin changed"
grep -q 'injectSeoTags' server.ts || fail "injectSeoTags not used in server.ts"
grep -q 'seo-prerender' server/seo.ts || fail "prerender block missing"
grep -q 'Disallow: /admin' server/seo.ts || fail "robots admin disallow missing"
grep -q 'Disallow: /api/' server/seo.ts || fail "robots api disallow missing"
grep -q 'lang="fa-IR"' index.html || fail "index.html lang"
grep -q 'id="root"' index.html || fail "index.html #root"
grep -q 'Google AI Studio' index.html && fail "index.html still has AI Studio og"
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
  robots="$(curl -fsS --max-time 5 http://127.0.0.1:3000/robots.txt)"
  echo "$robots" | grep -q 'Disallow: /admin' || fail "live robots"
  sitemap="$(curl -fsS --max-time 5 http://127.0.0.1:3000/sitemap.xml)"
  echo "$sitemap" | grep -q 'www.toyooran.com' || fail "live sitemap"
  echo "$sitemap" | grep -q '/rnd' || fail "sitemap missing /rnd"
  echo "$sitemap" | grep -q 'poultry-hall-fitout' || fail "sitemap missing fitout slug"
  if echo "$sitemap" | grep -q 'srv-turnkey-shed'; then fail "sitemap still has non-canonical service id"; fi
  code404="$(curl -sS --max-time 5 -o /tmp/seo-404.html -w '%{http_code}' http://127.0.0.1:3000/this-page-does-not-exist-seo || true)"
  test "$code404" = "404" || fail "unknown path must 404"
  grep -q 'noindex' /tmp/seo-404.html || fail "404 missing noindex"
  if grep -q 'rel="canonical"' /tmp/seo-404.html; then fail "404 must not self-canonical"; fi
  contact="$(curl -fsS --max-time 5 http://127.0.0.1:3000/contact)"
  echo "$contact" | grep -q 'LocalBusiness' || fail "contact missing LocalBusiness"
  article="$(curl -fsS --max-time 5 http://127.0.0.1:3000/magazine/how-to-calculate-ventilation-capacity)"
  echo "$article" | grep -q '<h2>' || fail "article prerender too short"
  redir="$(curl -sI --max-time 5 http://127.0.0.1:3000/services/srv-turnkey-shed | awk 'NR==1{print $2}')"
  test "$redir" = "301" || fail "service alias must 301"
  ok "live HTTP SEO"
else
  echo "check-seo: skip live HTTP (app not on :3000)"
fi
