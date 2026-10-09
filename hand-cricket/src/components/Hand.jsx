// A cartoon hand showing 0-6: 0 = fist, 1-4 = fingers up, 5 = open palm, 6 = thumbs up.
const FINGERS = [
  { x: 26, h: 44 }, // index
  { x: 40, h: 50 }, // middle
  { x: 54, h: 46 }, // ring
  { x: 68, h: 36 }, // pinky
];

export default function Hand({ value, mirrored = false, size = 64, className = '' }) {
  const isNum = Number.isInteger(value);
  const up = (i) => isNum && value >= i + 1 && value <= 5;
  const thumbOut = value === 5;
  const thumbsUp = value === 6;

  return (
    <svg
      className={`hand ${className}`}
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      role="img"
      aria-label={isNum ? `${value}` : 'hidden'}
      style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
    >
      <g className="hand-shape">
        {FINGERS.map((f, i) =>
          up(i) ? (
            <rect key={i} x={f.x - 6} y={60 - f.h} width="12" height={f.h + 8} rx="6" />
          ) : (
            <rect key={i} x={f.x - 6.5} y="50" width="13" height="18" rx="6.5" />
          ),
        )}
        <rect x="18" y="56" width="62" height="50" rx="18" />
        {thumbsUp ? (
          <rect x="10" y="14" width="15" height="52" rx="7.5" />
        ) : thumbOut ? (
          <rect x="4" y="52" width="14" height="36" rx="7" transform="rotate(-38 11 70)" />
        ) : (
          <rect x="12" y="66" width="34" height="13" rx="6.5" transform="rotate(-12 29 72)" />
        )}
      </g>
      {!isNum && (
        <text x="50" y="92" textAnchor="middle" className="hand-q">
          ?
        </text>
      )}
    </svg>
  );
}
