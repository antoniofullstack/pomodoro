import { useState, useEffect } from 'react';
import { TimerConfig, TimerState } from '../types/timer';

const defaultConfig: TimerConfig = {
    workTime: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
};

export const useTimer = (config: TimerConfig = defaultConfig) => {
    const [state, setState] = useState<TimerState>({
        time: config.workTime,
        isActive: false,
        isBreak: false,
        cycles: 0,
    });

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        if (state.isActive && state.time > 0) {
            interval = setInterval(() => {
                setState(prev => ({ ...prev, time: prev.time - 1 }));
            }, 1000);
        } else if (state.time === 0) {
            handleTimerComplete();
        }

        return () => clearInterval(interval);
    }, [state.isActive, state.time]);

    const handleTimerComplete = async () => {
        if (Notification.permission === 'granted') {
            new Notification(
                state.isBreak ? "Break time is over!" : "Time to take a break!",
                {
                    body: state.isBreak ? "Let's get back to work!" : "Good job! Take some rest.",
                }
            );
        }

        const newState = { ...state };
        if (!state.isBreak) {
            newState.cycles += 1;
            newState.time = newState.cycles % 4 === 3 ? config.longBreak : config.shortBreak;
        } else {
            newState.time = config.workTime;
        }
        newState.isBreak = !state.isBreak;
        newState.isActive = false;
        setState(newState);
    };

    const toggleTimer = () => setState(prev => ({ ...prev, isActive: !prev.isActive }));
    const resetTimer = () => setState({
        time: config.workTime,
        isActive: false,
        isBreak: false,
        cycles: 0,
    });

    return {
        ...state,
        toggleTimer,
        resetTimer,
    };
};
