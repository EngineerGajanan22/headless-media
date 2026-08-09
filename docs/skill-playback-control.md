# Skill: Playback Control

## Overview

The `playback-control` skill enables an AI agent to manage video playback state
via the **Headless Media SDK** (`@headless-media/core`). All playback state is
in `MediaStore` — the actual media element (HTML5 `<video>`, `expo-av`, etc.)
is driven by the framework wrapper reacting to state changes.

---

## Contract

```typescript
import { MediaStore } from '@headless-media/core';
const store = new MediaStore(new PexelsClient(apiKey));
```

---

## Player State Shape (`PlayerState`)

```typescript
interface PlayerState {
  videoId: number | null;   // currently selected video ID
  status: PlayerStatus;     // see below
  currentTime: number;      // seconds elapsed
  duration: number;         // total duration in seconds
  volume: number;           // 0.0 – 1.0
  muted: boolean;
  error: string | null;
}

type PlayerStatus =
  | 'idle'      // nothing selected
  | 'loading'   // video selected, media not ready
  | 'playing'   // actively playing
  | 'paused'    // paused by user or end-of-video
  | 'error'     // unrecoverable error
  | 'ended';    // playback completed naturally
```

---

## Actions

### `selectVideo(id: number): void`

Selects a video for playback. Sets `status → 'loading'` and resets time.
The framework wrapper (e.g., `MediaProvider`) renders the `<video>` element;
the platform component drives it to play when `status` transitions to `'playing'`.

```typescript
store.selectVideo(42);
// store.state.player.videoId === 42
// store.state.player.status === 'loading'
```

---

### `setPlayerStatus(status: PlayerStatus): void`

Transition the player to any valid status. Typically called by the framework
wrapper in response to actual media events.

```typescript
store.setPlayerStatus('playing');
store.setPlayerStatus('paused');
store.setPlayerStatus('ended');
```

---

### `setCurrentTime(time: number): void`

Update `currentTime`. Called continuously by the `<video>` timeupdate event
(via the framework wrapper), or explicitly to seek.

```typescript
store.setCurrentTime(42.5);  // seek to 42.5 seconds
```

---

### `setDuration(duration: number): void`

Set total duration once the media metadata is loaded.

```typescript
store.setDuration(180); // 3 minutes
```

---

### `setVolume(volume: number): void`

Clamped to `[0.0, 1.0]` automatically.

```typescript
store.setVolume(0.7);
```

---

### `toggleMute(): void`

Toggle `muted` between `true` and `false`.

```typescript
store.toggleMute();
```

---

### `setPlayerError(error: string): void`

Mark the player as errored with a human-readable message.

```typescript
store.setPlayerError('Failed to load video');
// store.state.player.status === 'error'
```

---

### `clearPlayer(): void`

Reset all player state to initial values (idle, no video).

```typescript
store.clearPlayer();
```

---

## Reading State

```typescript
const unsub = store.state$.subscribe(state => {
  const {
    videoId, status, currentTime, duration, volume, muted, error
  } = state.player;
});
unsub(); // cleanup
```

---

## Typical Agent Flow

```
1. User selects a video in the UI
   → App calls: store.selectVideo(id)
   → Framework wrapper renders <video src={resolvedUrl}>

2. Video loads in browser
   → VideoPlayer's onCanPlay fires
   → App calls: store.setPlayerStatus('playing')
   → Framework wrapper's useEffect calls video.play()

3. Video plays
   → VideoPlayer's onTimeUpdate fires every ~250ms
   → App calls: store.setCurrentTime(time)

4. User pauses
   → App calls: store.setPlayerStatus('paused')
   → Framework wrapper's useEffect calls video.pause()

5. User seeks
   → App calls: store.setCurrentTime(newTime)
   → VideoPlayer also calls videoRef.current.currentTime = newTime

6. Video ends
   → VideoPlayer's onEnded fires
   → App calls: store.setPlayerStatus('paused')  (or 'ended')
```

---

## Resolving Playback URL

The store stores `videoId` (numeric), not the URL. The app layer resolves the
best URL from the search results:

```typescript
const video = store.state.search.results.find(v => v.id === videoId);
const hd = video?.video_files.find(f => f.quality === 'hd');
const sd = video?.video_files.find(f => f.quality === 'sd');
const url = hd?.link ?? sd?.link ?? video?.video_files[0]?.link ?? null;
```

This separation is intentional: `media-core` is agnostic to how URLs are stored
or streamed. The app decides quality preference.

---

## Dependencies

- `@headless-media/core` only.
- Platform playback (HTML5 video, expo-av) is the responsibility of the
  framework wrapper and UI component — the store only manages state.
