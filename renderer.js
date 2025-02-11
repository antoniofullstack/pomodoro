const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const durationInput = document.getElementById('duration');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const messageElement = document.getElementById('message');

let countdown = null;
let remainingTime = 0;

// Set default duration to 20 minutes
durationInput.value = 20;

// Adicionar estado centralizado
const TimerState = {
    IDLE: 'idle',
    RUNNING: 'running',
    PAUSED: 'paused'
};

let timerState = TimerState.IDLE;

function updateTimerState(newState) {
    timerState = newState;
    updateUIForState(timerState);
}

function updateUIForState(state) {
    switch(state) {
        case TimerState.RUNNING:
            startBtn.disabled = true;
            stopBtn.disabled = false;
            durationInput.disabled = true;
            messageElement.textContent = 'Timer em andamento... 🕒';
            break;
        case TimerState.IDLE:
            startBtn.disabled = false;
            stopBtn.disabled = true;
            durationInput.disabled = false;
            messageElement.textContent = '';
            break;
    }
}

function updateDisplay(totalSeconds) {
    // Fazer batch das atualizações do DOM
    requestAnimationFrame(() => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const paddedSeconds = seconds.toString().padStart(2, '0');
        
        minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        secondsDisplay.textContent = paddedSeconds;
        document.title = `${minutes}:${paddedSeconds} - Pomodoro Break`;
    });
}

function startTimer() {
    const duration = parseInt(durationInput.value);
    if (duration < 1 || duration > 120) {
        alert('Por favor, insira uma duração entre 1 e 120 minutos');
        return;
    }

    remainingTime = duration * 60;
    updateDisplay(remainingTime);
    
    startBtn.disabled = true;
    stopBtn.disabled = false;
    durationInput.disabled = true;
    messageElement.textContent = 'Timer em andamento... 🕒';

    // Start the timer in the main process
    window.electronAPI.startTimer(duration * 60 * 1000);

    // Update the display every second
    countdown = setInterval(() => {
        remainingTime--;
        updateDisplay(remainingTime);
        
        if (remainingTime <= 0) {
            stopTimer();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(countdown);
    window.electronAPI.stopTimer();
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
    durationInput.disabled = false;
    messageElement.textContent = '';
    
    updateDisplay(durationInput.value * 60);
    document.title = 'Pomodoro Break';
}

// Event listeners
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);

durationInput.addEventListener('input', () => {
    if (!countdown) {
        updateDisplay(durationInput.value * 60);
    }
});

// Handle events from main process
window.electronAPI.onTimerComplete(() => {
    messageElement.textContent = 'Levanta e vai beber uma água! 🚰';
    playNotification().catch(() => {});
    stopTimer();
});

window.electronAPI.onStartDefaultTimer(() => {
    durationInput.value = 20;
    startTimer();
});

window.electronAPI.onStopTimerRequest(() => {
    stopTimer();
});

// Melhorar tratamento de erros
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Melhorar tratamento de erro no áudio
async function playNotification() {
    try {
        const audio = new Audio('notification.mp3');
        await audio.play();
    } catch (error) {
        console.warn('Failed to play notification sound:', error);
    }
}

// Adicionar persistência da última duração usada
const STORAGE_KEY = 'pomodoro-settings';

function saveSettings() {
    const settings = {
        lastDuration: durationInput.value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (settings && settings.lastDuration) {
            durationInput.value = settings.lastDuration;
            updateDisplay(settings.lastDuration * 60);
        }
    } catch (error) {
        console.warn('Failed to load settings:', error);
    }
}

// Chamar loadSettings() na inicialização
document.addEventListener('DOMContentLoaded', loadSettings); 