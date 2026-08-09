import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  MediaProvider,
  useSearch,
  usePlayer,
  useMediaEvents,
  useMediaContext,
} from '@headless-media/react';
import {
  SearchBar,
  VideoGrid,
  VideoPlayer,
  Lightbox,
  ReelSwiper,
} from '@headless-media/ui-react';
import type { VideoItem } from '@headless-media/ui-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const API_KEY = import.meta.env['VITE_PEXELS_API_KEY'] as string | undefined;

// ─── API key guard ────────────────────────────────────────────────────────────

function MissingKeyScreen() {
  return (
    <div className="app-error-screen">
      <div className="app-error-card">
        <div className="app-error-icon">🔑</div>
        <h1>API Key Required</h1>
        <p>
          Copy <code>apps/demo-web/.env.example</code> to{' '}
          <code>apps/demo-web/.env</code> and paste your{' '}
          <a href="https://www.pexels.com/api/" target="_blank" rel="noreferrer">
            Pexels API key
          </a>
          .
        </p>
        <pre>VITE_PEXELS_API_KEY=your_key_here</pre>
        <p>Then restart the dev server.</p>
      </div>
    </div>
  );
}

// ─── Inner app (inside MediaProvider) ────────────────────────────────────────

/**
 * This component is the ARCHITECTURE BOUNDARY IN ACTION.
 *
 * It is the only place in the codebase allowed to:
 *   1. Call hooks from @headless-media/react  (SDK state + actions)
 *   2. Render components from @headless-media/ui-react (headless UI)
 *   3. Map SDK types → UI prop types (the "adapter" responsibility)
 */
