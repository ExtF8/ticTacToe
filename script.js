// Game board module
const GameBoard = (() => {
    // Array of cells
    let board = ['', '', '', '', '', '', '', '', ''];

    // Function to return current state of the board
    const getBoard = () => board;

    // Function to set cell on the board at index
    const setCell = (index, marker) => {
        if (board[index] === '') {
            board[index] = marker;
            return true;
        }
        return false;
    };

    // Function to reset the board
    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
    };

    return {
        getBoard,
        setCell,
        resetBoard,
    };
})();

// Player factory
const Player = (name, marker) => {
    let score = 0;

    // Function for getting players score
    const getScore = () => score;

    // Function for setting players score
    const incrementScore = () => {
        score++;
    };

    return {
        name,
        marker,
        getScore,
        incrementScore,
    };
};

// Game controller module
const GameController = (() => {
    // Player objects
    const player1 = Player('Xs', 'X');
    const player2 = Player('Os', 'O');

    // Current player
    let currentPlayer = player1;

    // State of the game
    let gameStarted = false;

    // Function to start the game
    const startGame = () => {
        gameStarted = true;
    };

    // Switch current player
    const switchPlayer = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
        console.log(currentPlayer);
    };

    // Function for marking cell with current players mark when cell is clicked
    const playTurn = (index) => {
        if (GameBoard.setCell(index, currentPlayer.marker)) {
            // Check for win or tie
            if (checkWin()) {
                currentPlayer.incrementScore();
            } else {
                switchPlayer();
            }
        }
    };

    // Function to check winner
    const checkWin = () => {
        const board = GameBoard.getBoard();
        // Logic for checking win
    };

    // Function for resetting the game board
    const restartGame = () => {
        GameBoard.resetBoard();
        gameStarted = false;
    };

    return {
        playTurn,
        startGame,
        restartGame,
        gameStarted: () => gameStarted,
    };
})();

// Display Controller module
const DisplayController = (() => {
    const cells = document.querySelectorAll('.cell');
    const winnerElement = document.getElementById('winner');
    const gameButton = document.getElementById('gameButton');

    const gameBoardContainer = document.querySelector('.game-board');

    // Function to manage hover class based on game state
    const manageHoverClass = (add) => {
        if (add) {
            gameBoardContainer.classList.remove('no-hover');
        } else {
            gameBoardContainer.classList.add('no-hover');
        }
    };

    // Function to manage click events
    const manageCellEvents = (add) => {
        cells.forEach((cell) => {
            if (add) {
                cell.addEventListener('click', cellClickHandler);
                cell.classList.add(':hover');
            } else {
                cell.removeEventListener('click', cellClickHandler);
                cell.classList.remove(':hover');
            }
        });
    };

    // Cell click event handler
    const cellClickHandler = (event) => {
        const index = Array.from(cells).indexOf(event.currentTarget);
        if (GameController.gameStarted()) {
            GameController.playTurn(index);
            updateUI(index, GameBoard.getBoard());
        }
    };

    // Update ui
    const updateUI = (index, board) => {
        const cell = cells[index];
        if (board[index] === 'X') {
            cell.classList.add('x');
        } else if (board[index] === 'O') {
            cell.classList.add('o');
        }
    };

    const clearBoard = () => {
        cells.forEach((cell) => {
            cell.classList.remove('x');
            cell.classList.remove('o');
        });
    };

    // Function to update the game board UI, and add click event
    const renderBoard = () => {
        const board = GameBoard.getBoard();
        cells.forEach((cell, index) => {
            cell.addEventListener('click', () => {
                // Check if the game has started
                if (GameController.gameStarted()) {
                    GameController.playTurn(index);
                    updateUI(index, board);
                    console.log(board);
                }
            });
        });
    };

    // Function to update game button label
    const updateButtonLabel = () => {
        if (GameController.gameStarted()) {
            gameButton.textContent = 'RESTART GAME';
            manageCellEvents(true);
            manageHoverClass(true);
        } else {
            gameButton.textContent = 'START GAME';
            manageCellEvents(false);
            manageHoverClass(false);
        }
    };

    // Function to update UI with winner
    const updateWinner = (winnerName) => {
        winnerElement.textContent = `${winnerName} WINS`;
    };

    // Function to update score
    const updateScore = (player) => {
        const scoreElement = document.querySelector(`#${player.marker}-score`);
        scoreElement.textContent = player.getScore();
    };

    gameButton.addEventListener('click', () => {
        if (GameController.gameStarted()) {
            GameController.restartGame();
        } else {
            GameController.startGame();
        }
        clearBoard();
        updateButtonLabel();
    });

    return {
        renderBoard,
        updateWinner,
        updateScore,
        updateButtonLabel,
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    // Initial render of the game board
    DisplayController.renderBoard();
    DisplayController.updateButtonLabel();
});
