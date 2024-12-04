import { getRandomItem } from "./lib/randomHelpers.js";
import {
  getAdjacentMineIcon,
  getFlagIcon,
  getMineIcon,
  getMisplacedFlagIcon,
} from "./ui/styleHelpers.js";

const columnCount = 20;
const rowCount = 9;

const boardElem = document.getElementById("board");
let cellElems = [];

boardElem.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;

const cellFills = [
  getMineIcon(),
  getMisplacedFlagIcon(),
  "🙂",
  getFlagIcon(),
  getAdjacentMineIcon(1),
  getAdjacentMineIcon(2),
  getAdjacentMineIcon(3),
  getAdjacentMineIcon(4),
  getAdjacentMineIcon(5),
  getAdjacentMineIcon(6),
  getAdjacentMineIcon(7),
  getAdjacentMineIcon(8),
];

cellElems = randomize();

function randomize() {
  const newCellElems = [];
  for (let idx = 0; idx < columnCount * rowCount; ++idx) {
    const cellElem = document.createElement("button");
    cellElem.classList.add("cell");
    cellElem.innerHTML = getRandomItem(cellFills);

    togglePressedStyle(cellElem, false);

    boardElem.append(cellElem);
    newCellElems.push(cellElem);
  }

  return newCellElems;
}

document.getElementById("pressed-nums").addEventListener("change", (evt) => {
  for (const cell of cellElems) {
    togglePressedStyle(cell, evt.target.checked);
  }
});

function togglePressedStyle(cell, isPressed) {
  const childDiv = cell.querySelector("div");
  if (childDiv?.className.includes("mine-")) {
    cell.classList.toggle("pressed", isPressed);
  }
}
