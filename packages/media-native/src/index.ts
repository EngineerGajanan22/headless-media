/**
 * @headless-media/native — React Native wrapper (stub)
 *
 * Mirrors the same contract as @headless-media/react:
 *  - MediaNativeProvider wraps MediaStore in React Native context
 *  - useSearch / usePlayer / useVideo hooks have identical return shapes
 *
 * TODO: implement once Expo / RN dev environment is available.
 * The architecture and hook signatures are intentionally identical to
 * @headless-media/react so consumers can swap platforms with minimal friction.
 */

export const MEDIA_NATIVE_VERSION = '0.1.0';

// Re-export core types so RN consumers don't need to add @headless-media/core
export type {
  SearchParams,
  SearchState,
  PlayerState,
  PlayerStatus,
  MediaState,
  PexelsVideo,
} from '@headless-media/core';
