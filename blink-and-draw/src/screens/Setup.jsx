import { Segmented, Toggle } from '../components/Controls';
import { BackIcon } from '../components/Icons';
import { canSpeak } from '../lib/speech';
import { DIFFICULTIES } from '../lib/words';

export default function Setup({ mode, settings, onChange, onStart, onBack }) {
  const isFaceOff = mode === 'faceoff';
  const set = (key) => (value) => onChange({ ...settings, [key]: value });
  const needsVoice = isFaceOff || settings.autoRead;

  return (
    <section className="screen setup">
      <button className="back-btn" onClick={onBack}>
        <BackIcon /> Modes
      </button>

      <h1 className="screen-title">{isFaceOff ? '⚡ Face-Off' : '🎤 Classic Duel'}</h1>
      <p className="screen-sub">
        {isFaceOff
          ? 'You both draw while the app reads. Grab two sheets of paper.'
          : 'The Reader holds this device. Keep the screen away from the Artist!'}
      </p>

      <div className="panel sketch">
        {isFaceOff && (
          <div className="names">
            <label className="field">
              <span className="field-label">Player 1</span>
              <input
                className="text-input"
                value={settings.p1}
                maxLength={20}
                placeholder="Player 1"
                onChange={(e) => set('p1')(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Player 2</span>
              <input
                className="text-input"
                value={settings.p2}
                maxLength={20}
                placeholder="Player 2"
                onChange={(e) => set('p2')(e.target.value)}
              />
            </label>
          </div>
        )}

        <div className="settings-grid">
          <Segmented
            label="Time per word"
            value={settings.speed}
            options={[1, 2, 3]}
            format={(v) => `${v}s`}
            onChange={set('speed')}
          />
          <Segmented label="Words" value={settings.count} options={[10, 15, 20]} onChange={set('count')} />
          {isFaceOff ? (
            <Segmented
              label="Writing time"
              value={settings.writeTime}
              options={[30, 60, 90]}
              format={(v) => `${v}s`}
              onChange={set('writeTime')}
            />
          ) : (
            <Toggle
              label="Auto-read"
              hint="The app says each word aloud"
              checked={settings.autoRead}
              onChange={set('autoRead')}
            />
          )}
        </div>

        {needsVoice && !canSpeak && (
          <p className="warning">
            This browser can't read words aloud. Try Chrome, or play Classic Duel with Auto-read off.
          </p>
        )}
      </div>

      <h2 className="section-title">Pick a difficulty to start</h2>
      <div className="difficulty-grid">
        {DIFFICULTIES.map((d) => (
          <button key={d.id} className={`difficulty-card sketch ${d.id}`} onClick={() => onStart(d.id)}>
            <span className="difficulty-label">{d.label}</span>
            <span className="difficulty-blurb">{d.blurb}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
