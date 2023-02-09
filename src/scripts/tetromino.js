import Cell from "../components/Cell";

const shapes = ["I", "J", "L", "O", "S", "T", "Z"];
let queue = [];

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function getTetromino(shape) {
  let cells = [];
  let cell = null;

  if (!shape) {
    if (!queue.length) queue = shuffle([...shapes]);
    shape = queue.pop();
  }

  switch (shape) {
    case "I":
      cell = <Cell colour="cyan" />;
      cells = [
        [null, null, null, null],
        [cell, cell, cell, cell],
        [null, null, null, null],
      ];
      break;
    case "J":
      cell = <Cell colour="blue" />;
      cells = [
        [cell, null, null],
        [cell, cell, cell],
        [null, null, null],
      ];
      break;
    case "L":
      cell = <Cell colour="orange" />;
      cells = [
        [null, null, cell],
        [cell, cell, cell],
        [null, null, null],
      ];
      break;
    case "O":
      cell = <Cell colour="yellow" />;
      cells = [
        [cell, cell],
        [cell, cell],
      ];
      break;
    case "S":
      cell = <Cell colour="green" />;
      cells = [
        [null, cell, cell],
        [cell, cell, null],
        [null, null, null],
      ];
      break;
    case "T":
      cell = <Cell colour="purple" />;
      cells = [
        [null, cell, null],
        [cell, cell, cell],
        [null, null, null],
      ];
      break;
    case "Z":
      cell = <Cell colour="red" />;
      cells = [
        [cell, cell, null],
        [null, cell, cell],
        [null, null, null],
      ];
      break;
    default:
      return;
  }

  return cells;
}

export { getTetromino };
