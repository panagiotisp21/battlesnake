import runServer from './server.js';

/**
 * Returns Battlesnake appearance
 * Requirement 1: Customize snake appearance
 */
export function info() {
  return {
    apiversion: '1',
    author:
      'Alexios Kalmpouros, Panagiotis Peppas, Albert Jefferson Abuy, Ydnar Nick Rico',
    color: '#45b345ad',
    head: 'beluga',
    tail: 'curled',
  };
}

/**
 * Logic called at the start of each game
 */
export function start(_gameState) {
  console.log('GAME START');
}

/**
 * Logic called at the end of each game
 */
export function end(_gameState) {
  console.log('GAME OVER');
}

/**
 * Helper: find closest food using Manhattan distance
 * Requirement 8: Find and eat closest food
 */
export const getClosestFood = (head, food) => {
  let closest = null;
  let minDistance = Infinity;

  for (const f of food) {
    const distance = Math.abs(head.x - f.x) + Math.abs(head.y - f.y);

    if (distance < minDistance) {
      minDistance = distance;
      closest = f;
    }
  }

  return closest;
};

/**
 * Helper: Flood Fill algorithm to count available space
 * Requirement 19: Implement flood fill algorithm using TDD
 */
export const countAvailableSpace = (board, startPoint) => {
  if (
    startPoint.x < 0 ||
    startPoint.x >= board.width ||
    startPoint.y < 0 ||
    startPoint.y >= board.height
  ) {
    return 0;
  }

  const queue = [startPoint];
  const visited = new Set();
  visited.add(`${startPoint.x},${startPoint.y}`);
  let count = 0;

  while (queue.length > 0) {
    const curr = queue.shift();

    // Requirement 3 & 4: Avoid collisions with all snakes
    const isOccupied = board.snakes.some((s) =>
      s.body.some((p) => p.x === curr.x && p.y === curr.y),
    );

    if (isOccupied) continue;

    count++;

    const neighbors = [
      { x: curr.x, y: curr.y + 1 },
      { x: curr.x, y: curr.y - 1 },
      { x: curr.x - 1, y: curr.y },
      { x: curr.x + 1, y: curr.y },
    ];

    for (const n of neighbors) {
      const key = `${n.x},${n.y}`;
      const inBounds =
        n.x >= 0 && n.x < board.width && n.y >= 0 && n.y < board.height;

      if (inBounds && !visited.has(key)) {
        visited.add(key);
        queue.push(n);
      }
    }
  }
  return count;
};

/**
 * MAIN MOVE LOGIC
 */
export function move(gameState) {
  const isMoveSafe = {
    up: true,
    down: true,
    left: true,
    right: true,
  };

  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];

  // 1. Prevent moving backwards
  if (myNeck.x < myHead.x) isMoveSafe.left = false;
  else if (myNeck.x > myHead.x) isMoveSafe.right = false;
  else if (myNeck.y < myHead.y) isMoveSafe.down = false;
  else if (myNeck.y > myHead.y) isMoveSafe.up = false;

  const board = gameState.board;

  // 2. Wall collision check (Requirement 2)
  if (myHead.x === 0) isMoveSafe.left = false;
  if (myHead.x === board.width - 1) isMoveSafe.right = false;
  if (myHead.y === 0) isMoveSafe.down = false;
  if (myHead.y === board.height - 1) isMoveSafe.up = false;

  // 3. Snake collision check (Requirement 3 & 4)
  for (const snake of board.snakes) {
    for (const part of snake.body) {
      if (part.x === myHead.x && part.y === myHead.y + 1) isMoveSafe.up = false;
      if (part.x === myHead.x && part.y === myHead.y - 1)
        isMoveSafe.down = false;
      if (part.x === myHead.x - 1 && part.y === myHead.y)
        isMoveSafe.left = false;
      if (part.x === myHead.x + 1 && part.y === myHead.y)
        isMoveSafe.right = false;
    }
  }

  const safeMoves = Object.keys(isMoveSafe).filter((key) => isMoveSafe[key]);

  if (safeMoves.length === 0) {
    return { move: 'down' };
  }

  // 4. Use Flood Fill to rank safe moves (Requirement 19)
  const moveChoices = safeMoves.map((m) => {
    const nextHead = { ...myHead };
    if (m === 'up') nextHead.y++;
    if (m === 'down') nextHead.y--;
    if (m === 'left') nextHead.x--;
    if (m === 'right') nextHead.x++;

    return {
      direction: m,
      space: countAvailableSpace(board, nextHead),
    };
  });

  moveChoices.sort((a, b) => b.space - a.space);

  const bestMove = moveChoices[0];
  const food = board.food;
  const closestFood = getClosestFood(myHead, food);

  let finalMove = bestMove.direction;

  // 5. Food Logic (Requirement 8): Only chase if safe
  if (closestFood && bestMove.space > gameState.you.length) {
    if (closestFood.x > myHead.x && isMoveSafe.right) finalMove = 'right';
    else if (closestFood.x < myHead.x && isMoveSafe.left) finalMove = 'left';
    else if (closestFood.y > myHead.y && isMoveSafe.up) finalMove = 'up';
    else if (closestFood.y < myHead.y && isMoveSafe.down) finalMove = 'down';
  }

  return { move: finalMove };
}

/* START SERVER */
// This check prevents Jest from hanging by only running the server in production/dev
if (process.env.NODE_ENV !== 'test') {
  runServer({
    info,
    start,
    move,
    end,
  });
}
