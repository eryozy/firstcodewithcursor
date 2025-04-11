const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game state
let gameOver = false;
let champion = null;
let isPaused = false;
let isStopped = false;
let animationId = null;

// Get control buttons
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');

// Ball class
class Ball {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dx = (Math.random() - 0.5) * 8; // Random horizontal velocity
        this.dy = (Math.random() - 0.5) * 8; // Random vertical velocity
        this.originalRadius = radius;
        this.flashCount = 0;
        this.collisionCount = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Flash effect when collision occurs
        if (this.flashCount > 0) {
            ctx.fillStyle = 'white';
            this.flashCount--;
        } else {
            ctx.fillStyle = this.color;
        }
        
        ctx.fill();
        ctx.closePath();

        // Draw collision count
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.collisionCount, this.x, this.y);
    }

    update(balls) {
        if (gameOver || isPaused || isStopped) return;

        // Bounce off walls
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        // Check collision with other balls
        for (let ball of balls) {
            if (ball === this) continue;

            // Calculate distance between balls
            const dx = ball.x - this.x;
            const dy = ball.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if balls are colliding
            if (distance < this.radius + ball.radius) {
                // Increase size and collision count
                this.radius += 0.5;
                ball.radius += 0.5;
                this.collisionCount++;
                ball.collisionCount++;
                
                // Check for game over condition
                if (this.collisionCount >= 50 || ball.collisionCount >= 50) {
                    gameOver = true;
                    champion = this.collisionCount >= 50 ? this : ball;
                }
                
                // Set flash effect
                this.flashCount = 5;
                ball.flashCount = 5;

                // Collision response
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);

                // Rotate velocities
                const vx1 = this.dx * cos + this.dy * sin;
                const vy1 = this.dy * cos - this.dx * sin;
                const vx2 = ball.dx * cos + ball.dy * sin;
                const vy2 = ball.dy * cos - ball.dx * sin;

                // Swap the x velocities
                this.dx = vx2 * cos - vy1 * sin;
                this.dy = vy1 * cos + vx2 * sin;
                ball.dx = vx1 * cos - vy2 * sin;
                ball.dy = vy2 * cos + vx1 * sin;

                // Move balls apart to prevent sticking
                const overlap = (this.radius + ball.radius - distance) / 2;
                this.x -= overlap * cos;
                this.y -= overlap * sin;
                ball.x += overlap * cos;
                ball.y += overlap * sin;
            }
        }

        // Update position
        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    }
}

// Create balls
const balls = [
    new Ball(100, 100, 20, 'red'),
    new Ball(200, 200, 20, 'blue'),
    new Ball(300, 300, 20, 'green'),
    new Ball(400, 400, 20, 'orange'),
    new Ball(500, 500, 20, 'white')
];

// Draw game over message
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Champion is ${champion.color}!`, canvas.width/2, canvas.height/2);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Collisions: ${champion.collisionCount}`, canvas.width/2, canvas.height/2 + 50);
}

// Reset game
function resetGame() {
    gameOver = false;
    champion = null;
    isPaused = false;
    isStopped = false;
    
    // Reset balls
    balls.forEach(ball => {
        ball.x = Math.random() * (canvas.width - 40) + 20;
        ball.y = Math.random() * (canvas.height - 40) + 20;
        ball.radius = 20;
        ball.dx = (Math.random() - 0.5) * 8;
        ball.dy = (Math.random() - 0.5) * 8;
        ball.collisionCount = 0;
    });
    
    // Update button states
    updateButtonStates();
}

// Update button states
function updateButtonStates() {
    startBtn.disabled = !isStopped && !isPaused;
    pauseBtn.disabled = isStopped || gameOver;
    stopBtn.disabled = isStopped || gameOver;
    
    if (isPaused) {
        pauseBtn.textContent = 'Resume';
    } else {
        pauseBtn.textContent = 'Pause';
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    balls.forEach(ball => {
        ball.update(balls);
    });

    if (gameOver) {
        drawGameOver();
    }

    animationId = requestAnimationFrame(animate);
}

// Event listeners for buttons
startBtn.addEventListener('click', () => {
    if (isStopped) {
        resetGame();
    }
    isStopped = false;
    isPaused = false;
    updateButtonStates();
});

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    updateButtonStates();
});

stopBtn.addEventListener('click', () => {
    isStopped = true;
    isPaused = false;
    updateButtonStates();
});

// Initialize button states
updateButtonStates();

// Start animation
animate(); 