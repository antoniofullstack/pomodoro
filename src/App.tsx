import React, { useEffect } from "react";
import { useTimer } from "./hooks/useTimer";

const App = () => {
  const { time, isActive, isBreak, cycles, toggleTimer, resetTimer } =
    useTimer();

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="container">
      <h1>{isBreak ? "Break Time" : "Focus Time"}</h1>
      <div className="timer">
        <span>
          {Math.floor(time / 60)
            .toString()
            .padStart(2, "0")}
        </span>
        <span>:</span>
        <span>{(time % 60).toString().padStart(2, "0")}</span>
      </div>
      <div className="buttons">
        <button onClick={toggleTimer}>{isActive ? "Pause" : "Start"}</button>
        <button onClick={resetTimer}>Reset</button>
      </div>
      <div className="info">
        <p>Completed Cycles: {cycles}</p>
        <p>Current Mode: {isBreak ? "Break" : "Work"}</p>
      </div>
    </div>
  );
};

export default App;
