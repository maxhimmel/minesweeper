const DIFFICULTIES = {
  easy: {
    rowCount: 9,
    colCount: 9,
    mineCount: 10,
  },
  medium: {
    rowCount: 16,
    colCount: 16,
    mineCount: 40,
  },
  hard: {
    rowCount: 16,
    colCount: 30,
    mineCount: 99,
  },
};

const WIN_FACES = ["🤠", "😎", "🥳"];
const LOSE_FACES = ["🫠", "😵", "🤯"];
const GUESS_FACES = ["😮", "😲", "🧐"];

export { DIFFICULTIES, WIN_FACES, LOSE_FACES, GUESS_FACES };
