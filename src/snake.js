export const GRID_SIZE = 20;
export const START_LENGTH = 3;

const INITIAL_DIRECTION = 'RIGHT';

const DIRECTION_VECTORS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const OPPOSITES = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

export function createRng(seed = Date.now()) {
  let value = seed >>> 0;
  return function rng() {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function createInitialSnake() {
  const center = Math.floor(GRID_SIZE / 2);
  return Array.from({ length: START_LENGTH }, (_, index) => ({
    x: center - index,
    y: center,
  }));
}

function wrapPosition(position) {
  return {
    x: (position.x + GRID_SIZE) % GRID_SIZE,
    y: (position.y + GRID_SIZE) % GRID_SIZE,
  };
}

function positionEquals(a, b) {
  return a.x === b.x && a.y === b.y;
}

function isOnSnake(position, snake) {
  return snake.some((segment) => positionEquals(position, segment));
}

export function getAvailableCells(snake) {
  const cells = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const candidate = { x, y };
      if (!isOnSnake(candidate, snake)) {
        cells.push(candidate);
      }
    }
  }
  return cells;
}

export function spawnFood(snake, rng = Math.random) {
  const available = getAvailableCells(snake);
  if (available.length === 0) {
    return null;
  }
  const index = Math.floor(rng() * available.length);
  return available[Math.min(index, available.length - 1)];
}

export function createInitialState(rng = Math.random) {
  const snake = createInitialSnake();
  return {
    snake,
    direction: INITIAL_DIRECTION,
    pendingDirection: INITIAL_DIRECTION,
    food: spawnFood(snake, rng),
    score: 0,
    gameOver: false,
    paused: false,
  };
}

export function setDirection(state, direction) {
  if (!DIRECTION_VECTORS[direction]) {
    return state;
  }
  if (OPPOSITES[state.direction] === direction) {
    return state;
  }
  return {
    ...state,
    pendingDirection: direction,
  };
}

export function togglePause(state) {
  if (state.gameOver) {
    return state;
  }
  return {
    ...state,
    paused: !state.paused,
  };
}

export function step(state, rng = Math.random) {
  if (state.gameOver || state.paused) {
    return state;
  }

  const direction = state.pendingDirection;
  const vector = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const nextHead = wrapPosition({ x: head.x + vector.x, y: head.y + vector.y });
  const ateFood = state.food && positionEquals(nextHead, state.food);
  const collisionBody = ateFood ? state.snake : state.snake.slice(0, -1);

  if (isOnSnake(nextHead, collisionBody)) {
    return {
      ...state,
      direction,
      gameOver: true,
      paused: false,
    };
  }

  const nextSnake = [nextHead, ...state.snake];

  if (!ateFood) {
    nextSnake.pop();
  }

  const nextFood = ateFood ? spawnFood(nextSnake, rng) : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction,
    food: nextFood,
    score: ateFood ? state.score + 1 : state.score,
    gameOver: false,
  };
}
