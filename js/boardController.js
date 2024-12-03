import { BoardNavigator } from "./boardNavigator.js";
import { Cell } from "./cell.js";

export class BoardController {
  constructor(columnCount, rowCount) {
    this.navigator = new BoardNavigator(columnCount, rowCount);
    this.board = Array.from(
      { length: this.navigator.length },
      (_, index) => new Cell()
    );
    this.flagCount = 0;
  }

  toggleFlag(index) {
    const cell = this.getCell(index);

    if (!cell.isRevealed) {
      cell.isFlagged = !cell.isFlagged;

      this.flagCount += cell.isFlagged ? 1 : -1;
    }

    return cell.isFlagged;
  }

  getCell(index) {
    return this.board[index];
  }

  get length() {
    return this.board.length;
  }
}
