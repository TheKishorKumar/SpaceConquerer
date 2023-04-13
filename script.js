const stickman = document.querySelector(".stickman");
const gameContainer = document.querySelector(".game-container");
const scoreElement = document.getElementById("score");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScore = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");
const highScoreElement = document.getElementById("high-score");
const shootingCooldown = 100;

let lastBulletTime = 0;
let isGameOver = false;
let score = 0;
let leftPressed = false;
let rightPressed = false;

let difficultyLevel = 0;
let startTime = new Date().getTime();
let obstacleCount = 0;
let powerUpActive = false;
let scoreIncrement = 1;

function updateDifficulty(elapsedTime) {
  if (elapsedTime < 10000) {
    difficultyLevel = 1;
  } else if (elapsedTime < 20000) {
    difficultyLevel = 2;
  } else {
    difficultyLevel = 3;
  }
}


function gameLoop() {
  if (!isGameOver) {
    shootBullet(); // Add this line
    updateStickmanPosition();
    requestAnimationFrame(gameLoop);
  }
}


gameLoop();

function showLevel(level) {
  const levelText = document.createElement("div");
  levelText.textContent = `Level ${level}`;
  levelText.style.position = "absolute";
  levelText.style.top = "10px";
  levelText.style.right = "10px";
  levelText.style.fontSize = "24px";
  gameContainer.appendChild(levelText);

  setTimeout(() => {
    gameContainer.removeChild(levelText);
  }, 1500);
}




function updateStickmanPosition() {
  if (isGameOver) return;

  if (leftPressed) {
    moveStickman(-5); // Change from -10 to -5
  }
  if (rightPressed) {
    moveStickman(5); // Change from 10 to 5
  }
}


let wKeyDown = false;
let shootInterval;

document.addEventListener("keydown", (event) => {
  if (event.key === "a" || event.key === "A") {
    leftPressed = true;
  } else if (event.key === "d" || event.key === "D") {
    rightPressed = true;
  } else if ((event.key === "w" || event.key === "W") && !wKeyDown) {
    wKeyDown = true;
    shootInterval = setInterval(shootBullet, 100);
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "a" || event.key === "A") {
    leftPressed = false;
  } else if (event.key === "d" || event.key === "D") {
    rightPressed = false;
  } else if (event.key === "w" || event.key === "W") {
    wKeyDown = false;
    clearInterval(shootInterval);
  }
});




function moveStickman(distance) {
  if (isGameOver) return;

  const currentLeft = parseInt(
    getComputedStyle(stickman).getPropertyValue("left")
  );
  const newLeft = currentLeft + distance;
  if (newLeft >= 0 && newLeft <= gameContainer.clientWidth - stickman.clientWidth) {
    stickman.style.left = newLeft + "px";
  }
}

function shootBullet() {
  if (isGameOver) return;
  const currentTime = new Date().getTime();
  const currentCooldown = powerUpActive ? shootingCooldown / 2 : shootingCooldown;
  if (currentTime - lastBulletTime < currentCooldown) return;
  lastBulletTime = currentTime;

  const bullet = document.createElement("div");
  bullet.classList.add("bullet");
  bullet.style.left =
    parseInt(getComputedStyle(stickman).getPropertyValue("left")) +
    stickman.clientWidth / 2 +
    "px";
  bullet.style.bottom = getComputedStyle(stickman).getPropertyValue("height");
  gameContainer.appendChild(bullet);

  const moveBulletInterval = setInterval(() => {
    const currentBottom = parseInt(
      getComputedStyle(bullet).getPropertyValue("bottom")
    );
    const newBottom = currentBottom + 10;
    if (newBottom >= gameContainer.clientHeight) {
      gameContainer.removeChild(bullet);
      clearInterval(moveBulletInterval);
    } else {
      bullet.style.bottom = newBottom + "px";
      checkBulletCollision(bullet);
    }
  }, 1000 / 60);
}


