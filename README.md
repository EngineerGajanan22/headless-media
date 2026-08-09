# Headless Media SDK

A framework-agnostic, layered media SDK monorepo built with **TypeScript**, **pnpm workspaces**, and **Turborepo**. Powered by the [Pexels Video API](https://www.pexels.com/api/), it separates pure business logic and state management from platform adapters and headless UI components.

---

## Monorepo Architecture & Dependency Boundaries

The architecture enforces a strict **unidirectional dependency rule**. Cross-package leakage is prevented mechanically at compile-time via pnpm symlink isolation and enforced at lint-time via ESLint boundaries.

```
                  ┌──────────────────────┐
                  │    apps/demo-web     │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────┐
│ packages/media-react │          │packages/media-ui-react│
└──────────┬───────────┘          └──────────────────────┘
           │                                 ▲
           ▼                                 │
┌──────────────────────┐                     │
│ packages/media-core  │ ────────────────────┘ (NO IMPORT ALLOWED)
└──────────────────────┘
```

```
app ──> media-react ──> media-core
app ──> media-ui-react  (CRITICAL: media-ui-react imports NOTHING from core or wrappers)
```

> **Strict Boundary Guarantee**: `@headless-media/ui-react` does not list `@headless-media/core` or `@headless-media/react` in its `package.json` dependencies or TypeScript references. Attempting to import SDK types or state inside UI components yields a TS2307 compile error and ESLint `no-restricted-imports` error.

---

## Package Summary & Public API

### `@headless-media/core`
Pure, framework-agnostic TypeScript core logic. Zero React, DOM, or React Native dependencies. Operates in any JavaScript runtime supporting `fetch`.
- **Primary Exports**:
  - `MediaStore`: Central state store for search and video player state.
  - `Observable<T>`: Lightweight, zero-dependency reactive primitive for subscribing to state updates.
  - `PexelsClient`: Type-safe HTTP client wrapping Pexels Video API endpoints.
  - `PexelsVideo`, `SearchState`, `PlayerState`, `MediaState`: Comprehensive domain types.

### `@headless-media/react`
Thin React platform wrapper adapting `MediaStore` into React context and hooks. Contains zero business logic of its own.
- **Primary Exports**:
  - `<MediaProvider apiKey="...">`: Context provider managing `MediaStore` lifecycle.
  - `useSearch()``: Hook for reading search state and triggering search/pagination actions.
  - `usePlayer()``: Hook for player state subscription and playback controls.
  - `useVideo()``: Convenience hook composing search results with player selection state.

### `@headless-media/native`
React Native platform wrapper stub adhering to the exact same contract as `@headless-media/react` to ensure cross-platform contract parity.

### `@headless-media/ui-react`
Pure headless UI component library. Receives all data via props and emits changes via callbacks. Has zero knowledge of Pexels or `@headless-media/core`.
- **Primary Exports**:
  - `<SearchBar>`: Accessible, controlled search input component.
  - `<VideoGrid>`: Responsive grid with skeleton loaders, selection highlights, and infinite loading trigger.
  - `<VideoPlayer>`: Fully controlled HTML5 video player element with overlay controls and progress bar.
  - `VideoItem`, `VideoGridProps`, `VideoPlayerProps`: Independent prop types.

### `@headless-media/ui-native`
Headless React Native UI library stub matching the prop interfaces of `@headless-media/ui-react`.

### `apps/demo-web`
Vite + React web application. Serves as the sole orchestration layer connecting `@headless-media/react` hooks to `@headless-media/ui-react` components via explicit adapter mapping.

---

## Scope & Scoping Decisions

To deliver a production-quality foundation under time constraints, features were deliberately time-boxed and scoped:

| Feature Area | Status | Rationale |
|---|---|---|
| **Video Search & Playback** | Implemented | Core requirement; focused on rich state management and playback controls. |
| **Photo Search & Galleries** | Scoped Out | Excluded to keep the state machine simple and focused on video stream lifecycle. |
| **Web Platform Target** | Implemented | Fully functional Vite + React web application (`demo-web`). |
| **React Native Support** | Scoped Out (Stubs) | `media-native` and `media-ui-native` are structured as architectural stubs to demonstrate contract compatibility without introducing native build overhead. |
| **Lightbox / Reel Swiper** | Scoped Out | Scoped out to prioritize clean package boundaries and core component quality (`VideoGrid`, `VideoPlayer`). |

---

## Technical Tradeoffs & Design Decisions

### Client-Side API Key Exposure
The demo application accesses the Pexels API directly from the browser using `VITE_PEXELS_API_KEY`.
- **Tradeoff**: Inlining the API key into the client bundle is suitable for a serverless, client-only assignment demo.
- **Production Recommendation**: In a production enterprise setting, API requests should route through a backend proxy or API Gateway to mask third-party credentials and enforce server-side rate limits.

---

## Local Setup & Development

### Prerequisites
- **Node.js**: `>= 20`
- **pnpm**: `>= 9` (`npm install -g pnpm`)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/EngineerGajanan22/headless-media.git
cd headless-media

# Install dependencies across monorepo
pnpm install
```

### 2. Environment Configuration
Create a `.env` file inside `apps/demo-web/`:
```bash
cp apps/demo-web/.env.example apps/demo-web/.env
```
Edit `apps/demo-web/.env` and insert your [Pexels API Key](https://www.pexels.com/api/):
```env
VITE_PEXELS_API_KEY=your_actual_pexels_api_key_here
```

### 3. Development Server
```bash
# Run Vite dev server for demo-web
pnpm dev
# App will open at http://localhost:5173
```

### 4. Monorepo Build & Verification
```bash
# Build all packages in dependency order via Turborepo
pnpm build

# Run type checking across workspace
pnpm typecheck
```

---

## AI Assistance & Transparency

> **Developer Note / Attributions**:  
> [PLACEHOLDER: Add your AI pair-programming chat logs, prompt transcripts, or tool usage summaries here prior to final submission.]
> - **Chat Transcripts / Sessions**: `[Insert Link to Chat Transcript / Log]`
> - **AI Usage Breakdown**: Architecture design, boilerplate scaffolding, and documentation assistance paired with human technical review and verification.

---

## License

MIT