function MediaExplorer() {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'reels'>('grid');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const { store } = useMediaContext();

  // ── Activity Telemetry Emitter Subscription ───────────────────────────────
  useMediaEvents(event => {
    console.log('[demo-app:telemetry]', event.type, event.payload);
  });

  // ── SDK state from @headless-media/react ──────────────────────────────────
  const {
    results,
    isLoading,
    hasNextPage,
    error: searchError,
    search,
    loadMore,
    loadPopular,
  } = useSearch();

  const {
    videoId,
    status,
    currentTime,
    duration,
    volume,
    muted,
    error: playerError,
    selectVideo,
    setPlaying,
    setPaused,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleMute,
    setError,
  } = usePlayer();

  // ── Load popular videos on mount ──────────────────────────────────────────
  useEffect(() => {
    void loadPopular();
  }, [loadPopular]);

  // ── Type mapping: PexelsVideo[] → VideoItem[] ─────────────────────────────
  const videoItems = useMemo((): VideoItem[] =>
    results.map(v => ({
      id: v.id,
      thumbnailUrl: v.image,
      duration: v.duration,
      width: v.width,
      height: v.height,
      userName: v.user.name,
    })),
    [results],
  );

  // ── Current selected index in result set ──────────────────────────────────
  const selectedIndex = useMemo((): number => {
    if (videoId == null) return -1;
    return results.findIndex(v => v.id === videoId);
  }, [videoId, results]);

  // ── Resolve best playback URL for selected video ──────────────────────────
  const selectedVideoUrl = useMemo((): string | null => {
    if (videoId == null) return null;
    const video = results.find(v => v.id === videoId);
    if (!video) return null;
    const hd = video.video_files.find(f => f.quality === 'hd');
    const sd = video.video_files.find(f => f.quality === 'sd');
    return hd?.link ?? sd?.link ?? video.video_files[0]?.link ?? null;
  }, [videoId, results]);

  // ── Event handlers ────────────────────────────────────────────────────────

  const handleSearch = useCallback((q: string) => {
    search({ query: q });
  }, [search]);

  const handleGridSelect = useCallback((id: number) => {
    selectVideo(id);
    setPlaying();
    setIsLightboxOpen(true);
  }, [selectVideo, setPlaying]);

  const handleCloseLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setPaused();
  }, [setPaused]);

  const handlePreviousVideo = useCallback(() => {
    if (selectedIndex > 0 && results[selectedIndex - 1]) {
      const prevVideo = results[selectedIndex - 1];
      if (prevVideo) {
        selectVideo(prevVideo.id);
        setPlaying();
      }
    }
  }, [selectedIndex, results, selectVideo, setPlaying]);

  const handleNextVideo = useCallback(() => {
    if (selectedIndex < results.length - 1 && results[selectedIndex + 1]) {
      const nextVideo = results[selectedIndex + 1];
      if (nextVideo) {
        selectVideo(nextVideo.id);
        setPlaying();
      }
    }
  }, [selectedIndex, results, selectVideo, setPlaying]);

  const handleDownload = useCallback((id: number) => {
    const video = results.find(v => v.id === id);
    if (!video) return;
    const file = video.video_files.find(f => f.quality === 'hd') ?? video.video_files[0];
    if (!file) return;

    // Emits activity event via MediaEmitter in media-core
    store.recordDownload(id, file.quality, file.link);

    // Open video download URL in new tab
    window.open(file.link, '_blank');
  }, [results, store]);

  const handleReelActiveChange = useCallback((index: number) => {
    const video = results[index];
    if (video) {
      selectVideo(video.id);
      setPlaying();
    }
  }, [results, selectVideo, setPlaying]);

  const handleEnded = useCallback(() => {
    setPaused();
  }, [setPaused]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app__header">
        <a href="/" className="app__logo" aria-label="Headless Media home">
          <div className="app__logo-icon" aria-hidden="true">🎬</div>
          <span className="app__logo-text">Headless Media</span>
        </a>

        <SearchBar
          value={query}
          isLoading={isLoading}
          placeholder="Search Pexels videos…"
          onSearch={handleSearch}
          onChange={setQuery}
        />

        {/* View Mode Switcher */}
        <div className="app__view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={`view-toggle-btn${viewMode === 'grid' ? ' view-toggle-btn--active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Grid</span>
          </button>
          <button
            type="button"
            className={`view-toggle-btn${viewMode === 'reels' ? ' view-toggle-btn--active' : ''}`}
            onClick={() => setViewMode('reels')}
            aria-pressed={viewMode === 'reels'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="6" y="2" width="12" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            <span>Reels</span>
          </button>
        </div>
      </header>

      <main className="app__main">
        {searchError && (
          <div className="app__search-error" role="alert">
            <span aria-hidden="true">⚠️</span> {searchError}
          </div>
        )}

        {viewMode === 'grid' ? (
          <section className="app__grid-section">
            <VideoGrid
              videos={videoItems}
              selectedId={videoId}
              isLoading={isLoading}
              hasMore={hasNextPage}
              onSelect={handleGridSelect}
              onLoadMore={loadMore}
            />
          </section>
        ) : (
          <section className="app__reels-section">
            <ReelSwiper
              items={results}
              onActiveChange={handleReelActiveChange}
              renderItem={(video, isActive) => {
                const hd = video.video_files.find(f => f.quality === 'hd');
                const url = hd?.link ?? video.video_files[0]?.link ?? null;
                const isThisSelected = videoId === video.id;

                return (
                  <div className="reel-swiper__card">
                    <VideoPlayer
                      videoUrl={url}
                      isPlaying={isActive && isThisSelected && status === 'playing'}
                      isMuted={muted}
                      volume={volume}
                      currentTime={isThisSelected ? currentTime : 0}
                      duration={isThisSelected ? duration : video.duration}
                      status={isThisSelected ? status : 'idle'}
                      error={isThisSelected ? playerError : null}
                      onPlay={setPlaying}
                      onPause={setPaused}
                      onTimeUpdate={setCurrentTime}
                      onDurationChange={setDuration}
                      onVolumeChange={setVolume}
                      onMuteToggle={toggleMute}
                      onEnded={handleEnded}
                      onError={setError}
                    />
                  </div>
                );
              }}
            />
          </section>
        )}
      </main>

      {/* ── Lightbox (Grid selection popover) ── */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={handleCloseLightbox}
        onPrevious={selectedIndex > 0 ? handlePreviousVideo : undefined}
        onNext={selectedIndex < results.length - 1 ? handleNextVideo : undefined}
        ariaLabel="Video detail view"
      >
        {videoId != null && selectedVideoUrl && (
          <div className="lightbox-player-wrap">
            <VideoPlayer
              videoUrl={selectedVideoUrl}
              isPlaying={status === 'playing'}
              isMuted={muted}
              volume={volume}
              currentTime={currentTime}
              duration={duration}
              status={status}
              error={playerError}
              onPlay={setPlaying}
              onPause={setPaused}
              onTimeUpdate={setCurrentTime}
              onDurationChange={setDuration}
              onVolumeChange={setVolume}
              onMuteToggle={toggleMute}
              onEnded={handleEnded}
              onError={setError}
            />
            <div className="media-lightbox__actions">
              <span className="media-lightbox__meta">
                Video #{videoId}
              </span>
              <button
                type="button"
                className="media-lightbox__download-btn"
                onClick={() => handleDownload(videoId)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download Video</span>
              </button>
            </div>
          </div>
        )}
      </Lightbox>

      <footer className="app__footer">
        <p>
          Built with <strong>Headless Media SDK</strong> ·{' '}
          Videos by{' '}
          <a href="https://pexels.com" target="_blank" rel="noreferrer">Pexels</a>
        </p>
      </footer>
    </div>
  );
}

// ─── Root (with provider) ─────────────────────────────────────────────────────

export default function App() {
  if (!API_KEY) {
    return <MissingKeyScreen />;
  }

  return (
    <MediaProvider apiKey={API_KEY}>
      <MediaExplorer />
    </MediaProvider>
  );
}
