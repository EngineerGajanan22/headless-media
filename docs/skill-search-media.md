# Skill: Search Media

## Overview

The `search-media` skill enables an AI agent to search for videos via the
**Headless Media SDK** (`@headless-media/core`). The agent can trigger a new
search, paginate results, or load the popular feed — all without any UI
rendering concerns.

---

## Contract

```typescript
import { MediaStore } from '@headless-media/core';

// Instantiate once per session
const store = new MediaStore(new PexelsClient(apiKey));
```

---

## Actions

### `search(params: SearchParams): Promise<void>`

Runs a keyword search. Cancels any in-flight request.

| Field | Type | Default | Description |
|---|---|---|---|
| `query` | `string` | _(required)_ | Free-text search term |
| `page` | `number` | `1` | Result page number |
| `per_page` | `number` | `15` | Results per page (max 80) |
| `orientation` | `'landscape' \| 'portrait' \| 'square'` | — | Aspect filter |
| `size` | `'large' \| 'medium' \| 'small'` | — | Resolution filter |

**Agent usage example:**
```typescript
await store.search({ query: 'mountain sunrise', orientation: 'landscape' });
const { results, totalResults, hasNextPage } = store.state.search;
// results: PexelsVideo[]
```

---

### `loadMore(): Promise<void>`

Appends the next page of results to `state.search.results`. Safe to call if
`hasNextPage` is false — it will no-op.

```typescript
if (store.state.search.hasNextPage) {
  await store.loadMore();
}
```

---

### `loadPopular(page?, perPage?): Promise<void>`

Loads the Pexels curated popular feed. Replaces search results.

```typescript
await store.loadPopular();
```

---

## Reading State

Subscribe to `state$` to receive every state update:

```typescript
const unsub = store.state$.subscribe(state => {
  const { results, isLoading, error, hasNextPage } = state.search;
  // React to changes
});

// Cleanup
unsub();
```

Or read synchronously at any time:
```typescript
const { results } = store.state.search;
```

---

## Result Shape (`PexelsVideo`)

```typescript
interface PexelsVideo {
  id: number;
  image: string;         // thumbnail URL
  duration: number;      // seconds
  width: number;
  height: number;
  user: { id: number; name: string; url: string };
  video_files: Array<{
    quality: 'hd' | 'sd' | 'hls' | 'uhd';
    link: string;        // direct MP4/HLS URL
    width: number | null;
    height: number | null;
    fps: number | null;
  }>;
}
```

---

## Error Handling

- `state.search.error` is set to a human-readable string on failure.
- `isLoading` is always reset to `false` after resolve or reject.
- Abort errors (from cancelled searches) are silently swallowed.

---

## Typical Agent Flow

```
1. Agent receives intent: "find relaxing nature videos"
2. Agent calls: store.search({ query: 'relaxing nature', per_page: 20 })
3. Agent reads: store.state.search.results → maps to UI VideoItem[]
4. If user scrolls to bottom: store.loadMore()
5. When done: store.destroy()   ← cancels any pending fetch
```

---

## Dependencies

- `@headless-media/core` only. No React, no DOM, no framework.
- Suitable for use in Node.js, Deno, browser, React Native, or any JS runtime
  with native `fetch`.
