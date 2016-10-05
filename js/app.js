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
  var colWidth = 101;
  var rowHeight = 83;
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
  this.sprite = 'images/enemy-bug.png';
  this.rowOffset = -20;
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
  // Update col position; after moving off the row, cycle back
  var newCol = this.col + this.speed * dt;
  if (newCol >= numCols) {
    newCol = -1;
  };
  this.move(newCol);
  // console.info('Enemy moved to square ', this.col, ', ', this.row);
  // Check for collision
  if (player.row === this.row) {
    if (Math.abs(player.col - this.col) < 0.8) {
      if (player.state === moving) {
        // Player has just crashed; start crashing
        player.state = crashing;
        player.iPause = player.maxPause;
        player.sprite = 'images/crash.png';
        player.rowOffset = 50;
        player.move();
        console.info('Player crashed ', player.col, ', ', player.row);
      } else if (player.iPause > 0) {
        // Keep pausing
        player.iPause--;
      } else if (player.iPause <= 0) {
        // Done crashing; reset player image and restart
        player.state = moving;
        player.iPause = 0;
        player.sprite = 'images/char-boy.png';
        player.rowOffset = -10;
        player.move(2, 5);
        // console.info('Player moved to square ', this.col, ', ', this.row);
      }
    };
  };
};

var moving = "moving";
var crashing = "crashing";
var splashing = "splashing";

// Player - subclass of Shape
// Player must avoid the enemies and reach the water
function Player() {
  Shape.call(this); // call superclass constructor.
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started
  // The image/sprite for our layer, this uses
  // a helper we've provided to easily load images
  this.sprite = 'images/char-boy.png';
  this.rowOffset = -10;
  // When player state is "crashing" or "splashing", change image and pause for maxPause ticks
  this.state = moving;
  this.maxPause = 60;
  this.iPause = 0;
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
  // Check for win when player is at row 0 at the water
  if (this.row <= 0) {
    if (this.state === moving) {
      // Player has just won; start splashing
      this.state = splashing;
      this.iPause = this.maxPause;
      this.sprite = 'images/splash.png';
      this.rowOffset = 60;
      this.move();
    } else if (this.iPause > 0) {
      // Keep pausing
      this.iPause--;
    } else if (this.iPause <= 0) {
      // Done pausing; reset player image and restart
      this.state = moving;
      this.iPause = 0;
      this.sprite = 'images/char-boy.png';
      this.rowOffset = -10;
      this.move(2, 5);
      // console.info('Player moved to square ', this.col, ', ', this.row);
    }
  }
};

// Handle player input by updating game square col or row
// Player x and y position will be calculated by 'update'
Player.prototype.handleInput = function (playerInput) {
  var numRows = 6;
  var numCols = 5;
  if (player.state !== moving) {
    // Don't process player inputs while pausing
    return;
  }
  switch (playerInput) {
  case 'up':
    console.log("Player input: up");
    if (this.row > 0) {
      this.row--;
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
  this.move();
}

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
});
