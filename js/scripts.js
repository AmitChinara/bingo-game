const board = document.getElementById("board");
const status = document.getElementById("status");
const currentNumber = document.getElementById("currentNumber");
const message = document.getElementById("message");

const undoButton = document.getElementById("undoButton");
const startButton = document.getElementById("startButton");

const setupButtons = document.getElementById("setupButtons");
const gameButtons = document.getElementById("gameButtons");
const resetLogicButton = document.getElementById("resetLogicButton");


// ====================================
// GAME VARIABLES
// ====================================

let boardNumbers = Array(25).fill(null);
let placedBoxes = [];

let nextNumber = 1;
let gameStarted = false;

const bingoLetters = ["B", "I", "N", "G", "O"];

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
        placeNumber(index);
    } else {
        crossNumber(index);
    }
}


// ====================================
// PLACE NUMBER
// ====================================

function placeNumber(index) {

    if (boardNumbers[index] !== null) {
        return;
    }

    if (nextNumber > 25) {
        return;
    }

    boardNumbers[index] = nextNumber;

    placedBoxes.push(index);

    board.children[index].textContent = nextNumber;

    nextNumber++;

    undoButton.disabled =
        placedBoxes.length === 0;


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
// UNDO LAST NUMBER
// ====================================

undoButton.addEventListener("click", () => {

    if (gameStarted) {
        return;
    }

    if (placedBoxes.length === 0) {
        return;
    }

    const index = placedBoxes.pop();

    boardNumbers[index] = null;

    board.children[index].textContent = "";

    nextNumber--;

    startButton.disabled = true;

    undoButton.disabled =
        placedBoxes.length === 0;

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

    setupButtons.classList.add("hidden");

    gameButtons.classList.remove("hidden");

    status.textContent =
        "Tap any number to cross it";

    currentNumber.textContent = "-";

    message.textContent = "";

    completedLines.clear();
});


// ====================================
// CROSS CLICKED BOX
// ====================================

function crossNumber(index) {

    const box = board.children[index];

    const number = boardNumbers[index];

    if (number === null) {
        return;
    }

    // Don't cross an already crossed box
    if (box.classList.contains("crossed")) {
        return;
    }

    // Cross only the clicked box
    box.classList.add("crossed");

    currentNumber.textContent = number;

    status.textContent =
        `Number ${number} crossed`;

    checkLines();
}


// ====================================
// CHECK BINGO LINES
// ====================================

function checkLines() {

    const lines = [];


    // --------------------------------
    // HORIZONTAL
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
    // VERTICAL
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
    // DIAGONAL \
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
    // DIAGONAL /
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


    // --------------------------------
    // FIND NEW COMPLETED LINES
    // --------------------------------

    for (const line of lines) {

        const isComplete =
            line.boxes.every(index => {

                return board.children[index]
                    .classList
                    .contains("crossed");
            });


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


    // --------------------------------
    // DISPLAY B → BI → BIN → BING
    // --------------------------------

    const totalLines =
        completedLines.size;

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
// FULL RESET
// ====================================

resetLogicButton.addEventListener("click", () => {

    // --------------------------------
    // CLEAR ALL NUMBERS
    // --------------------------------

    boardNumbers = Array(25).fill(null);

    placedBoxes = [];

    nextNumber = 1;

    gameStarted = false;

    completedLines.clear();


    // --------------------------------
    // CLEAR ALL BOXES
    // --------------------------------

    for (let i = 0; i < 25; i++) {

        const box = board.children[i];

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
    // SHOW SETUP BUTTONS
    // --------------------------------

    setupButtons.classList.remove("hidden");

    gameButtons.classList.add("hidden");


    // --------------------------------
    // RESET BUTTON STATES
    // --------------------------------

    undoButton.disabled = true;

    startButton.disabled = true;
});