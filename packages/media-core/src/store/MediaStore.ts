import { Observable } from './observable.js';
import { MediaEmitter } from '../events/MediaEmitter.js';
import type { PexelsClient } from '../client/PexelsClient.js';
import type {
  MediaState,
  SearchParams,
  PlayerStatus,
} from '../types/index.js';

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: MediaState = {
  search: {
    query: '',
    results: [],
    page: 1,
    totalResults: 0,
    isLoading: false,
    error: null,
    hasNextPage: false,
  },
  player: {
    videoId: null,
    status: 'idle',
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    error: null,
  },
};

// ─── MediaStore ───────────────────────────────────────────────────────────────

/**
 * Central state store for the media SDK.
 *
 * - Contains ALL business logic (searching, pagination, player state).
 * - Framework wrappers (media-react, media-native) subscribe to `state$`
 *   and expose actions as hooks/context — they add zero business logic.
 * - Uses `Observable<MediaState>` for reactive updates.
 * - Exposes `events` (MediaEmitter) for activity telemetries (views, downloads).
 */
export class MediaStore {
  readonly state$: Observable<MediaState>;
  readonly events: MediaEmitter;
  private readonly client: PexelsClient;
  private _searchAbort: AbortController | null = null;

  constructor(client: PexelsClient, events?: MediaEmitter) {
    this.client = client;
    this.events = events ?? new MediaEmitter();
    this.state$ = new Observable<MediaState>(INITIAL_STATE);
  }

  // ─── Accessors ───────────────────────────────────────────────────────────

  get state(): MediaState {
    return this.state$.value;
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private patchSearch(patch: Partial<MediaState['search']>): void {
    this.state$.update(s => ({
      ...s,
      search: { ...s.search, ...patch },
    }));
  }

  private patchPlayer(patch: Partial<MediaState['player']>): void {
    this.state$.update(s => ({
      ...s,
      player: { ...s.player, ...patch },
    }));
  }

  // ─── Search actions ──────────────────────────────────────────────────────

  async search(params: SearchParams): Promise<void> {
    // Cancel any in-flight search
    this._searchAbort?.abort();
    this._searchAbort = new AbortController();

    this.patchSearch({
      query: params.query,
      isLoading: true,
      error: null,
      results: [],
      page: 1,
      totalResults: 0,
      hasNextPage: false,
    });

    try {
      const result = await this.client.search(params);
      this.patchSearch({
        results: result.videos,
        page: result.page,
        totalResults: result.total_results,
        hasNextPage: Boolean(result.next_page),
        isLoading: false,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      this.patchSearch({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Search failed',
      });
    }
  }

  async loadMore(): Promise<void> {
    const { search } = this.state;
    if (!search.hasNextPage || search.isLoading || !search.query) return;

    this.patchSearch({ isLoading: true, error: null });

    try {
      const result = await this.client.search({
        query: search.query,
        page: search.page + 1,
      });
      this.patchSearch({
        results: [...search.results, ...result.videos],
        page: result.page,
        hasNextPage: Boolean(result.next_page),
        isLoading: false,
      });
    } catch (err) {
      this.patchSearch({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Load more failed',
      });
    }
  }

  async loadPopular(page = 1, perPage = 15): Promise<void> {
    this.patchSearch({ isLoading: true, error: null, query: '' });
    try {
      const result = await this.client.getPopular(page, perPage);
      this.patchSearch({
        results: result.videos,
        page: result.page,
        totalResults: result.total_results,
        hasNextPage: Boolean(result.next_page),
        isLoading: false,
      });
    } catch (err) {
      this.patchSearch({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load popular videos',
      });
    }
  }

  // ─── Player actions ──────────────────────────────────────────────────────

  selectVideo(id: number): void {
    this.patchPlayer({
      videoId: id,
      status: 'loading',
      currentTime: 0,
      duration: 0,
      error: null,
    });
    this.events.emit('view', { videoId: id, timestamp: Date.now() });
  }

  recordDownload(videoId: number, quality: string, url: string): void {
    this.events.emit('download', { videoId, quality, url });
  }

  setPlayerStatus(status: PlayerStatus): void {
    this.patchPlayer({ status });
  }

  setCurrentTime(time: number): void {
    this.patchPlayer({ currentTime: time });
  }

  setDuration(duration: number): void {
    this.patchPlayer({ duration });
  }

  setVolume(volume: number): void {
    this.patchPlayer({ volume: Math.max(0, Math.min(1, volume)) });
  }

  toggleMute(): void {
    this.patchPlayer({ muted: !this.state.player.muted });
  }

  setPlayerError(error: string): void {
    this.patchPlayer({ status: 'error', error });
  }

  clearPlayer(): void {
    this.state$.update(s => ({ ...s, player: INITIAL_STATE.player }));
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  /** Cancel all in-flight requests. Call when the provider unmounts. */
  destroy(): void {
    this._searchAbort?.abort();
  }
}
