const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');

const localApp = express();
let localServerUrl = '';

function startLocalServer() {
  return new Promise((resolve) => {
    localApp.use(express.json());
    localApp.use(express.static(path.join(__dirname, 'ui')));
    localApp.use((req, res, next) => {
      if (req.path === '/api/print-receipt') return next();
      res.sendFile(path.join(__dirname, 'ui', 'index.html'));
    });
    
    localApp.post('/api/print-receipt', (req, res) => {
      const order = req.body;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('trigger-print', order);
        res.json({ success: true });
      } else {
        res.status(500).json({ error: 'Main window not available' });
      }
    });

    // Bind to 0.0.0.0 so other devices on Wi-Fi can connect
    // Use port 8080 (or fallback if 8080 is in use)
    const srv = localApp.listen(8080, '0.0.0.0', () => {
      localServerUrl = `http://127.0.0.1:${srv.address().port}`;
      resolve();
    }).on('error', (err) => {
      // If 8080 is taken, use random port
      const fallbackSrv = localApp.listen(0, '0.0.0.0', () => {
        localServerUrl = `http://127.0.0.1:${fallbackSrv.address().port}`;
        resolve();
      });
    });
  });
}

// Config file to store printer settings
const configPath = path.join(app.getPath('userData'), 'printer-config.json');

function readConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

function writeConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

let mainWindow;
let settingsWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, 'icon.png'),
    title: 'Isfayram POS',
    fullscreen: true,
    kiosk: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Allow loading Vercel site with preload
      webSecurity: false,
    },
    backgroundColor: '#13120F',
    show: false,
  });

  // Load the local production site (OFFLINE)
  mainWindow.loadURL(localServerUrl);

  mainWindow.once('ready-to-show', () => {
    // Force clear cache to prevent old React builds from being stuck by Service Workers
    mainWindow.webContents.session.clearCache().then(() => {
      return mainWindow.webContents.session.clearStorageData({ storages: ['serviceworkers', 'cachestorage'] });
    }).then(() => {
      mainWindow.show();
      mainWindow.maximize();
    });
  });

  // After every page load, override window.print() to use Electron silent print
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      (function() {
        if (window.electronApi && window.electronApi.isElectron) {
          window.print = function() {
            window.electronApi.printMainWindowSilent();
          };
        }
      })();
      undefined;
    `).catch(() => {});
  });

  // Hide the application menu completely
  Menu.setApplicationMenu(null);
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

ipcMain.handle('get-local-ip', () => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let ip = "Topilmadi";
  for (let k in interfaces) {
      for (let k2 in interfaces[k]) {
          let address = interfaces[k][k2];
          if (address.family === 'IPv4' && !address.internal) {
              ip = address.address;
              break;
          }
      }
  }
  const port = localServerUrl.split(':').pop();
  return { ip, port };
});

// Get available printers
ipcMain.handle('get-printers', async () => {
  try {
    const printers = await mainWindow.webContents.getPrintersAsync();
    return printers.map(p => ({ name: p.name, isDefault: p.isDefault }));
  } catch (e) {
    return [];
  }
});

// Get kitchen station names from config (saved when a receipt is printed)
let knownStations = [];
ipcMain.handle('get-stations', () => {
  const config = readConfig();
  // Return union of known stations from config + any we've seen
  const fromConfig = Object.keys(config).filter(k => k !== '__stations__');
  return [...new Set([...fromConfig, ...knownStations])];
});

// Get/set printer config
ipcMain.handle('get-printer-config', () => readConfig());
ipcMain.handle('set-printer-config', (_, config) => {
  writeConfig(config);
  return true;
});

// Resolve a saved printer name to an existing printer (fallback: default printer)
async function resolvePrinter(savedName) {
  try {
    const printers = await mainWindow.webContents.getPrintersAsync();
    if (savedName && printers.some(p => p.name === savedName)) return savedName;
    const def = printers.find(p => p.isDefault);
    return def ? def.name : (printers[0] ? printers[0].name : undefined);
  } catch (e) {
    return savedName || undefined;
  }
}

// ── Cashier receipt: print given HTML in a hidden window ─────────────────────
ipcMain.handle('print-receipt-html', async (_, receiptHtml) => {
  const config = readConfig();
  const targetPrinter = await resolvePrinter(config['__receipt_printer__']);

  // Replace logo src with embedded base64 (relative URLs don't work in a temp file)
  let body = String(receiptHtml || '');
  try {
    const logoPath = path.join(__dirname, 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logoBase64 = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
      body = body.replace(/(<img[^>]*\ssrc=")[^"]*(")/g, `$1${logoBase64}$2`);
    }
  } catch (e) {}

  const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  @page { margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; width: 80mm; }
  * { color: #000 !important; -webkit-print-color-adjust: exact; }
</style></head><body>${body}</body></html>`;

  const tmpFile = path.join(app.getPath('temp'), `isfayram-receipt-${Date.now()}.html`);
  fs.writeFileSync(tmpFile, fullHtml, 'utf-8');

  const printWin = new BrowserWindow({
    width: 302, // ~80mm at 96dpi
    height: 800,
    show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });

  try {
    await printWin.loadFile(tmpFile);
    // Measure content height so thermal paper isn't wasted
    let heightPx = 1100;
    try {
      heightPx = await printWin.webContents.executeJavaScript('document.body.scrollHeight');
    } catch (e) {}
    const heightMicrons = Math.max(50000, Math.ceil(heightPx * 25400 / 96) + 10000);

    const result = await new Promise((resolve) => {
      const printOptions = {
        silent: true,
        printBackground: false,
        margins: { marginType: 'none' },
        pageSize: { width: 80000, height: heightMicrons },
      };
      if (targetPrinter) printOptions.deviceName = targetPrinter;
      setTimeout(() => {
        printWin.webContents.print(printOptions, (success, reason) => {
          resolve({ success, error: success ? null : reason, printer: targetPrinter || null });
        });
      }, 200);
    });
    return result;
  } catch (e) {
    return { success: false, error: e.message, printer: targetPrinter || null };
  } finally {
    if (!printWin.isDestroyed()) printWin.close();
    fs.unlink(tmpFile, () => {});
  }
});

