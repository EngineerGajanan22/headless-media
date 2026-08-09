// ─── Pexels API shapes ────────────────────────────────────────────────────────

export interface PexelsUser {
  id: number;
  name: string;
  url: string;
}

export interface VideoFile {
  id: number;
  quality: 'hd' | 'sd' | 'hls' | 'uhd';
  file_type: string;
  width: number | null;
  height: number | null;
  fps: number | null;
  link: string;
}

export interface VideoPicture {
  id: number;
  picture: string;
  nr: number;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  full_res: null;
  tags: string[];
  duration: number;
  user: PexelsUser;
  video_files: VideoFile[];
  video_pictures: VideoPicture[];
}

export interface SearchResult {
  page: number;
  per_page: number;
  total_results: number;
  url: string;
  videos: PexelsVideo[];
  next_page?: string;
  prev_page?: string;
}

// ─── Search parameters ────────────────────────────────────────────────────────

export interface SearchParams {
  query: string;
  page?: number;
  per_page?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'large' | 'medium' | 'small';
  locale?: string;
}

// ─── Player state ─────────────────────────────────────────────────────────────

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'ended';

export interface PlayerState {
  videoId: number | null;
  status: PlayerStatus;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  error: string | null;
}

// ─── Search state ─────────────────────────────────────────────────────────────

export interface SearchState {
  query: string;
  results: PexelsVideo[];
  page: number;
  totalResults: number;
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
}

// ─── Root media state ─────────────────────────────────────────────────────────

export interface MediaState {
  search: SearchState;
  player: PlayerState;
}
