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
- `chirpy-v7-stable` — Chirpy v7.5, current production theme
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

## Known Issues & Fixes Applied
- D2 SVGs rendered at 0px height without the CI post-processing width/height injection
- Chirpy PWA service worker caches aggressively — hard refresh (`Cmd+Shift+R`) clears it
- Chirpy requires Ruby ~> 3.1; local system Ruby is 2.6 — use rbenv 3.2.0 for local builds
- `sass_dir`/`load_paths` config needed for jekyll-sass-converter v3 (Reverie era, no longer relevant)

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
