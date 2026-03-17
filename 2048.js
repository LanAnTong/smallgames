class Game2048 {
    constructor() {
        this.gameBoard = document.getElementById('gameBoard');
        this.scoreElement = document.getElementById('score');
        this.bestElement = document.getElementById('best');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');

        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.best = parseInt(localStorage.getItem('best2048')) || 0;
        this.gameStarted = false;
        this.gameOver = false;

        this.updateBest();
        this.init();
    }

    init() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Touch controls
        document.getElementById('upBtn').addEventListener('click', () => this.move('up'));
        document.getElementById('downBtn').addEventListener('click', () => this.move('down'));
        document.getElementById('leftBtn').addEventListener('click', () => this.move('left'));
        document.getElementById('rightBtn').addEventListener('click', () => this.move('right'));

        // Touch swipe
        let touchStartX, touchStartY;
        this.gameBoard.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.gameBoard.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 30) {
                    this.move(diffX > 0 ? 'right' : 'left');
                }
            } else {
                if (Math.abs(diffY) > 30) {
                    this.move(diffY > 0 ? 'down' : 'up');
                }
            }

            touchStartX = null;
            touchStartY = null;
        });

        this.drawEmptyBoard();
    }

    handleKeyDown(e) {
        if (!this.gameStarted || this.gameOver) return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                this.move('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.move('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.move('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.move('right');
                break;
        }
    }

    startGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.updateScore();

        this.startBtn.classList.add('hidden');
        this.restartBtn.classList.remove('hidden');

        this.addNewTile();
        this.addNewTile();
        this.draw();
    }

    restartGame() {
        this.startGame();
    }

    addNewTile() {
        const emptyCells = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.grid[y][x] === 0) {
                    emptyCells.push({ x, y });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[y][x] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        if (!this.gameStarted || this.gameOver) return;

        const oldGrid = this.grid.map(row => [...row]);
        let moved = false;

        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }

        if (moved) {
            this.addNewTile();
            this.draw();

            if (this.checkGameOver()) {
                this.gameOver = true;
                setTimeout(() => {
                    alert(`游戏结束！\n分数: ${this.score}`);
                }, 300);
            }
        }
    }

    moveLeft() {
        let moved = false;
        for (let y = 0; y < this.size; y++) {
            const row = this.grid[y].filter(x => x !== 0);
            const newRow = [];

            for (let i = 0; i < row.length; i++) {
                if (i + 1 < row.length && row[i] === row[i + 1]) {
                    newRow.push(row[i] * 2);
                    this.score += row[i] * 2;
                    i++;
                } else {
                    newRow.push(row[i]);
                }
            }

            while (newRow.length < this.size) {
                newRow.push(0);
            }

            for (let x = 0; x < this.size; x++) {
                if (this.grid[y][x] !== newRow[x]) {
                    moved = true;
                }
                this.grid[y][x] = newRow[x];
            }
        }
        this.updateScore();
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let y = 0; y < this.size; y++) {
            const row = this.grid[y].filter(x => x !== 0);
            const newRow = [];

            for (let i = row.length - 1; i >= 0; i--) {
                if (i - 1 >= 0 && row[i] === row[i - 1]) {
                    newRow.unshift(row[i] * 2);
                    this.score += row[i] * 2;
                    i--;
                } else {
                    newRow.unshift(row[i]);
                }
            }

            while (newRow.length < this.size) {
                newRow.unshift(0);
            }

            for (let x = 0; x < this.size; x++) {
                if (this.grid[y][x] !== newRow[x]) {
                    moved = true;
                }
                this.grid[y][x] = newRow[x];
            }
        }
        this.updateScore();
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let x = 0; x < this.size; x++) {
            const col = [];
            for (let y = 0; y < this.size; y++) {
                if (this.grid[y][x] !== 0) {
                    col.push(this.grid[y][x]);
                }
            }

            const newCol = [];
            for (let i = 0; i < col.length; i++) {
                if (i + 1 < col.length && col[i] === col[i + 1]) {
                    newCol.push(col[i] * 2);
                    this.score += col[i] * 2;
                    i++;
                } else {
                    newCol.push(col[i]);
                }
            }

            while (newCol.length < this.size) {
                newCol.push(0);
            }

            for (let y = 0; y < this.size; y++) {
                if (this.grid[y][x] !== newCol[y]) {
                    moved = true;
                }
                this.grid[y][x] = newCol[y];
            }
        }
        this.updateScore();
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let x = 0; x < this.size; x++) {
            const col = [];
            for (let y = 0; y < this.size; y++) {
                if (this.grid[y][x] !== 0) {
                    col.push(this.grid[y][x]);
                }
            }

            const newCol = [];
            for (let i = col.length - 1; i >= 0; i--) {
                if (i - 1 >= 0 && col[i] === col[i - 1]) {
                    newCol.unshift(col[i] * 2);
                    this.score += col[i] * 2;
                    i--;
                } else {
                    newCol.unshift(col[i]);
                }
            }

            while (newCol.length < this.size) {
                newCol.unshift(0);
            }

            for (let y = 0; y < this.size; y++) {
                if (this.grid[y][x] !== newCol[y]) {
                    moved = true;
                }
                this.grid[y][x] = newCol[y];
            }
        }
        this.updateScore();
        return moved;
    }

    checkGameOver() {
        // Check for empty cells
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.grid[y][x] === 0) return false;
            }
        }

        // Check for possible merges
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const current = this.grid[y][x];
                if (x + 1 < this.size && this.grid[y][x + 1] === current) return false;
                if (y + 1 < this.size && this.grid[y + 1][x] === current) return false;
            }
        }

        return true;
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
        if (this.score > this.best) {
            this.best = this.score;
            localStorage.setItem('best2048', this.best);
            this.updateBest();
        }
    }

    updateBest() {
        this.bestElement.textContent = this.best;
    }

    drawEmptyBoard() {
        this.gameBoard.innerHTML = '';
        for (let i = 0; i < this.size * this.size; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            this.gameBoard.appendChild(tile);
        }
    }

    draw() {
        this.gameBoard.innerHTML = '';
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const tile = document.createElement('div');
                const value = this.grid[y][x];
                tile.className = `tile tile-${value > 2048 ? 'super' : value}`;
                tile.textContent = value || '';
                this.gameBoard.appendChild(tile);
            }
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
