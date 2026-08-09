import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MediaEmitter } from '../events/MediaEmitter.js';
import type { MediaEvent } from '../events/MediaEmitter.js';

describe('MediaEmitter', () => {
  let emitter: MediaEmitter;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    emitter = new MediaEmitter();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('registers a default logger listener that logs every emitted event', () => {
    emitter.emit('view', { videoId: 42, timestamp: 123456789 });

    expect(consoleSpy).toHaveBeenCalledWith('[media-core:event] view', {
      videoId: 42,
      timestamp: 123456789,
    });
  });

  it('notifies subscribed handlers when events are emitted', () => {
    const receivedEvents: MediaEvent[] = [];
    const handler = (event: MediaEvent) => {
      receivedEvents.push(event);
    };

    emitter.subscribe(handler);

    emitter.emit('download', {
      videoId: 101,
      quality: 'hd',
      url: 'https://example.com/video.mp4',
    });

    expect(receivedEvents).toHaveLength(1);
    expect(receivedEvents[0]).toEqual({
      type: 'download',
      payload: {
        videoId: 101,
        quality: 'hd',
        url: 'https://example.com/video.mp4',
      },
    });
  });

  it('stops notifying handlers after unsubscribe function is called', () => {
    const handler = vi.fn();
    const unsubscribe = emitter.subscribe(handler);

    emitter.emit('view', { videoId: 1, timestamp: 100 });
    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();

    emitter.emit('view', { videoId: 2, timestamp: 200 });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
