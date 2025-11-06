import path from 'path'
import { app, BrowserWindow,protocol, Tray, nativeImage, screen, ipcMain, } from 'electron'
import { saveData, loadData, deleteData } from './storage';
import fs from 'fs';
let tray: Tray | null = null;
let popupWindow: BrowserWindow | null = null;

const isProd = process.env.NODE_ENV === 'production';
// Define the target Next.js page path
const TARGET_PAGE = 'home';

async function createPopupWindow() {
  const devPort = process.argv[2] || 8888;
  popupWindow = new BrowserWindow({
    width: 300,
    height: 400,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    vibrancy: 'popover',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  if (isProd) {
    await popupWindow.loadURL('app://./home');
  } else {
    const port = process.argv[2]
    await popupWindow.loadURL(`http://localhost:${port}/home`)
    // popupWindow.webContents.openDevTools()
  }
  // Hide the popup when it loses focus (blurs)
  popupWindow.on('blur', () => popupWindow?.hide());
}

/**
 * Toggles the visibility and position of the popup window relative to the tray icon.
 * @param bounds The bounds of the tray icon.
 */
function togglePopup(bounds: Electron.Rectangle) {
  if (!popupWindow) return;

  const { width, height } = popupWindow.getBounds();

  // Calculate the position: centered horizontally relative to the tray icon
  const trayX = Math.round(bounds.x + bounds.width / 2 - width / 2);
  // Position below the tray icon, plus a small margin (4px)
  let trayY = Math.round(bounds.y + bounds.height + 4);

  const display = screen.getPrimaryDisplay();
  const screenHeight = display.workAreaSize.height;

  // Handle case where the tray is at the bottom of the screen (e.g., Windows/Linux)
  // or if the calculated position is near the edge, by placing it above the tray.
  if (trayY + height > screenHeight) {
    trayY = Math.round(bounds.y - height - 4);
  }

  // Ensure the position is valid, adjusting for top or bottom placement
  const y = trayY > 0 ? trayY : screenHeight - height - bounds.height - 10;

  if (popupWindow.isVisible()) {
    popupWindow.hide();
  } else {
    popupWindow.setPosition(trayX, y, false);
    popupWindow.show();
    popupWindow.focus();
  }
}


/**
 * Creates the system tray icon and attaches the click handler.
 */
function createTray() {
  // Determine the path to the icon file

  let iconPath = "";
  if (app.isPackaged) {
    iconPath = path.join(process.resourcesPath,"resources",'iconTemplate.png');
  } else {
    iconPath = path.join(__dirname, '../resources/iconTemplate.png');
  }

  // Create the native image, enabling template image for better dark mode support on macOS
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 24, height: 24 });
  trayIcon.setTemplateImage(true);

  if (trayIcon.isEmpty()) {
    console.error('❌ Tray icon failed to load:', iconPath);
    return;
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('My Tray App');

  // Attach the toggle function to the tray click event
  tray.on('click', (_event, bounds) => togglePopup(bounds));
  console.log('✅ Tray icon created');
}


// App lifecycle setup
app.whenReady().then(() => {
  if (isProd) {
    protocol.registerFileProtocol('app', (request, callback) => {
    // Remove app://./ prefix
    let urlPath = request.url.replace('app://./', '');

    // Map page URLs to index.html
    const pageFile = path.join(__dirname, urlPath, 'index.html');
    if (fs.existsSync(pageFile)) {
      callback({ path: pageFile });
      return;
    }

    // Serve static assets (_next/static)
    const staticFile = path.join(__dirname, urlPath);
    if (fs.existsSync(staticFile)) {
      callback({ path: staticFile });
      return;
    }

    console.error('❌ File not found for app:// URL:', urlPath);
    callback({ error: -6 }); // ERR_FILE_NOT_FOUND
  });
  }
  createTray();
  createPopupWindow();
});

// Prevent the app from quitting on macOS when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handler example (kept for completeness)

ipcMain.handle('get-data', (_, key, defaultValue) => loadData(key, defaultValue));
ipcMain.handle('set-data', (_, key, value) => saveData(key, value));
ipcMain.handle('delete-data', (_, key) => deleteData(key));

ipcMain.on('message', (event, arg) => {
  event.reply('message', `${arg} World!`);
});
