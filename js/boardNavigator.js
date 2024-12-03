export class BoardNavigator {
  constructor(columnCount, rowCount) {
    this.colCount = columnCount;
    this.rowCount = rowCount;
  }

  get length() {
    return this.colCount * this.rowCount;
  }

  *getAdjacentCellIndices(cellIndex, includeSelf = false) {
    const cellCoord = this.getCellCoord(cellIndex);
    for (let col = -1; col <= 1; ++col) {
      for (let row = -1; row <= 1; ++row) {
        if (!includeSelf && col === 0 && row === 0) {
          continue;
        }

        const adjacentIndex = this.getCellIndex(
          cellCoord.col + col,
          cellCoord.row + row
        );
        if (adjacentIndex >= 0) {
          yield adjacentIndex;
        }
      }
    }
  }

  getCellCoord(index) {
    return {
      col: index % this.colCount,
      row: Math.floor(index / this.colCount),
    };
  }

  getCellIndex(col, row) {
    if (col < 0 || col >= this.colCount || row < 0 || row >= this.rowCount) {
      return -1;
    }

    return col + row * this.colCount;
  }
}
