import { useState } from 'react';
import { CATEGORIES, GAMES, gameUrl } from './games';

const iconSrc = (game) => (import.meta.env.DEV ? new URL('favicon.svg', game.devUrl).href : game.icon);

export default function App() {
  const [active, setActive] = useState('in-person');
  const category = CATEGORIES.find((c) => c.id === active);
  const games = GAMES.filter((g) => g.category === active);

  return (
    <div className="app">
      <header className="header">
        <span className="brand">
          <img src="/favicon.svg" alt="" width="32" height="32" />
          My Games
        </span>
      </header>

      <main className="main">
        <section className="hero">
          <h1 className="title">Pick a game, press play.</h1>
          <p className="tagline">Quick, silly and surprisingly competitive games for any number of players.</p>
        </section>

        <div className="tabs" role="tablist" aria-label="Game categories">
          {CATEGORIES.map((c) => {
            const count = GAMES.filter((g) => g.category === c.id).length;
            const selected = c.id === active;
            return (
              <button
                key={c.id}
                id={`tab-${c.id}`}
                role="tab"
                aria-selected={selected}
                aria-controls="games-panel"
                className={`tab sketch ${selected ? 'active' : ''}`}
                onClick={() => setActive(c.id)}
                onMouseEnter={() => setActive(c.id)}
                onFocus={() => setActive(c.id)}
              >
                <span className="tab-emoji" aria-hidden>
                  {c.emoji}
                </span>
                <span className="tab-label">{c.label}</span>
                <span className="tab-count">{count ? `${count} game${count > 1 ? 's' : ''}` : 'Coming soon'}</span>
              </button>
            );
          })}
        </div>

        <section id="games-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="panel" key={active}>
          <p className="panel-blurb">{category.blurb}</p>

          {games.length ? (
            <ul className="game-grid">
              {games.map((g) => (
                <li key={g.id}>
                  <a className="game-card sketch" href={gameUrl(g)}>
                    <img className="game-icon" src={iconSrc(g)} alt="" width="64" height="64" />
                    <span className="game-body">
                      <span className="game-title">{g.title}</span>
                      <span className="game-tagline">{g.tagline}</span>
                      <span className="game-meta">
                        <span className="chip">{g.players}</span>
                        {g.extras && <span className="chip">{g.extras}</span>}
                      </span>
                      <span className="play" aria-hidden>
                        Play →
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty sketch">
              <span className="empty-emoji" aria-hidden>
                🛠️
              </span>
              <p>New games are on the way. Check back soon!</p>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">© {new Date().getFullYear()} Ranjith Kumar Madhavan</footer>
    </div>
  );
}
