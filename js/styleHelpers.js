export function getTextAsScore(message) {
  return `${message}`.padStart(3, "0");
}

export function getFlagIcon() {
  return `<div class="flag icon ignore-mouse"></div>`;
}

export function getMineIcon() {
  return `<div class="mine"></div>`;
}

export function getAdjacentMineIcon(adjacencyCount) {
  return `<div class="mine-${adjacencyCount} ignore-mouse">${adjacencyCount}</div>`;
}
