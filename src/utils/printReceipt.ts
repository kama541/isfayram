export const printReceiptElement = async (orderId: string): Promise<boolean> => {
  const api = (window as any).electronApi;
  
  if (api?.printMainWindowSilent) {
    await api.printMainWindowSilent();
    return true;
  }

  window.print();
  return true;
};
