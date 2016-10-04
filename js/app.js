//
// Shape - superclass
//
function Shape() {
  // position of shape on game grid
  // update col, row to move the shape
  // col: real number between -1 and numCols
  // row: integer number between 0 and numRows - 1
  this.col = 0;
  this.row = 0;
  // canvas coordinates calculated from col, row in '.update'
  this.x = 0;
  this.y = 0;
}

// Move shape to game square col, row
// Enemy x and y position will be calculated by canvasPos
Shape.prototype.move = function (col, row) {
  this.col = col;
  this.row = row;
};

// Calculate canvas position of shape from col, row
Shape.prototype.canvasPos = function (rowOffset) {
  var colWidth = 101;
  var rowHeight = 83;
  this.x = colWidth * this.col;
  this.y = rowHeight * this.row + rowOffset;
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
  this.sprite = 'images/enemy-bug.png';
  // Enemy speed will range from 0.5 to 2.0 before dt factor
  this.speed = 0.5 + Math.random() * 1.5;
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
  var numCols = 5;
  var imageRowOffset = -20;
  // Update col position and cycle to beginning of row
  var newCol = this.col + this.speed * dt;
  this.col = newCol < numCols ? newCol : -1;
  // Convert col position to canvas x and y coordinates
  this.canvasPos(imageRowOffset);
  console.info('Enemy moved to square ', this.col, ', ', this.row);
  // Check for collision
  if (player.row === this.row) {
    if (Math.abs(player.col - this.col) < 0.8) {
      player.move(2, 5);
    };
  };
};

// Player - subclass of Shape
// Player must avoid the enemies and reach the water
function Player() {
  Shape.call(this); // call superclass constructor.
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started
  // The image/sprite for our layer, this uses
  // a helper we've provided to easily load images
  this.sprite = 'images/char-boy.png';
  // When player wins, change image to splashing for maxSplash ticks
  this.splashing = false;
  this.maxSplash = 120;
  this.iSplash = 0;
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
  // dt is not needed for player; action is driven by user input
  var imageRowOffset = -10;
  // Check for win when player is at row 0 at the water
  if (this.row === 0) {
    if (!this.splashing) {
      // Player has just won; start splashing
      this.splashing = true;
      this.iSplash = this.maxSplash;
      this.sprite = 'images/splash.png';
      imageRowOffset = 60;
    } else if (this.iSplash > 0) {
      // Keep splashing
      this.iSplash--;
      imageRowOffset = 60;
    } else if (this.iSplash <= 0) {
      // Done splashing; reset player image and restart
      this.sprite = 'images/char-boy.png';
      this.splashing = false;
      this.move(2, 5);
    }
  }
  // Convert col position to canvas x and y coordinates
  this.canvasPos(imageRowOffset);
  console.info('Player moved to square ', this.col, ', ', this.row);
};

// Handle player input by updating game square col or row
// Player x and y position will be calculated by 'update'
Player.prototype.handleInput = function (playerInput) {
  var numRows = 6;
  var numCols = 5;
  if (player.splashing) {
    // Don't process player inputs while splashing
    return;
  }
  switch (playerInput) {
  case 'up':
    console.log("Player input: up");
    if (this.row > 0) {
      this.row--
    };
    break;
  case 'down':
    console.log("Player input: down");
    if (this.row < numRows - 1) {
      this.row++;
    };
    break;
  case 'left':
    console.log("Player input: left");
    if (this.col > 0) {
      this.col--;
    };
    break;
  case 'right':
    console.log("Player input: right");
    if (this.col < numCols - 1) {
      this.col++;
    };
    break;
  default:
    console.log("Player input: something else");
  }
}

// Splash - subclass of Shape
// Splash appears briefly when player reaches the water
function Splash() {
  Shape.call(this); // call superclass constructor.
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started
  // The image/sprite for our layer, this uses
  // a helper we've provided to easily load images
  this.sprite = 'images/splash.png';
}
// Splash subclass extends Shape superclass
Splash.prototype = Object.create(Shape.prototype);
Splash.prototype.constructor = Splash;

//
// Splash subclass methods
//

// Update the splash's position, required method for game
// Parameter: dt, a time delta between ticks
Splash.prototype.update = function (dt) {
  // dt is not needed for splash; action is driven by user input
  var imageRowOffset = 60;
  // Convert col position to canvas x and y coordinates
  this.canvasPos(imageRowOffset);
  console.info('Splash moved to square ', this.col, ', ', this.row);
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

var splash = new Splash();
splash.move(-1, 0);

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
});
