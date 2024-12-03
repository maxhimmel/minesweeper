import { EventEmitter } from "./eventEmitter.js";

export class GuessFaceController {
  constructor() {
    this.eventEmitter = new EventEmitter();

    window.addEventListener("mousedown", this.renderGuessFace.bind(this));
    window.addEventListener("mouseup", this.renderGuessFace.bind(this));
  }

  renderGuessFace(evt) {
    if (evt.altKey || evt.shiftKey) {
      return;
    }

    const isClickingBoard =
      evt.type === "mousedown" && evt.target.matches("#board, .cell");

    this.eventEmitter.emit("render", isClickingBoard, evt.target);
  }
}
