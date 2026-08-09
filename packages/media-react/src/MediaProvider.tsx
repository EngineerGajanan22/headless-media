import { useMemo, useEffect, type ReactNode } from 'react';
import { PexelsClient, MediaStore } from '@headless-media/core';
import { MediaContext } from './context.js';

export interface MediaProviderProps {
  /** Pexels API key — obtain from https://www.pexels.com/api/ */
  apiKey: string;
  children: ReactNode;
}

/**
 * Root provider for the media SDK.
 *
 * Creates a single `MediaStore` instance (backed by `PexelsClient`) for the
 * lifetime of the component tree. Tears down on unmount.
 *
 * ```tsx
 * <MediaProvider apiKey={process.env.PEXELS_API_KEY}>
 *   <App />
 * </MediaProvider>
 * ```
 */
export function MediaProvider({ apiKey, children }: MediaProviderProps) {
  const store = useMemo(() => {
    const client = new PexelsClient(apiKey);
    return new MediaStore(client);
  }, [apiKey]);

  useEffect(() => {
    return () => {
      store.destroy();
    };
  }, [store]);

  return (
    <MediaContext.Provider value={{ store }}>
      {children}
    </MediaContext.Provider>
  );
}
