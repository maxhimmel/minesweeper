import { getTextAsScore } from "./styleHelpers.js";
import { Timer } from "./timer.js";

export class TimerController {
  constructor(tickRate, timerElementSelector, timerIconSelector) {
    this.timer = new Timer(tickRate);

    this.timerElem = document.querySelector(timerElementSelector);
    this.timerIcon = document.querySelector(timerIconSelector);

    this.timer.eventEmitter.on("stop", (seconds) => {
      this.renderTimer(seconds, seconds > 0 ? "timer-done" : "timer-unset");
    });
    this.timer.eventEmitter.on("start", (seconds) => {
      this.renderTimer(seconds, "timer-tick");
    });
    this.timer.eventEmitter.on("tick", (seconds) => {
      this.renderTimer(seconds, "timer-tick");
    });
  }

  renderTimer(seconds, iconClass) {
    this.timerElem.textContent = getTextAsScore(seconds);
    this.timerIcon.className = `icon ${iconClass}`;
  }
}
