import { useState, useCallback } from 'react';
import {
  SearchBar,
  VideoGrid,
  VideoPlayer,
  Lightbox,
  ReelSwiper,
} from '@headless-media/ui-react';
import type { UIPlayerStatus } from '@headless-media/ui-react';
import { MOCK_VIDEOS } from './mockData';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function PropTable({ rows }: {
  rows: { name: string; type: string; required: boolean; description: string }[];
}) {
  return (
    <table className="prop-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Required</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.name}>
            <td><span className="prop-name">{r.name}</span></td>
            <td><span className="prop-type">{r.type}</span></td>
            <td>{r.required
              ? <span className="prop-required">required</span>
              : <span className="prop-optional">optional</span>}
            </td>
            <td>{r.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── SearchBar section ────────────────────────────────────────────────────────

function SearchBarSection() {
  const [value, setValue] = useState('');
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback((q: string) => {
    setLastQuery(q);
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  }, []);

  return (
    <section id="SearchBar" className="component-section">
      <h2>SearchBar <span className="component-name-badge">@headless-media/ui-react</span></h2>

      <div className="component-desc">
        <p>
          A controlled search form. Maintains local input state for a smooth typing experience,
          but fires <code>onSearch</code> only on explicit submit (Enter or button click).
          The parent controls the canonical "last submitted query" via the <code>value</code> prop.
        </p>
        <p>
          <strong>Headless contract:</strong> No SDK imports. No Pexels knowledge.
          Receives the current query value and callbacks — nothing else.
        </p>
      </div>

      <p className="sub-heading">Props — SearchBarProps</p>
      <PropTable rows={[
        { name: 'value', type: 'string', required: true, description: 'The last-submitted query value. Used only for resetting; does not drive keystroke-level input (local state does).' },
        { name: 'onSearch', type: '(query: string) => void', required: true, description: 'Called when the user explicitly submits: Enter key or submit button click.' },
        { name: 'onChange', type: '(value: string) => void', required: false, description: 'Fired on every keystroke. Useful if the parent also wants to track intermediate input.' },
        { name: 'isLoading', type: 'boolean', required: false, description: 'Shows a spinner and disables the submit button while a search is in flight.' },
        { name: 'placeholder', type: 'string', required: false, description: 'Input placeholder text. Defaults to "Search…".' },
        { name: 'className', type: 'string', required: false, description: 'Optional extra CSS class on the root container.' },
      ]} />

      <p className="sub-heading">Live example</p>
      <div className="example-box">
        <div className="example-box-label">Interactive</div>
        <div className="example-box-content">
          {/* SearchBar renders its own form/input/button; we apply doc styles via a wrapper class */}
          <div className="doc-search">
            <SearchBar
              value={value}
              isLoading={loading}
              placeholder="Try searching anything…"
              onSearch={handleSearch}
              onChange={setValue}
            />
          </div>
          <p className="status-line">
            Last submitted: <code>{lastQuery ?? '—'}</code>
            {loading && ' · searching…'}
          </p>
          <div className="controls">
            <button onClick={() => { setValue(''); setLastQuery(null); }}>Reset</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── VideoGrid section ────────────────────────────────────────────────────────

function VideoGridSection() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [videos, setVideos] = useState(MOCK_VIDEOS.slice(0, 3));

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVideos(MOCK_VIDEOS);
      setLoading(false);
      setHasMore(false);
    }, 900);
  };

  return (
    <section id="VideoGrid" className="component-section">
      <h2>VideoGrid <span className="component-name-badge">@headless-media/ui-react</span></h2>

      <div className="component-desc">
        <p>
          Renders a responsive grid of video thumbnails. Handles three states:
          skeleton placeholders (first-load), empty state, and the populated grid.
          Keyboard-navigable — each card responds to Enter/Space for accessibility.
        </p>
        <p>
          <strong>Headless contract:</strong> Accepts a plain <code>VideoItem[]</code> array — no Pexels
          types. The app layer maps SDK results to <code>VideoItem</code> before passing them in.
        </p>
      </div>

      <p className="sub-heading">Props — VideoGridProps</p>
      <PropTable rows={[
        { name: 'videos', type: 'VideoItem[]', required: true, description: 'Normalised video items. See VideoItem shape below.' },
        { name: 'selectedId', type: 'number | null', required: false, description: 'ID of the currently selected video. Adds a selected visual state to the matching card.' },
        { name: 'isLoading', type: 'boolean', required: false, description: 'When true with no videos, shows skeleton cards. When true with videos, shows a spinner instead of the Load More button.' },
        { name: 'hasMore', type: 'boolean', required: false, description: 'Controls whether the "Load More" button is rendered.' },
        { name: 'onSelect', type: '(id: number) => void', required: false, description: 'Fired when a thumbnail is clicked or activated via keyboard.' },
        { name: 'onLoadMore', type: '() => void', required: false, description: 'Fired when the "Load More" button is clicked.' },
        { name: 'className', type: 'string', required: false, description: 'Optional extra CSS class.' },
      ]} />

      <p className="sub-heading">VideoItem shape</p>
      <PropTable rows={[
        { name: 'id', type: 'number', required: true, description: 'Unique identifier.' },
        { name: 'thumbnailUrl', type: 'string', required: true, description: 'URL of the thumbnail image.' },
        { name: 'duration', type: 'number', required: true, description: 'Duration in seconds. Displayed as m:ss.' },
        { name: 'width', type: 'number', required: true, description: 'Video width in pixels (used for aspect ratio calculations).' },
        { name: 'height', type: 'number', required: true, description: 'Video height in pixels.' },
        { name: 'userName', type: 'string', required: true, description: 'Attribution name shown in the aria-label.' },
        { name: 'videoUrl', type: 'string', required: false, description: 'Resolved playback URL. Provided by the app layer; not used by the grid itself.' },
      ]} />

      <p className="sub-heading">Live example</p>
      <div className="example-box">
        <div className="example-box-label">Interactive — uses static mock data, no API</div>
        <div className="example-box-content">
          {/*
            VideoGrid uses BEM class names (video-grid, video-card, etc.).
            We render a minimal override grid in the doc-grid wrapper.
            Because the component's CSS depends on App.css from demo-web (not imported here),
            we render our own lightweight grid directly below to show the live props API.
          */}
          <div className="doc-grid">
            {videos.map(v => (
              <div
                key={v.id}
                className={`doc-grid-card${selectedId === v.id ? ' selected' : ''}`}
                onClick={() => setSelectedId(v.id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') setSelectedId(v.id); }}
                aria-pressed={selectedId === v.id}
                aria-label={`Select ${v.userName}`}
              >
                <img src={v.thumbnailUrl} alt={v.userName} />
                <div className="card-meta">{v.userName}</div>
              </div>
            ))}
          </div>
          <p className="status-line">
            Selected ID: <code>{selectedId ?? 'none'}</code> · {videos.length} videos loaded
          </p>
          <div className="controls">
            <button onClick={() => setSelectedId(null)}>Clear selection</button>
            {hasMore && (
              <button onClick={handleLoadMore} disabled={loading}>
                {loading ? 'Loading…' : 'Load More (mock)'}
              </button>
            )}
            <button onClick={() => { setVideos(MOCK_VIDEOS.slice(0, 3)); setHasMore(true); setSelectedId(null); }}>Reset</button>
          </div>
          <div style={{ marginTop: 16, borderTop: '1px solid #d0d7de', paddingTop: 12 }}>
            <p style={{ fontSize: 12, color: '#57606a', marginBottom: 8 }}>
              Actual component output (VideoGrid, with its BEM classes — needs app CSS to be fully styled):
            </p>
            <VideoGrid
              videos={videos}
              selectedId={selectedId}
              isLoading={loading}
              hasMore={hasMore}
              onSelect={setSelectedId}
              onLoadMore={handleLoadMore}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── VideoPlayer section ──────────────────────────────────────────────────────

function VideoPlayerSection() {
  const [selectedVideoIdx, setSelectedVideoIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<UIPlayerStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const video = MOCK_VIDEOS[selectedVideoIdx]!;

  const handlePlay = () => { setIsPlaying(true); setStatus('playing'); setError(null); };
  const handlePause = () => { setIsPlaying(false); setStatus('paused'); };
  const handleEnded = () => { setIsPlaying(false); setStatus('ended'); };
  const handleError = (e: string) => { setStatus('error'); setError(e); };
  const handleDurationChange = (d: number) => setDuration(d);
  const handleTimeUpdate = (t: number) => setCurrentTime(t);
  const handleVolumeChange = (v: number) => setVolume(v);
  const handleMuteToggle = () => setIsMuted(m => !m);

  const switchVideo = (idx: number) => {
    setSelectedVideoIdx(idx);
    setIsPlaying(false);
    setStatus('idle');
    setCurrentTime(0);
    setDuration(0);
    setError(null);
  };

  return (
    <section id="VideoPlayer" className="component-section">
      <h2>VideoPlayer <span className="component-name-badge">@headless-media/ui-react</span></h2>

      <div className="component-desc">
        <p>
          A fully-controlled video player. Wraps a native <code>&lt;video&gt;</code> element but
          delegates <em>all</em> state decisions to the parent — play/pause/seek/volume are driven by
          props, and UI interactions fire callbacks.
        </p>
        <p>
          <strong>Headless contract:</strong> Pattern is: user action → callback → parent updates state
          → prop change → effect → DOM. No SDK imports. Accepts any playable URL.
        </p>
      </div>

      <p className="sub-heading">Props — VideoPlayerProps</p>
      <PropTable rows={[
        { name: 'videoUrl', type: 'string | null', required: true, description: 'Playback URL. null shows an idle/placeholder state.' },
        { name: 'isPlaying', type: 'boolean', required: true, description: 'Controlled playback flag. Setting to true calls video.play().' },
        { name: 'isMuted', type: 'boolean', required: true, description: 'Controlled mute state.' },
        { name: 'volume', type: 'number', required: true, description: 'Volume 0–1.' },
        { name: 'currentTime', type: 'number', required: true, description: 'Playhead position in seconds. Write to this to seek.' },
        { name: 'duration', type: 'number', required: true, description: 'Total video duration in seconds (parent tracks this via onDurationChange).' },
        { name: 'status', type: "UIPlayerStatus", required: true, description: "'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'ended'. Drives overlay UI." },
        { name: 'error', type: 'string | null', required: false, description: 'Error message shown in the error overlay when status is "error".' },
        { name: 'onPlay', type: '() => void', required: false, description: 'User clicked Play.' },
        { name: 'onPause', type: '() => void', required: false, description: 'User clicked Pause.' },
        { name: 'onTimeUpdate', type: '(time: number) => void', required: false, description: 'Fired on HTMLVideoElement timeupdate events.' },
        { name: 'onDurationChange', type: '(duration: number) => void', required: false, description: 'Fired when the video metadata loads (gives total duration).' },
        { name: 'onVolumeChange', type: '(volume: number) => void', required: false, description: 'User moved the volume slider.' },
        { name: 'onMuteToggle', type: '() => void', required: false, description: 'User clicked the mute button.' },
        { name: 'onEnded', type: '() => void', required: false, description: 'Video finished playing.' },
        { name: 'onError', type: '(error: string) => void', required: false, description: 'HTMLVideoElement fired an error event.' },
        { name: 'className', type: 'string', required: false, description: 'Optional extra CSS class.' },
      ]} />

      <p className="sub-heading">Live example</p>
      <div className="example-box">
        <div className="example-box-label">Interactive — open-licence test videos, no API key needed</div>
        <div className="example-box-content">
          <div className="controls" style={{ marginBottom: 12 }}>
            {MOCK_VIDEOS.map((v, i) => (
              <button key={v.id} onClick={() => switchVideo(i)} className={selectedVideoIdx === i ? 'active' : ''}>
                {v.userName}
              </button>
            ))}
          </div>
          <div className="doc-player-wrap">
            <VideoPlayer
              videoUrl={video.videoUrl ?? null}
              isPlaying={isPlaying}
              isMuted={isMuted}
              volume={volume}
              currentTime={currentTime}
              duration={duration}
              status={status}
              error={error}
              onPlay={handlePlay}
              onPause={handlePause}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
              onEnded={handleEnded}
              onError={handleError}
            />
          </div>
          <p className="status-line">
            Status: <code>{status}</code> · {Math.round(currentTime)}s / {Math.round(duration)}s · muted: <code>{String(isMuted)}</code>
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Lightbox section ─────────────────────────────────────────────────────────

function LightboxSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const item = MOCK_VIDEOS[currentIdx]!;

  return (
    <section id="Lightbox" className="component-section">
      <h2>Lightbox <span className="component-name-badge">@headless-media/ui-react</span></h2>

      <div className="component-desc">
        <p>
          A modal overlay with accessible dialog semantics (<code>role="dialog"</code>, <code>aria-modal</code>).
          Manages focus trap, restores focus to the trigger on close, and wires keyboard shortcuts:
          Escape → close, ← → navigate.
        </p>
        <p>
          <strong>Headless contract:</strong> Accepts <code>children</code> — put whatever content you want inside.
          Nav callbacks (<code>onPrevious</code>/<code>onNext</code>) are optional; omit them and the arrows disappear.
        </p>
      </div>

      <p className="sub-heading">Props — LightboxProps</p>
      <PropTable rows={[
        { name: 'isOpen', type: 'boolean', required: true, description: 'Controls whether the overlay is rendered and visible.' },
        { name: 'onClose', type: '() => void', required: true, description: 'Called on Escape key, backdrop click, or close button. Parent is responsible for setting isOpen to false.' },
        { name: 'onPrevious', type: '() => void', required: false, description: 'If provided, renders a ← button and responds to the ArrowLeft key.' },
        { name: 'onNext', type: '() => void', required: false, description: 'If provided, renders a → button and responds to the ArrowRight key.' },
        { name: 'children', type: 'React.ReactNode', required: false, description: 'Content rendered inside the modal dialog. Put a VideoPlayer, image, or custom layout here.' },
        { name: 'ariaLabel', type: 'string', required: false, description: 'aria-label for the dialog element. Defaults to "Media Lightbox".' },
        { name: 'className', type: 'string', required: false, description: 'Optional extra CSS class on the backdrop.' },
      ]} />

      <p className="sub-heading">Live example</p>
      <div className="example-box">
        <div className="example-box-label">Interactive</div>
        <div className="example-box-content">
          <div className="controls">
            <button id="open-lightbox-btn" onClick={() => setIsOpen(true)}>Open Lightbox</button>
          </div>
          <p className="status-line">State: <code>{isOpen ? 'open' : 'closed'}</code> · item {currentIdx + 1} of {MOCK_VIDEOS.length}</p>

          {/* We render our own overlay rather than using the component's CSS-dependent output,
              since this site doesn't import demo-web's App.css. The Lightbox logic (focus trap,
              keyboard nav, aria) is demonstrated via the actual component rendered below. */}
          <Lightbox
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onPrevious={() => setCurrentIdx(i => (i - 1 + MOCK_VIDEOS.length) % MOCK_VIDEOS.length)}
            onNext={() => setCurrentIdx(i => (i + 1) % MOCK_VIDEOS.length)}
            ariaLabel="Video thumbnail lightbox"
          >
            <div className="doc-lightbox-dialog">
              <button className="doc-lightbox-close" onClick={() => setIsOpen(false)} aria-label="Close">×</button>
              <img src={item.thumbnailUrl} alt={item.userName} style={{ width: '100%', borderRadius: 4 }} />
              <p style={{ marginTop: 10, fontWeight: 600 }}>{item.userName}</p>
              <p style={{ fontSize: 12, color: '#57606a' }}>{item.duration}s · {item.width}×{item.height}</p>
              <div className="doc-lightbox-nav">
                <button onClick={() => setCurrentIdx(i => (i - 1 + MOCK_VIDEOS.length) % MOCK_VIDEOS.length)}>← Prev</button>
                <button onClick={() => setCurrentIdx(i => (i + 1) % MOCK_VIDEOS.length)}>Next →</button>
              </div>
            </div>
          </Lightbox>
        </div>
      </div>
    </section>
  );
}

// ─── ReelSwiper section ───────────────────────────────────────────────────────

function ReelSwiperSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="ReelSwiper" className="component-section">
      <h2>ReelSwiper <span className="component-name-badge">@headless-media/ui-react</span></h2>

      <div className="component-desc">
        <p>
          A vertical snap-scrolling feed container. Uses <code>scroll-snap-type: y mandatory</code>
          and <code>IntersectionObserver</code> (threshold 0.5) to detect the active item — no
          manual scroll position math.
        </p>
        <p>
          <strong>Headless contract:</strong> Render-prop driven via <code>renderItem(item, isActive, index)</code>.
          Completely data-agnostic — pass any typed array and render whatever UI makes sense.
        </p>
      </div>

      <p className="sub-heading">Props — ReelSwiperProps&lt;T&gt;</p>
      <PropTable rows={[
        { name: 'items', type: 'T[]', required: true, description: 'Generic array. The component is data-agnostic; you decide the shape of T.' },
        { name: 'renderItem', type: '(item: T, isActive: boolean, index: number) => ReactNode', required: true, description: 'Render prop called for each item. isActive is true when the item is >50% in the viewport.' },
        { name: 'onActiveChange', type: '(index: number) => void', required: false, description: 'Fired whenever the active item changes (due to scroll). Use to sync external state.' },
        { name: 'className', type: 'string', required: false, description: 'Optional extra CSS class on the scroll container.' },
      ]} />

      <p className="sub-heading">Live example</p>
      <div className="example-box">
        <div className="example-box-label">Interactive — scroll inside the box below</div>
        <div className="example-box-content">
          <p className="status-line" style={{ marginBottom: 8 }}>
            Active index: <code>{activeIndex}</code> — {MOCK_VIDEOS[activeIndex]?.userName}
          </p>
          <div className="doc-reel">
            <ReelSwiper
              items={MOCK_VIDEOS}
              onActiveChange={setActiveIndex}
              renderItem={(video, isActive, index) => (
                <div className={`doc-reel-item${isActive ? ' active' : ''}`}>
                  <img
                    className="doc-reel-thumb"
                    src={video.thumbnailUrl}
                    alt={video.userName}
                  />
                  <strong style={{ fontSize: 14 }}>{video.userName}</strong>
                  <span style={{ fontSize: 12, color: '#57606a' }}>
                    #{index + 1} · {video.duration}s{isActive ? ' · ▶ active' : ''}
                  </span>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS = ['SearchBar', 'VideoGrid', 'VideoPlayer', 'Lightbox', 'ReelSwiper'];

export default function App() {
  return (
    <div className="page">
      <header className="site-header">
        <h1>@headless-media/ui-react — Component Docs</h1>
        <p>
          Headless, SDK-free React components. Feed them any data; they handle rendering and
          accessibility. This page uses static mock data — no Pexels API key required.
        </p>
        <div className="badge">@headless-media/ui-react</div>
        <nav className="site-nav" aria-label="Components">
          {NAV_ITEMS.map(name => (
            <a key={name} href={`#${name}`}>{name}</a>
          ))}
        </nav>
      </header>

      <SearchBarSection />
      <VideoGridSection />
      <VideoPlayerSection />
      <LightboxSection />
      <ReelSwiperSection />
    </div>
  );
}
