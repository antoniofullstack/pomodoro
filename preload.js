const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startTimer: (duration) => ipcRenderer.send('start-timer', duration),
    stopTimer: () => ipcRenderer.send('stop-timer'),
    onTimerComplete: (callback) => ipcRenderer.on('timer-complete', callback),
    onStartDefaultTimer: (callback) => ipcRenderer.on('start-default-timer', callback),
    onStopTimerRequest: (callback) => ipcRenderer.on('stop-timer-request', callback)
}); 