import { BoardNavigator } from "./data/boardNavigator.js";
import { modulo } from "./lib/mathHelpers.js";
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

const ANIMATIONS = {
  randomAnimateCells,
  waveAnimateCells,
};

const OPTIONS = {
  "show-overlay": {
    prettyName: "Show Overlay",
    type: "checkbox",
    changeCallback: (evt) => {
      showOverlay(evt.target.checked);
    },
    init: () => {
      const defaultValue = true;

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
      const defaultValue = false;
      if (!defaultValue) {
        return;
      }

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
      animSpeed = evt.target.value;
    },
    init: () => {
      const defaultValue = 100;
      animSpeed = defaultValue;

      document.getElementById("anim-speed").value = defaultValue;
    },
  },

  "anim-type": {
    prettyName: "Animation Type",
    type: "select",
    options: Object.keys(ANIMATIONS),
    changeCallback: (evt) => {
      const animName = evt.target.value;

      ANIMATIONS[animName]();
    },
    init: () => {
      const defaultValue = "waveAnimateCells";

      ANIMATIONS[defaultValue]();

      document.getElementById("anim-type").value = defaultValue;
    },
  },

  "wave-horizontal": {
    prettyName: "Wave Horizontal Speed",
    type: "range",
    min: -4,
    max: 4,
    changeCallback: (evt) => {
      direction.col = parseInt(evt.target.value);
    },
    init: () => {
      const defaultValue = -1;

      direction.col = defaultValue;

      document.getElementById("wave-horizontal").value = defaultValue;
    },
  },

  "wave-vertical": {
    prettyName: "Wave Vertical Speed",
    type: "range",
    min: -4,
    max: 4,
    changeCallback: (evt) => {
      direction.row = parseInt(evt.target.value);
    },
    init: () => {
      const defaultValue = -1;

      direction.row = defaultValue;

      document.getElementById("wave-vertical").value = defaultValue;
    },
  },

  "wave-width": {
    prettyName: "Wave Width",
    type: "range",
    min: 0,
    max: COL_COUNT - 1,
    changeCallback: (evt) => {
      range.cols = parseInt(evt.target.value);
    },
    init: () => {
      const defaultValue = 8;

      range.cols = defaultValue;

      document.getElementById("wave-width").value = defaultValue;
    },
  },

  "wave-height": {
    prettyName: "Wave Width",
    type: "range",
    min: 0,
    max: ROW_COUNT - 1,
    changeCallback: (evt) => {
      range.rows = parseInt(evt.target.value);
    },
    init: () => {
      const defaultValue = 8;

      range.rows = defaultValue;

      document.getElementById("wave-height").value = defaultValue;
    },
  },
};

let cellElems = [];
let overlayCellElems = [];
let animateCellHandle = null;
let applyPressedToAllCells = false;
let animSpeed = 100;
const range = {
  cols: 8,
  rows: 8,
};
const direction = {
  col: 1,
  row: -1,
};
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

    let inputElem = null;

    if (option.type === "select") {
      inputElem = document.createElement("select");
      inputElem.id = key;
      inputElem.name = key;
      inputElem.style.backgroundColor = "wheat";
      inputElem.addEventListener("change", option.changeCallback);

      for (const o of option.options) {
        const optionElem = document.createElement("option");
        optionElem.value = o;
        optionElem.innerText = o;
        inputElem.append(optionElem);
      }
    } else {
      inputElem = document.createElement("input");
      inputElem.id = key;
      inputElem.name = key;
      inputElem.type = option.type;
      inputElem.style.backgroundColor = "wheat";
      inputElem.addEventListener("input", option.changeCallback);
    }

    if (option.type === "range") {
      inputElem.min = option.min;
      inputElem.max = option.max;
    }

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

function randomAnimateCells() {
  clearInterval(animateCellHandle);

  animateCellHandle = setInterval(() => {
    const randOverlayCell = getRandomItem(overlayCellElems);

    // const visibility = randOverlayCell.style.visibility;
    // randOverlayCell.style.visibility =
    //   visibility === "hidden" ? "visible" : "hidden";

    randOverlayCell.style.opacity = Math.random() > 0.5 ? 100 : 0;
  }, animSpeed);
}

function waveAnimateCells() {
  clearInterval(animateCellHandle);

  let coord = {
    col: 0,
    row: 0,
  };

  animateCellHandle = setInterval(() => {
    const wave = new Map();

    for (let colCounter = 0; colCounter <= range.cols; ++colCounter) {
      for (let rowCounter = 0; rowCounter <= range.rows; ++rowCounter) {
        const waveCoord = {
          col: modulo(coord.col + colCounter, COL_COUNT),
          row: modulo(coord.row + rowCounter, ROW_COUNT),
        };

        const waveIndex = navigator.getCellIndex(waveCoord.col, waveCoord.row);
        wave.set(waveIndex, waveIndex);
      }
    }

    for (let idx = 0; idx < navigator.length; ++idx) {
      const hideOverlay = wave.has(idx);

      const overlayCell = overlayCellElems[idx];
      overlayCell.style.opacity = hideOverlay ? 0 : 100;
    }

    coord.col = modulo(coord.col + direction.col, COL_COUNT);
    coord.row = modulo(coord.row + direction.row, ROW_COUNT);
  }, animSpeed);
}
