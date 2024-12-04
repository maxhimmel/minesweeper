export class Cell {
  constructor() {
    this.adjacentMineCount = 0;
    this.isRevealed = false;
    this.isFlagged = false;
  }

  setMine() {
    this.adjacentMineCount = -1;
  }

  setSafe() {
    this.adjacentMineCount = 0;
  }

  isSafe() {
    return !this.isMine();
  }

  isMine() {
    return this.adjacentMineCount < 0;
  }

  isFlaggable() {
    return !this.isRevealed;
  }

  isTouchingMine() {
    return this.adjacentMineCount > 0;
  }
}
