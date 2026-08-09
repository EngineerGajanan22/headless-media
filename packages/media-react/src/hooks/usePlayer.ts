import { useState, useEffect, useCallback } from 'react';
import type { PlayerState } from '@headless-media/core';
import { useMediaContext } from '../context.js';

export interface UsePlayerReturn extends PlayerState {
  selectVideo: (id: number) => void;
  setPlaying: () => void;
  setPaused: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setError: (error: string) => void;
  clearPlayer: () => void;
}

/**
 * Subscribe to player state and get player control actions.
 *
 * ```tsx
 * const { status, videoId, selectVideo, setPlaying, setPaused } = usePlayer();
 * ```
 */
export function usePlayer(): UsePlayerReturn {
  const { store } = useMediaContext();
  const [playerState, setPlayerState] = useState<PlayerState>(
    () => store.state.player,
  );

  useEffect(() => {
    return store.state$.subscribe(s => setPlayerState(s.player));
  }, [store]);

  const selectVideo = useCallback((id: number) => store.selectVideo(id), [store]);
  const setPlaying = useCallback(() => store.setPlayerStatus('playing'), [store]);
  const setPaused = useCallback(() => store.setPlayerStatus('paused'), [store]);
  const setCurrentTime = useCallback((t: number) => store.setCurrentTime(t), [store]);
  const setDuration = useCallback((d: number) => store.setDuration(d), [store]);
  const setVolume = useCallback((v: number) => store.setVolume(v), [store]);
  const toggleMute = useCallback(() => store.toggleMute(), [store]);
  const setError = useCallback((e: string) => store.setPlayerError(e), [store]);
  const clearPlayer = useCallback(() => store.clearPlayer(), [store]);

  return {
    ...playerState,
    selectVideo,
    setPlaying,
    setPaused,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleMute,
    setError,
    clearPlayer,
  };
}
