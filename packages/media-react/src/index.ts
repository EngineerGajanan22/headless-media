// ─── Components ───────────────────────────────────────────────────────────────
export { MediaProvider } from './MediaProvider.js';

// ─── Hooks ────────────────────────────────────────────────────────────────────
export { useSearch } from './hooks/useSearch.js';
export { usePlayer } from './hooks/usePlayer.js';
export { useVideo } from './hooks/useVideo.js';
export { useMediaEvents } from './hooks/useMediaEvents.js';
export { useMediaContext } from './context.js';

// ─── Prop types ───────────────────────────────────────────────────────────────
export type { MediaProviderProps } from './MediaProvider.js';
export type { UseSearchReturn } from './hooks/useSearch.js';
export type { UsePlayerReturn } from './hooks/usePlayer.js';
export type { UseVideoReturn } from './hooks/useVideo.js';

// ─── Re-export core types so consumers don't need to add @headless-media/core ─
export type {
  SearchParams,
  SearchState,
  PlayerState,
  PlayerStatus,
  MediaState,
  PexelsVideo,
  PexelsUser,
  VideoFile,
  SearchResult,
  MediaEvent,
  MediaEventType,
  MediaEventMap,
  MediaEventHandler,
  DownloadEventPayload,
  ViewEventPayload,
} from '@headless-media/core';