// ── Silent print of main window (shift report etc.) ──────────────────────────
ipcMain.handle('print-main-window-silent', async () => {
  const config = readConfig();
  const targetPrinter = await resolvePrinter(config['__receipt_printer__']);
  
  return new Promise((resolve) => {
    const printOptions = {
      silent: true,
      printBackground: false,
      margins: { marginType: 'none' },
      pageSize: { width: 80000, height: 297000 },
    };
    if (targetPrinter) printOptions.deviceName = targetPrinter;
    
    mainWindow.webContents.print(printOptions, (success) => {
      resolve(success);
    });
  });
});


// ── MAIN PRINT HANDLER ────────────────────────────────────────────────────────
ipcMain.handle('print-to-station', async (_, data) => {
  const { stationName, items, tableNumber, waiterName } = data;

  // Track known stations
  if (!knownStations.includes(stationName)) {
    knownStations.push(stationName);
  }

  const config = readConfig();
  const targetPrinter = await resolvePrinter(config[stationName]);

  // Read receipt template
  const templatePath = path.join(__dirname, 'receipt-template.html');
  let html = fs.readFileSync(templatePath, 'utf-8');

  // Inject logo as base64
  let logoBase64 = '';
  try {
    const logoPath = path.join(__dirname, 'logo.png');
    if (fs.existsSync(logoPath)) {
      logoBase64 = 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64');
    }
  } catch(e) {}

  // Inject data into template
  const injectedData = JSON.stringify({ stationName, items, tableNumber, waiterName, logoBase64 });
  html = html.replace('<script>', `<script>window.__RECEIPT_DATA__ = ${injectedData};</script><script>`);

  // Create hidden window for printing
  const printWin = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true }
  });

  await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  return new Promise((resolve, reject) => {
    const printOptions = {
      silent: true,
      printBackground: false,
      margins: { marginType: 'none' },
      pageSize: { width: 80000, height: 297000 }, // 80mm width in microns
    };

    if (targetPrinter) {
      printOptions.deviceName = targetPrinter;
    }

    setTimeout(() => {
      printWin.webContents.print(printOptions, (success, reason) => {
        printWin.close();
        if (success) resolve(true);
        else resolve(false); // Don't reject - still navigate back
      });
    }, 300);
  });
});

app.whenReady().then(async () => {
  await startLocalServer();
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
