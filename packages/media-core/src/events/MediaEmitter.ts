/**
 * Payload for video download events.
 */
export interface DownloadEventPayload {
  videoId: number;
  quality: string;
  url: string;
}

/**
 * Payload for video view events.
 */
export interface ViewEventPayload {
  videoId: number;
  timestamp: number;
}

/**
 * Strongly typed map of all activity event names to their payloads.
 */
export interface MediaEventMap {
  download: DownloadEventPayload;
  view: ViewEventPayload;
}

export type MediaEventType = keyof MediaEventMap;

/**
 * Discriminated union of all media activity events.
 */
export type MediaEvent<K extends MediaEventType = MediaEventType> = {
  [Type in K]: {
    type: Type;
    payload: MediaEventMap[Type];
  };
}[K];

export type MediaEventHandler = (event: MediaEvent) => void;

/**
 * Minimal typed event emitter for activity events (downloads, views, telemetry).
 *
 * - Distinct from state updates (`Observable<T>`) — activity events fire once without retaining history.
 * - Follows the same subscribe/unsubscribe pattern as Observable (returns an unsubscribe function).
 * - Zero external dependencies.
 */
export class MediaEmitter {
  private readonly listeners = new Set<MediaEventHandler>();

  constructor() {
    // Default logger listener
    this.subscribe(event => {
      console.log(`[media-core:event] ${event.type}`, event.payload);
    });
  }

  /**
   * Emit an activity event to all registered listeners.
   */
  emit<K extends MediaEventType>(type: K, payload: MediaEventMap[K]): void {
    const event = { type, payload } as MediaEvent;
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  /**
   * Subscribe to all activity events.
   * @returns Unsubscribe function
   */
  subscribe(handler: MediaEventHandler): () => void {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }
}
