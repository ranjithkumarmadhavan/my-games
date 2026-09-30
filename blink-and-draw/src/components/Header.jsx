import { HelpIcon, MoonIcon, SoundOffIcon, SoundOnIcon, SunIcon } from './Icons';

export default function Header({ onHome, onHelp, muted, onToggleMute, theme, onToggleTheme }) {
  return (
    <header className="header">
      <button className="brand" onClick={onHome} aria-label="Blink and Draw — home">
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="30" height="30" />
        <span>Blink &amp; Draw</span>
      </button>
      <div className="header-actions">
        <button className="icon-btn" onClick={onHelp} aria-label="How to play" title="How to play">
          <HelpIcon />
        </button>
        <button
          className="icon-btn"
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          aria-pressed={muted}
          title={muted ? 'Sound effects off' : 'Sound effects on'}
        >
          {muted ? <SoundOffIcon /> : <SoundOnIcon />}
        </button>
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
