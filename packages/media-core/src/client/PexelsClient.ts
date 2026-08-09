import type { SearchParams, SearchResult, PexelsVideo } from '../types/index.js';

const BASE_URL = 'https://api.pexels.com/videos';
const DEFAULT_TTL_MS = 60_000; // 60 seconds TTL

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

/**
 * Thin HTTP client for the Pexels Video API.
 * Features:
 * - In-memory TTL caching (60s default)
 * - In-flight request de-duplication (prevents duplicate simultaneous network requests)
 * - Uses native `fetch` (available in all modern runtimes).
 * - No React, DOM, or framework dependencies.
 */
export class PexelsClient {
  private readonly apiKey: string;
  private readonly ttlMs: number;
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly inFlight = new Map<string, Promise<unknown>>();

  constructor(apiKey: string, ttlMs = DEFAULT_TTL_MS) {
    if (!apiKey) {
      throw new Error('[media-core] PexelsClient requires an API key');
    }
    this.apiKey = apiKey;
    this.ttlMs = ttlMs;
  }

  /**
   * Clear all cached responses and pending in-flight requests.
   */
  clearCache(): void {
    this.cache.clear();
    this.inFlight.clear();
  }

  private async request<T>(
    path: string,
    params?: Record<string, string | number>,
  ): Promise<T> {
    const cacheKey = `${path}:${JSON.stringify(params ?? {})}`;

    // 1. Check valid TTL cache entry
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.ttlMs) {
      return cached.data as T;
    }

    // 2. Return identical in-flight promise if a request for this key is already executing
    const existingPromise = this.inFlight.get(cacheKey);
    if (existingPromise) {
      return existingPromise as Promise<T>;
    }

    // 3. Execute new network request
    const requestPromise = (async () => {
      const url = new URL(`${BASE_URL}${path}`);
      if (params) {
        for (const [key, val] of Object.entries(params)) {
          url.searchParams.set(key, String(val));
        }
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `[media-core] Pexels API ${response.status}: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as T;
      this.cache.set(cacheKey, { timestamp: Date.now(), data });
      return data;
    })();

    this.inFlight.set(cacheKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      this.inFlight.delete(cacheKey);
    }
  }

  async search(params: SearchParams): Promise<SearchResult> {
    const { query, page = 1, per_page = 15, ...rest } = params;
    return this.request<SearchResult>('/search', {
      query,
      page,
      per_page,
      ...rest,
    });
  }

  async getVideo(id: number): Promise<PexelsVideo> {
    return this.request<PexelsVideo>(`/videos/${id}`);
  }

  async getPopular(page = 1, per_page = 15): Promise<SearchResult> {
    return this.request<SearchResult>('/popular', { page, per_page });
  }
}
