//
// Game data
//

var game = {
  "numRows": 6,
  "numCols": 5,
  "colWidth": 101,
  "rowHeight": 83,
  "scalingFactor": 1.2,
  "ticksPerSecond": 10,
  "playingTime": 300,
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
    return game.timer = game.timer > 0 ? game.timer - 10.0 * dt : game.timer;
  },
  "end": function () {
    game.highScore = game.score > game.highScore ? game.score : game.highScore;
  }
};

//
// Shape - superclass for player and enemy
//

function Shape() {
  // position of shape on game grid
  // update col, row to move the shape
  // col: real number between -1 and numCols
  // row: integer number between 0 and numRows - 1
  // x, y are canvas coordinates for the shape
  this.col = 0;
  this.row = 0;
  this.x = 0;
  this.y = 0;
}

// Move shape to col, row and adjust y by row offset for shape
Shape.prototype.move = function (col, row, rowOffset) {
  this.col = col;
  this.row = row;
  this.x = game.colWidth * this.col;
  this.y = game.rowHeight * this.row + rowOffset;
};

//
// Enemies our player must avoid; control enemy speed and detect collisions
//

// Enemy states - only one for now
var enemyState = {
  "moving": 0
}

// Enemy - subclass of Shape
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
  this.setMoving();
}
// Enemy subclass extends Shape superclass
Enemy.prototype = Object.create(Shape.prototype);
Enemy.prototype.constructor = Enemy;

//
// Methods of Enemy subclass
//

// Set the "moving" state for an enemy
Enemy.prototype.setMoving = function () {
  this.state = enemyState.moving;
  // Enemy speed will range from 0.5 to 2.0 before dt factor
  this.speed = 0.5 + Math.random() * 1.5;
  this.sprite = 'images/enemy-bug.png';
  this.rowOffset = -20;
};

// Draw the shape on the screen, required method for game
Enemy.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

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
  if ((player.currentState() === playerState.moving ||
      player.currentState() === playerState.idle) &&
    player.row === this.row &&
    Math.abs(player.col - this.col) < 0.7) {
    // Player has just crashed; start crashing
    // player.pushCrashing();
    player.pushCrashing();
  };
};

//
// Bonus shapes; appear at various times and award bonus points on collision
//

// Bonus - subclass of Shape
function Bonus(s, t) {
  Shape.call(this); // call superclass constructor
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started
  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images
  this.visible = false;
  this.beginTime = 0;
  this.endTime = 0;
  this.bonusCol = 2;
  this.bonusRow = 2;
  this.bonusPoints = 100;
  this.earned = false;
  this.sprite = '';
  this.rowOffset = 0;
  this.setBonus(s, t);
}
// Bonus subclass extends Shape superclass
Bonus.prototype = Object.create(Shape.prototype);
Bonus.prototype.constructor = Bonus;

//
// Methods of Bonus subclass
//

// Set the visibility of bonus shape
Bonus.prototype.setBonus = function (s, t) {
  // Bonus will appear after t seconds
  var visibleTime = game.ticksPerSecond * 2;
  this.col = -1;
  this.row = 2;
  this.visible = false;
  this.beginTime = game.playingTime - t * game.ticksPerSecond;
  this.endTime = this.beginTime - visibleTime;
  this.earned = false;
  this.sprite = s;
  this.rowOffset = 25;
};

// Update the bonus position, required method for game
// Parameter: dt, a time delta between ticks
Bonus.prototype.update = function (dt) {
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.

  this.visible = (game.timer <= this.beginTime) && (game.timer >= this.endTime);

  // If it's time to display bonus, make it visible
  if (this.visible) {
    this.move(this.bonusCol, this.bonusRow, this.rowOffset);
    // Check for bonus
    if ((player.currentState() === playerState.moving ||
        player.currentState() === playerState.idle) &&
      player.row === this.row &&
      Math.abs(player.col - this.col) < 0.7) {
      // Player has just earned bonus; display player bonus state and award points
      player.pushBonus();
      game.score = game.score + this.bonusPoints;
      this.earned = true;
    };
  };
};

// Draw the shape on the screen, required method for game
Bonus.prototype.render = function () {
  if (this.visible && !this.earned) {
    var colOffset = 20;
    ctx.drawImage(Resources.get(this.sprite), this.x + colOffset, this.y);
  };
};

//
// Player - control player character, states and game phases
//

// Player character sprites
var playerChars = [
  'images/char-boy.png',
  'images/char-cat-girl.png',
  'images/char-horn-girl.png',
  'images/char-pink-girl.png',
  'images/char-princess-girl.png'
];

// Player - subclass of Shape
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

// Accessor method to refer to state at top of stack
Player.prototype.currentState = function () {
  return this.state[this.state.length - 1];
};

