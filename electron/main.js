const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    darkTheme: true,
  });

  // Load the web app (in dev, it's the Vite server)
  win.loadURL('http://localhost:5173');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Hardware Simulation IPCs
ipcMain.handle('hardware:print', async (event, data) => {
  console.log('[Electron Native] Printing to USB Thermal Printer...', data);
  return { success: true };
});

ipcMain.handle('hardware:scan', async (event) => {
  console.log('[Electron Native] Listening to Serial Barcode Scanner...');
  return '8690504012345'; // Mock scanned barcode
});

ipcMain.on('hardware:openDrawer', () => {
  console.log('[Electron Native] Pulsing Cash Drawer (RJ11)...');
});
