# My Games

A collection of small browser games, served at **games.ranjithkumarmadhavan.com**.

| Folder | What it is | Served at |
|---|---|---|
| `landing/` | Home page with game categories (Single Player, Multiplayer, In-Person Multiplayer) | `/` |
| `blink-and-draw/` | Blink & Draw: an in-person doodle-and-memory game | `/blink-and-draw/` |

Each folder is its own React + Vite app, managed as an npm workspace.

## Development

```bash
npm install
npm run dev       # landing on http://localhost:5173, Blink & Draw on http://localhost:5174/blink-and-draw/
npm run build     # builds everything into dist/ (landing at the root, each game in its own subfolder)
npm run preview   # serves dist/ on http://localhost:4173 to check the combined site
```

## Adding a game

1. Create a new folder with its own Vite app, set `base: '/<folder>/'`, a unique dev port, and `build.outDir: '../dist/<folder>'`.
2. Add the folder to `workspaces` and to the `build` script in the root `package.json`.
3. Register it in `landing/src/games.js` under the right category.