// Accessor method to refer to state next to top of stack
Player.prototype.previousState = function () {
  return this.state[this.state.length - 2];
};

// Update the player's position, required method for game
// Parameter: dt, a time delta between ticks
Player.prototype.update = function (dt) {
  // Let the player state subclass take care of updates, if needed
  this.currentState().update(dt);
};

// Handle player input by updating game square col or row
Player.prototype.handleInput = function (playerInput) {
  // Let the player state subclass take care of player input, if needed
  this.currentState().handleInput(playerInput);
};

//
// Player states use the State design pattern for sprite and state timer
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
  return this.timer = this.timer > 0 ? this.timer - 10.0 * dt : this.timer;
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
  this.char = 0;
}

// PlayerIdle subclass extends PlayerState superclass
PlayerIdle.prototype = Object.create(PlayerState.prototype);
PlayerIdle.prototype.constructor = PlayerIdle;

PlayerIdle.prototype.update = function (dt) {
  // Stay still until timer expires and then take next random move

  if (player.currentState().chargeTime(dt) <= 0) {

    function randomPlayerInput() {
      // Calculate a semi-random -1, 0 or 1
      var randomPosZeroOrNegInput = Math.round(Math.random() * 2) - 1;
      switch (randomPosZeroOrNegInput) {
      case -1:
        playerInput = 'left';
        break;
      case 0:
        playerInput = 'up';
        break;
      case 1:
        playerInput = 'right';
        break;
      default:
      };
      return playerInput;
    }

    var playerInput = randomPlayerInput();

    // Reset timer to wait for next move
    player.currentState().timer = game.ticksPerSecond * 1;

    switch (playerInput) {
    case 'up':
      if (player.row > 1) {
        player.row--;
      } else if (player.row === 1) {
        player.row = 0;
        if (player.col === 1 || player.col === 3) {
          // Player has just reached home; start heart
          player.pushHome();
        } else {
          // Player has just fallen into the water; start splashing
          player.pushSplashing();
        };
      };
      break;
    case 'down':
      // No-op for 'down' action (shouldn't happen)
      break;
    case 'left':
      if (player.col > 0) {
        player.col--;
      };
      break;
    case 'right':
      if (player.col < game.numCols - 1) {
        player.col++;
      };
      break;
    default:
    }
  };
  player.move(
    player.col, player.row, player.currentState().rowOffset);
};

// Space to start game, ignore other inputs
PlayerIdle.prototype.handleInput = function (playerInput) {
  switch (playerInput) {
  case 'space':
    player.pushSelecting();
    break;
  case 'up':
    break;
  case 'down':
    break;
  case 'left':
    break;
  case 'right':
    break;
  default:
  }
};

// Render game messages while in idle state
PlayerIdle.prototype.renderMessages = function () {
  renderIdleMessages();
}

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
  if (player.currentState().chargeTime(dt) <= 0) {
    player.setIdle();
  };
};

// Up/down, left/right to cycle through character sprites, Space to start game
PlayerSelecting.prototype.handleInput = function (playerInput) {
  switch (playerInput) {
  case 'up':
    player.char = player.char > 0 ? player.char - 1 : playerChars.length - 1;
    player.currentState().sprite = playerChars[player.char];
    break;
  case 'down':
    player.char = (player.char + 1) % playerChars.length;
    player.currentState().sprite = playerChars[player.char];
    break;
  case 'space':
    player.popState();
    player.pushMoving();
    game.begin();
    break;
  case 'left':
    break;
  case 'right':
    break;
  default:
  }
};

// Render game messages while in selecting state
PlayerSelecting.prototype.renderMessages = function () {
  renderSelectingMessages();
}

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
  player.move(
    player.col, player.row, player.currentState().rowOffset);
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
      player.row--;
      addStepPoints();
    } else if (player.row === 1) {
      player.row = 0;
      if (player.col % 2) {
        // Player has just reached home; start home state (heart)
        player.pushHome();
        game.score = game.score + game.pointsHome +
          Math.round(game.timer / game.ticksPerSecond);
      } else {
        // Player has just fallen into the water; start splashing
        player.pushSplashing();
      };
    };
    break;
  case 'down':
    if (player.row < game.numRows - 1) {
      player.row++;
      addStepPoints();
    };
    break;
  case 'left':
    if (player.col > 0) {
      player.col--;
      addStepPoints();
    };
    break;
  case 'right':
    if (player.col < game.numCols - 1) {
      player.col++;
      addStepPoints();
    };
    break;
  case 'space':
    // Ignore
    break;
  default:
  }
};

