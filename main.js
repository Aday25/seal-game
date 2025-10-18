// ===== Sounds =====
const codSound = new Audio('assets/bubble-pop.mp3');
const levelSound = new Audio('assets/underwater.mp3');
levelSound.loop = true;

// ===== States =====
let musicOn = true;
let codOn = true;
let gameInstance = null;

// ===== Mobile buttons =====
const mobileButtons = ['up-btn', 'down-btn', 'left-btn', 'right-btn'];

// ===== Main setup after DOM loaded =====
document.addEventListener('DOMContentLoaded', () => {
  // ===== Buttons =====
  const musicButton = document.getElementById('music-button');
  const aboutButton = document.getElementById('back-button');
  const codButton = document.getElementById('cod-button');
  const playButton = document.getElementById('play-btn');

  // Hide all buttons at start
  [musicButton, aboutButton, codButton].forEach(b => { if (b) b.style.display = 'none'; });
  mobileButtons.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.style.display = 'none';
  });

  // ===== Music Button =====
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

  // ===== Cod Mode Button =====
  if (codButton) {
    codButton.addEventListener('click', () => {
      if (codOn) codButton.src = 'assets/bubble-off.png';
      else codButton.src = 'assets/bubble-on.png';
      codOn = !codOn;
    });
  }

  // ===== Play Button =====
  if (playButton) {
    playButton.addEventListener('click', () => {
      const cover = document.getElementById('cover-screen');
      if (cover) cover.style.display = 'none';

      gameInstance = new Game();

      // Show main buttons
      if (musicButton) musicButton.style.display = "block";
      if (aboutButton) aboutButton.style.display = "flex";
      if (codButton) codButton.style.display = "block";

      // Show mobile controls
      mobileButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = 'block';
      });

      if (musicOn) levelSound.play();
    });
  }

  // ===== Play with Enter =====
  document.addEventListener("keydown", (event) => {
    const cover = document.getElementById("cover-screen");
    if (event.key === "Enter" && cover && cover.style.display !== "none") {
      if (playButton) playButton.click();
    }
  });

  // ===== Emoji cursor =====
  const emojiCursor = document.getElementById("emoji-cursor");
  if (emojiCursor) {
    document.addEventListener("mousemove", (e) => {
      emojiCursor.style.left = `${e.clientX}px`;
      emojiCursor.style.top = `${e.clientY}px`;
    });
  }
});

// ===== Character class =====
class Character {
  constructor() {
    this.x = 50;
    this.y = 300;
    this.width = 80;
    this.height = 80;
    this.speed = 10;

    this.element = document.createElement('img');
    this.element.src = 'assets/seal.gif';
    this.element.classList.add('seal');
    this.updatePosition();
  }

  move(event) {
    if (event.key === 'ArrowRight') { this.x += this.speed; this.element.style.transform = 'scaleX(1)'; }
    if (event.key === 'ArrowLeft') { this.x -= this.speed; this.element.style.transform = 'scaleX(-1)'; }
    if (event.key === 'ArrowUp') this.y -= this.speed;
    if (event.key === 'ArrowDown') this.y += this.speed;

    const containerWidth = this.element.parentElement.clientWidth;
    const containerHeight = this.element.parentElement.clientHeight;

    if (this.x + this.width < 0) this.x = containerWidth;
    if (this.x > containerWidth) this.x = -this.width;
    if (this.y + this.height < 0) this.y = containerHeight;
    if (this.y > containerHeight) this.y = -this.height;

    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
    this.element.style.position = 'absolute';
  }

  collidesWith(obj) {
    return (this.x < obj.x + obj.width &&
      this.x + this.width > obj.x &&
      this.y < obj.y + obj.height &&
      this.y + this.height > obj.y);
  }
}

