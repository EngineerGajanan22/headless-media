import type { VideoGridProps } from '../types.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="video-card video-card--skeleton" aria-hidden="true">
      <div className="skeleton-pulse" />
    </div>
  );
}

// ─── VideoGrid ────────────────────────────────────────────────────────────────

/**
 * Headless VideoGrid component.
 *
 * Renders a responsive grid of video thumbnails.
 * Shows skeleton cards while loading the first page.
 * Handles empty state, selection highlight, and "load more".
 *
 * No SDK imports. No Pexels knowledge. Everything comes in via props.
 */
export function VideoGrid({
  videos,
  selectedId,
  isLoading = false,
  hasMore = false,
  onSelect,
  onLoadMore,
  className = '',
}: VideoGridProps) {
  const isFirstLoad = isLoading && videos.length === 0;

  return (
    <section className={`video-grid ${className}`} aria-label="Video results">
      {videos.length > 0 && (
        <p className="video-grid__heading" aria-live="polite">
          <span className="video-grid__count">{videos.length}</span> videos
        </p>
      )}

      <div className="video-grid__items" role="list">
        {isFirstLoad
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : videos.length === 0
          ? (
            <div className="video-grid__empty">
              <div className="video-grid__empty-icon" aria-hidden="true">🎬</div>
              <p>Search for videos to get started</p>
            </div>
          )
          : videos.map(video => {
            const isSelected = selectedId === video.id;
            return (
              <div
                key={video.id}
                className={`video-card${isSelected ? ' video-card--selected' : ''}`}
                role="listitem"
                onClick={() => onSelect?.(video.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect?.(video.id);
                  }
                }}
                tabIndex={0}
                aria-label={`Video by ${video.userName}, ${formatDuration(video.duration)}`}
                aria-pressed={isSelected}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={`Thumbnail: video by ${video.userName}`}
                  className="video-card__thumbnail"
                  loading="lazy"
                  decoding="async"
                />
                <div className="video-card__overlay" aria-hidden="true">
                  <div className="video-card__play">
                    {isSelected ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="video-card__info">
                  <span className="video-card__duration">
                    {formatDuration(video.duration)}
                  </span>
                </div>
              </div>
            );
          })
        }
      </div>

      {(hasMore || (isLoading && videos.length > 0)) && (
        <div className="video-grid__load-more">
          {isLoading && videos.length > 0 ? (
            <div className="load-more-spinner" aria-label="Loading more videos" />
          ) : (
            <button
              id="load-more-btn"
              className="load-more-btn"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              Load More
            </button>
          )}
        </div>
      )}
    </section>
  );
}
