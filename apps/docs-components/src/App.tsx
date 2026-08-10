import { useState } from 'react';
import {
  SearchBar,
  VideoGrid,
  VideoPlayer,
  Lightbox,
  ReelSwiper,
} from '@headless-media/ui-react';

// ─── Logo Icon ───────────────────────────────────────────────────────────────
function LogoIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="10" fill="url(#logo_grad)" />
      <path d="M12.5 9.5L22.5 16L12.5 22.5V9.5Z" fill="white" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="9.5" stroke="white" strokeOpacity="0.3" />
      <defs>
        <linearGradient id="logo_grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="0.5" stopColor="#6366F1" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Code Block with Copy Button ──────────────────────────────────────────────
interface CodeBlockProps {
  code: string;
  filename?: string;
}

function CodeBlock({ code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span>{filename || 'TypeScript'}</span>
        <button
          onClick={handleCopy}
          className={`code-block-copy-btn ${copied ? 'code-block-copy-btn--copied' : ''}`}
        >
          {copied ? '✓ Copied!' : 'Copy Code'}
        </button>
      </div>
      <pre>
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_VIDEOS = [
  {
    id: 1,
    thumbnailUrl: 'https://images.pexels.com/photos/2882234/pexels-photo-2882234.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: 15,
    width: 1920,
    height: 1080,
    userName: 'Cyberpunk Drone Shots',
    videoUrl: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba208d2c0d4bb850b7e372e4b9f6&profile_id=139&oauth2_token_id=57447761',
  },
  {
    id: 2,
    thumbnailUrl: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: 32,
    width: 1920,
    height: 1080,
    userName: 'Abstract Neon Lights',
    videoUrl: 'https://player.vimeo.com/external/435674703.sd.mp4?s=7fdfb9ee6b0c2a71391ef7e39a3f2d013e2f9f82&profile_id=139&oauth2_token_id=57447761',
  },
  {
    id: 3,
    thumbnailUrl: 'https://images.pexels.com/photos/1618269/pexels-photo-1618269.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: 8,
    width: 1920,
    height: 1080,
    userName: 'Golden Hour Waves',
    videoUrl: 'https://player.vimeo.com/external/394749372.sd.mp4?s=d00e6df2e2d93e115fa01f5cf8fb88812c6a0c0a&profile_id=139&oauth2_token_id=57447761',
  },
];

const MORE_MOCK_VIDEOS = [
  {
    id: 4,
    thumbnailUrl: 'https://images.pexels.com/photos/3124111/pexels-photo-3124111.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: 24,
    width: 1080,
    height: 1920,
    userName: 'Forest Path Drone',
    videoUrl: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba208d2c0d4bb850b7e372e4b9f6&profile_id=139&oauth2_token_id=57447761',
  },
  {
    id: 5,
    thumbnailUrl: 'https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg?auto=compress&cs=tinysrgb&w=600',
    duration: 12,
    width: 1920,
    height: 1080,
    userName: 'Rain on Window',
    videoUrl: 'https://player.vimeo.com/external/435674703.sd.mp4?s=7fdfb9ee6b0c2a71391ef7e39a3f2d013e2f9f82&profile_id=139&oauth2_token_id=57447761',
  },
];

export default function App() {
  const [activeSection, setActiveSection] = useState('searchbar');

  // SearchBar state
  const [searchValue, setSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIsLoading, setSearchIsLoading] = useState(false);

  // VideoGrid state
  const [gridVideos, setGridVideos] = useState(MOCK_VIDEOS);
  const [gridSelectedId, setGridSelectedId] = useState<number | null>(null);
  const [gridIsLoading, setGridIsLoading] = useState(false);
  const [gridHasMore, setGridHasMore] = useState(true);

  // VideoPlayer state
  const [playerUrl, setPlayerUrl] = useState<string | null>(MOCK_VIDEOS[0]?.videoUrl || null);
  const [playerIsPlaying, setPlayerIsPlaying] = useState(false);
  const [playerIsMuted, setPlayerIsMuted] = useState(false);
  const [playerVolume, setPlayerVolume] = useState(0.8);
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0);
  const [playerDuration, setPlayerDuration] = useState(0);
  const [playerStatus, setPlayerStatus] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'ended'>('idle');
  const [playerError, setPlayerError] = useState<string | null>(null);

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // ReelSwiper state
  const [reelIndex, setReelIndex] = useState(0);

  // Helper scroll function
  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Search trigger simulation
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setSearchIsLoading(true);
    setTimeout(() => {
      setSearchIsLoading(false);
    }, 1500);
  };

  // Load more trigger simulation
  const handleLoadMore = () => {
    setGridIsLoading(true);
    setTimeout(() => {
      setGridVideos(prev => [...prev, ...MORE_MOCK_VIDEOS]);
      setGridIsLoading(false);
      setGridHasMore(false);
    }, 1200);
  };

  const handleSelectVideo = (id: number) => {
    setGridSelectedId(id);
    const video = [...gridVideos, ...MORE_MOCK_VIDEOS].find(v => v.id === id);
    if (video && video.videoUrl) {
      setPlayerUrl(video.videoUrl);
      setPlayerDuration(video.duration);
      setPlayerCurrentTime(0);
      setPlayerStatus('playing');
      setPlayerIsPlaying(true);
    }
  };

  // Sync simulated players or handle manual state tweaks
  const handlePlayToggle = () => {
    if (playerStatus === 'playing') {
      setPlayerStatus('paused');
      setPlayerIsPlaying(false);
    } else {
      setPlayerStatus('playing');
      setPlayerIsPlaying(true);
      setPlayerError(null);
    }
  };

  return (
    <div className="docs-layout">
      {/* Background Orbs */}
      <div className="docs-layout__bg-orb docs-layout__bg-orb--1" />
      <div className="docs-layout__bg-orb docs-layout__bg-orb--2" />

      {/* Left Sidebar */}
      <aside className="docs-sidebar">
        <a href="#" className="docs-sidebar__logo">
          <LogoIcon />
          <span>Headless UI</span>
        </a>
        <nav className="docs-sidebar__nav">
          <a
            onClick={() => scrollTo('searchbar')}
            className={`docs-sidebar__link ${activeSection === 'searchbar' ? 'docs-sidebar__link--active' : ''}`}
            href="#searchbar"
          >
            SearchBar
          </a>
          <a
            onClick={() => scrollTo('videogrid')}
            className={`docs-sidebar__link ${activeSection === 'videogrid' ? 'docs-sidebar__link--active' : ''}`}
            href="#videogrid"
          >
            VideoGrid
          </a>
          <a
            onClick={() => scrollTo('videoplayer')}
            className={`docs-sidebar__link ${activeSection === 'videoplayer' ? 'docs-sidebar__link--active' : ''}`}
            href="#videoplayer"
          >
            VideoPlayer
          </a>
          <a
            onClick={() => scrollTo('lightbox')}
            className={`docs-sidebar__link ${activeSection === 'lightbox' ? 'docs-sidebar__link--active' : ''}`}
            href="#lightbox"
          >
            Lightbox
          </a>
          <a
            onClick={() => scrollTo('reelswiper')}
            className={`docs-sidebar__link ${activeSection === 'reelswiper' ? 'docs-sidebar__link--active' : ''}`}
            href="#reelswiper"
          >
            ReelSwiper
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="docs-content">
        <header className="docs-header">
          <h1 className="docs-header__title">Headless UI Component Docs</h1>
          <p className="docs-header__desc">
            Documentation and live design previews for <code>@headless-media/ui-react</code>.
            These components are headless, highly accessible, framework-agnostic in terms of data requirements,
            and fully customisable using vanilla CSS class modifiers.
          </p>
        </header>

        {/* ─── SearchBar Section ────────────────────────────────────────────────── */}
        <section id="searchbar" className="component-section">
          <h2 className="component-section__title">SearchBar</h2>
          <p className="component-section__desc">
            A controlled input search bar that manages form submission, loading state animations,
            and keyboard interactions.
          </p>

          <div className="demo-sandbox">
            <div className="demo-sandbox__header">
              <div className="demo-sandbox__title"><span>⚡</span> Live Sandbox</div>
              {searchIsLoading && <span className="prop-type" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>State: Searching...</span>}
            </div>
            <div className="demo-sandbox__preview">
              <SearchBar
                value={searchValue}
                isLoading={searchIsLoading}
                placeholder="Type query and press Enter..."
                onChange={setSearchValue}
                onSearch={handleSearch}
              />
            </div>
            <div className="demo-sandbox__controls">
              <span className="prop-default">Query submitted:</span>
              <code style={{ color: '#a78bfa' }}>{searchQuery ? `"${searchQuery}"` : 'None'}</code>
              <button
                onClick={() => {
                  setSearchValue('Cyberpunk');
                  handleSearch('Cyberpunk');
                }}
                className="demo-control-btn"
              >
                Set to "Cyberpunk"
              </button>
              <button
                onClick={() => {
                  setSearchValue('');
                  setSearchQuery('');
                }}
                className="demo-control-btn"
              >
                Clear
              </button>
            </div>
          </div>

          <h3 style={{ marginBottom: '14px', fontSize: '18px' }}>Prop Reference</h3>
          <div className="props-table-container">
            <table className="props-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="prop-name">value <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">string</span></td>
                  <td>-</td>
                  <td className="prop-desc">The controlled input value.</td>
                </tr>
                <tr>
                  <td className="prop-name">onSearch <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">(query: string) =&gt; void</span></td>
                  <td>-</td>
                  <td className="prop-desc">Called when the user submits the search form (clicks submit or hits Enter).</td>
                </tr>
                <tr>
                  <td className="prop-name">onChange</td>
                  <td><span className="prop-type">(value: string) =&gt; void</span></td>
                  <td>-</td>
                  <td className="prop-desc">Called on every keyboard input keystroke. Useful for controlled input bindings.</td>
                </tr>
                <tr>
                  <td className="prop-name">isLoading</td>
                  <td><span className="prop-type">boolean</span></td>
                  <td><code>false</code></td>
                  <td className="prop-desc">Displays a sleek loading indicator and disables the search inputs during active queries.</td>
                </tr>
                <tr>
                  <td className="prop-name">placeholder</td>
                  <td><span className="prop-type">string</span></td>
                  <td><code>"Search..."</code></td>
                  <td className="prop-desc">Input placeholder text.</td>
                </tr>
                <tr>
                  <td className="prop-name">className</td>
                  <td><span className="prop-type">string</span></td>
                  <td><code>""</code></td>
                  <td className="prop-desc">Optional CSS class string appended to the main container.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 style={{ marginBottom: '14px', fontSize: '18px' }}>Usage Snippet</h3>
          <CodeBlock
            code={`
import { useState } from 'react';
import { SearchBar } from '@headless-media/ui-react';

function SearchContainer() {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = (query: string) => {
    setLoading(true);
    fetchVideos(query).finally(() => setLoading(false));
  };

  return (
    <SearchBar
      value={value}
      onChange={setValue}
      onSearch={handleSearch}
      isLoading={loading}
      placeholder="Search for ocean waves..."
    />
  );
}
            `}
          />
        </section>

        {/* ─── VideoGrid Section ────────────────────────────────────────────────── */}
        <section id="videogrid" className="component-section">
          <h2 className="component-section__title">VideoGrid</h2>
          <p className="component-section__desc">
            Renders a responsive, keyboard-navigable grid of video thumbnails. It handles empty results,
            skeleton cards while loading, selection highlight, and paginated "Load More" triggers.
          </p>

          <div className="demo-sandbox">
            <div className="demo-sandbox__header">
              <div className="demo-sandbox__title"><span>⚡</span> Live Sandbox</div>
              <span className="prop-type" style={{ background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }}>
                Selected ID: {gridSelectedId ?? 'None'}
              </span>
            </div>
            <div className="demo-sandbox__preview" style={{ padding: '20px' }}>
              <VideoGrid
                videos={gridVideos}
                selectedId={gridSelectedId}
                isLoading={gridIsLoading}
                hasMore={gridHasMore}
                onSelect={handleSelectVideo}
                onLoadMore={handleLoadMore}
              />
            </div>
            <div className="demo-sandbox__controls">
              <button
                onClick={() => {
                  setGridVideos([]);
                  setGridSelectedId(null);
                  setGridHasMore(true);
                }}
                className="demo-control-btn"
              >
                Set Empty
              </button>
              <button
                onClick={() => {
                  setGridVideos(MOCK_VIDEOS);
                  setGridSelectedId(null);
                  setGridHasMore(true);
                }}
                className="demo-control-btn"
              >
                Reset Initial Data
              </button>
              <button
                onClick={() => {
                  setGridIsLoading(p => !p);
                }}
                className={`demo-control-btn ${gridIsLoading ? 'demo-control-btn--active' : ''}`}
              >
                Toggle Loading
              </button>
            </div>
          </div>

          <h3 style={{ marginBottom: '14px', fontSize: '18px' }}>Prop Reference</h3>
          <div className="props-table-container">
            <table className="props-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="prop-name">videos <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">VideoItem[]</span></td>
                  <td>-</td>
                  <td className="prop-desc">Array of normalized video items containing <code>id</code>, <code>thumbnailUrl</code>, <code>duration</code>, and <code>userName</code>.</td>
                </tr>
                <tr>
                  <td className="prop-name">selectedId</td>
                  <td><span className="prop-type">number | null</span></td>
                  <td><code>null</code></td>
                  <td className="prop-desc">The ID of the currently selected/active video. Highlighting uses the class <code>.video-card--selected</code>.</td>
                </tr>
                <tr>
                  <td className="prop-name">isLoading</td>
                  <td><span className="prop-type">boolean</span></td>
                  <td><code>false</code></td>
                  <td className="prop-desc">Shows skeleton placeholders (when no videos loaded) or a load-more spinner indicator.</td>
                </tr>
                <tr>
                  <td className="prop-name">hasMore</td>
                  <td><span className="prop-type">boolean</span></td>
                  <td><code>false</code></td>
                  <td className="prop-desc">Shows the "Load More" button if true and not loading.</td>
                </tr>
                <tr>
                  <td className="prop-name">onSelect</td>
                  <td><span className="prop-type">(id: number) =&gt; void</span></td>
                  <td>-</td>
                  <td className="prop-desc">Callback executed when a thumbnail card is clicked or focused and selected with space/enter.</td>
                </tr>
                <tr>
                  <td className="prop-name">onLoadMore</td>
                  <td><span className="prop-type">() =&gt; void</span></td>
                  <td>-</td>
                  <td className="prop-desc">Callback executed when clicking the pagination button.</td>
                </tr>
                <tr>
                  <td className="prop-name">className</td>
                  <td><span className="prop-type">string</span></td>
                  <td><code>""</code></td>
                  <td className="prop-desc">Custom CSS class overrides.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 style={{ marginBottom: '14px', fontSize: '18px' }}>Usage Snippet</h3>
          <CodeBlock
            code={`
import { VideoGrid } from '@headless-media/ui-react';

function GridPage() {
  const { results, isLoading, hasNextPage, loadMore } = useSearch();
  const [selectedId, setSelectedId] = useState(null);

  // Map SDK items to UI items if structure differs
  const uiVideos = results.map(video => ({
    id: video.id,
    thumbnailUrl: video.image,
    duration: video.duration,
    userName: video.user.name,
    videoUrl: video.video_files[0]?.link
  }));

  return (
    <VideoGrid
      videos={uiVideos}
      selectedId={selectedId}
      isLoading={isLoading}
      hasMore={hasNextPage}
      onSelect={setSelectedId}
      onLoadMore={loadMore}
    />
  );
}
            `}
          />
        </section>

        {/* ─── VideoPlayer Section ──────────────────────────────────────────────── */}
        <section id="videoplayer" className="component-section">
          <h2 className="component-section__title">VideoPlayer</h2>
          <p className="component-section__desc">
            A customizable, fully interactive video player interface displaying playback states, volume control,
            time sliders, status tracking, and error messaging overlay.
          </p>

          <div className="demo-sandbox">
            <div className="demo-sandbox__header">
              <div className="demo-sandbox__title"><span>⚡</span> Live Sandbox</div>
              <span className="prop-type" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa' }}>
                Status: {playerStatus}
              </span>
            </div>
            <div className="demo-sandbox__preview" style={{ background: 'rgba(0,0,0,0.8)' }}>
              <VideoPlayer
                videoUrl={playerUrl}
                isPlaying={playerIsPlaying}
                isMuted={playerIsMuted}
                volume={playerVolume}
                currentTime={playerCurrentTime}
                duration={playerDuration || 30}
                status={playerStatus}
                error={playerError}
                onPlay={() => {
                  setPlayerIsPlaying(true);
                  setPlayerStatus('playing');
                }}
                onPause={() => {
                  setPlayerIsPlaying(false);
                  setPlayerStatus('paused');
                }}
                onTimeUpdate={setPlayerCurrentTime}
                onVolumeChange={setPlayerVolume}
                onMuteToggle={() => setPlayerIsMuted(m => !m)}
                onError={setPlayerError}
              />
            </div>
            <div className="demo-sandbox__controls">
              <button
                onClick={handlePlayToggle}
                className="demo-control-btn demo-control-btn--active"
              >
                {playerStatus === 'playing' ? 'Pause Simulation' : 'Play Simulation'}
              </button>
              <button
                onClick={() => {
                  setPlayerStatus('loading');
                  setTimeout(() => setPlayerStatus('playing'), 1000);
                }}
                className="demo-control-btn"
              >
                Simulate Loading
              </button>
              <button
                onClick={() => {
                  setPlayerStatus('error');
                  setPlayerError('The video playback was aborted due to a simulated network error.');
                }}
                className="demo-control-btn"
              >
                Simulate Error
              </button>
              <button
                onClick={() => {
                  setPlayerStatus('idle');
                  setPlayerError(null);
                  setPlayerCurrentTime(0);
                  setPlayerIsPlaying(false);
                }}
                className="demo-control-btn"
              >
                Reset Player
              </button>
            </div>
          </div>

          <h3 style={{ marginBottom: '14px', fontSize: '18px' }}>Prop Reference</h3>
          <div className="props-table-container">
            <table className="props-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="prop-name">videoUrl <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">string | null</span></td>
                  <td>-</td>
                  <td className="prop-desc">The playback link. If null, player displays in <code>idle</code> state.</td>
                </tr>
                <tr>
                  <td className="prop-name">isPlaying <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">boolean</span></td>
                  <td>-</td>
                  <td className="prop-desc">Controlled playback flag.</td>
                </tr>
                <tr>
                  <td className="prop-name">isMuted <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">boolean</span></td>
                  <td>-</td>
                  <td className="prop-desc">Controlled mute flag.</td>
                </tr>
                <tr>
                  <td className="prop-name">volume <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">number</span></td>
                  <td>-</td>
                  <td className="prop-desc">Volume level from <code>0.0</code> (silent) to <code>1.0</code> (max).</td>
                </tr>
                <tr>
                  <td className="prop-name">currentTime <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">number</span></td>
                  <td>-</td>
                  <td className="prop-desc">Current playhead position in seconds.</td>
                </tr>
                <tr>
                  <td className="prop-name">duration <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">number</span></td>
                  <td>-</td>
                  <td className="prop-desc">Total length of the video in seconds.</td>
                </tr>
                <tr>
                  <td className="prop-name">status <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">UIPlayerStatus</span></td>
                  <td>-</td>
                  <td className="prop-desc">Sleek spinner, play banner, or errors triggered based on status: <code>'idle' | 'loading' | 'playing' | 'paused' | 'error' | 'ended'</code>.</td>
                </tr>
                <tr>
                  <td className="prop-name">error</td>
                  <td><span className="prop-type">string | null</span></td>
                  <td><code>null</code></td>
                  <td className="prop-desc">Error details string displayed in the crash screen overlay.</td>
                </tr>
                <tr>
                  <td className="prop-name">onPlay / onPause</td>
                  <td><span className="prop-type">() =&gt; void</span></td>
                  <td>-</td>
                  <td className="prop-desc">Callbacks fired when player controls are toggled.</td>
                </tr>
                <tr>
                  <td className="prop-name">onTimeUpdate</td>
                  <td><span className="prop-type">(time: number) =&gt; void</span></td>
                  <td>-</td>
                  <td className="prop-desc">Fired when dragging the progress slider or when the native video updates time.</td>
                </tr>
                <tr>
                  <td className="prop-name">onVolumeChange</td>
                  <td><span className="prop-type">(vol: number) =&gt; void</span></td>
                  <td>-</td>
                  <td className="prop-desc">Fired when moving the volume control slider.</td>
                </tr>
                <tr>
                  <td className="prop-name">onMuteToggle</td>
                  <td><span className="prop-type">() =&gt; void</span></td>
                  <td>-</td>
                  <td className="prop-desc">Fired when clicking the speaker button.</td>
                </tr>
                <tr>
                  <td className="prop-name">onError</td>
                  <td><span className="prop-type">(err: string) =&gt; void</span></td>
                  <td>-</td>
                  <td className="prop-desc">Fired if the HTMLVideoElement raises an error event.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 style={{ marginBottom: '14px', fontSize: '18px' }}>Usage Snippet</h3>
          <CodeBlock
            code={`
import { VideoPlayer } from '@headless-media/ui-react';
import { usePlayer } from '@headless-media/react';

function CustomPlayer() {
  const {
    state: { isPlaying, isMuted, volume, currentTime, duration, status, error, activeVideoUrl },
    actions: { play, pause, setVolume, mute, seek }
  } = usePlayer();

  return (
    <VideoPlayer
      videoUrl={activeVideoUrl}
      isPlaying={isPlaying}
      isMuted={isMuted}
      volume={volume}
      currentTime={currentTime}
      duration={duration}
      status={status}
      error={error}
      onPlay={play}
      onPause={pause}
      onTimeUpdate={seek}
      onVolumeChange={setVolume}
      onMuteToggle={mute}
    />
  );
}
            `}
          />
        </section>

        {/* ─── Lightbox Section ────────────────────────────────────────────────── */}
        <section id="lightbox" className="component-section">
          <h2 className="component-section__title">Lightbox</h2>
          <p className="component-section__desc">
            An overlay Modal backdrop with pre-configured aria guidelines, previous/next handlers, and close buttons
            supporting escape key triggers.
          </p>

          <div className="demo-sandbox">
            <div className="demo-sandbox__header">
              <div className="demo-sandbox__title"><span>⚡</span> Live Sandbox</div>
              <span className="prop-type" style={{ background: isLightboxOpen ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isLightboxOpen ? '#10b981' : '#ef4444' }}>
                Open: {isLightboxOpen ? 'True' : 'False'}
              </span>
            </div>
            <div className="demo-sandbox__preview">
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="demo-control-btn demo-control-btn--active"
                style={{ padding: '12px 24px', fontSize: '15px' }}
              >
                Open Lightbox Overlay
              </button>

              <Lightbox
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                onPrevious={() => setLightboxIndex(prev => (prev === 0 ? MOCK_VIDEOS.length - 1 : prev - 1))}
                onNext={() => setLightboxIndex(prev => (prev === MOCK_VIDEOS.length - 1 ? 0 : prev + 1))}
                ariaLabel="Demo Media Lightbox"
              >
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <img
                    src={MOCK_VIDEOS[lightboxIndex]?.thumbnailUrl}
                    alt={MOCK_VIDEOS[lightboxIndex]?.userName}
                    style={{ maxWidth: '100%', maxHeight: '50vh', borderRadius: '12px', border: '1px solid var(--border)' }}
                  />
                  <h3 style={{ marginTop: '16px', color: '#fff' }}>{MOCK_VIDEOS[lightboxIndex]?.userName}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Item {lightboxIndex + 1} of {MOCK_VIDEOS.length}</p>
                </div>
              </Lightbox>
            </div>
          </div>

          <h3 style={{ marginBottom: '14px', fontSize: '18px' }}>Prop Reference</h3>
          <div className="props-table-container">
            <table className="props-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="prop-name">isOpen <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">boolean</span></td>
                  <td>-</td>
                  <td className="prop-desc">Controls whether the modal is visible. When true, locks scrolling on body.</td>
                </tr>
                <tr>
                  <td className="prop-name">onClose <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">() =&gt; void</span></td>
                  <td>-</td>
                  <td className="prop-desc">Triggered when clicking the backdrop, pressing Escape, or clicking the close button.</td>
                </tr>
                <tr>
                  <td className="prop-name">onPrevious</td>
                  <td><span className="prop-type">() =&gt; void</span></td>
                  <td>-</td>
                  <td className="prop-desc">Optional callback. Shows a left arrow button in the modal. Fired on click or left key press.</td>
                </tr>
                <tr>
                  <td className="prop-name">onNext</td>
                  <td><span className="prop-type">() =&gt; void</span></td>
                  <td>-</td>
                  <td className="prop-desc">Optional callback. Shows a right arrow button in the modal. Fired on click or right key press.</td>
                </tr>
                <tr>
                  <td className="prop-name">children</td>
                  <td><span className="prop-type">React.ReactNode</span></td>
                  <td>-</td>
                  <td className="prop-desc">Content elements rendered inside the central modal container.</td>
                </tr>
                <tr>
                  <td className="prop-name">ariaLabel</td>
                  <td><span className="prop-type">string</span></td>
                  <td><code>"Media details"</code></td>
                  <td className="prop-desc">Accessibility label for screen readers.</td>
                </tr>
                <tr>
                  <td className="prop-name">className</td>
                  <td><span className="prop-type">string</span></td>
                  <td><code>""</code></td>
                  <td className="prop-desc">CSS class override.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 style={{ marginBottom: '14px', fontSize: '18px' }}>Usage Snippet</h3>
          <CodeBlock
            code={`
import { useState } from 'react';
import { Lightbox } from '@headless-media/ui-react';

function LightboxDemo() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Overlay</button>
      
      <Lightbox isOpen={open} onClose={() => setOpen(false)}>
        <div className="lightbox-content">
          <h2>Project Details</h2>
          <p>Any custom markup or media nodes can be placed here!</p>
        </div>
      </Lightbox>
    </>
  );
}
            `}
          />
        </section>

        {/* ─── ReelSwiper Section ──────────────────────────────────────────────── */}
        <section id="reelswiper" className="component-section">
          <h2 className="component-section__title">ReelSwiper</h2>
          <p className="component-section__desc">
            A responsive, swipable layout designed to render feeds vertically or horizontally (e.g. video feeds, stories),
            reporting the active index upon navigation updates.
          </p>

          <div className="demo-sandbox">
            <div className="demo-sandbox__header">
              <div className="demo-sandbox__title"><span>⚡</span> Live Sandbox</div>
              <span className="prop-type" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}>
                Active Index: {reelIndex}
              </span>
            </div>
            <div className="demo-sandbox__preview" style={{ padding: '0', background: '#0e0e1c' }}>
              <ReelSwiper
                items={MOCK_VIDEOS}
                onActiveChange={setReelIndex}
                className="docs-reel-swiper"
                renderItem={(video, isActive, idx) => (
                  <div
                    key={video.id}
                    style={{
                      height: '350px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      position: 'relative',
                      background: isActive ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255,255,255,0.01)',
                      borderBottom: '1px solid var(--border)',
                      transition: 'all 0.3s ease',
                      width: '100%',
                    }}
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.userName}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: isActive ? '3px solid var(--accent-purple)' : '1px solid var(--border)',
                        marginBottom: '15px',
                        boxShadow: isActive ? '0 0 20px rgba(124, 58, 237, 0.5)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <h3 style={{ color: isActive ? '#fff' : 'var(--text-secondary)' }}>{video.userName}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Index: {idx}</p>
                  </div>
                )}
              />
            </div>
            <div className="demo-sandbox__controls">
              <span className="prop-default">Simulate index:</span>
              {MOCK_VIDEOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReelIndex(i)}
                  className={`demo-control-btn ${reelIndex === i ? 'demo-control-btn--active' : ''}`}
                >
                  Go to {i}
                </button>
              ))}
            </div>
          </div>

          <h3 style={{ marginBottom: '14px', fontSize: '18px' }}>Prop Reference</h3>
          <div className="props-table-container">
            <table className="props-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="prop-name">items <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">T[]</span></td>
                  <td>-</td>
                  <td className="prop-desc">Array of raw data items (generic type <code>T</code>) supplied to the swiper.</td>
                </tr>
                <tr>
                  <td className="prop-name">renderItem <span className="prop-required-badge">Required</span></td>
                  <td><span className="prop-type">(item: T, isActive: boolean, index: number) =&gt; ReactNode</span></td>
                  <td>-</td>
                  <td className="prop-desc">Functional rendering prop called for each item. Passes the item data, active status, and sequence index.</td>
                </tr>
                <tr>
                  <td className="prop-name">onActiveChange</td>
                  <td><span className="prop-type">(index: number) =&gt; void</span></td>
                  <td>-</td>
                  <td className="prop-desc">Callback executed when the visible card switches (via wheel scroll or arrow keys).</td>
                </tr>
                <tr>
                  <td className="prop-name">className</td>
                  <td><span className="prop-type">string</span></td>
                  <td><code>""</code></td>
                  <td className="prop-desc">CSS class override.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 style={{ marginBottom: '14px', fontSize: '18px' }}>Usage Snippet</h3>
          <CodeBlock
            code={`
import { ReelSwiper } from '@headless-media/ui-react';

function ReelsContainer({ videos }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <ReelSwiper
      items={videos}
      onActiveChange={setActiveIndex}
      renderItem={(video, isActive, index) => (
        <div className={\`reel-card \${isActive ? 'active' : ''}\`}>
          <video src={video.videoUrl} loop muted autoPlay={isActive} />
          <div className="overlay">
            <h3>@{video.userName}</h3>
          </div>
        </div>
      )}
    />
  );
}
            `}
          />
        </section>
      </main>
    </div>
  );
}
