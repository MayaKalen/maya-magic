# Maya Kalen — Maya Magic Portfolio

A bright, magic-themed multi-page portfolio site for Maya Kalen, Web Developer & Designer.

## Structure

- `index.html` — Home (hero, constellation stats, links out to every other page)
- `services.html` — My Craft (bento grid of services)
- `toolkit.html` — Ingredients of My Magic (accordion tech stack)
- `process.html` — How the Magic Happens (4-step process path)
- `portfolio.html` — Spellbook of Projects (filterable, all 38 projects link to the live site)
- `contact.html` — Contact (invitation card + a "Make a Wish" interactive toy)
- `about.html` — About page
- `css/style.css` — all styling (cream/green/gold theme, hand-drawn icon set, scroll progress bar, magnetic buttons)
- `js/script.js` — nav, filtering, accordion, scroll-reveal, magic wand cursor with star trail, magnetic buttons, wish widget
- `assets/` — favicon

## Local preview

No build step or dependencies. Any static file server works, e.g.:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1
```

Or open `index.html` directly in a browser (some effects rely on `fetch`-free relative paths, so a local server is recommended over `file://`).

## Deployment

Deployed via GitHub Pages, served from the `main` branch root.
