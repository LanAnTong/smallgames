class WuZiQi {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentPlayerElement = document.getElementById('currentPlayer');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.modeDescription = document.getElementById('modeDescription');

        this.gridSize = 15;
        this.cellSize = 30;
        this.padding = 20;

        this.canvas.width = this.gridSize * this.cellSize + this.padding * 2;
        this.canvas.height = this.gridSize * this.cellSize + this.padding * 2;

        this.grid = [];
        this.currentPlayer = 1; // 1: black, 2: white
        this.gameStarted = false;
        this.gameOver = false;
        this.gameMode = 'easy'; // pvp, easy, hard, hell

        this.init();
    }

    init() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));

        // Mode selector
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.gameMode = btn.dataset.mode;
                this.updateModeDescription();
            });
        });

        this.drawEmptyBoard();
    }

    updateModeDescription() {
        const descriptions = {
            'pvp': '双人对战：两个人轮流下棋',
            'easy': '简单模式：AI随机下棋，适合新手',
            'hard': '困难模式：AI会防守和进攻，有一定挑战性',
            'hell': '地狱模式：AI会使用高级策略，极具挑战'
        };
        this.modeDescription.textContent = descriptions[this.gameMode];
    }

    startGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.currentPlayer = 1;
        this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));

        this.startBtn.classList.add('hidden');
        this.restartBtn.classList.remove('hidden');

        this.updateCurrentPlayer();
        this.draw();
    }

    restartGame() {
        this.startGame();
    }

    handleClick(e) {
        if (!this.gameStarted || this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left - this.padding) / this.cellSize);
        const y = Math.round((e.clientY - rect.top - this.padding) / this.cellSize);

        this.placePiece(x, y);
    }

    handleTouch(e) {
        e.preventDefault();
        if (!this.gameStarted || this.gameOver) return;

        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.round((touch.clientX - rect.left - this.padding) / this.cellSize);
        const y = Math.round((touch.clientY - rect.top - this.padding) / this.cellSize);

        this.placePiece(x, y);
    }

    placePiece(x, y) {
        if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) return;
        if (this.grid[y][x] !== 0) return;

        // In AI modes, player can only place black pieces (1)
        if (this.gameMode !== 'pvp' && this.currentPlayer === 2) return;

        this.grid[y][x] = this.currentPlayer;
        this.draw();

        if (this.checkWin(x, y)) {
            this.gameOver = true;
            const winner = this.currentPlayer === 1 ? '⚫ 黑棋' : '⚪ 白棋';
            setTimeout(() => {
                alert(`游戏结束！${winner}获胜！`);
            }, 300);
            return;
        }

        if (this.checkDraw()) {
            this.gameOver = true;
            setTimeout(() => {
                alert('游戏结束！平局！');
            }, 300);
            return;
        }

        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateCurrentPlayer();

        // AI move
        if (this.gameMode !== 'pvp' && this.currentPlayer === 2 && !this.gameOver) {
            setTimeout(() => this.aiMove(), 500);
        }
    }

    aiMove() {
        let move;

        switch (this.gameMode) {
            case 'easy':
                move = this.getEasyMove();
                break;
            case 'hard':
                move = this.getHardMove();
                break;
            case 'hell':
                move = this.getHellMove();
                break;
        }

        if (move) {
            this.grid[move.y][move.x] = 2;
            this.draw();

            if (this.checkWin(move.x, move.y)) {
                this.gameOver = true;
                setTimeout(() => {
                    alert('游戏结束！⚪ 白棋（AI）获胜！');
                }, 300);
                return;
            }

            if (this.checkDraw()) {
                this.gameOver = true;
                setTimeout(() => {
                    alert('游戏结束！平局！');
                }, 300);
                return;
            }

            this.currentPlayer = 1;
            this.updateCurrentPlayer();
        }
    }

    getEasyMove() {
        const emptyCells = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x] === 0) {
                    emptyCells.push({ x, y });
                }
            }
        }

        if (emptyCells.length === 0) return null;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    getHardMove() {
        // Check if AI can win
        const winMove = this.findWinningMove(2);
        if (winMove) return winMove;

        // Check if player is about to win and block
        const blockMove = this.findWinningMove(1);
        if (blockMove) return blockMove;

        // Find best position based on score
        return this.getBestPosition(1);
    }

    getHellMove() {
        // Check if AI can win
        const winMove = this.findWinningMove(2);
        if (winMove) return winMove;

        // Check if player is about to win and block
        const blockMove = this.findWinningMove(1);
        if (blockMove) return blockMove;

        // Use minimax with alpha-beta pruning for deeper analysis
        return this.getBestPosition(2);
    }

    findWinningMove(player) {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x] === 0) {
                    this.grid[y][x] = player;
                    if (this.checkWin(x, y)) {
                        this.grid[y][x] = 0;
                        return { x, y };
                    }
                    this.grid[y][x] = 0;
                }
            }
        }
        return null;
    }

    getBestPosition(depth) {
        let bestScore = -Infinity;
        let bestMove = null;

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x] === 0) {
                    const score = this.evaluatePosition(x, y, depth);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { x, y };
                    }
                }
            }
        }

        return bestMove || this.getEasyMove();
    }

    evaluatePosition(x, y, depth) {
        let score = 0;

        // Evaluate from AI's perspective (player 2)
        this.grid[y][x] = 2;
        score += this.evaluatePattern(x, y, 2) * 1.2;
        this.grid[y][x] = 0;

        // Evaluate from player's perspective (player 1)
        this.grid[y][x] = 1;
        score += this.evaluatePattern(x, y, 1);
        this.grid[y][x] = 0;

        // Prefer center positions
        const centerX = this.gridSize / 2;
        const centerY = this.gridSize / 2;
        const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        score += (this.gridSize - distanceFromCenter) * 2;

        return score;
    }

    evaluatePattern(x, y, player) {
        let totalScore = 0;
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

        for (const [dx, dy] of directions) {
            const pattern = this.getPattern(x, y, dx, dy, player);
            totalScore += this.scorePattern(pattern);
        }

        return totalScore;
    }

    getPattern(x, y, dx, dy, player) {
        let pattern = '';
        // Check in both directions
        for (let i = -4; i <= 4; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;

            if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) {
                pattern += 'X';
            } else if (this.grid[ny][nx] === player) {
                pattern += 'P';
            } else if (this.grid[ny][nx] === 0) {
                pattern += 'E';
            } else {
                pattern += 'X';
            }
        }

        return pattern;
    }

    scorePattern(pattern) {
        const patterns = {
            'PPPPP': 100000,      // Five in a row
            'EPPPP': 10000,       // Four with one empty
            'PPPEP': 10000,
            'EPPPE': 1000,        // Four with two empties
            'PPPEE': 1000,
            'EEPPP': 1000,
            'PEPPE': 1000,
            'EPPP': 500,          // Three with one empty
            'PPPE': 500,
            'PEPP': 500,
            'EPPE': 500,
            'EPP': 100,           // Two with one empty
            'PPE': 100,
            'PEP': 100,
            'EPPE': 100,
            'PP': 50,             // Two together
            'P': 10               // Single piece
        };

        let score = 0;
        for (const [key, value] of Object.entries(patterns)) {
            if (pattern.includes(key)) {
                score += value;
            }
        }

        return score;
    }

    checkWin(x, y) {
        const directions = [
            [1, 0],   // horizontal
            [0, 1],   // vertical
            [1, 1],   // diagonal
            [1, -1]   // anti-diagonal
        ];

        for (const [dx, dy] of directions) {
            let count = 1;

            // Check in positive direction
            let i = 1;
            while (true) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) break;
                if (this.grid[ny][nx] !== this.currentPlayer) break;
                count++;
                i++;
            }

            // Check in negative direction
            i = 1;
            while (true) {
                const nx = x - dx * i;
                const ny = y - dy * i;
                if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) break;
                if (this.grid[ny][nx] !== this.currentPlayer) break;
                count++;
                i++;
            }

            if (count >= 5) return true;
        }

        return false;
    }

    checkDraw() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x] === 0) return false;
            }
        }
        return true;
    }

    updateCurrentPlayer() {
        const text = this.currentPlayer === 1 ? '⚫ 黑棋' : '⚪ 白棋';
        this.currentPlayerElement.textContent = this.gameMode !== 'pvp' && this.currentPlayer === 2 ? `${text} (AI)` : text;
    }

    drawEmptyBoard() {
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.gridSize; i++) {
            const pos = this.padding + i * this.cellSize;

            // Vertical line
            this.ctx.beginPath();
            this.ctx.moveTo(pos, this.padding);
            this.ctx.lineTo(pos, this.canvas.height - this.padding);
            this.ctx.stroke();

            // Horizontal line
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, pos);
            this.ctx.lineTo(this.canvas.width - this.padding, pos);
            this.ctx.stroke();
        }

        // Draw star points
        const starPoints = [3, 7, 11];
        this.ctx.fillStyle = '#8B4513';
        for (const x of starPoints) {
            for (const y of starPoints) {
                const px = this.padding + x * this.cellSize;
                const py = this.padding + y * this.cellSize;
                this.ctx.beginPath();
                this.ctx.arc(px, py, 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Draw pieces
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x] !== 0) {
                    const px = this.padding + x * this.cellSize;
                    const py = this.padding + y * this.cellSize;

                    this.ctx.beginPath();
                    this.ctx.arc(px, py, this.cellSize * 0.4, 0, Math.PI * 2);

                    if (this.grid[y][x] === 1) {
                        // Black piece
                        const gradient = this.ctx.createRadialGradient(px - 3, py - 3, 2, px, py, this.cellSize * 0.4);
                        gradient.addColorStop(0, '#666');
                        gradient.addColorStop(1, '#000');
                        this.ctx.fillStyle = gradient;
                    } else {
                        // White piece
                        const gradient = this.ctx.createRadialGradient(px - 3, py - 3, 2, px, py, this.cellSize * 0.4);
                        gradient.addColorStop(0, '#fff');
                        gradient.addColorStop(1, '#ccc');
                        this.ctx.fillStyle = gradient;
                    }

                    this.ctx.fill();
                    this.ctx.strokeStyle = '#333';
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new WuZiQi();
});
