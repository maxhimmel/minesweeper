import { getRandomItem } from "./lib/randomHelpers.js";
import {
  getAdjacentMineIcon,
  getFlagIcon,
  getMineIcon,
  getMisplacedFlagIcon,
} from "./ui/styleHelpers.js";

const CELL_FILLS = [
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

const COL_COUNT = 20;
const ROW_COUNT = 9;

const OPTIONS = {
  "pressed-nums": {
    prettyName: "Pressed Numbers",
    type: "checkbox",
    changeCallback: (evt) => {
      for (const cell of cellElems) {
        togglePressedStyle(cell, evt.target.checked);
      }
    },
    init: () => {
      const defaultValue = false;

      for (const cell of cellElems) {
        togglePressedStyle(cell, defaultValue);
      }

      document.getElementById("pressed-nums").checked = defaultValue;
    },
  },
};

let cellElems = [];
const boardElem = document.getElementById("board");
const debugContainer = document.getElementById("debug");

boardElem.style.gridTemplateColumns = `repeat(${COL_COUNT}, 1fr)`;

cellElems = randomize();
function randomize() {
  const newCellElems = [];
  for (let idx = 0; idx < COL_COUNT * ROW_COUNT; ++idx) {
    const cellElem = document.createElement("button");
    cellElem.classList.add("cell");
    cellElem.innerHTML = getRandomItem(CELL_FILLS);

    boardElem.append(cellElem);
    newCellElems.push(cellElem);
  }

  return newCellElems;
}

initDebugOptions();
function initDebugOptions() {
  for (const key in OPTIONS) {
    const option = OPTIONS[key];

    const labelElem = document.createElement("label");
    labelElem.append(option.prettyName);

    const inputElem = document.createElement("input");
    inputElem.id = key;
    inputElem.name = key;
    inputElem.type = option.type;
    inputElem.addEventListener("change", option.changeCallback);

    labelElem.append(inputElem);

    debugContainer.append(labelElem);

    option.init();
  }
}

/* --- */

function togglePressedStyle(cell, isPressed) {
  const childDiv = cell.querySelector("div");
  if (childDiv?.className.includes("mine-")) {
    cell.classList.toggle("pressed", isPressed);
  }
}
