/**
 * @headless-media/ui-native — Headless React Native UI Library
 *
 * Same prop-only contract as @headless-media/ui-react: zero SDK imports,
 * everything passed via props/callbacks.
 *
 * BOUNDARY RULE: Do NOT import from @headless-media/core or wrappers.
 */

export const MEDIA_UI_NATIVE_VERSION = '0.1.0';

export { VideoGrid } from './VideoGrid/index.js';
export type { VideoGridProps, VideoItem } from './VideoGrid/index.js';
