// Constants
const EMPTY_CELL = '';
const PLAYER_X = 'X';
const PLAYER_O = 'O';
const WINNING_COMBINATIONS = [
    [0, 1, 2], // Rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // Columns
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6], // Diagonals
    [0, 4, 8],
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
    const playerOne = Player('Xs', PLAYER_X);
    const playerTwo = Player('Os', PLAYER_O);

    let currentPlayer = playerOne;

    // State of the game
    let gameStarted = false;

    const computerPlay = () => {
        if (GameModeController.getGameMode() === 'computer') {
            const difficulty = GameModeController.getDifficultyLevel();
            const move = ComputerPlayer.makeMove(
                difficulty,
                GameBoard.getBoard()
            );
            playTurn(move);
        }
    };

    // Function to start the game
    const startGame = () => {
        gameStarted = true;
        currentPlayer = playerOne;
        DisplayController.displayCurrentPlayer();
    };

    // Switch current player
    const switchPlayer = () => {
        currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;
        DisplayController.displayCurrentPlayer();
        if (
            GameModeController.getGameMode() === 'computer' &&
            currentPlayer.marker === PLAYER_O
        ) {
            setTimeout(computerPlay, 1000);
        }
    };

    const getCurrentPlayer = () => {
        return currentPlayer;
    };

    // Function for marking cell with current players mark when cell is clicked
    // and evaluating win and tie
    const playTurn = (index) => {
        if (GameBoard.setCell(index, currentPlayer.marker)) {
            // Updates cell UI of computers chosen cell
            DisplayController.updateCellUI(index, GameBoard.getBoard());
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

    // Function to check winner
    const checkWin = () => {
        const board = GameBoard.getBoard();

        for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
            const [a, b, c] = WINNING_COMBINATIONS[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return WINNING_COMBINATIONS[i]; // Returns the winning combination
            }
        }
        return null; // Returns null if no winner
    };

    // Function to handle win situation
    const handleWin = () => {
        currentPlayer.incrementScore();
        DisplayController.updateWinnerUI();
        DisplayController.manageCellEvents(false);
        DisplayController.manageHoverClass(false);
        gameStarted = false;
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
        gameStarted = false;
    };

    // Function for restarting the game
    const restartGame = () => {
        GameBoard.resetBoard();
        gameStarted = false;
        currentPlayer = playerOne;
    };

    return {
        playTurn,
        startGame,
        restartGame,
        gameStarted: () => gameStarted,
        getCurrentPlayer,
        checkWin,
        computerPlay,
    };
})();

// Game mode module
const GameModeController = (() => {
    // default game mode
    let gameMode = 'human';
    // default difficulty level
    let difficultyLevel = 'easy';

    const setGameMode = (mode) => {
        gameMode = mode;
    };

    const getGameMode = () => gameMode;

    const setDifficultyLevel = (level) => {
        difficultyLevel = level;
    };

    const getDifficultyLevel = () => difficultyLevel;

    return {
        setGameMode,
        getGameMode,
        setDifficultyLevel,
        getDifficultyLevel,
    };
})();

// Computer player module
const ComputerPlayer = (() => {
    // Computer moves
    const makeMove = (difficulty, board) => {
        switch (difficulty) {
            case 'easy':
                return makeEasyMove(board);
            case 'medium':
                return makeMediumMove(board);
            case 'hard':
                return makeHardMove(board);
            default:
                console.log('invalid difficulty level');
                return makeEasyMove(board);
        }
    };

    // Functions for random, medium and hard levels
    // Logic for random move
    const makeEasyMove = (board) => {
        let availableCells = board
            .map((cell, index) => (cell === EMPTY_CELL ? index : null))
            .filter((i) => i !== null);

        return availableCells[
            Math.floor(Math.random() * availableCells.length)
        ];
    };

    // Logic for medium move
    const makeMediumMove = (board) => {
        // Check if move can win the game
        let winMove = findWinningMove(board, PLAYER_O);
        if (winMove !== -1) return winMove;

        // Block opponent's winning move
        let blockMove = findWinningMove(board, PLAYER_X);
        if (blockMove !== -1) return blockMove;

        return makeEasyMove(board);
    };

    // Helper function to find a winning move for medium move
    const findWinningMove = (board, player) => {
        for (let [a, b, c] of WINNING_COMBINATIONS) {
            // Check if two cells in the combination have the player's marker and one is empty
            if (
                board[a] === player &&
                board[b] === player &&
                board[c] === EMPTY_CELL
            ) {
                return c;
            }
            if (
                board[a] === player &&
                board[c] === player &&
                board[b] === EMPTY_CELL
            ) {
                return b;
            }
            if (
                board[b] === player &&
                board[c] === player &&
                board[a] === EMPTY_CELL
            ) {
                return a;
            }
        }
        // return -1 if no winning move is found
        return -1;
    };
    // Logic for hard move
    const makeHardMove = (board) => {
        let bestVal = -Infinity;
        let bestMove = -1;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === EMPTY_CELL) {
                board[i] = PLAYER_O;
                let moveVal = minimax(board, 0, false);
                board[i] = EMPTY_CELL;

                if (moveVal > bestVal) {
                    bestMove = i;
                    bestVal = moveVal;
                }
            }
        }
        return bestMove;
    };

    // MiniMax
    // Function to evaluate the game's state
    const evaluate = (board) => {
        for (let [a, b, c] of WINNING_COMBINATIONS) {
            if (
                board[a] === PLAYER_O &&
                board[a] === board[b] &&
                board[a] === board[c]
            ) {
                return +10;
            } else if (
                board[a] === PLAYER_X &&
                board[a] === board[b] &&
                board[a] === board[c]
            ) {
                return -10;
            }
        }
        return 0;
    };

    // Minimax function
    const minimax = (board, depth, isMaximizing) => {
        let score = evaluate(board);

        // if maximizer has won the game return evaluated score
        if (score === 10) {
            return score - depth;
        }

        // if minimizer has won the game return evaluated score
        if (score === -10) {
            return score + depth;
        }

        // If there are no more moves and no winner then it is a tie
        if (!board.includes(EMPTY_CELL)) return 0;

        if (isMaximizing) {
            let best = -Infinity;

            for (let i = 0; i < board.length; i++) {
                if (board[i] === EMPTY_CELL) {
                    // make the move
                    board[i] = PLAYER_O;
                    // Call minimax recursively and choose the max value
                    best = Math.max(
                        best,
                        minimax(board, depth + 1, !isMaximizing)
                    );
                    // Undo the move
                    board[i] = EMPTY_CELL;
                }
            }
            return best;
        } else {
            let best = Infinity;

            for (let i = 0; i < board.length; i++) {
                if (board[i] === EMPTY_CELL) {
                    // make the move
                    board[i] = PLAYER_X;
                    // Call minimax recursively and choose the min value
                    best = Math.min(
                        best,
                        minimax(board, depth + 1, !isMaximizing)
                    );
                    // Undo the move
                    board[i] = EMPTY_CELL;
                }
            }
            return best;
        }
    };

    return {
        makeMove,
    };
})();

