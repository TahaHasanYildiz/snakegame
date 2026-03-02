import {
  GRID_SIZE,
  createInitialState,
  createRng,
  setDirection,
  step,
  togglePause,
} from './snake.js';

const TICK_MS = 120;
const CELL_SIZE = 18;
const DIRECTION_ANGLES = {
  UP: '-90deg',
  DOWN: '90deg',
  LEFT: '180deg',
  RIGHT: '0deg',
};

const directionFromInput = {
  ArrowUp: 'UP',
  w: 'UP',
  W: 'UP',
  ArrowDown: 'DOWN',
  s: 'DOWN',
  S: 'DOWN',
  ArrowLeft: 'LEFT',
  a: 'LEFT',
  A: 'LEFT',
  ArrowRight: 'RIGHT',
  d: 'RIGHT',
  D: 'RIGHT',
};

const board = document.querySelector('[data-board]');
const playerValue = document.querySelector('[data-player]');
const scoreValue = document.querySelector('[data-score]');
const statusText = document.querySelector('[data-status]');
const restartButton = document.querySelector('[data-restart]');
const pauseButton = document.querySelector('[data-pause]');
const leaderboardElement = document.querySelector('[data-leaderboard]');

const rng = createRng();
const LEADERBOARD_KEY = 'snake_leaderboard_v1';
let leaderboard = loadLeaderboard();
const playerName = promptForPlayerName();
let state = createInitialState(rng);
let scoreSubmitted = false;

board.style.setProperty('--grid-size', GRID_SIZE);
board.style.setProperty('--cell-size', `${CELL_SIZE}px`);
renderLeaderboard();

function promptForPlayerName() {
  const name = window.prompt('Enter your username for the leaderboard:');
  const trimmed = (name ?? '').trim().replace(/\s+/g, ' ');
  return (trimmed || 'Guest').slice(0, 20);
}

function loadLeaderboard() {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((entry) => entry && typeof entry.player === 'string' && Number.isFinite(entry.score))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch {
    return [];
  }
}

function saveLeaderboard() {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

function renderLeaderboard() {
  leaderboardElement.replaceChildren();
  if (leaderboard.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No scores yet';
    leaderboardElement.appendChild(emptyItem);
    return;
  }

  leaderboard.forEach((entry) => {
    const item = document.createElement('li');
    item.textContent = `${entry.player} - ${entry.score}`;
    leaderboardElement.appendChild(item);
  });
}

function submitScoreIfNeeded() {
  if (scoreSubmitted || state.score <= 0) {
    return;
  }
  leaderboard = [...leaderboard, { player: playerName, score: state.score }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  saveLeaderboard();
  renderLeaderboard();
  scoreSubmitted = true;
}

function renderBoard() {
  board.replaceChildren();

  if (state.food) {
    const food = document.createElement('div');
    food.className = 'cell food';
    food.style.gridColumn = state.food.x + 1;
    food.style.gridRow = state.food.y + 1;
    board.appendChild(food);
  }

  state.snake.forEach((segment, index) => {
    const cell = document.createElement('div');
    cell.className = index === 0 ? 'cell head' : 'cell snake';
    cell.style.gridColumn = segment.x + 1;
    cell.style.gridRow = segment.y + 1;
    if (index === 0) {
      cell.style.setProperty('--heading', DIRECTION_ANGLES[state.direction]);
    }
    board.appendChild(cell);
  });
}

function renderHud() {
  playerValue.textContent = playerName;
  scoreValue.textContent = String(state.score);

  if (state.gameOver) {
    statusText.textContent = 'Game over';
  } else if (state.paused) {
    statusText.textContent = 'Paused';
  } else {
    statusText.textContent = 'Running';
  }

  pauseButton.textContent = state.paused ? 'Resume' : 'Pause';
}

function render() {
  renderBoard();
  renderHud();
}

function restart() {
  submitScoreIfNeeded();
  state = createInitialState(rng);
  scoreSubmitted = false;
  render();
}

function handleDirection(direction) {
  state = setDirection(state, direction);
}

function handleKeydown(event) {
  if (event.key === ' ') {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  if (event.key === 'r' || event.key === 'R') {
    restart();
    return;
  }

  const direction = directionFromInput[event.key];
  if (direction) {
    event.preventDefault();
    handleDirection(direction);
  }
}

function tick() {
  state = step(state, rng);
  if (state.gameOver) {
    submitScoreIfNeeded();
  }
  render();
}

document.addEventListener('keydown', handleKeydown);

restartButton.addEventListener('click', restart);
pauseButton.addEventListener('click', () => {
  state = togglePause(state);
  render();
});

document.querySelectorAll('[data-dir]').forEach((button) => {
  button.addEventListener('click', () => {
    handleDirection(button.dataset.dir);
  });
});

render();
setInterval(tick, TICK_MS);
