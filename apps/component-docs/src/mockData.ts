import type { VideoItem } from '@headless-media/ui-react';

/** Static mock data — no Pexels API needed. */
export const MOCK_VIDEOS: VideoItem[] = [
  {
    id: 1,
    thumbnailUrl: 'https://images.pexels.com/videos/2882234/pictures/preview-0.jpg',
    duration: 15,
    width: 1920,
    height: 1080,
    userName: 'Nature Film Co.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: 2,
    thumbnailUrl: 'https://images.pexels.com/videos/3045163/pictures/preview-0.jpg',
    duration: 32,
    width: 1920,
    height: 1080,
    userName: 'Aerial Works',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: 3,
    thumbnailUrl: 'https://images.pexels.com/videos/1526909/pictures/preview-0.jpg',
    duration: 8,
    width: 1920,
    height: 1080,
    userName: 'Ocean Studio',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 4,
    thumbnailUrl: 'https://images.pexels.com/videos/857136/pictures/preview-0.jpg',
    duration: 22,
    width: 1080,
    height: 1920,
    userName: 'Urban Lens',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
];
