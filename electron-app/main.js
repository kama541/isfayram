const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
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
    title: 'ISFAYRAM POS — Premium Kafe',
    fullscreen: true,
    kiosk: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Allow loading hosted site with preload
      webSecurity: false,
    },
    backgroundColor: '#13120F',
    show: false,
  });

  const config = readConfig();
  const hostedUrl = process.env.HOSTED_POS_URL || config['__hosted_pos_url__'];

  // Smart URL loader: If hosted URL configured, attempt to connect; fallback to local server if offline
  if (hostedUrl) {
    console.log(`[POS EXE] Attempting connection to hosted URL: ${hostedUrl}`);
    mainWindow.loadURL(hostedUrl).catch((err) => {
      console.warn(`[POS EXE] Hosted POS unavailable (${err.message}). Falling back to local offline UI.`);
      mainWindow.loadURL(localServerUrl);
    });

    mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription, validatedURL) => {
      if (validatedURL === hostedUrl && !mainWindow.isDestroyed()) {
        console.warn(`[POS EXE] Load failed for ${hostedUrl}: ${errorDescription}. Fallback to local offline UI.`);
        mainWindow.loadURL(localServerUrl);
      }
    });
  } else {
    // Default: Load the production bundled local server
    mainWindow.loadURL(localServerUrl);
  }

  mainWindow.once('ready-to-show', () => {
    // Clear storage cache to ensure latest builds load immediately
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

  // Keyboard Shortcuts: F5 / Ctrl+R to reload, F11 to toggle fullscreen, Ctrl+Shift+I for DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
      mainWindow.reload();
      event.preventDefault();
    } else if (input.key === 'F11') {
      const isFull = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFull);
      mainWindow.setKiosk(!isFull);
      event.preventDefault();
    } else if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
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

// Hosted POS URL management for direct cloud sync
ipcMain.handle('get-hosted-url', () => {
  const config = readConfig();
  return config['__hosted_pos_url__'] || '';
});

ipcMain.handle('set-hosted-url', (_, url) => {
  const config = readConfig();
  config['__hosted_pos_url__'] = (url || '').trim();
  writeConfig(config);
  return true;
});

ipcMain.handle('reload-app', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const config = readConfig();
    const hostedUrl = process.env.HOSTED_POS_URL || config['__hosted_pos_url__'];
    if (hostedUrl) {
      mainWindow.loadURL(hostedUrl).catch(() => mainWindow.loadURL(localServerUrl));
    } else {
      mainWindow.loadURL(localServerUrl);
    }
  }
  return true;
});

// ─── Network Printer Helpers (TCP/IP Port 9100 RAW Socket) ─────────────────
function parseNetworkPrinter(str) {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  const match = trimmed.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d+))?$/);
  if (match) {
    return {
      host: match[1],
      port: parseInt(match[2] || '9100', 10)
    };
  }
  return null;
}

function testNetworkPrinter(host, port = 9100, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    socket.setTimeout(timeoutMs);

    socket.connect(port, host, () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ success: true, message: `Printer tarmoqda onlayn (${host}:${port})` });
      }
    });

    socket.on('error', (err) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ success: false, error: `Ulanib bo'lmadi: ${err.message}` });
      }
    });

    socket.on('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ success: false, error: `Ulanish vaqti tugadi (Timeout ${timeoutMs}ms)` });
      }
    });
  });
}

function printRawEscPos(host, port = 9100, buffer, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let settled = false;
    socket.setTimeout(timeoutMs);

    socket.connect(port, host, () => {
      socket.write(buffer, () => {
        socket.end();
        if (!settled) {
          settled = true;
          resolve({ success: true, printer: `${host}:${port}` });
        }
      });
    });

    socket.on('error', (err) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        reject(err);
      }
    });

    socket.on('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        reject(new Error(`Tarmoq printeri javob bermadi (${host}:${port})`));
      }
    });
  });
}

