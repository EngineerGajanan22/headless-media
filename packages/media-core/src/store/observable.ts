/**
 * Minimal reactive primitive — a value that notifies subscribers on change.
 * Zero external dependencies. Framework adapters (media-react, media-native)
 * bridge this into their own reactivity model (useState/useEffect etc.).
 */

export type Subscriber<T> = (value: T) => void;
export type Unsubscribe = () => void;

export class Observable<T> {
  private readonly _subscribers = new Set<Subscriber<T>>();
  private _value: T;

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  /** Replace the value and notify all subscribers. */
  set(next: T): void {
    this._value = next;
    for (const s of this._subscribers) {
      s(next);
    }
  }

  /** Derive the next value from the current one. */
  update(updater: (prev: T) => T): void {
    this.set(updater(this._value));
  }

  /**
   * Subscribe to value changes.
   * @returns unsubscribe function (call in cleanup/useEffect return)
   */
  subscribe(subscriber: Subscriber<T>): Unsubscribe {
    this._subscribers.add(subscriber);
    // Emit current value immediately (like BehaviorSubject)
    subscriber(this._value);
    return () => {
      this._subscribers.delete(subscriber);
    };
  }
}