// Render game messages while in moving state
PlayerMoving.prototype.renderMessages = function () {
  renderPlayingMessages();
}

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
  var currentTimer = player.currentState().chargeTime(dt);
  if (currentTimer <= 0) {
    player.state.pop(); // go back to previous idle or moving state
    player.move(2, 5, player.currentState().rowOffset);
  };
  player.move(
    player.col, player.row, player.currentState().rowOffset);
  if (player.previousState() !== playerState.idle) {
    if (game.chargeTime(dt) <= 0) {
      game.end();
      player.setIdle();
    };
  };
};

// Handle Space to start game
PlayerCrashing.prototype.handleInput = function (playerInput) {
  switch (playerInput) {
  case 'space':
    if (player.previousState() === playerState.idle) {
      player.popState();
      player.pushSelecting();
    };
    break;
  case 'up':
    break;
  case 'down':
    break;
  case 'left':
    break;
  case 'right':
    break;
  default:
  }
};

// Render game messages while in crashing state
PlayerCrashing.prototype.renderMessages = function () {
  if (player.previousState() === playerState.moving) {
    renderPlayingMessages();
  } else {
    renderIdleMessages();
  };
}

//
// PlayerSplashing - subclass of PlayerState
// Player is in this state while displaying the "splashing" graphic after falling in the water
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
  var currentTimer = player.currentState().chargeTime(dt);
  if (currentTimer <= 0) {
    player.state.pop(); // go back to previous idle or moving state
    player.move(2, 5, player.currentState().rowOffset);
  };
  player.move(
    player.col, player.row, player.currentState().rowOffset);
  if (player.previousState() !== playerState.idle) {
    if (game.chargeTime(dt) <= 0) {
      game.end();
      player.setIdle();
    };
  };
};

// Handle Space to start game
PlayerSplashing.prototype.handleInput = function (playerInput) {
  switch (playerInput) {
  case 'space':
    if (player.previousState() === playerState.idle) {
      player.popState();
      player.pushSelecting();
    };
  case 'up':
    break;
  case 'down':
    break;
  case 'left':
    break;
  case 'right':
    break;
    break;
  default:
  }
};

// Render game messages while in splashing state
PlayerSplashing.prototype.renderMessages = function () {
  if (player.previousState() === playerState.moving) {
    renderPlayingMessages();
  } else {
    renderIdleMessages();
  };
}

//
// PlayerHome - subclass of PlayerState
// Player is in this state after reaching "home" (one of the rocks)
//
function PlayerHome() {
  PlayerState.call(this);
  // Subclass has no data, only subclass methods
}

// PlayerHome subclass extends PlayerState superclass
PlayerHome.prototype = Object.create(PlayerState.prototype);
PlayerHome.prototype.constructor = PlayerHome;

PlayerHome.prototype.update = function (dt) {
  // Stay in home state until timer expires and then restart player
  var currentTimer = player.currentState().chargeTime(dt);
  if (currentTimer <= 0) {
    player.state.pop(); // go back to previous idle or moving state
    player.move(2, 5, player.currentState().rowOffset);
  };
  player.move(
    player.col, player.row, player.currentState().rowOffset);
  if (player.previousState() !== playerState.idle) {
    if (game.chargeTime(dt) <= 0) {
      game.end();
      player.setIdle();
    };
  };
};

// Render game messages while in home state
PlayerHome.prototype.renderMessages = function () {
  if (player.previousState() === playerState.moving) {
    renderPlayingMessages();
  } else {
    renderIdleMessages();
  };
}

//
// PlayerBonus - subclass of PlayerState
// Player is in this state after reaching "home" (one of the rocks)
//
function PlayerBonus() {
  PlayerState.call(this);
  // Subclass has no data, only subclass methods
}

// PlayerBonus subclass extends PlayerState superclass
PlayerBonus.prototype = Object.create(PlayerState.prototype);
PlayerBonus.prototype.constructor = PlayerBonus;

PlayerBonus.prototype.update = function (dt) {
  // Stay in bonus state until timer expires and then resume playing
  var currentTimer = player.currentState().chargeTime(dt);
  if (currentTimer <= 0) {
    player.state.pop(); // go back to previous idle or moving state
    player.move(2, 5, player.currentState().rowOffset);
  };
  player.move(
    player.col, player.row, player.currentState().rowOffset);
  if (player.previousState() !== playerState.idle) {
    if (game.chargeTime(dt) <= 0) {
      game.end();
      player.setIdle();
    };
  };
};

// Render game messages while in bonus state
PlayerBonus.prototype.renderMessages = function () {
  if (player.previousState() === playerState.moving) {
    renderPlayingMessages();
  } else {
    renderIdleMessages();
  };
}

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
  // Set state settings
  this.currentState().timer = timeBetweenMoves;
  this.currentState().sprite = playerChars[this.char];
  this.currentState().rowOffset = -10;
  this.move(2, 5, this.currentState().rowOffset);
};

