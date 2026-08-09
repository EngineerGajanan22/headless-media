import type { PexelsVideo } from '@headless-media/core';
import { useSearch } from './useSearch.js';
import { usePlayer } from './usePlayer.js';

export interface UseVideoReturn {
  /** All videos in the current result set. */
  videos: PexelsVideo[];
  /** ID of the currently selected video (null if none). */
  selectedVideoId: number | null;
  /** Select a video to load in the player. */
  selectVideo: (id: number) => void;
  /** The full PexelsVideo object for the selected video, if found in results. */
  selectedVideo: PexelsVideo | undefined;
}

/**
 * Convenience hook that composes `useSearch` + `usePlayer`.
 * Returns the result list alongside the currently selected video.
 *
 * ```tsx
 * const { videos, selectedVideo, selectVideo } = useVideo();
 * ```
 */
export function useVideo(): UseVideoReturn {
  const { results } = useSearch();
  const { videoId, selectVideo } = usePlayer();

  const selectedVideo = videoId != null
    ? results.find(v => v.id === videoId)
    : undefined;

  return {
    videos: results,
    selectedVideoId: videoId,
    selectVideo,
    selectedVideo,
  };
}
