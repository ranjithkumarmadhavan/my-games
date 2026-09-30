import { useMemo, useState } from 'react';
import { shuffle } from '../lib/words';
import { sfx } from '../lib/sound';

export default function ClassicRecall({ words, onDone, onQuit }) {
  const order = useMemo(() => shuffle(words.map((_, i) => i)), [words]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]); // boolean per box index
  const [showAnswer, setShowAnswer] = useState(false);

  const box = order[step];
  const score = answers.filter(Boolean).length;

  const mark = (correct) => {
    correct ? sfx.correct() : sfx.wrong();
    const next = [...answers];
    next[box] = correct;
    if (step + 1 >= order.length) {
      onDone({ answers: next });
      return;
    }
    setAnswers(next);
    setStep(step + 1);
    setShowAnswer(false);
  };

  return (
    <section className="screen recall">
      <div className="recall-top">
        <span className="pill">
          Question {step + 1} / {order.length}
        </span>
        <span className="pill score">Score: {score}</span>
      </div>

      <div className="progress" aria-hidden>
        <span style={{ width: `${(step / order.length) * 100}%` }} />
      </div>

      <div className="recall-card sketch">
        <p className="recall-ask">Ask the Artist:</p>
        <p className="recall-question">
          What was <span className="big-num-inline">#{box + 1}</span>?
        </p>

        <button
          className={`answer-reveal ${showAnswer ? 'shown' : ''}`}
          onClick={() => setShowAnswer(true)}
          aria-live="polite"
        >
          {showAnswer ? words[box] : 'Tap to see the answer'}
        </button>
      </div>

      <div className="action-bar">
        <button className="btn big wrong" onClick={() => mark(false)}>
          ✗ Missed
        </button>
        <button className="btn big right" onClick={() => mark(true)}>
          ✓ Got it
        </button>
      </div>

      <button className="text-btn" onClick={onQuit}>
        Quit round
      </button>
    </section>
  );
}
