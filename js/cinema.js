import { BoardNavigator } from "./data/boardNavigator.js";
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
  "show-overlay": {
    prettyName: "Show Overlay",
    type: "checkbox",
    changeCallback: (evt) => {
      showOverlay(evt.target.checked);
    },
    init: () => {
      const defaultValue = false;

      showOverlay(defaultValue);

      document.getElementById("show-overlay").checked = defaultValue;
    },
  },

  "pressed-nums": {
    prettyName: "Pressed Numbers",
    type: "checkbox",
    changeCallback: (evt) => {
      for (const cell of cellElems) {
        togglePressedStyle(cell, evt.target.checked);
      }
    },
    init: () => {
      const defaultValue = true;

      for (const cell of cellElems) {
        togglePressedStyle(cell, defaultValue);
      }

      document.getElementById("pressed-nums").checked = defaultValue;
    },
  },

  "apply-pressed-all": {
    prettyName: "Apply Pressed Style To All",
    type: "checkbox",
    changeCallback: (evt) => {
      applyPressedToAllCells = evt.target.checked;

      for (const cell of cellElems) {
        togglePressedStyle(cell, applyPressedToAllCells, true);
      }
    },
    init: () => {
      const defaultValue = true;

      applyPressedToAllCells = defaultValue;
      for (const cell of cellElems) {
        togglePressedStyle(cell, applyPressedToAllCells, true);
      }

      document.getElementById("apply-pressed-all").checked = defaultValue;
    },
  },

  "anim-speed": {
    prettyName: "Animation Speed",
    type: "number",
    changeCallback: (evt) => {
      waveAnimateCells(evt.target.value);
    },
    init: () => {
      const defaultValue = 70;

      waveAnimateCells(defaultValue);

      document.getElementById("anim-speed").value = defaultValue;
    },
  },
};

let cellElems = [];
let overlayCellElems = [];
let animateCellHandle = null;
let applyPressedToAllCells = false;
const boardElem = document.getElementById("board");
const overlayElem = document.getElementById("board-overlay");
const debugContainer = document.getElementById("debug");
const navigator = new BoardNavigator(COL_COUNT, ROW_COUNT);

boardElem.style.gridTemplateColumns = `repeat(${COL_COUNT}, 1fr)`;
overlayElem.style.gridTemplateColumns = `repeat(${COL_COUNT}, 1fr)`;

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

initOverlay();
function initOverlay() {
  for (let idx = 0; idx < COL_COUNT * ROW_COUNT; ++idx) {
    const overlayCell = document.createElement("button");
    overlayCell.classList.add("cell");

    overlayElem.append(overlayCell);
    overlayCellElems.push(overlayCell);
  }
}

initDebugOptions();
function initDebugOptions() {
  for (const key in OPTIONS) {
    const option = OPTIONS[key];

    const labelElem = document.createElement("label");
    labelElem.style.backgroundColor = "powderblue";
    labelElem.style.display = "flex";
    labelElem.style.gap = "0.75rem";
    labelElem.append(option.prettyName);

    const inputElem = document.createElement("input");
    inputElem.id = key;
    inputElem.name = key;
    inputElem.type = option.type;
    inputElem.style.backgroundColor = "wheat";
    inputElem.addEventListener("change", option.changeCallback);

    labelElem.append(inputElem);

    debugContainer.append(labelElem);

    option.init();
  }
}

/* --- */

function showOverlay(show) {
  for (let idx = 0; idx < overlayCellElems.length; ++idx) {
    const overlayCell = overlayCellElems[idx];
    overlayCell.style.visibility = show ? "visible" : "hidden";
  }
}

function togglePressedStyle(cell, isPressed, updateAll = false) {
  const childDiv = cell.querySelector("div");
  if (
    updateAll ||
    applyPressedToAllCells ||
    childDiv?.className.includes("mine-")
  ) {
    cell.classList.toggle("pressed", isPressed);
  }
}

function randomAnimateCells(speed) {
  clearInterval(animateCellHandle);

  animateCellHandle = setInterval(() => {
    const randOverlayCell = getRandomItem(overlayCellElems);
    const visibility = randOverlayCell.style.visibility;

    randOverlayCell.style.visibility =
      visibility === "hidden" ? "visible" : "hidden";

    // randOverlayCell.style.visibility =
    //   Math.random() > 0.5 ? "visible" : "hidden";
  }, speed);
}

function waveAnimateCells(speed) {
  clearInterval(animateCellHandle);

  animateCellHandle = setInterval(() => {
    for (let idx = 0; idx < navigator.length; ++idx) {}
  }, speed);
}
