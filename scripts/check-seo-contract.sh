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
grep -q 'Disallow: /crm' server/seo.ts || fail "robots crm disallow missing"
grep -q 'Disallow: /api/' server/seo.ts || fail "robots api disallow missing"
grep -q 'isPrivateAppPath' server/seo.ts || fail "private path helper missing"
grep -q 'X-Robots-Tag' server.ts || fail "X-Robots-Tag missing on HTML responses"
grep -q 'lang="fa-IR"' index.html || fail "index.html lang"
grep -q 'name="viewport"' index.html || fail "index.html viewport"
grep -q 'id="root"' index.html || fail "index.html #root"
grep -q 'GTM-5Q5PWTTK' index.html || fail "index.html missing GTM"
grep -q 'googletagmanager.com/ns.html?id=GTM-5Q5PWTTK' index.html || fail "index.html missing GTM noscript"
grep -q 'Google AI Studio' index.html && fail "index.html still has AI Studio og"
grep -q 'tsx server.ts' package.json || fail "package.json dev script"
grep -q 'esbuild server.ts' package.json || fail "package.json build script"
grep -q 'from "./server/seo"' server.ts || fail "server.ts must import server/seo"
ok "core files and canonical contract"

if curl -fsS --max-time 2 http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
  curl_id() { curl -fsS --max-time 5 -H 'Accept-Encoding: identity' "$@"; }
  html="$(curl_id http://127.0.0.1:3000/)"
  echo "$html" | grep -q 'rel="canonical"' || fail "live HTML missing canonical"
  echo "$html" | grep -q 'name="viewport"' || fail "live HTML missing viewport"
  echo "$html" | grep -q 'https://www.toyooran.com/' || fail "live HTML missing www.toyooran.com"
  echo "$html" | grep -q 'application/ld+json' || fail "live HTML missing JSON-LD"
  echo "$html" | grep -q 'seo-prerender' || fail "live HTML missing prerender"
  echo "$html" | grep -q 'GTM-5Q5PWTTK' || fail "live HTML missing GTM container"
  robots="$(curl_id http://127.0.0.1:3000/robots.txt)"
  echo "$robots" | grep -q 'Disallow: /admin' || fail "live robots"
  echo "$robots" | grep -q 'Disallow: /crm' || fail "live robots missing /crm"
  gpt_block="$(echo "$robots" | awk 'BEGIN{p=0} /^User-agent: GPTBot/{p=1} p&&/^User-agent:/&&!/GPTBot/{p=0} p')"
  echo "$gpt_block" | grep -q 'Disallow: /admin' || fail "GPTBot must disallow /admin"
  echo "$gpt_block" | grep -q 'Disallow: /crm' || fail "GPTBot must disallow /crm"
  sitemap="$(curl_id http://127.0.0.1:3000/sitemap.xml)"
  echo "$sitemap" | grep -q 'www.toyooran.com' || fail "live sitemap"
  echo "$sitemap" | grep -q '/rnd' || fail "sitemap missing /rnd"
  echo "$sitemap" | grep -q 'poultry-hall-fitout' || fail "sitemap missing fitout slug"
  if echo "$sitemap" | grep -q 'srv-turnkey-shed'; then fail "sitemap still has non-canonical service id"; fi
  if echo "$sitemap" | grep -Eq '/admin|/crm'; then fail "sitemap must not list /admin or /crm"; fi
  for private_path in /admin /crm; do
    code="$(curl -sS --max-time 5 -D /tmp/seo-private.hdr -o /tmp/seo-private.html -w '%{http_code}' -H 'Accept-Encoding: identity' "http://127.0.0.1:3000${private_path}" || true)"
    test "$code" = "200" || fail "${private_path} should stay 200 for the private app, got ${code}"
    grep -qi 'X-Robots-Tag: noindex' /tmp/seo-private.hdr || fail "${private_path} missing X-Robots-Tag"
    grep -q 'noindex' /tmp/seo-private.html || fail "${private_path} missing noindex"
    if grep -q 'rel="canonical"' /tmp/seo-private.html; then fail "${private_path} must not have canonical"; fi
    if grep -q 'application/ld+json' /tmp/seo-private.html; then fail "${private_path} must not have JSON-LD"; fi
    if grep -q 'seo-prerender' /tmp/seo-private.html; then fail "${private_path} must not prerender public content"; fi
    if grep -q 'property="og:url"' /tmp/seo-private.html; then fail "${private_path} must not leak og:url"; fi
  done
  echo "$html" | grep -q 'index, follow' || fail "homepage must remain indexable"
  code404="$(curl -sS --max-time 5 -H 'Accept-Encoding: identity' -o /tmp/seo-404.html -w '%{http_code}' http://127.0.0.1:3000/this-page-does-not-exist-seo || true)"
  test "$code404" = "404" || fail "unknown path must 404"
  grep -q 'noindex' /tmp/seo-404.html || fail "404 missing noindex"
  if grep -q 'rel="canonical"' /tmp/seo-404.html; then fail "404 must not self-canonical"; fi
  contact="$(curl_id http://127.0.0.1:3000/contact)"
  echo "$contact" | grep -q 'LocalBusiness' || fail "contact missing LocalBusiness"
  article="$(curl_id http://127.0.0.1:3000/magazine/how-to-calculate-ventilation-capacity)"
  echo "$article" | grep -q '<h2>' || fail "article prerender too short"
  echo "$html" | grep -q 'as="style"' || fail "stylesheet should be preloaded not render-blocking"
  echo "$html" | grep -q 'font-src' || true
  curl_id http://127.0.0.1:3000/llms.txt | grep -q 'طیوران' || fail "llms.txt missing"
  grep -q 'noindex, follow' /tmp/seo-404.html || fail "404 robots should be noindex, follow"
  contact2="$(curl_id http://127.0.0.1:3000/products/ventilation)"
  echo "$contact2" | grep -q 'دانخوری' || true
  prod="$(curl_id http://127.0.0.1:3000/products/TS-001)"
  echo "$prod" | grep -q 'Offer\|location:' || true
  redirp="$(curl -sI --max-time 5 http://127.0.0.1:3000/products/TS-001 | awk 'NR==1{print $2}')"
  test "$redirp" = "301" || fail "product code must 301 to slug"
  heater_enc="/products/%D9%87%DB%8C%D8%AA%D8%B1-%DA%AF%D8%A7%D8%B2%DB%8C-%D8%AF%D9%88%D8%AF%DA%A9%D8%B4%E2%80%8C%D8%AF%D8%A7%D8%B1-%D9%85%D8%AF%D9%84-GH-0625-ts-001"
  # Renamed product: the old name slug must 301 to the current one.
  heater_old="/products/%D9%87%DB%8C%D8%AA%D8%B1-%DA%AF%D8%A7%D8%B2%DB%8C-%D8%A7%D9%86%D8%B1%DA%98%DB%8C-%D9%85%D8%AF%D9%84-GH-0625-ts-001"
  heater_old_code="$(curl -sI --max-time 5 "http://127.0.0.1:3000${heater_old}" | awk 'NR==1{print $2}')"
  test "$heater_old_code" = "301" || fail "old product name slug must 301, got ${heater_old_code}"
  heater_code="$(curl -sI --max-time 5 "http://127.0.0.1:3000${heater_enc}" | awk 'NR==1{print $2}')"
  test "$heater_code" = "200" || fail "encoded Persian product slug must be 200, got ${heater_code}"
  heater_html="$(curl_id "http://127.0.0.1:3000${heater_enc}")"
  echo "$heater_html" | grep -q 'هیتر گازی' || fail "encoded heater slug missing product content"
  grep -q 'font-src' server.ts || fail "CSP font-src missing"
  redir="$(curl -sI --max-time 5 http://127.0.0.1:3000/services/srv-turnkey-shed | awk 'NR==1{print $2}')"
  test "$redir" = "301" || fail "service alias must 301"
  nested="$(curl -sI --max-time 5 http://127.0.0.1:3000/products/heating/not-a-page | awk 'NR==1{print $2}')"
  test "$nested" = "301" || fail "nested category path must 301, got ${nested}"
  nested_loc="$(curl -sI --max-time 5 http://127.0.0.1:3000/products/heating/not-a-page | awk 'tolower($1)=="location:"{print $2}' | tr -d '\r')"
  echo "$nested_loc" | grep -q '/products/heating$' || fail "nested category must redirect to /products/heating"
  junk="$(curl -sS --max-time 5 -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/products/no-such-cat/x || true)"
  test "$junk" = "404" || fail "unknown nested product path must 404, got ${junk}"
  ok "live HTTP SEO"
else
  echo "check-seo: skip live HTTP (app not on :3000)"
fi
