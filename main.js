// =======================
// ===== SOUNDS =====
// =======================
const codSound = new Audio('assets/bubble-pop.mp3');
const levelSound = new Audio('assets/underwater.mp3');
const screamSound = new Audio('assets/scream.mp3');
const startSound = new Audio('assets/start.mp3');
const liveSound = new Audio('assets/live.mp3');
levelSound.loop = true;

// =======================
// ===== STATES =====
// =======================
let musicOn = true;
let codOn = true;
let gameInstance = null;
let introPlayed = false;

// =======================
// ===== MOBILE BUTTONS =====
// =======================
const mobileButtons = ['up-btn', 'down-btn', 'left-btn', 'right-btn'];

// =======================
// ===== MAIN SETUP =====
// =======================
document.addEventListener('DOMContentLoaded', () => {

  const musicButton = document.getElementById('music-button');
  const aboutButton = document.getElementById('back-button');
  const codButton = document.getElementById('cod-button');
  const playButton = document.getElementById('play-btn');

  // Ocultamos botones iniciales
  [musicButton, aboutButton, codButton].forEach(b => { if (b) b.style.display = 'none'; });
  mobileButtons.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.style.display = 'none';
  });

  // Música ON/OFF
  if (musicButton) {
    musicButton.addEventListener('click', () => {
      if (musicOn) {
        levelSound.pause();
        musicButton.src = 'assets/audio-off.png';
      } else {
        levelSound.play();
        musicButton.src = 'assets/audio-on.png';
      }
      musicOn = !musicOn;
    });
  }

  // Burbujas ON/OFF
  if (codButton) {
    codButton.addEventListener('click', () => {
      codButton.src = codOn ? 'assets/bubble-off.png' : 'assets/bubble-on.png';
      codOn = !codOn;
    });
  }

  // Cursor emoji
  const emojiCursor = document.getElementById("emoji-cursor");
  if (emojiCursor) {
    emojiCursor.style.position = 'absolute';
    emojiCursor.style.pointerEvents = 'none';
    document.addEventListener("mousemove", e => {
      emojiCursor.style.left = `${e.clientX}px`;
      emojiCursor.style.top = `${e.clientY}px`;
    });
  }

  // Botón PLAY
  if (playButton) {
    playButton.addEventListener('click', () => {
      startSound.currentTime = 0;
      startSound.play();
      startGameFlow();
    });
  }

  // ENTER para PLAY
  document.addEventListener("keydown", (event) => {
    const cover = document.getElementById("cover-screen");
    if (event.key === "Enter" && cover && cover.style.display !== 'none') {
      startSound.currentTime = 0;
      startSound.play();
      startGameFlow();
    }
  });

  function startGameFlow() {
    const cover = document.getElementById('cover-screen');
    if (cover) cover.style.display = 'none';
    const container = document.getElementById('game-container');

    const startGame = () => {
      if (gameInstance) gameInstance.destroy();

      gameInstance = new Game();

      if (musicButton) musicButton.style.display = 'block';
      if (aboutButton) aboutButton.style.display = 'flex';
      if (codButton) codButton.style.display = 'block';
      mobileButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = 'block';
      });

      if (musicOn) levelSound.play();
    };

    if (!introPlayed) {
      const video = document.createElement('video');
      video.src = 'assets/intro.mp4';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.autoplay = true;
      video.controls = false;
      container.appendChild(video);

      const skipBtn = document.createElement('button');
      skipBtn.textContent = 'SKIP (ENTER)';
      skipBtn.style.position = 'absolute';
      skipBtn.style.left = '50%';
      skipBtn.style.top = '85%';
      skipBtn.style.transform = 'translate(-50%,-50%)';
      skipBtn.style.padding = '10px 20px';
      skipBtn.style.fontSize = '16px';
      skipBtn.style.cursor = 'pointer';
      skipBtn.style.zIndex = '50';
      skipBtn.style.display = 'none';
      container.appendChild(skipBtn);

      const startBtn = document.createElement('button');
      startBtn.textContent = 'START';
      startBtn.style.position = 'absolute';
      startBtn.style.left = '50%';
      startBtn.style.top = '90%';
      startBtn.style.transform = 'translate(-50%,-50%)';
      startBtn.style.padding = '10px 20px';
      startBtn.style.fontSize = '16px';
      startBtn.style.cursor = 'pointer';
      startBtn.style.display = 'none';
      container.appendChild(startBtn);

      const skipAndStart = () => {
        startSound.currentTime = 0;
        startSound.play();
        video.remove();
        skipBtn.remove();
        startBtn.remove();
        introPlayed = true;
        startGame();
      };

      video.addEventListener('ended', () => {
        skipBtn.style.display = 'none';
        startBtn.style.display = 'block';
      });

      video.addEventListener('play', () => {
        skipBtn.style.display = 'block';
      });

      skipBtn.addEventListener('click', skipAndStart);
      startBtn.addEventListener('click', skipAndStart);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && video.parentElement) {
          skipAndStart();
        }
      }, { once: true });
    } else {
      startGame();
    }
  }
});

