#!/usr/bin/env python3
"""Local sitemap + internal-link crawl (fa + en). No CMS writes."""
import re, sys, urllib.parse, urllib.request, urllib.error, collections
from html.parser import HTMLParser

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3100"
# Published on the live CMS, absent from seed articles used by this local crawl.
CMS_ONLY_OK = {"/magazine/imachine-jet-heater", "/en/magazine/imachine-jet-heater"}
TIMEOUT = 30

class HrefParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []
        self.canonical = []
        self.hreflang = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "a" and "href" in d:
            self.hrefs.append(d["href"])
        if tag == "link" and d.get("rel") == "canonical" and "href" in d:
            self.canonical.append(d["href"])
        if tag == "link" and d.get("rel") == "alternate" and "hreflang" in d and "href" in d:
            self.hreflang.append((d["hreflang"], d["href"]))

def enc_path(path):
    parsed = urllib.parse.urlsplit(path if path.startswith("http") else "http://local" + path)
    quoted = urllib.parse.quote(urllib.parse.unquote(parsed.path), safe="/-._~")
    return quoted + (("?" + parsed.query) if parsed.query else "")

def request(path, method="GET", follow=False):
    if path.startswith("http://") or path.startswith("https://"):
        parsed = urllib.parse.urlsplit(path)
        url = BASE + enc_path(parsed.path + (("?" + parsed.query) if parsed.query else ""))
        if parsed.netloc.lower() not in ("127.0.0.1:3100", "localhost:3100", "www.toyooran.com", "toyooran.com"):
            url = path  # shouldn't happen for internal
    else:
        url = BASE + enc_path(path)
    req = urllib.request.Request(url, method=method, headers={"User-Agent": "toyooran-local-crawl/1.0"})
    try:
        opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler()) if follow else urllib.request.build_opener(NoRedirect)
        with opener.open(req, timeout=TIMEOUT) as r:
            body = r.read() if method == "GET" else b""
            return r.status, r.headers.get("Location") or "", dict(r.headers), body, r.geturl()
    except urllib.error.HTTPError as e:
        loc = e.headers.get("Location") or ""
        body = e.read() if method == "GET" else b""
        return e.code, loc, dict(e.headers), body, url

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def path_of(url):
    if not url:
        return ""
    if url.startswith("http://") or url.startswith("https://"):
        p = urllib.parse.urlparse(url)
        return p.path or "/"
    if url.startswith("//"):
        p = urllib.parse.urlparse("https:" + url)
        return p.path or "/"
    return url.split("?")[0].split("#")[0]

def is_internal(href):
    if not href or href.startswith("mailto:") or href.startswith("tel:") or href.startswith("javascript:"):
        return False
    if href.startswith("http://") or href.startswith("https://"):
        host = urllib.parse.urlparse(href).netloc.lower()
        return host in ("127.0.0.1:3100", "localhost:3100", "www.toyooran.com", "toyooran.com")
    return href.startswith("/") and not href.startswith("//")

def local_path(href):
    if href.startswith("http://") or href.startswith("https://"):
        return urllib.parse.urlparse(href).path or "/"
    return href.split("?")[0].split("#")[0] or "/"

def norm(path):
    try:
        return urllib.parse.unquote(path or "")
    except Exception:
        return path or ""

status_map = {}  # path -> (code, location, final if followed)

def check(path, follow=False):
    path = path.split("?")[0].split("#")[0]
    if not path.startswith("/"):
        path = "/" + path
    key = (path, follow)
    if key in status_map:
        return status_map[key]
    code, loc, hdrs, body, final = request(path, follow=follow)
    # Location may be absolute www.toyooran.com
    loc_path = local_path(loc) if loc else ""
    rec = (code, loc_path, local_path(final), body, hdrs)
    status_map[key] = rec
    return rec

# sitemap
code, _, _, sm_body, _ = check("/sitemap.xml", follow=True)
assert code == 200, f"sitemap {code}"
locs = re.findall(r"<loc>([^<]+)</loc>", sm_body.decode("utf-8", "replace"))
paths = [local_path(u) for u in locs]
print(f"sitemap {len(paths)} urls")

errors = []
redirects = []
for path in paths:
    code, loc, final, body, hdrs = check(path, follow=False)
    if 300 <= code < 400:
        # sitemap URLs must be 200, not redirects
        errors.append(f"SITEMAP REDIRECT {path} -> {code} {loc}")
        continue
    if code != 200:
        errors.append(f"SITEMAP {code} {path}")
        continue
    # parse links + canonical
    parser = HrefParser()
    try:
        parser.feed(body.decode("utf-8", "replace"))
    except Exception as e:
        errors.append(f"PARSE {path}: {e}")
        continue
    if path.startswith("/en"):
        cans = parser.canonical
        ok = any(norm(local_path(c)) == norm(path) or (norm(path) in ("/en", "/en/") and norm(local_path(c)) in ("/en", "/en/")) for c in cans)
        if not ok:
            errors.append(f"CANONICAL {path} {cans}")