function buildEscPosFromText(text, stationName = '') {
  const ESC = '\x1b';
  const GS = '\x1d';
  const lines = (text || '').split('\n').map(l => l.trim()).filter(Boolean);
  const buffer = [];
  
  // Init
  buffer.push(Buffer.from(ESC + '@', 'ascii'));
  
  // Station Header
  buffer.push(Buffer.from(ESC + 'a\x01', 'ascii')); // center
  buffer.push(Buffer.from(GS + '!\x11', 'ascii')); // 2x size
  buffer.push(Buffer.from((stationName || 'OSHXONA').toUpperCase() + '\n', 'utf-8'));
  buffer.push(Buffer.from(GS + '!\x00', 'ascii')); // normal
  buffer.push(Buffer.from('--------------------------------\n', 'ascii'));
  
  // Body
  buffer.push(Buffer.from(ESC + 'a\x00', 'ascii')); // left
  for (const line of lines) {
    if (line.includes('ISFAYRAM') || line.toLowerCase() === stationName.toLowerCase()) continue;
    if (line.startsWith('Xona:') || line.startsWith('STOL:') || line.startsWith('Stol:')) {
      buffer.push(Buffer.from(GS + '!\x11', 'ascii')); // 2x size for Table
      buffer.push(Buffer.from(line + '\n', 'utf-8'));
      buffer.push(Buffer.from(GS + '!\x00', 'ascii')); // normal
    } else if (line.includes('|') && line.includes('ta')) {
      buffer.push(Buffer.from(GS + '!\x01', 'ascii')); // double height for items
      buffer.push(Buffer.from(line + '\n', 'utf-8'));
      buffer.push(Buffer.from(GS + '!\x00', 'ascii'));
    } else {
      buffer.push(Buffer.from(line + '\n', 'utf-8'));
    }
  }
  
  buffer.push(Buffer.from('--------------------------------\n', 'ascii'));
  buffer.push(Buffer.from(ESC + 'a\x01', 'ascii')); // center
  buffer.push(Buffer.from('ISFAYRAM KAFE\n\n\n\n', 'utf-8'));
  buffer.push(Buffer.from(GS + 'V\x41\x00', 'ascii')); // cut
  
  return Buffer.concat(buffer);
}

