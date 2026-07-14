const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
const PAD = 28;            // transparent margin around the disc (for glow / shadow)
const PANEL_W = 360;       // window size while the settings panel is open
const PANEL_H = 520;

let win;

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    return {};
  }
}
function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  } catch (e) {
    // best-effort; ignore write failures
  }
}

let cfg = Object.assign(
  { minutes: 25, size: 120, lang: 'he', x: null, y: null },
  loadConfig()
);

function clampToScreen(x, y, w, h) {
  const area = screen.getDisplayMatching({ x, y, width: w, height: h }).workArea;
  if (x + w > area.x + area.width) x = area.x + area.width - w;
  if (y + h > area.y + area.height) y = area.y + area.height - h;
  if (x < area.x) x = area.x;
  if (y < area.y) y = area.y;
  return { x: Math.round(x), y: Math.round(y) };
}

function createWindow() {
  const size = cfg.size + PAD;
  const opts = {
    width: size,
    height: size,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  };
  if (cfg.x != null && cfg.y != null) {
    opts.x = cfg.x;
    opts.y = cfg.y;
  }

  win = new BrowserWindow(opts);
  win.setAlwaysOnTop(true, 'floating');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  if (process.platform === 'darwin' && app.dock) app.dock.hide();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => app.quit());

ipcMain.handle('get-config', () => cfg);

ipcMain.handle('save-config', (e, partial) => {
  cfg = Object.assign(cfg, partial);
  saveConfig(cfg);
  return cfg;
});

ipcMain.on('set-position', (e, x, y) => {
  if (win) win.setPosition(Math.round(x), Math.round(y));
});

ipcMain.on('set-window-size', (e, w, h) => {
  if (!win) return;
  const b = win.getBounds();
  const pos = clampToScreen(b.x, b.y, w, h);
  win.setBounds({ x: pos.x, y: pos.y, width: Math.round(w), height: Math.round(h) });
});

ipcMain.on('bring-to-front', () => {
  if (!win) return;
  win.setAlwaysOnTop(true, 'screen-saver');
  win.showInactive();
  win.moveTop();
});

ipcMain.on('normal-top', () => {
  if (win) win.setAlwaysOnTop(true, 'floating');
});

ipcMain.on('quit-app', () => app.quit());

// expose layout constants to the renderer so both stay in sync
ipcMain.handle('get-constants', () => ({ PAD, PANEL_W, PANEL_H }));
