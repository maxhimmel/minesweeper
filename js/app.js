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
let timerUpdater = null;
let seconds = 0;

const boardElem = document.getElementById("board");
const difficultyElem = document.querySelector(".difficulty");
const cellElems = [];
const flagsElem = document.getElementById("flags");
const timerElem = document.getElementById("timer");
const resetBtn = document.getElementById("reset");

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
  seconds = 0;
  clearTimeout(timerUpdater);

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

  resetBtn.removeEventListener("click", init);
  resetBtn.addEventListener("click", init);

  render();
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
      startTimer();
    }

    if (!flags[cellIndex]) {
      if (evt.shiftKey) {
        chordCell(cellIndex);
      } else {
        revealCell(cellIndex, false);
      }
    }
  }

  render();
}

function tryHandleFlagToggle(evt, cellIndex) {
  if (!evt.altKey) {
    return false;
  }

  if (board[cellIndex] !== null) {
    return;
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

function startTimer() {
  timerUpdater = setInterval(() => {
    ++seconds;
    timerElem.textContent = `${seconds}`.padStart(3, "0");
  }, 1000);
}

function generateMines(safeCellIndex) {
  hasPlacedMines = true;
  flags = {};

  // remove a pocket of cells from mine selection ...
  for (const adjacentIdx of getAdjacentCellIndices(safeCellIndex, true)) {
    const index = shuffledIndices.indexOf(adjacentIdx);
    shuffledIndices.splice(index, 1);
  }
  shuffle(shuffledIndices);

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

// Why name it "chord"? https://en.wikipedia.org/wiki/Chording#Minesweeper_tactic
function chordCell(cellIndex) {
  const cellValue = board[cellIndex];
  if (!cellValue) {
    return;
  }

  let flagSum = 0;
  for (const adjacentIdx of getAdjacentCellIndices(cellIndex)) {
    if (flags[adjacentIdx]) {
      ++flagSum;
    }
  }

  if (flagSum === cellValue) {
    revealCell(cellIndex, true);
  }
}

function revealCell(cellIndex, ignoreInitial) {
  revealCells(cellIndex, new Set(), ignoreInitial);

  function revealCells(cellIndex, visitedCells, ignoreInitial) {
    if (visitedCells.size === visitedCells.add(cellIndex).size) {
      return;
    }

    if (flags[cellIndex]) {
      return;
    }

    const cellValue = boardSolution[cellIndex];
    board[cellIndex] = cellValue;

    // Hit a mine!
    if (cellValue < 0) {
      boardSolution.forEach((cell, idx) => {
        if (cell < 0) {
          board[idx] = cell;
        }
      });
      return;
    }

    // Hit a mine-adjacent cell!
    if (!ignoreInitial && cellValue > 0) {
      return;
    }

    // Jackpot!
    for (const adjacentIdx of getAdjacentCellIndices(cellIndex)) {
      revealCells(adjacentIdx, visitedCells, false);
    }
  }
}

function render() {
  for (let idx = 0; idx < board.length; ++idx) {
    const cellElem = cellElems[idx];
    const cellValue = board[idx];

    cellElem.innerHTML = "";
    cellElem.classList.toggle("pressed", !flags[idx] && cellValue !== null);

    if (flags[idx]) {
      cellElem.innerHTML = "f";
    } else if (cellValue > 0) {
      cellElem.innerHTML = `<div class="mine-${cellValue} ignore-mouse">${cellValue}</div>`;
    } else if (cellValue < 0) {
      cellElem.innerHTML = `<div class="mine"></div>`;
    }
  }

  flagsElem.textContent = `${
    difficulty.mineCount - Object.keys(flags).length
  }`.padStart(3, "0");
  timerElem.textContent = `${seconds}`.padStart(3, "0");
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
