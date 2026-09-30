export default function Home({ onPick, onHelp }) {
  return (
    <section className="screen home">
      <div className="hero">
        <h1 className="title">
          Blink <span className="amp">&amp;</span> Draw
        </h1>
        <p className="tagline">Hear it. Doodle it. Remember it.</p>
      </div>

      <div className="mode-grid">
        <button className="mode-card sketch" onClick={() => onPick('classic')}>
          <span className="mode-emoji" aria-hidden>🎤</span>
          <h2>Classic Duel</h2>
          <p>
            One player reads, the other draws. Then the Reader quizzes the Artist: <i>“What was #8?”</i>
          </p>
          <span className="chip">2 players · 1 sheet</span>
        </button>

        <button className="mode-card sketch alt" onClick={() => onPick('faceoff')}>
          <span className="mode-emoji" aria-hidden>⚡</span>
          <h2>Face-Off</h2>
          <p>The app reads the words aloud and you both draw at the same time. Then write your answers against the clock.</p>
          <span className="chip">2 players · 2 sheets</span>
        </button>
      </div>

      <button className="text-btn" onClick={onHelp}>
        New here? Read how to play →
      </button>
    </section>
  );
}
