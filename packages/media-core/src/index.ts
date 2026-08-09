// Public API surface for @headless-media/core
// ─── Classes ─────────────────────────────────────────────────────────────────
export { PexelsClient } from './client/PexelsClient.js';
export { MediaStore } from './store/MediaStore.js';
export { Observable } from './store/observable.js';

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  // Pexels shapes
  PexelsVideo,
  PexelsUser,
  VideoFile,
  VideoPicture,
  SearchResult,
  SearchParams,
  // State
  PlayerStatus,
  PlayerState,
  SearchState,
  MediaState,
} from './types/index.js';
