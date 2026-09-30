import { useEffect, useRef, useState } from 'react';
import { useWakeLock, useWordSequence } from '../lib/hooks';

export default function ClassicPlay({ words, settings, difficulty, onRecall, onQuit }) {
  const [revealed, setRevealed] = useState(false);
  const { phase, count, index, start, stop } = useWordSequence({
    words,
    intervalMs: settings.speed * 1000,
    speakWords: settings.autoRead,
  });
  const activeRef = useRef(null);

  useWakeLock(phase === 'countdown' || phase === 'running');

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [index]);

  if (!revealed) {
    return (
      <section className="screen center">
        <div className="panel sketch cover">
          <span className="cover-emoji" aria-hidden>🙈</span>
          <h1 className="screen-title">Reader only!</h1>
          <p>
            Your {words.length} <b>{difficulty}</b> words are ready. Make sure the Artist can't see this
            screen and has a sheet with {words.length} numbered boxes.
          </p>
          <button className="btn primary big" onClick={() => setRevealed(true)}>
            Show the words
          </button>
          <button className="text-btn" onClick={onQuit}>
            Back
          </button>
        </div>
      </section>
    );
  }

  const running = phase === 'countdown' || phase === 'running';

  return (
    <section className="screen classic-play">
      <div className="play-head">
        <div>
          <h1 className="screen-title">Read these out</h1>
          <p className="screen-sub">
            {settings.autoRead
              ? `Auto-read is on: the app says one word every ${settings.speed}s.`
              : `Read one word every ${settings.speed}s. Tap Start for a pacer that highlights each word.`}
          </p>
        </div>
      </div>

      {phase === 'countdown' && (
        <div className="countdown-banner sketch" aria-live="assertive">
          {count > 0 ? count : 'Go!'}
        </div>
      )}

      <ol className="word-grid">
        {words.map((w, i) => (
          <li
            key={w}
            ref={i === index ? activeRef : null}
            className={`word-cell sketch ${i === index && phase === 'running' ? 'current' : ''} ${
              phase === 'running' && i < index ? 'past' : ''
            }`}
          >
            <span className="word-num">{i + 1}</span>
            <span className="word-text">{w}</span>
          </li>
        ))}
      </ol>

      <div className="action-bar">
        {phase === 'idle' && (
          <button className="btn primary big" onClick={start}>
            {settings.autoRead ? '▶ Start auto-read' : '▶ Start pacer'}
          </button>
        )}
        {running && (
          <button className="btn big" onClick={stop}>
            ■ Stop
          </button>
        )}
        {!running && (
          <button className={`btn big ${phase === 'done' ? 'primary' : ''}`} onClick={onRecall}>
            Start recall →
          </button>
        )}
      </div>
    </section>
  );
}
