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

    let next = [];
    for (let i = 0; i < 6; i++) next.push(getTetromino());

    let tetromino = {
      blocks: getTetromino(),
      next,
      x: 3,
      y: 0,
    };
    return { grid, tetromino };
  });

  const [stats, setStats] = useState({ level: 0, lines: 0, score: 0 });

  // gravity - shift tetromino down 1 block at a set interval
  useEffect(() => {
    let speed;

    switch (stats.level) {
      case 0:
        speed = (48 * 1000) / 60;
        break;
      case 1:
        speed = (43 * 1000) / 60;
        break;
      case 2:
        speed = (38 * 1000) / 60;
        break;
      case 3:
        speed = (33 * 1000) / 60;
        break;
      case 4:
        speed = (28 * 1000) / 60;
        break;
      case 5:
        speed = (23 * 1000) / 60;
        break;
      case 6:
        speed = (18 * 1000) / 60;
        break;
      case 7:
        speed = (13 * 1000) / 60;
        break;
      case 8:
        speed = (8 * 1000) / 60;
        break;
      case 9:
        speed = (6 * 1000) / 60;
        break;
      case 10:
      case 11:
      case 12:
        speed = (5 * 1000) / 60;
        break;
      case 13:
      case 14:
      case 15:
        speed = (4 * 1000) / 60;
        break;
      case 16:
      case 17:
      case 18:
        speed = (3 * 1000) / 60;
        break;
      case 19:
      case 20:
      case 21:
      case 22:
      case 23:
      case 24:
      case 25:
      case 26:
      case 27:
      case 28:
        speed = (2 * 1000) / 60;
        break;
      default:
        speed = (1 * 1000) / 60;
    }

    const gravityInterval = setInterval(() => {
      moveTetromino("D");
    }, speed);

    return () => {
      clearInterval(gravityInterval);
    };
  }, [stats.level]);

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
        let clearedLines = HEIGHT - grid.length;
        while (grid.length < HEIGHT) grid.unshift(Array(WIDTH).fill(null));
        setStats((prev) => {
          let { level, lines, score } = prev;

          switch (clearedLines) {
            case 1:
              score += 40 * (level + 1);
              break;
            case 2:
              score += 100 * (level + 1);
              break;
            case 3:
              score += 300 * (level + 1);
              break;
            case 4:
              score += 1200 * (level + 1);
              break;
            default:
          }

          lines += clearedLines;
          level = Math.floor(lines / 10);

          return { level, lines, score };
        });

        // spawn new tetromino
        blocks = next.shift();
        next.push(getTetromino());
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
    let shapes = [];

    for (const tetr of next) {
      let shape = [];
      for (const row of tetr) if (row.some((cell) => cell)) shape.push(row);
      shapes.push(shape);
    }

    let shapesJSX = [];

    for (const shape of shapes) {
      let shapeJSX = [];
      for (const row of shape) {
        let rowJSX = row.map((cell) => cell || <Cell />);
        rowJSX = <div className="row">{rowJSX}</div>;
        shapeJSX.push(rowJSX);
      }

      shapeJSX = <div className="shape">{shapeJSX}</div>;
      shapesJSX.push(shapeJSX);
    }

    return shapesJSX;
  }, [game.tetromino.next]);

  return (
    <div className="Game">
      <Grid game={game} HEIGHT={HEIGHT} WIDTH={WIDTH} />
      <div className="right-sidebar">
        <div className="next-tetromino">{nextToJSX()}</div>
        <div className="stats">
          <div className="level">Level: {stats.level}</div>
          <div className="lines">Lines: {stats.lines}</div>
          <div className="score">Score: {stats.score}</div>
        </div>
      </div>
    </div>
  );
}

export default Game;
