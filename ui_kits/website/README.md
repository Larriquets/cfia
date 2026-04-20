# Website — ECHO-7 / Tau Ceti Drift

Bilingual (ES/EN) React SPA for the CFIA sci-fi story project. The UI ships the editorial voice and the generation surface; the brutalist design system lives in the root `colors_and_type.css`.

The app is no longer a static prototype — it talks to an Express backend in `server/` that persists stories in Postgres/SQLite (Prisma), calls Claude and Gemini, and maintains a shared **universe memory** so stories cross-reference recurring entities.

## Surfaces

| Route | File | What it is |
|---|---|---|
| Home | `Home.jsx` | Hero, featured story, recent grid |
| Catálogo | `Catalog.jsx` | All stories, filter chips, tag search |
| Lector | `Reader.jsx` | Long-form reading view. Hosts the **Expand panel** and the **Context Viewer** (see below) |
| Acerca de | `About.jsx` | Manifesto |
| Crear | `Create.jsx` | Password-gated generation panel — NEW and EXPAND modes |

`App.jsx` is the top-level state machine — no bundler routing, just in-page switching.

## Generation modes (Create)

### NEW
Generate an original cuento. User picks tags, length, narrative form, provider (Claude / Gemini / both), model, temperature, and an optional seed prompt. The request is enriched server-side with:

- **Universe memory block** — rolling summary + recurring entities (personajes, lugares, objetos, eventos) updated after each new story by Gemini Flash Lite.
- **Thread base block** *(optional)* — if the user compacts a specific chain (see Thread Base Viewer below), its summary is injected as *BASE DE HILO PREVIO*. The cuento is told to be born as a **rama**, not a continuación.
- **Creativity knobs + title guard** — random per-call tonal knobs; bans repeated/overused title words.

### EXPAND
Generate a new cuento that continues, precedes, or casts light on an existing one. Server walks the parentId chain up to 5 levels and includes:

- Parent body in full.
- Ancestor titles + excerpts (so grandchildren see the whole line, not just their direct parent).
- Angle (`auto` · `secuela` · `precuela` · `lateral` · `eco`), inherited or overridden form, length, and an optional curator prompt.

Timeouts scale by length: `short=60s · medium=100s · long=180s`.

## In-UI context inspection

Three viewers — all component-exposed on `window` so Create.jsx and Reader.jsx can reuse them:

- **`window.ExpandContextViewer`** — shown in the Expand panel (Reader + Create). Fetches `/api/stories/:slug/expand-context` and shows ancestor chain, parent body stats, universe-memory block, and total char count that will hit the model.
- **`window.UniverseMemoryViewer`** — shown in Create NEW. Displays the current universe summary + entities. If it has grown past ~8000 chars, offers an `◼ COMPACTAR MEMORIA` button that calls `POST /api/universe/compact` (Gemini Flash Lite, ≤450 words / ≤15 entities per bucket, proper nouns preserved).
- **Thread Base Viewer** *(inlined in Create.jsx NEW)* — pick any story with ancestors, see its full chain (num + title + excerpt), then `◼ COMPACTAR ESTE HILO`. The resulting summary (+ entities) is stored locally and sent to `/api/stories/generate` as `threadBase`. Use this to spawn a new cuento that inherits a specific hilo's world without being its direct child.

All compact operations are auth-gated by the CREAR password (`x-create-auth` header).

## Auth

Local-storage key `cfia_create_auth_v1` holds the password after a successful `/api/auth/check`. Wrong password → 401 → UI clears the key and prompts again. Only write endpoints (generate, expand, compact, compact-thread) require it.

## Components

| File | Purpose |
|---|---|
| `App.jsx` | Top-level state machine, route switch, story list fetch |
| `Nav.jsx` | Top bar (logomark + links + lang toggle) |
| `Footer.jsx` | Site footer |
| `Home.jsx` | Landing composition |
| `Catalog.jsx` | Catalog / list view with filters |
| `Reader.jsx` | Story reader + Expand panel + ExpandContextViewer + UniverseMemoryViewer (exposed on `window`) |
| `About.jsx` | Manifesto |
| `Create.jsx` | Password-gated generation (NEW + EXPAND modes) + inline ThreadBaseViewer |
| `StoryCard.jsx` | Reusable card for catalog + featured slots |
| `Illustration.jsx` | Generative SVG covers (seeded from slug) |
| `data.js` | (Legacy mock data — live stories come from `/api/stories`) |

## API surface (what the UI calls)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/stories` | List all stories |
| GET | `/api/stories/:slug` | Single story + parent/children |
| GET | `/api/stories/:slug/expand-context` | Preview what EXPAND will send to the model |
| GET | `/api/stories/:slug/thread` | Walk parentId chain upward, return cuento chain |
| GET | `/api/universe` | Current universe memory (summary + entities) |
| POST | `/api/auth/check` | Password gate |
| POST | `/api/stories/generate` | NEW mode — accepts optional `threadBase` |
| POST | `/api/stories/:slug/expand` | EXPAND mode |
| POST | `/api/stories/:slug/compact-thread` | Condense a specific ancestor chain via Gemini Flash Lite |
| POST | `/api/universe/compact` | Condense global universe memory |

## Build

```bash
npx vite build      # outputs to ../../dist (served by Express in prod)
npm run dev         # Vite dev server + server/index.js together
```
