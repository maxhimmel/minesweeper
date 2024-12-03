import { BoardController } from "./boardController.js";
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
    this.difficulty = DIFFICULTIES.easy;
    this.board = new BoardController(
      this.difficulty.colCount,
      this.difficulty.rowCount
    );
    this.shuffledIndices = [];
    this.hasPlacedMines = false;
    this.isFlagPreviewMode = false;
    this.flagPreviewIndex = -1;
    this.losingCellIndex = -1;
    this.cellClickEventHandler = this.handleCellClick.bind(this);

    this.timerController = new TimerController(1000, "#timer", "#timer + div");

    this.boardElem = document.getElementById("board");
    this.difficultyElem = document.getElementById("difficulty");
    this.cellElems = [];
    this.flagsElem = document.getElementById("flags");
    this.resetBtn = document.getElementById("reset");

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
    this.initBoard();

    this.boardElem.removeEventListener("click", this.cellClickEventHandler);
    this.boardElem.addEventListener("click", this.cellClickEventHandler);

    this.render();
  }

  clearState() {
    this.gameState = "PLAYING";
    this.hasPlacedMines = false;
    this.losingCellIndex = -1;
    this.timerController.timer.clear();
  }

  initBoard() {
    this.board = new BoardController(
      this.difficulty.colCount,
      this.difficulty.rowCount
    );

    this.shuffledIndices = Array.from(
      { length: this.board.length },
      (_, index) => index
    );

    this.boardElem.innerHTML = null;
    this.cellElems.splice(0, this.cellElems.length);
    this.boardElem.style.gridTemplateColumns = `repeat(${this.board.navigator.colCount}, 1fr)`;

    for (let idx = 0; idx < this.board.length; ++idx) {
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
    const cell = this.board.getCell(cellIndex);

    this.losingCellIndex = cellIndex;

    if (!this.tryHandleFlagToggle(evt, cellIndex)) {
      if (!this.hasPlacedMines) {
        this.generateMines(cellIndex);
        this.timerController.timer.restart();
      }

      if (!cell.isFlagged) {
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

    if (this.hasPlacedMines) {
      this.board.toggleFlag(cellIndex);
    }

    return true;
  }

  generateMines(safeCellIndex) {
    this.hasPlacedMines = true;

    // Remove a pocket of cells from mine selection ...
    for (const adjacentIdx of this.board.navigator.getAdjacentCellIndices(
      safeCellIndex,
      true
    )) {
      const index = this.shuffledIndices.indexOf(adjacentIdx);
      this.shuffledIndices.splice(index, 1);
    }
    shuffle(this.shuffledIndices);

    for (let idx = 0; idx < this.difficulty.mineCount; ++idx) {
      const mine = this.shuffledIndices[idx];
      this.board.getCell(mine).setMine();

      for (const adjacentIdx of this.board.navigator.getAdjacentCellIndices(
        mine
      )) {
        const adjacentCell = this.board.getCell(adjacentIdx);
        if (adjacentCell.isSafe()) {
          ++adjacentCell.adjacentMineCount;
        }
      }
    }
  }

  // Why name it "chord"? https://en.wikipedia.org/wiki/Chording#Minesweeper_tactic
  chordCell(cellIndex) {
    const cell = this.board.getCell(cellIndex);
    if (!cell.isRevealed) {
      return;
    }

    let flagSum = 0;
    for (const adjacentIdx of this.board.navigator.getAdjacentCellIndices(
      cellIndex
    )) {
      const adjacentCell = this.board.getCell(adjacentIdx);
      if (adjacentCell.isFlagged) {
        ++flagSum;
      }
    }

    if (flagSum === cell.adjacentMineCount) {
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

      const cell = that.board.getCell(cellIndex);
      if (cell.isFlagged) {
        return;
      }

      cell.isRevealed = true;

      if (cell.isMine()) {
        that.gameState = "LOSE";
        return;
      }

      // Hit a mine-adjacent cell!
      if (!ignoreInitial && cell.isTouchingMine()) {
        return;
      }

      // Jackpot!
      for (const adjacentIdx of that.board.navigator.getAdjacentCellIndices(
        cellIndex
      )) {
        revealCells(adjacentIdx, visitedCells, false);
      }
    }
  }

  handleGameOver() {
    if (this.gameState === "PLAYING") {
      for (let idx = 0; idx < this.board.length; ++idx) {
        const cell = this.board.getCell(idx);
        if (!cell.isRevealed && !cell.isFlagged) {
          return;
        }
      }

      this.gameState = "WIN";
    } else if (this.gameState === "LOSE") {
      for (let idx = 0; idx < this.board.length; ++idx) {
        const cell = this.board.getCell(idx);
        if (cell.isMine()) {
          cell.isRevealed = true;
        }
      }
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
    const cell = this.board.getCell(cellIndex);

    cellElem.innerHTML = "";
    cellElem.classList.toggle("pressed", cell.isRevealed && !cell.isFlagged);

    if (cell.isFlagged) {
      cellElem.innerHTML = getFlagIcon();
    } else if (cell.isRevealed) {
      if (cell.isTouchingMine()) {
        cellElem.innerHTML = getAdjacentMineIcon(cell.adjacentMineCount);
      } else if (cell.isMine()) {
        cellElem.innerHTML = getMineIcon();
      }
    }
  }

  renderLoseCells() {
    const losingElem = this.cellElems[this.losingCellIndex];
    losingElem.style = "background-color: yellow";

    for (const idx of this.board.flaggedIndices()) {
      const cell = this.board.getCell(idx);
      if (cell.isSafe() && cell.isFlagged) {
        const cellElem = this.cellElems[idx];
        cellElem.innerHTML = getMisplacedFlagIcon();
      }
    }
  }

  renderScoreboard() {
    this.flagsElem.textContent = getTextAsScore(
      this.difficulty.mineCount - this.board.flagCount
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
      if (that.enableShowMinesCheat || !that.hasPlacedMines) {
        return;
      }

      if (cellIndex < 0) {
        return;
      }

      const cell = that.board.getCell(cellIndex);
      if (cell.isRevealed || cell.isFlagged) {
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
        if (this.board.getCell(cellIndex).isMine()) {
          this.resetBtn.innerText = "🫣";
        }
      }
    }
  }

  handleShowMinesCheat() {
    if (this.enableShowMinesCheat) {
      for (let idx = 0; idx < this.board.length; ++idx) {
        const cell = this.board.getCell(idx);
        const cellElem = this.cellElems[idx];

        if (cell.isMine() && !cell.isFlagged) {
          cellElem.innerHTML = getMineIcon();
        } else if (cell.isSafe() && cell.isFlagged) {
          cellElem.innerHTML = getMisplacedFlagIcon();
        }
      }
    }
  }
}

export const gameController = new GameController();
