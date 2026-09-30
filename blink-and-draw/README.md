# Blink & Draw

A fast-paced doodle-and-memory party game for two, played with pen and paper next to a phone or laptop.

- **Classic Duel**: one player reads the words (or lets the app read them), the other doodles each one in a numbered box. Then the app quizzes the Artist: "What was #8?"
- **Face-Off**: the app reads the words aloud while both players draw at the same time, then gives a timed round to write the answers and crowns a winner.

Three difficulty levels (250+ words each), words don't repeat on a device until the list is exhausted, adjustable speed / word count / writing time, sound effects with mute, and light/dark themes.

## Development

```bash
npm install
npm run dev      # http://localhost:5174/blink-and-draw/
npm run build    # output goes to ../dist/blink-and-draw/
```

Word lists live in `src/data/{easy,medium,hard}.json`.
