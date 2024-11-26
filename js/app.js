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

const boardElem = document.getElementById("board");
const cellElems = [];
const board = [];
const shuffledIndices = [];
let hasPlacedMines = false;

// clear board
boardElem.innerHTML = null;
hasPlacedMines = false;

// generate cells
const difficulty = DIFFICULTIES.easy;
boardElem.style.gridTemplateColumns = `repeat(${difficulty.colCount}, 1fr)`;
for (let idx = 0; idx < difficulty.colCount * difficulty.rowCount; ++idx) {
  const cellElem = document.createElement("button");
  cellElem.classList.add("cell");

  boardElem.append(cellElem);
  cellElems.push(cellElem);

  board.push(0);
  shuffledIndices.push(idx);
}

boardElem.addEventListener("click", (evt) => {
  if (!evt.target.classList.contains("cell")) {
    return;
  }

  const cellIndex = cellElems.indexOf(evt.target);

  if (!hasPlacedMines) {
    hasPlacedMines = true;

    shuffledIndices.splice(cellIndex, 1); // remove the clicked cell as an option for mines
    shuffle(shuffledIndices);

    for (let mine = 0; mine < difficulty.mineCount; ++mine) {
      const idx = shuffledIndices[mine];
      board[idx] = -1;

      // iterate over surrounding cells ...
      const mineCoord = getCellCoord(idx);
      for (let col = -1; col <= 1; ++col) {
        for (let row = -1; row <= 1; ++row) {
          const adjacentIndex = getCellIndex(
            mineCoord.col + col,
            mineCoord.row + row
          );

          if (adjacentIndex >= 0 && board[adjacentIndex] >= 0) {
            ++board[adjacentIndex];
          }
        }
      }
    }
  }

  render();
});

function render() {
  for (let idx = 0; idx < board.length; ++idx) {
    const cellElem = cellElems[idx];
    const cellValue = board[idx];

    cellElem.style.backgroundColor = cellValue < 0 ? "red" : "lime";

    if (cellValue > 0) {
      cellElem.textContent = cellValue;
    }
  }
}

/* --- helpers --- */

function shuffle(array) {
  for (let idx = array.length - 1; idx > 0; --idx) {
    const jdx = Math.floor(Math.random() * (idx + 1));
    [array[idx], array[jdx]] = [array[jdx], array[idx]];
  }
}

function getCellCoord(index) {
  return {
    col: index % difficulty.colCount,
    row: Math.floor(index / difficulty.rowCount),
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

  return col + row * difficulty.rowCount;
}
