const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  screen,
  Notification,
} = require("electron");
const path = require("path");
const fs = require("fs");

// Add these lines at the start after the requires
const userDataPath = path.join(app.getPath("appData"), "pomodoro-break");
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}
app.setPath("userData", userDataPath);

let mainWindow;
let tray;
let timer = null;
let screensaverWindows = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      sandbox: true,
    },
    icon: path.join(__dirname, "icon.png"),
    resizable: false,
    autoHideMenuBar: true,
    minimizable: true,
    maximizable: false,
    skipTaskbar: false,
  });

  // Add this error handling
  mainWindow.webContents.session.clearCache().catch((err) => {
    console.error("Failed to clear cache:", err);
  });

  mainWindow.loadFile("index.html");

  mainWindow.on("minimize", (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  const iconPath =
    process.platform === "win32"
      ? path.join(__dirname, "icons", "tray.ico") // Windows prefere .ico
      : path.join(__dirname, "icons", "tray.png"); // macOS/Linux preferem .png

  try {
    tray = new Tray(iconPath);
  } catch (error) {
    console.error("Failed to create tray:", error);
    // Fallback para um ícone alternativo se o principal falhar
    const fallbackIcon = path.join(__dirname, "icons", "fallback-tray.png");
    tray = new Tray(fallbackIcon);
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        mainWindow.show();
      },
    },
    {
      type: "separator",
    },
    {
      label: "Start Timer (20min)",
      click: () => {
        mainWindow.webContents.send("start-default-timer");
      },
    },
    {
      label: "Stop Timer",
      click: () => {
        mainWindow.webContents.send("stop-timer-request");
      },
    },
    {
      type: "separator",
    },
    {
      label: "Quit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Pomodoro Break - Stay Healthy!");
  tray.setContextMenu(contextMenu);

  let clickTimer = null;

  tray.on("click", () => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
        mainWindow.show();
        mainWindow.restore();
        mainWindow.focus();
      }
    } else {
      clickTimer = setTimeout(() => {
        clickTimer = null;
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
        }
      }, 200);
    }
  });
}

function closeScreensaver() {
  screensaverWindows.forEach((win) => {
    if (!win.isDestroyed()) {
      win.close();
    }
  });
  screensaverWindows = [];
}

function startScreensaver() {
  closeScreensaver();

  const displays = screen.getAllDisplays();
  displays.forEach((display) => {
    let win = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      frame: false,
      fullscreen: true,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    win.loadFile("screensaver.html");
    screensaverWindows.push(win);

    win.on("closed", () => {
      const index = screensaverWindows.indexOf(win);
      if (index > -1) {
        screensaverWindows.splice(index, 1);
      }
    });
  });

  // Close screensaver after 30 seconds
  setTimeout(closeScreensaver, 30000);
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function showNotification() {
  const notification = new Notification({
    title: "Break Time!",
    body: "Time to drink water and stretch!",
    icon: path.join(__dirname, "icon.png"),
  });

  notification.on("click", () => {
    mainWindow.show();
  });

  notification.show();
}

ipcMain.on("start-timer", (event, duration) => {
  if (timer) {
    clearTimeout(timer);
  }

  timer = setTimeout(() => {
    mainWindow.show();
    startScreensaver();
    showNotification();
    mainWindow.webContents.send("timer-complete");
  }, duration);
});

ipcMain.on("stop-timer", () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
});