print(f"checked {len(paths)} sitemap pages")

# Collect internal links from prerender (and whole page)
to_check = collections.OrderedDict()
for path in paths:
    rec = status_map.get((path, False))
    if not rec or rec[0] != 200:
        continue
    body = rec[3]
    parser = HrefParser()
    parser.feed(body.decode("utf-8", "replace"))
    for href in parser.hrefs:
        if not is_internal(href):
            continue
        lp = local_path(href)
        if re.search(r"\.[a-z0-9]{2,5}$", lp, re.I) and not lp.endswith(".xml"):
            continue  # assets
        if lp.startswith("/api/") or lp.startswith("/admin") or lp.startswith("/login") or lp.startswith("/crm") or lp.startswith("/dashboard"):
            continue
        to_check[lp] = path  # first found from

print(f"internal links from sitemap pages: {len(to_check)}")

chains = []
notfound = []
for path, src in to_check.items():
    code, loc, final, body, hdrs = check(path, follow=False)
    if code == 404 or code == 410:
        if norm(path) in CMS_ONLY_OK:
            continue
        notfound.append(f"404 from {src}: {path} ({code})")
        continue
    if 300 <= code < 400:
        # one hop: destination must be 200
        dest = loc or final
        if not dest:
            chains.append(f"REDIRECT no location {path} {code} from {src}")
            continue
        c2, loc2, final2, _, _ = check(dest, follow=False)
        if 300 <= c2 < 400:
            chains.append(f"CHAIN {path} -> {dest} ({code}) -> {loc2} ({c2}) from {src}")
        elif c2 != 200:
            notfound.append(f"REDIRECT TARGET {c2} {path} -> {dest} from {src}")
        else:
            redirects.append(f"{code} {path} -> {dest}")

# Explicit alias / slug / service checks
explicit = {
    "/products/pouya-butterfly-feeder": (200, None),
    "/products/jet-heater": (200, None),
    "/en/products/pouya-butterfly-feeder": (200, None),
    "/en/products/jet-heater": (200, None),
    "/products/ts-114": (301, "/products/pouya-butterfly-feeder"),
    "/products/ts-115": (301, "/products/jet-heater"),
    "/en/products/ts-114": (301, "/en/products/pouya-butterfly-feeder"),
    "/services/poultry-hall-fitout": (301, "/services"),
    "/services/srv-consulting-efficiency": (301, "/services"),
    "/en/services/poultry-hall-fitout": (301, "/en/services"),
    "/products/جت-هیتر-کارنو-ts-057": (301, "/products/جت-هیتر-ts-057"),
    "/en/products/جت-هیتر-کارنو-ts-057": (301, "/en/products/جت-هیتر-ts-057"),
}
# encode paths for request
def enc(path):
    parts = path.split("/")
    return "/" + "/".join(urllib.parse.quote(p) if p else "" for p in parts if p is not None).lstrip("/") if path != "/" else "/"
    # messier: quote each segment

def enc_path(path):
    segs = path.split("/")
    return "/".join(urllib.parse.quote(s) if s and re.search(r"[^A-Za-z0-9._~-]", s) else s for s in segs)

explicit_ok = []
for path, (want, dest) in explicit.items():
    code, loc, final, _, _ = request(enc_path(path), follow=False)
    locp = local_path(loc)
    if code != want or (dest and norm(locp) != norm(dest)):
        errors.append(f"EXPLICIT {path} got {code} {locp}, want {want} {dest}")
    else:
        explicit_ok.append(f"OK {code} {path} -> {locp or '200'}")

# karno must not appear in sitemap
banned = [u for u in locs if "کارنو" in urllib.parse.unquote(u) or "karno" in u.lower()]
if banned:
    errors.append(f"SITEMAP still has کارنو: {banned}")

print("\n=== explicit ===")
for line in explicit_ok:
    print(line)
print(f"\nredirect hops (internal, one-hop 200): {len(redirects)}")
print(f"sitemap urls: {len(paths)}")
print(f"internal links checked: {len(to_check)}")
print(f"404/410: {len(notfound)}")
print(f"chains: {len(chains)}")
print(f"errors: {len(errors)}")
for line in notfound + chains + errors:
    print(" !", line)

if notfound or chains or errors or banned:
    sys.exit(1)
print("CRAWL OK")
