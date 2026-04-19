# Website — UI Kit

Interactive click-through prototype of the CFIA website. Covers four surfaces:

- **Home** — hero, featured story, story grid, newsletter CTA, footer
- **Catálogo** — filter chips, story list with metadata
- **Reader** — full story page with progress bar, serif prose, drop cap, footer nav
- **Acerca de** — manifesto / about page

Open `index.html` to click through the prototype. State is held locally in React; navigation is in-page (no real routing).

## Components

| File | Purpose |
|---|---|
| `App.jsx` | Top-level state machine, route switch |
| `Nav.jsx` | Top bar (logomark + links + lang toggle) |
| `Footer.jsx` | Site footer |
| `Home.jsx` | Landing page composition |
| `Catalog.jsx` | Catalog / list view |
| `Reader.jsx` | Story reader |
| `About.jsx` | Manifesto page |
| `StoryCard.jsx` | Reusable card for catalog + featured slots |
| `Illustration.jsx` | Generative SVG covers (seeded from slug) |
| `data.js` | Mock story data |
