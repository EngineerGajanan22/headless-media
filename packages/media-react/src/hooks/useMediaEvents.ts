import { useEffect } from 'react';
import type { MediaEventHandler } from '@headless-media/core';
import { useMediaContext } from '../context.js';

/**
 * Hook to subscribe to activity events emitted by `MediaStore.events`.
 *
 * Automatically unsubscribes on component unmount or when the handler function reference changes.
 *
 * ```tsx
 * useMediaEvents(event => {
 *   if (event.type === 'download') {
 *     console.log('User downloaded:', event.payload.videoId);
 *   }
 * });
 * ```
 */
export function useMediaEvents(handler: MediaEventHandler): void {
  const { store } = useMediaContext();

  useEffect(() => {
    return store.events.subscribe(handler);
  }, [store, handler]);
}
