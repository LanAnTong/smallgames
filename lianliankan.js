class LianLianKan {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');

        this.gridWidth = 8;
        this.gridHeight = 6;
        this.tileSize = 60;
        this.padding = 10;

        this.canvas.width = this.gridWidth * this.tileSize + (this.gridWidth + 1) * this.padding;
        this.canvas.height = this.gridHeight * this.tileSize + (this.gridHeight + 1) * this.padding;

        this.icons = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑', '🍌', '🥭'];
        this.grid = [];
        this.selected = null;
        this.score = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameStarted = false;
        this.gameEnded = false;

        this.init();
    }

    init() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));

        this.drawEmptyBoard();
    }

    startGame() {
        this.gameStarted = true;
        this.gameEnded = false;
        this.score = 0;
        this.timer = 0;
        this.selected = null;
        this.updateScore();
        this.updateTimer();

        this.startBtn.classList.add('hidden');
        this.restartBtn.classList.remove('hidden');

        this.generateGrid();
        this.draw();

        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
    }

    restartGame() {
        clearInterval(this.timerInterval);
        this.startGame();
    }

    generateGrid() {
        const totalTiles = this.gridWidth * this.gridHeight;
        const pairs = totalTiles / 2;
        const tiles = [];

        for (let i = 0; i < pairs; i++) {
            const icon = this.icons[i % this.icons.length];
            tiles.push(icon);
            tiles.push(icon);
        }

        // Shuffle tiles
        for (let i = tiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }

        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = tiles[y * this.gridWidth + x];
            }
        }
    }

    handleClick(e) {
        if (!this.gameStarted || this.gameEnded) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - this.padding) / (this.tileSize + this.padding));
        const y = Math.floor((e.clientY - rect.top - this.padding) / (this.tileSize + this.padding));

        this.selectTile(x, y);
    }

    handleTouch(e) {
        e.preventDefault();
        if (!this.gameStarted || this.gameEnded) return;

        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((touch.clientX - rect.left - this.padding) / (this.tileSize + this.padding));
        const y = Math.floor((touch.clientY - rect.top - this.padding) / (this.tileSize + this.padding));

        this.selectTile(x, y);
    }

    selectTile(x, y) {
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return;
        if (!this.grid[y][x]) return;

        if (!this.selected) {
            this.selected = { x, y };
            this.draw();
        } else {
            if (this.selected.x === x && this.selected.y === y) {
                this.selected = null;
                this.draw();
            } else {
                if (this.grid[this.selected.y][this.selected.x] === this.grid[y][x]) {
                    if (this.canConnect(this.selected.x, this.selected.y, x, y)) {
                        this.grid[this.selected.y][this.selected.x] = null;
                        this.grid[y][x] = null;
                        this.score += 10;
                        this.selected = null;
                        this.updateScore();
                        this.checkWin();
                    }
                }
                this.selected = { x, y };
                this.draw();
            }
        }
    }

    canConnect(x1, y1, x2, y2) {
        // Check if tiles can be connected with at most 2 turns
        return this.findPath(x1, y1, x2, y2) !== null;
    }

    findPath(x1, y1, x2, y2) {
        // Direct connection
        if (this.checkDirectPath(x1, y1, x2, y2)) {
            return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
        }

        // One turn
        if (this.grid[y1][x2] === null && this.checkDirectPath(x1, y1, x2, y1) && this.checkDirectPath(x2, y1, x2, y2)) {
            return [{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }];
        }
        if (this.grid[y2][x1] === null && this.checkDirectPath(x1, y1, x1, y2) && this.checkDirectPath(x1, y2, x2, y2)) {
            return [{ x: x1, y: y1 }, { x: x1, y: y2 }, { x: x2, y: y2 }];
        }

        // Two turns
        for (let x = 0; x < this.gridWidth; x++) {
            if (this.grid[y1][x] === null && this.grid[y2][x] === null &&
                this.checkDirectPath(x1, y1, x, y1) &&
                this.checkDirectPath(x, y1, x, y2) &&
                this.checkDirectPath(x, y2, x2, y2)) {
                return [{ x: x1, y: y1 }, { x: x, y: y1 }, { x: x, y: y2 }, { x: x2, y: y2 }];
            }
        }

        for (let y = 0; y < this.gridHeight; y++) {
            if (this.grid[y][x1] === null && this.grid[y][x2] === null &&
                this.checkDirectPath(x1, y1, x1, y) &&
                this.checkDirectPath(x1, y, x2, y) &&
                this.checkDirectPath(x2, y, x2, y2)) {
                return [{ x: x1, y: y1 }, { x: x1, y: y }, { x: x2, y: y }, { x: x2, y: y2 }];
            }
        }

        return null;
    }

    checkDirectPath(x1, y1, x2, y2) {
        if (x1 === x2) {
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            for (let y = minY + 1; y < maxY; y++) {
                if (this.grid[y][x1] !== null) return false;
            }
            return true;
        }
        if (y1 === y2) {
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            for (let x = minX + 1; x < maxX; x++) {
                if (this.grid[y1][x] !== null) return false;
            }
            return true;
        }
        return false;
    }

    checkWin() {
        let remaining = 0;
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x]) remaining++;
            }
        }

        if (remaining === 0) {
            this.gameEnded = true;
            clearInterval(this.timerInterval);
            setTimeout(() => {
                alert(`恭喜你完成游戏！\n分数: ${this.score}\n用时: ${this.timer}秒`);
            }, 300);
        }
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    updateTimer() {
        this.timerElement.textContent = this.timer;
    }

    drawEmptyBoard() {
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const tileX = this.padding + x * (this.tileSize + this.padding);
                const tileY = this.padding + y * (this.tileSize + this.padding);

                if (this.grid[y][x]) {
                    this.ctx.fillStyle = this.selected && this.selected.x === x && this.selected.y === y ? '#667eea' : '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.roundRect(tileX, tileY, this.tileSize, this.tileSize, 10);
                    this.ctx.fill();

                    this.ctx.font = `${this.tileSize * 0.6}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillStyle = this.selected && this.selected.x === x && this.selected.y === y ? '#ffffff' : '#333333';
                    this.ctx.fillText(this.grid[y][x], tileX + this.tileSize / 2, tileY + this.tileSize / 2);
                }
            }
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new LianLianKan();
});
