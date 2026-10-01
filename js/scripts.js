const board = document.getElementById("board");
const status = document.getElementById("status");
const currentNumber = document.getElementById("currentNumber");
const message = document.getElementById("message");

const undoButton = document.getElementById("undoButton");
const startButton = document.getElementById("startButton");

let boardNumbers = Array(25).fill(null);
let placedBoxes = [];

let nextNumber = 1;
let gameStarted = false;

// Bingo letters
const bingoLetters = ["B", "I", "N", "G", "O"];

// Keep track of lines that have already been counted
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

    // Don't overwrite an existing number
    if (boardNumbers[index] !== null) {
        return;
    }

    // Don't go beyond 25
    if (nextNumber > 25) {
        return;
    }

    boardNumbers[index] = nextNumber;

    placedBoxes.push(index);

    board.children[index].textContent = nextNumber;

    nextNumber++;

    undoButton.disabled = placedBoxes.length === 0;


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
// UNDO
// ====================================

undoButton.addEventListener("click", () => {

    if (gameStarted) {
        return;
    }

    if (placedBoxes.length === 0) {
        return;
    }

    // Last placed box
    const index = placedBoxes.pop();

    // Remove number
    boardNumbers[index] = null;

    board.children[index].textContent = "";

    // Reuse that number
    nextNumber--;

    startButton.disabled = true;

    undoButton.disabled = placedBoxes.length === 0;

    status.textContent =
        `Tap a box to place ${nextNumber}`;
});


// ====================================
// START GAME
// ====================================

startButton.addEventListener("click", () => {

    if (placedBoxes.length !== 25) {
        return;
    }

    gameStarted = true;

    undoButton.disabled = true;
    startButton.disabled = true;

    status.textContent =
        "Tap any number to cross it";

    currentNumber.textContent = "-";

    message.textContent = "";

    completedLines.clear();
});


// ====================================
// CROSS ONLY THE CLICKED BOX
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

    // Cross ONLY this box
    box.classList.add("crossed");

    // Show number
    currentNumber.textContent = number;

    status.textContent =
        `Number ${number} crossed`;

    // Check for newly completed lines
    checkLines();
}


// ====================================
// CHECK ALL STRAIGHT LINES
// ====================================

function checkLines() {

    const lines = [];


    // --------------------------------
    // HORIZONTAL LINES
    // --------------------------------

    for (let row = 0; row < 5; row++) {

        const line = [];

        for (let column = 0; column < 5; column++) {

            line.push(row * 5 + column);
        }

        lines.push({
            type: "H",
            number: row,
            boxes: line
        });
    }


    // --------------------------------
    // VERTICAL LINES
    // --------------------------------

    for (let column = 0; column < 5; column++) {

        const line = [];

        for (let row = 0; row < 5; row++) {

            line.push(row * 5 + column);
        }

        lines.push({
            type: "V",
            number: column,
            boxes: line
        });
    }


    // --------------------------------
    // DIAGONAL: TOP LEFT → BOTTOM RIGHT
    // --------------------------------

    lines.push({
        type: "D",
        number: 1,
        boxes: [
            0,
            6,
            12,
            18,
            24
        ]
    });


    // --------------------------------
    // DIAGONAL: TOP RIGHT → BOTTOM LEFT
    // --------------------------------

    lines.push({
        type: "D",
        number: 2,
        boxes: [
            4,
            8,
            12,
            16,
            20
        ]
    });


    // =================================
    // CHECK EACH LINE
    // =================================

    for (const line of lines) {

        const isComplete = line.boxes.every(index => {

            return board.children[index]
                .classList
                .contains("crossed");
        });


        // If complete and not counted before
        if (
            isComplete &&
            !completedLines.has(
                `${line.type}-${line.number}`
            )
        ) {

            completedLines.add(
                `${line.type}-${line.number}`
            );
        }
    }


    // =================================
    // COUNT COMPLETED LINES
    // =================================

    const totalLines = completedLines.size;


    // =================================
    // SHOW B → BI → BIN → BING → BINGO
    // =================================

    const lettersToShow =
        Math.min(totalLines, 5);

    message.textContent =
        bingoLetters
            .slice(0, lettersToShow)
            .join("");


    // =================================
    // BINGO!
    // =================================

    if (totalLines >= 5) {

        status.textContent =
            "🎉 You completed 5 straight lines!";

        message.textContent =
            "🎉 BINGO! 🎉";
    }
}
