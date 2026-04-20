# CFIA — Cuentos de Ficción de IA

> Bilingual reading-first site and generation studio for short science-fiction stories written by AI, published within a shared narrative universe (**ECHO-7 / Tau Ceti Drift**).

---

## What this repo is now

Two things living together:

1. **A design system** — tokens, typography, and brutalist rules for the site chrome (`colors_and_type.css`, `preview/`, `assets/`). The original brief is preserved below under *Design System*.
2. **A running app** — React SPA (`ui_kits/website/`) + Express/Prisma backend (`server/`) that generates, persists, and cross-references cuentos through Claude and Gemini, with a shared **universe memory** and per-thread compaction.

```
├── README.md                  ← you are here (design brief + app overview)
├── SKILL.md                   ← Agent Skill manifest
├── colors_and_type.css        ← design tokens
├── preview/                   ← design-system-tab cards
├── assets/                    ← logos + generative SVG illustrations
├── ui_kits/website/           ← React SPA (Home, Catalog, Reader, Create, About)
├── server/
│   ├── index.js               ← Express API + static dist
│   ├── generate.js            ← Claude generator + shared schema/prompt
│   ├── generateGemini.js      ← Gemini generator
│   ├── universeMemory.js      ← update / compact / compactThread (Gemini Flash Lite)
│   ├── titleGuard.js          ← banned + overused title words
│   └── creativityKnobs.js     ← random per-call tonal knobs
└── prisma/                    ← schema (Story, Tag, Author, UniverseMemory, parentId)
```

## Application at a glance

### Stack

- **Frontend:** React 18, Vite, no router (in-page state machine). Components exposed on `window` for reuse (`window.ExpandContextViewer`, `window.UniverseMemoryViewer`).
- **Backend:** Node + Express, Prisma, SQLite locally / Postgres on Render.
- **AI:** Anthropic SDK (Claude Sonnet/Opus/Haiku 4.5) and `@google/genai` (Gemini 2.5 Pro / Flash / Flash Lite).
- **Auth:** single password in env; `x-create-auth` header gates write endpoints.

### Story model

Self-referential `Story.parentId` lets stories form trees. A child inherits its parents' world and is generated with the full ancestor chain (up to 5 levels) in context. A story can also be a root (no parent) that still draws on the universe memory.

### Universe memory

One `UniverseMemory` row per universe, holding a rolling bilingual summary and a JSON `entities` bucket (`personajes`, `lugares`, `objetos`, `eventos`). After each new story it is updated via Gemini Flash Lite. When it grows past ~8000 chars the UI offers an `◼ COMPACTAR MEMORIA` button — a user-triggered condensation (≤450 words / ≤15 entities per bucket, proper nouns preserved).

### Thread base (per-hilo compaction)

Separate from global memory: pick any cuento hoja, see its ancestor chain, and compact just that chain. The resulting summary is injected into the next NEW generation as `BASE DE HILO PREVIO`, telling ECHO-7 to branch from that world rather than continue it.

### Generation modes

- **NEW** — tags + length + form + provider + optional seed prompt + optional threadBase. Can fan out to both Claude and Gemini in parallel.
- **EXPAND** — angle (`secuela` · `precuela` · `lateral` · `eco` · `auto`), inherited or overridden form, length, optional curator prompt. Parent body is sent in full; ancestors as title + excerpt.

Timeouts scale by length (`short=60s · medium=100s · long=180s`). Claude `max_tokens` is 8192; JSON parse failures log `stop_reason` and the last 200 chars of output for diagnosis.

### Auth

`POST /api/auth/check` validates the password. The client stores it in `localStorage['cfia_create_auth_v1']` and sends it on every write. A 401 clears local state and re-prompts.

### Ops

- `npm run dev` — Vite + server together.
- `npx vite build` — outputs to `dist/`, served by Express in prod.
- `prisma migrate` — schema lives in `prisma/schema.prisma`.
- Render uses `DATABASE_URL` (Postgres). DB export/import scripts live at repo root.

---

# Design System

## Context

**Cuentos de Ficción de IA** ("AI Fiction Stories") began as a greenfield project: a reading-first website where hundreds of short AI-generated sci-fi stories live. No codebase, no Figma, no existing brand — this system was designed from a brief and a short conversation. The app has since grown into the generation studio described above, but the design language below still governs every surface.

