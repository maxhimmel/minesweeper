export function getIndexOfChild(parent, child) {
  let index = 0;

  for (const other of parent.childNodes) {
    if (other === child) {
      break;
    }
    ++index;
  }

  return index;
}
