import React from "react";

export function ScoreBoard() {
  const [score, setScore] = React.useState(0);

  function handleClickIncrease() {
    if (score < 10) {
      setScore(score + 1);
    }
  }

  function handleClickDecrease() {
    if (score < 10) {
      setScore(score - 1);
    }
  }
  function handleClickReset() {
    setScore(0);
  }

  const isDone = score >= 10 || score <= -10;
  return (
    <div style={{ textAlign: "center" }}>
      <h1 className="heading">Score Board</h1>

      {/* Buttons and score in one line */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button onClick={handleClickDecrease} disabled={isDone}>
          -
        </button>
        <p style={{ margin: "0" }}>{isDone ? "Done!" : `Score: ${score}`}</p>
        <button onClick={handleClickIncrease} disabled={isDone}>
          +
        </button>
      </div>

      {/* Reset button below */}
      <button onClick={handleClickReset} style={{ marginTop: "10px" }}>
        Reset
      </button>
    </div>
  );
}
