const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = 800, HEIGHT = 600;
const ROWS = 3, COLS = 3;
const SQUARE_SIZE = 100;

const WHITE = 'rgb(255, 255, 255)';
const BLACK = 'rgb(0, 0, 0)';
const GREEN = 'rgb(0, 255, 0)';
const BLUE = 'rgb(0, 0, 255)';
const LIGHT_BLUE = 'rgb(173, 216, 230)';

let squares = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
let currentPlayer = "X";
let gameStarted = false;
let gameResult = false;
let option1 = false;
let option2 = false;
let isPlayerTurn = Math.random() < 0.5;
let computerMoveDelay = 1000;  // milliseconds
let computerMoveTime = 0;
let pendingComputerMove = false;

let gameOverMessage = '';

function resetGame() {
    gameStarted = false;
    gameResult = false;
    currentPlayer = 'X';
    isPlayerTurn = Math.random() < 0.5;
    squares = [['', '', ''], ['', '', ''], ['', '', '']];
    gameOverMessage = '';
}

function drawGrid() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const start_x = (WIDTH - COLS * SQUARE_SIZE) / 2;
    const start_y = (HEIGHT - ROWS * SQUARE_SIZE) / 2;

    if (gameStarted) {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                ctx.strokeStyle = WHITE;
                ctx.strokeRect(start_x + col * SQUARE_SIZE, start_y + row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);

                if (squares[row][col] !== '') {
                    ctx.fillStyle = squares[row][col] === 'X' ? GREEN : BLUE;
                    ctx.font = "48px sans-serif";
                    ctx.fillText(squares[row][col], start_x + col * SQUARE_SIZE + SQUARE_SIZE / 3, start_y + row * SQUARE_SIZE + SQUARE_SIZE / 1.5);
                }
            }
        }
    }

    if (!gameStarted && !gameResult) {
        drawOptionButton(WIDTH / 5, HEIGHT / 3, "Play with computer");
        drawOptionButton(WIDTH / 2, HEIGHT / 3, "2 Players Game");

        drawText("Please select an option to play", WIDTH / 2, HEIGHT / 6, WHITE, "20px Comic Sans MS");
    }

    if (option1 && !gameResult && gameStarted) {
        drawText(isPlayerTurn ? "Player's Turn" : "Computer's Turn", WIDTH / 2, HEIGHT / 6, WHITE, "20px Comic Sans MS");
    } else if (option2 && !gameResult && gameStarted) {
        drawText(isPlayerTurn ? "Player 1's Turn" : "Player 2's Turn", WIDTH / 2, HEIGHT / 6, WHITE, "20px Comic Sans MS");
    }

    if (gameResult) {
        ctx.fillStyle = 'green';
        ctx.font = '48px sans-serif';
        ctx.fillText(gameOverMessage, 800 / 2, 600 / 2);
    }
}

function drawOptionButton(x, y, text) {
    ctx.fillStyle = BLUE;
    ctx.fillRect(x, y, 200, 100);
    ctx.strokeStyle = LIGHT_BLUE;
    ctx.strokeRect(x, y, 200, 100);

    drawText(text, x + 100, y + 50, WHITE, "20px Comic Sans MS");
}

function drawText(text, x, y, color, font) {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}


function getGridPosition(x, y) {
    const start_x = (WIDTH - COLS * SQUARE_SIZE) / 2;
    const start_y = (HEIGHT - ROWS * SQUARE_SIZE) / 2;

    if (start_x <= x && x <= start_x + COLS * SQUARE_SIZE && start_y <= y && y <= start_y + ROWS * SQUARE_SIZE) {
        const col = Math.floor((x - start_x) / SQUARE_SIZE);
        const row = Math.floor((y - start_y) / SQUARE_SIZE);
        return { row, col };
    }
    return null;
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
        if (mouseX >= 800 / 5 && mouseX <= 800 / 5 + 200 && mouseY >= 600 / 3 && mouseY <= 600 / 3 + 100) {
            gameStarted = true;
            isPlayerTurn = Math.random() < 0.5;
        } else if (mouseX >= 800 / 2 && mouseX <= 800 / 2 + 200 && mouseY >= 600 / 3 && mouseY <= 600 / 3 + 100) {
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
