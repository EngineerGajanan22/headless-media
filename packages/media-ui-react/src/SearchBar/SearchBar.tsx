import type { SearchBarProps } from '../types.js';
import { useState, useCallback, type FormEvent } from 'react';

/**
 * Headless SearchBar component.
 *
 * Maintains local input state for a controlled editing experience, but calls
 * `onSearch` only on explicit submission (Enter key or button click).
 * The parent controls the "last submitted query" via the `value` prop.
 *
 * No SDK imports. No knowledge of Pexels.
 */
export function SearchBar({
  value,
  isLoading = false,
  placeholder = 'Search…',
  onSearch,
  onChange,
  className = '',
}: SearchBarProps) {
  // Local controlled state for the input (allows typing without triggering search)
  const [localValue, setLocalValue] = useState(value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setLocalValue(next);
      onChange?.(next);
    },
    [onChange],
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = localValue.trim();
      if (trimmed) onSearch(trimmed);
    },
    [localValue, onSearch],
  );

  return (
    <div className={`search-bar ${className}`}>
      <form
        className="search-bar__form"
        onSubmit={handleSubmit}
        role="search"
        aria-label="Video search"
      >
        <span className="search-bar__icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>

        <input
          id="search-input"
          className="search-bar__input"
          type="search"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label="Search query"
          autoComplete="off"
          spellCheck="false"
        />

        <button
          className="search-bar__btn"
          type="submit"
          disabled={isLoading || !localValue.trim()}
          aria-label={isLoading ? 'Searching…' : 'Search'}
        >
          {isLoading ? (
            <span className="search-bar__spinner" aria-hidden="true" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m22 2-7 20-4-9-9-4z" />
            </svg>
          )}
          <span>{isLoading ? 'Searching…' : 'Search'}</span>
        </button>
      </form>
    </div>
  );
}
