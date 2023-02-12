import "../styles/Grid.css";
import Cell from "./Cell";
import { useCallback } from "react";

function Grid({ game, HEIGHT, WIDTH }) {
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

    return cells.slice(1);
  }, [game]);

  return (
    <div className="Grid">
      {gameToJSX()}
      {game.gameOver ? (
        <div className="overlay">
          <p>GAME OVER</p>
          <p>PRESS R TO RESTART</p>
        </div>
      ) : null}
      {game.gamePaused ? (
        <div className="overlay">
          <p>PAUSED</p>
          <p>PRESS P TO UNPAUSE</p>
        </div>
      ) : null}
      {game.startScreen ? (
        <div className="overlay">
          <p>PRESS S TO START</p>
        </div>
      ) : null}
    </div>
  );
}

export default Grid;
