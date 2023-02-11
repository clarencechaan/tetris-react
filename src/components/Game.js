import Grid from "./Grid";
import Cell from "./Cell";
import { useState, useEffect, useCallback } from "react";
import { getTetromino } from "../scripts/tetromino";
import "../styles/Game.css";

function Game() {
  const WIDTH = 10;
  const HEIGHT = 21;

  const [game, setGame] = useState(() => {
    let grid = [];
    for (let i = 0; i < HEIGHT; i++) grid.push(Array(WIDTH).fill(null));

    let next = [];
    for (let i = 0; i < 6; i++) next.push(getTetromino());

    let tetromino = {
      blocks: getTetromino(),
      rotation: 0,
      hold: null,
      holdAvailable: true,
      next,
      x: 3,
      y: 0,
    };

    let gameOver = false;
    let gamePaused = false;
    return { grid, tetromino, gameOver, gamePaused };
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
  }, [stats.level, game.gameOver]);

  // listen to keyboard events to control tetromino
  useEffect(() => {
    let moveLeftInterval;
    let moveRightInterval;
    let moveDownInterval;

    function handleKeyDown(e) {
      e.preventDefault();
      if (e.repeat) return;

      switch (e.key) {
        case "ArrowLeft":
          clearInterval(moveRightInterval);
          moveTetromino("L");
          moveLeftInterval = setInterval(() => {
            moveTetromino("L");
          }, (5 * 1000) / 60);
          break;
        case "ArrowRight":
          clearInterval(moveLeftInterval);
          moveTetromino("R");
          moveRightInterval = setInterval(() => {
            moveTetromino("R");
          }, (5 * 1000) / 60);
          break;
        case "ArrowDown":
          moveTetromino("D");
          moveDownInterval = setInterval(() => {
            moveTetromino("D");
          }, (5 * 1000) / 60);
          break;
        case "ArrowUp":
          rotateTetromino();
          break;
        case " ":
          moveTetromino(" ");
          break;
        case "Tab":
          holdTetromino();
          break;
        case "r":
          restartGame();
          break;
        case "p":
          togglePause();
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
      let { blocks, rotation, hold, holdAvailable, next, x, y } =
        prev.tetromino;
      let gameOver = prev.gameOver;
      let gamePaused = prev.gamePaused;

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
        rotation = 0;
        holdAvailable = true;
        x = 3;
        y = 0;

        // check if game is over
        if (checkCollision(grid, blocks, x, y)) gameOver = true;
      }

      if (!gameOver && !gamePaused)
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
          case " ":
            while (!checkCollision(grid, blocks, x, y + 1)) y++;
            deactivateTetromino();
            break;
          default:
        }

      return {
        grid,
        tetromino: { blocks, rotation, hold, holdAvailable, next, x, y },
        gameOver,
        gamePaused,
      };
    });
  }

  function rotateMatrix(arr) {
    return arr[0].map((val, index) => arr.map((row) => row[index]).reverse());
  }

  function rotateTetromino() {
    setGame((prev) => {
      let grid = prev.grid;
      let { blocks, rotation, hold, holdAvailable, next, x, y } =
        prev.tetromino;
      let gameOver = prev.gameOver;
      let gamePaused = prev.gamePaused;

      let rotated = rotateMatrix(blocks);

      if (!gameOver && !gamePaused)
        if (!checkCollision(grid, rotated, x, y)) {
          blocks = rotated;
          rotation = (rotation + 1) % 4;
        } else if (!checkCollision(grid, rotated, x + 1, y)) {
          blocks = rotated;
          rotation = (rotation + 1) % 4;
          x++;
        } else if (!checkCollision(grid, rotated, x - 1, y)) {
          blocks = rotated;
          rotation = (rotation + 1) % 4;
          x--;
        }

      return {
        grid,
        tetromino: { blocks, rotation, hold, holdAvailable, next, x, y },
        gameOver,
        gamePaused,
      };
    });
  }

  function holdTetromino() {
    setGame((prev) => {
      let grid = prev.grid;
      let { blocks, rotation, hold, holdAvailable, next, x, y } =
        prev.tetromino;
      let gameOver = prev.gameOver;
      let gamePaused = prev.gamePaused;

      if (!gameOver && !gamePaused && holdAvailable) {
        for (let i = 0; i < (4 - rotation) % 4; i++)
          blocks = rotateMatrix(blocks);

        let tmp = hold;
        hold = blocks;
        if (tmp) blocks = tmp;
        else {
          blocks = next.shift();
          next.push(getTetromino());
        }

        rotation = 0;
        holdAvailable = false;
        x = 3;
        y = 0;
      }

      return {
        grid,
        tetromino: { blocks, rotation, hold, holdAvailable, next, x, y },
        gameOver,
        gamePaused,
      };
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

  const holdToJSX = useCallback(() => {
    let hold = game.tetromino.hold;
    if (!hold) return null;

    hold = hold.filter((row) => row.some((cell) => cell));

    let shapeJSX = [];
    for (const row of hold) {
      let rowJSX = row.map((cell) => cell || <Cell />);
      rowJSX = <div className="row">{rowJSX}</div>;
      shapeJSX.push(rowJSX);
    }

    shapeJSX = <div className="shape">{shapeJSX}</div>;

    return shapeJSX;
  }, [game.tetromino.hold]);

  function restartGame() {
    setGame(() => {
      let grid = [];
      for (let i = 0; i < HEIGHT; i++) grid.push(Array(WIDTH).fill(null));

      let next = [];
      for (let i = 0; i < 6; i++) next.push(getTetromino());

      let tetromino = {
        blocks: getTetromino(),
        rotation: 0,
        hold: null,
        holdAvailable: true,
        next,
        x: 3,
        y: 0,
      };

      let gameOver = false;
      let gamePaused = false;
      return { grid, tetromino, gameOver, gamePaused };
    });
    setStats({ level: 0, lines: 0, score: 0 });
  }

  function togglePause() {
    setGame((prev) => {
      let { grid, tetromino, gameOver, gamePaused } = prev;
      if (!gameOver) gamePaused = !gamePaused;
      return { grid, tetromino, gameOver, gamePaused };
    });
  }

  return (
    <div className="Game">
      <div className="left-sidebar">
        <h3>HOLD</h3>
        <div className="hold">{holdToJSX()}</div>
        <div className="controls">
          <p>
            <span className="key">⬅⬇⮕</span>
            :MOVE
          </p>
          <p>
            <span className="key">⬆</span>
            :ROTATE
          </p>
          <p>
            <span className="key text">[SPACE]</span>
            :DROP
          </p>
          <p>
            <span className="key text">[TAB]</span>
            :HOLD
          </p>
          <p>
            <span className="key">🅿</span>
            :PAUSE
          </p>
          <p>
            <span className="key">🆁</span>
            :RESTART
          </p>
        </div>
      </div>
      <Grid game={game} HEIGHT={HEIGHT} WIDTH={WIDTH} />
      <div className="right-sidebar">
        <h3>NEXT</h3>
        <div className="next-tetromino">{nextToJSX()}</div>
        <div className="stats">
          <p className="level">
            LEVEL
            <br />
            {stats.level}
          </p>
          <p className="lines">
            LINES
            <br />
            {stats.lines}
          </p>
          <p className="score">
            SCORE
            <br />
            {stats.score}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Game;
