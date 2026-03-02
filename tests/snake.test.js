import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GRID_SIZE,
  createInitialState,
  setDirection,
  spawnFood,
  step,
} from '../src/snake.js';

function fixedRng(value = 0) {
  return () => value;
}

test('snake moves one cell on step', () => {
  const state = createInitialState(fixedRng(0));
  const next = step(state, fixedRng(0));

  assert.equal(next.snake[0].x, state.snake[0].x + 1);
  assert.equal(next.snake[0].y, state.snake[0].y);
  assert.equal(next.snake.length, state.snake.length);
});

test('snake grows and score increments when food is eaten', () => {
  const state = createInitialState(fixedRng(0));
  const foodAhead = { x: state.snake[0].x + 1, y: state.snake[0].y };

  const next = step({ ...state, food: foodAhead }, fixedRng(0));

  assert.equal(next.score, state.score + 1);
  assert.equal(next.snake.length, state.snake.length + 1);
  assert.notDeepEqual(next.food, foodAhead);
});

test('reversing direction in a single tick is ignored', () => {
  const state = createInitialState(fixedRng(0));
  const turned = setDirection(state, 'LEFT');

  assert.equal(turned.pendingDirection, 'RIGHT');
});

test('crossing boundary wraps snake to opposite side', () => {
  const state = {
    snake: [{ x: GRID_SIZE - 1, y: 0 }],
    direction: 'RIGHT',
    pendingDirection: 'RIGHT',
    food: { x: 5, y: 5 },
    score: 0,
    gameOver: false,
    paused: false,
  };

  const next = step(state, fixedRng(0));

  assert.equal(next.gameOver, false);
  assert.deepEqual(next.snake[0], { x: 0, y: 0 });
});

test('moving into previous tail position is allowed when not eating', () => {
  const state = {
    snake: [
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 2, y: 2 },
    ],
    direction: 'UP',
    pendingDirection: 'LEFT',
    food: { x: 10, y: 10 },
    score: 0,
    gameOver: false,
    paused: false,
  };

  const next = step(state, fixedRng(0));

  assert.equal(next.gameOver, false);
  assert.deepEqual(next.snake[0], { x: 2, y: 2 });
});

test('food spawns on free cell only', () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ];

  const food = spawnFood(snake, fixedRng(0));

  assert.ok(food);
  assert.equal(snake.some((segment) => segment.x === food.x && segment.y === food.y), false);
});