// =======================
// ===== CHARACTER =====
// =======================
class Character {
  constructor() {
    this.x = 50;
    this.y = 300;
    this.width = 80;
    this.height = 80;
    this.speed = 10;

    this.element = document.createElement('img');
    this.element.src = 'assets/seal.gif';
    this.element.style.height = '80px';
    this.element.style.position = 'absolute';

    this.updatePosition();
  }

  move(event) {
    if (event.key === 'ArrowRight') { this.x += this.speed; this.element.style.transform = 'scaleX(1)'; }
    if (event.key === 'ArrowLeft') { this.x -= this.speed; this.element.style.transform = 'scaleX(-1)'; }
    if (event.key === 'ArrowUp') this.y -= this.speed;
    if (event.key === 'ArrowDown') this.y += this.speed;

    const cw = this.element.parentElement.clientWidth;
    const ch = this.element.parentElement.clientHeight;

    if (this.x + this.width < 0) this.x = cw;
    if (this.x > cw) this.x = -this.width;
    if (this.y + this.height < 0) this.y = ch;
    if (this.y > ch) this.y = -this.height;

    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  collidesWith(obj) {
    return (this.x < obj.x + obj.width && this.x + this.width > obj.x &&
      this.y < obj.y + obj.height && this.y + this.height > obj.y);
  }
}

// =======================
// ===== COD =====
// =======================
class Cod {
  constructor() {
    this.width = 40;
    this.height = 40;

    const container = document.getElementById('game-container');
    const cw = container ? container.clientWidth : 800;
    const ch = container ? container.clientHeight : 600;

    this.x = Math.random() * (cw - this.width);
    this.y = Math.random() * (ch - this.height);

    this.element = document.createElement('img');
    this.element.src = 'assets/cod.png';
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.position = 'absolute';

    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  startFloating() {
    this.interval = setInterval(() => {
      this.y += Math.sin(Date.now() / 200) * 0.7;
      this.updatePosition();
    }, 50);
  }

  stopFloating() {
    clearInterval(this.interval);
  }
}

// =======================
// ===== PLASTIC =====
// =======================
class Plastic {
  constructor(container) {
    this.container = container;
    this.width = 50;
    this.height = 35;
    this.x = container.clientWidth + Math.random() * 200;
    this.y = Math.random() * (container.clientHeight - this.height);
    this.speed = 1;
    this.hit = false;

    this.element = document.createElement('img');
    this.element.src = 'assets/plastic.png';
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.position = 'absolute';

    container.appendChild(this.element);
    this.updatePosition();
  }

  updatePosition() {
    this.x -= this.speed;
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  checkBounds() {
    if (this.x + this.width < 0) {
      this.x = this.container.clientWidth + Math.random() * 200;
      this.hit = false;
    }
  }
}

// =======================
// ===== OBSTACLE / HEART =====
// =======================
class Obstacle {
  constructor(container, type) {
    this.container = container;
    this.type = type;
    this.width = 50;
    this.height = 50;
    this.x = Math.random() * (container.clientWidth - 50);
    this.y = -50;
    this.speed = 1 + Math.random() * 1.5;

    this.element = document.createElement('img');
    this.element.src = `assets/${type}.png`;
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.position = 'absolute';

    container.appendChild(this.element);
  }

  updatePosition() {
    this.y += this.speed;
    this.element.style.top = `${this.y}px`;
    this.element.style.left = `${this.x}px`;
  }

  offScreen() {
    return this.y > this.container.clientHeight;
  }
}

class Heart {
  constructor(container) {
    this.container = container;
    this.width = 40;
    this.height = 40;
    this.x = Math.random() * (container.clientWidth - 40);
    this.y = Math.random() * (container.clientHeight - 40);
    this.duration = 10000;
    this.createdAt = Date.now();
    this.isFixed = true;

    this.element = document.createElement('img');
    this.element.src = 'assets/heart.png';
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.position = 'absolute';
    this.element.style.animation = 'heartPulse 0.6s infinite';

    container.appendChild(this.element);
    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  isExpired() {
    return Date.now() - this.createdAt > this.duration;
  }
}

// =======================
// ===== EFFECT PARTICLE =====
// =======================
class EffectParticle {
  constructor(x, y, container, color) {
    this.x = x;
    this.y = y;
    this.container = container;
    this.color = color;
    this.createdAt = Date.now();
    this.duration = 500;

    this.element = document.createElement('div');
    this.element.style.position = 'absolute';
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    this.element.style.width = '50px';
    this.element.style.height = '50px';
    this.element.style.borderRadius = '50%';
    this.element.style.border = `3px solid ${color}`;
    this.element.style.pointerEvents = 'none';
    this.element.style.animation = `expandAndFade 0.5s ease-out`;

    container.appendChild(this.element);
  }

