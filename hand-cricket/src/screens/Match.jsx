import { useEffect, useMemo, useRef, useState } from 'react';
import Hand from '../components/Hand';
import Scoreboard from '../components/Scoreboard';
import { allBalls, deriveMatch, randomChoice } from '../lib/game';
import { sfx } from '../lib/sound';

const PICK_SECONDS = 20;
const NUMBERS = [0, 1, 2, 3, 4, 5, 6];

function randomFor(phase) {
  if (phase === 'tosscall') return randomChoice(['odd', 'even']);
  if (phase === 'choice') return randomChoice(['bat', 'bowl']);
  return randomChoice(NUMBERS);
}

function ballText(ball) {
  if (ball.out) return 'OUT!';
  if (ball.runs === 6) return 'SIX!';
  if (ball.runs === 4) return 'FOUR!';
  if (ball.runs === 0) return 'Dot ball';
  return `${ball.runs} run${ball.runs > 1 ? 's' : ''}`;
}

function GestureGrid({ onPick, disabled }) {
  return (
    <div className="gesture-grid">
      {NUMBERS.map((n) => (
        <button key={n} className="gesture" onClick={() => onPick(n)} disabled={disabled} aria-label={`Show ${n}`}>
          <Hand value={n} size={34} />
          <span>{n}</span>
        </button>
      ))}
    </div>
  );
}

