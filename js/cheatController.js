import { getMineIcon, getMisplacedFlagIcon } from "./ui/styleHelpers.js";

export class CheatController {
  // NOTE: I understand this has some terrible mutual dependency, but it's cheats!
  constructor(gameController) {
    this.game = gameController;

    this.enablePeeking = false;
    this.enableShowMines = false;

    document.getElementById("peeker").addEventListener("change", (evt) => {
      this.enablePeeking = evt.target.checked;
    });

    document.getElementById("show-mines").addEventListener("change", (evt) => {
      this.enableShowMines = evt.target.checked;
      this.game.render();
    });
  }

  handlePeeking(clickedElement) {
    if (this.enablePeeking) {
      const cellIndex = this.game.cellElems.indexOf(clickedElement);
      if (cellIndex >= 0) {
        if (this.game.board.getCell(cellIndex).isMine()) {
          this.game.resetBtn.innerText = "🫣";
        }
      }
    }
  }

  handleShowMines() {
    if (this.enableShowMines) {
      for (let idx = 0; idx < this.game.board.length; ++idx) {
        const cell = this.game.board.getCell(idx);
        const cellElem = this.game.cellElems[idx];

        if (cell.isMine() && !cell.isFlagged) {
          cellElem.innerHTML = getMineIcon();
        } else if (cell.isSafe() && cell.isFlagged) {
          cellElem.innerHTML = getMisplacedFlagIcon();
        }
      }
    }
  }
}
