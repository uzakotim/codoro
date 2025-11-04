import path from 'path'
import { app, BrowserWindow, Tray, nativeImage, screen, ipcMain } from 'electron'

let tray: Tray | null = null;
let popupWindow: BrowserWindow | null = null;

const isProd = process.env.NODE_ENV === 'production';

// Define the target Next.js page path
const TARGET_PAGE = 'home';

function createPopupWindow() {
  const devPort = process.argv[2] || 8888;

  popupWindow = new BrowserWindow({
    width: 500,
    height: 200,
    show: false,
    frame: false,
    resizable: false,
    movable: false, // Set to true if you want the user to be able to move it
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    // Note: vibrancy/visualEffectState are macOS specific
    vibrancy: 'popover',
    visualEffectState: 'active',
    webPreferences: {
      // It's recommended to set contextIsolation: true and use preload scripts,
      // but keeping your original settings to avoid breaking existing ipcMain logic.
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // FIX: Construct the URL to load the '/home' page correctly in both environments.
  // In development, it points directly to the server route.
  // In production (app://./index.html), we use a hash (#) to instruct the Next.js router
  // to navigate to the correct page once the main app is loaded.
  const url = isProd
    ? `app://./index.html#/${TARGET_PAGE}`
    : `http://localhost:${devPort}/${TARGET_PAGE}`;

  popupWindow.loadURL(url);
  // Debug line (optional)
  // popupWindow.webContents.openDevTools();

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
  const iconPath = path.join(
    // In production, the resources are placed directly next to the main process executable
    app.isPackaged ? process.resourcesPath : __dirname,
    '../resources/iconTemplate.png'
  );

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
ipcMain.on('message', (event, arg) => {
  event.reply('message', `${arg} World!`);
});
