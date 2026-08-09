import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PexelsClient } from '../client/PexelsClient.js';
import type { SearchResult, PexelsVideo } from '../types/index.js';

describe('PexelsClient', () => {
  const MOCK_API_KEY = 'test_api_key_12345';
  let client: PexelsClient;

  beforeEach(() => {
    client = new PexelsClient(MOCK_API_KEY);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws an error if instantiated without an API key', () => {
    expect(() => new PexelsClient('')).toThrow('[media-core] PexelsClient requires an API key');
  });

  it('builds correct query parameters and headers during search()', async () => {
    const mockResponse: SearchResult = {
      page: 1,
      per_page: 15,
      total_results: 1,
      url: 'https://api.pexels.com/videos/search?query=nature',
      videos: [
        {
          id: 101,
          width: 1920,
          height: 1080,
          url: 'https://pexels.com/video/101',
          image: 'https://images.pexels.com/101.jpg',
          full_res: null,
          tags: ['nature'],
          duration: 15,
          user: { id: 1, name: 'Alice', url: 'https://pexels.com/user/1' },
          video_files: [],
          video_pictures: [],
        },
      ],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await client.search({ query: 'nature', page: 1, per_page: 10, orientation: 'landscape' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = mockFetch.mock.calls[0];

    const url = new URL(requestUrl as string);
    expect(url.origin + url.pathname).toBe('https://api.pexels.com/videos/search');
    expect(url.searchParams.get('query')).toBe('nature');
    expect(url.searchParams.get('page')).toBe('1');
    expect(url.searchParams.get('per_page')).toBe('10');
    expect(url.searchParams.get('orientation')).toBe('landscape');

    expect(requestInit?.headers).toEqual({
      Authorization: MOCK_API_KEY,
      'Content-Type': 'application/json',
    });

    expect(result).toEqual(mockResponse);
  });

  it('hits the correct URL path for getVideo(id)', async () => {
    const mockVideo: Partial<PexelsVideo> = {
      id: 202,
      duration: 30,
      url: 'https://pexels.com/video/202',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockVideo,
    });
    vi.stubGlobal('fetch', mockFetch);

    const video = await client.getVideo(202);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [requestUrl] = mockFetch.mock.calls[0];
    const url = new URL(requestUrl as string);

    expect(url.pathname).toBe('/videos/videos/202');
    expect(video).toEqual(mockVideo);
  });

  it('throws a descriptive error when API returns a non-ok HTTP status', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(client.search({ query: 'ocean' })).rejects.toThrow(
      '[media-core] Pexels API 401: Unauthorized',
    );
  });

  it('serves repeated requests for identical query params from in-memory TTL cache', async () => {
    const mockResponse: Partial<SearchResult> = { page: 1, videos: [] };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    vi.stubGlobal('fetch', mockFetch);

    const res1 = await client.search({ query: 'mountains' });
    const res2 = await client.search({ query: 'mountains' });

    expect(res1).toEqual(mockResponse);
    expect(res2).toEqual(mockResponse);
    // Fetch should only be called ONCE due to cache hit
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('de-duplicates simultaneous in-flight requests for identical keys', async () => {
    const mockResponse: Partial<SearchResult> = { page: 1, videos: [] };
    const mockFetch = vi.fn().mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => mockResponse,
              }),
            50,
          ),
        ),
    );
    vi.stubGlobal('fetch', mockFetch);

    // Fire 3 simultaneous identical search requests
    const [p1, p2, p3] = await Promise.all([
      client.search({ query: 'forest', page: 1 }),
      client.search({ query: 'forest', page: 1 }),
      client.search({ query: 'forest', page: 1 }),
    ]);

    expect(p1).toEqual(mockResponse);
    expect(p2).toEqual(mockResponse);
    expect(p3).toEqual(mockResponse);
    // Fetch should only be executed ONCE across all 3 promises
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

