import React, { useState, useEffect } from "react";

const App = () => {
  const [time, setTime] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      new Notification(
        isBreak ? "Break time is over!" : "Time to take a break!",
        {
          body: isBreak
            ? "Let's get back to work!"
            : "Good job! Take some rest.",
        }
      );

      if (!isBreak) {
        setCycles((cycles) => cycles + 1);
        setTime(cycles % 4 === 3 ? 15 * 60 : 5 * 60);
      } else {
        setTime(25 * 60);
      }
      setIsBreak(!isBreak);
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, time, isBreak, cycles]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setTime(25 * 60);
    setIsActive(false);
    setIsBreak(false);
    setCycles(0);
  };

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
