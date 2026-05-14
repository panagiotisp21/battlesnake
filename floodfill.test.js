import { info, start, end, move, countAvailableSpace } from './index.js';

/**
 * Test suite for Battlesnake logic and Flood Fill algorithm.
 * Default Author: Alexios Kalmpouros, Panagiotis Peppas, Albert Jefferson Abuy, Ydnar Nick Rico
 */

describe('Battlesnake Lifecycle and Move Logic', () => {
  // Requirement 1: Customise the snake's appearance
  test('info should return the correct snake appearance and full team author', () => {
    const response = info();
    expect(response).toBeDefined();
    expect(response.author).toBe(
      'Alexios Kalmpouros, Panagiotis Peppas, Albert Jefferson Abuy, Ydnar Nick Rico',
    );
    expect(response.head).toBe('beluga');
    expect(response.tail).toBe('curled');
  });

  // Requirement 19: Setup test suites
  test('start and end functions should exist and execute without error', () => {
    const mockState = {
      game: { id: 'test' },
      board: { width: 11, height: 11 },
      you: { id: 'me' },
    };
    expect(() => start(mockState)).not.toThrow();
    expect(() => end(mockState)).not.toThrow();
  });

  // Requirement 19: Implement flood fill algorithm using TDD
  describe('Flood Fill Algorithm (countAvailableSpace)', () => {
    test('should return 0 for out of bounds coordinates', () => {
      const board = { width: 11, height: 11, snakes: [] };
      expect(countAvailableSpace(board, { x: -1, y: 0 })).toBe(0);
      expect(countAvailableSpace(board, { x: 11, y: 0 })).toBe(0);
    });

    test('should return 0 if the starting point is occupied by a snake', () => {
      const board = {
        width: 11,
        height: 11,
        snakes: [
          {
            body: [
              { x: 5, y: 5 },
              { x: 5, y: 4 },
            ],
          },
        ],
      };
      expect(countAvailableSpace(board, { x: 5, y: 5 })).toBe(0);
    });

    test('should count all reachable squares in an empty 3x3 area', () => {
      const board = { width: 3, height: 3, snakes: [] };
      // Starting at (1,1), should reach all 9 squares
      expect(countAvailableSpace(board, { x: 1, y: 1 })).toBe(9);
    });
  });

  // Requirement 2, 3, 4: Avoid walls and collisions
  test('move() should return a valid direction and not crash', () => {
    const gameState = {
      game: { id: 'test' },
      turn: 1,
      board: {
        height: 11,
        width: 11,
        food: [{ x: 5, y: 5 }],
        snakes: [
          {
            id: 'me',
            body: [
              { x: 1, y: 1 },
              { x: 1, y: 0 },
            ],
            head: { x: 1, y: 1 },
            length: 2,
          },
        ],
      },
      you: {
        id: 'me',
        body: [
          { x: 1, y: 1 },
          { x: 1, y: 0 },
        ],
        head: { x: 1, y: 1 },
        length: 2,
      },
    };

    const result = move(gameState);
    expect(['up', 'down', 'left', 'right']).toContain(result.move);
  });
});
