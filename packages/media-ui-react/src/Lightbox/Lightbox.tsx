import { useEffect, useRef, useCallback } from 'react';
import type { LightboxProps } from '../types.js';

/**
 * Headless Lightbox component.
 *
 * Renders a modal overlay with accessible dialog semantics (`role="dialog"`, `aria-modal="true"`).
 * Manages focus trap, restores focus to the trigger element on close, and intercepts keyboard shortcuts:
 * - `Escape`: closes modal
 * - `ArrowLeft`: triggers `onPrevious` callback
 * - `ArrowRight`: triggers `onNext` callback
 * - `Tab` / `Shift+Tab`: trapped strictly within modal focusable elements
 *
 * Content decisions:
 * Accepts `children` so consumers can place a `<VideoPlayer>`, image, or custom media layout inside.
 *
 * No SDK imports. Zero Pexels knowledge.
 */
export function Lightbox({
  isOpen,
  onClose,
  onPrevious,
  onNext,
  children,
  ariaLabel = 'Media Lightbox',
  className = '',
}: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store trigger focus and shift focus into modal when opened
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => {
        if (!dialogRef.current) return;
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length > 0 && focusables[0]) {
          focusables[0].focus();
        } else {
          dialogRef.current.focus();
        }
      });
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [isOpen]);

  // Keyboard navigation & focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowLeft' && onPrevious) {
        e.preventDefault();
        onPrevious();
        return;
      }

      if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
        return;
      }

      // Focus trapping for Tab / Shift+Tab
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    },
    [onClose, onPrevious, onNext],
  );

  if (!isOpen) return null;

  return (
    <div
      className={`media-lightbox ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      ref={dialogRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div className="media-lightbox__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="media-lightbox__content">
        <button
          type="button"
          className="media-lightbox__close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {onPrevious && (
          <button
            type="button"
            className="media-lightbox__nav media-lightbox__nav--prev"
            onClick={onPrevious}
            aria-label="Previous item"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {onNext && (
          <button
            type="button"
            className="media-lightbox__nav media-lightbox__nav--next"
            onClick={onNext}
            aria-label="Next item"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        <div className="media-lightbox__body">{children}</div>
      </div>
    </div>
  );
}
