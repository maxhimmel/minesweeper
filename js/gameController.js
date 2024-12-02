import { BoardNavigator } from "./boardNavigator.js";
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
import { TimerController } from "./timerController.js";

class GameController {
  constructor() {
    this.gameState = "PLAYING";
    this.board = [];
    this.flags = {};
    this.boardSolution = [];
    this.shuffledIndices = [];
    this.hasPlacedMines = false;
    this.difficulty = DIFFICULTIES.easy;
    this.isFlagPreviewMode = false;
    this.flagPreviewIndex = -1;
    this.losingCellIndex = -1;

    this.boardNavigator = new BoardNavigator(
      this.difficulty.colCount,
      this.difficulty.rowCount
    );
    this.timerController = new TimerController(1000, "#timer", "#timer + div");

    this.boardElem = document.getElementById("board");
    this.difficultyElem = document.getElementById("difficulty");
    this.cellElems = [];
    this.flagsElem = document.getElementById("flags");
    this.resetBtn = document.getElementById("reset");

    this.cellClickEventHandler = this.handleCellClick.bind(this);

    this.resetBtn.addEventListener("click", this.init.bind(this));
    this.difficultyElem.addEventListener("click", (evt) => {
      if (!evt.target.matches("[name='difficulty']")) {
        return;
      }

      const diffKey = evt.target.id;
      const newDifficulty = DIFFICULTIES[diffKey];
      if (newDifficulty !== this.difficulty) {
        this.difficulty = newDifficulty;
        this.init();
      }
    });

    this.enablePeekCheat = false;
    this.enableShowMinesCheat = false;
  }

  init() {
    this.clearState();
    this.timerController.timer.clear();
    this.initBoard();

    this.boardElem.removeEventListener("click", this.cellClickEventHandler);
    this.boardElem.addEventListener("click", this.cellClickEventHandler);

    this.render();
  }

  clearState() {
    this.gameState = "PLAYING";
    this.hasPlacedMines = false;
    this.losingCellIndex = -1;
    this.flags = {};
    this.board.splice(0, this.board.length);
    this.boardSolution.splice(0, this.boardSolution.length);
    this.shuffledIndices.splice(0, this.shuffledIndices.length);
  }

  initBoard() {
    this.boardNavigator = new BoardNavigator(
      this.difficulty.colCount,
      this.difficulty.rowCount
    );
    this.boardElem.innerHTML = null;
    this.cellElems.splice(0, this.cellElems.length);
    this.boardElem.style.gridTemplateColumns = `repeat(${this.boardNavigator.colCount}, 1fr)`;

    for (let idx = 0; idx < this.boardNavigator.length; ++idx) {
      this.board.push(null);
      this.boardSolution.push(0);
      this.shuffledIndices.push(idx);

      this.addCellElement();
    }
  }

  addCellElement() {
    const cellElem = document.createElement("button");
    cellElem.classList.add("cell");

    this.boardElem.append(cellElem);
    this.cellElems.push(cellElem);
  }

  handleCellClick(evt) {
    if (!evt.target.classList.contains("cell")) {
      return;
    }

    const cellIndex = this.cellElems.indexOf(evt.target);
    this.losingCellIndex = cellIndex;

    if (!this.tryHandleFlagToggle(evt, cellIndex)) {
      if (!this.hasPlacedMines) {
        this.generateMines(cellIndex);
        this.timerController.timer.restart();
      }

      if (!this.flags[cellIndex]) {
        if (evt.shiftKey) {
          this.chordCell(cellIndex);
        } else {
          this.revealCell(cellIndex, false);
        }
      }
    }

    this.handleGameOver();

    this.render();
  }

  tryHandleFlagToggle(evt, cellIndex) {
    if (!evt.altKey) {
      return false;
    }

    const cellValue = this.board[cellIndex];
    const isFlaggable = cellValue < 0 || cellValue === null;

    if (isFlaggable) {
      if (this.flags[cellIndex]) {
        // remove flag ...
        delete this.flags[cellIndex];
        if (this.hasPlacedMines) {
          this.board[cellIndex] = null;
        }
      } else {
        // set flag ...
        this.flags[cellIndex] = true;
        if (this.hasPlacedMines) {
          this.board[cellIndex] = -1;
        }
      }
    }

    return true;
  }