function createPowerUp() {
  if (isGameOver) return;

  const powerUp = document.createElement("div");
  powerUp.classList.add("power-up");
  powerUp.style.left = Math.random() * (gameContainer.clientWidth - 20) + "px";
  gameContainer.appendChild(powerUp);

  const movePowerUpInterval = setInterval(() => {
    const currentTop = parseInt(
      getComputedStyle(powerUp).getPropertyValue("top")
    );
    const newTop = currentTop + 5;
    if (newTop >= gameContainer.clientHeight) {
      gameContainer.removeChild(powerUp);
      clearInterval(movePowerUpInterval);
    } else {
      powerUp.style.top = newTop + "px";
      checkPowerUpCollision(powerUp);
    }
  }, 1000 / 60);
}

function checkPowerUpCollision(powerUp) {
  const powerUpRect = powerUp.getBoundingClientRect();
  const stickmanBodyRect = stickman.querySelector(".stickman-body").getBoundingClientRect();
  const stickmanLeftLegRect = stickman.querySelector(".stickman-leg.left").getBoundingClientRect();
  const stickmanRightLegRect = stickman.querySelector(".stickman-leg.right").getBoundingClientRect();

  const isBodyColliding = (
    stickmanBodyRect.x < powerUpRect.x + powerUpRect.width &&
    stickmanBodyRect.x + stickmanBodyRect.width > powerUpRect.x &&
    stickmanBodyRect.y < powerUpRect.y + powerUpRect.height &&
    stickmanBodyRect.y + stickmanBodyRect.height > powerUpRect.y
  );

  const isLeftLegColliding = (
    stickmanLeftLegRect.x < powerUpRect.x + powerUpRect.width &&
    stickmanLeftLegRect.x + stickmanLeftLegRect.width > powerUpRect.x &&
    stickmanLeftLegRect.y < powerUpRect.y + powerUpRect.height &&
    stickmanLeftLegRect.y + stickmanLeftLegRect.height > powerUpRect.y
  );

  const isRightLegColliding = (
    stickmanRightLegRect.x < powerUpRect.x + powerUpRect.width &&
    stickmanRightLegRect.x + stickmanRightLegRect.width > powerUpRect.x &&
    stickmanRightLegRect.y < powerUpRect.y + powerUpRect.height &&
    stickmanRightLegRect.y + stickmanRightLegRect.height > powerUpRect.y
  );

  if (isBodyColliding || isLeftLegColliding || isRightLegColliding) {
    gameContainer.removeChild(powerUp);
    activatePowerUp();
  }
}

function activatePowerUp() {
  const duration = 5000;
  scoreIncrement = 2;
  scoreElement.style.color = "gold";
  
  setTimeout(() => {
    scoreIncrement = 1;
    scoreElement.style.color = "black";
  }, duration);
}





function checkBulletCollision(bullet) {
  const bulletRect = bullet.getBoundingClientRect();
  const obstacles = document.querySelectorAll(".obstacle");

  for (const obstacle of obstacles) {
    const obstacleRect = obstacle.getBoundingClientRect();

     if (
    bulletRect.x < obstacleRect.x + obstacleRect.width &&
    bulletRect.x + bulletRect.width > obstacleRect.x &&
    bulletRect.y < obstacleRect.y + obstacleRect.height &&
    bulletRect.y + bulletRect.height > obstacleRect.y
  ) {
    if (obstacle.classList.contains("obstacle-type-2")) {
      obstacle.hitsRemaining--;

      if (obstacle.hitsRemaining === 0) {
        gameContainer.removeChild(obstacle);
        score += 5 * scoreIncrement; // Change this line to use scoreIncrement
        scoreElement.textContent = score;
      }
    } else {
      gameContainer.removeChild(obstacle);
      score += 1 * scoreIncrement; // Change this line to use scoreIncrement
      scoreElement.textContent = score;
    }
    gameContainer.removeChild(bullet);
    break;
  }

  }
}



