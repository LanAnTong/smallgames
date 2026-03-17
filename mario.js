class MarioGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');

        this.canvas.width = 800;
        this.canvas.height = 500;

        this.gravity = 0.6;
        this.friction = 0.8;

        this.gameStarted = false;
        this.gameOver = false;
        this.score = 0;
        this.lives = 3;

        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.enemies = [];

        this.keys = {
            left: false,
            right: false,
            jump: false
        };

        this.init();
    }

    init() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Touch controls
        document.getElementById('leftBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.left = true;
        });
        document.getElementById('leftBtn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.left = false;
        });

        document.getElementById('rightBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.right = true;
        });
        document.getElementById('rightBtn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.right = false;
        });

        document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.jump = true;
        });
        document.getElementById('jumpBtn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.jump = false;
        });

        this.drawEmpty();
    }

    handleKeyDown(e) {
        if (!this.gameStarted || this.gameOver) return;

        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.keys.right = true;
                break;
            case ' ':
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (!this.keys.jump) {
                    this.keys.jump = true;
                    this.playerJump();
                }
                break;
        }
    }

    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.keys.right = false;
                break;
            case ' ':
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.keys.jump = false;
                break;
        }
    }

    playerJump() {
        if (this.player.grounded) {
            this.player.velocityY = -15;
            this.player.grounded = false;
        }
    }

    startGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.lives = 3;

        this.startBtn.classList.add('hidden');
        this.restartBtn.classList.remove('hidden');

        this.resetGame();
        this.gameLoop();
    }

    restartGame() {
        this.startGame();
    }

    resetGame() {
        // Initialize player
        this.player = {
            x: 100,
            y: 350,
            width: 40,
            height: 50,
            velocityX: 0,
            velocityY: 0,
            grounded: false,
            color: '#FF0000'
        };

        // Create platforms
        this.platforms = [
            { x: 0, y: 450, width: 800, height: 50 }, // Ground
            { x: 200, y: 380, width: 150, height: 20 },
            { x: 450, y: 320, width: 150, height: 20 },
            { x: 650, y: 260, width: 150, height: 20 },
            { x: 300, y: 200, width: 150, height: 20 },
            { x: 100, y: 150, width: 150, height: 20 },
            { x: 500, y: 120, width: 150, height: 20 }
        ];

        // Create coins
        this.coins = [
            { x: 250, y: 350, width: 20, height: 20, collected: false },
            { x: 500, y: 290, width: 20, height: 20, collected: false },
            { x: 700, y: 230, width: 20, height: 20, collected: false },
            { x: 350, y: 170, width: 20, height: 20, collected: false },
            { x: 150, y: 120, width: 20, height: 20, collected: false },
            { x: 550, y: 90, width: 20, height: 20, collected: false }
        ];

        // Create enemies
        this.enemies = [
            { x: 300, y: 420, width: 40, height: 40, velocityX: 2, direction: 1 },
            { x: 500, y: 280, width: 40, height: 40, velocityX: 1.5, direction: -1 },
            { x: 700, y: 220, width: 40, height: 40, velocityX: 2, direction: 1 }
        ];

        this.updateScore();
        this.updateLives();
    }

    gameLoop() {
        if (!this.gameStarted || this.gameOver) return;

        this.update();
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Player movement
        if (this.keys.left) {
            this.player.velocityX = -5;
        } else if (this.keys.right) {
            this.player.velocityX = 5;
        } else {
            this.player.velocityX *= this.friction;
        }

        // Apply gravity
        this.player.velocityY += this.gravity;

        // Update player position
        this.player.x += this.player.velocityX;
        this.player.y += this.player.velocityY;

        // Check platform collisions
        this.player.grounded = false;
        for (const platform of this.platforms) {
            if (this.checkCollision(this.player, platform)) {
                // Landing on top
                if (this.player.velocityY > 0 && this.player.y + this.player.height - this.player.velocityY <= platform.y) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.grounded = true;
                }
                // Hitting from below
                else if (this.player.velocityY < 0 && this.player.y - this.player.velocityY >= platform.y + platform.height) {
                    this.player.y = platform.y + platform.height;
                    this.player.velocityY = 0;
                }
                // Hitting from sides
                else {
                    if (this.player.velocityX > 0) {
                        this.player.x = platform.x - this.player.width;
                    } else if (this.player.velocityX < 0) {
                        this.player.x = platform.x + platform.width;
                    }
                    this.player.velocityX = 0;
                }
            }
        }

        // Keep player in bounds
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }

        // Check if player fell off screen
        if (this.player.y > this.canvas.height) {
            this.loseLife();
        }

        // Check coin collection
        for (const coin of this.coins) {
            if (!coin.collected && this.checkCollision(this.player, coin)) {
                coin.collected = true;
                this.score += 10;
                this.updateScore();
            }
        }

        // Update and check enemy collisions
        for (const enemy of this.enemies) {
            // Move enemy
            enemy.x += enemy.velocityX * enemy.direction;

            // Reverse enemy direction at edges
            if (enemy.x <= 0 || enemy.x + enemy.width >= this.canvas.width) {
                enemy.direction *= -1;
            }

            // Check platform collision for enemy
            for (const platform of this.platforms) {
                if (this.checkCollision(enemy, platform)) {
                    if (enemy.x + enemy.width > platform.x && enemy.x < platform.x + platform.width) {
                        enemy.y = platform.y - enemy.height;
                    }
                }
            }

            // Check collision with player
            if (this.checkCollision(this.player, enemy)) {
                // Check if player jumped on enemy
                if (this.player.velocityY > 0 && this.player.y + this.player.height < enemy.y + enemy.height / 2) {
                    // Player defeated enemy
                    enemy.x = -100; // Remove enemy
                    this.score += 20;
                    this.updateScore();
                    this.player.velocityY = -10; // Bounce
                } else {
                    // Player hit by enemy
                    this.loseLife();
                }
            }
        }

        // Check win condition
        if (this.coins.every(coin => coin.collected)) {
            this.gameOver = true;
            setTimeout(() => {
                alert(`恭喜通关！\n最终分数: ${this.score}`);
            }, 300);
            return;
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    loseLife() {
        this.lives--;
        this.updateLives();

        if (this.lives <= 0) {
            this.gameOver = true;
            setTimeout(() => {
                alert(`游戏结束！\n最终分数: ${this.score}`);
            }, 300);
        } else {
            // Reset player position
            this.player.x = 100;
            this.player.y = 350;
            this.player.velocityX = 0;
            this.player.velocityY = 0;
        }
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    updateLives() {
        this.livesElement.textContent = this.lives;
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background (sky and ground)
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.7);
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.canvas.height * 0.7, this.canvas.width, this.canvas.height * 0.3);

        // Draw platforms
        this.ctx.fillStyle = '#8B4513';
        for (const platform of this.platforms) {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            // Add grass on top
            this.ctx.fillStyle = '#228B22';
            this.ctx.fillRect(platform.x, platform.y, platform.width, 5);
            this.ctx.fillStyle = '#8B4513';
        }

        // Draw coins
        for (const coin of this.coins) {
            if (!coin.collected) {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(coin.x + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#FFA500';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }

        // Draw enemies
        for (const enemy of this.enemies) {
            if (enemy.x > -50) {
                this.ctx.fillStyle = '#8B0000';
                this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                // Eyes
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(enemy.x + 12, enemy.y + 15, 6, 0, Math.PI * 2);
                this.ctx.arc(enemy.x + 28, enemy.y + 15, 6, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = 'black';
                this.ctx.beginPath();
                this.ctx.arc(enemy.x + 12, enemy.y + 15, 3, 0, Math.PI * 2);
                this.ctx.arc(enemy.x + 28, enemy.y + 15, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Draw player (Mario-like)
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Player face
        this.ctx.fillStyle = '#FFE4C4';
        this.ctx.fillRect(this.player.x + 5, this.player.y + 5, this.player.width - 10, this.player.height * 0.4);

        // Player eyes
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(this.player.x + 10, this.player.y + 12, 5, 5);
        this.ctx.fillRect(this.player.x + 25, this.player.y + 12, 5, 5);

        // Player hat
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, 10);
    }

    drawEmpty() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.7);
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.canvas.height * 0.7, this.canvas.width, this.canvas.height * 0.3);

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('点击"开始游戏"开始冒险！', this.canvas.width / 2, this.canvas.height / 2);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MarioGame();
});
