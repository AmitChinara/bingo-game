const board = document.getElementById("board");
const status = document.getElementById("status");
const currentNumber = document.getElementById("currentNumber");
const message = document.getElementById("message");

const undoButton = document.getElementById("undoButton");
const startButton = document.getElementById("startButton");

const setupButtons = document.getElementById("setupButtons");
const gameButtons = document.getElementById("gameButtons");

const undoMoveButton = document.getElementById("undoMoveButton");
const resetGameButton = document.getElementById("resetGameButton");


// ====================================
// GAME VARIABLES
// ====================================

let boardNumbers = Array(25).fill(null);

let placedBoxes = [];

let moveHistory = [];

let nextNumber = 1;

let gameStarted = false;


// BINGO LETTERS
const bingoLetters = ["B", "I", "N", "G", "O"];


// Completed Bingo lines
let completedLines = new Set();


// ====================================
// CREATE 5 × 5 BOARD
// ====================================

for (let i = 0; i < 25; i++) {

    const box = document.createElement("div");

    box.className = "box";

    box.dataset.index = i;

    box.addEventListener("click", () => {
        handleBoxClick(i);
    });

    board.appendChild(box);
}


// ====================================
// HANDLE BOX CLICK
// ====================================

function handleBoxClick(index) {

    if (!gameStarted) {

        // Setup mode
        placeNumber(index);

    } else {

        // Game mode
        crossNumber(index);
    }
}


// ====================================
// PLACE NUMBER 1 → 25
// ====================================

function placeNumber(index) {

    // Don't overwrite a number
    if (boardNumbers[index] !== null) {
        return;
    }

    // Maximum 25
    if (nextNumber > 25) {
        return;
    }

    boardNumbers[index] = nextNumber;

    placedBoxes.push(index);

    board.children[index].textContent = nextNumber;

    nextNumber++;


    // Enable Undo
    undoButton.disabled =
        placedBoxes.length === 0;


    // All numbers placed
    if (nextNumber > 25) {

        status.textContent =
            "All 25 numbers placed! Press Start.";

        startButton.disabled = false;

    } else {

        status.textContent =
            `Tap a box to place ${nextNumber}`;
    }
}


// ====================================
// UNDO NUMBER PLACEMENT
// ====================================

undoButton.addEventListener("click", () => {

    if (gameStarted) {
        return;
    }

    if (placedBoxes.length === 0) {
        return;
    }


    // Get last placed box
    const index = placedBoxes.pop();


    // Remove number
    boardNumbers[index] = null;

    board.children[index].textContent = "";


    // Reuse number
    nextNumber--;


    // Start disabled again
    startButton.disabled = true;


    // Update Undo button
    undoButton.disabled =
        placedBoxes.length === 0;


    status.textContent =
        `Tap a box to place ${nextNumber}`;
});


// ====================================
// START GAME
// ====================================

startButton.addEventListener("click", () => {

    // Must have all 25 numbers
    if (placedBoxes.length !== 25) {
        return;
    }


    gameStarted = true;

    // Clear previous moves
    moveHistory = [];

    // Clear Bingo lines
    completedLines.clear();


    // Disable setup buttons
    undoButton.disabled = true;
    startButton.disabled = true;


    // Hide setup buttons
    setupButtons.classList.add("hidden");


    // Show game buttons
    gameButtons.classList.remove("hidden");


    // Undo Move disabled initially
    undoMoveButton.disabled = true;


    status.textContent =
        "Tap any number to cross it";

    currentNumber.textContent = "-";

    message.textContent = "";
});


// ====================================
// CROSS CLICKED BOX
// ====================================

function crossNumber(index) {

    const box = board.children[index];

    const number = boardNumbers[index];


    // Invalid box
    if (number === null) {
        return;
    }


    // Already crossed
    if (box.classList.contains("crossed")) {
        return;
    }


    // Cross ONLY clicked box
    box.classList.add("crossed");


    // Save move
    moveHistory.push(index);


    // Show number
    currentNumber.textContent = number;


    status.textContent =
        `Number ${number} crossed`;


    // Enable Undo Move
    undoMoveButton.disabled = false;


    // Check Bingo
    checkLines();
}


