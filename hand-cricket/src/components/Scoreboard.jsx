export default function Scoreboard({ match, names, me }) {
  const inn = match.current;
  if (!inn) {
    return (
      <div className="scoreboard">
        <div className="sb-row">
          <span className="sb-label">{match.phase === 'choice' ? 'Toss done' : 'Toss'}</span>
          <span className="sb-label">Hand Cricket</span>
        </div>
        <div className="sb-main">
          <span className="sb-team">
            {names[0]} <span className="sb-vs">vs</span> {names[1]}
          </span>
        </div>
      </div>
    );
  }

  const label = inn.superOver
    ? `Super Over${inn.pair > 1 ? ` ${inn.pair}` : ''} · ${inn.index % 2 ? '2nd' : '1st'} innings`
    : inn.index === 0
      ? '1st innings'
      : '2nd innings';
  const balls = inn.balls.length;
  const need = inn.target != null ? Math.max(0, inn.target - inn.runs) : null;

  return (
    <div className="scoreboard">
      <div className="sb-row">
        <span className="sb-label">{label}</span>
        <span className="sb-label">
          Balls {balls}
          {Number.isFinite(inn.maxBalls) ? `/${inn.maxBalls}` : ''}
        </span>
      </div>
      <div className="sb-main">
        <span className="sb-team">
          🏏 {names[inn.batter]}
          {inn.batter === me && <span className="sb-you">you</span>}
        </span>
        <span className="sb-score">
          {inn.runs}
          <span className="sb-wkts">/{inn.out ? 1 : 0}</span>
        </span>
      </div>
      <div className="sb-row sb-foot">
        {inn.target != null ? (
          <>
            <span>
              Target <b>{inn.target}</b>
            </span>
            <span>
              {inn.done ? '' : `Need ${need} to win`}
            </span>
          </>
        ) : (
          <>
            <span>⚾ {names[inn.bowler]} bowling</span>
            <span>{inn.superOver ? '6 balls · 1 wicket' : '1 wicket · unlimited balls'}</span>
          </>
        )}
      </div>
    </div>
  );
}
