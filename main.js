// Sonidos
const duckSound = new Audio('assets/duck-sound.mpeg');
const levelSound = new Audio('assets/jaws-theme.mp3');
levelSound.loop = true;

// Botón de música (arriba a la derecha de la pantalla, fuera del juego)
const musicButton = document.createElement('img');
musicButton.src = 'assets/audio-on.png';
musicButton.style.width = '100px';
musicButton.style.height = '100px';
musicButton.style.cursor = 'pointer';
musicButton.style.position = 'fixed';
musicButton.style.top = '15px';
musicButton.style.right = '15px';
musicButton.style.zIndex = '2000'; // siempre encima
document.body.appendChild(musicButton);

let musicOn = true;
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

class Game {
  constructor() {
    this.container = document.getElementById("game-container");
    this.puntosElement = document.getElementById("puntos");
    this.level = 1;
    this.puntuacion = 0;
    this.timeLeft = 30;
    this.personaje = new Personaje();
    this.container.appendChild(this.personaje.element);

    this.todosPatitos = [];
    this.visiblePatitos = [];

    if (musicOn) levelSound.play();
    this.iniciarNivel();
    this.agregarEventos();
    this.moverFondo();
  }

  iniciarNivel() {
    this.visiblePatitos.forEach(p => this.container.removeChild(p.element));
    this.todosPatitos = [];
    this.visiblePatitos = [];

    const totalPatitos = 3 + this.level * 2; 
    this.maxVisible = Math.min(3 + this.level - 1, totalPatitos);

    for (let i = 0; i < totalPatitos; i++) {
      const p = new Patito();
      p.startFloating(); 
      this.todosPatitos.push(p);
    }

    this.visiblePatitos = this.todosPatitos.splice(0, this.maxVisible);
    this.visiblePatitos.forEach(patito => this.container.appendChild(patito.element));

    this.timeLeft = 30;
    this.mostrarTemporizador();
  }

  mostrarTemporizador() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.puntosElement.textContent = `Level: ${this.level} | Points: ${this.puntuacion} | Time: ${this.timeLeft}`;

      if (this.timeLeft <= 10) this.puntosElement.classList.add('warning');
      else this.puntosElement.classList.remove('warning');

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.showGameOver();
      }
    }, 1000);
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

  agregarEventos() {
    window.addEventListener("keydown", (e) => {
      this.personaje.mover(e);
      this.checkColisiones();
    });
  }

  checkColisiones() {
    this.visiblePatitos.forEach((patito, index) => {
      if (this.personaje.colisionaCon(patito)) {
        // Sonido del pato siempre
        duckSound.currentTime = 0;
        duckSound.play();

        const redDot = document.createElement("div");
        redDot.classList.add("red-dot");
        redDot.style.left = `${patito.x + patito.width/2 - 15}px`;
        redDot.style.top = `${patito.y + patito.height/2 - 15}px`;
        this.container.appendChild(redDot);
        setTimeout(() => this.container.removeChild(redDot), 200);

        patito.element.classList.add("eaten");
        setTimeout(() => this.container.removeChild(patito.element), 200);

        this.puntuacion += 10;
        this.visiblePatitos.splice(index, 1);

        if (this.todosPatitos.length > 0) {
          const siguiente = this.todosPatitos.splice(Math.floor(Math.random()*this.todosPatitos.length), 1)[0];
          this.visiblePatitos.push(siguiente);
          this.container.appendChild(siguiente.element);
        }

        if (this.visiblePatitos.length === 0 && this.todosPatitos.length === 0) {
          clearInterval(this.timer);
          this.level++;
          this.showNextLevel(() => this.iniciarNivel());
        }
      }
    });
  }

  moverFondo() {
    let offset = 0;
    setInterval(() => {
      offset -= 1;
      this.container.style.backgroundPosition = `${offset}px 0`;
    }, 50);
  }
}

// Personaje
class Personaje {
  constructor() {
    this.x = 50; this.y = 300;
    this.width = 80; this.height = 80; this.velocidad = 10;

    this.element = document.createElement("img");
    this.element.src = "assets/shark.gif";
    this.element.classList.add("shark");

    this.actualizarPosicion();
  }
  mover(evento) {
    if (evento.key === "ArrowRight") { this.x += this.velocidad; this.element.style.transform = "scaleX(1)"; }
    if (evento.key === "ArrowLeft")  { this.x -= this.velocidad; this.element.style.transform = "scaleX(-1)"; }
    if (evento.key === "ArrowUp")    this.y -= this.velocidad;
    if (evento.key === "ArrowDown")  this.y += this.velocidad;

    if (this.x < -this.width) this.x = 800;
    if (this.x > 800) this.x = -this.width;
    if (this.y < -this.height) this.y = 400;
    if (this.y > 400) this.y = -this.height;

    this.actualizarPosicion();
  }
  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
  colisionaCon(objeto) {
    return (this.x < objeto.x + objeto.width &&
            this.x + this.width > objeto.x &&
            this.y < objeto.y + objeto.height &&
            this.y + this.height > objeto.y);
  }
}

// Patito con movimiento flotante
class Patito {
  constructor() {
    this.width = 40; this.height = 40;
    this.x = Math.random() * (800 - this.width);
    this.y = Math.random() * (400 - this.height);

    this.element = document.createElement("img");
    this.element.src = "assets/duck.png";
    this.element.classList.add("duck");

    this.actualizarPosicion();
  }
  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
    this.element.style.position = "absolute";
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
  }
  startFloating() {
    setInterval(() => {
      this.y += Math.sin(Date.now()/200) * 0.7;
      this.actualizarPosicion();
    }, 50);
  }
}

const juego = new Game();