  generateMines(safeCellIndex) {
    this.hasPlacedMines = true;
    this.flags = {};

    // Remove a pocket of cells from mine selection ...
    for (const adjacentIdx of this.boardNavigator.getAdjacentCellIndices(
      safeCellIndex,
      true
    )) {
      const index = this.shuffledIndices.indexOf(adjacentIdx);
      this.shuffledIndices.splice(index, 1);
    }
    shuffle(this.shuffledIndices);

    for (let idx = 0; idx < this.difficulty.mineCount; ++idx) {
      const mine = this.shuffledIndices[idx];
      this.boardSolution[mine] = -1;

      for (const adjacentIdx of this.boardNavigator.getAdjacentCellIndices(
        mine
      )) {
        if (this.boardSolution[adjacentIdx] >= 0) {
          ++this.boardSolution[adjacentIdx];
        }
      }
    }
  }

  // Why name it "chord"? https://en.wikipedia.org/wiki/Chording#Minesweeper_tactic
  chordCell(cellIndex) {
    const cellValue = this.board[cellIndex];
    if (!cellValue) {
      return;
    }

    let flagSum = 0;
    for (const adjacentIdx of this.boardNavigator.getAdjacentCellIndices(
      cellIndex
    )) {
      if (this.flags[adjacentIdx]) {
        ++flagSum;
      }
    }

    if (flagSum === cellValue) {
      this.revealCell(cellIndex, true);
    }
  }

  revealCell(cellIndex, ignoreInitial) {
    const that = this;
    revealCells(cellIndex, new Set(), ignoreInitial);

    function revealCells(cellIndex, visitedCells, ignoreInitial) {
      if (visitedCells.size === visitedCells.add(cellIndex).size) {
        return;
      }

      if (that.flags[cellIndex]) {
        return;
      }

      const cellValue = that.boardSolution[cellIndex];
      that.board[cellIndex] = cellValue;

      // Hit a mine!
      if (cellValue < 0) {
        that.gameState = "LOSE";
        return;
      }

      // Hit a mine-adjacent cell!
      if (!ignoreInitial && cellValue > 0) {
        return;
      }

      // Jackpot!
      for (const adjacentIdx of that.boardNavigator.getAdjacentCellIndices(
        cellIndex
      )) {
        revealCells(adjacentIdx, visitedCells, false);
      }
    }
  }

  handleGameOver() {
    if (this.gameState === "PLAYING") {
      for (let idx = 0; idx < this.boardSolution.length; ++idx) {
        const lhs = this.board[idx];
        const rhs = this.boardSolution[idx];

        if (lhs !== rhs) {
          // Board doesn't match solution, so we're still playing ...
          return;
        }
      }

      this.gameState = "WIN";
    } else if (this.gameState === "LOSE") {
      // Update the user's board w/mines ...
      this.boardSolution.forEach((cellValue, idx) => {
        if (cellValue < 0) {
          this.board[idx] = cellValue;
        }
      });
    }

    this.timerController.timer.stop();
    this.boardElem.removeEventListener("click", this.cellClickEventHandler);
  }

  render() {
    for (let idx = 0; idx < this.board.length; ++idx) {
      this.renderCell(idx);
    }

    if (this.gameState === "LOSE") {
      this.renderLoseCells();
    }

    this.renderScoreboard();

    this.handleShowMinesCheat();
  }

  renderCell(cellIndex) {
    const cellElem = this.cellElems[cellIndex];
    const cellValue = this.board[cellIndex];

    cellElem.innerHTML = "";

    const isMarked = cellValue !== null && !this.flags[cellIndex];
    cellElem.classList.toggle("pressed", isMarked);

    if (this.flags[cellIndex]) {
      cellElem.innerHTML = getFlagIcon();
    } else if (cellValue > 0) {
      cellElem.innerHTML = getAdjacentMineIcon(cellValue);
    } else if (cellValue < 0) {
      cellElem.innerHTML = getMineIcon();
    }
  }

  renderLoseCells() {
    const losingElem = this.cellElems[this.losingCellIndex];
    losingElem.style = "background-color: yellow";

    for (const idx in this.flags) {
      if (this.boardSolution[idx] !== -1) {
        const cellElem = this.cellElems[idx];
        cellElem.innerHTML = getMisplacedFlagIcon();
      }
    }
  }

