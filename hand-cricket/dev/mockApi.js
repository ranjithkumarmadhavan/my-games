// In-memory stand-in for public/api/index.php so the game runs with `npm run dev`
// (no PHP or MySQL needed locally). Keep behaviour in sync with the PHP file.
import { randomBytes, randomInt } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const ONLINE_WINDOW = 8;
const WORDS = ['odd', 'even', 'bat', 'bowl', 'rematch'];
const rooms = new Map();

const now = () => Math.floor(Date.now() / 1000);
const cleanName = (n) => String(n ?? '').replace(/\s+/g, ' ').trim().slice(0, 20) || 'Player';
const validValue = (v) => (Number.isInteger(v) && v >= 0 && v <= 6) || WORDS.includes(v);

function view(room, seat) {
  const pending = {};
  const mine = {};
  for (const [key, p] of Object.entries(room.pending)) {
    pending[key] = ['s0' in p, 's1' in p];
    if (`s${seat}` in p) mine[key] = p[`s${seat}`];
  }
  return {
    code: room.code,
    seat,
    players: room.players.map((p) => ({ name: p.name, online: now() - p.seen < ONLINE_WINDOW })),
    events: room.events,
    pending,
    mine,
  };
}

function handle(body) {
  const action = String(body.action ?? '');
  const code = String(body.code ?? '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  if (action === 'create') {
    let c;
    do {
      c = Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
    } while (rooms.has(c));
    const token = randomBytes(16).toString('hex');
    const room = { code: c, players: [{ name: cleanName(body.name), token, seen: now() }], events: [], pending: {} };
    rooms.set(c, room);
    return [200, { token, ...view(room, 0) }];
  }

  if (!['join', 'state', 'act'].includes(action)) return [400, { error: 'Unknown action' }];
  const room = rooms.get(code);
  if (!room) return [404, { error: 'Room not found' }];

  if (action === 'join') {
    if (room.players.length >= 2) return [409, { error: 'Room is full' }];
    const token = randomBytes(16).toString('hex');
    room.players.push({ name: cleanName(body.name), token, seen: now() });
    return [200, { token, ...view(room, 1) }];
  }

  const seat = room.players.findIndex((p) => p.token === body.token);
  if (seat < 0) return [403, { error: 'Not a player in this room' }];
  room.players[seat].seen = now();

  if (action === 'act') {
    const { key, value, mode } = body;
    if (!/^[a-z0-9:]{1,40}$/.test(String(key)) || !validValue(value) || !['single', 'pair'].includes(mode)) {
      return [400, { error: 'Invalid move' }];
    }
    if (!room.events.some((e) => e.key === key)) {
      if (mode === 'single') {
        room.events.push({ key, seat, value });
      } else {
        const p = (room.pending[key] ??= {});
        if (!(`s${seat}` in p)) p[`s${seat}`] = value;
        if ('s0' in p && 's1' in p) {
          room.events.push({ key, values: [p.s0, p.s1] });
          delete room.pending[key];
        }
      }
    }
  }

  return [200, view(room, seat)];
}

export default function mockApi() {
  return {
    name: 'hand-cricket-mock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/hand-cricket/api/index.php', (req, res) => {
        let raw = '';
        req.on('data', (chunk) => (raw += chunk));
        req.on('end', () => {
          let status;
          let data;
          try {
            [status, data] = req.method === 'POST' ? handle(JSON.parse(raw || '{}')) : [405, { error: 'Method not allowed' }];
          } catch {
            [status, data] = [400, { error: 'Bad request' }];
          }
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        });
      });
    },
  };
}