// Player starts cycling through character sprite images to choose one
// TODO: use a generic "push" method with parameters
Player.prototype.pushSelecting = function () {
  var timeToSelect = game.ticksPerSecond * 30;
  this.state.push(playerState.selecting);
  this.currentState().timer = timeToSelect;
  this.currentState().sprite = playerChars[this.char];
  this.currentState().rowOffset = -10;
  this.move(2, 5, this.currentState().rowOffset);
};

// Player starts moving according to input from the arrow keys
// TODO: use a generic "push" method with parameters
Player.prototype.pushMoving = function () {
  this.state.push(playerState.moving);
  this.currentState().timer = 0;
  this.currentState().sprite = playerChars[this.char];
  this.currentState().rowOffset = -10;
};

// While player is "crashing", change player image for crashTime ticks without responding to player input
Player.prototype.pushCrashing = function () {
  var crashTime = game.ticksPerSecond * 2;
  this.state.push(playerState.crashing);
  this.currentState().timer = crashTime;
  this.currentState().sprite = 'images/crash.png';
  this.currentState().rowOffset = 45;
};

// While player is "splashing", change player image for splashTime ticks without responding to player input
// TODO: use a generic "push" method with parameters
Player.prototype.pushSplashing = function () {
  var splashTime = game.ticksPerSecond * 2;
  this.state.push(playerState.splashing);
  this.currentState().timer = splashTime;
  this.currentState().sprite = 'images/splash.png';
  this.currentState().rowOffset = 50;
};

// While player is "home", change player image for splashTime ticks without responding to player input
// TODO: use a generic "push" method with parameters
Player.prototype.pushHome = function () {
  var homeTime = game.ticksPerSecond * 2;
  this.state.push(playerState.home);
  this.currentState().timer = homeTime;
  this.currentState().sprite = 'images/Heart.png';
  this.currentState().rowOffset = 2;
};

// After player obtains a bonus, change player image for bonusTime ticks without responding to player input
// TODO: use a generic "push" method with parameters
Player.prototype.pushBonus = function () {
  var bonusTime = game.ticksPerSecond * 1;
  this.state.push(playerState.bonus);
  this.currentState().timer = bonusTime;
  this.currentState().sprite = 'images/Star.png';
  this.currentState().rowOffset = -10;
};

// Player starts cycling through character sprite images to choose one
Player.prototype.popState = function () {
  this.state.pop();
};

//
// Game messages
//

function renderMessages() {
  player.currentState().renderMessages();
}

function renderMessage(message, pts, x, y) {
  ctx.font = pts + 'pt Impact';
  ctx.fillStyle = 'yellow';
  ctx.textAlign = 'center';
  ctx.fillText(message, x, y);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.strokeText(message, x, y);
}

function renderIdleMessages() {
  var message = 'Bugs, Bugs, Bugs!';
  renderMessage(message, 36, (ctx.canvas.width / game.scalingFactor / 2), game.rowHeight * 2 - 55);
  message = 'Score: ' + game.score + '    High Score: ' + game.highScore + '    Space to play';
  renderMessage(message, 18, (ctx.canvas.width / game.scalingFactor / 2), ctx.canvas.height / game.scalingFactor - 30);
}

function renderSelectingMessages() {
  var message = 'Press ▲▼ to select character / Space to start';
  renderMessage(message, 18, (ctx.canvas.width / game.scalingFactor / 2), ctx.canvas.height / game.scalingFactor - 30);
}

function renderPlayingMessages() {
  var message = 'Score: ' + game.score + '                  Time: ' + Math.round(game.timer / game.ticksPerSecond) + ' seconds';
  renderMessage(message, 18, (ctx.canvas.width / game.scalingFactor / 2), ctx.canvas.height / game.scalingFactor - 30);
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy()];

var allBonuses = [
  new Bonus('images/Gem Blue.png', 5), new Bonus('images/Gem Green.png', 10),
  new Bonus('images/Gem Orange.png', 15), new Bonus('images/Key.png', 20)
];

var player = new Player();
var playerState = {
  "idle": new PlayerIdle(),
  "selecting": new PlayerSelecting(),
  "moving": new PlayerMoving(),
  "crashing": new PlayerCrashing(),
  "splashing": new PlayerSplashing(),
  "home": new PlayerHome(),
  "bonus": new PlayerBonus()
};

function startGame() {

  allEnemies[0].move(-1, 1);
  allEnemies[1].move(-1, 2);
  allEnemies[2].move(-1, 3);
  allEnemies[3].move(-1, 1);

  allBonuses[0].move(-1, allBonuses[0].col);
  allBonuses[1].move(-1, allBonuses[1].col);
  allBonuses[2].move(-1, allBonuses[2].col);
  allBonuses[3].move(-1, allBonuses[3].col);

  player.setIdle();

  game.begin();
}

startGame();

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
})