function createObstacle() {
  if (isGameOver) return;

  const horizontalSpeed = difficultyLevel === 3 ? Math.random() * 2 - 1 : 0;

  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");
  
  const currentLevel = Math.floor(obstacleCount / 10) + 1;
  const isObstacleType2 = Math.random() < (0.2 * currentLevel);

  if (isObstacleType2) {
    obstacle.classList.add("obstacle-type-2");
    obstacle.style.backgroundColor = "red";
    obstacle.style.width = "30px";
    obstacle.style.height = "30px";
    obstacle.style.borderRadius = "50%";
    obstacle.hitsRemaining = 3;
  } else {
    obstacle.style.backgroundColor = "green";
    obstacle.style.width = "20px";
    obstacle.style.height = "20px";
  }
  obstacle.style.left = Math.random() * (gameContainer.clientWidth - 10) + "px";
  gameContainer.appendChild(obstacle);

  const moveObstacleInterval = setInterval(() => {
    const currentTop = parseInt(
      getComputedStyle(obstacle).getPropertyValue("top")
    );
    const currentLeft = parseInt(
      getComputedStyle(obstacle).getPropertyValue("left")
    );
    const newTop = currentTop + 10;
    const newLeft = currentLeft + horizontalSpeed;

    if (newTop >= gameContainer.clientHeight) {
      gameContainer.removeChild(obstacle);
      clearInterval(moveObstacleInterval);
    } else {
      obstacle.style.top = newTop + "px";
      obstacle.style.left = newLeft + "px";
      checkObstacleCollision(obstacle);
    }
  }, 1000 / 30);
  obstacleCount++;
  if (obstacleCount % 10 === 0) {
    const currentLevel = obstacleCount / 10;
    showLevel(currentLevel);
  }
}




function checkObstacleCollision(obstacle) {
  const obstacleRect = obstacle.getBoundingClientRect();
  const stickmanBodyRect = stickman.querySelector(".stickman-body").getBoundingClientRect();
  const stickmanLeftLegRect = stickman.querySelector(".stickman-leg.left").getBoundingClientRect();
  const stickmanRightLegRect = stickman.querySelector(".stickman-leg.right").getBoundingClientRect();

  const isBodyColliding = (
    stickmanBodyRect.x < obstacleRect.x + obstacleRect.width &&
    stickmanBodyRect.x + stickmanBodyRect.width > obstacleRect.x &&
    stickmanBodyRect.y < obstacleRect.y + obstacleRect.height &&
    stickmanBodyRect.y + stickmanBodyRect.height > obstacleRect.y
  );

  const isLeftLegColliding = (
    stickmanLeftLegRect.x < obstacleRect.x + obstacleRect.width &&
    stickmanLeftLegRect.x + stickmanLeftLegRect.width > obstacleRect.x &&
    stickmanLeftLegRect.y < obstacleRect.y + obstacleRect.height &&
    stickmanLeftLegRect.y + stickmanLeftLegRect.height > obstacleRect.y
  );

  const isRightLegColliding = (
    stickmanRightLegRect.x < obstacleRect.x + obstacleRect.width &&
    stickmanRightLegRect.x + stickmanRightLegRect.width > obstacleRect.x &&
    stickmanRightLegRect.y < obstacleRect.y + obstacleRect.height &&
    stickmanRightLegRect.y + stickmanRightLegRect.height > obstacleRect.y
  );

  if (isBodyColliding || isLeftLegColliding || isRightLegColliding) {
    endGame();
  }
}


function updateScore() {
  if (isGameOver) return;

  score++;
  scoreElement.textContent = score;
}

function endGame() {
  isGameOver = true;
  finalScore.textContent = score;
  gameOverScreen.classList.remove("hidden");

  // Save high score to local storage
  let highScore = localStorage.getItem("highScore");
  if (!highScore || score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  highScoreElement.textContent = highScore;
}

restartButton.addEventListener("click", () => {
  location.reload();
});


setInterval(createPowerUp, 15000); // Create a power-up every 10 seconds

setInterval(createObstacle, 500);  // Create obstacles and update the score periodically.