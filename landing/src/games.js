// Register new games here. `path` is where the game is served on the site.
// In dev each game runs on its own Vite server, so `devUrl` points there.

export const CATEGORIES = [
  {
    id: 'single',
    label: 'Single Player',
    emoji: '🕹️',
    blurb: 'Just you against the game.',
  },
  {
    id: 'multi',
    label: 'Multiplayer',
    emoji: '🌐',
    blurb: 'Play with friends online, wherever they are.',
  },
  {
    id: 'in-person',
    label: 'In-Person Multiplayer',
    emoji: '🧑‍🤝‍🧑',
    blurb: 'Same room, one screen, lots of laughs.',
  },
];

export const GAMES = [
  {
    id: 'blink-and-draw',
    title: 'Blink & Draw',
    category: 'in-person',
    tagline: 'Hear a word, doodle it in a second, then remember what every doodle was.',
    players: '2 players',
    extras: 'Pen & paper',
    icon: '/blink-and-draw/favicon.svg',
    path: '/blink-and-draw/',
    devUrl: 'http://localhost:5174/blink-and-draw/',
  },
];

export const gameUrl = (game) => (import.meta.env.DEV ? game.devUrl : game.path);
