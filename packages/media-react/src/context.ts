import { createContext, useContext } from 'react';
import type { MediaStore } from '@headless-media/core';

export interface MediaContextValue {
  store: MediaStore;
}

export const MediaContext = createContext<MediaContextValue | null>(null);

/**
 * Internal hook to access the MediaStore from within MediaProvider.
 * Throws a descriptive error if used outside the provider tree.
 */
export function useMediaContext(): MediaContextValue {
  const ctx = useContext(MediaContext);
  if (ctx === null) {
    throw new Error(
      '[media-react] useMediaContext must be called inside <MediaProvider>. ' +
      'Wrap your app with <MediaProvider apiKey="...">.',
    );
  }
  return ctx;
}
