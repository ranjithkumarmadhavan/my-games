import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import HelpModal from './components/HelpModal';
import Home from './screens/Home';
import Setup from './screens/Setup';
import ClassicPlay from './screens/ClassicPlay';
import ClassicRecall from './screens/ClassicRecall';
import FaceOffPlay from './screens/FaceOffPlay';
import Result from './screens/Result';
import { usePersistentState } from './lib/storage';
import { pickWords } from './lib/words';
import { setMuted, unlockAudio } from './lib/sound';
import { stopSpeaking } from './lib/speech';

const DEFAULT_SETTINGS = { speed: 1, count: 15, autoRead: true, writeTime: 60, p1: '', p2: '' };

// The My Games landing page runs on its own dev server locally; in production it's the site root.
const LANDING_URL = import.meta.env.DEV ? 'http://localhost:5173/' : '/';

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export default function App() {
  const [settings, setSettings] = usePersistentState('bd-settings', DEFAULT_SETTINGS);
  const [theme, setTheme] = usePersistentState('bd-theme', prefersDark() ? 'dark' : 'light');
  const [muted, setMutedPref] = usePersistentState('bd-muted', false);
  const [helpOpen, setHelpOpen] = useState(false);

  // screen: home | setup | classic-play | classic-recall | faceoff-play | result
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState(null);
  const [round, setRound] = useState(null); // { id, difficulty, words }
  const [result, setResult] = useState(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1b1e25' : '#fdfbf4');
  }, [theme]);

  useEffect(() => setMuted(muted), [muted]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  const players = [settings.p1.trim() || 'Player 1', settings.p2.trim() || 'Player 2'];

  const go = (next) => {
    stopSpeaking();
    setScreen(next);
  };

  const startRound = (difficulty) => {
    unlockAudio();
    setRound({ id: Date.now(), difficulty, words: pickWords(difficulty, settings.count) });
    setResult(null);
    go(mode === 'classic' ? 'classic-play' : 'faceoff-play');
  };

  const finish = (data) => {
    setResult(data);
    go('result');
  };

  const closeHelp = useCallback(() => setHelpOpen(false), []);

  return (
    <div className="app">
      <Header
        onHome={() => go('home')}
        onHelp={() => setHelpOpen(true)}
        muted={muted}
        onToggleMute={() => setMutedPref(!muted)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      <main className="main">
        {screen === 'home' && (
          <Home
            onPick={(m) => {
              setMode(m);
              go('setup');
            }}
            onHelp={() => setHelpOpen(true)}
          />
        )}

        {screen === 'setup' && (
          <Setup
            mode={mode}
            settings={settings}
            onChange={setSettings}
            onStart={startRound}
            onBack={() => go('home')}
          />
        )}

        {screen === 'classic-play' && (
          <ClassicPlay
            key={round.id}
            words={round.words}
            difficulty={round.difficulty}
            settings={settings}
            onRecall={() => go('classic-recall')}
            onQuit={() => go('setup')}
          />
        )}

        {screen === 'classic-recall' && (
          <ClassicRecall key={round.id} words={round.words} onDone={finish} onQuit={() => go('setup')} />
        )}

        {screen === 'faceoff-play' && (
          <FaceOffPlay
            key={round.id}
            words={round.words}
            settings={settings}
            players={players}
            onDone={finish}
            onQuit={() => go('setup')}
          />
        )}

        {screen === 'result' && (
          <Result
            mode={mode}
            words={round.words}
            result={result}
            players={players}
            onPlayAgain={() => startRound(round.difficulty)}
            onChangeDifficulty={() => go('setup')}
            onHome={() => go('home')}
          />
        )}
      </main>

      <footer className="footer">
        <a href={LANDING_URL}>← All games</a> · Made for doodlers
      </footer>

      {helpOpen && <HelpModal onClose={closeHelp} />}
    </div>
  );
}