  isExpired() {
    return Date.now() - this.createdAt > this.duration;
  }
}

// =======================
// ===== GAME CLASS =====
// =======================
class Game {
  constructor() {
    this.container = document.getElementById('game-container');
    this.scoreElement = document.getElementById('puntos');

    this.level = 1;
    this.score = 0;
    this.timeLeft = 21;
    this.lives = 6;

    this.character = new Character();
    this.container.appendChild(this.character.element);

    this.allCods = [];
    this.visibleCods = [];
    this.plastics = [];
    this.obstacles = [];
    this.hearts = [];
    this.effects = [];
    this.loopActive = true;
    this.loopRunning = false;

    this.initLivesContainer();
    this.updateLives();

    for (let i = 0; i < 2; i++) this.plastics.push(new Plastic(this.container));

    this.addAnimationStyles();
    this.startLevel();
    this.addEvents();
    this.addMobileControls();
    this.moveBackground();
    this.startGameLoop();

    this.heartTimer = setInterval(() => {
      if (this.lives < 6 && Math.random() < 0.15)
        this.hearts.push(new Heart(this.container));
    }, 10000);
  }

  destroy() {
    this.loopActive = false;
    clearInterval(this.heartTimer);
    clearInterval(this.timer);
    if (this.bgInterval) clearInterval(this.bgInterval);
    this.container.innerHTML = '';
  }

