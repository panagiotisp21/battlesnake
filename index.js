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

  // 6. FOOD LOGIC
  const food = board.food;
  const closestFood = getClosestFood(myHead, food);

  // random safe move
  let nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];

  // 7. Try to move toward food IF safe
  if (closestFood) {
    if (closestFood.x > myHead.x && safeMoves.includes('right'))
      nextMove = 'right';
    else if (closestFood.x < myHead.x && safeMoves.includes('left'))
      nextMove = 'left';
    else if (closestFood.y > myHead.y && safeMoves.includes('up'))
      nextMove = 'up';
    else if (closestFood.y < myHead.y && safeMoves.includes('down'))
      nextMove = 'down';
  }

  console.log(`MOVE ${gameState.turn}: ${nextMove}`);

  return { move: nextMove };
}

/* START SERVER */
runServer({
  info,
  start,
  move,
  end,
});
