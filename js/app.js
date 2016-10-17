//
// Game data
//
var game = {
  "numRows": 6,
  "numCols": 5,
  "colWidth": 101,
  "rowHeight": 83,
  "ticksPerSecond": 10,
  "playingTime": 100,
  "pointsStep": 10,
  "pointsHome": 50,
  "timer": 0,
  "score": 0,
  "highScore": 0,
  "begin": function () {
    game.timer = game.playingTime;
    game.score = 0;
  },
  "chargeTime": function (dt) {
    if (game.timer > 0 &&
      player.state[player.state.length - 1] !== playerState.idle) {
      // Keep counting down
      game.timer = game.timer - 10.0 * dt;
    }
    return game.timer;
  },
  "end": function () {
    game.highScore = game.score > game.highScore ? game.score : game.highScore;
  }
};

//
// Player character sprites
//
var playerChars = [
  'images/char-boy.png',
  'images/char-cat-girl.png',
  'images/char-horn-girl.png',
  'images/char-pink-girl.png',
  'images/char-princess-girl.png'
];

//
// Shape - superclass for player and enemy
//
function Shape() {
  // position of shape on game grid
  // update col, row to move the shape
  // col: real number between -1 and numCols
  // row: integer number between 0 and numRows - 1
  // x, y are canvas coordinates for the shape
  // rowOffset is used to center the shape in the row
  this.col = 0;
  this.row = 0;
  this.x = 0;
  this.y = 0;
}

// Move shape to col, row and update canvas coordinates
Shape.prototype.move = function (col, row, rowOffset) {
  // this.col = col === undefined ? this.col : col;
  // this.row = row === undefined ? this.row : row;
  this.col = col;
  this.row = row;
  this.x = game.colWidth * this.col;
  this.y = game.rowHeight * this.row + rowOffset;
};

// Enemy states - only one for now
var moving = "moving";

// Enemy - subclass of Shape
// Enemies our player must avoid
function Enemy() {
  Shape.call(this); // call superclass constructor
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started
  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images
  this.state = '';
  this.speed = 0;
  this.sprite = '';
  this.rowOffset = 0;
  // Enemy speed will range from 0.5 to 2.0 before dt factor
  this.setMoving();
}
// Enemy subclass extends Shape superclass
Enemy.prototype = Object.create(Shape.prototype);
Enemy.prototype.constructor = Enemy;

//
// Methods of Enemy subclass
//

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.

  // Update col position; after moving off the right side, cycle back
  var newCol = this.col + this.speed * dt;
  if (newCol >= game.numCols) {
    newCol = -1;
  };

  // Update position on the canvas
  this.move(newCol, this.row, this.rowOffset);

  // Check for collision with player
  if ((player.state[player.state.length - 1] === playerState.moving ||
      player.state[player.state.length - 1] === playerState.idle) &&
    player.row === this.row &&
    Math.abs(player.col - this.col) < 0.7) {
    // Player has just crashed; start crashing
    player.pushCrashing();
  };
};

// Set the "moving" state for an enemy
Enemy.prototype.setMoving = function () {
  this.state = moving;
  // Enemy speed will range from 0.5 to 2.0 before dt factor
  this.speed = 0.5 + Math.random() * 1.5;
  this.sprite = 'images/enemy-bug.png';
  this.rowOffset = -20;
};

// Draw the shape on the screen, required method for game
Enemy.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Player - subclass of Shape
// Player must avoid the enemies and reach the water
function Player() {
  Shape.call(this); // call superclass constructor.
  this.state = new Array(0); // Player state is a stack of states
  this.char = 0;
}
// Player subclass extends Shape superclass
Player.prototype = Object.create(Shape.prototype);
Player.prototype.constructor = Player;

//
// Player subclass methods
//

// Update the player's position, required method for game
// Parameter: dt, a time delta between ticks
Player.prototype.update = function (dt) {
  // Let the player state subclass take care of updates, if needed
  this.state[this.state.length - 1].update(dt);
};

// Handle player input by updating game square col or row
Player.prototype.handleInput = function (playerInput) {
  // Let the player state subclass take care of player input, if needed
  this.state[this.state.length - 1].handleInput(playerInput);
};

//
// Player states using State design pattern
// PlayerState - superclass
//
function PlayerState() {
  // Timer for length of time to remain in the state
  this.timer = 0;
  this.sprite = '';
  this.rowOffset = 0;
}

