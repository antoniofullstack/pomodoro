export interface TimerConfig {
    workTime: number;
    shortBreak: number;
    longBreak: number;
}

export interface TimerState {
    time: number;
    isActive: boolean;
    isBreak: boolean;
    cycles: number;
}
