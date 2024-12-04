export function shuffle(array) {
  for (let idx = array.length - 1; idx > 0; --idx) {
    const jdx = Math.floor(Math.random() * (idx + 1));
    [array[idx], array[jdx]] = [array[jdx], array[idx]];
  }
}

export function getRandomItem(array) {
  if (!Array.isArray(array)) {
    return undefined;
  }

  const randIdx = Math.floor(Math.random() * array.length);
  return array[randIdx];
}
