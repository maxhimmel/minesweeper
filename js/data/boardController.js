import { BoardNavigator } from "./boardNavigator.js";
import { Cell } from "./cell.js";
import { FlagController } from "./flagController.js";

export class BoardController {
  constructor(columnCount, rowCount) {
    this.navigator = new BoardNavigator(columnCount, rowCount);
    this.board = Array.from(
      { length: this.navigator.length },
      (_, index) => new Cell()
    );
    this.flags = new FlagController();
  }

  toggleFlag(index) {
    const cell = this.getCell(index);

    if (!cell.isRevealed) {
      cell.isFlagged = !cell.isFlagged;

      if (cell.isFlagged) {
        this.flags.add(index);
      } else {
        this.flags.remove(index);
      }
    }

    return cell.isFlagged;
  }

  getCell(index) {
    return this.board[index];
  }

  flaggedIndices() {
    return this.flags.getIndices();
  }

  get length() {
    return this.board.length;
  }

  get flagCount() {
    return this.flags.count;
  }
}
