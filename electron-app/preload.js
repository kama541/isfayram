const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
  // Check if running in Electron
  isElectron: true,

  // Print the main window silently (for cashier receipt, schet, etc.)
  printMainWindowSilent: () => ipcRenderer.invoke('print-main-window-silent'),

  // Print cashier receipt HTML in a hidden window (reliable, independent of page layout)
  printReceiptHtml: (html) => ipcRenderer.invoke('print-receipt-html', html),

  // Print a specific station's receipt to a specific printer
  printToStation: (data) => ipcRenderer.invoke('print-to-station', data),

  // Get list of available printers on this computer
  getPrinters: () => ipcRenderer.invoke('get-printers'),

  // Save printer config { stationName: printerName }
  setPrinterConfig: (config) => ipcRenderer.invoke('set-printer-config', config),

  // Get saved printer config
  getPrinterConfig: () => ipcRenderer.invoke('get-printer-config'),

  // Get local IP address for remote connection
  getLocalIp: () => ipcRenderer.invoke('get-local-ip'),

  // Listen for remote print triggers
  onTriggerPrint: (callback) => {
    const listener = (_, order) => callback(order);
    ipcRenderer.on('trigger-print', listener);
    return () => ipcRenderer.removeListener('trigger-print', listener);
  }
});
