const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('timerAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (partial) => ipcRenderer.invoke('save-config', partial),
  getConstants: () => ipcRenderer.invoke('get-constants'),
  setPosition: (x, y) => ipcRenderer.send('set-position', x, y),
  setWindowSize: (w, h) => ipcRenderer.send('set-window-size', w, h),
  bringToFront: () => ipcRenderer.send('bring-to-front'),
  normalTop: () => ipcRenderer.send('normal-top'),
  quit: () => ipcRenderer.send('quit-app')
});
