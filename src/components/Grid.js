import "../styles/Grid.css";
import Cell from "./Cell";
import { getTetromino } from "../scripts/tetromino";
import { useCallback, useEffect, useState } from "react";

function Grid() {
  const WIDTH = 10;
  const HEIGHT = 20;
  const [activeTetromino, setActiveTetromino] = useState({
    tetromino: getTetromino(),
    x: 3,
    y: 0,
  });

  let grid = [];
  for (let i = 0; i < HEIGHT; i++) grid.push(Array(WIDTH).fill(null));

  const [placedGrid, setPlacedGrid] = useState(grid);
  const [activeGrid, setActiveGrid] = useState(
    grid.map((row) => row.map(() => <Cell />))
  );

  const positionTetromino = useCallback(() => {
    setActiveGrid(() => {
      const { tetromino, x, y } = activeTetromino;

      let result = [];
      for (let i = 0; i < HEIGHT; i++) {
        result[i] = [];
        for (let j = 0; j < WIDTH; j++)
          result[i][j] = placedGrid[i][j] || <Cell />;
      }

      for (let i = 0; i < tetromino.length; i++)
        for (let j = 0; j < tetromino[0].length; j++)
          if (tetromino[i][j] && placedGrid[i + y]?.[j + x] !== null)
            return result;

      for (let i = 0; i < tetromino.length; i++)
        for (let j = 0; j < tetromino[0].length; j++)
          if (tetromino[i][j]) result[i + y][j + x] = tetromino[i][j];

      return result;
    });
  }, [activeTetromino, placedGrid]);

  useEffect(() => {
    positionTetromino();
  }, [positionTetromino]);

  const deactivateTetromino = useCallback(() => {
    setPlacedGrid((prev) => {
      const { tetromino, x, y } = activeTetromino;

      let result = [];
      for (let i = 0; i < HEIGHT; i++) {
        result[i] = [];
        for (let j = 0; j < WIDTH; j++) result[i][j] = prev[i][j];
      }

      for (let i = 0; i < tetromino.length; i++)
        for (let j = 0; j < tetromino[0].length; j++)
          if (tetromino[i][j]) result[i + y][j + x] = tetromino[i][j];

      function clearCompletedRows(prev) {
        let result = [];
        for (let i = HEIGHT - 1; i >= 0; i--)
          if (prev[i].some((cell) => !cell)) result.push(prev[i]);
        while (result.length < HEIGHT) result.push(Array(WIDTH).fill(null));
        result.reverse();
        return result;
      }

      result = clearCompletedRows(result);
      return result;
    });
  }, [activeTetromino]);

  const moveTetromino = useCallback(
    (direction) => {
      setActiveTetromino((prev) => {
        let { tetromino, x, y } = prev;

        function checkCollision() {
          for (let i = 0; i < tetromino.length; i++)
            for (let j = 0; j < tetromino[0].length; j++)
              if (tetromino[i][j])
                switch (direction) {
                  case "L":
                    if (placedGrid[y + i][x + j - 1] !== null) return true;
                    break;
                  case "R":
                    if (placedGrid[y + i][x + j + 1] !== null) return true;
                    break;
                  case "D":
                    if (placedGrid[y + i + 1]?.[x + j] !== null) return true;
                    break;
                  default:
                }
          return false;
        }

        switch (direction) {
          case "L":
            if (!checkCollision()) x--;
            break;
          case "R":
            if (!checkCollision()) x++;
            break;
          case "D":
            if (!checkCollision()) y++;
            else {
              deactivateTetromino();
              return { tetromino: getTetromino(), x: 3, y: 0 };
            }
            break;
          default:
        }

        return { tetromino, x, y };
      });
    },
    [deactivateTetromino, placedGrid]
  );

  useEffect(() => {
    console.log("asdf");
    const gravityInterval = setInterval(() => {
      moveTetromino("D");
    }, 100);

    return () => {
      clearInterval(gravityInterval);
    };
  }, [moveTetromino]);

  const rotateTetromino = useCallback(() => {
    setActiveTetromino((prev) => {
      const { tetromino, x, y } = prev;

      let result = [];

      for (let i = 0; i < tetromino.length; i++) {
        result.push([]);
        for (let j = 0; j < tetromino[0].length; j++)
          result[i][j] = tetromino[i][j];
      }

      result = result[0].map((val, index) =>
        result.map((row) => row[index]).reverse()
      );

      function checkCollision() {
        for (let i = 0; i < result.length; i++)
          for (let j = 0; j < result[0].length; j++)
            if (result[i][j] && placedGrid[y + i]?.[x + j] !== null)
              return true;
        return false;
      }

      return { tetromino: checkCollision() ? tetromino : result, x, y };
    });
  }, [placedGrid]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.repeat) return;

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
  }, [moveTetromino, rotateTetromino]);

  return <div className="Grid">{activeGrid}</div>;
}

export default Grid;