// ====================================
// UNDO LAST MOVE
// ====================================

undoMoveButton.addEventListener("click", () => {

    // Nothing to undo
    if (moveHistory.length === 0) {
        return;
    }


    // Get last move
    const lastIndex =
        moveHistory.pop();


    const box =
        board.children[lastIndex];


    // Remove cross
    box.classList.remove("crossed");


    // Recalculate Bingo
    checkLines();


    // Show previous move
    if (moveHistory.length > 0) {

        const previousIndex =
            moveHistory[
                moveHistory.length - 1
            ];


        currentNumber.textContent =
            boardNumbers[previousIndex];


        status.textContent =
            `Number ${boardNumbers[previousIndex]} crossed`;

    } else {

        currentNumber.textContent = "-";

        status.textContent =
            "Tap any number to cross it";
    }


    // Disable if no moves remain
    undoMoveButton.disabled =
        moveHistory.length === 0;
});


// ====================================
// CHECK BINGO LINES
// ====================================

function checkLines() {

    const lines = [];


    // --------------------------------
    // HORIZONTAL LINES
    // --------------------------------

    for (let row = 0; row < 5; row++) {

        const line = [];

        for (let column = 0; column < 5; column++) {

            line.push(
                row * 5 + column
            );
        }


        lines.push({
            id: `H-${row}`,
            boxes: line
        });
    }


    // --------------------------------
    // VERTICAL LINES
    // --------------------------------

    for (let column = 0; column < 5; column++) {

        const line = [];

        for (let row = 0; row < 5; row++) {

            line.push(
                row * 5 + column
            );
        }


        lines.push({
            id: `V-${column}`,
            boxes: line
        });
    }


    // --------------------------------
    // DIAGONAL \
    // --------------------------------

    lines.push({
        id: "D-1",
        boxes: [
            0,
            6,
            12,
            18,
            24
        ]
    });


    // --------------------------------
    // DIAGONAL /
    // --------------------------------

    lines.push({
        id: "D-2",
        boxes: [
            4,
            8,
            12,
            16,
            20
        ]
    });


    // --------------------------------
    // FIND COMPLETED LINES
    // --------------------------------

    const newCompletedLines = new Set();


    for (const line of lines) {

        const isComplete =
            line.boxes.every(index => {

                return board.children[index]
                    .classList
                    .contains("crossed");
            });


        if (isComplete) {

            newCompletedLines.add(line.id);
        }
    }


    // Replace old line state
    completedLines =
        newCompletedLines;


    // --------------------------------
    // COUNT LINES
    // --------------------------------

    const totalLines =
        completedLines.size;


    // --------------------------------
    // B → BI → BIN → BING → BINGO
    // --------------------------------

    const lettersToShow =
        Math.min(totalLines, 5);


    message.textContent =
        bingoLetters
            .slice(0, lettersToShow)
            .join("");


    // --------------------------------
    // BINGO
    // --------------------------------

    if (totalLines >= 5) {

        status.textContent =
            "🎉 5 straight lines completed!";

        message.textContent =
            "🎉 BINGO! 🎉";
    }
}


// ====================================
// RESET GAME
// ====================================

resetGameButton.addEventListener("click", () => {

    // --------------------------------
    // RESET VARIABLES
    // --------------------------------

    boardNumbers =
        Array(25).fill(null);

    placedBoxes = [];

    moveHistory = [];

    nextNumber = 1;

    gameStarted = false;

    completedLines.clear();


    // --------------------------------
    // CLEAR BOARD
    // --------------------------------

    for (let i = 0; i < 25; i++) {

        const box =
            board.children[i];

        box.textContent = "";

        box.classList.remove("crossed");
    }


    // --------------------------------
    // RESET DISPLAY
    // --------------------------------

    currentNumber.textContent = "-";

    message.textContent = "";

    status.textContent =
        "Tap any box to place 1";


    // --------------------------------
    // SHOW SETUP
    // --------------------------------

    setupButtons.classList.remove("hidden");

    gameButtons.classList.add("hidden");


    // --------------------------------
    // RESET BUTTONS
    // --------------------------------

    undoButton.disabled = true;

    startButton.disabled = true;

    undoMoveButton.disabled = true;
});