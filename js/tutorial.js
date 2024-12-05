/**
 * RULES:
 * Minesweeper is a game where mines are hidden in a grid of squares.
 *
 * Safe squares have numbers telling you how many mines touch the square.
 *
 * You can use the number clues to solve the game by opening all of the safe squares.
 *
 * If you click on a mine you lose the game!
 *
 *
 * MANUAL:
 * You open squares with the left mouse button.
 *
 * You put flags on mines by holding alt/option and clicking the left mouse button.
 *
 * ? > When you open a square that does not touch any mines, it will be empty and the adjacent squares will automatically open in all directions until reaching squares that contain numbers.
 *
 * If you flag all of the mines touching a number, chording on the number opens the remaining squares.
 * Chording is when you hold shift and left click the mouse button.
 * This can save you a lot of work!
 *
 * However, if you place the correct number of flags on the wrong squares, chording will explode the mines.
 */

const rules =
  "Minesweeper is a game where mines are hidden in a grid of squares. Safe squares have numbers telling you how many mines touch the square. You can use the number clues to solve the game by opening all of the safe squares. If you click on a mine you lose the game!";

const manual = [
  {
    instruction: "You open squares with the left mouse button.",
    pictogram: "https://foobar.com",
  },
  {
    instruction:
      "You put flags on mines by holding alt/option and clicking the left mouse button.",
    pictogram: "https://foobar.com",
  },
  {
    instruction:
      "If you flag all of the mines touching a number, chording on the number opens the remaining squares. Chording is when you hold shift and left click the mouse button. This can save you a lot of work!",
    pictogram: "https://foobar.com",
  },
  {
    instruction:
      "However, if you place the correct number of flags on the wrong squares, chording will explode the mines.",
    pictogram: "https://foobar.com",
  },
];
