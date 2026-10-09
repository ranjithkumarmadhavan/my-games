import { useState } from 'react';
import Hand from '../components/Hand';
import { api } from '../lib/api';
import { loadPref, savePref } from '../lib/session';
import { unlockAudio } from '../lib/sound';

const initialCode = () => new URLSearchParams(window.location.search).get('room')?.toUpperCase().slice(0, 4) || '';

export default function Home({ onEnter, notice }) {
  const [name, setName] = useState(() => loadPref('hc-name', ''));
  const [code, setCode] = useState(initialCode);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const hasInvite = Boolean(initialCode());

  const run = async (kind) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter your name first.');
      return;
    }
    if (kind === 'join' && code.length !== 4) {
      setError('Room codes have 4 characters.');
      return;
    }
    unlockAudio();
    savePref('hc-name', trimmed);
    setBusy(kind);
    setError('');
    try {
      const res = kind === 'create' ? await api.create(trimmed) : await api.join(code, trimmed);
      const { token, ...view } = res;
      onEnter({ code: view.code, token, seat: view.seat }, view);
    } catch (e) {
      setError(e.message);
      setBusy(null);
    }
  };

  return (
    <section className="screen home">
      <div className="hero">
        <div className="hero-hands" aria-hidden>
          <Hand value={4} size={58} />
          <span className="hero-vs">VS</span>
          <Hand value={6} size={58} mirrored />
        </div>
        <h1 className="title">Hand Cricket</h1>
        <p className="tagline">The playground classic. Two players, anywhere in the world.</p>
      </div>

      {notice && <p className="notice">{notice}</p>}

      <div className="card">
        <label className="form-field">
          <span className="field-label">Your name</span>
          <input
            className="text-input"
            value={name}
            maxLength={20}
            placeholder="e.g. Ranjith"
            autoFocus={hasInvite}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        {!hasInvite && (
          <>
            <button className="btn primary big" onClick={() => run('create')} disabled={Boolean(busy)}>
              {busy === 'create' ? 'Creating…' : '🏏 Create room'}
            </button>
            <div className="divider">
              <span>or join a friend</span>
            </div>
          </>
        )}

        <div className="join-row">
          <input
            className="text-input code-input"
            value={code}
            maxLength={4}
            placeholder="CODE"
            aria-label="Room code"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && run('join')}
          />
          <button className={`btn big ${hasInvite ? 'primary' : ''}`} onClick={() => run('join')} disabled={Boolean(busy)}>
            {busy === 'join' ? 'Joining…' : 'Join'}
          </button>
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
