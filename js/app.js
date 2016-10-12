//
// Game dimensions
//
var game = {
  "numRows": 6,
  "numCols": 5,
  "colWidth": 101,
  "rowHeight": 83
};

//
// Player character sprites
//
var chars = [
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
  this.sprite = '';
  this.rowOffset = 0;
}

// Move shape to col, row and update canvas coordinates
Shape.prototype.move = function (col, row) {
  this.col = col === undefined ? this.col : col;
  this.row = row === undefined ? this.row : row;
  this.x = game.colWidth * this.col;
  this.y = game.rowHeight * this.row + this.rowOffset;
};

// Draw the shape on the screen, required method for game
Shape.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Enemy states
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
  this.move(newCol);

  // Check for collision with player
  if (player.state === playerState.moving &&
    player.row === this.row &&
    Math.abs(player.col - this.col) < 0.7) {
    // Player has just crashed; start crashing
    player.setCrashing();
    player.move();
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

// Player - subclass of Shape
// Player must avoid the enemies and reach the water
function Player() {
  Shape.call(this); // call superclass constructor.
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started
  // Player sprite images
  this.char = 0;
  this.state = undefined;
  // this.timer = 0;
  this.sprite = '';
  this.rowOffset = 0;
  this.setSelecting();
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
  this.state.update(dt);
};

// Handle player input by updating game square col or row
Player.prototype.handleInput = function (playerInput) {
  // Let the player state subclass take care of player input, if needed
  this.state.handleInput(playerInput);
};

//
// State transition methods
//

Player.prototype.setSelecting = function () {
  // Player starts cycling through character sprite images to choose one
  this.state = playerState.selecting;
  this.sprite = chars[this.char];
  this.rowOffset = -10;
};

Player.prototype.setMoving = function () {
  // Player starts moving according to input from the arrow keys
  this.state = playerState.moving;
  this.sprite = chars[this.char];
  this.rowOffset = -10;
};

Player.prototype.setCrashing = function () {
  // While player is "crashing", change player image for crashTime ticks without responding to player input
  var crashTime = 5;
  this.state = playerState.crashing;
  this.state.timer = crashTime;
  this.sprite = 'images/crash.png';
  this.rowOffset = 50;
};

Player.prototype.setSplashing = function () {
  // While player is "splashing", change player image for splashTime ticks without responding to player input
  var splashTime = 5;
  this.state = playerState.splashing;
  this.state.timer = splashTime;
  this.sprite = 'images/splash.png';
  this.rowOffset = 60;
};

//
// Player states using State design pattern
// PlayerState - superclass
//
function PlayerState() {
  // All state data is included in subclasses
}

// Update the player's position, required method for game
// Parameter: dt, a time delta between ticks
PlayerState.prototype.update = function (dt) {
  // no-op unless player state subclass provides it
};

// Deduct time and return the time remaining on the timer
// Useful to track time in state initiated by an event (crashing or splashing)
// Parameter: dt, a time delta between ticks
PlayerState.prototype.chargeTime = function (dt) {
  if (this.timer > 0) {
    // Keep counting down
    this.timer = this.timer - 10.0 * dt;
  }
  return this.timer;
};

// Handle player input
PlayerState.prototype.handleInput = function (playerInput) {
  // no-op unless player state subclass provides it
};

//
// PlayerSelecting - subclass of PlayerState
// Player is in this state while selecting a character sprite
//
function PlayerSelecting() {
  PlayerState.call(this);
}

// PlayerSelecting subclass extends PlayerState superclass
PlayerSelecting.prototype = Object.create(PlayerState.prototype);
PlayerSelecting.prototype.constructor = PlayerSelecting;

// Up/down, left/right to cycle through character sprites, Space to start game
PlayerSelecting.prototype.handleInput = function (playerInput) {
  switch (playerInput) {
  case 'up':
  case 'left':
    player.char = player.char > 0 ? player.char - 1 : chars.length - 1;
    player.sprite = chars[player.char];
    break;
  case 'down':
  case 'right':
    player.char = (player.char + 1) % chars.length;
    player.sprite = chars[player.char];
    break;
  case 'space':
    player.setMoving();
    break;
  default:
  }
  // Update player sprite on the canvas
  player.move();
};

//
// PlayerMoving - subclass of PlayerState
// Player is in this state while moving around in the game
//
function PlayerMoving() {
  PlayerState.call(this);
}

// PlayerMoving subclass extends PlayerState superclass
PlayerMoving.prototype = Object.create(PlayerState.prototype);
PlayerMoving.prototype.constructor = PlayerMoving;

PlayerMoving.prototype.update = function (dt) {
  // Check for win when player is at row 0 at the water
  if (player.row <= 0) {
    // Player has just won; start splashing
    player.setSplashing();
    player.move();
  }
};

// Handle player input by updating game square col or row
PlayerMoving.prototype.handleInput = function (playerInput) {
  switch (playerInput) {
  case 'up':
    player.row = player.row > 0 ? player.row - 1 : player.row;
    break;
  case 'down':
    player.row = player.row < game.numRows - 1 ? player.row + 1 : player.row;
    break;
  case 'left':
    player.col = player.col > 0 ? player.col - 1 : player.col;
    break;
  case 'right':
    player.col = player.col < game.numCols - 1 ? player.col + 1 : player.col;
    break;
  default:
  }
  // Update player sprite on the canvas
  player.move();
};

//
// PlayerCrashing - subclass of PlayerState
// Player is in this state while displaying the "crashing" graphic after colliding with an enemy
//
function PlayerCrashing() {
  PlayerState.call(this);
  this.timer = 0;
}

// PlayerCrashing subclass extends PlayerState superclass
PlayerCrashing.prototype = Object.create(PlayerState.prototype);
PlayerCrashing.prototype.constructor = PlayerCrashing;

PlayerCrashing.prototype.update = function (dt) {
  // Stay in crashing state until timer expires and then restart player
  if (player.state.chargeTime(dt) <= 0) {
    player.setMoving();
    player.move(2, 5);
  }
};

//
// PlayerSplashing - subclass of PlayerState
// Player is in this state while displaying the "splashing" graphic after reaching the water
//
function PlayerSplashing() {
  PlayerState.call(this);
  this.timer = 0;
}

// PlayerSplashing subclass extends PlayerState superclass
PlayerSplashing.prototype = Object.create(PlayerState.prototype);
PlayerSplashing.prototype.constructor = PlayerSplashing;

PlayerSplashing.prototype.update = function (dt) {
  // Stay in splashing state until timer expires and then restart player
  if (player.state.chargeTime(dt) <= 0) {
    player.setMoving();
    player.move(2, 5);
  }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var playerState = {
  "selecting": new PlayerSelecting(),
  "moving": new PlayerMoving(),
  "crashing": new PlayerCrashing(),
  "splashing": new PlayerSplashing()
}

var allEnemies = [new Enemy(), new Enemy(), new Enemy()];
allEnemies[0].move(-1, 1);
allEnemies[1].move(-1, 2);
allEnemies[2].move(-1, 3);
// TO DO: use allEnemies.push() to add enemies

var player = new Player();
player.move(2, 5);

function renderMessages() {
  renderCharSelection();
}

function renderCharSelection() {
  ctx.font = "18pt Impact";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("Change character: Arrow keys    Select: Enter", (ctx.canvas.width / 2), ctx.canvas.height - 30);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeText("Change character: Arrow keys    Select: Enter", (ctx.canvas.width / 2), ctx.canvas.height - 30);
}

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
