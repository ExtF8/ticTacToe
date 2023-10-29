// Constants
const EMPTY_CELL = '';
const PLAYER_X = 'X';
const PLAYER_O = 'O';
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6], // Diagonals
];

// Game board module
const GameBoard = (() => {
    // Array of cells
    let board = Array(9).fill(EMPTY_CELL);

    // Function to return current state of the board
    const getBoard = () => [...board];

    // Function to set cell on the board at index
    const setCell = (index, marker) => {
        if (board[index] === EMPTY_CELL) {
            board[index] = marker;
            return true;
        }
        return false;
    };

    // Function to reset the board
    const resetBoard = () => {
        board = Array(9).fill(EMPTY_CELL);
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
    const player1 = Player('Xs', PLAYER_X);
    const player2 = Player('Os', PLAYER_O);

    // Current currentPlayer
    let currentPlayer = player1;

    // State of the game
    let gameStarted = false;

    // Function to start the game
    const startGame = () => {
        gameStarted = true;
        currentPlayer = player1;
    };

    // Switch current currentPlayer
    const switchPlayer = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
    };

    const getCurrentPlayer = () => {
        return currentPlayer;
    };

    // Function for marking cell with current players mark when cell is clicked
    const playTurn = (index) => {
        if (GameBoard.setCell(index, currentPlayer.marker)) {
            // Check for win or tie
            if (checkWin()) {
                handleWin();
            } else if (checkTie()) {
                handleTie();
            } else {
                switchPlayer();
            }
            return true;
        }
        return false;
    };

    // Function to handle win situation
    const handleWin = () => {
        currentPlayer.incrementScore();
        DisplayController.updateWinnerUI();
        gameStarted = false;
        DisplayController.manageCellEvents(false);
        DisplayController.manageHoverClass(false);
    };

    // Function to check winner
    const checkWin = () => {
        const board = GameBoard.getBoard();
        // Logic for checking win

        for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
            const [a, b, c] = WINNING_COMBINATIONS[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return WINNING_COMBINATIONS[i];
            }
        }
        return null;
    };

    // Function for checking tie
    const checkTie = () => {
        const board = GameBoard.getBoard();
        return board.every((cell) => cell != '') && !checkWin();
    };

    // Function to handle the UI updates and game state if game is tie
    const handleTie = () => {
        DisplayController.updateTieUI();
        DisplayController.manageCellEvents(false);
        DisplayController.manageHoverClass(false);
    };
    // Function for resetting the game board
    const restartGame = () => {
        GameBoard.resetBoard();
        gameStarted = false;
        currentPlayer = player1;
    };

    return {
        playTurn,
        startGame,
        restartGame,
        gameStarted: () => gameStarted,
        getCurrentPlayer,
        checkWin,
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
            } else {
                cell.removeEventListener('click', cellClickHandler);
            }
        });
    };

    // Cell click event handler
    const cellClickHandler = (event) => {
        const cell = event.currentTarget;
        const index = Array.from(cells).indexOf(cell);

        if (GameController.playTurn(index)) {
            updateCellUI(index, GameBoard.getBoard());
            removeEventListenerFromCell(cell);
        }
    };

    const removeEventListenerFromCell = (cell) => {
        cell.removeEventListener('click', cellClickHandler);
    };

    // Update ui
    const updateCellUI = (index, board) => {
        const cell = cells[index];
        if (board[index] === PLAYER_X) {
            cell.classList.add('x');
        } else if (board[index] === PLAYER_O) {
            cell.classList.add('o');
        }
    };

    const clearBoard = () => {
        cells.forEach((cell) => {
            cell.classList.remove('x');
            cell.classList.remove('o');
            cell.classList.remove('cell-winner');
            winnerElement.textContent = '';
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

    // Function to update score
    const updateScore = (player) => {
        const scoreElement = document.querySelector(`#${player.marker}-score`);
        scoreElement.textContent = player.getScore();
    };
    // Function to update UI with winner
    const updateWinner = (winner) => {
        winnerElement.textContent = `${winner} WINS`;
    };

    // Function colors winner cells
    const updateWinnerCells = () => {
        const winningCombination = GameController.checkWin();
        if (winningCombination) {
            winningCombination.forEach((index) => {
                cells[index].classList.add('cell-winner');
            });
        }
    };

    // Function updates UI based on winner
    const updateWinnerUI = () => {
        updateWinnerCells(cells);
        updateWinner(GameController.getCurrentPlayer().name);
        updateScore(GameController.getCurrentPlayer());
    };

    // Function to update UI if game is tie
    const updateTieUI = () => {
        winnerElement.textContent = `It\'s a tie!`;
    };

    gameButton.addEventListener('click', () => {
        if (GameController.gameStarted()) {
            GameController.restartGame();
        } else {
            GameController.startGame();
        }
        GameBoard.resetBoard();
        clearBoard();
        updateButtonLabel();
    });

    return {
        updateWinner,
        updateScore,
        updateButtonLabel,
        manageCellEvents,
        manageHoverClass,
        updateWinnerUI,
        updateTieUI,
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    DisplayController.updateButtonLabel();
    DisplayController.updateScore(Player('Xs', PLAYER_X));
    DisplayController.updateScore(Player('Os', PLAYER_O));
});