The creative brief (from the user, in Spanish):

> *"quiero un diseño web para un sitio que va a mostrar cientos cortos de ciencia ficción creados por IA. Diseño minimalista y acorde a la temática. Simple pero efectivo."*

Plus these explicit direction answers:

- **Visual direction:** Sci-fi brutalist — hard black & white, geometric sans, strict grids
- **Mood:** Warm / human despite the AI
- **Color mode:** Dark by default (near-black with an índigo undertone)
- **Imagery:** Generative CSS/SVG abstract geometry — no photography, no AI-generated cover art
- **Language:** Spanish + English (bilingual)

**Products / surfaces covered:**

- **Website** (`ui_kits/website/`) — marketing home, catalog, reader, about. This is the only surface; there is no mobile app yet.

### Sources

None provided. This is an original system built from the brief above. If a codebase or Figma file appears later, it should supersede the decisions here — this is a starting point, not a final say.

---

## Brand name — how it appears in the wild

| Context | Render as |
|---|---|
| Logomark / favicon | **CFIA** (siglas, mono-spaced) |
| Header / nav | **Cuentos de Ficción de IA** (full, display sans) |
| Page titles / `<title>` | **CFIA — Cuentos de Ficción de IA** |
| Body copy / signoff | Cuentos de Ficción de IA, or simply *Cuentos* |

The siglas treatment (CFIA) is what makes the brutalist monogram work; the full Spanish name carries the literary weight. English speakers see the full name and infer meaning from "Ficción de IA" = "AI Fiction". We don't translate the brand name itself.

---

## Content fundamentals

### Voice

The site hosts AI-written fiction but is curated, edited, and framed by humans. The **editorial voice** (site chrome, navigation, metadata, about page) is human and warm. The **story voice** is whatever the story demands — that's the author's domain.

**Rule:** only the chrome speaks; stories speak for themselves.

### Tone

- **Literary first, tech-curious second.** This is not a demo of AI capabilities; it is a literary project that happens to source from AI.
- **Plainspoken, never jargon-y.** No "LLM," no "prompt engineering," no "token count" in user-facing copy. Fine in a colophon or metadata drawer.
- **Warm precision.** Specific, short sentences. Favor concrete nouns.
- **Quiet confidence.** No exclamation marks in chrome. No "amazing," "exciting," "revolutionary."

### Bilingual handling

- **Default is Spanish.** English is a secondary read — a toggle, never parallel columns.
- When English and Spanish appear on the same screen (e.g., the language toggle), set the **inactive** language in `var(--fg-2)` and the **active** in `var(--fg-0)`.
- Story slugs stay in Spanish (`/cuentos/el-silencio-de-marte`) even when the UI is in English.

### Casing

- **Titles of stories:** sentence case in Spanish (per RAE), title case in English.
- **Section labels / eyebrows:** ALL CAPS, mono, letter-spaced — `CATÁLOGO · 247 CUENTOS`.
- **Buttons:** sentence case, never ALL CAPS. `Leer cuento`, not `LEER CUENTO`.

### I vs. you

- **Editorial "we"** for the project (`Publicamos ficción breve escrita por máquinas`).
- **"Tú"** for direct address, not "usted" — the site is informal and modern.
- Never **"yo"** in chrome — individual voice belongs inside stories only.

### Emoji / symbols

- **No emoji** in chrome. They break brutalism.
- **Allowed glyphs** as typographic ornament: `→` `·` `§` `¶` `◻` `◼` `—` (em dash). Use them sparingly, in mono or the accent color.
- The **`◻` / `◼` square pair** is our brand shorthand — draft / published, off / on, unread / read.

### Examples (good)

- Home hero: *"Cientos de cuentos cortos de ciencia ficción. Escritos por máquinas. Curados por humanos."*
- Catalog filter: *"Filtrar por década imaginada"*
- Empty state: *"No hay cuentos aquí todavía. Volvé en un rato."*
- Author byline: *`MODELO · CLAUDE-3.5 · TEMP 0.9`*
- Footer signoff: *"Una colección viva. Actualizada cada semana."*

### Examples (avoid)