// IPC: Test printer connectivity and print test page
ipcMain.handle('test-printer', async (_, printerTarget) => {
  if (!printerTarget) return { success: false, error: "Printer ko'rsatilmadi" };
  const netInfo = parseNetworkPrinter(printerTarget);
  if (netInfo) {
    const pingRes = await testNetworkPrinter(netInfo.host, netInfo.port);
    if (!pingRes.success) return pingRes;
    
    try {
      const ESC = '\x1b';
      const GS = '\x1d';
      const testBuffer = Buffer.concat([
        Buffer.from(ESC + '@', 'ascii'),
        Buffer.from(ESC + 'a\x01', 'ascii'),
        Buffer.from(GS + '!\x11', 'ascii'),
        Buffer.from('ISFAYRAM POS\n', 'utf-8'),
        Buffer.from(GS + '!\x00', 'ascii'),
        Buffer.from('TEST CHEK\n', 'utf-8'),
        Buffer.from('--------------------------------\n', 'ascii'),
        Buffer.from(`IP: ${netInfo.host}:${netInfo.port}\n`, 'utf-8'),
        Buffer.from(`Vaqt: ${new Date().toLocaleString('uz-UZ')}\n`, 'utf-8'),
        Buffer.from('Printer aloqasi muvaffaqiyatli!\n', 'utf-8'),
        Buffer.from('--------------------------------\n\n\n\n', 'ascii'),
        Buffer.from(GS + 'V\x41\x00', 'ascii')
      ]);
      await printRawEscPos(netInfo.host, netInfo.port, testBuffer);
      return { success: true, message: `Tarmoq printeri test qilindi (${netInfo.host}:${netInfo.port})` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  } else {
    try {
      const printers = await mainWindow.webContents.getPrintersAsync();
      const clean = printerTarget.trim().toLowerCase();
      const found = printers.find(p => p.name.trim().toLowerCase() === clean || p.name.toLowerCase().includes(clean));
      if (!found && printerTarget !== 'default') {
        return { success: false, error: `Windows ro'yxatida "${printerTarget}" nomli printer topilmadi` };
      }
      return { success: true, message: `Windows printeri mavjud: "${found?.name || printerTarget}"` };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
});

// Resolve a saved printer name to an existing printer (fallback: default printer)
async function resolvePrinter(savedName) {
  try {
    const printers = await mainWindow.webContents.getPrintersAsync();
    if (!printers || printers.length === 0) return savedName || undefined;

    if (savedName) {
      const clean = savedName.trim().toLowerCase();
      // 1. Exact case-insensitive match
      const exact = printers.find(p => p.name.trim().toLowerCase() === clean);
      if (exact) return exact.name;

      // 2. Partial/contains match (e.g. 'ocpp-m09' matches 'OCPP-M09' or 'POS ocpp-m09')
      const partial = printers.find(p => p.name.toLowerCase().includes(clean) || clean.includes(p.name.toLowerCase()));
      if (partial) return partial.name;

      // 3. Smart station keyword matching (e.g. '🔥 Shashlik Room' -> 'Shashlik')
      const keywords = [];
      if (clean.includes('shashlik') || clean.includes('mangal') || clean.includes('kabob')) keywords.push('shashlik', 'mangal', 'kabob');
      if (clean.includes('fish') || clean.includes('baliq') || clean.includes('sazan')) keywords.push('fish', 'baliq', 'sazan');
      if (clean.includes('tandir') || clean.includes('somsa') || clean.includes('non')) keywords.push('tandir', 'somsa', 'non');
      if (clean.includes('bar') || clean.includes('ichimlik') || clean.includes('choy')) keywords.push('bar', 'ichimlik', 'choy');
      if (clean.includes('kassa') || clean.includes('kassir') || clean.includes('receipt') || clean.includes('hisob')) keywords.push('kassa', 'pos', 'receipt', 'check');

      if (keywords.length > 0) {
        const keywordMatch = printers.find(p => keywords.some(k => p.name.toLowerCase().includes(k)));
        if (keywordMatch) return keywordMatch.name;
      }
    }
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

  const is58mm = config['__paper_width__'] === '58mm';
  const paperWidthCss = is58mm ? '58mm' : '80mm';
  const winWidth = is58mm ? 220 : 302;
  const widthMicrons = is58mm ? 58000 : 80000;

  const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  @page { margin: 0; size: ${paperWidthCss} auto; }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #000;
    width: ${paperWidthCss};
    display: block;
    font-family: 'Consolas', 'Segoe UI Mono', 'Courier New', monospace;
  }
  * { color: #000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
  img { image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; }
  .print-thermal-receipt {
    box-sizing: border-box !important;
    font-family: 'Consolas', 'Segoe UI Mono', 'Courier New', monospace !important;
    font-weight: 700 !important;
  }
  .print-cashier-container {
    width: ${is58mm ? '48mm' : '70mm'} !important;
    max-width: ${is58mm ? '48mm' : '70mm'} !important;
    margin: 0 !important;
    margin-left: 0 !important;
    padding: 0 1.5mm 0 1.5mm !important;
    box-sizing: border-box !important;
  }
  .print-kitchen-container {
    width: ${is58mm ? '46mm' : '64mm'} !important;
    max-width: ${is58mm ? '46mm' : '64mm'} !important;
    margin: 0 !important;
    margin-left: 0 !important;
    padding: 0 4mm 0 1.5mm !important;
    box-sizing: border-box !important;
  }
</style></head><body>${body}</body></html>`;

  const tmpFile = path.join(app.getPath('temp'), `isfayram-receipt-${Date.now()}.html`);
  fs.writeFileSync(tmpFile, fullHtml, 'utf-8');

  const printWin = new BrowserWindow({
    width: winWidth,
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
        pageSize: { width: widthMicrons, height: heightMicrons },
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

// ── Silent print of main window (shift report, receipts, etc.) ──────────────────
ipcMain.handle('print-main-window-silent', async (_, opts = {}) => {
  const config = readConfig();
  let selectedPrinter = config['__receipt_printer__'];

  if (opts?.stationName) {
    const sName = String(opts.stationName).trim();
    // Match exact station name or stripped emoji name (e.g. '🔥 Shashlik Room' or 'Shashlik')
    const cleanSName = sName.replace(/^[^\w\s\u0400-\u04FF]+/u, '').trim();
    selectedPrinter = config[sName] || 
                      config[cleanSName] || 
                      Object.entries(config).find(([k]) => k.toLowerCase().includes(cleanSName.toLowerCase()))?.[1] || 
                      config['__receipt_printer__'];
  } else if (opts?.printerName) {
    selectedPrinter = opts.printerName;
  }

  // If this station is configured with a direct Network IP Printer (e.g. 192.168.1.150:9100)
  const netInfo = parseNetworkPrinter(selectedPrinter);
  if (netInfo) {
    console.log(`[ELECTRON PRINT] Printing directly to Network IP Printer: ${netInfo.host}:${netInfo.port}`);
    try {
      const receiptText = await mainWindow.webContents.executeJavaScript(`
        (function() {
          var el = document.querySelector('.print-thermal-receipt');
          return el ? (el.innerText || el.textContent || '') : '';
        })()
      `);
      const escPosBuf = buildEscPosFromText(receiptText, opts?.stationName);
      await printRawEscPos(netInfo.host, netInfo.port, escPosBuf);
      console.log(`[ELECTRON PRINT] Sent to network printer ${netInfo.host}:${netInfo.port} successfully.`);
      return { success: true, printer: `${netInfo.host}:${netInfo.port}` };
    } catch (netErr) {
      console.error(`[ELECTRON PRINT] Failed printing to network printer ${netInfo.host}:${netInfo.port}:`, netErr);
      return { success: false, error: netErr.message, printer: `${netInfo.host}:${netInfo.port}` };
    }
  }

  const targetPrinter = await resolvePrinter(selectedPrinter);
  const paperWidth = opts?.paperWidth || config['__paper_width__'] || '80mm';
  const widthMicrons = paperWidth === '58mm' ? 58000 : 80000;
  
  console.log(`[ELECTRON PRINT] Silent print requested. Station: "${opts?.stationName || 'N/A'}", Target printer: "${targetPrinter || 'Default'}", Width: ${paperWidth}`);

  return new Promise((resolve) => {
    const printOptions = {
      silent: true,
      printBackground: false,
      margins: { marginType: 'none' },
      pageSize: { width: widthMicrons, height: 297000 },
    };
    if (targetPrinter) printOptions.deviceName = targetPrinter;
    
    mainWindow.webContents.print(printOptions, (success, failureReason) => {
      console.log(`[ELECTRON PRINT] webContents.print finished. Success: ${success}, Reason: "${failureReason || 'OK'}"`);
      if (!success && targetPrinter) {
        console.warn(`[ELECTRON PRINT] Print to "${targetPrinter}" failed. Retrying on system default printer...`);
        const fallbackOptions = { ...printOptions };
        delete fallbackOptions.deviceName;
        mainWindow.webContents.print(fallbackOptions, (fallbackSuccess, fallbackReason) => {
          console.log(`[ELECTRON PRINT] Fallback default print finished. Success: ${fallbackSuccess}, Reason: "${fallbackReason || 'OK'}"`);
          resolve({ success: fallbackSuccess, error: fallbackSuccess ? null : fallbackReason, printer: 'default' });
        });
        return;
      }
      resolve({ success, error: success ? null : failureReason, printer: targetPrinter || 'default' });
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
