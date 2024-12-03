import { BoardNavigator } from "./boardNavigator.js";
import { Cell } from "./cell.js";

export class BoardController {
  constructor(columnCount, rowCount) {
    this.navigator = new BoardNavigator(columnCount, rowCount);
    this.board = Array.from(
      { length: this.navigator.length },
      (_, index) => new Cell()
    );
  }

  getCell(index) {
    return this.board[index];
  }

  get length() {
    return this.board.length;
  }
}
