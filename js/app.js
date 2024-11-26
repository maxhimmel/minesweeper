const DIFFICULTIES = {
  easy: {
    rowCount: 9,
    colCount: 9,
    mineCount: 10,
  },
  medium: {
    rowCount: 16,
    colCount: 16,
    mineCount: 40,
  },
  hard: {
    rowCount: 16,
    colCount: 30,
    mineCount: 99,
  },
};

const board = [];
const shuffledIndices = [];
let hasPlacedMines = false;
let difficulty = DIFFICULTIES.easy;

const boardElem = document.getElementById("board");
const difficultyElem = document.querySelector(".difficulty");
const cellElems = [];

init();

function init() {
  hasPlacedMines = false;
  board.splice(0, board.length);
  shuffledIndices.splice(0, shuffledIndices.length);
  boardElem.innerHTML = null;
  cellElems.splice(0, cellElems.length);
  boardElem.style.gridTemplateColumns = `repeat(${difficulty.colCount}, 1fr)`;

  for (let idx = 0; idx < difficulty.colCount * difficulty.rowCount; ++idx) {
    board.push(0);
    shuffledIndices.push(idx);

    const cellElem = document.createElement("button");
    cellElem.classList.add("cell");

    boardElem.append(cellElem);
    cellElems.push(cellElem);
  }

  shuffle(shuffledIndices);

  difficultyElem.removeEventListener("click", handleDifficultyChange);
  difficultyElem.addEventListener("click", handleDifficultyChange);

  boardElem.removeEventListener("click", handleCellClick);
  boardElem.addEventListener("click", handleCellClick);
}

function handleDifficultyChange(evt) {
  if (!evt.target.matches("input[type='radio']")) {
    return;
  }

  const diffKey = evt.target.id;
  const newDifficulty = DIFFICULTIES[diffKey];
  if (newDifficulty !== difficulty) {
    difficulty = newDifficulty;
    init();
  }
}

function handleCellClick(evt) {
  if (!evt.target.classList.contains("cell")) {
    return;
  }

  const cellIndex = cellElems.indexOf(evt.target);

  if (!hasPlacedMines) {
    hasPlacedMines = true;
    generateMines(cellIndex);
  }

  render();
}

function generateMines(safeCellIndex) {
  shuffledIndices.splice(safeCellIndex, 1);

  for (let mine = 0; mine < difficulty.mineCount; ++mine) {
    const idx = shuffledIndices[mine];
    board[idx] = -1;

    // iterate over surrounding cells ...
    const mineCoord = getCellCoord(idx);
    for (let col = -1; col <= 1; ++col) {
      for (let row = -1; row <= 1; ++row) {
        const adjacentIndex = getCellIndex(
          mineCoord.col + col,
          mineCoord.row + row
        );

        if (adjacentIndex >= 0 && board[adjacentIndex] >= 0) {
          ++board[adjacentIndex];
        }
      }
    }
  }
}

function render() {
  for (let idx = 0; idx < board.length; ++idx) {
    const cellElem = cellElems[idx];
    const cellValue = board[idx];

    cellElem.style.backgroundColor = cellValue < 0 ? "red" : "lime";

    if (cellValue > 0) {
      cellElem.textContent = cellValue;
    }
  }
}

/* --- helpers --- */

function shuffle(array) {
  for (let idx = array.length - 1; idx > 0; --idx) {
    const jdx = Math.floor(Math.random() * (idx + 1));
    [array[idx], array[jdx]] = [array[jdx], array[idx]];
  }
}

function getCellCoord(index) {
  return {
    col: index % difficulty.colCount,
    row: Math.floor(index / difficulty.colCount),
  };
}

function getCellIndex(col, row) {
  if (
    col < 0 ||
    col >= difficulty.colCount ||
    row < 0 ||
    row >= difficulty.rowCount
  ) {
    return -1;
  }

  return col + row * difficulty.colCount;
}