// Update the player's position, required method for game
// Parameter: dt, a time delta between ticks
PlayerState.prototype.update = function (dt) {
  // No-op unless player state subclass provides it
};

// Handle player input
PlayerState.prototype.handleInput = function (playerInput) {
  // No-op unless player state subclass provides it
};

// Deduct time and return the time remaining on the timer
// Used to track time in state initiated by an event (crash or splash)
// Parameter: dt, a time delta between ticks
PlayerState.prototype.chargeTime = function (dt) {
  if (this.timer > 0) {
    // Keep counting down
    this.timer = this.timer - 10.0 * dt;
  }
  return this.timer;
};

// Draw the shape on the screen, required method for game
PlayerState.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), player.x, player.y);
};

//
// PlayerIdle - subclass of PlayerState
// Player is in this state while waiting to start game / after game over
//
function PlayerIdle() {
  PlayerState.call(this);
}

// PlayerIdle subclass extends PlayerState superclass
PlayerIdle.prototype = Object.create(PlayerState.prototype);
PlayerIdle.prototype.constructor = PlayerIdle;

PlayerIdle.prototype.update = function (dt) {
  // Stay still until timer expires and then take next random move

  if (player.state[player.state.length - 1].chargeTime(dt) <= 0) {

    // function addStepPoints() {
    //   if (player.row > 0 && player.row < 4) {
    //     game.score = game.score + game.pointsStep;
    //   };
    // }

    function randomPlayerInput() {
      // Calculate a semi-random 0 or 1
      var randomColOrRowInput = Math.round(Math.random());
      // var randomColOrRowInput = 0;
      // Calculate a semi-random -1, 0 or 1
      var randomPosZeroOrNegInput = Math.round(Math.random() * 2) - 1;
      // var randomPosZeroOrNegInput = -1;
      switch (randomPosZeroOrNegInput) {
      case -1: // interpret as a left or up arrow
        playerInput = randomColOrRowInput ? 'left' : 'up';
        break;
      case 1: // interpret as a right or down arrow
        playerInput = randomColOrRowInput ? 'right' : 'down';
        break;
      default: // do nothing for this cycle
      };
      return playerInput;
    }

    var playerInput = randomPlayerInput();

    // Reset timer to wait for next move
    // player.setIdle();
    player.state[player.state.length - 1].timer = game.ticksPerSecond * 1;

    switch (playerInput) {
    case 'up':
      if (player.row > 1) {
        player.row = player.row - 1;
        // addStepPoints();
      } else if (player.row = 1) {
        player.row = 0;
        // Player has just reached home; start splashing
        player.pushSplashing();
        // game.score = game.score + game.pointsHome + Math.round(game.timer / game.ticksPerSecond);
      };
      break;
    case 'down':
      // No-op for 'down' action; bias towards moving 'up'
      break;
    case 'left':
      if (player.col > 0) {
        player.col = player.col - 1;
        // addStepPoints();
      };
      break;
    case 'right':
      if (player.col < game.numCols - 1) {
        player.col = player.col + 1;
        // addStepPoints();
      };
      break;
    default:
    }
  };
  player.move(player.col, player.row, player.state[player.state.length - 1].rowOffset);
};

// Up/down, left/right to cycle through character sprites, Space to start game
PlayerIdle.prototype.handleInput = function (playerInput) {
  switch (playerInput) {
  case 'up':
    break;
  case 'down':
    break;
  case 'left':
    break;
  case 'right':
    break;
  case 'space':
    player.pushSelecting();
    break;
  default:
  }
  // if (playerInput = 'space') {
  //   // Player wants to start a new game
  //   player.pushSelecting();
  // }
};

//
// PlayerSelecting - subclass of PlayerState
// Player is in this state while selecting a character sprite
//
function PlayerSelecting() {
  PlayerState.call(this);
  // Subclass has no data, only subclass methods
}

// PlayerSelecting subclass extends PlayerState superclass
PlayerSelecting.prototype = Object.create(PlayerState.prototype);
PlayerSelecting.prototype.constructor = PlayerSelecting;

// If player takes too much time to select, go back to idle state
PlayerSelecting.prototype.update = function (dt) {
  if (player.state[player.state.length - 1].chargeTime(dt) <= 0) {
    player.setIdle();
  };
};

