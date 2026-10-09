import { useCallback, useEffect, useState } from 'react';
import HelpModal from './components/HelpModal';
import Home from './screens/Home';
import Lobby from './screens/Lobby';
import Match from './screens/Match';
import { api } from './lib/api';
import { loadPref, loadSession, savePref, saveSession } from './lib/session';
import { setMuted } from './lib/sound';

const POLL_MS = 1000;
// The My Games landing page runs on its own dev server locally; in production it's the site root.
const LANDING_URL = import.meta.env.DEV ? 'http://localhost:5173/' : '/';

export default function App() {
  const [session, setSession] = useState(loadSession);
  const [view, setView] = useState(null);
  const [online, setOnline] = useState(true);
  const [notice, setNotice] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [muted, setMutedState] = useState(() => loadPref('hc-muted', false));

  useEffect(() => {
    setMuted(muted);
    savePref('hc-muted', muted);
  }, [muted]);

  const leave = useCallback((message = '') => {
    saveSession(null);
    setSession(null);
    setView(null);
    setNotice(message);
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  const enter = (nextSession, nextView) => {
    saveSession(nextSession);
    setSession(nextSession);
    setView(nextView);
    setNotice('');
    window.history.replaceState(null, '', window.location.pathname);
  };

  // Poll the room once a second while we're in one.
  useEffect(() => {
    if (!session) return;
    let stopped = false;
    let timer;
    const tick = async () => {
      try {
        const next = await api.state(session);
        if (stopped) return;
        setView(next);
        setOnline(true);
      } catch (e) {
        if (stopped) return;
        if (e.status === 404) return leave('That room has expired. Create a new one!');
        if (e.status === 403) return leave("You're no longer in that room.");
        setOnline(false);
      }
      timer = setTimeout(tick, POLL_MS);
    };
    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [session, leave]);

  const act = async (expect, value) => {
    const next = await api.act(session, expect, value);
    setView(next);
  };

  const closeHelp = useCallback(() => setHelpOpen(false), []);

  let screen;
  if (!session) screen = <Home onEnter={enter} notice={notice} />;
  else if (!view || view.players.length < 2) screen = <Lobby code={session.code} onLeave={() => leave()} />;
  else screen = <Match view={view} onAct={act} onLeave={() => leave()} />;

  return (
    <div className="app">
      <header className="header">
        <span className="brand">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="30" height="30" />
          Hand Cricket
        </span>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setHelpOpen(true)} aria-label="How to play" title="How to play">
            ?
          </button>
          <button
            className="icon-btn"
            onClick={() => setMutedState(!muted)}
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            aria-pressed={muted}
            title={muted ? 'Sound off' : 'Sound on'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      {!online && <p className="notice warn connection">Reconnecting…</p>}

      <main className="main">{screen}</main>

      <footer className="footer">
        <a href={LANDING_URL}>← All games</a>
      </footer>

      {helpOpen && <HelpModal onClose={closeHelp} />}
    </div>
  );
}
