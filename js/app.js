//
// Shape - superclass
//
function Shape() {
  // position of shape on game grid; change col, row to move the shape
  // col ranges from -1 to numCols + 1
  // row ranges from 0 to numRows
  this.col = 0;
  this.row = 0;
  // canvas coordinates calculated from col, row in '.update'
  this.x = 0;
  this.y = 0;
}

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
  this.speed = Math.random() * 1.5 + 0.5;
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
  var colWidth = 101;
  var rowHeight = 83;
  var squareOffset = 20;
  // Update col position and cycle to beginning of row
  var newCol = this.col + this.speed * dt;
  this.col = newCol < numCols ? newCol : -1;
  // Convert col position to canvas x and y coordinates
  this.x = colWidth * this.col;
  this.y = rowHeight * this.row - squareOffset;
  console.info('Enemy moved to square ', this.col, ', ', this.row);
  // Check for collision
  if (player.row === this.row) {
    if (Math.abs(player.col - this.col) < 0.8) {
      player.move(2, 5);
    };
  };
};

// Move enemy to game square col, row
// Enemy x and y position will be calculated by 'update'
Enemy.prototype.move = function (col, row) {
  this.col = col;
  this.row = row;
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
  var colWidth = 101;
  var rowHeight = 83;
  var squareOffset = 10;
  this.x = colWidth * this.col;
  this.y = rowHeight * this.row - squareOffset;
  console.info('Player moved to square ', this.col, ', ', this.row);
};

// Move player to game square col, row
// Player x and y position will be calculated by 'update'
Player.prototype.move = function (col, row) {
  this.col = col;
  this.row = row;
};

// Handle player input by updating game square col or row
// Player x and y position will be calculated by 'update'
Player.prototype.handleInput = function (playerInput) {
  var numRows = 6;
  var numCols = 5;
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