// Up/down, left/right to cycle through character sprites, Space to start game
PlayerSelecting.prototype.handleInput = function (playerInput) {
  switch (playerInput) {
  case 'up':
    player.char = player.char > 0 ? player.char - 1 : playerChars.length - 1;
    player.state[player.state.length - 1].sprite = playerChars[player.char];
    break;
  case 'down':
    player.char = (player.char + 1) % playerChars.length;
    player.state[player.state.length - 1].sprite = playerChars[player.char];
    break;
  case 'left':
    break;
  case 'right':
    break;
  case 'space':
    player.popState();
    player.pushMoving();
    game.begin();
    break;
  default:
  }
};

//
// PlayerMoving - subclass of PlayerState
// Player is in this state while moving around in the game
//
function PlayerMoving() {
  PlayerState.call(this);
  // Subclass has no data, only subclass methods
}

// PlayerMoving subclass extends PlayerState superclass
PlayerMoving.prototype = Object.create(PlayerState.prototype);
PlayerMoving.prototype.constructor = PlayerMoving;

PlayerMoving.prototype.update = function (dt) {
  player.move(player.col, player.row, player.state[player.state.length - 1].rowOffset);
  if (game.chargeTime(dt) <= 0) {
    game.end();
    player.setIdle();
  };
};

// Handle player input by updating game square col or row
PlayerMoving.prototype.handleInput = function (playerInput) {
  function addStepPoints() {
    if (player.row > 0 && player.row < 4) {
      game.score = game.score + game.pointsStep;
    };
  }
  switch (playerInput) {
  case 'up':
    if (player.row > 1) {
      player.row = player.row - 1;
      addStepPoints();
    } else if (player.row = 1) {
      player.row = 0;
      // Player has just reached home; start splashing
      player.pushSplashing();
      game.score = game.score + game.pointsHome + Math.round(game.timer / game.ticksPerSecond);
    };
    break;
  case 'down':
    if (player.row < game.numRows - 1) {
      player.row = player.row + 1;
      addStepPoints();
    };
    break;
  case 'left':
    if (player.col > 0) {
      player.col = player.col - 1;
      addStepPoints();
    };
    break;
  case 'right':
    if (player.col < game.numCols - 1) {
      player.col = player.col + 1;
      addStepPoints();
    };
    break;
  case 'space':
    // Ignore
    break;
  default:
  }
};

//
// PlayerCrashing - subclass of PlayerState
// Player is in this state while displaying the "crashing" graphic after colliding with an enemy
//
function PlayerCrashing() {
  PlayerState.call(this);
  // Subclass has no data, only subclass methods
}

// PlayerCrashing subclass extends PlayerState superclass
PlayerCrashing.prototype = Object.create(PlayerState.prototype);
PlayerCrashing.prototype.constructor = PlayerCrashing;

PlayerCrashing.prototype.update = function (dt) {
  // Stay in crashing state until timer expires and then restart player
  if (player.state[player.state.length - 1].chargeTime(dt) <= 0) {
    player.state.pop(); // go back to previous idle or moving state
    player.move(2, 5, player.state[player.state.length - 1].rowOffset);
  };
  player.move(player.col, player.row, player.state[player.state.length - 1].rowOffset);
  if (game.chargeTime(dt) <= 0) {
    game.end();
    player.setIdle();
  };
};

//
// PlayerSplashing - subclass of PlayerState
// Player is in this state while displaying the "splashing" graphic after reaching the water
//
function PlayerSplashing() {
  PlayerState.call(this);
  // Subclass has no data, only subclass methods
}

// PlayerSplashing subclass extends PlayerState superclass
PlayerSplashing.prototype = Object.create(PlayerState.prototype);
PlayerSplashing.prototype.constructor = PlayerSplashing;

PlayerSplashing.prototype.update = function (dt) {
  // Stay in splashing state until timer expires and then restart player
  if (player.state[player.state.length - 1].chargeTime(dt) <= 0) {
    player.state.pop(); // go back to previous idle or moving state
    player.move(2, 5, player.state[player.state.length - 1].rowOffset);
  };
  player.move(player.col, player.row, player.state[player.state.length - 1].rowOffset);
  if (game.chargeTime(dt) <= 0) {
    game.end();
    player.setIdle();
  };
};

//
// State transition methods
//

