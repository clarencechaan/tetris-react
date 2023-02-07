import "../styles/Grid.css";
import Cell from "./Cell";
import { getTetromino } from "../scripts/tetromino";
import { useCallback, useEffect, useState } from "react";

function Grid() {
  const WIDTH = 10;
  const HEIGHT = 20;

  const [game, setGame] = useState(() => {
    let grid = [];
    for (let i = 0; i < HEIGHT; i++) grid.push(Array(WIDTH).fill(null));
    let tetromino = { blocks: getTetromino(), x: 3, y: 0 };
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
    function handleKeyDown(e) {
      switch (e.key) {
        case "ArrowLeft":
          moveTetromino("L");
          break;
        case "ArrowRight":
          moveTetromino("R");
          break;
        case "ArrowDown":
          moveTetromino("D");
          break;
        case "ArrowUp":
          rotateTetromino();
          break;
        default:
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
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
      let { blocks, x, y } = prev.tetromino;

      function deactivateTetromino() {
        // place tetromino on grid
        for (let i = 0; i < blocks.length; i++)
          for (let j = 0; j < blocks[0].length; j++)
            if (blocks[i][j]) grid[y + i][x + j] = blocks[i][j];

        // clear any completed rows
        grid = grid.filter((row) => row.some((cell) => !cell));
        while (grid.length < HEIGHT) grid.unshift(Array(WIDTH).fill(null));

        // spawn new tetromino
        blocks = getTetromino();
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

      return { grid, tetromino: { blocks, x, y } };
    });
  }

  function rotateTetromino() {
    setGame((prev) => {
      let grid = prev.grid;
      let { blocks, x, y } = prev.tetromino;

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

      return { grid, tetromino: { blocks, x, y } };
    });
  }

  const gameToJSX = useCallback(() => {
    let grid = game.grid;
    let { blocks, x, y } = game.tetromino;

    let cells = [];
    for (let i = 0; i < HEIGHT; i++) {
      cells.push([]);
      for (let j = 0; j < WIDTH; j++) cells[i][j] = grid[i][j] || <Cell />;
    }

    for (let i = 0; i < blocks.length; i++)
      for (let j = 0; j < blocks[0].length; j++)
        if (blocks[i][j]) cells[y + i][x + j] = blocks[i][j];

    return cells;
  }, [game]);

  return <div className="Grid">{gameToJSX()}</div>;
}

export default Grid;
