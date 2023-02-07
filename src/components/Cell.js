import "../styles/Cell.css";

function Cell({ colour }) {
  return <div className={"Cell" + (colour ? " " + colour : "")} />;
}

export default Cell;