export default function Match({ view, onAct, onLeave }) {
  const match = useMemo(() => deriveMatch(view.events), [view.events]);
  const me = view.seat;
  const opp = 1 - me;
  const names = [view.players[0]?.name ?? 'Player 1', view.players[1]?.name ?? 'Player 2'];
  const oppOnline = view.players[opp]?.online ?? false;
  const { expect, phase } = match;

  const [sending, setSending] = useState(null);
  const isActor = expect.actors.includes(me);
  const myPick = expect.mode === 'pair' ? view.mine?.[expect.key] : undefined;
  const oppPicked = expect.mode === 'pair' && Boolean(view.pending?.[expect.key]?.[opp]);
  const waitingOnMe = phase !== 'over' && isActor && myPick === undefined && sending !== expect.key;

  const submit = async (value) => {
    if (!waitingOnMe) return;
    setSending(expect.key);
    sfx.pick();
    try {
      await onAct(expect, value);
    } finally {
      setSending(null);
    }
  };

  // 20-second pick clock; a random pick is made when it runs out.
  const [left, setLeft] = useState(PICK_SECONDS);
  const submitRef = useRef(submit);
  submitRef.current = submit;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  useEffect(() => {
    if (!waitingOnMe) return;
    const end = Date.now() + PICK_SECONDS * 1000;
    let last = PICK_SECONDS;
    setLeft(PICK_SECONDS);
    const id = setInterval(() => {
      const l = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      if (l === last) return;
      last = l;
      setLeft(l);
      if (l === 0) {
        clearInterval(id);
        submitRef.current(randomFor(phaseRef.current));
      } else if (l <= 5) {
        sfx.tick();
      }
    }, 200);
    return () => clearInterval(id);
  }, [waitingOnMe, expect.key]);

  // Ball-by-ball reveal animation (skipped for balls that happened before we loaded).
  const balls = allBalls(match);
  const lastBall = balls[balls.length - 1];
  const lastKey = lastBall ? `${match.game}:${lastBall.innings}:${lastBall.n}` : null;
  const seenBall = useRef(lastKey);
  const [reveal, setReveal] = useState(null);
  useEffect(() => {
    if (!lastKey || lastKey === seenBall.current) return;
    seenBall.current = lastKey;
    setReveal(lastBall);
    if (lastBall.out) sfx.out();
    else if (lastBall.runs >= 4) sfx.boundary();
    else sfx.bat();
    const t = setTimeout(() => setReveal(null), 1900);
    return () => clearTimeout(t);
  }, [lastKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Innings break / Super Over banner.
  const innIdx = match.current?.index ?? -1;
  const seenInn = useRef(innIdx);
  const [banner, setBanner] = useState(null);
  useEffect(() => {
    if (innIdx === seenInn.current) return;
    seenInn.current = innIdx;
    if (innIdx <= 0 || !match.current || phase === 'over') return;
    const inn = match.current;
    const next =
      inn.superOver && inn.index % 2 === 0
        ? { title: 'Super Over!', text: `Scores are level! ${names[inn.batter]} bats first · 6 balls, 1 wicket` }
        : { title: inn.superOver ? 'Super Over chase' : 'Innings break', text: `${names[inn.batter]} needs ${inn.target} to win` };
    const show = setTimeout(() => {
      setBanner(next);
      sfx.whistle();
    }, 1500);
    const hide = setTimeout(() => setBanner(null), 4800);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [innIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Result sound, once per game.
  const seenOver = useRef(phase === 'over' ? match.game : -1);
  useEffect(() => {
    if (phase !== 'over' || seenOver.current === match.game) return;
    seenOver.current = match.game;
    const t = setTimeout(() => (match.winner === me ? sfx.win() : sfx.lose()), 1200);
    return () => clearTimeout(t);
  }, [phase, match.game, match.winner, me]);

  // What the two hands on the field show.
  let myHand;
  let oppHand;
  if (reveal) {
    myHand = reveal.values[me];
    oppHand = reveal.values[opp];
  } else if (phase === 'choice') {
    myHand = match.tossValues[me];
    oppHand = match.tossValues[opp];
  } else if (phase === 'over' && lastBall) {
    myHand = lastBall.values[me];
    oppHand = lastBall.values[opp];
  } else {
    myHand = myPick;
    oppHand = null;
  }

  const inPlay = phase === 'play';
  const batting = inPlay && match.current.batter === me;
  const roleOf = (seat) => (inPlay || phase === 'over') && match.current ? (match.current.batter === seat ? 'Batting' : 'Bowling') : '';

  const leave = () => {
    if (phase === 'over' || window.confirm('Leave this match? Your opponent will be left waiting.')) onLeave();
  };

  return (
    <section className="screen match">
      <Scoreboard match={match} names={names} me={me} />

      {!oppOnline && phase !== 'over' && (
        <p className="notice warn">⚠️ {names[opp]} seems to be offline. The game carries on when they're back.</p>
      )}

      <div className={`field ${reveal?.out ? 'is-out' : ''}`}>
        <div className="pitch" aria-hidden />
        <div className="player-side">
          <span className="player-name">
            You{roleOf(me) && <em>{roleOf(me)}</em>}
          </span>
          <div className={`hand-bubble ${reveal ? 'revealed' : ''}`}>
            <Hand value={myHand} size={86} />
          </div>
          <span className="pick-status">{myHand != null && !reveal && expect.mode === 'pair' && phase !== 'over' ? `Locked in: ${myHand}` : ' '}</span>
        </div>

        <div className="field-center" aria-live="polite">
          {reveal ? (
            <span key={lastKey} className={`ball-result ${reveal.out ? 'out' : reveal.runs >= 4 ? 'boundary' : ''}`}>
              {ballText(reveal)}
            </span>
          ) : (
            <span className="vs">VS</span>
          )}
        </div>

        <div className="player-side">
          <span className="player-name">
            {names[opp]}
            {roleOf(opp) && <em>{roleOf(opp)}</em>}
          </span>
          <div className={`hand-bubble ${reveal ? 'revealed' : ''}`}>
            <Hand value={oppHand} size={86} mirrored />
          </div>
          <span className="pick-status">
            {expect.mode === 'pair' && phase !== 'over' && !reveal ? (oppPicked ? '✓ Picked' : 'Thinking…') : ' '}
          </span>
        </div>

        {banner && (
          <div className="banner" role="status">
            <strong>{banner.title}</strong>
            <span>{banner.text}</span>
          </div>
        )}
      </div>

      {match.current && match.current.balls.length > 0 && (
        <ol className="ball-log" aria-label="This innings">
          {match.current.balls.slice(-18).map((b) => (
            <li key={b.n} className={b.out ? 'w' : b.runs >= 4 ? 'b' : ''}>
              {b.out ? 'W' : b.runs}
            </li>
          ))}
        </ol>
      )}

      <div className="action-panel">
        {phase === 'tosscall' &&
          (me === 1 ? (
            <>
              <p className="prompt">You call the toss!</p>
              <div className="choice-row">
                <button className="btn big primary" onClick={() => submit('odd')} disabled={!waitingOnMe}>
                  Odd
                </button>
                <button className="btn big primary" onClick={() => submit('even')} disabled={!waitingOnMe}>
                  Even
                </button>
              </div>
            </>
          ) : (
            <p className="prompt muted">Waiting for {names[1]} to call odd or even…</p>
          ))}

        {phase === 'tossnum' && (
          <>
            <p className="prompt">
              {me === 1 ? 'You' : names[1]} called <b>{match.call.toUpperCase()}</b>. Show a number!
            </p>
            {myPick === undefined ? (
              <GestureGrid onPick={submit} disabled={!waitingOnMe} />
            ) : (
              <p className="prompt muted">Waiting for {names[opp]}…</p>
            )}
          </>
        )}

        {phase === 'choice' && (
          <>
            <p className="prompt">
              {match.tossValues[0]} + {match.tossValues[1]} = {match.sum}, that's <b>{match.parity.toUpperCase()}</b>.{' '}
              {match.tossWinner === me ? 'You won the toss!' : `${names[opp]} won the toss.`}
            </p>
            {match.tossWinner === me ? (
              <div className="choice-row">
                <button className="btn big primary" onClick={() => submit('bat')} disabled={!waitingOnMe}>
                  🏏 Bat first
                </button>
                <button className="btn big primary" onClick={() => submit('bowl')} disabled={!waitingOnMe}>
                  ⚾ Bowl first
                </button>
              </div>
            ) : (
              <p className="prompt muted">Waiting for {names[opp]} to choose bat or bowl…</p>
            )}
          </>
        )}

        {inPlay && (
          <>
            <p className="prompt">{batting ? '🏏 Pick your shot' : '⚾ Match their number to get them out'}</p>
            {myPick === undefined ? (
              <GestureGrid onPick={submit} disabled={!waitingOnMe} />
            ) : (
              <p className="prompt muted">Waiting for {names[opp]}…</p>
            )}
          </>
        )}

        {phase === 'over' && (
          <div className="result">
            <p className="result-title">{match.winner === me ? 'You win! 🏆' : `${names[match.winner]} wins!`}</p>
            <p className="result-sub">
              {match.wonBy === 'chase'
                ? `Chased down the target of ${match.current.target}`
                : `Won by ${match.margin} run${match.margin > 1 ? 's' : ''}`}
              {match.current.superOver ? ' in the Super Over' : ''}
            </p>
            <ul className="innings-summary">
              {match.innings.map((inn) => (
                <li key={inn.index}>
                  <span>
                    {inn.superOver ? 'Super Over · ' : ''}
                    {names[inn.batter]}
                  </span>
                  <b>
                    {inn.runs}/{inn.out ? 1 : 0}
                  </b>
                  <small>
                    {inn.balls.length} ball{inn.balls.length === 1 ? '' : 's'}
                  </small>
                </li>
              ))}
            </ul>
            <button className="btn big primary" onClick={() => onAct(expect, 'rematch')}>
              ↻ Rematch
            </button>
          </div>
        )}

        {waitingOnMe && (
          <div className={`timer ${left <= 5 ? 'urgent' : ''}`} aria-label={`${left} seconds left`}>
            <span style={{ width: `${(left / PICK_SECONDS) * 100}%` }} />
            <em>{left}s</em>
          </div>
        )}
      </div>

      <button className="text-btn" onClick={leave}>
        Leave room {view.code}
      </button>
    </section>
  );
}
