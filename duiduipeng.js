class DuiDuiPeng {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');

        this.gridWidth = 8;
        this.gridHeight = 8;
        this.tileSize = 50;
        this.padding = 5;

        this.canvas.width = this.gridWidth * this.tileSize + (this.gridWidth + 1) * this.padding;
        this.canvas.height = this.gridHeight * this.tileSize + (this.gridHeight + 1) * this.padding;

        this.gems = ['💎', '🔷', '🔶', '🟣', '🟢', '🔴'];
        this.grid = [];
        this.selected = null;
        this.score = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameStarted = false;
        this.isAnimating = false;

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
        this.score = 0;
        this.timer = 0;
        this.selected = null;
        this.isAnimating = false;
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
        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = this.getRandomGem();
            }
        }

        // Remove initial matches
        while (this.findMatches().length > 0) {
            this.removeMatches();
            this.fillEmptySpaces();
        }
    }

    getRandomGem() {
        return this.gems[Math.floor(Math.random() * this.gems.length)];
    }

    handleClick(e) {
        if (!this.gameStarted || this.isAnimating) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - this.padding) / (this.tileSize + this.padding));
        const y = Math.floor((e.clientY - rect.top - this.padding) / (this.tileSize + this.padding));

        this.selectTile(x, y);
    }

    handleTouch(e) {
        e.preventDefault();
        if (!this.gameStarted || this.isAnimating) return;

        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((touch.clientX - rect.left - this.padding) / (this.tileSize + this.padding));
        const y = Math.floor((touch.clientY - rect.top - this.padding) / (this.tileSize + this.padding));

        this.selectTile(x, y);
    }

    selectTile(x, y) {
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return;

        if (!this.selected) {
            this.selected = { x, y };
            this.draw();
        } else {
            if (this.selected.x === x && this.selected.y === y) {
                this.selected = null;
                this.draw();
            } else if (this.isAdjacent(this.selected.x, this.selected.y, x, y)) {
                this.swapTiles(this.selected.x, this.selected.y, x, y);
            } else {
                this.selected = { x, y };
                this.draw();
            }
        }
    }

    isAdjacent(x1, y1, x2, y2) {
        return (Math.abs(x1 - x2) === 1 && y1 === y2) || (Math.abs(y1 - y2) === 1 && x1 === x2);
    }

    async swapTiles(x1, y1, x2, y2) {
        this.isAnimating = true;

        // Swap tiles
        const temp = this.grid[y1][x1];
        this.grid[y1][x1] = this.grid[y2][x2];
        this.grid[y2][x2] = temp;

        this.selected = null;
        this.draw();

        await this.delay(200);

        // Check for matches
        const matches = this.findMatches();
        if (matches.length > 0) {
            await this.processMatches();
        } else {
            // Swap back if no matches
            const temp = this.grid[y1][x1];
            this.grid[y1][x1] = this.grid[y2][x2];
            this.grid[y2][x2] = temp;
            this.draw();
        }

        this.isAnimating = false;
    }

    findMatches() {
        const matches = [];

        // Check horizontal matches
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth - 2; x++) {
                if (this.grid[y][x] && this.grid[y][x] === this.grid[y][x + 1] && this.grid[y][x] === this.grid[y][x + 2]) {
                    matches.push({ x, y }, { x: x + 1, y }, { x: x + 2, y });
                }
            }
        }

        // Check vertical matches
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight - 2; y++) {
                if (this.grid[y][x] && this.grid[y][x] === this.grid[y + 1][x] && this.grid[y][x] === this.grid[y + 2][x]) {
                    matches.push({ x, y }, { x, y: y + 1 }, { x, y: y + 2 });
                }
            }
        }

        return matches;
    }

    async processMatches() {
        let matches = this.findMatches();
        while (matches.length > 0) {
            // Remove matches
            this.removeMatches();
            this.score += matches.length * 10;
            this.updateScore();
            this.draw();

            await this.delay(300);

            // Fill empty spaces
            this.fillEmptySpaces();
            this.draw();

            await this.delay(300);

            // Check for new matches
            matches = this.findMatches();
        }
    }

    removeMatches() {
        const matches = this.findMatches();
        const toRemove = new Set();

        matches.forEach(({ x, y }) => {
            toRemove.add(`${x},${y}`);
        });

        toRemove.forEach(key => {
            const [x, y] = key.split(',').map(Number);
            this.grid[y][x] = null;
        });
    }

    fillEmptySpaces() {
        // Move gems down
        for (let x = 0; x < this.gridWidth; x++) {
            let emptyY = this.gridHeight - 1;
            for (let y = this.gridHeight - 1; y >= 0; y--) {
                if (this.grid[y][x]) {
                    if (y !== emptyY) {
                        this.grid[emptyY][x] = this.grid[y][x];
                        this.grid[y][x] = null;
                    }
                    emptyY--;
                }
            }

            // Fill empty spaces at top
            for (let y = emptyY; y >= 0; y--) {
                this.grid[y][x] = this.getRandomGem();
            }
        }
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    updateTimer() {
        this.timerElement.textContent = this.timer;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
                    this.ctx.roundRect(tileX, tileY, this.tileSize, this.tileSize, 8);
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
    new DuiDuiPeng();
});
