import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { isPrinterStation } from './autoPrint';

let isPrintingLock = false;
let activePrintChannel: any = null;

/**
 * Singleton broadcast channel for instant printer-station messaging.
 * Does NOT call .subscribe() automatically so callers can safely register handlers or subscribe safely.
 */
export const getOrCreatePrintChannel = () => {
  if (activePrintChannel && activePrintChannel.state !== 'closed' && activePrintChannel.state !== 'leaving') {
    return activePrintChannel;
  }

  // Check if supabase client already has this channel cached
  const existing = supabase.getChannels().find(
    (ch: any) => ch.topic === 'realtime:print_channel' || ch.topic === 'print_channel'
  );

  if (existing && existing.state !== 'closed' && existing.state !== 'leaving') {
    activePrintChannel = existing;
    return activePrintChannel;
  }

  activePrintChannel = supabase.channel('print_channel');
  return activePrintChannel;
};

/**
 * Safely subscribe to a Supabase channel without throwing "join can only be called a single time per channel instance"
 */
export const safeSubscribe = (channel: any, onStatus?: (status: string) => void) => {
  if (!channel) return;
  if (channel.state === 'joined') {
    if (onStatus) onStatus('SUBSCRIBED');
    return;
  }
  if (channel.state === 'joining') {
    return;
  }

  try {
    channel.subscribe((status: string) => {
      console.log('[PRINT CHANNEL STATUS]:', status);
      if (onStatus) onStatus(status);
    });
  } catch (err: any) {
    console.warn('[PRINT CHANNEL] subscribe ignored:', err?.message);
  }
};

export const ensureChannelSubscribed = async (channel: any, timeoutMs = 3000): Promise<boolean> => {
  if (!channel) return false;
  if (channel.state === 'joined') return true;

  safeSubscribe(channel);

  const start = Date.now();
  while (channel.state !== 'joined' && Date.now() - start < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 80));
  }

  return channel.state === 'joined';
};

/**
 * Waiter device signals the cashier printer station that an order was created / updated.
 */
export const notifyOrderCreated = async (orderId: string) => {
  if (!orderId) return;
  try {
    const ch = getOrCreatePrintChannel();
    await ensureChannelSubscribed(ch);
    await ch.send({
      type: 'broadcast',
      event: 'order_created',
      payload: {
        orderId,
        timestamp: Date.now()
      }
    });
    console.log('[PRINT] Broadcast order_created sent:', orderId);
  } catch (err) {
    console.warn('[PRINT] order_created broadcast failed, Supabase Realtime will catch it:', err);
  }
};

/**
 * Triggers printing of exactly ONE receipt with idempotency and debouncing.
 * - On Cashier/Admin printer station: dispatches local 'app:print-receipt' event.
 * - On Waiter mobile devices: sends remote broadcast via Supabase to Cashier printer.
 */
export const triggerReceiptPrint = async (order: any): Promise<boolean> => {
  if (!order || !order.id) return false;

  // Strict debounce: prevent multiple print triggers within 2.5s
  if (isPrintingLock) {
    console.warn('[PRINT] Print lock active, ignoring duplicate print request for order:', order.id);
    return false;
  }
  isPrintingLock = true;
  setTimeout(() => {
    isPrintingLock = false;
  }, 2500);

  // If this device is the printer station (Cashier PC / Electron POS):
  if (isPrinterStation()) {
    console.log('[PRINT] Triggering local print on printer station for order:', order.id);
    window.dispatchEvent(new CustomEvent('app:print-receipt', { detail: order }));
    return true;
  }

  // Otherwise, remote print from waiter phone/tablet to cashier printer
  const uniquePrintId = `print_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  console.log('[PRINT] Sending remote print request for order:', order.id, uniquePrintId);

  try {
    const ch = getOrCreatePrintChannel();
    await ensureChannelSubscribed(ch);

    const res = await ch.send({
      type: 'broadcast',
      event: 'remote_print',
      payload: {
        orderId: order.id,
        printId: uniquePrintId,
        timestamp: Date.now()
      }
    });

    console.log('[PRINT] Remote print broadcast sent successfully:', res);
    return true;
  } catch (err) {
    console.error('[PRINT] Remote print broadcast error:', err);
    return false;
  }
};

export const printReceiptElement = async (
  orderId: string,
  options?: { stationName?: string; type?: string; paperWidth?: string }
): Promise<boolean> => {
  const api = (window as any).electronApi;
  const paperWidth = options?.paperWidth || useStore.getState().receiptSettings?.paperWidth || '80mm';
  
  if (api?.printMainWindowSilent) {
    console.log('[PRINT] Calling Electron silent print for order:', orderId, 'station:', options?.stationName, 'paperWidth:', paperWidth);
    try {
      const res = await api.printMainWindowSilent({ 
        paperWidth, 
        stationName: options?.stationName, 
        type: options?.type 
      });
      const ok = Boolean(res?.success ?? res);
      console.log(ok ? '[PRINT] Electron print succeeded:' : '[PRINT] Electron print failed:', res);
      return ok;
    } catch (err) {
      console.error('[PRINT] Electron silent print exception:', err);
      return false;
    }
  }

  console.log('[PRINT] Calling browser window.print() for order:', orderId);
  try {
    window.print();
    return true;
  } catch (err) {
    console.error('[PRINT] window.print() exception:', err);
    return false;
  }
};
