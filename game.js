const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load images
const birdImg = new Image();
birdImg.src = "bird.png";

const pipeImg = new Image();
pipeImg.src = "pipe.png";

// Load sounds
const jumpSound = new Audio("jump.wav");
const hitSound = new Audio("hit.wav");
const scoreSound = new Audio("score.wav");

// Game variables
let bird = { x: 50, y: canvas.height/2, width: 50, height: 50, gravity: 0.6, lift: -12, velocity: 0 };
let pipes = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let gameOver = false;
let gameStarted = false;
let pipeSpeed = 4;
let pipeInterval = 2000;
let lastPipeTime = 0;

// Touch control
window.addEventListener("touchstart", () => {
    if(gameStarted) birdJump();
});

// Buttons
document.getElementById("startBtn").addEventListener("click", () => {
    document.getElementById("menu").style.display = "none";
    gameStarted = true;
    lastPipeTime = Date.now();
    gameLoop();
});

document.getElementById("resumeBtn").addEventListener("click", () => {
    document.getElementById("resumeMenu").style.display = "none";
    gameLoop();
});

// Functions
function birdJump() {
    bird.velocity = bird.lift;
    jumpSound.play();
}

function createPipe() {
    let gap = 200;
    let topHeight = Math.random() * (canvas.height - gap - 200) + 100;
    pipes.push({ x: canvas.width, top: topHeight, bottom: topHeight + gap, width: 80, scored:false });
}

function drawBird() {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.drawImage(pipeImg, pipe.x, pipe.top - pipeImg.height, pipe.width, pipeImg.height); // top pipe
        ctx.drawImage(pipeImg, pipe.x, pipe.bottom, pipe.width, pipeImg.height); // bottom pipe
        pipe.x -= pipeSpeed;

        // Collision
        if (bird.x < pipe.x + pipe.width && bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)) {
            hitSound.play();
            endGame();
        }

        // Score
        if (!pipe.scored && pipe.x + pipe.width < bird.x) {
            score++;
            scoreSound.play();
            pipe.scored = true;
            if(score % 5 === 0) pipeSpeed += 0.5; // Difficulty increase
        }
    });

    // Remove offscreen pipes
    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if(bird.y <=0 || bird.y + bird.height >= canvas.height) endGame();
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Score: " + score, 20, 50);
    ctx.fillText("High Score: " + highScore, 20, 100);
}

function endGame() {
    gameOver = true;
    gameStarted = false;
    if(score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
    ctx.fillStyle = "black";
    ctx.font = "60px Arial";
    ctx.fillText("GAME OVER", canvas.width/2 - 150, canvas.height/2);
    setTimeout(() => { 
        document.getElementById("menu").style.display = "block"; 
        score = 0;
        pipes = [];
        bird.y = canvas.height/2;
        bird.velocity = 0;
        pipeSpeed = 4;
        gameOver = false;
    }, 2000);
}

function gameLoop() {
    if(gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBird();
    drawPipes();
    updateBird();
    drawScore();

    if(Date.now() - lastPipeTime > pipeInterval) {
        createPipe();
        lastPipeTime = Date.now();
    }

    requestAnimationFrame(gameLoop);
}