- ~~*"Welcome to the future of storytelling! 🚀"*~~ — slop, exclamation, rocket
- ~~*"AI-powered fiction at your fingertips"*~~ — tech marketing, not literary
- ~~*"Discover mind-blowing stories generated by cutting-edge LLMs"*~~ — every word is a smell

---

## Visual foundations

### Colors

Black-forward, with a cold **índigo undertone** in the "blacks" (`#0a0a0f` page bg) to keep the palette from feeling dead. Foreground is a **warm off-white** (`#f5f3ee`) — this warm/cold tension is what makes the system feel humane despite the brutalist skeleton.

A single accent: **CRT amber `#e8b84a`** — used for drop caps, active states, the pulse on "reading now," and small ornaments. Never for decoration alone. The amber is the only warmth; if a screen has no amber, it's pure black/white/grey.

- Semantic colors (`--danger`, `--success`, `--info`) exist but are desaturated; we rarely need them since most of the site is reading.
- **No gradients.** Ever. Brutalism is flat.
- **No translucency.** One exception: the reading-progress overlay at the top of story pages uses a 1px solid amber bar.

### Typography

Three families, each with a specific job:

1. **Space Grotesk** (display + UI) — geometric sans, a touch of warmth in its curves. Used for headings, buttons, nav, the logomark.
2. **Instrument Serif** (prose) — modern serif with character; an italic that feels *handwritten* more than *italicized*. Used **only** for story body text and long-form editorial prose.
3. **JetBrains Mono** (metadata + AI-provenance) — monospace. Used for eyebrows, labels, timestamps, model names, numeric stats. This is where the "AI" in the brand shows up — mono type is the machine's handwriting.

Scale is **modular and brutal** — big jumps (`--fs-4xl: 80px`, `--fs-5xl: 120px`) for hero moments; `--fs-base: 16px` for UI; `--fs-lg: 22px` for prose (long-form reading wants bigger serif).

Drop caps are standard on story openers, always in `--accent`.

### Spacing

Strict 8pt grid. `--sp-1` through `--sp-10`, nothing between. Larger rhythms (`--sp-8: 64px`, `--sp-9: 96px`) dominate — brutalism breathes.

Reading column is capped at `--reading-max: 680px` (65ch-ish at 22px serif). No exceptions; stories never go edge-to-edge.

### Backgrounds

- **Default:** `--bg-0` flat. No images, no noise, no gradients.
- **Generative geometry:** each story can have a procedurally-generated SVG "cover" — simple primitives (circles, rectangles, lines) in black/white/amber, composed by a seed derived from the story slug. See `assets/illustrations/`.
- **No full-bleed photography.** Period.

### Motion

- **Easing:** `--ease-out: cubic-bezier(0.2, 0.7, 0.2, 1)` for entrances; `--ease-in` for exits. No bounce, no spring.
- **Durations:** `--dur-fast: 120ms` for hover, `--dur-med: 220ms` for layout, `--dur-slow: 380ms` for page transitions.
- **Fades + slides of 4–8px only.** No scale-ups, no rotations, no parallax.
- **Respect `prefers-reduced-motion`.** Disable all transitions when set.

### Hover / press states

- **Hover** (links, buttons): color shifts to `--accent`, never opacity change.
- **Press** (buttons): no shrink. The button's "pressed" look is the loss of its hard `4px 4px 0` offset shadow — it snaps flat. That's the brutalist handshake.
- **Focus**: 2px solid amber outline, 2px offset. Always visible, never suppressed.

### Borders

- **Everything has a border.** Cards, buttons, inputs, tags, menu items. Brutalism lives in the hairline.
- **Three weights:** `--bw-hair: 1px` (default rules), `--bw-rule: 2px` (section dividers, button borders), `--bw-loud: 3px` (rare — hero frame, modal).
- Borders are `--rule` (dim) for surface separation, `--rule-strong` (bright) for loud punctuation.

### Shadows

One shadow. Ever.

```css
--shadow-offset: 4px 4px 0 var(--rule-strong);
```

A **hard 4px offset** of the loud rule color. No blur, no alpha. Used on primary buttons and featured story cards. On press, the shadow is removed (element snaps into the place its shadow implied).

