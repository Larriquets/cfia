---
name: cfia-design
description: Use this skill to generate well-branded interfaces and assets for CFIA (Cuentos de Ficción de IA), a minimalist brutalist-sci-fi website publishing AI-generated short fiction in Spanish and English. Use for production components, throwaway prototypes, mocks, slides, or any visual artifact that should feel on-brand. Contains design tokens, color and type systems, fonts, generative illustration assets, iconography guidance, and a full website UI kit.
user-invocable: true
---

Read the `README.md` file within this skill for the full brand, voice, and visual-foundations spec, and explore the other available files:

- `colors_and_type.css` — drop-in CSS custom properties for colors, type, spacing, radii, shadows, motion
- `preview/` — one HTML specimen per design-system concept (type, colors, spacing, components, brand)
- `assets/logo.svg`, `assets/logomark.svg` — brand marks (CFIA monogram + full wordmark)
- `assets/illustrations/*.svg` — generative B&W + amber SVG illustrations (orbit, target, horizon, signal)
- `ui_kits/website/` — React 18 + JSX UI kit (no build step — React and Babel loaded from unpkg CDN, `<script type="text/babel">` transpiles in-browser). Components: `App.jsx`, `Nav.jsx`, `Footer.jsx`, `Home.jsx`, `Catalog.jsx`, `Reader.jsx`, `About.jsx`, `StoryCard.jsx`, `Illustration.jsx`; mock data in `data.js`. Per-component styles live as inline JS style objects; design tokens come from `colors_and_type.css`. Every component exports itself to `window.*` so sibling `<script>` tags can see it — preserve this pattern when adding components.

### Stack notes for production work
If the user asks you to port this to a real build system (Vite, Next.js, Astro, etc.): the components are already modular and tokens are already CSS custom properties, so migration is mostly mechanical — replace the CDN script tags with `import React from 'react'`, drop the `window.*` exports, and convert inline-style objects to CSS Modules or a CSS-in-JS library of your choice. The brand rules in `README.md` do not change.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets into your output folder and import `colors_and_type.css`; emit self-contained HTML the user can open. If working on production code, read the guidelines in `README.md` (voice, casing, bilingual rules, iconography, motion, press states) and lift exact values from `colors_and_type.css` — do not re-derive them.

If the user invokes this skill without further guidance, ask them what they want to build or design, ask a few targeted questions (surface, locale, density, whether it's editorial vs. app chrome), and act as an expert designer who outputs HTML artifacts or production code depending on the need.

Core reminders when designing in this brand:
- Dark by default. Near-black with an índigo undertone (`--bg-0: #0a0a0f`), warm off-white ink (`--fg-0: #f5f3ee`), single accent: CRT amber `#e8b84a`.
- Three type families, each with a specific job: Space Grotesk (display + UI), Instrument Serif (prose only), JetBrains Mono (metadata + AI provenance).
- Brutalism: everything has a 1px border; corners are `0`; the only shadow is `4px 4px 0 var(--rule-strong)` (zero blur, zero alpha); on press, the shadow is removed.
- No emoji. No gradients. No backdrop-blur. No translucency.
- Bilingual Spanish / English; Spanish default; `◻` / `◼` square pair is the brand shorthand for off/on, draft/published, unread/read.
