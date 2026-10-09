/**
 * Hand Cricket rules, derived purely from the server's revealed event log.
 *
 * Event keys (g = game number, bumped by each rematch):
 *   g:tosscall        single, seat 1 calls 'odd' | 'even'
 *   g:toss            pair, both show 0-6; parity of the sum decides the toss
 *   g:choice          single, toss winner picks 'bat' | 'bowl'
 *   g:b:<inn>:<ball>  pair, both show 0-6; equal = OUT, else batter scores their number
 *   g:rematch         single, either player starts the next game
 *
 * Innings 0 and 1 are the main match (1 wicket, unlimited balls). If scores are
 * level, pairs of Super Over innings follow (1 wicket, 6 balls each) until someone
 * wins. The side that batted second in the previous pair bats first in the next.
 */

export const SUPER_OVER_BALLS = 6;

export function deriveMatch(events) {
  const byKey = new Map(events.map((e) => [e.key, e]));

  let game = 0;
  while (byKey.has(`${game}:rematch`)) game++;
  const k = (s) => `${game}:${s}`;

  const call = byKey.get(k('tosscall'));
  if (!call) {
    return { game, phase: 'tosscall', expect: { key: k('tosscall'), mode: 'single', actors: [1] } };
  }

  const toss = byKey.get(k('toss'));
  if (!toss) {
    return { game, phase: 'tossnum', call: call.value, expect: { key: k('toss'), mode: 'pair', actors: [0, 1] } };
  }

  const sum = toss.values[0] + toss.values[1];
  const parity = sum % 2 === 0 ? 'even' : 'odd';
  const tossWinner = call.value === parity ? 1 : 0;
  const tossInfo = { call: call.value, tossValues: toss.values, sum, parity, tossWinner };

  const choice = byKey.get(k('choice'));
  if (!choice) {
    return { game, phase: 'choice', ...tossInfo, expect: { key: k('choice'), mode: 'single', actors: [tossWinner] } };
  }

  const firstBat = choice.value === 'bat' ? tossWinner : 1 - tossWinner;
  const base = { game, ...tossInfo, choice: choice.value, firstBat };
  const innings = [];

  for (let i = 0; ; i++) {
    const pair = Math.floor(i / 2);
    const chasing = i % 2 === 1;
    const opensPair = pair % 2 === 0 ? firstBat : 1 - firstBat;
    const batter = chasing ? 1 - opensPair : opensPair;
    const maxBalls = pair === 0 ? Infinity : SUPER_OVER_BALLS;
    const target = chasing ? innings[i - 1].runs + 1 : null;

    const inn = { index: i, pair, superOver: pair > 0, batter, bowler: 1 - batter, runs: 0, balls: [], out: false, target, maxBalls, done: false };

    for (let n = 1; ; n++) {
      const e = byKey.get(k(`b:${i}:${n}`));
      if (!e) break;
      const bat = e.values[batter];
      const bowl = e.values[1 - batter];
      const out = bat === bowl;
      inn.balls.push({ n, bat, bowl, out, runs: out ? 0 : bat, values: e.values });
      if (out) {
        inn.out = true;
        inn.done = true;
        break;
      }
      inn.runs += bat;
      if (target != null && inn.runs >= target) {
        inn.done = true;
        break;
      }
      if (inn.balls.length >= maxBalls) {
        inn.done = true;
        break;
      }
    }

    innings.push(inn);

    if (!inn.done) {
      return {
        ...base,
        phase: 'play',
        innings,
        current: inn,
        expect: { key: k(`b:${i}:${inn.balls.length + 1}`), mode: 'pair', actors: [0, 1] },
      };
    }

    if (chasing) {
      const first = innings[i - 1];
      if (first.runs !== inn.runs) {
        const chased = inn.runs > first.runs;
        return {
          ...base,
          phase: 'over',
          innings,
          current: inn,
          winner: chased ? inn.batter : first.batter,
          wonBy: chased ? 'chase' : 'defend',
          margin: chased ? null : first.runs - inn.runs,
          expect: { key: k('rematch'), mode: 'single', actors: [0, 1] },
        };
      }
    }
  }
}

/** Every revealed ball across all innings of the current game, in order. */
export function allBalls(match) {
  return (match.innings ?? []).flatMap((inn) => inn.balls.map((b) => ({ ...b, innings: inn.index, batter: inn.batter })));
}

export function randomChoice(values) {
  return values[Math.floor(Math.random() * values.length)];
}
