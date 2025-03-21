var numSelected = null;
var titleSelected = null;

var errors = 0;
var timer = 0;
var timerInterval;
var timerStarted = false;

var board;
var solution;

window.onload = function() {
    // Generate a random puzzle
    generateRandomPuzzle();
    setGame();
    document.getElementById("timer").innerText = "0:00";
    document.getElementById("errors").innerText = "0";
}

// Generate a random Sudoku puzzle
function generateRandomPuzzle() {
    // First create a solved Sudoku grid
    solution = generateSolvedGrid();
    
    // Create a puzzle by removing some numbers
    board = createPuzzleFromSolution(solution);
}

function generateSolvedGrid() {
    // Start with an empty grid
    let grid = Array(9).fill().map(() => Array(9).fill(0));
    
    // Fill diagonal boxes first (these can be filled independently)
    fillDiagonalBoxes(grid);
    
    // Fill the rest using backtracking
    solveSudoku(grid);
    
    // Convert to string format
    return grid.map(row => row.join(''));
}

function fillDiagonalBoxes(grid) {
    // Fill the three 3x3 diagonal boxes
    for (let box = 0; box < 9; box += 3) {
        fillBox(grid, box, box);
    }
}

function fillBox(grid, row, col) {
    let nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let index = 0;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            grid[row + i][col + j] = nums[index++];
        }
    }
}

function shuffle(array) {
    // Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function isValid(grid, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
    }
    
    // Check 3x3 box
    let startRow = Math.floor(row / 3) * 3;
    let startCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i + startRow][j + startCol] === num) return false;
        }
    }
    
    return true;
}

function solveSudoku(grid) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        
                        if (solveSudoku(grid)) {
                            return true;
                        }
                        
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function createPuzzleFromSolution(solvedGrid) {
    // Copy the solution
    let puzzle = solvedGrid.map(row => row.split(''));
    
    // Determine difficulty (higher means more cells removed)
    const difficulty = 45; // Medium difficulty (remove ~45 cells)
    
    // Remove random cells
    let count = 0;
    while (count < difficulty) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        
        if (puzzle[row][col] !== '-') {
            puzzle[row][col] = '-';
            count++;
        }
    }
    
    // Convert back to string format
    return puzzle.map(row => row.join(''));
}

function startTimer(){
    if (!timerStarted) {
        timerStarted = true;
        timerInterval = setInterval(function(){
            timer++;
            document.getElementById("timer").innerText = formatTime(timer);
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secondsLeft = seconds % 60;
    return `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
}

function setGame() {
    // Digits 1-9
    for (let i = 1; i<=9; i++) {
        let number = document.createElement("div");
        number.id = i
        number.innerText = i;
        number.addEventListener("click", selectNumber);
        number.classList.add("number");
        document.getElementById("digits").appendChild(number);
    }

    //board 9x9
    for (let r = 0; r < 9; r++){
        for (let c = 0; c < 9; c++){
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            if (board[r][c] != "-"){
                tile.innerText = board[r][c];
                tile.classList.add("tile-start");
            }
            if (r == 2 || r == 5) {
                tile.classList.add("horizontal-line");
            }
            if (c == 2 || c == 5) {
                tile.classList.add("vertical-line");
            }
            tile.addEventListener("click", selectTile);
            tile.classList.add("tile");
            document.getElementById("board").append(tile);
        }
    }
}

function selectNumber(){
    // Start the timer when a number is first selected
    startTimer();
    
    if (numSelected != null){
        numSelected.classList.remove("number-selected");
    }
    numSelected = this;
    numSelected.classList.add("number-selected");
}

function selectTile() {
    if (numSelected) {
        // Start timer if it's the first interaction
        startTimer();
        
        if (this.innerText != "") {
            return;
        }

        let coords = this.id.split("-");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);

        if (solution[r][c] == numSelected.id) {
            this.innerText = numSelected.id;
            
            // Check if the game is complete
            if (checkGameComplete()) {
                stopTimer();
                alert("Congratulations! You've completed the puzzle in " + formatTime(timer));
            }
        }
        else {
            errors += 1;
            document.getElementById("errors").innerText = errors;
        }
    }
}

function checkGameComplete() {
    for (let r = 0; r < 9; r++){
        for (let c = 0; c < 9; c++){
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            if (tile.innerText === "") {
                return false;
            }
        }
    }
    return true;
}

// Add a function to restart the game with a new puzzle
function newGame() {
    // Clear the board
    document.getElementById("board").innerHTML = "";
    
    // Reset variables
    numSelected = null;
    titleSelected = null;
    errors = 0;
    timer = 0;
    
    // Stop the timer
    if (timerStarted) {
        stopTimer();
        timerStarted = false;
    }
    
    // Generate a new puzzle
    generateRandomPuzzle();
    
    // Reset the UI
    document.getElementById("timer").innerText = "0:00";
    document.getElementById("errors").innerText = "0";
    
    // Set up the game again
    setGame();
}
