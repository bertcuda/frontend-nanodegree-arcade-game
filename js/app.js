//
// Global variables
//
var numRows = 6;
var numCols = 5;
var colWidth = 101;
var rowHeight = 83;

// Character state transitions
var moving = "moving";
var crashing = "crashing";
var splashing = "splashing";

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
  this.rowOffset = 0;
}

// Move shape to col, row and update canvas coordinates
Shape.prototype.move = function (col, row) {
  if (col !== undefined) {
    this.col = col;
  };
  if (row !== undefined) {
    this.row = row;
  };
  this.x = colWidth * this.col;
  this.y = rowHeight * this.row + this.rowOffset;
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
  this.state = moving;
  this.sprite = 'images/enemy-bug.png';
  this.rowOffset = -20;
  // Enemy speed will range from 0.5 to 2.0 before dt factor
  this.speed = 0.5 + Math.random() * 1.5;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.

  // Update col position; after moving off the row, cycle back
  var newCol = this.col + this.speed * dt;
  if (newCol >= numCols) {
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

// Player - subclass of Shape
// Player must avoid the enemies and reach the water
function Player() {
  Shape.call(this); // call superclass constructor.
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started
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
    // Player state is crashing or splashing; pause and restart
    this.pauseAndRestart(dt);
  }
};

Player.prototype.setMoving = function () {
  // When player state is "moving", respond to player input
  this.state = moving;
  this.maxPause = 5;
  this.iPause = 0;
  this.sprite = 'images/char-boy.png';
  this.rowOffset = -10;
};

Player.prototype.setCrashing = function () {
  // When player state is "crashing", change image and pause for maxPause ticks without responding to player input
  this.state = crashing;
  this.maxPause = 5;
  this.iPause = this.maxPause;
  this.sprite = 'images/crash.png';
  this.rowOffset = 50;
};

Player.prototype.setSplashing = function () {
  // When player state is "splashing", change image and pause for maxPause ticks without responding to player input
  this.state = splashing;
  this.maxPause = 5;
  this.iPause = this.maxPause;
  this.sprite = 'images/splash.png';
  this.rowOffset = 60;
};

// Pause while crashing or splashing and restart player when done
// Parameter: dt, a time delta between ticks
Player.prototype.pauseAndRestart = function (dt) {
  if (this.iPause > 0) {
    // Keep counting down to finish pausing
    this.iPause = this.iPause - 10.0 * dt;
  } else {
    // Done pausing; reset player image and restart
    this.setMoving();
    this.move(2, 5);
  }
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
    if (this.row < numRows - 1) {
      this.row++;
    };
    break;
  case 'left':
    if (this.col > 0) {
      this.col--;
    };
    break;
  case 'right':
    if (this.col < numCols - 1) {
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

var player = new Player();
player.move(2, 5);

var allEnemies = [new Enemy(), new Enemy(), new Enemy()];
allEnemies[0].move(-1, 1);
allEnemies[1].move(-1, 2);
allEnemies[2].move(-1, 3);

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
