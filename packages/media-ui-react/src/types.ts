/**
 * Pure prop interfaces for @headless-media/ui-react.
 *
 * RULE: No imports from @headless-media/core, @headless-media/react, or any
 * SDK package. All types are defined here independently so that the UI library
 * is truly framework-agnostic in terms of data requirements.
 *
 * The app layer maps SDK types → these UI prop types.
 */

// ─── Shared ───────────────────────────────────────────────────────────────────

/**
 * A normalised video item as the UI understands it.
 * Deliberately does NOT extend PexelsVideo — the app maps to this shape.
 */
export interface VideoItem {
  id: number;
  thumbnailUrl: string;
  duration: number;
  width: number;
  height: number;
  userName: string;
  /** Resolved playback URL (HD preferred). Provided by the app layer. */
  videoUrl?: string;
}

// ─── VideoGrid ────────────────────────────────────────────────────────────────

export interface VideoGridProps {
  videos: VideoItem[];
  selectedId?: number | null;
  isLoading?: boolean;
  hasMore?: boolean;
  onSelect?: (id: number) => void;
  onLoadMore?: () => void;
  className?: string;
}

// ─── VideoPlayer ──────────────────────────────────────────────────────────────

/** Mirror of core's PlayerStatus — defined independently to avoid imports. */
export type UIPlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'ended';

export interface VideoPlayerProps {
  videoUrl: string | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  status: UIPlayerStatus;
  error?: string | null;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onVolumeChange?: (volume: number) => void;
  onMuteToggle?: () => void;
  onEnded?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

// ─── SearchBar ────────────────────────────────────────────────────────────────

export interface SearchBarProps {
  value: string;
  isLoading?: boolean;
  placeholder?: string;
  /** Called when the user submits the search form. */
  onSearch: (query: string) => void;
  /** Called on every keystroke — useful for controlled input patterns. */
  onChange?: (value: string) => void;
  className?: string;
}
