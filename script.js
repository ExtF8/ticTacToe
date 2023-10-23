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
    };

    return {
        playTurn,
        restartGame,
    };
})();

// Display Controller module
const DisplayController = (() => {
    const cells = document.querySelectorAll('.cell');
    const winnerElement = document.getElementById('winner');
    const gameButton = document.getElementById('gameButton');

    // Update ui
    const updateUI = (index, board) => {
        const cell = cells[index];
        if (board[index] === 'X') {
            cell.classList.add('x');
        } else if (board[index] === 'O') {
            cell.classList.add('o');
        }
    };

    // Function to update the game board UI, and add click event
    const renderBoard = () => {
        const board = GameBoard.getBoard();
        cells.forEach((cell, index) => {
            cell.addEventListener('click', () => {
                GameController.playTurn(index);
                updateUI(index, board);
                console.log(board);
            });
        });
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
        GameController.restartGame();
        console.log('gameButton')
    });

    return {
        renderBoard,
        updateWinner,
        updateScore,
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    // Initial render of the game board
    DisplayController.renderBoard();
});
