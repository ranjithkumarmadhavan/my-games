import { useEffect, useRef } from 'react';
import Hand from './Hand';

export default function HelpModal({ onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 id="help-title">How to play</h2>
          <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p className="lead">The playground classic, now online. Two players, two devices, one room code.</p>

          <h3>Your hand signs</h3>
          <div className="help-hands">
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <figure key={n}>
                <Hand value={n} size={40} />
                <figcaption>{n}</figcaption>
              </figure>
            ))}
          </div>
          <p className="small">Fist is 0, one to five fingers is 1–5, and a thumbs up is 6.</p>

          <h3>Get into a room</h3>
          <ol>
            <li>One player taps <b>Create room</b> and shares the 4-letter code (or the link).</li>
            <li>The other player enters the code and taps <b>Join</b>. You can be anywhere in the world.</li>
          </ol>

          <h3>Toss (odd or even)</h3>
          <ol>
            <li>The player who joined calls <b>odd</b> or <b>even</b>.</li>
            <li>Both players show a number. If the total matches the call, the caller wins the toss.</li>
            <li>The toss winner chooses to <b>bat</b> or <b>bowl</b> first.</li>
          </ol>

          <h3>Playing</h3>
          <ul>
            <li>Every ball, both players secretly pick a number from 0 to 6. The picks are revealed together.</li>
            <li>Different numbers: the batter scores <b>their</b> number.</li>
            <li>Same number: the batter is <b>OUT!</b></li>
            <li>One wicket each, unlimited balls. The second batter has to beat the first score.</li>
            <li>You have <b>20 seconds</b> per pick. If time runs out, a random number is picked for you.</li>
          </ul>

          <h3>Tie? Super Over!</h3>
          <p>
            If the scores are level, each side bats a <b>Super Over</b>: 6 balls, 1 wicket. The side that batted second
            bats first. Still level? Another Super Over.
          </p>
        </div>
      </div>
    </div>
  );
}
