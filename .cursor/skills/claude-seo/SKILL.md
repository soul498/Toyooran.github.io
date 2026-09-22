---
name: claude-seo
description: >-
  Installs and runs AgriciDaniel/claude-seo (technical SEO, schema, E-E-A-T,
  GEO, PageSpeed, sitemaps, content briefs). Use when the user asks for an SEO
  audit, /seo commands, Claude SEO, schema, Core Web Vitals, PageSpeed, GEO,
  llms.txt, content briefs, or site-wide SEO analysis.
---

# Claude SEO (Cursor)

Open-source SEO pack for Cursor. Source: https://github.com/AgriciDaniel/claude-seo

On Toyooran (`/opt/Toyooran`), `docs/seo/` and `AGENTS.md` win over this pack when they conflict. Do not invent technical claims, Product prices, or Person author names.

## Install

Run from a throwaway directory (not the site repo root unless the user asks):

```bash
git clone --depth 1 https://github.com/AgriciDaniel/claude-seo.git && bash claude-seo/install.sh
```

After install:

- Skills: `$HOME/.claude/skills/` (`seo`, `seo-audit`, `seo-page`, …)
- Launcher: `"$HOME/.claude/skills/seo/scripts/claude-seo"`
- Never call bundled scripts with a bare Python interpreter
- Setup/repair only when asked: `"$HOME/.claude/skills/seo/scripts/claude-seo" setup`
- Diagnose: `"$HOME/.claude/skills/seo/scripts/claude-seo" doctor --json`

If the launcher is missing, run the install block above again. Inspect `install.sh` before piping remote scripts.

## Runtime

```bash
"$HOME/.claude/skills/seo/scripts/claude-seo" run <script.py> [args]
```

Useful scripts (from the pack):

```bash
"$HOME/.claude/skills/seo/scripts/claude-seo" run fetch_page.py https://www.toyooran.com
"$HOME/.claude/skills/seo/scripts/claude-seo" run parse_html.py https://www.toyooran.com
"$HOME/.claude/skills/seo/scripts/claude-seo" run pagespeed_check.py https://www.toyooran.com --json
"$HOME/.claude/skills/seo/scripts/claude-seo" run drift_baseline.py https://www.toyooran.com
```

On this worker, Google PageSpeed HTTP APIs may return 403. Prefer origin `http://127.0.0.1:3000` for lab checks. Live URL: `https://www.toyooran.com` (not apex `toyooran.com`).

## Command map

Load the matching sub-skill `SKILL.md` under `$HOME/.claude/skills/<name>/` before doing the work.

| User ask | Skill dir | Default target |
|----------|-----------|----------------|
| `/seo audit <url>` | `seo-audit` | full site, parallel specialists |
| `/seo page <url>` | `seo-page` | one URL |
| `/seo technical <url>` | `seo-technical` | crawl/index/CWV |
| `/seo schema <url>` | `seo-schema` | JSON-LD |
| `/seo content <url>` | `seo-content` | E-E-A-T |
| `/seo content-brief` | `seo-content-brief` | brief only |
| `/seo sitemap` | `seo-sitemap` | XML |
| `/seo images` | `seo-images` | image SEO |
| `/seo geo` | `seo-geo` | AI Overviews / GEO |
| `/seo plan` | `seo-plan` | strategy |
| `/seo local` | `seo-local` | NAP / GBP |
| `/seo google` | `seo-google` | GSC / PSI / CrUX |
| `/seo drift` | `seo-drift` | baseline/compare |
| `/seo setup` / `doctor` | launcher only | runtime |

Orchestrator notes live in `$HOME/.claude/skills/seo/SKILL.md`.

## Full audit

For `/seo audit` (or “full SEO audit”):

1. Confirm canonical origin (`https://www.toyooran.com` on this project).
2. Read `$HOME/.claude/skills/seo/SKILL.md` and the specialist skills you will use.
3. Cover at least: technical, content/E-E-A-T, schema, sitemap, performance, GEO. Add local if NAP/maps matter.
4. Synthesize PERCEIVE → ANALYZE → VALIDATE → ACT.
5. Bucket Critical / High / Medium / Low.
6. Every recommendation needs: observation, dependency, “how would we know this failed?”, leading indicator.
7. Do not ship fabricated scores, citations, or schema prices.

Toyooran extra: do not drop `#seo-prerender`, canonical, or `/admin` `/api` noindex. Content needs Brief + evidence (`docs/seo/CONTENT-BRIEF-TEMPLATE.md`). Arvan 307 is owner C1, not a fake CWV fix.

## Cursor notes

- There is no Claude Code `${CLAUDE_PLUGIN_ROOT}` here; use `$HOME/.claude/skills/seo/scripts/claude-seo`.
- Subagents: use Cursor Task/explore agents, or run specialists sequentially if spawn is unavailable.
- SSL: investigate cert failures; do not disable verification.
- Screenshots from the pack may land under `/tmp/`.
