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
    };

    // Switch current currentPlayer
    const switchPlayer = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
        console.log(currentPlayer);
    };

    const getCurrentPlayer = () => {
        return currentPlayer;
    };

    // Function for marking cell with current players mark when cell is clicked
    const playTurn = (index) => {
        if (GameBoard.setCell(index, currentPlayer.marker)) {
            // Check for win or tie
            if (checkWin()) {
                currentPlayer.incrementScore();
                console.log(currentPlayer.name, currentPlayer.getScore());
                DisplayController.updateScore(currentPlayer);
                gameStarted = false;
                console.log(gameStarted);
                DisplayController.manageCellEvents(false);
                DisplayController.manageHoverClass(false);

            } else {
                switchPlayer();
            }
        }
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
                return true;
            }
        }
        return false;
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
        console.log('cellClickHandler called');
        const cell = event.currentTarget;
        const index = Array.from(cells).indexOf(cell);
        console.log(`Index: ${index}`);
        console.log(`Game started: ${GameController.gameStarted()}`);

        if (!GameController.gameStarted()) {
            return;
        }

        GameController.playTurn(index);
        if (GameBoard.getBoard()[index] !== '') {
            console.log('Cell set successfully');
            updateUI(index, GameBoard.getBoard());
            removeEventListenerFromCell(cell);
        } else {
            console.log('Failed to set cell');
        }
    };

    const removeEventListenerFromCell = (cell) => {
        console.log('Removing event listener from cell');
        cell.removeEventListener('click', cellClickHandler);
    };

    // Update ui
    const updateUI = (index, board) => {
        console.log(`Updating UI for index: ${index}`);
        console.log(`Board state: ${JSON.stringify(board)}`);
        const cell = cells[index];
        if (board[index] === 'X') {
            cell.classList.add('x');
        } else if (board[index] === 'O') {
            cell.classList.add('o');
        } else {
            cell.classList.remove('x');
            cell.classList.remove('o');
        }
        if (GameController.checkWin()) {
            cell.classList.add('cell-winner')
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
        manageCellEvents,
        manageHoverClass,
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    // Initial render of the game board
    DisplayController.renderBoard();
    DisplayController.updateButtonLabel();

    DisplayController.updateScore(Player('Xs', 'X'));
    DisplayController.updateScore(Player('Os', 'O'));
});
