// Public API surface for @headless-media/core
// ─── Classes ─────────────────────────────────────────────────────────────────
export { PexelsClient } from './client/PexelsClient.js';
export { MediaStore } from './store/MediaStore.js';
export { Observable } from './store/observable.js';
export { MediaEmitter } from './events/MediaEmitter.js';

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

export type {
  // Events
  MediaEvent,
  MediaEventType,
  MediaEventMap,
  MediaEventHandler,
  DownloadEventPayload,
  ViewEventPayload,
} from './events/MediaEmitter.js';
