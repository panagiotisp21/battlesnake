// Welcome to
// __________         __    __  .__                               __
// \______   \_____ _/  |__/  |_|  |   ____   ______ ____ _____  |  | __ ____
//  |    |  _/\__  \\   __\   __\  | _/ __ \ /  ___//    \\__  \ |  |/ // __ \
//  |    |   \ / __ \|  |  |  | |  |_\  ___/ \___ \|   |  \/ __ \|    <\  ___/
//  |________/(______/__|  |__| |____/\_____>______>___|__(______/__|__\\_____>
//
// This file can be a nice home for your Battlesnake logic and helper functions.
//
// To get you started we've included code to prevent your Battlesnake from moving backwards.
// For more info see docs.battlesnake.com

import runServer from "./server.js";

// info is called when you create your Battlesnake on play.battlesnake.com
// and controls your Battlesnake's appearance
// TIP: If you open your Battlesnake URL in a browser you should see this data
function info() {
  console.log("INFO");

  return {
    apiversion: "1",
    author: "panagiotis", //temp name change later
    color: "#45b345ad", // TODO: Choose color
    head: "beluga", // TODO: Choose head
    tail: "curled", // TODO: Choose tail
  };
}

// start is called when your Battlesnake begins a game
function start(gameState) {
  console.log("GAME START");
}

// end is called when your Battlesnake finishes a game
function end(gameState) {
  console.log("GAME OVER\n");
}

// move is called on every turn and returns your next move
// Valid moves are "up", "down", "left", or "right"
// See https://docs.battlesnake.com/api/example-move for available data

//
const getClosestFood = (head, food) => {
  let closestFood = null;
  let minDistance = Infinity;

  for (let i = 0; i < food.length; i++) {
    const foodItem = food[i];
    const distance =
      Math.abs(head.x - foodItem.x) + Math.abs(head.y - foodItem.y);

    if (distance < minDistance) {
      minDistance = distance;
      closestFood = foodItem;
    }
  }

  return closestFood;
};

function move(gameState) {
  let isMoveSafe = {
    up: true,
    down: true,
    left: true,
    right: true,
  };

  // We've included code to prevent your Battlesnake from moving backwards
  const myHead = gameState.you.body[0];
  const myNeck = gameState.you.body[1];

  if (myNeck.x < myHead.x) {
    // Neck is left of head, don't move left
    isMoveSafe.left = false;
  } else if (myNeck.x > myHead.x) {
    // Neck is right of head, don't move right
    isMoveSafe.right = false;
  } else if (myNeck.y < myHead.y) {
    // Neck is below head, don't move down
    isMoveSafe.down = false;
  } else if (myNeck.y > myHead.y) {
    // Neck is above head, don't move up
    isMoveSafe.up = false;
  }

  // TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;

  //if collinding the wall
  if (myHead.x == 0) {
    isMoveSafe.left = false;
  } else if (myHead.x == boardWidth - 1) {
    isMoveSafe.right = false;
  } else if (myHead.y == 0) {
    isMoveSafe.down = false;
  } else if (myHead.y == boardHeight - 1) {
    isMoveSafe.up = false;
  }
  // TODO: Step 2 - Prevent your Battlesnake from colliding with itself
  //for this i check where my snake is and if the snake is trying to move somewher where the body is i mark the move unsafe
  const myBody = gameState.you.body;

  for (let i = 0; i < myBody.length; i++) {
    const bodyPart = myBody[i];
    if (bodyPart.x == myHead.x && bodyPart.y == myHead.y + 1) {
      isMoveSafe.up = false;
    } else if (bodyPart.x == myHead.x && bodyPart.y == myHead.y - 1) {
      isMoveSafe.down = false;
    } else if (bodyPart.x == myHead.x - 1 && bodyPart.y == myHead.y) {
      isMoveSafe.left = false;
    } else if (bodyPart.x == myHead.x + 1 && bodyPart.y == myHead.y) {
      isMoveSafe.right = false;
    }
    // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
    //for this i check where are the others snakes and if they are next to me i mark the move unsafe
    const opponents = gameState.board.snakes;
    for (let i = 0; i < opponents.length; i++) {
      const opponent = opponents[i];
      for (let j = 0; j < opponent.body.length; j++) {
        const bodyPart = opponent.body[j];
        if (bodyPart.x == myHead.x && bodyPart.y == myHead.y + 1) {
          isMoveSafe.up = false;
        } else if (bodyPart.x == myHead.x && bodyPart.y == myHead.y - 1) {
          isMoveSafe.down = false;
        } else if (bodyPart.x == myHead.x - 1 && bodyPart.y == myHead.y) {
          isMoveSafe.left = false;
        } else if (bodyPart.x == myHead.x + 1 && bodyPart.y == myHead.y) {
          isMoveSafe.right = false;
        }
      }

      // Are there any safe moves left?
      const safeMoves = Object.keys(isMoveSafe).filter(
        (key) => isMoveSafe[key],
      );
      if (safeMoves.length == 0) {
        console.log(
          `MOVE ${gameState.turn}: No safe moves detected! Moving down`,
        );
        return { move: "down" };
      }

      // Choose a random move from the safe moves
      const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];

      // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer

      const food = gameState.board.food;
      const closestFood = getClosestFood(myHead, food);

      if (closestFood) {
        if (closestFood.x > myHead.x && safeMoves.includes("right"))
          nextMove = "right";
        else if (closestFood.x < myHead.x && safeMoves.includes("left"))
          nextMove = "left";
        else if (closestFood.y > myHead.y && safeMoves.includes("up"))
          nextMove = "up";
        else if (closestFood.y < myHead.y && safeMoves.includes("down"))
          nextMove = "down";
      }

      console.log(`MOVE ${gameState.turn}: ${nextMove}`);
      return { move: nextMove };
    }
  }
}

runServer({
  info: info,
  start: start,
  move: move,
  end: end,
});
