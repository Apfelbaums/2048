class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore2048')) || 0;
        this.won = false;
        this.over = false;
        
        this.tileContainer = document.getElementById('tile-container');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameMessage = document.getElementById('game-message');
        this.messageText = document.getElementById('message-text');
        this.restartButton = document.getElementById('restart-btn');
        this.tryAgainButton = document.getElementById('try-again-btn');
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        // Инициализация пустой сетки 4x4
        this.grid = [];
        for (let i = 0; i < 4; i++) {
            this.grid[i] = [];
            for (let j = 0; j < 4; j++) {
                this.grid[i][j] = 0;
            }
        }
        
        this.score = 0;
        this.won = false;
        this.over = false;
        
        this.updateDisplay();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.hideGameMessage();
    }
    
    bindEvents() {
        // Обработка нажатий клавиш
        document.addEventListener('keydown', (e) => {
            if (this.over && !this.won) return;
            
            let moved = false;
            switch(e.code) {
                case 'ArrowLeft':
                    moved = this.move('left');
                    break;
                case 'ArrowRight':
                    moved = this.move('right');
                    break;
                case 'ArrowUp':
                    moved = this.move('up');
                    break;
                case 'ArrowDown':
                    moved = this.move('down');
                    break;
                default:
                    return;
            }
            
            if (moved) {
                const newTilePos = this.addRandomTile();
                this.updateDisplay(newTilePos, this.mergedPositions || []);
                
                if (this.isWon()) {
                    this.showGameWon();
                } else if (this.isGameOver()) {
                    this.showGameOver();
                }
            }
            
            e.preventDefault();
        });
        
        // Кнопки перезапуска
        this.restartButton.addEventListener('click', () => this.init());
        this.tryAgainButton.addEventListener('click', () => this.init());
    }
    
    addRandomTile() {
        const emptyCells = [];
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
            return randomCell;
        }
        return null;
    }
    
    move(direction) {
        let moved = false;
        const newGrid = JSON.parse(JSON.stringify(this.grid));
        this.mergedPositions = [];
        
        if (direction === 'left') {
            for (let i = 0; i < 4; i++) {
                const row = this.grid[i].filter(val => val !== 0);
                const mergedRow = this.mergeRow(row, i, direction);
                const newRow = mergedRow.concat(Array(4 - mergedRow.length).fill(0));
                newGrid[i] = newRow;
                
                if (!this.arraysEqual(this.grid[i], newRow)) {
                    moved = true;
                }
            }
        } else if (direction === 'right') {
            for (let i = 0; i < 4; i++) {
                const row = this.grid[i].filter(val => val !== 0);
                const mergedRow = this.mergeRow(row.reverse(), i, direction).reverse();
                const newRow = Array(4 - mergedRow.length).fill(0).concat(mergedRow);
                newGrid[i] = newRow;
                
                if (!this.arraysEqual(this.grid[i], newRow)) {
                    moved = true;
                }
            }
        } else if (direction === 'up') {
            for (let j = 0; j < 4; j++) {
                const column = [];
                for (let i = 0; i < 4; i++) {
                    if (this.grid[i][j] !== 0) {
                        column.push(this.grid[i][j]);
                    }
                }
                const mergedColumn = this.mergeRow(column, j, direction);
                
                for (let i = 0; i < 4; i++) {
                    const newValue = i < mergedColumn.length ? mergedColumn[i] : 0;
                    if (this.grid[i][j] !== newValue) {
                        moved = true;
                    }
                    newGrid[i][j] = newValue;
                }
            }
        } else if (direction === 'down') {
            for (let j = 0; j < 4; j++) {
                const column = [];
                for (let i = 3; i >= 0; i--) {
                    if (this.grid[i][j] !== 0) {
                        column.push(this.grid[i][j]);
                    }
                }
                const mergedColumn = this.mergeRow(column, j, direction).reverse();
                
                for (let i = 0; i < 4; i++) {
                    const newValue = i >= (4 - mergedColumn.length) ? mergedColumn[i - (4 - mergedColumn.length)] : 0;
                    if (this.grid[i][j] !== newValue) {
                        moved = true;
                    }
                    newGrid[i][j] = newValue;
                }
            }
        }
        
        this.grid = newGrid;
        return moved;
    }
    
    mergeRow(row, lineIndex, direction) {
        const merged = [];
        let i = 0;
        
        while (i < row.length) {
            if (i < row.length - 1 && row[i] === row[i + 1]) {
                const mergedValue = row[i] * 2;
                merged.push(mergedValue);
                this.score += mergedValue;
                
                // Сохраняем позицию объединенной плитки для анимации
                if (direction === 'left' || direction === 'right') {
                    const col = direction === 'left' ? merged.length - 1 : 4 - merged.length;
                    this.mergedPositions.push({row: lineIndex, col: col});
                } else {
                    const row = direction === 'up' ? merged.length - 1 : 4 - merged.length;
                    this.mergedPositions.push({row: row, col: lineIndex});
                }
                
                i += 2;
            } else {
                merged.push(row[i]);
                i++;
            }
        }
        
        return merged;
    }
    
    arraysEqual(a, b) {
        return a.length === b.length && a.every((val, i) => val === b[i]);
    }
    
    updateDisplay(newTilePos = null, mergedPositions = []) {
        // Обновление счета
        this.scoreElement.textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore2048', this.bestScore);
        }
        this.bestScoreElement.textContent = this.bestScore;
        
        // Очистка контейнера плиток
        this.tileContainer.innerHTML = '';
        
        // Отображение плиток
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] !== 0) {
                    const isNew = newTilePos && newTilePos.row === i && newTilePos.col === j;
                    const isMerged = mergedPositions.some(pos => pos.row === i && pos.col === j);
                    this.createTile(i, j, this.grid[i][j], isNew, isMerged);
                }
            }
        }
    }
    
    createTile(row, col, value, isNew = false, isMerged = false) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        
        if (isNew) {
            tile.classList.add('tile-new');
        }
        if (isMerged) {
            tile.classList.add('tile-merged');
        }
        
        tile.textContent = value;
        tile.dataset.row = row;
        tile.dataset.col = col;
        tile.dataset.value = value;
        
        // Позиционирование плитки
        const x = col * 122; // 107px ширина + 15px отступ
        const y = row * 122; // 107px высота + 15px отступ
        
        tile.style.left = x + 'px';
        tile.style.top = y + 'px';
        
        this.tileContainer.appendChild(tile);
        
        // Удаление анимационных классов после завершения анимации
        if (isNew || isMerged) {
            setTimeout(() => {
                tile.classList.remove('tile-new', 'tile-merged');
            }, 300);
        }
        
        return tile;
    }
    
    isWon() {
        if (this.won) return false;
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 2048) {
                    this.won = true;
                    return true;
                }
            }
        }
        return false;
    }
    
    isGameOver() {
        // Проверяем, есть ли пустые клетки
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // Проверяем, можно ли объединить соседние плитки
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.grid[i][j];
                
                // Проверяем справа
                if (j < 3 && current === this.grid[i][j + 1]) {
                    return false;
                }
                
                // Проверяем снизу
                if (i < 3 && current === this.grid[i + 1][j]) {
                    return false;
                }
            }
        }
        
        this.over = true;
        return true;
    }
    
    showGameWon() {
        this.messageText.textContent = 'Вы выиграли!';
        this.gameMessage.classList.add('game-over');
    }
    
    showGameOver() {
        this.messageText.textContent = 'Игра окончена!';
        this.gameMessage.classList.add('game-over');
    }
    
    hideGameMessage() {
        this.gameMessage.classList.remove('game-over');
    }
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