  addAnimationStyles() {
    if (!document.getElementById('game-animations')) {
      const style = document.createElement('style');
      style.id = 'game-animations';
      style.textContent = `
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes expandAndFade {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .eaten {
          animation: fadeOut 0.3s ease-out forwards;
        }
        @keyframes fadeOut {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.3);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // =======================
  // ===== LIVES =====
  // =======================
  initLivesContainer() {
    this.livesContainer = document.getElementById('lives-container');
    if (!this.livesContainer) {
      this.livesContainer = document.createElement('div');
      this.livesContainer.id = 'lives-container';
      this.livesContainer.style.display = 'flex';
      this.livesContainer.style.justifyContent = 'center';
      this.livesContainer.style.gap = '10px';
      this.livesContainer.style.marginBottom = '10px';
      this.container.parentElement.insertBefore(this.livesContainer, this.container);
    }
  }

  updateLives() {
    this.livesContainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const img = document.createElement('img');
      img.src = i < this.lives ? 'assets/live.png' : 'assets/dead.png';
      img.style.width = '40px';
      img.style.height = '40px';
      this.livesContainer.appendChild(img);
    }
  }

  // =======================
  // ===== GAME LOOP =====
  // =======================
  startGameLoop() {
    if (this.loopRunning) return;
    this.loopRunning = true;
    this._rafId = null;

    const loop = () => {
      if (!this.loopActive) {
        this.loopRunning = false;
        if (this._rafId) cancelAnimationFrame(this._rafId);
        return;
      }

      // ===== MOVER PLÁSTICOS =====
      this.plastics.forEach(p => {
        p.updatePosition();
        p.checkBounds();
        if (this.character.collidesWith(p) && !p.hit) {
          this.lives--;
          this.updateLives();
          this.createEffect(this.character.x + 40, this.character.y + 40, '#7B2CBF');
          screamSound.currentTime = 0;
          screamSound.play();
          p.hit = true;
          if (this.lives <= 0) {
            this.loopActive = false;
            this.showGameOver();
          }
        }
      });

      // ===== GENERAR OBSTÁCULOS =====
      if (Math.random() < 0.01 + 0.002 * this.level) {
        const type = Math.random() < 0.5 ? 'bottle' : 'can';
        this.obstacles.push(new Obstacle(this.container, type));
      }

      // ===== MOVER OBSTÁCULOS =====
      this.obstacles.forEach((o, i) => {
        o.updatePosition();
        if (this.character.collidesWith(o)) {
          this.lives--;
          this.updateLives();
          this.createEffect(this.character.x + 40, this.character.y + 40, '#7B2CBF');
          screamSound.currentTime = 0;
          screamSound.play();
          if (o.element.parentElement) o.element.remove();
          this.obstacles.splice(i, 1);
          if (this.lives <= 0) {
            this.loopActive = false;
            this.showGameOver();
          }
        } else if (o.offScreen()) {
          if (o.element.parentElement) o.element.remove();
          this.obstacles.splice(i, 1);
        }
      });

      // ===== MOVER CORAZONES =====
      this.hearts.forEach((h, i) => {
        if (this.character.collidesWith(h)) {
          if (this.lives < 6) this.lives++;
          this.createEffect(h.x + 20, h.y + 20, '#00FF00');
          this.updateLives();
          if (h.element.parentElement) h.element.remove();
          this.hearts.splice(i, 1);
        } else if (h.isExpired()) {
          if (h.element.parentElement) h.element.remove();
          this.hearts.splice(i, 1);
        }
      });

      // ===== LIMPIAR EFECTOS =====
      this.effects.forEach((e, i) => {
        if (e.isExpired()) {
          if (e.element.parentElement) e.element.remove();
          this.effects.splice(i, 1);
        }
      });

      // ===== VERIFICAR PECES =====
      this.checkCollisions();

      this._rafId = requestAnimationFrame(loop);
    };

    loop();
  }

  createEffect(x, y, color) {
    this.effects.push(new EffectParticle(x, y, this.container, color));
  }

  // =======================
  // ===== NIVELES =====
  // =======================
  startLevel() {
    this.visibleCods.forEach(d => {
      if (this.container && d.element.parentElement)
        this.container.removeChild(d.element);
    });

    this.allCods = [];
    this.visibleCods = [];
    this.codsEatenThisLevel = 0;
    this.spawnRepeats = 0;

    const totalCods = 3 + this.level * 2;
    this.maxVisible = Math.min(5 + this.level - 1, totalCods);

    for (let i = 0; i < totalCods; i++) {
      const d = new Cod();
      d.startFloating();
      this.allCods.push(d);
    }

    this.visibleCods = this.allCods.splice(0, this.maxVisible);
    this.visibleCods.forEach(d => {
      if (this.container) this.container.appendChild(d.element);
    });

    this.timeLeft = 21;
    this.showTimer();
  }

  // =======================
  // ===== TIMER =====
  // =======================
  showTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (!this.scoreElement) return;

      this.timeLeft--;
      this.scoreElement.textContent = `Level: ${this.level} | Points: ${this.score} | Time: ${this.timeLeft}`;

      if (this.timeLeft <= 10) this.scoreElement.classList.add('warning');
      else this.scoreElement.classList.remove('warning');

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.showGameOver();
      }
    }, 1000);
  }

  // =======================
  // ===== COLISIONES =====
  // =======================
  checkCollisions() {
    this.visibleCods.forEach((Cod, index) => {
      if (this.character.collidesWith(Cod)) {
        if (codOn) {
          codSound.currentTime = 0;
          codSound.play();
        }

        this.createEffect(Cod.x + 20, Cod.y + 20, '#00FF00');
        Cod.element.classList.add('eaten');
        setTimeout(() => {
          if (this.container && Cod.element.parentElement)
            this.container.removeChild(Cod.element);
        }, 200);

        this.score += 10;
        this.visibleCods.splice(index, 1);
        this.codsEatenThisLevel++;

        if (this.spawnRepeats < 3 && this.allCods.length > 0) {
          const codsToSpawn = Math.min(this.level, this.allCods.length);
          for (let i = 0; i < codsToSpawn; i++) {
            const nextCod = this.allCods.splice(Math.floor(Math.random() * this.allCods.length), 1)[0];
            this.visibleCods.push(nextCod);
            if (this.container) this.container.appendChild(nextCod.element);
            nextCod.startFloating();
          }
          this.spawnRepeats++;
        }

        if (this.visibleCods.length === 0 && this.allCods.length === 0) {
          clearInterval(this.timer);
          this.level++;
          this.showNextLevel(() => this.startLevel());
        }
      }
    });
  }

  // =======================
  // ===== CONTROLES =====
  // =======================
  addEvents() {
    window.addEventListener('keydown', e => {
      this.character.move(e);
      this.checkCollisions();
    });
  }

  addMobileControls() {
    const moveInterval = {};
    const startMoving = (dir) => {
      if (moveInterval[dir]) return;
      moveInterval[dir] = setInterval(() => {
        if (dir === 'up') this.character.y -= this.character.speed;
        if (dir === 'down') this.character.y += this.character.speed;
        if (dir === 'left') { this.character.x -= this.character.speed; this.character.element.style.transform = 'scaleX(-1)'; }
        if (dir === 'right') { this.character.x += this.character.speed; this.character.element.style.transform = 'scaleX(1)'; }
        this.character.updatePosition();
        this.checkCollisions();
      }, 50);
    };

    const stopMoving = (dir) => {
      clearInterval(moveInterval[dir]);
      moveInterval[dir] = null;
    };

    ['up', 'down', 'left', 'right'].forEach(dir => {
      const btn = document.getElementById(dir + '-btn');
      if (!btn) return;
      btn.addEventListener('mousedown', () => startMoving(dir));
      btn.addEventListener('mouseup', () => stopMoving(dir));
      btn.addEventListener('mouseleave', () => stopMoving(dir));
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); startMoving(dir); });
      btn.addEventListener('touchend', () => stopMoving(dir));
    });
  }

  // =======================
  // ===== FONDO =====
  // =======================
  moveBackground() {
    let offset = 0;
    this.bgInterval = setInterval(() => {
      if (this.container && this.loopActive) {
        offset -= 1;
        this.container.style.backgroundPosition = `${offset}px 0`;
      }
    }, 50);
  }

  // =======================
  // ===== GAME OVER =====
  // =======================
  showGameOver() {
    this.loopActive = false;
    clearInterval(this.heartTimer);
    clearInterval(this.bgInterval);
    clearInterval(this.timer);

    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.left = '50%';
    overlay.style.top = '50%';
    overlay.style.transform = 'translate(-50%,-50%)';
    overlay.style.width = '250px';
    overlay.style.padding = '20px';
    overlay.style.backgroundColor = 'red';
    overlay.style.borderRadius = '20px';
    overlay.style.textAlign = 'center';
    overlay.style.zIndex = '100';

    const img = document.createElement('img');
    img.src = 'assets/crying-seal.gif';
    img.style.width = '100%';
    img.style.height = 'auto';
    overlay.appendChild(img);

    const text = document.createElement('div');
    text.textContent = 'Game Over';
    text.style.color = 'white';
    text.style.fontSize = '20px';
    text.style.margin = '10px 0';
    overlay.appendChild(text);

    const btn = document.createElement('button');
    btn.textContent = 'Restart (ENTER)';
    btn.style.padding = '10px 20px';
    btn.style.border = 'none';
    btn.style.borderRadius = '10px';
    btn.style.cursor = 'pointer';

    const restartGame = () => {
      startSound.currentTime = 0;
      startSound.play();
      this.destroy();
      levelSound.pause();
      levelSound.currentTime = 0;
      introPlayed = true;
      new Game();
    };

    btn.addEventListener('click', restartGame);
    overlay.appendChild(btn);
    this.container.appendChild(overlay);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && overlay.parentElement) {
        restartGame();
      }
    }, { once: true });
  }

  // =======================
  // ===== NEXT LEVEL =====
  // =======================
  showNextLevel(callback) {
    this.loopActive = false;
    clearInterval(this.bgInterval);

    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.left = '50%';
    overlay.style.top = '50%';
    overlay.style.transform = 'translate(-50%,-50%)';
    overlay.style.width = '250px';
    overlay.style.padding = '20px';
    overlay.style.backgroundColor = 'green';
    overlay.style.borderRadius = '20px';
    overlay.style.textAlign = 'center';
    overlay.style.zIndex = '100';

    const img = document.createElement('img');
    img.src = 'assets/dancing-seal.gif';
    img.style.width = '100%';
    img.style.height = 'auto';
    overlay.appendChild(img);

    const text = document.createElement('div');
    text.textContent = 'Congratulations!';
    text.style.color = 'white';
    text.style.fontSize = '20px';
    text.style.margin = '10px 0';
    overlay.appendChild(text);

    const btn = document.createElement('button');
    btn.textContent = 'Continue (ENTER)';
    btn.style.padding = '10px 20px';
    btn.style.border = 'none';
    btn.style.borderRadius = '10px';
    btn.style.cursor = 'pointer';

    const continueGame = () => {
      startSound.currentTime = 0;
      startSound.play();
      if (overlay.parentElement) overlay.remove();
      this.loopActive = true;
      this.moveBackground();
      this.startGameLoop();
      this.timeLeft = 21;
      this.showTimer();
      if (callback) callback();
    };

    btn.addEventListener('click', continueGame);
    overlay.appendChild(btn);
    this.container.appendChild(overlay);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && overlay.parentElement) {
        continueGame();
      }
    }, { once: true });
  }
}