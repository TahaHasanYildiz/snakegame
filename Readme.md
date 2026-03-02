# Snake Game

A lightweight browser Snake game built with plain JavaScript, HTML, and CSS.

## Features

- 20x20 grid with edge wrapping
- Keyboard controls (`Arrow Keys` or `WASD`)
- Pause/resume (`Space`) and restart (`R`)
- On-screen touch controls for smaller screens
- Score tracking and game-over state
- Tested core game logic using Node's built-in test runner

## Getting Started

### Requirements

- Node.js 18+ (for running tests)
- Python 3 (for local dev server script)

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Then open `http://localhost:5173`.

## Controls

- Move: `Arrow Keys` or `W`, `A`, `S`, `D`
- Pause/Resume: `Space`
- Restart: `R`

## Scripts

- `npm run dev`: starts a static server on port `5173`
- `npm test`: runs unit tests in `tests/snake.test.js`

## Project Structure

```text
.
├── index.html        # App markup
├── styles.css        # UI and game board styling
├── src/
│   ├── main.js       # DOM rendering and input handling
│   └── snake.js      # Pure game logic (state, movement, collisions, food)
└── tests/
    └── snake.test.js # Unit tests for core logic
```
