# Blog: blog.waqasrana.space

## Owner context

Full background on Rana Waqas is in `../context/` (one level up). Read these before writing posts, updating the About page, or making brand decisions:

- `../context/linkedin-profile.md` — complete career history, tech stacks, certifications, education
- `../context/exeter-msc-generative-ai.md` — full MSc GenAI programme: module codes, descriptions, assessments, learning outcomes
- `../context/university-directory-index.md` — dissertation structure (LLM hallucination/metacognition), experiments, supervisor, findings to date
- `../context/dev-directory-index.md` — index of all projects across Ekho, The-Hexaa, Hyly, Fikar.ai, and personal repos by domain

**Current blog state (as of 2026-06-03):** 3 posts published (`local-llm`, `Gmail-automation`, `cookie-manager`). 23 posts archived (`published: false`) — stale, off-brand, or PII risk. About page rewritten to reflect current AI/ML positioning.

## Writing style rules

- **No em dashes.** Rana dislikes em dashes (—). Never use them in posts, the About page, or any blog content. Use a colon, comma, or split into a new sentence instead.
- **No emojis.** Anywhere in blog content: not in headings, not in prose, and not even inside code listings shown in a post (e.g. an app's own HTML strings). Plain text only.

## Blog Post Queue

`BLOG_QUEUE.md` holds upcoming post ideas, ranked and ready to pick up during free time. Each idea has a hook, target reader, biggest risk, and a bar it must clear. Includes an **academic-integrity guardrail** for dissertation-related posts (method/craft safe to publish now; specific thesis numbers held until after marking) and a list of parked/rejected ideas with reasons. Read it before drafting any new AI/research post. Update statuses (`queued` → `drafting` → `review` → `published`) as work progresses.

### Research workspace — `_research/` (local only, gitignored)

`_research/` is the work-in-progress workshop for blog posts. **It is gitignored (never pushed) and excluded from the Jekyll build.** Because the blog repo is public, WIP that may reference unexamined thesis material stays off git entirely; only the sanitized final post graduates into `_posts/`. Read `_research/README.md` for the full per-post process (brief → sources → outline → draft → review gate → graduate). Each post folder's `brief.md` carries a per-post integrity checklist. Note: this dir is local-only, so it is not backed up by the repo.

**Inline draft review:** human feedback on a draft uses `mdreview` (`~/Dev/personal/tools-utilities/mdreview/`), a standalone local tool. Run `mdreview _research/<slug>/draft.md`; it opens a browser reading view for inline annotation, streams notes to `draft.feedback.md` beside the draft, and live-reloads when the draft is edited. Feedback files stay inside the gitignored `_research/` folder.

## Stack
- **Theme**: VENDORED fork of Chirpy 7.5.0, ejected from the gem on 2026-06-10 (tag `pre-theme-eject` is the last gem-based commit). All theme files (`_layouts`, `_includes`, `_sass`, `assets`, `_data/locales`, etc.) live in this repo and are edited directly; there is no theme gem. Chirpy's MIT license kept at `LICENSE-chirpy`. The former gem's plugin deps are now explicit in `Gemfile` and `plugins:` in `_config.yml` (the gem's auto-require is gone).
- **Ruby**: 3.4 (CI), local debug uses rbenv 3.2.0
- **CI**: GitHub Actions — `.github/workflows/jekyll.yml`
- **Comments**: Giscus (waqaskhan137/ranawaqas, Announcements category)
- **Analytics**: GA4 G-ERD23968FK
- **Domain**: blog.waqasrana.space (CNAME), deployed to GitHub Pages

## Key Config
- `_config.yml` — Chirpy settings, giscus config, GA4
- `permalink: /posts/:title/` — post URLs use filename slug, NOT front matter title
- `baseurl: ""` — empty, site is at domain root
- `url: "https://blog.waqasrana.space"` — critical for asset paths

## Git Tags (rollback points)
- `pre-theme-eject` — last commit using the jekyll-theme-chirpy gem, before vendoring the theme into the repo
- `chirpy-v7-with-diagrams` — Chirpy v7.5 + D2 diagrams working + tabs removed (latest stable)
- `chirpy-v7-stable` — Chirpy v7.5, before diagrams
- `mediumish-stable` — Mediumish theme (abandoned)

## Diagram Pipeline
- **D2** diagrams: `.d2` source files in `assets/img/`
- CI compiles `.d2` → `.svg` with `d2 --sketch --theme 0`
- Post-processing in CI injects `width`/`height` into root SVG (required for `<img>` rendering)
- **Mermaid**: wired globally in `_includes/metadata-hook.html` (imports Mermaid v11 ESM from jsdelivr, converts `code.language-mermaid` blocks on load) — use ` ```mermaid ` fenced blocks in any post, no per-post `mermaid: true` needed. Chirpy has no `_layouts` override in this repo.
- **D2 sources**: `assets/img/dareen/webdev-flow.d2`, `assets/img/trading-strategy/trading-flow.d2`

## SSH / Git Remote
- Remote uses SSH alias `git@github.com-personal:waqaskhan137/ranawaqas.git`
- SSH key: `~/.ssh/id_ed25519_personal` (added to GitHub via `gh ssh-key add`)
- `gh` CLI authenticated as `waqaskhan137` via HTTPS token

## Theme Customisation (post-eject)
- The theme is local now: edit `_layouts/`, `_includes/`, `_sass/`, `assets/` directly. The old "shadow the gem file" override pattern is obsolete (there is no gem to shadow); historical overrides like the empty `_includes/trending-tags.html` still work simply as the real files.
- Prefer folding new styling into the theme SCSS over growing `assets/css/custom.css`; the 4-way cascade workarounds below predate the eject and can be migrated gradually.
- `site.theme` is nil (no gem): `_includes/head.html` and `assets/js/data/swconf.js` hardcode `/assets/css/jekyll-theme-chirpy.css`; the footer credit was deleted from `_includes/footer.html`.
- To remove sidebar tabs: delete the corresponding `_tabs/<name>.md` file. Tabs removed: categories, tags, archives — only Home and About remain.

## Chirpy CSS Override Gotchas

**Specificity trap — CSS variables.** Chirpy defines color variables inside `html[data-mode='light'|'dark']` selectors nested inside `@media (prefers-color-scheme)` blocks — specificity `(0,1,1)`. A plain `:root {}` override at `(0,1,0)` always loses. All color overrides in `assets/css/custom.css` must mirror the four-way cascade:
```css
@media (prefers-color-scheme: light) {
  html:not([data-mode]), html[data-mode='light'] { /* light vars */ }
  html[data-mode='dark'] { /* dark vars */ }
}
@media (prefers-color-scheme: dark) {
  html:not([data-mode]), html[data-mode='dark'] { /* dark vars */ }
  html[data-mode='light'] { /* light vars */ }
}
```

**`%link-hover` is hardcoded, not a variable.** Chirpy compiles `color: #d2603a !important` directly into CSS for hover states on links. Override by replicating the full compiled selector list with your color + `!important` in `custom.css`, loaded after the theme CSS.

**Font families are hardcoded in SCSS, not CSS variables.** Override with direct CSS property rules (e.g. `body { font-family: ... }`), not variable overrides.

**`metadata-hook.html`** is Chirpy's designated empty `<head>` injection point — shadow it at `_includes/metadata-hook.html` to add fonts and custom CSS without forking the gem.

**fail2ban on Chirpy's sidebar** — 6 icons overflow onto two rows because the default gap + dot separator fill the 260px sidebar. Fix is in `custom.css` Section E: hide `.icon-border` and reduce `margin-right` to `0.5rem`.

## Color Alignment with Portfolio

The portfolio's canonical color tokens and their blog equivalents in `assets/css/custom.css`:

| Token | Portfolio value | Blog CSS var | Notes |
|---|---|---|---|
| Light background | `#fafaf9` | `--main-bg`, `--card-bg` | Must set both — `--card-bg` defaults to `#ffffff` |
| Light text | `#111111` | `--text-color`, `--post-list-text-color` | Chirpy default is `#34343c` |
| Dark background | `#111111` | `--main-bg` | Cards stay `#1a1a1a` intentionally (depth) |
| Dark text | `#f8f7f5` (warm near-white) | `--text-color`, `--post-list-text-color` | Chirpy default is `#afafb1` (gray) — biggest mismatch |
| Light accent | `#0f766e` | `--link-color`, `--toc-highlight`, `--sidebar-active-color` | ✓ aligned |
| Dark accent | `#2dd4bf` | `--link-color`, `--toc-highlight`, `--sidebar-active-color` | ✓ aligned |

**Key gotcha**: `--card-bg` and `--text-color` are NOT overridden by default — always set them explicitly or Chirpy's defaults drift from the portfolio palette. All four blocks of the four-way cascade must include them.

## Known Issues & Fixes Applied
- D2 SVGs rendered at 0px height without the CI post-processing width/height injection
- D2 CI fix: check `width=` in the captured root `<svg>` tag, NOT `content[:300]` — child elements have `width=` too and cause the check to silently skip
- Chirpy PWA service worker caches aggressively — `Cmd+Shift+R` may not be enough; use DevTools → Application → Service Workers → Unregister, then reload
- Chirpy requires Ruby ~> 3.1; local system Ruby is 2.6 — use rbenv 3.2.0 for local builds

## Post Front Matter Notes
- Old posts use `category:` (singular) and `tag:` (singular) — Jekyll maps these to `page.categories`/`page.tags` so Chirpy templates work fine
- Most posts have titles added manually (some filenames had non-breaking spaces `\xa0`)
- Author set via `defaults` in `_config.yml` not per-post front matter

## Local Development
```bash
eval "$(rbenv init -)"   # activate rbenv
rbenv local 3.2.0
bundle install
bundle exec jekyll serve
```

## Workflow: Adding a New D2 Diagram
1. Create `assets/img/<folder>/diagram.d2`
2. In post, reference: `<img src="/assets/img/<folder>/diagram.svg" style="max-width:100%;height:auto;display:block;margin:0 auto;">`
3. Push — CI compiles D2 → SVG automatically

## Workflow: Adding a Mermaid Diagram
In any post, just write:
````
```mermaid
graph TD
    A --> B
```
````
No config needed — Mermaid v11 is loaded globally via `_includes/metadata-hook.html` (renders on page load; `quadrantChart`, flowcharts with subgraphs, and dotted edges all supported).

**Gotcha — avoid `{{ }}` in Mermaid (Jekyll Liquid collision).** The Mermaid hexagon node shape `id{{"label"}}` contains `{{ }}`, which Jekyll's Liquid evaluates and strips, turning `S{{"mdreview service"}}` into `Smdreview service` and breaking the diagram with "Syntax error in text" (only on the built site, not in local mermaid previews like mdreview). Use a non-`{{` node shape (rectangle `["..."]`, rounded `("...")`, stadium `(["..."])`) or wrap the block in `{% raw %}...{% endraw %}`. Single braces (`{ }`, and the `%%{init: ...}%%` directive) are fine; only the `{{`/`}}` pair triggers Liquid.
