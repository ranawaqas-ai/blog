# Blog: blog.waqasrana.space

## Stack
- **Theme**: Chirpy v7.5 (jekyll-theme-chirpy gem)
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
- `chirpy-v7-with-diagrams` — Chirpy v7.5 + D2 diagrams working + tabs removed (latest stable)
- `chirpy-v7-stable` — Chirpy v7.5, before diagrams
- `mediumish-stable` — Mediumish theme (abandoned)

## Diagram Pipeline
- **D2** diagrams: `.d2` source files in `assets/img/`
- CI compiles `.d2` → `.svg` with `d2 --sketch --theme 0`
- Post-processing in CI injects `width`/`height` into root SVG (required for `<img>` rendering)
- **Mermaid**: wired in `_layouts/default.html` via ES module CDN — use ` ```mermaid ` fenced blocks in any post
- **D2 sources**: `assets/img/dareen/webdev-flow.d2`, `assets/img/trading-strategy/trading-flow.d2`

## SSH / Git Remote
- Remote uses SSH alias `git@github.com-personal:waqaskhan137/ranawaqas.git`
- SSH key: `~/.ssh/id_ed25519_personal` (added to GitHub via `gh ssh-key add`)
- `gh` CLI authenticated as `waqaskhan137` via HTTPS token

## Chirpy Theme Customisation Pattern
- To suppress any Chirpy widget, create an empty override at the same path in the repo: e.g. `_includes/trending-tags.html` (empty file) hides the Trending Tags panel
- To remove sidebar tabs: delete the corresponding `_tabs/<name>.md` file
- Current overrides: `_includes/trending-tags.html` (empty — hides trending tags panel)
- Tabs removed: categories, tags, archives — only Home and About remain

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
No config needed — Mermaid v11 is loaded globally via default layout.
