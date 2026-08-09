import type { SearchParams, SearchResult, PexelsVideo } from '../types/index.js';

const BASE_URL = 'https://api.pexels.com/videos';

/**
 * Thin HTTP client for the Pexels Video API.
 * Uses native `fetch` (available in all modern runtimes).
 * No React, no DOM-specific APIs beyond fetch.
 */
export class PexelsClient {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('[media-core] PexelsClient requires an API key');
    }
    this.apiKey = apiKey;
  }

  private async request<T>(
    path: string,
    params?: Record<string, string | number>,
  ): Promise<T> {
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

    return response.json() as Promise<T>;
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
