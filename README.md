# Leizel Abana — Portfolio Website

A static portfolio site for Leizel Abana, Web Designer & Developer.

## Structure

- `index.html` — main one-page site (hero, services, tools, career, portfolio, contact)
- `about.html` — About page
- `css/style.css` — all styling
- `js/script.js` — nav, filtering, animations, roadmap, marquee
- `assets/` — favicon

## Local preview

No build step or dependencies. Any static file server works, e.g.:

```bash
npx serve .
```

Or open `index.html` directly in a browser (some effects rely on `fetch`-free relative paths, so a local server is recommended over `file://`).

## Deployment

Deployed via GitHub Pages, served from the `main` branch root.
