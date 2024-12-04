import { getIndexOfChild } from "./lib/domHelpers.js";
import { EventEmitter } from "./lib/eventEmitter.js";

export class FlagPreviewController {
  constructor(boardElement) {
    this.isFlagPreviewMode = false;
    this.flagPreviewIndex = -1;
    this.eventEmitter = new EventEmitter();

    window.addEventListener("keydown", this.handleFlagPreviewMode.bind(this));
    window.addEventListener("keyup", this.handleFlagPreviewMode.bind(this));

    boardElement.addEventListener(
      "mouseover",
      this.handleFlagPreviewSelection.bind(this)
    );
    boardElement.addEventListener(
      "mouseout",
      this.handleFlagPreviewSelection.bind(this)
    );
  }

  handleFlagPreviewMode(evt) {
    if (evt.key === "Alt") {
      if (evt.type === "keydown") {
        this.isFlagPreviewMode = true;
      } else if (evt.type === "keyup") {
        this.isFlagPreviewMode = false;
      }

      this.sendRenderEvent(this.isFlagPreviewMode, this.flagPreviewIndex);
    }
  }

  handleFlagPreviewSelection(evt) {
    if (evt.target.classList.contains("cell")) {
      const cellIndex = getIndexOfChild(evt.target.parentNode, evt.target);

      if (evt.type === "mouseover") {
        this.flagPreviewIndex = cellIndex;
        this.sendRenderEvent(this.isFlagPreviewMode, this.flagPreviewIndex);
      } else if (evt.type === "mouseout") {
        this.sendRenderEvent(false, this.flagPreviewIndex);
        this.flagPreviewIndex = -1;
      }
    }
  }

  sendRenderEvent(requestPreview, cellIndex) {
    if (cellIndex < 0) {
      return;
    }

    this.eventEmitter.emit("render", requestPreview, cellIndex);
  }
}
