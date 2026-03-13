document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const restartBtn = document.getElementById('restartBtn');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const modeDescription = document.getElementById('modeDescription');
    const historyModeTitle = document.getElementById('historyModeTitle');
    const modeBtns = document.querySelectorAll('.mode-btn');

    // 弹出框元素
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalConfirm = document.getElementById('modalConfirm');
    const modalCancel = document.getElementById('modalCancel');
    const modalClose = document.getElementById('modalClose');

    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snake = [];
    let smallFood = {};
    let bigFood = null;
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameLoop = null;
    let isGameRunning = false;
    let isPaused = false;
    let gameMode = 'classic'; // 'classic' 或 'loop'

    function initGame() {
        snake = [
            { x: 5, y: 10 },
            { x: 4, y: 10 },
            { x: 3, y: 10 }
        ];
        dx = 1;
        dy = 0;
        score = 0;
        scoreElement.textContent = score;
        bigFood = null;
        generateSmallFood();
    }

    function generateSmallFood() {
        smallFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        // 确保食物不会生成在蛇身上
        for (let segment of snake) {
            if (segment.x === smallFood.x && segment.y === smallFood.y) {
                generateSmallFood();
                return;
            }
        }
    }

    function generateBigFood() {
        bigFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        // 确保大食物不会生成在小食物位置
        if (bigFood.x === smallFood.x && bigFood.y === smallFood.y) {
            generateBigFood();
            return;
        }

        // 确保大食物不会生成在蛇身上
        for (let segment of snake) {
            if (bigFood.x === segment.x && bigFood.y === segment.y) {
                generateBigFood();
                return;
            }
        }
    }

    function drawGame() {
        // 清空画布
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制小食物（红色）
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(
            smallFood.x * gridSize + gridSize / 2,
            smallFood.y * gridSize + gridSize / 2,
            gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // 绘制大食物（金色）
        if (bigFood) {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(
                bigFood.x * gridSize + gridSize / 2,
                bigFood.y * gridSize + gridSize / 2,
                (gridSize / 2 - 2) * 1.5,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // 添加发光效果
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffd700';
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // 绘制蛇
        snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                ctx.fillStyle = '#4ecdc4';
            } else {
                // 蛇身
                ctx.fillStyle = '#45b7d1';
            }

            ctx.fillRect(
                segment.x * gridSize + 1,
                segment.y * gridSize + 1,
                gridSize - 2,
                gridSize - 2
            );
        });
    }

    function moveSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // 根据游戏模式处理边界
        if (gameMode === 'classic') {
            // 经典模式：撞墙死亡
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                gameOver();
                return;
            }
        } else {
            // 循环模式：穿墙
            if (head.x < 0) {
                head.x = tileCount - 1;
            } else if (head.x >= tileCount) {
                head.x = 0;
            }

            if (head.y < 0) {
                head.y = tileCount - 1;
            } else if (head.y >= tileCount) {
                head.y = 0;
            }
        }

        // 检查是否撞到自己
        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        let ateFood = false;

        // 检查是否吃到小食物
        if (head.x === smallFood.x && head.y === smallFood.y) {
            score += 10;
            scoreElement.textContent = score;
            generateSmallFood();
            ateFood = true;
        }

        // 检查是否吃到大食物
        if (bigFood && head.x === bigFood.x && head.y === bigFood.y) {
            score += 30;
            scoreElement.textContent = score;
            bigFood = null;
            ateFood = true;

            // 吃到大食物后，额外增加两节蛇身（总共增加三节）
            snake.push({ ...snake[snake.length - 1] });
            snake.push({ ...snake[snake.length - 1] });
        }

        // 随机生成大食物（30%概率）
        if (!bigFood && Math.random() < 0.3) {
            generateBigFood();
        }

        if (!ateFood) {
            snake.pop();
        }
    }

    async function gameOver() {
        isGameRunning = false;
        isPaused = false;
        clearInterval(gameLoop);
        saveScore(score);
        displayHistory();
        showGameControls('ended');
        await showAlert(`游戏结束! 你的分数是: ${score}`, '游戏结束');
    }

    function startGame() {
        if (isGameRunning) {
            return;
        }

        isGameRunning = true;
        isPaused = false;
        initGame();
        drawGame();
        showGameControls('playing');

        gameLoop = setInterval(() => {
            if (!isPaused) {
                moveSnake();
                if (isGameRunning) {
                    drawGame();
                }
            }
        }, 150);
    }

    function pauseGame() {
        if (!isGameRunning || isPaused) {
            return;
        }
        isPaused = true;
        showGameControls('paused');
    }

    function resumeGame() {
        if (!isGameRunning || !isPaused) {
            return;
        }
        isPaused = false;
        showGameControls('playing');
    }

    async function restartGame() {
        if (isGameRunning) {
            if (!(await showConfirm('游戏正在进行中，确定要重新开始吗？'))) {
                return;
            }
        }
        clearInterval(gameLoop);
        isGameRunning = false;
        isPaused = false;
        startGame();
    }

    function showGameControls(state) {
        // 隐藏所有控制按钮
        startBtn.classList.add('hidden');
        pauseBtn.classList.add('hidden');
        resumeBtn.classList.add('hidden');
        restartBtn.classList.add('hidden');

        switch (state) {
            case 'idle':
                startBtn.classList.remove('hidden');
                startBtn.textContent = '开始游戏';
                break;
            case 'playing':
                pauseBtn.classList.remove('hidden');
                restartBtn.classList.remove('hidden');
                break;
            case 'paused':
                resumeBtn.classList.remove('hidden');
                restartBtn.classList.remove('hidden');
                break;
            case 'ended':
                startBtn.classList.remove('hidden');
                startBtn.textContent = '重新开始';
                break;
        }
    }

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (!isGameRunning) return;

        const key = e.key.toLowerCase();

        // 方向键和WASD控制
        if (key === 'arrowup' || key === 'w') {
            if (dy !== 1) {
                dx = 0;
                dy = -1;
            }
            e.preventDefault();
        } else if (key === 'arrowdown' || key === 's') {
            if (dy !== -1) {
                dx = 0;
                dy = 1;
            }
            e.preventDefault();
        } else if (key === 'arrowleft' || key === 'a') {
            if (dx !== 1) {
                dx = -1;
                dy = 0;
            }
            e.preventDefault();
        } else if (key === 'arrowright' || key === 'd') {
            if (dx !== -1) {
                dx = 1;
                dy = 0;
            }
            e.preventDefault();
        }
    });

    // 触摸按钮控制
    function changeDirection(direction) {
        if (!isGameRunning) return;

        switch (direction) {
            case 'up':
                if (dy !== 1) {
                    dx = 0;
                    dy = -1;
                }
                break;
            case 'down':
                if (dy !== -1) {
                    dx = 0;
                    dy = 1;
                }
                break;
            case 'left':
                if (dx !== 1) {
                    dx = -1;
                    dy = 0;
                }
                break;
            case 'right':
                if (dx !== -1) {
                    dx = 1;
                    dy = 0;
                }
                break;
        }
    }

    // 绑定触摸按钮事件
    document.getElementById('upBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        changeDirection('up');
    });

    document.getElementById('downBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        changeDirection('down');
    });

    document.getElementById('leftBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        changeDirection('left');
    });

    document.getElementById('rightBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        changeDirection('right');
    });

    // 同时也支持鼠标点击（用于桌面测试触摸按钮）
    document.getElementById('upBtn').addEventListener('click', (e) => {
        changeDirection('up');
    });

    document.getElementById('downBtn').addEventListener('click', (e) => {
        changeDirection('down');
    });

    document.getElementById('leftBtn').addEventListener('click', (e) => {
        changeDirection('left');
    });

    document.getElementById('rightBtn').addEventListener('click', (e) => {
        changeDirection('right');
    });

    // 开始按钮事件
    startBtn.addEventListener('click', startGame);

    // 暂停、继续、重新开始按钮事件
    pauseBtn.addEventListener('click', pauseGame);
    resumeBtn.addEventListener('click', resumeGame);
    restartBtn.addEventListener('click', restartGame);

    // 历史分数功能
    const HISTORY_STORAGE_KEY = 'snakeGameHistory';

    // 保存分数到本地存储
    function saveScore(score) {
        const history = getHistory();
        const now = new Date();
        const record = {
            score: score,
            mode: gameMode,
            modeName: gameMode === 'classic' ? '经典模式' : '循环模式',
            time: now.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            timestamp: now.getTime()
        };

        history.push(record);
        // 只保留最近50条记录
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }

        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    }

    // 获取历史分数
    function getHistory() {
        try {
            const history = localStorage.getItem(HISTORY_STORAGE_KEY);
            return history ? JSON.parse(history) : [];
        } catch (e) {
            console.error('读取历史记录失败:', e);
            return [];
        }
    }

    // 显示历史分数
    function displayHistory() {
        const allHistory = getHistory();

        // 只显示当前模式的历史记录
        const filteredHistory = allHistory.filter(record => record.mode === gameMode);

        if (filteredHistory.length === 0) {
            historyList.innerHTML = '<p class="no-history">暂无历史记录</p>';
            return;
        }

        // 按时间倒序排列
        const sortedHistory = [...filteredHistory].reverse();

        // 找出当前模式的最高分
        const maxScore = Math.max(...filteredHistory.map(record => record.score));

        historyList.innerHTML = sortedHistory.map(record => {
            const isHighScore = record.score === maxScore && maxScore > 0;
            return `
                <div class="history-item ${isHighScore ? 'high-score' : ''}">
                    <div>
                        <div class="history-score">${record.score} 分</div>
                        <div class="history-time">${record.time}</div>
                    </div>
                    ${isHighScore ? '<span style="color: #f57c00;">🏆</span>' : ''}
                </div>
            `;
        }).join('');
    }

    // 清除历史记录
    async function clearHistory() {
        if (await showConfirm(`确定要清除${gameMode === 'classic' ? '经典模式' : '循环模式'}的所有历史记录吗？`)) {
            const allHistory = getHistory();
            const filteredHistory = allHistory.filter(record => record.mode !== gameMode);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filteredHistory));
            displayHistory();
        }
    }

    // 绑定清除历史按钮事件
    clearHistoryBtn.addEventListener('click', clearHistory);

    // 模式切换功能
    async function switchMode(mode) {
        if (isGameRunning) {
            if (!(await showConfirm('游戏正在进行中，切换模式将结束当前游戏，确定要切换吗？'))) {
                return;
            }
            gameOver();
        }

        gameMode = mode;

        // 更新按钮状态
        modeBtns.forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 更新模式描述
        if (mode === 'classic') {
            modeDescription.textContent = '经典模式：碰到墙壁或自己游戏结束';
            historyModeTitle.textContent = '经典模式';
        } else {
            modeDescription.textContent = '循环模式：碰到墙壁会从另一侧出现，只有碰到自己才会死亡';
            historyModeTitle.textContent = '循环模式';
        }

        // 更新历史记录显示
        displayHistory();

        // 重新初始化游戏
        initGame();
        drawGame();

        // 重置按钮状态
        showGameControls('idle');
    }

    // 绑定模式切换按钮事件
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            switchMode(mode);
        });
    });

    // 初始绘制
    initGame();
    drawGame();

    // 页面加载时显示历史记录
    displayHistory();

    // 初始化按钮状态
    showGameControls('idle');

    // 自定义弹出框函数
    let modalResolve = null;

    function showAlert(message, title = '提示') {
        return new Promise((resolve) => {
            modalTitle.textContent = title;
            modalBody.innerHTML = `<p>${message}</p>`;
            modalConfirm.textContent = '确定';
            modalCancel.classList.add('hidden');
            modalOverlay.classList.add('show');

            const closeHandler = () => {
                modalOverlay.classList.remove('show');
                modalConfirm.removeEventListener('click', confirmHandler);
                modalClose.removeEventListener('click', closeHandler);
                modalOverlay.removeEventListener('click', overlayHandler);
                resolve(true);
            };

            const confirmHandler = () => {
                closeHandler();
            };

            const overlayHandler = (e) => {
                if (e.target === modalOverlay) {
                    closeHandler();
                }
            };

            modalConfirm.addEventListener('click', confirmHandler);
            modalClose.addEventListener('click', closeHandler);
            modalOverlay.addEventListener('click', overlayHandler);
        });
    }

    function showConfirm(message, title = '确认') {
        return new Promise((resolve) => {
            modalTitle.textContent = title;
            modalBody.innerHTML = `<p>${message}</p>`;
            modalConfirm.textContent = '确定';
            modalCancel.textContent = '取消';
            modalCancel.classList.remove('hidden');
            modalOverlay.classList.add('show');

            const closeHandler = (result) => {
                modalOverlay.classList.remove('show');
                modalConfirm.removeEventListener('click', confirmHandler);
                modalCancel.removeEventListener('click', cancelHandler);
                modalClose.removeEventListener('click', closeHandler);
                modalOverlay.removeEventListener('click', overlayHandler);
                resolve(result);
            };

            const confirmHandler = () => {
                closeHandler(true);
            };

            const cancelHandler = () => {
                closeHandler(false);
            };

            const overlayHandler = (e) => {
                if (e.target === modalOverlay) {
                    closeHandler(false);
                }
            };

            modalConfirm.addEventListener('click', confirmHandler);
            modalCancel.addEventListener('click', cancelHandler);
            modalClose.addEventListener('click', () => closeHandler(false));
            modalOverlay.addEventListener('click', overlayHandler);
        });
    }
});
