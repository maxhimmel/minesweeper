export class FlagController {
  constructor() {
    this.flags = {};
  }

  clear() {
    this.flags = {};
  }

  add(index) {
    this.flags[index] = true;
  }

  has(index) {
    return this.flags[index];
  }

  tryRemove(index) {
    if (!this.has(index)) {
      return false;
    }

    this.remove(index);
    return true;
  }

  remove(index) {
    delete this.flags[index];
  }

  get count() {
    return Object.keys(this.flags).length;
  }

  *getIndices() {
    for (const index in this.flags) {
      yield index;
    }
  }
}
