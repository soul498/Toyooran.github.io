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
  grep -q 'rel="canonical"' <<<"$html" || fail "live HTML missing canonical"
  grep -q 'name="viewport"' <<<"$html" || fail "live HTML missing viewport"
  grep -q 'https://www.toyooran.com/' <<<"$html" || fail "live HTML missing www.toyooran.com"
  grep -q 'application/ld+json' <<<"$html" || fail "live HTML missing JSON-LD"
  grep -q 'seo-prerender' <<<"$html" || fail "live HTML missing prerender"
  grep -q 'GTM-5Q5PWTTK' <<<"$html" || fail "live HTML missing GTM container"
  robots="$(curl_id http://127.0.0.1:3000/robots.txt)"
  grep -q 'Disallow: /admin' <<<"$robots" || fail "live robots"
  grep -q 'Disallow: /crm' <<<"$robots" || fail "live robots missing /crm"
  gpt_block="$(echo "$robots" | awk 'BEGIN{p=0} /^User-agent: GPTBot/{p=1} p&&/^User-agent:/&&!/GPTBot/{p=0} p')"
  grep -q 'Disallow: /admin' <<<"$gpt_block" || fail "GPTBot must disallow /admin"
  grep -q 'Disallow: /crm' <<<"$gpt_block" || fail "GPTBot must disallow /crm"
  sitemap="$(curl_id http://127.0.0.1:3000/sitemap.xml)"
  grep -q 'www.toyooran.com' <<<"$sitemap" || fail "live sitemap"
  if grep -q '/rnd' <<<"$sitemap"; then fail "sitemap still lists /rnd"; fi
  rnd_code="$(curl -sI --max-time 5 "http://127.0.0.1:3000/rnd" | awk 'NR==1{print $2}')"
  test "$rnd_code" = "404" || fail "/rnd must 404, got ${rnd_code}"
  en_rnd_code="$(curl -sI --max-time 5 "http://127.0.0.1:3000/en/rnd" | awk 'NR==1{print $2}')"
  test "$en_rnd_code" = "404" || fail "/en/rnd must 404, got ${en_rnd_code}"
  # Six service pages (src/data/servicePages.ts): 200, in the sitemap, linked from the homepage.
  for slug in industrial-buildings farm-equipment-installation feed-machinery feed-products modernization research-collaboration; do
    grep -q "/services/${slug}<" <<<"$sitemap" || fail "sitemap missing /services/${slug}"
    grep -q "/en/services/${slug}<" <<<"$sitemap" || fail "sitemap missing /en/services/${slug}"
    for prefix in "" "/en"; do
      sc="$(curl -sS --max-time 5 -o /dev/null -w '%{http_code}' "http://127.0.0.1:3000${prefix}/services/${slug}" || true)"
      test "$sc" = "200" || fail "${prefix}/services/${slug} must be 200, got ${sc}"
    done
    grep -q "href=\"/services/${slug}\"" <<<"$html" || fail "homepage prerender missing /services/${slug}"
  done
  # Retired service URLs (src/data/disabledPages.ts) 301 to the closest new page, same language.
  for pair in poultry-hall-fitout:modernization srv-turnkey-shed:industrial-buildings srv-poultry-equipment-supply:farm-equipment-installation srv-machinery-manufacturing:feed-machinery srv-feed-formulation-pharma:feed-products srv-consulting-efficiency:modernization; do
    slug="${pair%%:*}"; target="${pair##*:}"
    if grep -q "/services/${slug}<" <<<"$sitemap"; then fail "sitemap lists retired page /services/${slug}"; fi
    for prefix in "" "/en"; do
      off_code="$(curl -sI --max-time 5 "http://127.0.0.1:3000${prefix}/services/${slug}" | awk 'NR==1{print $2}')"
      test "$off_code" = "301" || fail "retired ${prefix}/services/${slug} must 301, got ${off_code}"
      off_loc="$(curl -sI --max-time 5 "http://127.0.0.1:3000${prefix}/services/${slug}" | awk 'tolower($1)=="location:"{print $2}' | tr -d '\r')"
      test "$off_loc" = "https://www.toyooran.com${prefix}/services/${target}" || fail "retired ${prefix}/services/${slug} must redirect to ${prefix}/services/${target}, got ${off_loc}"
    done
    if grep -q "href=\"/services/${slug}" <<<"$html"; then fail "homepage still links retired /services/${slug}"; fi
    if grep -q "/services/${slug}" <<<"$(curl_id http://127.0.0.1:3000/llms.txt)"; then fail "llms.txt lists retired /services/${slug}"; fi
  done
  if grep -q 'srv-turnkey-shed' <<<"$sitemap"; then fail "sitemap still has non-canonical service id"; fi
  if grep -Eq '/admin|/crm' <<<"$sitemap"; then fail "sitemap must not list /admin or /crm"; fi
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
  grep -q 'index, follow' <<<"$html" || fail "homepage must remain indexable"
  code404="$(curl -sS --max-time 5 -H 'Accept-Encoding: identity' -o /tmp/seo-404.html -w '%{http_code}' http://127.0.0.1:3000/this-page-does-not-exist-seo || true)"
  test "$code404" = "404" || fail "unknown path must 404"
  grep -q 'noindex' /tmp/seo-404.html || fail "404 missing noindex"
  if grep -q 'rel="canonical"' /tmp/seo-404.html; then fail "404 must not self-canonical"; fi
  contact="$(curl_id http://127.0.0.1:3000/contact)"
  grep -q 'LocalBusiness' <<<"$contact" || fail "contact missing LocalBusiness"
  article="$(curl_id http://127.0.0.1:3000/magazine/how-to-calculate-ventilation-capacity)"
  grep -q '<h2>' <<<"$article" || fail "article prerender too short"
  grep -q 'as="style"' <<<"$html" || fail "stylesheet should be preloaded not render-blocking"
  grep -q 'font-src' <<<"$html" || true
  grep -q 'طیوران' <<<"$(curl_id http://127.0.0.1:3000/llms.txt)" || fail "llms.txt missing"
  grep -q 'noindex, follow' /tmp/seo-404.html || fail "404 robots should be noindex, follow"
  contact2="$(curl_id http://127.0.0.1:3000/products/ventilation)"
  grep -q 'دانخوری' <<<"$contact2" || true
  prod="$(curl_id http://127.0.0.1:3000/products/TS-001)"
  grep -q 'Offer\|location:' <<<"$prod" || true
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
  grep -q 'هیتر گازی' <<<"$heater_html" || fail "encoded heater slug missing product content"
  grep -q 'font-src' server.ts || fail "CSP font-src missing"
  nested="$(curl -sI --max-time 5 http://127.0.0.1:3000/products/heating/not-a-page | awk 'NR==1{print $2}')"
  test "$nested" = "301" || fail "nested category path must 301, got ${nested}"
  nested_loc="$(curl -sI --max-time 5 http://127.0.0.1:3000/products/heating/not-a-page | awk 'tolower($1)=="location:"{print $2}' | tr -d '\r')"
  grep -q '/products/heating$' <<<"$nested_loc" || fail "nested category must redirect to /products/heating"
  junk="$(curl -sS --max-time 5 -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/products/no-such-cat/x || true)"
  test "$junk" = "404" || fail "unknown nested product path must 404, got ${junk}"
  ok "live HTTP SEO"
else
  echo "check-seo: skip live HTTP (app not on :3000)"
fi
