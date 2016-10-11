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
// Shape - superclass
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

  // Update col position; after moving off the row, cycle back
  var newCol = this.col + this.speed * dt;
  if (newCol >= game.numCols) {
    newCol = -1;
  };

  // Update position on the canvas
  this.move(newCol);

  // Check for collision with player
  if (player.state === moving &&
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
  var chars = [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png',
  ];
  this.crashTime = 5;
  this.splashTime = 5;
  this.char = chars[0];
  this.state = '';
  this.timer = 0;
  this.sprite = '';
  this.rowOffset = 0;
  this.setMoving();
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
  // Check for win when player is at row 0 at the water
  if (this.state === moving) {
    if (this.row <= 0) {
      // Player has just won; start splashing
      this.setSplashing();
      this.move();
    }
  } else {
    // Stay in alternate state until timer expires
    if (this.chargeTime(dt) <= 0) {
      this.setMoving();
      this.move(2, 5);
    }
  }
};

// Character states
var moving = "moving";
var crashing = "crashing";
var splashing = "splashing";

Player.prototype.setMoving = function () {
  // When player state is "moving", respond to player input
  this.state = moving;
  this.timer = 0;
  this.sprite = this.char;
  this.rowOffset = -10;
};

Player.prototype.setCrashing = function () {
  // When player state is "crashing", change image for crashTime ticks without responding to player input
  this.state = crashing;
  this.timer = this.crashTime;
  this.sprite = 'images/crash.png';
  this.rowOffset = 50;
};

Player.prototype.setSplashing = function () {
  // When player state is "splashing", change image for crashTime ticks without responding to player input
  this.state = splashing;
  this.timer = this.splashTime;
  this.sprite = 'images/splash.png';
  this.rowOffset = 60;
};

// Deduct time and return the time remaining on the timer
// Parameter: dt, a time delta between ticks
Player.prototype.chargeTime = function (dt) {
  if (this.timer > 0) {
    // Keep counting down
    this.timer = this.timer - 10.0 * dt;
  }
  return this.timer;
};

// Handle player input by updating game square col or row
Player.prototype.handleInput = function (playerInput) {
  // Don't process player inputs while crashing or splashing
  if (player.state !== moving) {
    return;
  }
  switch (playerInput) {
  case 'up':
    if (this.row > 0) {
      this.row--;
    };
    break;
  case 'down':
    if (this.row < game.numRows - 1) {
      this.row++;
    };
    break;
  case 'left':
    if (this.col > 0) {
      this.col--;
    };
    break;
  case 'right':
    if (this.col < game.numCols - 1) {
      this.col++;
    };
    break;
  default:
  }
  // Update player sprite on the canvas
  this.move();
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

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
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});;
