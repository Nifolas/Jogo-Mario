const mario = document.querySelector('.mario');
const obstacle = document.querySelector('.obstacle');
const gameBoard = document.querySelector('.game-board');
const gameOver = document.querySelector('.game-over');
const restartBtn = document.querySelector('.restart');
const scoreElement = document.querySelector('.score');
// SELECIONAR OS ARBUSTOS NO JS
const bushes = document.querySelector('.bushes');

// ÁUDIOS
const soundJump = new Audio('assets/sounds/Jump.mp3');
const soundGameOver = new Audio('assets/sounds/GameOver.mp3');
const soundTheme = new Audio('assets/sounds/Theme.mp3');
soundTheme.loop = true;

// CONFIGURAÇÕES DE IMAGEM
const imgPipe = 'assets/imgs/pipe.png';
const imgBullet = 'assets/imgs/bullet.png'; 
const imgMarioRun = 'assets/imgs/mario.gif';
const imgMarioDuck = 'assets/imgs/MAgachado.png'; 
const imgMarioGameOver = 'assets/imgs/game-over.png';

let score = 0;
let currentSpeed = 1.5;
let nextSpeed = 1.5;
let started = false;
let isJumping = false;
let isDucking = false;
let isNight = false;
let scoreInterval;

const startGame = () => {
    soundTheme.play();
    obstacle.classList.add('obstacle-moving');
    document.documentElement.style.setProperty('--speed', `${currentSpeed}s`);

    scoreInterval = setInterval(() => {
        score++;
        scoreElement.innerHTML = score;

        if (score % 100 === 0 && nextSpeed > 0.6) {
            nextSpeed -= 0.1;
        }

        if (score % 300 === 0 && score > 0) {
            isNight = !isNight;
            gameBoard.classList.toggle('night', isNight);
        }
    }, 100);
};

const jump = () => {
    if (!started) { startGame(); started = true; }
    if (isJumping || isDucking || gameOver.style.visibility === 'visible') return;

    soundJump.play();
    isJumping = true;
    mario.classList.add('jump');

    setTimeout(() => {
        mario.classList.remove('jump');
        isJumping = false;
    }, 500);
};

const duck = (active) => {
    if (isJumping || !started || gameOver.style.visibility === 'visible') return;
    isDucking = active;
    mario.classList.toggle('duck', active);
    mario.src = active ? imgMarioDuck : imgMarioRun;
};

obstacle.addEventListener('animationiteration', () => {
    obstacle.classList.remove('obstacle-moving');
    
    if (currentSpeed !== nextSpeed) {
        currentSpeed = nextSpeed;
        document.documentElement.style.setProperty('--speed', `${currentSpeed}s`);
    }

    const isAir = Math.random() > 0.5;
    obstacle.src = isAir ? imgBullet : imgPipe;
    obstacle.classList.toggle('obstacle-air', isAir);

    void obstacle.offsetWidth; 
    obstacle.classList.add('obstacle-moving');
});

const loop = setInterval(() => {
    const obstaclePosition = obstacle.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
    const isAirObstacle = obstacle.classList.contains('obstacle-air');

    if (obstaclePosition <= 120 && obstaclePosition > 0) {
        let hasCollided = false;

        if (!isAirObstacle) {
            if (marioPosition < 80) hasCollided = true;
        } else {
            if (!isDucking) hasCollided = true;
        }

        if (hasCollided) {
            soundTheme.pause();
            soundGameOver.play();

            obstacle.style.animation = 'none';
            obstacle.style.left = `${obstaclePosition}px`;
            mario.style.animation = 'none';
            mario.style.bottom = `${marioPosition}px`;
            
            // NOVA LINHA ADICIONADA AQUI: PARAR A ANIMAÇÃO DOS ARBUSTOS
            bushes.style.animation = 'none';
            // Opcional: manter a posição horizontal atual dos arbustos
            const bushesPosition = bushes.offsetLeft;
            bushes.style.left = `${bushesPosition}px`;
            bushes.style.right = 'auto'; // Impede conflito de posicionamento

            mario.src = imgMarioGameOver;
            mario.style.width = '75px';
            mario.style.marginLeft = '50px';
            gameOver.style.visibility = 'visible';
            
            clearInterval(loop);
            clearInterval(scoreInterval);
        }
    }
}, 10);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') jump();
    if (e.code === 'ArrowDown') duck(true);
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown') duck(false);
});

document.addEventListener('click', (e) => {
    if (e.target !== restartBtn) jump();
});

restartBtn.addEventListener('click', () => location.reload());