// ===== Cod class =====
class Cod {
  constructor() {
    this.width = 40; this.height = 40;
    const container = document.getElementById('game-container');
    const containerWidth = container ? container.clientWidth : 800;
    const containerHeight = container ? container.clientHeight : 600;

    this.x = Math.random() * (containerWidth - this.width);
    this.y = Math.random() * (containerHeight - this.height);

    this.element = document.createElement('img');
    this.element.src = 'assets/cod.png';
    this.element.classList.add('Cod');
    this.updatePosition();
  }

  updatePosition() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
    this.element.style.position = 'absolute';
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
  }

  startFloating() {
    setInterval(() => {
      this.y += Math.sin(Date.now() / 200) * 0.7;
      this.updatePosition();
    }, 50);
  }
}

// ===== Game class =====
class Game {
  constructor() {
    this.container = document.getElementById('game-container');
    this.scoreElement = document.getElementById('puntos');
    this.level = 1;
    this.score = 0;
    this.timeLeft = 21;

    this.character = new Character();
    if (this.container) this.container.appendChild(this.character.element);

    this.allCods = [];
    this.visibleCods = [];
    this.codsEatenThisLevel = 0;
    this.spawnRepeats = 0;

    this.startLevel();
    this.addEvents();
    this.addMobileControls();
    this.moveBackground();
  }

  startLevel() {
    this.visibleCods.forEach(d => { if (this.container && d.element.parentElement) this.container.removeChild(d.element); });
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
    this.visibleCods.forEach(d => { if (this.container) this.container.appendChild(d.element); });

    this.timeLeft = 21;
    this.showTimer();
  }

  showTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.scoreElement) {
        this.timeLeft--;
        this.scoreElement.textContent = `Level: ${this.level} | Points: ${this.score} | Time: ${this.timeLeft}`;
        if (this.timeLeft <= 10) this.scoreElement.classList.add('warning');
        else this.scoreElement.classList.remove('warning');

        if (this.timeLeft <= 0) { clearInterval(this.timer); this.showGameOver(); }
      }
    }, 1000);
  }

  checkCollisions() {
    this.visibleCods.forEach((Cod, index) => {
      if (this.character.collidesWith(Cod)) {
        if (codOn) { codSound.currentTime = 0; codSound.play(); }

        const redDot = document.createElement('div');
        redDot.classList.add('red-dot');
        redDot.style.left = `${Cod.x + Cod.width / 2 - 15}px`;
        redDot.style.top = `${Cod.y + Cod.height / 2 - 15}px`;
        if (this.container) this.container.appendChild(redDot);
        setTimeout(() => { if (this.container) this.container.removeChild(redDot); }, 200);

        Cod.element.classList.add('eaten');
        setTimeout(() => { if (this.container) this.container.removeChild(Cod.element); }, 200);

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

  addEvents() {
    window.addEventListener('keydown', e => { this.character.move(e); this.checkCollisions(); });
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
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); startMoving(dir) });
      btn.addEventListener('touchend', () => stopMoving(dir));
    });
  }

  moveBackground() {
    let offset = 0;
    setInterval(() => { if (this.container) { offset -= 1; this.container.style.backgroundPosition = `${offset}px 0`; } }, 50);
  }

  showGameOver() {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.left = '50%';
    overlay.style.top = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
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
    btn.textContent = 'Restart';
    btn.style.padding = '10px 20px';
    btn.style.border = 'none';
    btn.style.borderRadius = '10px';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => location.reload());
    overlay.appendChild(btn);

    this.container.appendChild(overlay);

    // === Permitir Restart con Enter ===
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        location.reload();
        document.removeEventListener("keydown", handleKeyDown);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
  }

  showNextLevel(callback) {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.left = '50%';
    overlay.style.top = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
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
    btn.textContent = 'Continue';
    btn.style.padding = '10px 20px';
    btn.style.border = 'none';
    btn.style.borderRadius = '10px';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      this.container.removeChild(overlay);
      if (callback) callback();
    });
    overlay.appendChild(btn);

    this.container.appendChild(overlay);

    // === Permitir Continue con Enter ===
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        this.container.removeChild(overlay);
        document.removeEventListener("keydown", handleKeyDown);
        if (callback) callback();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
  }
}
