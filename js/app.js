import {
  DIFFICULTIES,
  GUESS_FACES,
  LOSE_FACES,
  WIN_FACES,
} from "./constants.js";
import { shuffle, getRandomItem } from "./randomHelpers.js";
import {
  getTextAsScore,
  getAdjacentMineIcon,
  getFlagIcon,
  getMineIcon,
  getMisplacedFlagIcon,
} from "./styleHelpers.js";

// STATE
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
let losingCellIndex = -1;

// DOM ELEMENTS
const boardElem = document.getElementById("board");
const difficultyElem = document.getElementById("difficulty");
const cellElems = [];
const flagsElem = document.getElementById("flags");
const timerElem = document.getElementById("timer");
const timerIconElem = document.querySelector("#timer + div");
const resetBtn = document.getElementById("reset");

// APP
resetBtn.addEventListener("click", init);
difficultyElem.addEventListener("click", (evt) => {
  if (!evt.target.matches("[name='difficulty']")) {
    return;
  }

  const diffKey = evt.target.id;
  const newDifficulty = DIFFICULTIES[diffKey];
  if (newDifficulty !== difficulty) {
    difficulty = newDifficulty;
    init();
  }
});

init();
function init() {
  clearState();
  clearTimer();
  initBoard();

  boardElem.removeEventListener("click", handleCellClick);
  boardElem.addEventListener("click", handleCellClick);

  render();
}

function clearState() {
  gameState = "PLAYING";
  hasPlacedMines = false;
  losingCellIndex = -1;
  flags = {};
  board.splice(0, board.length);
  boardSolution.splice(0, boardSolution.length);
  shuffledIndices.splice(0, shuffledIndices.length);
}

function clearTimer() {
  seconds = 0;
  clearTimeout(timerUpdater);
  timerIconElem.className = "timer-unset";
}

function initBoard() {
  boardElem.innerHTML = null;
  cellElems.splice(0, cellElems.length);
  boardElem.style.gridTemplateColumns = `repeat(${difficulty.colCount}, 1fr)`;

  for (let idx = 0; idx < difficulty.colCount * difficulty.rowCount; ++idx) {
    board.push(null);
    boardSolution.push(0);
    shuffledIndices.push(idx);

    addCellElement();
  }
}

function addCellElement() {
  const cellElem = document.createElement("button");
  cellElem.classList.add("cell");

  boardElem.append(cellElem);
  cellElems.push(cellElem);
}

function handleCellClick(evt) {
  if (!evt.target.classList.contains("cell")) {
    return;
  }

  const cellIndex = cellElems.indexOf(evt.target);
  losingCellIndex = cellIndex;

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
    timerElem.textContent = getTextAsScore(seconds);
  }, 1000);
}

function generateMines(safeCellIndex) {
  hasPlacedMines = true;
  flags = {};

  // Remove a pocket of cells from mine selection ...
  for (const adjacentIdx of getAdjacentCellIndices(safeCellIndex, true)) {
    const index = shuffledIndices.indexOf(adjacentIdx);
    shuffledIndices.splice(index, 1);
  }
  shuffle(shuffledIndices);

  for (let idx = 0; idx < difficulty.mineCount; ++idx) {
    const mine = shuffledIndices[idx];
    boardSolution[mine] = -1;

    for (const adjacentIdx of getAdjacentCellIndices(mine)) {
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
    // Update the user's board w/mines ...
    boardSolution.forEach((cellValue, idx) => {
      if (cellValue < 0) {
        board[idx] = cellValue;
      }
    });
  }

  clearTimeout(timerUpdater);
  boardElem.removeEventListener("click", handleCellClick);
}

function render() {
  for (let idx = 0; idx < board.length; ++idx) {
    renderCell(idx);
  }

  if (gameState === "LOSE") {
    renderLoseCells();
  }

  renderScoreboard();
}

function renderCell(cellIndex) {
  const cellElem = cellElems[cellIndex];
  const cellValue = board[cellIndex];

  cellElem.innerHTML = "";

  const isMarked = cellValue !== null && !flags[cellIndex];
  cellElem.classList.toggle("pressed", isMarked);

  if (flags[cellIndex]) {
    cellElem.innerHTML = getFlagIcon();
  } else if (cellValue > 0) {
    cellElem.innerHTML = getAdjacentMineIcon(cellValue);
  } else if (cellValue < 0) {
    cellElem.innerHTML = getMineIcon();
  }
}

function renderLoseCells() {
  const losingElem = cellElems[losingCellIndex];
  losingElem.style = "background-color: yellow";

  for (const idx in flags) {
    if (boardSolution[idx] !== -1) {
      const cellElem = cellElems[idx];
      cellElem.innerHTML = getMisplacedFlagIcon();
    }
  }
}

function renderScoreboard() {
  flagsElem.textContent = getTextAsScore(
    difficulty.mineCount - Object.keys(flags).length
  );
  timerElem.textContent = getTextAsScore(seconds);

  timerIconElem.className = "icon timer-done";

  if (gameState === "PLAYING") {
    timerIconElem.className = !hasPlacedMines
      ? "icon timer-unset"
      : "icon timer-tick";
    resetBtn.innerText = "🙂";
  } else if (gameState === "WIN") {
    resetBtn.innerText = getRandomItem(WIN_FACES);
  } else if (gameState === "LOSE") {
    resetBtn.innerText = getRandomItem(LOSE_FACES);
  }
}

initPreviewRendering();
function initPreviewRendering() {
  window.addEventListener("keydown", handleFlagPreviewMode);
  window.addEventListener("keyup", handleFlagPreviewMode);
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

  boardElem.addEventListener("mouseover", handleFlagPreviewSelection);
  boardElem.addEventListener("mouseout", handleFlagPreviewSelection);
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

  window.addEventListener("mousedown", renderGuessFace);
  window.addEventListener("mouseup", renderGuessFace);
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
}

/* --- helpers --- */

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