// Player automatically moves randomly until game starts
Player.prototype.setIdle = function () {
  // Make sure Idle is the only state on the state stack
  var timeBetweenMoves = game.ticksPerSecond * 1;
  if (this.state.length === 0) {
    this.state.push(playerState.idle);
  } else {
    while (this.state.length > 1) {
      this.state.pop();
    };
  };
  // Set/refresh state settings
  this.char = 0;
  this.state[this.state.length - 1].timer = timeBetweenMoves;
  this.state[this.state.length - 1].sprite = playerChars[this.char];
  this.state[this.state.length - 1].rowOffset = -10;
  this.move(2, 5, this.state[this.state.length - 1].rowOffset);
};

// Player starts cycling through character sprite images to choose one
Player.prototype.pushSelecting = function () {
  var timeToSelect = game.ticksPerSecond * 30;
  this.state.push(playerState.selecting);
  this.state[this.state.length - 1].timer = timeToSelect;
  this.state[this.state.length - 1].sprite = playerChars[this.char];
  this.state[this.state.length - 1].rowOffset = -10;
  this.move(2, 5, this.state[this.state.length - 1].rowOffset);
};

// Player starts moving according to input from the arrow keys
Player.prototype.pushMoving = function () {
  this.state.push(playerState.moving);
  this.state[this.state.length - 1].timer = 0;
  this.state[this.state.length - 1].sprite = playerChars[this.char];
  this.state[this.state.length - 1].rowOffset = -10;
};

// While player is "crashing", change player image for crashTime ticks without responding to player input
Player.prototype.pushCrashing = function () {
  var crashTime = game.ticksPerSecond * 2;
  this.state.push(playerState.crashing);
  this.state[this.state.length - 1].timer = crashTime;
  this.state[this.state.length - 1].sprite = 'images/crash.png';
  this.state[this.state.length - 1].rowOffset = 50;
};

// While player is "splashing", change player image for splashTime ticks without responding to player input
Player.prototype.pushSplashing = function () {
  var splashTime = game.ticksPerSecond * 2;
  this.state.push(playerState.splashing);
  this.state[this.state.length - 1].timer = splashTime;
  this.state[this.state.length - 1].sprite = 'images/splash.png';
  this.state[this.state.length - 1].rowOffset = 60;
};

// Player starts cycling through character sprite images to choose one
Player.prototype.popState = function () {
  this.state.pop();
};

//
// Game messages
//

function renderMessages() {
  switch (player.state[player.state.length - 1]) {
  case playerState.idle:
    renderIdleMessages();
    break;
  case playerState.selecting:
    renderSelectingMessages();
    break;
  case playerState.moving:
    renderPlayingMessages();
    break;
  case playerState.crashing:
    if (player.state[player.state.length - 2] === playerState.moving) {
      renderPlayingMessages();
    } else {
      renderIdleMessages();
    };
    break;
  case playerState.splashing:
    renderPlayingMessages();
    if (player.state[player.state.length - 2] === playerState.moving) {
      renderPlayingMessages();
    } else {
      renderIdleMessages();
    };
    break;
  default:
  };
}

function renderMessage(message, pts, x, y) {
  ctx.font = pts + "pt Impact";
  ctx.fillStyle = "yellow";
  ctx.textAlign = "center";
  ctx.fillText(message, x, y);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeText(message, x, y);
}

function renderIdleMessages() {
  var message = "Bugs, Bugs, Bugs!";
  renderMessage(message, 36, (ctx.canvas.width / 2), game.rowHeight * 2 - 55);
  message = "Score: " + game.score + "    High Score: " + game.highScore + "    Space to play";
  renderMessage(message, 18, (ctx.canvas.width / 2), ctx.canvas.height - 30);
}

function renderSelectingMessages() {
  var message = "Press ▲▼ to select character / Space to start";
  renderMessage(message, 18, (ctx.canvas.width / 2), ctx.canvas.height - 30);
}

function renderPlayingMessages() {
  var message = "Score: " + game.score + "                  Time: " + Math.round(game.timer / game.ticksPerSecond) + " seconds";
  renderMessage(message, 18, (ctx.canvas.width / 2), ctx.canvas.height - 30);
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var playerState = {
  "idle": new PlayerIdle(),
  "selecting": new PlayerSelecting(),
  "moving": new PlayerMoving(),
  "crashing": new PlayerCrashing(),
  "splashing": new PlayerSplashing()
}

var allEnemies = [new Enemy(), new Enemy(), new Enemy()];
allEnemies[0].move(-1, 1);
allEnemies[1].move(-1, 2);
allEnemies[2].move(-1, 3);
// TODO: use allEnemies.push() to add enemies

var player = new Player();
player.setIdle();

game.begin();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    32: 'space'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});;
