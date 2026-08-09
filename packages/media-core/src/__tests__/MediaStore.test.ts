import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MediaStore } from '../store/MediaStore.js';
import type { PexelsClient } from '../client/PexelsClient.js';
import type { PexelsVideo, SearchResult, MediaEvent } from '../index.js';

function createMockVideo(id: number): PexelsVideo {
  return {
    id,
    width: 1920,
    height: 1080,
    url: `https://pexels.com/video/${id}`,
    image: `https://images.pexels.com/${id}.jpg`,
    full_res: null,
    tags: ['test'],
    duration: 10,
    user: { id: 1, name: 'User 1', url: 'https://pexels.com/user/1' },
    video_files: [{ id: 1, quality: 'hd', file_type: 'video/mp4', width: 1920, height: 1080, fps: 30, link: `https://video-${id}.mp4` }],
    video_pictures: [],
  };
}

describe('MediaStore', () => {
  let mockClient: PexelsClient;
  let store: MediaStore;

  beforeEach(() => {
    mockClient = {
      search: vi.fn(),
      getVideo: vi.fn(),
      getPopular: vi.fn(),
    } as unknown as PexelsClient;

    store = new MediaStore(mockClient);
  });

  afterEach(() => {
    store.destroy();
  });

  it('sets isLoading to true during search() and updates results on resolve', async () => {
    const mockSearchResult: SearchResult = {
      page: 1,
      per_page: 15,
      total_results: 2,
      url: 'https://api.pexels.com/videos/search?query=nature',
      videos: [createMockVideo(1), createMockVideo(2)],
      next_page: 'https://api.pexels.com/videos/search?page=2',
    };

    let resolveSearch!: (res: SearchResult) => void;
    const searchPromise = new Promise<SearchResult>(resolve => {
      resolveSearch = resolve;
    });

    vi.mocked(mockClient.search).mockReturnValue(searchPromise);

    const searchActionPromise = store.search({ query: 'nature' });

    // Assert intermediate loading state
    expect(store.state.search.isLoading).toBe(true);
    expect(store.state.search.query).toBe('nature');
    expect(store.state.search.results).toHaveLength(0);

    // Resolve search API call
    resolveSearch(mockSearchResult);
    await searchActionPromise;

    // Assert resolved state
    expect(store.state.search.isLoading).toBe(false);
    expect(store.state.search.results).toHaveLength(2);
    expect(store.state.search.totalResults).toBe(2);
    expect(store.state.search.hasNextPage).toBe(true);
  });

  it('appends results in loadMore() rather than replacing existing results', async () => {
    const initialResult: SearchResult = {
      page: 1,
      per_page: 2,
      total_results: 4,
      url: 'https://api.pexels.com/videos/search?query=forest',
      videos: [createMockVideo(1), createMockVideo(2)],
      next_page: 'https://api.pexels.com/videos/search?query=forest&page=2',
    };

    const nextPageResult: SearchResult = {
      page: 2,
      per_page: 2,
      total_results: 4,
      url: 'https://api.pexels.com/videos/search?query=forest&page=2',
      videos: [createMockVideo(3), createMockVideo(4)],
    };

    vi.mocked(mockClient.search).mockResolvedValueOnce(initialResult);
    await store.search({ query: 'forest' });

    expect(store.state.search.results.map(v => v.id)).toEqual([1, 2]);

    vi.mocked(mockClient.search).mockResolvedValueOnce(nextPageResult);
    await store.loadMore();

    expect(store.state.search.page).toBe(2);
    expect(store.state.search.results.map(v => v.id)).toEqual([1, 2, 3, 4]);
  });

  it('updates player state and emits a view event when selectVideo() is called', () => {
    const eventsReceived: MediaEvent[] = [];
    store.events.subscribe(e => eventsReceived.push(e));

    store.selectVideo(99);

    expect(store.state.player.videoId).toBe(99);
    expect(store.state.player.status).toBe('loading');
    expect(store.state.player.currentTime).toBe(0);

    const viewEvents = eventsReceived.filter(e => e.type === 'view');
    expect(viewEvents).toHaveLength(1);
    expect(viewEvents[0]?.payload.videoId).toBe(99);
    expect(viewEvents[0]?.payload.timestamp).toBeGreaterThan(0);
  });
});
