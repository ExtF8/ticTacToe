// TODO refactor duplicated logic

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
            } else {
                switchPlayer();
            }
        }
    };

    // Function to handle win situation
    const handleWin = () => {
        currentPlayer.incrementScore();
        DisplayController.updateWinnerUI();
        gameStarted = false;
        DisplayController.manageCellEvents(false);
        DisplayController.manageHoverClass(false);
        console.log('win');
    };

    // Function to check winner
    const checkWin = () => {
        const board = GameBoard.getBoard();
        // Logic for checking win
        const winningCombinations = [
            [0, 1, 2], // First row
            [3, 4, 5], // Second row
            [6, 7, 8], // Third row
            [0, 3, 6], // First column
            [1, 4, 7], // Second column
            [2, 5, 8], // Third column
            [0, 4, 8], // Diagonal from 0
            [2, 4, 6], // Diagonal from 2
        ];

        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return winningCombinations[i];
            }
        }
        return null;
    };

    // Function for resetting the game board
    const restartGame = () => {
        GameBoard.resetBoard();
        console.log(GameBoard.getBoard());
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

        if (!GameController.gameStarted()) {
            return;
        }

        GameController.playTurn(index);
        if (GameBoard.getBoard()[index] !== '') {
            updateUI(index, GameBoard.getBoard());
            removeEventListenerFromCell(cell);
        }
    };

    const removeEventListenerFromCell = (cell) => {
        cell.removeEventListener('click', cellClickHandler);
    };

    // Update ui
    const updateUI = (index, board) => {
        const cell = cells[index];
        if (board[index] === 'X') {
            cell.classList.add('x');
        } else if (board[index] === 'O') {
            cell.classList.add('o');
        } else {
            clearBoard();
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

    // Function to update the game board UI, and add click event
    const renderBoard = () => {
        const board = GameBoard.getBoard();

        cells.forEach((cell, index) => {
            updateUI(index, board);
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
        if (GameController.checkWin()) {
            updateWinnerCells(cells);
            updateWinner(GameController.getCurrentPlayer().name);
            updateScore(GameController.getCurrentPlayer());
        }
    };

    gameButton.addEventListener('click', () => {
        if (GameController.gameStarted()) {
            GameController.restartGame();
            console.log('restart');
        } else {
            GameController.startGame();
            console.log('start');
        }
        // GameController.restartGame();
        console.log(GameBoard.getBoard());
        GameBoard.resetBoard();
        clearBoard();
        updateButtonLabel();
        console.log('update');

        // manageCellEvents(GameController.gameStarted())
    });

    return {
        renderBoard,
        updateWinner,
        updateScore,
        updateButtonLabel,
        manageCellEvents,
        manageHoverClass,
        updateWinnerUI,
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    // Initial render of the game board
    DisplayController.renderBoard();
    DisplayController.updateButtonLabel();

    DisplayController.updateScore(Player('Xs', 'X'));
    DisplayController.updateScore(Player('Os', 'O'));
});
