import runServer from './server.js';

/**
 * Returns Battlesnake appearance
 */
function info() {
  console.log('INFO');

  return {
    apiversion: '1',
    author: 'panagiotis',
    color: '#45b345ad',
    head: 'beluga',
    tail: 'curled',
  };
}

function start(_gameState) {
  console.log('GAME START');
}

function end(_gameState) {
  console.log('GAME OVER');
}

/**
 * Helper: find closest food using Manhattan distance
 */
const getClosestFood = (head, food) => {
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

/*
*Other helper functions
*getDirection and getTurns are to check the relative position of the snake's head to the direction it faces.
*
*/
const getDirection = (head, neck) => {
  if (neck.x < head.x) return 'right';
  if (neck.x > head.x) return 'left';
  if (neck.y < head.y) return 'up';
  return 'down';
};

const getTurns = (direction) => {
  switch (direction) {
    case 'up':
      return { ahead: 'up', left: 'left', right: 'right' };
    case 'down':
      return { ahead: 'down', left: 'right', right: 'left' };
    case 'left':
      return { ahead: 'left', left: 'down', right: 'up' };
    case 'right':
    default:
      return { ahead: 'right', left: 'up', right: 'down' };
  }
};

/*
*getObstacleMap shows what squares are safe or unsafe in the three directions.
*/ 
const getObstacleMap = (board) => {
  const grid = Array.from({ length: board.height }, () =>
    Array.from({ length: board.width }, () => false)
  );

  for (const snake of board.snakes) {
    for (const part of snake.body) {
      if (
        part.x >= 0 &&
        part.x < board.width &&
        part.y >= 0 &&
        part.y < board.height
      ) {
        grid[part.y][part.x] = true;
      }
    }
  }

  return grid;
};

/*
*getOpenSpace counts how many open squares are reachable from the given position.
*/ 
const getOpenSpace = (start, board, obstacleMap) => {
  const width = board.width;
  const height = board.height;
  const visited = new Set();
  const queue = [start];
  let count = 0;

  const key = (x, y) => `${x},${y}`;

  while (queue.length > 0) {
    const { x, y } = queue.shift();

    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    const hash = key(x, y);
    if (visited.has(hash)) continue;
    if (obstacleMap[y][x]) continue;

    visited.add(hash);
    count += 1;

    queue.push({ x: x + 1, y });
    queue.push({ x: x - 1, y });
    queue.push({ x, y: y + 1 });
    queue.push({ x, y: y - 1 });
  }

  return count;
};

/* MAIN MOVE LOGIC */
function move(gameState) {
  // 1. all moves allowed
  const isMoveSafe = {
    up: true,
    down: true,
    left: true,
    right: true,
  };

  // prevents battlesnake from moving backwards
  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];

  // 2. Prevent moving backwards (neck collision)
  if (myNeck.x < myHead.x) isMoveSafe.left = false;
  else if (myNeck.x > myHead.x) isMoveSafe.right = false;
  else if (myNeck.y < myHead.y) isMoveSafe.down = false;
  else if (myNeck.y > myHead.y) isMoveSafe.up = false;

  const board = gameState.board;
  const boardWidth = board.width;
  const boardHeight = board.height;

  // 3. Wall collision check
  if (myHead.x === 0) isMoveSafe.left = false;
  if (myHead.x === boardWidth - 1) isMoveSafe.right = false;
  if (myHead.y === 0) isMoveSafe.down = false;
  if (myHead.y === boardHeight - 1) isMoveSafe.up = false;

  // 4. Prevent collision with ALL snakes (self + enemies)
  const snakes = board.snakes;

  for (const snake of snakes) {
    for (const part of snake.body) {
      // If any snake body is in next position, mark unsafe
      if (part.x === myHead.x && part.y === myHead.y + 1) isMoveSafe.up = false;
      if (part.x === myHead.x && part.y === myHead.y - 1)
        isMoveSafe.down = false;
      if (part.x === myHead.x - 1 && part.y === myHead.y)
        isMoveSafe.left = false;
      if (part.x === myHead.x + 1 && part.y === myHead.y)
        isMoveSafe.right = false;
    }
  }

  // Head-to-head
  const myLength = gameState.you.length;

  for (const snake of board.snakes) {
    if (snake.id === gameState.you.id) continue;

    const head = snake.head;

    // avoid stronger or equal snakes in adjacent squares
    if (snake.length >= myLength) {
      const isAdjacent =
        (head.x === myHead.x && Math.abs(head.y - myHead.y) === 1) ||
        (head.y === myHead.y && Math.abs(head.x - myHead.x) === 1);

      if (isAdjacent) {
        isMoveSafe.up = false;
        isMoveSafe.down = false;
        isMoveSafe.left = false;
        isMoveSafe.right = false;
      }
    }
  }

  // 5. Get all safe moves
  const safeMoves = Object.keys(isMoveSafe).filter((key) => isMoveSafe[key]);

  // If no safe moves → panic move
  if (safeMoves.length === 0) {
    console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
    return { move: 'down' };
  }

  const direction = getDirection(myHead, myNeck);
  const turns = getTurns(direction);

  const moveTargets = {
    up: { x: myHead.x, y: myHead.y + 1 },
    down: { x: myHead.x, y: myHead.y - 1 },
    left: { x: myHead.x - 1, y: myHead.y },
    right: { x: myHead.x + 1, y: myHead.y },
  };

  const obstacleMap = getObstacleMap(board);
  const areaByMove = {};

  for (const moveDirection of safeMoves) {
    const target = moveTargets[moveDirection];
    areaByMove[moveDirection] = getOpenSpace(target, board, obstacleMap);
  }

  const bestMove = safeMoves.sort(
    (a, b) => areaByMove[b] - areaByMove[a]
  )[0];

  // 6. FOOD LOGIC
  const food = board.food;
  const closestFood = getClosestFood(myHead, food);


/* START SERVER */
runServer({
  info,
  start,
  move,
  end,
});
}