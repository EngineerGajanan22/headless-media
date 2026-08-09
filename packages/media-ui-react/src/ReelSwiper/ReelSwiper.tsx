import { useState, useEffect, useRef } from 'react';
import type { ReelSwiperProps } from '../types.js';

/**
 * Headless ReelSwiper component.
 *
 * Implements a vertical snap-scrolling feed container (`scroll-snap-type: y mandatory`).
 * Uses `IntersectionObserver` with threshold 0.5 to detect active items as the user scrolls,
 * triggering `onActiveChange(index)` without relying on manual scroll position calculations.
 *
 * Render-prop driven (`renderItem`) so it remains data-agnostic and free from media assumptions.
 *
 * No SDK imports. Zero Pexels knowledge.
 */
export function ReelSwiper<T>({
  items,
  renderItem,
  onActiveChange,
  className = '',
}: ReelSwiperProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items.length]);

  useEffect(() => {
    const elements = itemRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const indexStr = entry.target.getAttribute('data-index');
            if (indexStr !== null) {
              const index = parseInt(indexStr, 10);
              setActiveIndex(index);
              onActiveChange?.(index);
            }
          }
        }
      },
      {
        threshold: 0.5,
      },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [items.length, onActiveChange]);

  if (items.length === 0) {
    return (
      <div className={`reel-swiper reel-swiper--empty ${className}`}>
        <div className="reel-swiper__empty-msg">
          <p>No reels available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`reel-swiper ${className}`} role="region" aria-label="Reels feed">
      <div className="reel-swiper__container">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={index}
              ref={el => { itemRefs.current[index] = el; }}
              data-index={index}
              className={`reel-swiper__item${isActive ? ' reel-swiper__item--active' : ''}`}
            >
              {renderItem(item, isActive, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
