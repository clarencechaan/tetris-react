import Grid from "./Grid";
import Cell from "./Cell";
import { useState, useEffect, useCallback } from "react";
import { getTetromino } from "../scripts/tetromino";
import "../styles/Game.css";

function Game() {
  const WIDTH = 10;
  const HEIGHT = 20;

  const [game, setGame] = useState(() => {
    let grid = [];
    for (let i = 0; i < HEIGHT; i++) grid.push(Array(WIDTH).fill(null));
    let tetromino = {
      blocks: getTetromino(),
      next: getTetromino(),
      x: 3,
      y: 0,
    };
    return { grid, tetromino };
  });

  // gravity - shift tetromino down 1 block at a set interval
  useEffect(() => {
    const gravityInterval = setInterval(() => {
      moveTetromino("D");
    }, 200);

    return () => {
      clearInterval(gravityInterval);
    };
  }, []);

  // listen to keyboard events to control tetromino
  useEffect(() => {
    let moveLeftInterval;
    let moveRightInterval;
    let moveDownInterval;

    function handleKeyDown(e) {
      if (e.repeat) return;
      switch (e.key) {
        case "ArrowLeft":
          clearInterval(moveRightInterval);
          moveTetromino("L");
          moveLeftInterval = setInterval(() => {
            moveTetromino("L");
          }, 100);
          break;
        case "ArrowRight":
          clearInterval(moveLeftInterval);
          moveTetromino("R");
          moveRightInterval = setInterval(() => {
            moveTetromino("R");
          }, 100);
          break;
        case "ArrowDown":
          moveTetromino("D");
          moveDownInterval = setInterval(() => {
            moveTetromino("D");
          }, 100);
          break;
        case "ArrowUp":
          rotateTetromino();
          break;
        default:
      }
    }

    function handleKeyUp(e) {
      switch (e.key) {
        case "ArrowLeft":
          clearInterval(moveLeftInterval);
          break;
        case "ArrowRight":
          clearInterval(moveRightInterval);
          break;
        case "ArrowDown":
          clearInterval(moveDownInterval);
          break;
        default:
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  function checkCollision(grid, blocks, x, y) {
    for (let i = 0; i < blocks.length; i++)
      for (let j = 0; j < blocks[0].length; j++)
        if (blocks[i][j] && grid[y + i]?.[x + j] !== null) return true;
    return false;
  }

  function moveTetromino(direction) {
    setGame((prev) => {
      let grid = prev.grid;
      let { blocks, next, x, y } = prev.tetromino;

      function deactivateTetromino() {
        // place tetromino on grid
        for (let i = 0; i < blocks.length; i++)
          for (let j = 0; j < blocks[0].length; j++)
            if (blocks[i][j]) grid[y + i][x + j] = blocks[i][j];

        // clear any completed rows
        grid = grid.filter((row) => row.some((cell) => !cell));
        while (grid.length < HEIGHT) grid.unshift(Array(WIDTH).fill(null));

        // spawn new tetromino
        blocks = next;
        next = getTetromino();
        x = 3;
        y = 0;
      }

      switch (direction) {
        case "L":
          if (!checkCollision(grid, blocks, x - 1, y)) x--;
          break;
        case "R":
          if (!checkCollision(grid, blocks, x + 1, y)) x++;
          break;
        case "D":
          if (!checkCollision(grid, blocks, x, y + 1)) y++;
          else deactivateTetromino();
          break;
        default:
      }

      return { grid, tetromino: { blocks, next, x, y } };
    });
  }

  function rotateTetromino() {
    setGame((prev) => {
      let grid = prev.grid;
      let { blocks, next, x, y } = prev.tetromino;

      let rotated = blocks[0].map((val, index) =>
        blocks.map((row) => row[index]).reverse()
      );

      if (!checkCollision(grid, rotated, x, y)) blocks = rotated;
      else if (!checkCollision(grid, rotated, x + 1, y)) {
        blocks = rotated;
        x++;
      } else if (!checkCollision(grid, rotated, x - 1, y)) {
        blocks = rotated;
        x--;
      }

      return { grid, tetromino: { blocks, next, x, y } };
    });
  }

  const nextToJSX = useCallback(() => {
    let next = game.tetromino.next;
    let cells = [];

    for (let i = 0; i < 2; i++) {
      cells.push([]);
      for (let j = 0; j < 4; j++) cells[i][j] = next[i]?.[j] || <Cell />;
    }

    return cells;
  }, [game.tetromino.next]);

  return (
    <div className="Game">
      <Grid game={game} HEIGHT={HEIGHT} WIDTH={WIDTH} />
      <div className="next-tetromino">{nextToJSX()}</div>
    </div>
  );
}

export default Game;
