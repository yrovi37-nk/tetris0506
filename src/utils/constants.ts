export const COLS = 10;
export const ROWS = 20;

export const SHAPES = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // T
  [
    [1, 0, 0],
    [1, 1, 1],
  ], // J
  [
    [0, 0, 1],
    [1, 1, 1],
  ], // L
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // S
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // Z
];

export const COLORS = [
  '#00FFFF', // Cyan
  '#FFFF00', // Yellow
  '#800080', // Purple
  '#0000FF', // Blue
  '#FFA500', // Orange
  '#00FF00', // Green
  '#FF0000', // Red
];

// Speed in milliseconds for each level
export const LEVEL_SPEEDS = [
  500, // Level 1
  400, // Level 2
  300, // Level 3
  200, // Level 4
  100, // Level 5
];
