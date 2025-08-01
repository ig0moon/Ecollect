const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const mapNameDisplay = document.getElementById('map-name');
const startMessage = document.getElementById('start-message');
const info = document.getElementById('info');
const header = document.getElementById('header');

const controls = document.getElementById('controls');
const btnUp = document.getElementById('up');
const btnDown = document.getElementById('down');
const btnLeft = document.getElementById('left');
const btnRight = document.getElementById('right');
const btnCollect = document.getElementById('collect');

let score = 0;
let time = 45;
let interval;
let currentMap = '';
let playerX = 150;
let playerY = 150;
let trashItems = [];
let facing = 1; // 1 = direita, -1 = esquerda

const maps = {
  forest: { name: 'Floresta', bg: 'sprites/forest.png' },
  lake: { name: 'Lago', bg: 'sprites/lake.png' }
};

// Sons
const ambientForest = new Audio('sounds/ambient_forest.mp3');
ambientForest.loop = true;
ambientForest.volume = 0.3;

const ambientLake = new Audio('sounds/ambient_lake.mp3');
ambientLake.loop = true;
ambientLake.volume = 0.3;

const stepGrassSound = new Audio('sounds/step_grass.mp3');
stepGrassSound.volume = 0.08;

const stepWaterSound = new Audio('sounds/step_water.mp3');
stepWaterSound.volume = 0.04;

const collectSound = new Audio('sounds/collect.mp3');

const scoreSound = new Audio('sounds/score.mp3');

let walkToggle = true; // alternar sprite

document.querySelectorAll('#start-message button').forEach(btn => {
  btn.addEventListener('click', () => startGame(btn.dataset.map));
});

function startGame(map) {
  currentMap = map;
  score = 0;
  time = 45;
  playerX = 150;
  playerY = 150;

  gameArea.style.backgroundImage = `url(${maps[map].bg})`;
  mapNameDisplay.textContent = maps[map].name;

  startMessage.style.display = 'none';
  gameArea.style.display = 'block'; //fazer o gameArea visível
  info.style.display = 'flex'; //fazer score, mapa e tempo visível

  if (window.innerWidth < 400) {
    controls.style.display = 'flex'; //só aparecer controles em telas pequenas
    header.style.display = 'none'; //fazer o header invisível em telas pequenas
  }

  if (window.innerWidth < 900) {
    controls.style.display = 'flex'; //só aparecer controles em telas pequenas
  }

  gameArea.innerHTML = '';
  gameArea.appendChild(player);

  trashItems = [];
  spawnTrash();

  clearInterval(interval);
  interval = setInterval(gameLoop, 1000);

  updateDisplay();
  updatePlayer();

  // Parar ambos os sons
  ambientForest.pause();
  ambientLake.pause();

  // Reiniciar do começo
  ambientForest.currentTime = 0;
  ambientLake.currentTime = 0;

  // Tocar o som de ambientação correto
  if (map === 'forest') {
    ambientForest.play().catch(() => {});
  } else if (map === 'lake') {
    ambientLake.play().catch(() => {});
  }
}

function gameLoop() {
  time--;
  updateDisplay();

  if (time <= 0) {
    clearInterval(interval);

    // parar sons
    ambientForest.pause();
    ambientLake.pause();

    alert('Fim de jogo! Pontuação: ' + score);
    location.reload();
  }
}

function updateDisplay() {
  scoreDisplay.textContent = score;
  timeDisplay.textContent = time;
}

function updatePlayer() {
  player.style.left = playerX + 'px';
  player.style.top = playerY + 'px';
  player.style.transform = `scaleX(${facing})`;
}


function spawnTrash(qtd = 2) {  // valor padrão: 1
  for (let i = 0; i < qtd; i++) {
    const trash = document.createElement('img');
    trash.src = 'sprites/trash.png';
    trash.classList.add('trash');

    trash.dataset.points = Math.floor(Math.random() * 10) + 1;

    trash.style.left = Math.random() * (gameArea.offsetWidth - 30) + 'px';
    trash.style.top = Math.random() * (gameArea.offsetHeight - 30) + 'px';

    gameArea.appendChild(trash);
    trashItems.push(trash);
  }
}

function movePlayer(dx, dy) {
    playerX = Math.max(0, Math.min(gameArea.offsetWidth - 40, playerX + dx));
    playerY = Math.max(0, Math.min(gameArea.offsetHeight - 40, playerY + dy));
  
    if (dx < 0) facing = -1;  // indo para esquerda
    if (dx > 0) facing = 1;   // indo para direita
  
    updatePlayer();
    animateWalk();
    playStepSound();
  }
  

function animateWalk() {
  walkToggle = !walkToggle;
  player.src = walkToggle ? 'sprites/player_walk1.png' : 'sprites/player_walk2.png';
}

function playStepSound() {
  if (currentMap === 'forest') {
    stepGrassSound.currentTime = 0;
    stepGrassSound.play();
  } else if (currentMap === 'lake') {
    stepWaterSound.currentTime = 0;
    stepWaterSound.play();
  } else {
    stepSound.currentTime = 0;
    stepSound.play();  // som genérico, caso necessário
  }
}


btnUp.addEventListener('click', () => movePlayer(0, -10));
btnDown.addEventListener('click', () => movePlayer(0, 10));
btnLeft.addEventListener('click', () => movePlayer(-10, 0));
btnRight.addEventListener('click', () => movePlayer(10, 0));

document.addEventListener("keydown", function(event) {
  const step = 10;

  switch (event.key) {
    case "ArrowUp":
      movePlayer(0, -step); //sobe
      break;

    case "ArrowDown":
      movePlayer(0, step); //desce
      break;

    case "ArrowLeft":
      movePlayer(-step, 0); //esquerda
      break;

    case "ArrowRight":
      movePlayer(step, 0); //direita
      break;

    case "e":
      for (let i = 0; i < trashItems.length; i++) {
      const trash = trashItems[i];
      const trashX = parseInt(trash.style.left);
      const trashY = parseInt(trash.style.top);

      if (Math.abs(trashX - playerX) < 20 && Math.abs(trashY - playerY) < 20) {
        const points = parseInt(trash.dataset.points);
        score += points;
        //time += 3;

        trash.remove();
        trashItems.splice(i, 1);
        showPointPopup(points);
        spawnTrash();
        updateDisplay();

        collectSound.play();
        scoreSound.play();
      break;
    }
  }}
});


btnCollect.addEventListener('click', () => {
  for (let i = 0; i < trashItems.length; i++) {
    const trash = trashItems[i];
    const trashX = parseInt(trash.style.left);
    const trashY = parseInt(trash.style.top);

    if (Math.abs(trashX - playerX) < 20 && Math.abs(trashY - playerY) < 20) {
      const points = parseInt(trash.dataset.points);
      score += points;
      //time += 3;

      trash.remove();
      trashItems.splice(i, 1);
      showPointPopup(points);
      spawnTrash();
      updateDisplay();

      collectSound.play();
      scoreSound.play();

      break;
    }
  }
});

function showPointPopup(points) {
  const popup = document.createElement('div');
  popup.classList.add('point-popup');
  popup.textContent = `+${points}`;
  popup.style.position = 'absolute';
  popup.style.left = playerX + 'px';
  popup.style.top = playerY + 'px';
  popup.style.color = 'red';
  gameArea.appendChild(popup);

  setTimeout(() => popup.remove(), 1000);
}