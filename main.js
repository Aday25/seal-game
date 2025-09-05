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
    this.maxVisible = 3;

    this.iniciarNivel();
    this.agregarEventos();
    this.moverFondo();
  }

  iniciarNivel() {
    // Limpiar patitos anteriores
    this.visiblePatitos.forEach(p => this.container.removeChild(p.element));
    this.todosPatitos = [];
    this.visiblePatitos = [];

    const numPatitos = 5 + this.level;
    for (let i = 0; i < numPatitos; i++) {
      this.todosPatitos.push(new Moneda());
    }

    // Mostrar solo los primeros visibles
    this.visiblePatitos = this.todosPatitos.splice(0, this.maxVisible);
    this.visiblePatitos.forEach(patito => this.container.appendChild(patito.element));

    this.timeLeft = 30;
    this.mostrarTemporizador();
  }

  mostrarTemporizador() {
    this.puntosElement.textContent = `Level: ${this.level} | Points: ${this.puntuacion} | Time: ${this.timeLeft}`;
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      this.puntosElement.textContent = `Level: ${this.level} | Points: ${this.puntuacion} | Time: ${this.timeLeft}`;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        alert("Time's up! Game Over!");
        location.reload();
      }
    }, 1000);
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
        // Dot rojo
        const redDot = document.createElement("div");
        redDot.classList.add("red-dot");
        redDot.style.left = `${patito.x + patito.width / 2 - 15}px`;
        redDot.style.top = `${patito.y + patito.height / 2 - 15}px`;
        this.container.appendChild(redDot);
        setTimeout(() => this.container.removeChild(redDot), 200);

        // Animación pato
        patito.element.classList.add("eaten");
        setTimeout(() => this.container.removeChild(patito.element), 200);

        this.puntuacion += 10;
        this.visiblePatitos.splice(index, 1);

        // Aparecer siguiente patito si hay ocultos
        if (this.todosPatitos.length > 0) {
          const siguiente = this.todosPatitos.splice(Math.floor(Math.random() * this.todosPatitos.length), 1)[0];
          this.visiblePatitos.push(siguiente);
          this.container.appendChild(siguiente.element);
        }

        // Si no quedan patitos visibles ni ocultos -> siguiente nivel
        if (this.visiblePatitos.length === 0 && this.todosPatitos.length === 0) {
          clearInterval(this.timer);
          alert(`Level ${this.level} completed!`);
          this.level++;
          this.iniciarNivel();
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

class Personaje {
  constructor() {
    this.x = 50;
    this.y = 300;
    this.width = 80;
    this.height = 80;
    this.velocidad = 10;

    this.element = document.createElement("img");
    this.element.src = "assets/shark.gif";
    this.element.classList.add("shark");

    this.actualizarPosicion();
  }

  mover(evento) {
    if (evento.key === "ArrowRight") {
      this.x += this.velocidad;
      this.element.style.transform = "scaleX(1)";
    }
    if (evento.key === "ArrowLeft") {
      this.x -= this.velocidad;
      this.element.style.transform = "scaleX(-1)";
    }
    if (evento.key === "ArrowUp") this.y -= this.velocidad;
    if (evento.key === "ArrowDown") this.y += this.velocidad;

    // Wrap-around horizontal
    if (this.x < -this.width) this.x = 800;
    if (this.x > 800) this.x = -this.width;

    // Wrap-around vertical
    if (this.y < -this.height) this.y = 400;
    if (this.y > 400) this.y = -this.height;

    this.actualizarPosicion();
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  colisionaCon(objeto) {
    return (
      this.x < objeto.x + objeto.width &&
      this.x + this.width > objeto.x &&
      this.y < objeto.y + objeto.height &&
      this.y + this.height > objeto.y
    );
  }
}

class Moneda {
  constructor() {
    this.width = 40;
    this.height = 40;
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
}

const juego = new Game();
