import { useEffect, useRef } from 'react';
import { CloseIcon } from './Icons';

export default function HelpModal({ onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal sketch"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="help-title">How to play</h2>
          <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <p className="lead">
            Words fly by one every second. Doodle each one in a numbered box, then try to remember
            what every doodle was.
          </p>

          <h3>You'll need</h3>
          <ul>
            <li>A sheet of paper and a pen for each player who draws.</li>
            <li>
              Split the sheet into boxes (15 by default) and number them <b>1, 2, 3…</b>
            </li>
          </ul>

          <h3>🎤 Classic Duel</h3>
          <ol>
            <li>
              One player is the <b>Reader</b> and holds the device. The other is the <b>Artist</b> with
              the paper. The Artist must never see the screen.
            </li>
            <li>Pick a difficulty. The app picks the words.</li>
            <li>
              The Reader reads the words out one at a time, or turns on <b>Auto-read</b> so the app says
              them. The Artist quickly doodles each word in the next box, with no going back.
            </li>
            <li>
              When all the words are done, start the <b>Recall</b>. The app asks random box numbers:
              <i> "What was number 8?"</i> The Artist answers by looking only at the doodle.
            </li>
            <li>The Reader taps ✓ or ✗ for each answer. Swap roles and try to beat the score!</li>
          </ol>

          <h3>⚡ Face-Off</h3>
          <ol>
            <li>Both players have paper and draw at the same time. Enter both names.</li>
            <li>
              Put the device where both can hear it. The app reads each word aloud and shows only the{' '}
              <b>box number</b>, never the word.
            </li>
            <li>
              When the drawing ends, a writing timer starts (30, 60 or 90 seconds). Each player writes
              what they think every doodle was.
            </li>
            <li>
              The words are revealed. Count your correct answers, enter the scores, and the app
              crowns the winner.
            </li>
          </ol>

          <h3>House rules</h3>
          <ul>
            <li>
              <b>No letters or numbers</b> inside the doodles. Pictures only!
            </li>
            <li>No going back to finish an earlier box.</li>
            <li>Spelling doesn't matter, and a close synonym counts (e.g. "puppy" for "dog").</li>
          </ul>

          <h3>Settings</h3>
          <ul>
            <li>
              <b>Speed:</b> 1, 2 or 3 seconds per word.
            </li>
            <li>
              <b>Words:</b> play with 10, 15 or 20 boxes.
            </li>
            <li>Words don't repeat on this device until you've seen the whole list for that level.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
