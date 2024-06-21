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

function drawGrid() {
    ctx.fillStyle = BLACK;
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

function checkWinner(board) {
    for (let i = 0; i < ROWS; i++) {
        if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][0] !== '') {
            return board[i][0];
        }
        if (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[0][i] !== '') {
            return board[0][i];
        }
    }
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== '') {
        return board[0][0];
    }
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[0][2] !== '') {
        return board[0][2];
    }
    return null;
}

function isBoardFull(board) {
    return board.flat().every(cell => cell !== '');
}

function computerMove() {
    let madeMove = false;

    // Check for winning move
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (squares[row][col] === '') {
                squares[row][col] = currentPlayer;
                if (checkWinner(squares) === currentPlayer) {
                    return;
                }
                squares[row][col] = '';
            }
        }
    }

    // Block player's winning move
    const opponent = currentPlayer === 'X' ? 'O' : 'X';
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (squares[row][col] === '') {
                squares[row][col] = opponent;
                if (checkWinner(squares) === opponent) {
                    squares[row][col] = currentPlayer;
                    return;
                }
                squares[row][col] = '';
            }
        }
    }

    // Take center if available
    if (squares[1][1] === '') {
        squares[1][1] = currentPlayer;
        return;
    }

    // Take any available corner
    for (let [row, col] of [[0, 0], [0, 2], [2, 0], [2, 2]]) {
        if (squares[row][col] === '') {
            squares[row][col] = currentPlayer;
            return;
        }
    }

    // Take any available side
    for (let [row, col] of [[0, 1], [1, 0], [1, 2], [2, 1]]) {
        if (squares[row][col] === '') {
            squares[row][col] = currentPlayer;
            return;
        }
    }
}

function gameFinal(player, isTie = false) {
    gameResult = true;
    gameStarted = false;

    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const resultText = isTie ? "It's a tie!" : `${player} wins!`;
    drawText(resultText, WIDTH / 2, HEIGHT / 2, GREEN, "48px Comic Sans MS");

    setTimeout(resetGame, 2000);
}

function resetGame() {
    squares = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
    currentPlayer = "X";
    gameStarted = false;
    gameResult = false;
    option1 = false;
    option2 = false;
    pendingComputerMove = false;
    isPlayerTurn = Math.random() < 0.5;
}

function main() {
    resetGame();
    drawGrid();

    canvas.addEventListener('mousedown', (event) => {
        const mouseX = event.offsetX;
        const mouseY = event.offsetY;

        if (!gameStarted && !gameResult) {
            const playWithComputerRect = { x: WIDTH / 5, y: HEIGHT / 3, width: 200, height: 100 };
            const twoPlayersGameRect = { x: WIDTH / 2, y: HEIGHT / 3, width: 200, height: 100 };

            if (isInsideRect(mouseX, mouseY, playWithComputerRect)) {
                gameStarted = true;
                option1 = true;
                isPlayerTurn = Math.random() < 0.5;
            } else if (isInsideRect(mouseX, mouseY, twoPlayersGameRect)) {
                gameStarted = true;
                option2 = true;
                isPlayerTurn = true;
            }
        } else if (option2 || option1 && isPlayerTurn) {
            const position = getGridPosition(mouseX, mouseY);
            if (position) {
                const { row, col } = position;
                if (squares[row][col] === '') {
                    squares[row][col] = currentPlayer;
                    if (checkWinner(squares)) {
                        gameFinal(currentPlayer);
                    } else if (isBoardFull(squares)) {
                        gameFinal(currentPlayer, true);
                    } else {
                        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                        isPlayerTurn = !isPlayerTurn;

                        if (option1 && !isPlayerTurn) {
                            pendingComputerMove = true;
                            computerMoveTime = performance.now();
                        }
                    }
                }
            }
        }
    });

    function gameLoop() {
        if (option1 && pendingComputerMove && !isPlayerTurn && !gameResult) {
            if (performance.now() - computerMoveTime > computerMoveDelay) {
                computerMove();
                pendingComputerMove = false;
                if (checkWinner(squares)) {
                    gameFinal(currentPlayer);
                } else if (isBoardFull(squares)) {
                    gameFinal(currentPlayer, true);
                } else {
                    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                    isPlayerTurn = !isPlayerTurn;
                }
            }
        }
        drawGrid();
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
}

function isInsideRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

main();
