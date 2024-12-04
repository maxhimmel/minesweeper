import { EventEmitter } from "./eventEmitter.js";

export class Timer {
  constructor(tickRate) {
    this.milliseconds = 0;
    this.handler = undefined;
    this.tickRate = tickRate;
    this.eventEmitter = new EventEmitter();
  }

  restart() {
    this.clear();
    this.start();
  }

  clear() {
    this.milliseconds = 0;
    this.stop();
  }

  stop() {
    if (this.handler) {
      clearInterval(this.handler);
      this.handler = undefined;
    }
    this.eventEmitter.emit("stop", this.convertToSeconds());
  }

  start() {
    if (this.handler) {
      throw new Error(
        "Time already running. Make sure it is stopped before calling start again."
      );
    }

    this.handler = setInterval(() => {
      this.milliseconds += this.tickRate;
      this.eventEmitter.emit("tick", this.convertToSeconds());
    }, this.tickRate);

    this.eventEmitter.emit("start", this.convertToSeconds());
  }

  convertToSeconds() {
    return this.milliseconds / 1000;
  }
}
