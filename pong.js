// PONG
// USE 'A' and 'D' keys for the left paddle
// USE 'J' and 'L' keys for the right paddle
// USE 'P' for pause

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

const g_canvas = document.getElementById("myCanvas");
const g_ctx = g_canvas.getContext("2d");
const green = "#00FF00";
const image = document.getElementById("background");

/*
0        1         2         3         4         5         6         7         8         9
123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// =================
// KEYBOARD HANDLING
// =================

var g_keys = [];

function handleKeydown(evt) {
  g_keys[evt.keyCode] = true;
}

function handleKeyup(evt) {
  g_keys[evt.keyCode] = false;
}

// Inspects, and then clears, a key's state
function eatKey(keyCode) {
  var isDown = g_keys[keyCode];
  g_keys[keyCode] = false;
  return isDown;
}

window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);

// ============
// PADDLE STUFF
// ============

// COMMON PADDLE STUFF

// A generic contructor which accepts an arbitrary descriptor object
function Paddle(descr) {
  for (var property in descr) {
    this[property] = descr[property];
  }
}

Paddle.prototype.halfWidth = 10;
Paddle.prototype.halfHeight = 50;

Paddle.prototype.update = function () {
  if (g_keys[this.GO_UP]) {
    this.cy -= 5;

    // Stop paddles from moving up out of playfield
    if (this.cy < 50) {
      this.cy = 50;
    }
  }

  if (g_keys[this.GO_DOWN]) {
    this.cy += 5;

    // Stop paddles from moving down out of playfield
    if (this.cy > 350) {
      this.cy = 350;
    }
  }

  if (g_keys[this.GO_LEFT]) {
    this.cx -= 5;

    // Stop paddle 1 from moving left out of playfield
    if (this.cx < 10) {
      this.cx = 10;
    }
  }

  if (g_keys[this.GO_RIGHT]) {
    this.cx += 5;

    // Stop paddle 2 from moving right out of playfield
    if (this.cx > 390) {
      this.cx = 390;
    }
  }

  // move paddle 1 horizontally within 100 pixels of left edge
  if (g_paddle1.cx > 110) {
    g_paddle1.cx = 110;
  }

  // move paddle 2 horizontally within 100 pixels of right edge
  if (g_paddle2.cx < 290) {
    g_paddle2.cx = 290;
  }
};

Paddle.prototype.render = function (ctx) {
  // (cx, cy) is the centre; must offset it for drawing
  ctx.fillRect(
    this.cx - this.halfWidth,
    this.cy - this.halfHeight,
    this.halfWidth * 2,
    this.halfHeight * 2
  );
};

Paddle.prototype.collidesWith = function (prevX, prevY, nextX, nextY, r) {
  var paddleEdge = this.cx;
  // Check X coords
  if (
    (nextX - r < paddleEdge && prevX - r >= paddleEdge) ||
    (nextX + r > paddleEdge && prevX + r <= paddleEdge)
  ) {
    // Check Y coords
    if (
      nextY + r >= this.cy - this.halfHeight &&
      nextY - r <= this.cy + this.halfHeight
    ) {
      // It's a hit!
      return true;
    }
  }
  // It's a miss!
  return false;
};

// PADDLE 1

var KEY_W = "W".charCodeAt(0);
var KEY_S = "S".charCodeAt(0);
var KEY_A = "A".charCodeAt(0);
var KEY_D = "D".charCodeAt(0);
var KEY_J = "J".charCodeAt(0);
var KEY_L = "L".charCodeAt(0);

var g_paddle1 = new Paddle({
  cx: 30,
  cy: 100,

  GO_UP: KEY_W,
  GO_DOWN: KEY_S,
  GO_LEFT: KEY_A,
  GO_RIGHT: KEY_D,
});

// PADDLE 2

var KEY_I = "I".charCodeAt(0);
var KEY_K = "K".charCodeAt(0);

var g_paddle2 = new Paddle({
  cx: 370,
  cy: 300,

  GO_UP: KEY_I,
  GO_DOWN: KEY_K,
  GO_LEFT: KEY_J,
  GO_RIGHT: KEY_L,
});

// ==========
// BALL STUFF
// ==========

// COMMON BALL STUFF

// A generic contructor which accepts an arbitrary descriptor object
function Ball(descr) {
  for (var property in descr) {
    this[property] = descr[property];
  }
}

Ball.prototype.update = function () {
  // Remember my previous position
  var prevX = this.cx;
  var prevY = this.cy;

  // Compute my provisional new position (barring collisions)
  var nextX = prevX + this.xVel;
  var nextY = prevY + this.yVel;

  // Bounce off the paddles
  if (
    g_paddle1.collidesWith(prevX, prevY, nextX, nextY, this.radius) ||
    g_paddle2.collidesWith(prevX, prevY, nextX, nextY, this.radius)
  ) {
    this.xVel *= -1;
  }

  // Bounce off top and bottom edges
  if (
    nextY < 0 || // top edge
    nextY > g_canvas.height
  ) {
    // bottom edge
    this.yVel *= -1;
  }

  // Bounce off left edge
  if (nextX < 0) {
    this.xVel *= -1;
    scoreboard.player2Score += 1; // Player 2 scores!
  }

  // Bounce off right edge
  if (nextX > g_canvas.width) {
    this.xVel *= -1;
    scoreboard.player1Score += 1; // Player 1 scores!
  }

  // Reset if we fall off the left or right edges
  var margin = 4 * this.radius;
  if (nextX < -margin || nextX > g_canvas.width + margin) {
    this.reset();
  }

  // Update my position
  this.cx += this.xVel;
  this.cy += this.yVel;
};

Ball.prototype.reset = function () {
  this.cx = 300;
  this.cy = 100;
  this.xVel = -5;
  this.yVel = 4;
};

Ball.prototype.render = function (ctx) {
  fillCircle(ctx, this.cx, this.cy, this.radius);
};

var g_ball1 = new Ball({
  cx: 50,
  cy: 200,
  radius: 10,

  xVel: 5,
  yVel: 4,
});

var g_ball2 = new Ball({
  cx: 50,
  cy: 200,
  radius: 10,

  xVel: 5 / 2,
  yVel: 4 / 2,
});

// SCOREBOARD

var scoreboard = {
  player1Score: 0,
  player2Score: 0,
  render: function () {
    // Set scoreboard text
    g_ctx.font = "bold 40px Arial";
    g_ctx.fillStyle = green;
    g_ctx.fillText(`${this.player1Score}`, 120, 40);
    g_ctx.fillText(`${this.player2Score}`, 250, 40);
  },
};

// =====
// UTILS
// =====

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function fillCircle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// =============
// GATHER INPUTS
// =============

function gatherInputs() {}

// =================
// UPDATE SIMULATION
// =================

function updateSimulation() {
  if (shouldSkipUpdate()) return;

  g_ball1.update();
  g_ball2.update();
  g_paddle1.update();
  g_paddle2.update();
}

// Togglable Pause Mode
var KEY_PAUSE = "P".charCodeAt(0);
var KEY_STEP = "O".charCodeAt(0);

var g_isUpdatePaused = false;

function shouldSkipUpdate() {
  if (eatKey(KEY_PAUSE)) {
    g_isUpdatePaused = !g_isUpdatePaused;
  }
  return g_isUpdatePaused && !eatKey(KEY_STEP);
}

// =================
// RENDER SIMULATION
// =================

function renderSimulation(ctx) {
  clearCanvas(ctx);

  g_ctx.drawImage(image, 0, 0, g_canvas.width, g_canvas.height);
  g_ball1.render(ctx);
  g_ball2.render(ctx);
  scoreboard.render(ctx);
  g_paddle1.render(ctx);
  g_paddle2.render(ctx);
}

// ========
// MAINLOOP
// ========

function mainIter() {
  if (!requestedQuit()) {
    gatherInputs();
    updateSimulation();
    renderSimulation(g_ctx);
  } else {
    window.clearInterval(intervalID);
  }
}

// Simple voluntary quit mechanism
var KEY_QUIT = "Q".charCodeAt(0);
function requestedQuit() {
  return g_keys[KEY_QUIT];
}

// Requesting a recurring periodic
// "timer event" which is used as a kind of "heartbeat" for the game.
var intervalID = window.setInterval(mainIter, 16.666);

//window.focus();
