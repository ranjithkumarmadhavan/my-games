export function Segmented({ label, value, options, onChange, format = (v) => v }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="segmented" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            className={value === opt ? 'active' : ''}
            onClick={() => onChange(opt)}
          >
            {format(opt)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="field toggle-field">
      <span>
        <span className="field-label">{label}</span>
        {hint && <span className="field-hint">{hint}</span>}
      </span>
      <input
        type="checkbox"
        className="toggle"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
