import { useRef, useEffect, useCallback } from 'react';
import type { VideoPlayerProps } from '../types.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── VideoPlayer ──────────────────────────────────────────────────────────────

/**
 * Headless VideoPlayer component.
 *
 * Fully controlled — all state comes in as props, all events go out as callbacks.
 * Manages a real <video> element internally but delegates ALL state decisions
 * to the parent (play/pause/seek/volume all flow through props → effects → DOM).
 *
 * Pattern:
 *   User clicks Play → onPlay() prop called → parent updates store
 *   → isPlaying becomes true → useEffect → video.play()
 *
 * No SDK imports. No Pexels knowledge.
 */
export function VideoPlayer({
  videoUrl,
  isPlaying,
  isMuted,
  volume,
  currentTime,
  duration,
  status,
  error,
  onPlay,
  onPause,
  onTimeUpdate,
  onDurationChange,
  onVolumeChange,
  onMuteToggle,
  onEnded,
  onError,
  className = '',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Sync play/pause (controlled) ──────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    if (isPlaying) {
      const promise = video.play();
      promise?.catch(err => {
        if (err instanceof Error && err.name !== 'AbortError') {
          onError?.(err.message);
        }
      });
    } else {
      video.pause();
    }
  }, [isPlaying, videoUrl, onError]);

  // ── Sync volume / mute ────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  // ── Seek via progress bar ─────────────────────────────────────────────────
  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = Number(e.target.value);
      if (videoRef.current) videoRef.current.currentTime = time;
      onTimeUpdate?.(time);
    },
    [onTimeUpdate],
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onVolumeChange?.(Number(e.target.value)),
    [onVolumeChange],
  );

  const isIdle = status === 'idle' || !videoUrl;
  const isBuffering = status === 'loading';
  const hasError = status === 'error';

  return (
    <div className={`video-player ${className}`} aria-label="Video player">
      {/* ── Video element ── */}
      <div className="video-player__video-wrap">
        {videoUrl ? (
          <video
            ref={videoRef}
            key={videoUrl}                    // remount on URL change
            src={videoUrl}
            className="video-player__video"
            playsInline
            onTimeUpdate={e => onTimeUpdate?.(e.currentTarget.currentTime)}
            onDurationChange={e => onDurationChange?.(e.currentTarget.duration)}
            onEnded={onEnded}
            onError={() => onError?.('Failed to load video')}
            onCanPlay={() => {
              // If the parent already set isPlaying before the video was ready,
              // retry play once canplay fires.
              if (isPlaying && videoRef.current) {
                videoRef.current.play().catch(() => undefined);
              }
            }}
          />
        ) : (
          <div className="video-player__placeholder" aria-label="No video selected">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <p>Select a video to play</p>
          </div>
        )}

        {isBuffering && (
          <div className="video-player__overlay" aria-label="Buffering">
            <div className="video-player__spinner" aria-hidden="true" />
          </div>
        )}

        {hasError && (
          <div className="video-player__overlay video-player__overlay--error">
            <span aria-hidden="true">⚠️</span>
            <p className="video-player__error-msg">{error ?? 'Playback error'}</p>
          </div>
        )}
      </div>

      {/* ── Controls ── */}
      {!isIdle && (
        <div className="video-player__controls">
          {/* Progress */}
          <div className="video-player__progress" role="group" aria-label="Playback progress">
            <span className="video-player__time" aria-label={`Current time: ${formatTime(currentTime)}`}>
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              id="progress-bar"
              className="progress-bar"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Seek"
            />
            <span className="video-player__time" aria-label={`Duration: ${formatTime(duration)}`}>
              {formatTime(duration)}
            </span>
          </div>

          {/* Action row */}
          <div className="video-player__actions">
            <button
              id="play-pause-btn"
              className="player-btn player-btn--primary"
              onClick={isPlaying ? onPause : onPlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <div className="volume-control" role="group" aria-label="Volume">
              <button
                id="mute-btn"
                className="player-btn"
                onClick={onMuteToggle}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                id="volume-slider"
                className="volume-slider"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume level"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
