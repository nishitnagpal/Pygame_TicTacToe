const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameStarted = false;
let gameResult = false;
let currentPlayer = 'X';
let isPlayerTurn = Math.random() < 0.5;
let squares = [['', '', ''], ['', '', ''], ['', '', '']];
let gameOverMessage = '';
let computerMoveTime = 0;
let pendingComputerMove = false;
/*let option1 = False
let option2 = False
*/

const WIDTH = 800, HEIGHT = 600;
const ROWS = 3;
const COLS = 3;
const SQUARE_SIZE = 100;

function resetGame() {
    gameStarted = false;
    gameResult = false;
    currentPlayer = 'X';
    isPlayerTurn = Math.random() < 0.5;
    squares = [['', '', ''], ['', '', ''], ['', '', '']];
    gameOverMessage = '';
    /*
    option1 = False
    option2 = False
    */
}

function drawGrid() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const startX = (WIDTH - COLS * SQUARE_SIZE) / 2;
    const startY = (HEIGHT - ROWS * SQUARE_SIZE) / 2;

    if (gameStarted) {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                ctx.strokeStyle = 'white';
                ctx.strokeRect(startX + col * SQUARE_SIZE, startY + row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);

                if (squares[row][col] !== '') {
                    ctx.fillStyle = squares[row][col] === 'X' ? 'green' : 'blue';
                    ctx.font = '48px sans-serif';
                    ctx.fillText(squares[row][col], startX + col * SQUARE_SIZE + SQUARE_SIZE / 3, startY + row * SQUARE_SIZE + SQUARE_SIZE / 1.5);
                }
            }
        }
    } else {
        ctx.fillStyle = 'blue';
        ctx.fillRect(WIDTH / 5, HEIGHT / 3, 200, 100);
        ctx.strokeStyle = 'lightblue';
        ctx.strokeRect(WIDTH / 5, HEIGHT / 3, 200, 100);
        ctx.fillRect(WIDTH / 2, HEIGHT / 3, 200, 100);
        ctx.strokeRect(WIDTH / 2, HEIGHT / 3, 200, 100);

        ctx.fillStyle = 'white';
        ctx.font = '20px Comic Sans MS';
        ctx.fillText('Play with computer', WIDTH / 5 + 15, HEIGHT / 3 + 55);
        ctx.fillText('2 Players Game', WIDTH / 2 + 25, HEIGHT / 3 + 55);
        ctx.fillText('Please select an option to play', WIDTH / 3.25, HEIGHT / 6);
    }

    if (gameOverMessage) {
        ctx.fillStyle = 'green';
        ctx.font = '48px sans-serif';
        ctx.fillText(gameOverMessage, WIDTH / 2, HEIGHT / 2);
    } else if (gameStarted) {
        ctx.fillStyle = 'white';
        ctx.font = '20px Comic Sans MS';
        ctx.fillText(gameStarted && isPlayerTurn ? "Player's Turn" : "Computer's Turn", WIDTH / 3.25, HEIGHT / 6);
    }
}

function getGridPosition(x, y) {
    const totalGridWidth = COLS * SQUARE_SIZE;
    const totalGridHeight = ROWS * SQUARE_SIZE;
    const startX = (WIDTH - totalGridWidth) / 2;
    const startY = (HEIGHT - totalGridHeight) / 2;

    if (startX <= x <= startX + totalGridWidth && startY <= y <= startY + totalGridHeight) {
        const col = Math.floor((x - startX) / SQUARE_SIZE);
        const row = Math.floor((y - startY) / SQUARE_SIZE);
        return [row, col];
    }
    return [null, null];
}

function checkWinner() {
    for (let i = 0; i < ROWS; i++) {
        if (squares[i][0] === squares[i][1] && squares[i][1] === squares[i][2] && squares[i][0] !== '') {
            return squares[i][0];
        }
        if (squares[0][i] === squares[1][i] && squares[1][i] === squares[2][i] && squares[0][i] !== '') {
            return squares[0][i];
        }
    }
    if (squares[0][0] === squares[1][1] && squares[1][1] === squares[2][2] && squares[0][0] !== '') {
        return squares[0][0];
    }
    if (squares[0][2] === squares[1][1] && squares[1][1] === squares[2][0] && squares[0][2] !== '') {
        return squares[0][2];
    }
    return null;
}

function isBoardFull() {
    for (let row of squares) {
        for (let cell of row) {
            if (cell === '') {
                return false;
            }
        }
    }
    return true;
}

function computerMove() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (squares[row][col] === '') {
                squares[row][col] = currentPlayer;
                if (checkWinner() === currentPlayer) {
                    return;
                }
                squares[row][col] = '';
            }
        }
    }

    const opponent = currentPlayer === 'X' ? 'O' : 'X';
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (squares[row][col] === '') {
                squares[row][col] = opponent;
                if (checkWinner() === opponent) {
                    squares[row][col] = currentPlayer;
                    return;
                }
                squares[row][col] = '';
            }
        }
    }

    if (squares[1][1] === '') {
        squares[1][1] = currentPlayer;
        return;
    }

    const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
    for (let [row, col] of corners) {
        if (squares[row][col] === '') {
            squares[row][col] = currentPlayer;
            return;
        }
    }

    const sides = [[0, 1], [1, 0], [1, 2], [2, 1]];
    for (let [row, col] of sides) {
        if (squares[row][col] === '') {
            squares[row][col] = currentPlayer;
            return;
        }
    }
}

function gameFinal(player, isTie = false) {
    gameResult = true;
    gameStarted = false;
    gameOverMessage = isTie ? "It's a tie!" : `${player} wins!`;

    setTimeout(() => {
        resetGame();
    }, 2000);
}

function playerMove(row, col) {
    if (squares[row][col] === '') {
        squares[row][col] = currentPlayer;
        if (checkWinner()) {
            gameFinal(currentPlayer);
        } else if (isBoardFull()) {
            gameFinal(currentPlayer, true);
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            isPlayerTurn = !isPlayerTurn;
            pendingComputerMove = true;
            computerMoveTime = performance.now();
        }
    }
}

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (!gameStarted && !gameResult) {
        if (mouseX >= WIDTH / 5 && mouseX <= WIDTH / 5 + 200 && mouseY >= HEIGHT / 3 && mouseY <= HEIGHT / 3 + 100) {
            gameStarted = true;
            isPlayerTurn = Math.random() < 0.5;
        } else if (mouseX >= WIDTH / 2 && mouseX <= WIDTH / 2 + 200 && mouseY >= HEIGHT / 3 && mouseY <= HEIGHT / 3 + 100) {
            gameStarted = true;
            isPlayerTurn = true;
        }
    } else if (gameStarted) {
        const [row, col] = getGridPosition(mouseX, mouseY);
        if (row !== null && col !== null && (isPlayerTurn || pendingComputerMove)) {
            playerMove(row, col);
        }
    }
});

function gameLoop() {
    const currentTime = performance.now();
    if (pendingComputerMove && !isPlayerTurn && currentTime - computerMoveTime > 1000) {
        computerMove();
        pendingComputerMove = false;
        if (checkWinner()) {
            gameFinal(currentPlayer);
        } else if (isBoardFull()) {
            gameFinal(currentPlayer, true);
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            isPlayerTurn = !isPlayerTurn;
        }
    }
    drawGrid();
    requestAnimationFrame(gameLoop);
}

resetGame();
gameLoop();
