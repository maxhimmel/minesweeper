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
let flags = {};
const boardSolution = [];
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
  boardSolution.splice(0, boardSolution.length);
  flags = {};
  shuffledIndices.splice(0, shuffledIndices.length);
  boardElem.innerHTML = null;
  cellElems.splice(0, cellElems.length);
  boardElem.style.gridTemplateColumns = `repeat(${difficulty.colCount}, 1fr)`;

  for (let idx = 0; idx < difficulty.colCount * difficulty.rowCount; ++idx) {
    board.push(null);
    boardSolution.push(0);
    shuffledIndices.push(idx);

    const cellElem = document.createElement("button");
    cellElem.classList.add("cell");

    boardElem.append(cellElem);
    cellElems.push(cellElem);
  }

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

  if (!tryHandleFlagToggle(evt, cellIndex)) {
    if (!hasPlacedMines) {
      generateMines(cellIndex);
    }

    if (!flags[cellIndex]) {
      revealCell(cellIndex);
    }
  }

  render();
}

function tryHandleFlagToggle(evt, cellIndex) {
  if (!evt.altKey) {
    return false;
  }

  if (flags[cellIndex]) {
    delete flags[cellIndex];
    if (board.length > 0) {
      board[cellIndex] = null;
    }
  } else {
    flags[cellIndex] = true;
    if (board.length > 0) {
      board[cellIndex] = -1;
    }
  }

  return true;
}

function generateMines(safeCellIndex) {
  hasPlacedMines = true;
  flags = {};

  // shuffledIndices.splice(safeCellIndex, 1);
  // shuffle(shuffledIndices);

  for (let mine = 0; mine < difficulty.mineCount; ++mine) {
    const idx = shuffledIndices[mine];
    boardSolution[idx] = -1;

    for (const adjacentIdx of getAdjacentCellIndices(idx)) {
      if (boardSolution[adjacentIdx] >= 0) {
        ++boardSolution[adjacentIdx];
      }
    }
  }
}

function revealCell(cellIndex) {
  const cellValue = boardSolution[cellIndex];

  // Hit a mine!
  if (cellValue < 0) {
    boardSolution.forEach((cell, idx) => {
      if (cell < 0) {
        board[idx] = cell;
      }
    });
    return;
  }

  const visitedCells = new Set();
  revealCells(cellIndex, visitedCells);

  function revealCells(cellIndex, visitedCells) {
    if (visitedCells.size === visitedCells.add(cellIndex).size) {
      return;
    }

    if (flags[cellIndex]) {
      return;
    }

    const cellValue = boardSolution[cellIndex];
    board[cellIndex] = cellValue;

    // Hit a mine-adjacent cell!
    if (cellValue > 0) {
      return;
    }

    // Jackpot!
    for (const adjacentIdx of getAdjacentCellIndices(cellIndex)) {
      revealCells(adjacentIdx, visitedCells);
    }
  }
}

function render() {
  for (let idx = 0; idx < board.length; ++idx) {
    const cellElem = cellElems[idx];
    const cellValue = board[idx];

    cellElem.toggleAttribute("disabled", cellValue !== null && !flags[idx]);

    cellElem.style.backgroundColor = cellValue < 0 ? "red" : "lime";

    cellElem.textContent = "";

    if (flags[idx]) {
      cellElem.textContent = "f";
    }

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

function* getAdjacentCellIndices(cellIndex, includeSelf = false) {
  const cellCoord = getCellCoord(cellIndex);
  for (let col = -1; col <= 1; ++col) {
    for (let row = -1; row <= 1; ++row) {
      if (!includeSelf && col === 0 && row === 0) {
        continue;
      }

      const adjacentIndex = getCellIndex(
        cellCoord.col + col,
        cellCoord.row + row
      );
      if (adjacentIndex >= 0) {
        yield adjacentIndex;
      }
    }
  }
}