// Display Controller module
const DisplayController = (() => {
    const cells = document.querySelectorAll('.cell');
    const winnerElement = document.getElementById('winner');
    const gameButton = document.getElementById('gameButton');
    const gameBoardContainer = document.querySelector('.game-board');

    // Event listener for the game mode and difficulty level selections
    document.querySelectorAll('input[name="gameMode"]').forEach((input) => {
        input.addEventListener('change', (e) => {
            const difficultySelection = document.querySelector(
                '.difficulty-level-selection'
            );

            if (e.target.value === 'computer') {
                difficultySelection.classList.remove('hidden'); // Show difficulty selection
                const difficultyLevel =
                    document.getElementById('difficultyLevels').value;
                GameModeController.setDifficultyLevel(difficultyLevel);
            } else {
                difficultySelection.classList.add('hidden'); // Hide difficulty selection
            }

            if (
                GameController.gameStarted() &&
                !confirm(
                    'Changing the game mode will reset the current game. Continue?'
                )
            ) {
                e.preventDefault();
                return;
            }

            GameModeController.setGameMode(e.target.value);
            GameController.restartGame();
            updateButtonLabel();
        });
    });

    document
        .getElementById('difficultyLevels')
        .addEventListener('change', (e) => {
            if (
                GameController.gameStarted() &&
                !confirm(
                    'Changing the game mode will reset the current game. Continue?'
                )
            ) {
                e.preventDefault(); // Prevent changing the game mode
                return; // Exit the event handler
            }

            GameModeController.setDifficultyLevel(e.target.value);
            GameController.restartGame();
            updateButtonLabel();
        });

    // Function to manage hover class based on game state
    const manageHoverClass = (add) => {
        if (add) {
            gameBoardContainer.classList.remove('no-hover');
        } else {
            gameBoardContainer.classList.add('no-hover');
        }
    };

    // Function to manage click events based on game state
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
            cell.classList.add('x', 'marked');
        } else if (board[index] === PLAYER_O) {
            cell.classList.add('o', 'marked');
        }
    };

    // Update UI for current player
    const displayCurrentPlayer = () => {
        const playerOneElement = document.getElementById('symbol-x');
        const playerTwoElement = document.getElementById('symbol-o');

        if (GameController.getCurrentPlayer().marker === PLAYER_X) {
            playerOneElement.classList.add('current-player');
            playerTwoElement.classList.remove('current-player');
        } else {
            playerOneElement.classList.remove('current-player');
            playerTwoElement.classList.add('current-player');
        }
    };

    const clearBoardUI = () => {
        cells.forEach((cell) => {
            cell.classList.remove('x', 'o', 'cell-winner', 'marked');
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
        clearBoardUI();
        updateButtonLabel();
    });

    // Sets default state of hover class for cells
    manageHoverClass(false);

    return {
        updateWinner,
        updateScore,
        updateButtonLabel,
        manageCellEvents,
        manageHoverClass,
        updateWinnerUI,
        updateTieUI,
        displayCurrentPlayer,
        updateCellUI,
    };
})();

window.onload = () => {
    const defaultGameMode = GameModeController.getGameMode();
    const difficultySelection = document.querySelector(
        '.difficulty-level-selection'
    );
    if (defaultGameMode === 'computer') {
        difficultySelection.classList.remove('hidden');
    } else {
        difficultySelection.classList.add('hidden');
    }
};
