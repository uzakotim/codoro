import path from 'path'
import { app, BrowserWindow,protocol, Tray, nativeImage, screen, ipcMain, } from 'electron'
import { saveData, loadData, deleteData } from './storage';
import fs from 'fs';
let tray: Tray | null = null;
let popupWindow: BrowserWindow | null = null;
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
// Whitelist of allowed editors with their process names per platform
const ALLOWED_EDITORS: Record<string, { darwin: string; win32: string; linux: string }> = {
  'Visual Studio Code': { darwin: 'Code', win32: 'Code.exe', linux: 'code' },
  'Sublime Text': { darwin: 'Sublime Text', win32: 'sublime_text.exe', linux: 'subl' },
  'Atom': { darwin: 'Atom', win32: 'atom.exe', linux: 'atom' },
  'WebStorm': { darwin: 'WebStorm', win32: 'webstorm.exe', linux: 'webstorm' },
  'IntelliJ IDEA': { darwin: 'IntelliJ IDEA', win32: 'idea.exe', linux: 'idea' },
  'PyCharm': { darwin: 'PyCharm', win32: 'pycharm.exe', linux: 'pycharm' },
  'Vim': { darwin: 'Vim', win32: 'gvim.exe', linux: 'vim' },
  'Emacs': { darwin: 'Emacs', win32: 'emacs.exe', linux: 'emacs' },
  'Notepad++': { darwin: 'Notepad++', win32: 'notepad++.exe', linux: 'notepadqq' },
  'XCode': { darwin: 'XCode', win32: '', linux: '' },
  'Eclipse': { darwin: 'Eclipse', win32: 'eclipse.exe', linux: 'eclipse' },
  'NetBeans': { darwin: 'NetBeans', win32: 'netbeans.exe', linux: 'netbeans' },
  'PhpStorm': { darwin: 'PhpStorm', win32: 'phpstorm.exe', linux: 'phpstorm' },
  'RubyMine': { darwin: 'RubyMine', win32: 'rubymine.exe', linux: 'rubymine' },
  'CLion': { darwin: 'CLion', win32: 'clion.exe', linux: 'clion' },
  'GoLand': { darwin: 'GoLand', win32: 'goland.exe', linux: 'goland' },
  // Add more editors as needed
};
const ALLOWED_SHORTCUTS = {
  enableDND: 'Enable Do Not Disturb',
  disableDND: 'Disable Do Not Disturb'
};
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

// Disable DND on app quit (macOS)
app.on('before-quit', async (event) => {
    if (process.platform === 'darwin') {
      try {
        console.log('Disabling Do Not Disturb before quitting...');
        const { execFile } = require('child_process');
        const { promisify } = require('util');
        const execFileAsync = promisify(execFile);
        
        await execFileAsync('osascript', [
          '-e',
          `tell application "Shortcuts Events" to run the shortcut "${ALLOWED_SHORTCUTS.disableDND}"`
        ], { timeout: 5000 });
        
        console.log('Successfully disabled Do Not Disturb.');
      } catch (error) {
        console.error('Failed to disable Do Not Disturb:', error);
      }
    }
  }
);

// IPC handler example (kept for completeness)

ipcMain.handle('get-data', (_, key, defaultValue) => loadData(key, defaultValue));
ipcMain.handle('set-data', (_, key, value) => saveData(key, value));
ipcMain.handle('delete-data', (_, key) => deleteData(key));

ipcMain.handle('launch-editor', async (event, appName: string) => {
  
  try {
    if (!appName) throw new Error('App name not provided');
    
    // Validate against whitelist
    const editorConfig = ALLOWED_EDITORS[appName];
    if (!editorConfig) {
      throw new Error(`Editor "${appName}" is not in the allowed list`);
    }
    console.log(`Request to launch editor: ${appName}`);
    const platform = process.platform as 'darwin' | 'win32' | 'linux';
    const processName = editorConfig[platform];
    
    // Check if already running (platform-specific)
    let isRunning = false;
    try {
      if (platform === 'darwin' || platform === 'linux') {
        const { stdout } = await execAsync(`pgrep -x "${processName}"`, { timeout: 5000 });
        isRunning = !!stdout.trim();
      } else if (platform === 'win32') {
        const { stdout } = await execAsync(`tasklist /FI "IMAGENAME eq ${processName}" /NH`, { timeout: 5000 });
        isRunning = stdout.includes(processName);
      }
    } catch (err) {
      // pgrep returns non-zero if process not found
      isRunning = false;
    }
    
    if (isRunning) {
      console.log(`${appName} is already running.`);
      return 'already-running';
    }
    
    // Launch app (platform-specific)
    console.log(`Launching ${appName}...`);
    if (platform === 'darwin') {
      await execAsync(`open -a "${appName}"`, { timeout: 10000 });
    } else if (platform === 'win32') {
      await execAsync(`start "" "${appName}"`, { timeout: 10000 });
    } else if (platform === 'linux') {
      await execAsync(`"${processName}" &`, { timeout: 10000 });
    }
    
    return 'launched';
  } catch (error) {
    console.error(`Failed to launch ${appName}:`, error);
    throw error;
  }
});
ipcMain.handle('set-dnd', async (event, onFocuseName?: string) => {
  try {
    if (process.platform !== 'darwin') {
      throw new Error('Do Not Disturb shortcuts are only supported on macOS');
    }
    // Validate against whitelist or use default
    const shortcutName = onFocuseName && Object.values(ALLOWED_SHORTCUTS).includes(onFocuseName)
      ? onFocuseName
      : ALLOWED_SHORTCUTS.enableDND;
    
    console.log(`Running shortcut: ${shortcutName}`);
    
    // Use execFile with array args to prevent injection
    const { execFile } = require('child_process');
    const { promisify } = require('util');
    const execFileAsync = promisify(execFile);
    
    await execFileAsync('osascript', [
      '-e',
      `tell application "Shortcuts Events" to run the shortcut "${shortcutName}"`
    ], { timeout: 5000 });
    
    console.log(`Successfully ran shortcut "${shortcutName}"`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to run shortcut:`, error);
    throw error;
  }
});
ipcMain.handle('disable-dnd', async (event,offFocusName?: string) => {
  try {
    if (process.platform !== 'darwin') {
      throw new Error('Do Not Disturb shortcuts are only supported on macOS');
    }
    // Validate against whitelist or use default
    const shortcutName = offFocusName && Object.values(ALLOWED_SHORTCUTS).includes(offFocusName)
      ? offFocusName
      : ALLOWED_SHORTCUTS.disableDND;
    
    console.log(`Running shortcut: ${shortcutName}`);
    
    // Use execFile with array args to prevent injection
    const { execFile } = require('child_process');
    const { promisify } = require('util');
    const execFileAsync = promisify(execFile);
    
    await execFileAsync('osascript', [
      '-e',
      `tell application "Shortcuts Events" to run the shortcut "${shortcutName}"`
    ], { timeout: 5000 });
    
    console.log(`Successfully ran shortcut "${shortcutName}"`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to run shortcut:`, error);
    throw error;
  }
});



ipcMain.on('message', (event, arg) => {
  event.reply('message', `${arg} World!`);
});
