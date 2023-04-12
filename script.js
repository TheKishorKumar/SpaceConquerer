const stickman = document.querySelector(".stickman");
const gameContainer = document.querySelector(".game-container");
const scoreElement = document.getElementById("score");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScore = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");
let isGameOver = false;
let score = 0;
let leftPressed = false;
let rightPressed = false;
let shootPressed = false;

function gameLoop() {
  if (!isGameOver) {
    updateStickmanPosition();
    requestAnimationFrame(gameLoop);
  }
}

gameLoop();





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


function updateShooting() {
  if (isGameOver) return;

  if (shootPressed) {
    shootBullet();
  }
}


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
          score += 5; // Change from 10 to 5 for red obstacles
          scoreElement.textContent = score;
        }
      } else {
        gameContainer.removeChild(obstacle);
        score += 1; // Change from 10 to 1 for normal obstacles
        scoreElement.textContent = score;
      }
      gameContainer.removeChild(bullet);
      break;
    }
  }
}



function createObstacle() {
  if (isGameOver) return;

  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");
  const isObstacleType2 = Math.random() < 0.2; // 20% chance to be obstacle 2

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
    const newTop = currentTop + 10;
    if (newTop >= gameContainer.clientHeight) {
      gameContainer.removeChild(obstacle);
      clearInterval(moveObstacleInterval);
    } else {
      obstacle.style.top = newTop + "px";
      checkObstacleCollision(obstacle);
    }
  }, 1000 / 30);
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
}

restartButton.addEventListener("click", () => {
  location.reload();
});

// Create obstacles and update the score periodically.
setInterval(updateShooting, 200);
setInterval(createObstacle, 500);