import { useState, useEffect, useCallback } from 'react';
import type { SearchState, SearchParams } from '@headless-media/core';
import { useMediaContext } from '../context.js';

export interface UseSearchReturn extends SearchState {
  /** Run a fresh search. Cancels any in-flight request. */
  search: (params: SearchParams) => void;
  /** Load the next page of results, appending them to the current list. */
  loadMore: () => void;
  /** Load the Pexels "popular" feed. */
  loadPopular: () => void;
}

/**
 * Subscribe to search state and get search actions.
 *
 * ```tsx
 * const { results, isLoading, search, loadMore } = useSearch();
 * ```
 */
export function useSearch(): UseSearchReturn {
  const { store } = useMediaContext();
  const [searchState, setSearchState] = useState<SearchState>(
    () => store.state.search,
  );

  useEffect(() => {
    // subscribe returns an unsubscribe fn — returned directly as cleanup
    return store.state$.subscribe(s => setSearchState(s.search));
  }, [store]);

  const search = useCallback(
    (params: SearchParams) => void store.search(params),
    [store],
  );

  const loadMore = useCallback(
    () => void store.loadMore(),
    [store],
  );

  const loadPopular = useCallback(
    () => void store.loadPopular(),
    [store],
  );

  return { ...searchState, search, loadMore, loadPopular };
}
