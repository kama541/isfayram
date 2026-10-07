import { useEffect, useState, useRef } from 'react';
import { ReceiptPrint } from './ReceiptPrint';
import { printReceiptElement } from '../utils/printReceipt';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

/**
 * Global listener: when a waiter's phone/tablet requests a check
 * via Supabase broadcast (or Electron IPC), print it on the cashier printer 
 * regardless of which page the cashier currently has open.
 */
export const RemotePrintListener = () => {
  const [order, setOrder] = useState<any>(null);
  const processedPrintIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 1. Electron IPC Listener (Legacy/Offline fallback)
    const api = (window as any).electronApi;
    let removeIpcListener: any = null;
    if (api?.isElectron && api.onTriggerPrint) {
      removeIpcListener = api.onTriggerPrint((incoming: any) => {
        if (!incoming?.id) return;
        const printed = JSON.parse(localStorage.getItem('printedOrders') || '{}');
        const count = (printed[incoming.id] || 0) + 1;
        printed[incoming.id] = count;
        localStorage.setItem('printedOrders', JSON.stringify(printed));

        setOrder({ ...incoming, printCount: count });
        setTimeout(() => {
          printReceiptElement(incoming.id).finally(() => {
            setTimeout(() => setOrder(null), 1000);
          });
        }, 150);
      });
    }

    // 2. Supabase Broadcast Listener (Vercel production flow)
    const channel = supabase.channel('print_channel')
      .on('broadcast', { event: 'remote_print' }, (payload) => {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const adminUser = localStorage.getItem('adminUser');
        
        // Only print on Cashier or Admin computers
        if (user.role === 'cashier' || user.role === 'admin' || adminUser) {
          const { orderId, printId } = payload.payload || {};
          if (orderId && printId) {
            // Idempotency check to prevent duplicates
            if (processedPrintIds.current.has(printId)) {
              console.log('[PRINT LISTENER] Duplicate print request ignored:', printId);
              return;
            }
            processedPrintIds.current.add(printId);
            
            console.log('[ORDER RECEIVED BY CASHIER] Print request:', printId);
            const orderToPrint = useStore.getState().orders.find(o => o.id === orderId);
            if (orderToPrint) {
              setOrder(orderToPrint);
              console.log('[PRINT REQUEST STARTED] Rendering receipt for:', orderId);
              setTimeout(() => {
                console.log('[PRINT REQUEST SENT]');
                printReceiptElement(orderId).then(success => {
                  console.log(success ? '[PRINT SUCCESS]' : '[PRINT ERROR]');
                }).finally(() => {
                  setTimeout(() => setOrder(null), 1000);
                });
              }, 250); // wait for render
            } else {
              console.log('[PRINT ERROR] Order not found in store:', orderId);
            }
          }
        }
      })
      .subscribe();

    return () => {
      if (removeIpcListener) removeIpcListener();
      supabase.removeChannel(channel);
    };
  }, []);

  return <ReceiptPrint order={order} />;
};

