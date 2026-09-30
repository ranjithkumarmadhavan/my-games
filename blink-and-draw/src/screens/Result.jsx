import { useEffect } from 'react';
import { sfx } from '../lib/sound';

function classicMessage(pct) {
  if (pct === 1) return 'Perfect memory! 🧠✨';
  if (pct >= 0.8) return 'Brilliant doodling!';
  if (pct >= 0.5) return 'Not bad at all!';
  if (pct >= 0.25) return 'Those doodles were… abstract.';
  return 'Picasso would be confused too. 😅';
}

export default function Result({ mode, words, result, players, onPlayAgain, onChangeDifficulty, onHome }) {
  const isFaceOff = mode === 'faceoff';

  let headline;
  let sub;
  if (isFaceOff) {
    const [a, b] = result.scores;
    headline = a === b ? "It's a tie! 🤝" : `${players[a > b ? 0 : 1]} wins! 🏆`;
    sub = `${players[0]} ${a} – ${b} ${players[1]}`;
  } else {
    const score = result.answers.filter(Boolean).length;
    headline = `${score} / ${words.length}`;
    sub = classicMessage(score / words.length);
  }

  useEffect(() => {
    sfx.win();
  }, []);

  return (
    <section className="screen result">
      <div className="result-hero sketch">
        <p className="stage-label">{isFaceOff ? 'Face-Off result' : 'Your score'}</p>
        <h1 className="result-headline">{headline}</h1>
        <p className="result-sub">{sub}</p>
      </div>

      <h2 className="section-title">This round's words</h2>
      <ol className="word-grid compact">
        {words.map((w, i) => {
          const mark = isFaceOff ? null : result.answers[i];
          return (
            <li key={w} className={`word-cell sketch ${mark === true ? 'right' : mark === false ? 'wrong' : ''}`}>
              <span className="word-num">{i + 1}</span>
              <span className="word-text">{w}</span>
              {mark != null && <span className="word-mark">{mark ? '✓' : '✗'}</span>}
            </li>
          );
        })}
      </ol>

      <div className="action-bar">
        <button className="btn primary big" onClick={onPlayAgain}>
          ↻ Play again
        </button>
        <button className="btn big" onClick={onChangeDifficulty}>
          Change difficulty
        </button>
      </div>
      <button className="text-btn" onClick={onHome}>
        Back to modes
      </button>
    </section>
  );
}