  renderScoreboard() {
    this.flagsElem.textContent = getTextAsScore(
      this.difficulty.mineCount - Object.keys(this.flags).length
    );

    if (this.gameState === "PLAYING") {
      this.resetBtn.innerText = "🙂";
    } else if (this.gameState === "WIN") {
      this.resetBtn.innerText = getRandomItem(WIN_FACES);
    } else if (this.gameState === "LOSE") {
      this.resetBtn.innerText = getRandomItem(LOSE_FACES);
    }
  }

  /* --- */

  initPreviewRendering() {
    const that = this;

    window.addEventListener("keydown", handleFlagPreviewMode.bind(this));
    window.addEventListener("keyup", handleFlagPreviewMode.bind(this));
    function handleFlagPreviewMode(evt) {
      if (evt.key === "Alt") {
        if (evt.type === "keydown") {
          this.isFlagPreviewMode = true;
        } else if (evt.type === "keyup") {
          this.isFlagPreviewMode = false;
        }

        renderFlagPreview(this.isFlagPreviewMode, this.flagPreviewIndex);
      }
    }

    this.boardElem.addEventListener(
      "mouseover",
      handleFlagPreviewSelection.bind(this)
    );
    this.boardElem.addEventListener(
      "mouseout",
      handleFlagPreviewSelection.bind(this)
    );
    function handleFlagPreviewSelection(evt) {
      if (evt.target.classList.contains("cell")) {
        const cellIndex = this.cellElems.indexOf(evt.target);

        if (evt.type === "mouseover") {
          this.flagPreviewIndex = cellIndex;
          renderFlagPreview(this.isFlagPreviewMode, this.flagPreviewIndex);
        } else if (evt.type === "mouseout") {
          renderFlagPreview(false, this.flagPreviewIndex);
          this.flagPreviewIndex = -1;
        }
      }
    }

    function renderFlagPreview(requestPreview, cellIndex) {
      if (that.enableShowMinesCheat) {
        return;
      }

      if (cellIndex < 0) {
        return;
      }

      if (that.board[cellIndex] !== null || that.flags[cellIndex]) {
        return;
      }

      const element = that.cellElems[cellIndex];
      element.innerHTML = requestPreview ? getFlagIcon() : "";
    }

    window.addEventListener("mousedown", renderGuessFace.bind(this));
    window.addEventListener("mouseup", renderGuessFace.bind(this));
    function renderGuessFace(evt) {
      if (evt.altKey || evt.shiftKey) {
        return;
      }

      if (this.gameState !== "PLAYING") {
        return;
      }

      const isClickingBoard =
        evt.type === "mousedown" && evt.target.matches("#board, .cell");

      if (isClickingBoard) {
        this.resetBtn.innerText = getRandomItem(GUESS_FACES);
        this.handlePeekCheat(evt.target);
      } else if (evt.type === "mouseup") {
        this.resetBtn.innerText = "🙂";
      }
    }
  }

  /* --- cheats ---*/

  initCheats() {
    document.getElementById("peeker").addEventListener("change", (evt) => {
      this.enablePeekCheat = evt.target.checked;
    });

    document.getElementById("show-mines").addEventListener("change", (evt) => {
      this.enableShowMinesCheat = evt.target.checked;
      this.render();
    });
  }

  handlePeekCheat(clickedElement) {
    if (this.enablePeekCheat) {
      const cellIndex = this.cellElems.indexOf(clickedElement);
      if (cellIndex >= 0) {
        if (this.boardSolution[cellIndex] < 0) {
          this.resetBtn.innerText = "🫣";
        }
      }
    }
  }

  handleShowMinesCheat() {
    if (this.enableShowMinesCheat) {
      for (let idx = 0; idx < this.boardSolution.length; ++idx) {
        const cellValue = this.boardSolution[idx];
        const cellElem = this.cellElems[idx];

        if (cellValue < 0 && !this.flags[idx]) {
          cellElem.innerHTML = getMineIcon();
        } else if (cellValue >= 0 && this.flags[idx]) {
          cellElem.innerHTML = getMisplacedFlagIcon();
        }
      }
    }
  }
}

export const gameController = new GameController();
