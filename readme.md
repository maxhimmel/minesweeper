# Minesweeper

## Difficulties

### Easy

- 8x8 or 9x9
- 10 mines

### Medium

- 16x16
- 40 mines

### Hard

- 30x16
- 99 mines

## Pseudo Code

```
1. Query difficulty from user.
    1a. Easy, Medium, Hard
2. Create grid cells.
3. Display timer starting at 0.
4. Display how many flags the user has remaining. Start the flag count equal to the total number of mines.
    4a. The user can use more than the allotted flags.
    4b. The number will go negative.
    4c. The game cannot be won in a negative flagged state.
5. 1st cell click? --> Populate grid w/mines.
    5a. What is the algorithm for creating a minesweeper grid?
    5b. This cell cannot have a mine on it.
    5c. Remove any pre-placed flags.
    5d. Randomly place N mines on the grid?
    5e. Run a validator/solver to ensure that the result can be solved successfully.
    5f. Repeat until validator is successful.
    5g. Start the timer.
6. Right-click? --> place a flag.
7. Left-click? --> uncover a cell.
    7a. Run algorithm to check if adjacent cells should be uncovered as well.
    7b. If there's a mine? --> game over.
    7c. All cells that are safe have been uncovered? --> winner!
```

## Wireframe

<img src="./images/Minesweeper Wireframe.svg" alt="wireframe"/>

## Resources

[Sprite Sheet](https://www.spriters-resource.com/pc_computer/minesweeper/sheet/19849/)

## Ideas

- Sonar
  - Send out a limited number of pings.
  - Maybe you can "pick up"/find sonar uses.
