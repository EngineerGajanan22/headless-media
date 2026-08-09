import { useState, useMemo, useEffect, useCallback } from 'react';
import { MediaProvider, useSearch, usePlayer } from '@headless-media/react';
import { SearchBar, VideoGrid, VideoPlayer } from '@headless-media/ui-react';
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
  // This is the explicit adapter layer — UI knows nothing about PexelsVideo.
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

  // ── Resolve best playback URL for the selected video ──────────────────────
  const selectedVideoUrl = useMemo((): string | null => {
    if (videoId == null) return null;
    const video = results.find(v => v.id === videoId);
    if (!video) return null;
    // Prefer HD, fall back to SD, then any available file
    const hd = video.video_files.find(f => f.quality === 'hd');
    const sd = video.video_files.find(f => f.quality === 'sd');
    return hd?.link ?? sd?.link ?? video.video_files[0]?.link ?? null;
  }, [videoId, results]);

  // ── Event handlers ────────────────────────────────────────────────────────

  const handleSearch = useCallback((q: string) => {
    search({ query: q });
  }, [search]);

  const handleSelect = useCallback((id: number) => {
    selectVideo(id);
    // Optimistically mark as playing — VideoPlayer will retry on canplay
    setPlaying();
  }, [selectVideo, setPlaying]);

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

        {/* Wall demonstrated: SearchBar imported from ui-react, knows nothing about Pexels */}
        <SearchBar
          value={query}
          isLoading={isLoading}
          placeholder="Search Pexels videos…"
          onSearch={handleSearch}
          onChange={setQuery}
        />
      </header>

      <main className="app__main">
        {/* ── Player (only when a video is selected) ── */}
        {videoId != null && (
          <section className="app__player-section" aria-label="Video player">
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
          </section>
        )}

        {/* ── Video grid ── */}
        <section className="app__grid-section">
          {searchError && (
            <div className="app__search-error" role="alert">
              <span aria-hidden="true">⚠️</span> {searchError}
            </div>
          )}

          <VideoGrid
            videos={videoItems}
            selectedId={videoId}
            isLoading={isLoading}
            hasMore={hasNextPage}
            onSelect={handleSelect}
            onLoadMore={loadMore}
          />
        </section>
      </main>

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