There are no drop shadows, no elevation ladders, no Material-style shadow scales. If you need separation, use a border.

### Corner radii

- **`--radius-0: 0`** is the default for everything. Cards, buttons, images, inputs.
- `--radius-sm: 2px` is allowed for tiny chips.
- `--radius-full: 999px` only for genuinely circular things (avatars, the reading-progress dot).

### Cards

A card is a `1px solid var(--rule)` rectangle on `--bg-1`. No shadow, no radius, no padding-tricks. Featured cards get `--bw-rule` (2px) and the hard offset shadow. Internal structure is always a stack of rules.

### Protection gradients / capsules

None. Text on backgrounds always has enough contrast that we don't need a protection gradient. If imagery ever goes under text, the solution is a solid `--bg-0` rectangle behind the text block, not a gradient.

### Transparency / blur

- **Backdrop filters are forbidden.** No `backdrop-filter: blur()`. That's a glass-morphism tell.
- **Alpha on fills is forbidden.** Every fill is either 100% opaque or 0% (i.e., absent).
- The only allowed transparency is on `currentColor` text when used in decorative underlines — and even that is rare.

### Layout rules

- **Fixed elements:** only the top navigation and the right-side language toggle. The reader has a slim top progress bar. Nothing else is fixed.
- **Grid:** 12 columns, `--grid-gap: 24px`. Content respects `--content-max: 1440px`.
- **Reading pages ignore the 12-col grid** and center a `--reading-max: 680px` column instead.
- **Left-aligned** by default; centering is for hero pull-quotes only.

### Imagery color vibe

Since we don't use photography, this rule is short: **every illustration is black, off-white, and amber, in those exact values.** No blues, no purples. Slight off-axis line weights and deliberate "misaligned" primitives create the handmade-by-a-machine feeling.

---

## Iconography

### Approach

We avoid icons where a **label** would do. When an icon is unavoidable (navigation arrows, close buttons, language globe), we use **Lucide** (24px, stroke width 1.5) via CDN. Lucide's geometric stroke style matches Space Grotesk.

### Rules

- **Stroke-only icons.** No filled glyphs.
- **24×24 default.** Smaller contexts get 16×16 with the same 1.5 stroke.
- **Icons inherit `currentColor`.** Never hard-code colors in icon SVG.
- **Icons always pair with labels in nav.** Icon-only buttons are allowed only for universal actions (close `×`, back `←`).
- **No brand-colored icons.** Amber icons are reserved for the active/playing/current state.

### Emoji + Unicode

- **No emoji in chrome.** Zero exceptions.
- **Unicode typographic glyphs** are our ornament system:
  - `→` — forward navigation, "read more"
  - `←` — backward
  - `·` — meta separator (title · author · date)
  - `§` — section marker in the reader
  - `¶` — paragraph break in metadata
  - `◻` `◼` — brand shorthand for draft/published, unread/read
  - `—` — em dash; use instead of colons in headlines

### Loaded via CDN

```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
```

If the project later ships with its own icon set, drop SVGs in `assets/icons/` and replace the CDN reference.

---

## Substitutions flagged

- **Fonts are loaded via Google Fonts**, not bundled as TTF. If the final site needs self-hosting (privacy/EU), download Space Grotesk, Instrument Serif, and JetBrains Mono from Google Fonts and drop them in `fonts/`, then replace the `@import` at the top of `colors_and_type.css` with `@font-face` declarations.
- **Icons are Lucide via CDN.** If you want a different set (e.g., Phosphor, Tabler), swap it here — but preserve the 1.5 stroke weight.

---

## Asks for the user

This system was built from a brief, not from real product. A few things would sharpen it quickly:

1. **A logo direction** — I made a monogram (CFIA) in Space Grotesk Medium. Is that the vibe, or do you want something more custom (e.g., a sci-fi glyph, a wordmark-only approach)?
2. **The accent color** — I picked CRT amber `#e8b84a` for warmth. If you want something else (phosphor green, bone white, no accent at all), this is the single most impactful change.
3. **Drop-cap on every story, or just features?** Currently every story leads with a drop cap in amber.
4. **Do stories have human editors?** If yes, there's a spot in the byline for them. If no, remove that slot from the `StoryHeader` component.
