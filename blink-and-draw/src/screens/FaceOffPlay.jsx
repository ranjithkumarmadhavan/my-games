import { useEffect, useState } from 'react';
import { useCountdownTimer, useWakeLock, useWordSequence } from '../lib/hooks';

function ScoreStepper({ name, value, max, onChange }) {
  return (
    <div className="stepper sketch">
      <span className="stepper-name">{name}</span>
      <div className="stepper-controls">
        <button className="icon-btn big" onClick={() => onChange(Math.max(0, value - 1))} aria-label={`Decrease ${name}'s score`}>
          −
        </button>
        <span className="stepper-value" aria-live="polite">
          {value}
          <small>/{max}</small>
        </span>
        <button className="icon-btn big" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Increase ${name}'s score`}>
          +
        </button>
      </div>
    </div>
  );
}

export default function FaceOffPlay({ words, settings, players, onDone, onQuit }) {
  const [stage, setStage] = useState('ready'); // ready | draw | write | reveal
  const [scores, setScores] = useState([0, 0]);
  const seq = useWordSequence({ words, intervalMs: settings.speed * 1000, speakWords: true });
  const remaining = useCountdownTimer(settings.writeTime, stage === 'write', () => setStage('reveal'));

  useWakeLock(stage === 'draw' || stage === 'write');

  useEffect(() => {
    if (stage === 'draw' && seq.phase === 'done') setStage('write');
  }, [stage, seq.phase]);

  const begin = () => {
    seq.start();
    setStage('draw');
  };

  const quit = () => {
    seq.stop();
    onQuit();
  };

  if (stage === 'ready') {
    return (
      <section className="screen center">
        <div className="panel sketch cover">
          <span className="cover-emoji" aria-hidden>🔊</span>
          <h1 className="screen-title">
            {players[0]} vs {players[1]}
          </h1>
          <ul className="checklist">
            <li>Both sheets have {words.length} numbered boxes</li>
            <li>Volume up, device where you both can hear it</li>
            <li>One word every {settings.speed}s. Pictures only, no letters!</li>
          </ul>
          <button className="btn primary big" onClick={begin}>
            ▶ Start
          </button>
          <button className="text-btn" onClick={onQuit}>
            Back
          </button>
        </div>
      </section>
    );
  }

  if (stage === 'draw') {
    const drawing = seq.phase === 'running';
    const shown = Math.min(seq.index, words.length - 1);
    return (
      <section className="screen center draw-stage">
        {seq.phase === 'countdown' || seq.phase === 'idle' ? (
          <>
            <p className="stage-label">Get ready…</p>
            <div className="giant-num countdown" aria-live="assertive">
              {seq.count > 0 ? seq.count : 'Go!'}
            </div>
          </>
        ) : (
          <>
            <p className="stage-label">Draw in box</p>
            <div key={shown} className="giant-num pop" aria-live="polite">
              {shown + 1}
            </div>
            <div className="dots" aria-hidden>
              {words.map((w, i) => (
                <span key={w} className={i < shown ? 'done' : i === shown && drawing ? 'now' : ''} />
              ))}
            </div>
          </>
        )}
        <button className="text-btn" onClick={quit}>
          Quit round
        </button>
      </section>
    );
  }

  if (stage === 'write') {
    const pct = (remaining / settings.writeTime) * 100;
    return (
      <section className="screen center write-stage">
        <p className="stage-label">Drawing's over! Write your answers</p>
        <div className={`timer-ring ${remaining <= 5 ? 'urgent' : ''}`} style={{ '--pct': pct }}>
          <span className="timer-value" aria-live="off">
            {remaining}
          </span>
          <span className="timer-unit">seconds</span>
        </div>
        <p className="screen-sub">Next to each doodle, write what you think the word was.</p>
        <button className="btn big" onClick={() => setStage('reveal')}>
          We're both done →
        </button>
      </section>
    );
  }

  return (
    <section className="screen reveal">
      <h1 className="screen-title">The answers</h1>
      <p className="screen-sub">Check your sheets, count your correct answers and enter the scores.</p>

      <ol className="word-grid compact">
        {words.map((w, i) => (
          <li key={w} className="word-cell sketch">
            <span className="word-num">{i + 1}</span>
            <span className="word-text">{w}</span>
          </li>
        ))}
      </ol>

      <div className="stepper-row">
        {players.map((name, p) => (
          <ScoreStepper
            key={p}
            name={name}
            value={scores[p]}
            max={words.length}
            onChange={(v) => setScores(p === 0 ? [v, scores[1]] : [scores[0], v])}
          />
        ))}
      </div>

      <div className="action-bar">
        <button className="btn primary big" onClick={() => onDone({ scores })}>
          See who won 🏆
        </button>
      </div>
    </section>
  );
}
