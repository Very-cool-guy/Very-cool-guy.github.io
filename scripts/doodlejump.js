document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("doodle-board");
  const ctx = canvas.getContext("2d");
  const scoreText = document.getElementById("score");
  const stateText = document.getElementById("game-state");
  const startButton = document.getElementById("start-game");
  const leftButton = document.getElementById("move-left");
  const rightButton = document.getElementById("move-right");

  const board = {
    width: canvas.width,
    height: canvas.height,
  };

  const player = {
    width: 70,
    height: 68,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  };

  const platformSize = {
    width: 85,
    height: 15,
  };

  const physics = {
    gravity: 0.42,
    jump: -11.2,
    moveSpeed: 5.2,
    scrollLine: 230,
  };

  const controls = {
    left: false,
    right: false,
  };

  const images = {};
  const platforms = [];
  let animationId = null;
  let lastTime = 0;
  let climb = 0;
  let running = false;
  let ready = false;
  let gameOver = false;

  function loadImage(name, src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        images[name] = image;
        resolve();
      };
      image.onerror = reject;
      image.src = src;
    });
  }

  function randomPlatformX() {
    return Math.random() * (board.width - platformSize.width);
  }

  function resetGame() {
    platforms.length = 0;
    climb = 0;
    gameOver = false;
    player.x = (board.width - player.width) / 2;
    player.y = board.height - 130;
    player.vx = 0;
    player.vy = physics.jump;

    for (let i = 0; i < 8; i += 1) {
      platforms.push({
        x: randomPlatformX(),
        y: board.height - 40 - i * 75,
      });
    }

    platforms[0].x = player.x + 4;
    setScore(0);
    setState("Playing");
    startButton.textContent = "Restart";
  }

  function setState(value) {
    stateText.textContent = value;
  }

  function setScore(value) {
    scoreText.textContent = String(value);
  }

  function applyControls() {
    if (controls.left && !controls.right) {
      player.vx = -physics.moveSpeed;
    } else if (controls.right && !controls.left) {
      player.vx = physics.moveSpeed;
    } else {
      player.vx *= 0.82;
    }
  }

  function movePlayer() {
    applyControls();
    player.x += player.vx;
    player.vy += physics.gravity;
    player.y += player.vy;

    if (player.x + player.width < 0) {
      player.x = board.width;
    } else if (player.x > board.width) {
      player.x = -player.width;
    }
  }

  function landOnPlatforms(previousBottom) {
    if (player.vy < 0) {
      return;
    }

    const playerBottom = player.y + player.height;
    const playerRight = player.x + player.width;

    platforms.forEach((platform) => {
      const wasAbove = previousBottom <= platform.y + 6;
      const isCrossing = playerBottom >= platform.y && playerBottom <= platform.y + platformSize.height + 12;
      const overlaps = playerRight >= platform.x && player.x <= platform.x + platformSize.width;

      if (wasAbove && isCrossing && overlaps) {
        player.y = platform.y - player.height;
        player.vy = physics.jump;
      }
    });
  }

  function scrollWorld() {
    if (player.y >= physics.scrollLine) {
      return;
    }

    const shift = physics.scrollLine - player.y;
    player.y = physics.scrollLine;
    climb += shift;
    setScore(Math.floor(climb / 10));

    platforms.forEach((platform) => {
      platform.y += shift;
    });

    recyclePlatforms();
  }

  function recyclePlatforms() {
    platforms.forEach((platform) => {
      if (platform.y > board.height) {
        const highest = Math.min(...platforms.map((item) => item.y));
        platform.y = highest - (62 + Math.random() * 48);
        platform.x = randomPlatformX();
      }
    });
  }

  function endGame() {
    running = false;
    gameOver = true;
    setState("Game Over");
    startButton.textContent = "Restart";
    cancelAnimationFrame(animationId);
    draw();
  }

  function update(delta) {
    const previousBottom = player.y + player.height;
    const steps = Math.max(1, Math.min(3, Math.round(delta / 16)));

    for (let i = 0; i < steps; i += 1) {
      movePlayer();
      landOnPlatforms(previousBottom);
      scrollWorld();
    }

    if (player.y > board.height) {
      endGame();
    }
  }

  function drawBackground() {
    ctx.drawImage(images.background, 0, 0, board.width, board.height);
  }

  function drawPlatforms() {
    platforms.forEach((platform) => {
      ctx.drawImage(
        images.platform,
        platform.x,
        platform.y,
        platformSize.width,
        platformSize.height
      );
    });
  }

  function drawPlayer() {
    ctx.drawImage(images.doodler, player.x, player.y, player.width, player.height);
  }

  function drawOverlay(title) {
    ctx.save();
    ctx.fillStyle = "rgba(19, 38, 22, 0.68)";
    ctx.fillRect(0, 0, board.width, board.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 34px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, board.width / 2, board.height / 2);
    ctx.restore();
  }

  function draw() {
    drawBackground();
    drawPlatforms();
    drawPlayer();

    if (!running && !gameOver) {
      drawOverlay("Doodle Jump");
    } else if (gameOver) {
      drawOverlay("Game Over");
    }
  }

  function loop(time) {
    if (!running) {
      return;
    }

    const delta = time - lastTime;
    lastTime = time;
    update(delta);
    draw();
    animationId = requestAnimationFrame(loop);
  }

  function startGame() {
    resetGame();
    running = true;
    lastTime = performance.now();
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(loop);
  }

  function setControl(direction, active) {
    controls[direction] = active;
  }

  function bindHoldButton(button, direction) {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      setControl(direction, true);
    });

    button.addEventListener("pointerup", () => setControl(direction, false));
    button.addEventListener("pointercancel", () => setControl(direction, false));
    button.addEventListener("lostpointercapture", () => setControl(direction, false));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
      event.preventDefault();
      setControl("left", true);
    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
      event.preventDefault();
      setControl("right", true);
    }

    if ((event.key === " " || event.key === "Enter") && ready && !running) {
      event.preventDefault();
      startGame();
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
      setControl("left", false);
    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
      setControl("right", false);
    }
  });

  bindHoldButton(leftButton, "left");
  bindHoldButton(rightButton, "right");
  startButton.addEventListener("click", startGame);

  Promise.all([
    loadImage("background", "resources/doodlejump/background.png"),
    loadImage("doodler", "resources/doodlejump/doodler-guy.png"),
    loadImage("platform", "resources/doodlejump/platform.png"),
  ])
    .then(() => {
      ready = true;
      resetGame();
      running = false;
      setState("Ready");
      startButton.textContent = "Start";
      draw();
    })
    .catch(() => {
      setState("Asset Error");
      startButton.disabled = true;
    });
});
