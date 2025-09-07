// ===== Sounds =====
const duckSound = new Audio('assets/duck-sound.mpeg');
const levelSound = new Audio('assets/jaws-theme.mp3');
levelSound.loop = true;

// ===== Buttons =====
const musicButton = document.getElementById('music-button');
const aboutButton = document.getElementById('about-me-button');
const duckButton = document.getElementById('duck-button');
const playButton = document.getElementById('play-btn');

// ===== Mobile buttons =====
const mobileButtons = ['up-btn', 'down-btn', 'left-btn', 'right-btn'];

// Hide all buttons at start
[musicButton, aboutButton, duckButton].forEach(b => b.style.display = 'none');
mobileButtons.forEach(id => document.getElementById(id).style.display = 'none');

// ===== States =====
let musicOn = true;
let duckOn = true;

// ===== Music Button =====
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

// ===== Duck Mode Button =====
duckButton.addEventListener('click', () => {
  if (duckOn) duckButton.src = 'assets/duck-off.png';
  else duckButton.src = 'assets/duck-on.png';
  duckOn = !duckOn;
});

// ===== Play Button =====
let gameInstance = null;
playButton.addEventListener('click', () => {
  document.getElementById('cover-screen').style.display = 'none';
  gameInstance = new Game();

  // Show main buttons
  musicButton.style.display = "block";
  aboutButton.style.display = "flex";
  duckButton.style.display = "block";

  // Show mobile controls
  mobileButtons.forEach(id => document.getElementById(id).style.display = 'block');

  if (musicOn) levelSound.play();
});

// ===== Emoji cursor =====
document.addEventListener("mousemove", (e) => {
  const emojiCursor = document.getElementById("emoji-cursor");
  if (emojiCursor) {
    emojiCursor.style.left = `${e.clientX}px`;
    emojiCursor.style.top = `${e.clientY}px`;
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
    this.element.src = 'assets/shark.gif';
    this.element.classList.add('shark');
    this.updatePosition();
  }

  move(event) {
    if (event.key === 'ArrowRight') { this.x += this.speed; this.element.style.transform = 'scaleX(1)'; }
    if (event.key === 'ArrowLeft') { this.x -= this.speed; this.element.style.transform = 'scaleX(-1)'; }
    if (event.key === 'ArrowUp') this.y -= this.speed;
    if (event.key === 'ArrowDown') this.y += this.speed;

    // Container dimensions
    const containerWidth = this.element.parentElement.clientWidth;
    const containerHeight = this.element.parentElement.clientHeight;

    // Reaparece por el lado contrario si sale
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

// ===== Duck class =====
class Duck {
  constructor() {
    this.width = 40; this.height = 40;
    const container = document.getElementById('game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    this.x = Math.random() * (containerWidth - this.width);
    this.y = Math.random() * (containerHeight - this.height);

    this.element = document.createElement('img');
    this.element.src = 'assets/duck.png';
    this.element.classList.add('duck');
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
    this.container.appendChild(this.character.element);

    this.allDucks = [];
    this.visibleDucks = [];
    this.ducksEatenThisLevel = 0; 
    this.spawnRepeats = 0;

    this.startLevel();
    this.addEvents();
    this.addMobileControls();
    this.moveBackground();
  }

  startLevel() {
    this.visibleDucks.forEach(d => this.container.removeChild(d.element));
    this.allDucks = [];
    this.visibleDucks = [];
    this.ducksEatenThisLevel = 0;
    this.spawnRepeats = 0;

    const totalDucks = 3 + this.level * 2;
    this.maxVisible = Math.min(5 + this.level - 1, totalDucks);

    for (let i = 0; i < totalDucks; i++) {
      const d = new Duck();
      d.startFloating();
      this.allDucks.push(d);
    }

    this.visibleDucks = this.allDucks.splice(0, this.maxVisible);
    this.visibleDucks.forEach(d => this.container.appendChild(d.element));

    this.timeLeft = 21;
    this.showTimer();
  }

  showTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.scoreElement.textContent = `Level: ${this.level} | Points: ${this.score} | Time: ${this.timeLeft}`;
      if (this.timeLeft <= 10) this.scoreElement.classList.add('warning');
      else this.scoreElement.classList.remove('warning');

      if (this.timeLeft <= 0) { clearInterval(this.timer); this.showGameOver(); }
    }, 1000);
  }

  checkCollisions() {
    this.visibleDucks.forEach((duck, index) => {
      if (this.character.collidesWith(duck)) {
        if (duckOn) { duckSound.currentTime = 0; duckSound.play(); }

        const redDot = document.createElement('div');
        redDot.classList.add('red-dot');
        redDot.style.left = `${duck.x + duck.width / 2 - 15}px`;
        redDot.style.top = `${duck.y + duck.height / 2 - 15}px`;
        this.container.appendChild(redDot);
        setTimeout(() => this.container.removeChild(redDot), 200);

        duck.element.classList.add('eaten');
        setTimeout(() => this.container.removeChild(duck.element), 200);

        this.score += 10;
        this.visibleDucks.splice(index, 1);

        this.ducksEatenThisLevel++;

        if (this.spawnRepeats < 3 && this.allDucks.length > 0) {
          const ducksToSpawn = Math.min(this.level, this.allDucks.length);
          for (let i = 0; i < ducksToSpawn; i++) {
            const nextDuck = this.allDucks.splice(Math.floor(Math.random() * this.allDucks.length), 1)[0];
            this.visibleDucks.push(nextDuck);
            this.container.appendChild(nextDuck.element);
            nextDuck.startFloating();
          }
          this.spawnRepeats++;
        }

        if (this.visibleDucks.length === 0 && this.allDucks.length === 0) {
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

    ['up','down','left','right'].forEach(dir => {
      const btn = document.getElementById(dir+'-btn');
      btn.addEventListener('mousedown', () => startMoving(dir));
      btn.addEventListener('mouseup', () => stopMoving(dir));
      btn.addEventListener('mouseleave', () => stopMoving(dir));
      btn.addEventListener('touchstart', (e)=>{e.preventDefault(); startMoving(dir)});
      btn.addEventListener('touchend', () => stopMoving(dir));
    });
  }

  moveBackground() {
    let offset = 0;
    setInterval(() => { offset -= 1; this.container.style.backgroundPosition = `${offset}px 0`; }, 50);
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
    img.src = 'assets/game-over.png';
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
    img.src = 'assets/next-level.png';
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
  }
}
