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
const WIN_FACES = ["🤠", "😎", "🥳"];
const LOSE_FACES = ["🫠", "😵", "🤯"];
const GUESS_FACES = ["😮", "😲", "🧐"];

const board = [];
let flags = {};
const boardSolution = [];
const shuffledIndices = [];
let hasPlacedMines = false;
let difficulty = DIFFICULTIES.easy;
let timerUpdater = null;
let seconds = 0;
let isFlagPreviewMode = false;
let flagPreviewIndex = -1;
let gameState = "PLAYING";

const boardElem = document.getElementById("board");
const difficultyElem = document.getElementById("difficulty");
const cellElems = [];
const flagsElem = document.getElementById("flags");
const timerElem = document.getElementById("timer");
const resetBtn = document.getElementById("reset");

init();

function init() {
  gameState = "PLAYING";
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

  resetBtn.removeEventListener("click", init);
  resetBtn.addEventListener("click", init);

  difficultyElem.removeEventListener("click", handleDifficultyChange);
  difficultyElem.addEventListener("click", handleDifficultyChange);

  window.removeEventListener("keydown", handleFlagPreviewMode);
  window.addEventListener("keydown", handleFlagPreviewMode);
  window.removeEventListener("keyup", handleFlagPreviewMode);
  window.addEventListener("keyup", handleFlagPreviewMode);

  boardElem.removeEventListener("mouseover", handleFlagPreviewSelection);
  boardElem.addEventListener("mouseover", handleFlagPreviewSelection);
  boardElem.removeEventListener("mouseout", handleFlagPreviewSelection);
  boardElem.addEventListener("mouseout", handleFlagPreviewSelection);

  window.removeEventListener("mousedown", renderGuessFace);
  window.addEventListener("mousedown", renderGuessFace);
  window.removeEventListener("mouseup", renderGuessFace);
  window.addEventListener("mouseup", renderGuessFace);

  boardElem.removeEventListener("click", handleCellClick);
  boardElem.addEventListener("click", handleCellClick);

  render();
}

function handleFlagPreviewMode(evt) {
  if (evt.key === "Alt") {
    if (evt.type === "keydown") {
      isFlagPreviewMode = true;
    } else if (evt.type === "keyup") {
      isFlagPreviewMode = false;
    }

    renderFlagPreview(isFlagPreviewMode, flagPreviewIndex);
  }
}

function handleFlagPreviewSelection(evt) {
  if (evt.target.classList.contains("cell")) {
    const cellIndex = cellElems.indexOf(evt.target);

    if (evt.type === "mouseover") {
      flagPreviewIndex = cellIndex;
      renderFlagPreview(isFlagPreviewMode, flagPreviewIndex);
    } else if (evt.type === "mouseout") {
      renderFlagPreview(false, flagPreviewIndex);
      flagPreviewIndex = -1;
    }
  }
}

function renderFlagPreview(requestPreview, cellIndex) {
  if (cellIndex < 0) {
    return;
  }

  if (board[cellIndex] !== null || flags[cellIndex]) {
    return;
  }

  const element = cellElems[cellIndex];
  element.innerHTML = requestPreview ? getFlagIcon() : "";
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

function renderGuessFace(evt) {
  if (evt.altKey || evt.shiftKey) {
    return;
  }

  if (gameState !== "PLAYING") {
    return;
  }

  const isClickingBoard =
    evt.type === "mousedown" && evt.target.matches("#board, .cell");

  if (isClickingBoard) {
    resetBtn.innerText = getRandomItem(GUESS_FACES);
  } else if (evt.type === "mouseup") {
    resetBtn.innerText = "🙂";
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

  handleGameOver();

  render();
}

function tryHandleFlagToggle(evt, cellIndex) {
  if (!evt.altKey) {
    return false;
  }

  const cellValue = board[cellIndex];
  const isFlaggable = cellValue < 0 || cellValue === null;

  if (isFlaggable) {
    if (flags[cellIndex]) {
      // remove flag ...
      delete flags[cellIndex];
      if (hasPlacedMines) {
        board[cellIndex] = null;
      }
    } else {
      // set flag ...
      flags[cellIndex] = true;
      if (hasPlacedMines) {
        board[cellIndex] = -1;
      }
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
      gameState = "LOSE";
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

function handleGameOver() {
  if (gameState === "PLAYING") {
    for (let idx = 0; idx < boardSolution.length; ++idx) {
      const lhs = board[idx];
      const rhs = boardSolution[idx];

      if (lhs !== rhs) {
        // Board doesn't match solution, so we're still playing ...
        return;
      }
    }

    gameState = "WIN";
  } else if (gameState === "LOSE") {
    boardSolution.forEach((cell, idx) => {
      if (cell < 0) {
        board[idx] = cell;
      }
    });
  }

  clearTimeout(timerUpdater);
  boardElem.removeEventListener("click", handleCellClick);
}

function render() {
  for (let idx = 0; idx < board.length; ++idx) {
    const cellElem = cellElems[idx];
    const cellValue = board[idx];

    cellElem.innerHTML = "";
    cellElem.classList.toggle("pressed", !flags[idx] && cellValue !== null);

    if (flags[idx]) {
      cellElem.innerHTML = getFlagIcon();
    } else if (cellValue > 0) {
      cellElem.innerHTML = getAdjacentMineIcon(cellValue);
    } else if (cellValue < 0) {
      cellElem.innerHTML = getMineIcon();
    }
  }

  flagsElem.textContent = `${
    difficulty.mineCount - Object.keys(flags).length
  }`.padStart(3, "0");
  timerElem.textContent = `${seconds}`.padStart(3, "0");

  resetBtn.innerText =
    gameState === "PLAYING"
      ? "🙂"
      : gameState === "WIN"
      ? getRandomItem(WIN_FACES)
      : getRandomItem(LOSE_FACES);
}

/* --- helpers --- */

function shuffle(array) {
  for (let idx = array.length - 1; idx > 0; --idx) {
    const jdx = Math.floor(Math.random() * (idx + 1));
    [array[idx], array[jdx]] = [array[jdx], array[idx]];
  }
}

function getRandomItem(array) {
  if (!Array.isArray(array)) {
    return undefined;
  }

  const randIdx = Math.floor(Math.random() * array.length);
  return array[randIdx];
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

function getFlagIcon() {
  return `<div class="flag ignore-mouse"></div>`;
}

function getMineIcon() {
  return `<div class="mine"></div>`;
}

function getAdjacentMineIcon(adjacencyCount) {
  return `<div class="mine-${adjacencyCount} ignore-mouse">${adjacencyCount}</div>`;
}
