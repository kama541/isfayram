import { useEffect, useState, useRef } from 'react';
import { ReceiptPrint } from './ReceiptPrint';
import { printReceiptElement, getOrCreatePrintChannel, safeSubscribe } from '../utils/printReceipt';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { getKitchenStationForOrderItem } from '../utils/kitchenRouting';
import {
  isPrinterStation,
  getOrInitArmedAt,
  claimAutoPrint,
  claimUnprintedItems,
  isLocallyCreated,
  waitForCompleteOrder,
  fetchOrderForPrint,
  fetchCatchUpCandidates,
  isPrintableStatus,
} from '../utils/autoPrint';

/**
 * Global Singleton Receipt Printer:
 * Handles:
 * 1. Local user clicks via CustomEvent 'app:print-receipt' (Cashier/Admin) — manual print/reprint.
 * 2. Remote check requests via Supabase broadcast (Waiter phones/tablets) — manual remote print.
 * 3. Electron IPC 'onTriggerPrint' (Desktop POS mode).
 * 4. AUTO-PRINT: Supabase Realtime INSERT on `orders` & `order_items` -> printer station (Cashier PC) prints kitchen tickets.
 *
 * Guarantee: Exactly ONE <ReceiptPrint> in the entire DOM and a sequential print queue,
 * so two receipts never overlap and no duplicate print jobs are sent.
 */
export type PrintJob = {
  order: any;
  type: 'cashier' | 'kitchen';
  stationName?: string;
  items?: any[];
  isAddition?: boolean;
};

export const RemotePrintListener = () => {
  const [job, setJob] = useState<PrintJob | null>(null);
  const processedPrintIds = useRef<Set<string>>(new Set());
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const inFlightAuto = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Sequential print queue: each job renders the receipt, prints once, then clears.
    const enqueuePrint = (printJob: PrintJob, source: string) => {
      queueRef.current = queueRef.current.then(() => new Promise<void>((resolve) => {
        console.log(`[PRINT QUEUE] (${source}) printing job for order:`, printJob.order.id, printJob.type);
        setJob(printJob);
        setTimeout(() => {
          printReceiptElement(printJob.order.id, {
            stationName: printJob.stationName,
            type: printJob.type,
          })
            .then(ok => console.log(ok ? '[PRINT SUCCESS]' : '[PRINT ERROR]', printJob.order.id))
            .catch(err => console.error('[PRINT ERROR]', err))
            .finally(() => {
              setTimeout(() => {
                setJob(null);
                setTimeout(resolve, 150);
              }, 800);
            });
        }, 250);
      }));
    };

    const bumpPrintCount = (orderId: string) => {
      const printed = JSON.parse(localStorage.getItem('printedOrders') || '{}');
      const count = (printed[orderId] || 0) + 1;
      printed[orderId] = count;
      localStorage.setItem('printedOrders', JSON.stringify(printed));
      window.dispatchEvent(new CustomEvent('app:order-printed', { detail: { orderId, count } }));
      return count;
    };

    // 1. Local Print Event Listener (manual "Print" buttons on Cashier/Admin) -> prints Cashier receipt
    const handleLocalPrint = (event: any) => {
      const targetOrder = event.detail;
      if (!targetOrder?.id) return;
      const count = bumpPrintCount(targetOrder.id);
      console.log('[PRINT] Local print triggered for order:', targetOrder.id);
      enqueuePrint({ order: { ...targetOrder, printCount: count }, type: 'cashier' }, 'manual');
    };
    window.addEventListener('app:print-receipt', handleLocalPrint);

    // 1b. Test Print for Kassa + ALL Kitchen Stations (Sexlar)
    const handleTestAllStations = (event: any) => {
      const testOrder = event.detail;
      if (!testOrder) return;
      console.log('[PRINT LISTENER] Testing all stations and cashier receipt:', testOrder);

      // 1. Enqueue Cashier check
      enqueuePrint({ order: testOrder, type: 'cashier' }, 'test-cashier');

      // 2. Enqueue Kitchen tickets for each station (Sexlar)
      const stations = [
        {
          name: '🔥 Shashlik Room',
          items: [
            { name: "Shashlik (Qo'y go'shti)", quantity: 2, price: 25000, notes: 'Piyoz bilan' }
          ]
        },
        {
          name: '🐟 Fish Room',
          items: [
            { name: 'Fish (Sazan)', quantity: 1, price: 70000, notes: 'Limon va sous bilan' }
          ]
        },
        {
          name: '🫓 Tandir',
          items: [
            { name: 'Tandir somsa', quantity: 4, price: 8000, notes: 'Issiq' }
          ]
        },
        {
          name: '🥤 Bar',
          items: [
            { name: 'Choy (Ko\'k)', quantity: 1, price: 5000 },
            { name: 'Coca-Cola 1L', quantity: 1, price: 15000 }
          ]
        }
      ];

      stations.forEach(st => {
        enqueuePrint({
          order: testOrder,
          type: 'kitchen',
          stationName: st.name,
          items: st.items,
          isAddition: false
        }, `test-station-${st.name}`);
      });
    };
    window.addEventListener('app:print-all-stations-test', handleTestAllStations);

    // 2. Electron IPC Listener (Legacy/Offline fallback)
    const api = (window as any).electronApi;
    let removeIpcListener: any = null;
    if (api?.isElectron && api.onTriggerPrint) {
      removeIpcListener = api.onTriggerPrint((incoming: any) => {
        if (!incoming?.id) return;
        const count = bumpPrintCount(incoming.id);
        enqueuePrint({ order: { ...incoming, printCount: count }, type: 'cashier' }, 'ipc');
      });
    }

    // 3. Supabase Broadcast Listener (handles remote "Schet" from waiter devices and instant order notification)
    const broadcastChannel = getOrCreatePrintChannel();
    broadcastChannel
      .on('broadcast', { event: 'remote_print' }, async (payload: any) => {
        if (!isPrinterStation()) return;
        const { orderId, printId } = payload?.payload || {};
        if (!orderId || !printId) return;
        if (processedPrintIds.current.has(printId)) {
          console.log('[PRINT LISTENER] Duplicate print request ignored:', printId);
          return;
        }
        processedPrintIds.current.add(printId);
        console.log('[PRINT LISTENER] Remote print requested from waiter for order:', orderId);

        const orderToPrint = useStore.getState().orders.find(o => o.id === orderId) || await fetchOrderForPrint(orderId);
        if (orderToPrint) {
          enqueuePrint({ order: { ...orderToPrint, printCount: bumpPrintCount(orderId) }, type: 'cashier' }, 'remote-manual');
        } else {
          console.warn('[PRINT LISTENER] Order not found for remote print:', orderId);
        }
      })
      .on('broadcast', { event: 'order_created' }, (payload: any) => {
        if (!isPrinterStation()) return;
        const { orderId } = payload?.payload || {};
        if (!orderId) return;
        console.log('[PRINT LISTENER] Broadcast order_created received:', orderId);
        processAutoPrint(orderId, 'broadcast');
      });

    safeSubscribe(broadcastChannel);

    // 4. AUTO-PRINT (Kitchen Tickets automatically when waiter or QR sends order)
    const processAutoPrint = async (orderId: string, source: string) => {
      if (!orderId || !isPrinterStation()) return;
      if (inFlightAuto.current.has(orderId)) return;
      inFlightAuto.current.add(orderId);
      try {
        const full = await waitForCompleteOrder(orderId);
        if (!full) return;

        // Status check
        if (!isPrintableStatus(full.status)) {
          console.log('[AUTO-PRINT] Skipped (status:', full.status, ')', orderId);
          return;
        }

        // Deduplication & item diffing: check which items need printing
        const allItemIds = full.items.map((i: any) => i.id);
        const unprintedIds = await claimUnprintedItems(orderId, allItemIds);
        if (unprintedIds.length === 0) {
          console.log('[AUTO-PRINT] All items already printed for order:', orderId);
          return;
        }

        const isFirstPrint = await claimAutoPrint(orderId);
        const isAddition = !isFirstPrint;
        const itemsToPrint = full.items.filter((i: any) => unprintedIds.includes(i.id));

        console.log(`[AUTO-PRINT] (${source}) Printing ${itemsToPrint.length} items (addition: ${isAddition}) for order:`, orderId);

        let state = useStore.getState();
        let activeStations = state.kitchenStations.filter(s => s.isActive);
        let menuItems = state.menuItems;

        // If store data isn't loaded yet in memory, fetch it
        if (menuItems.length === 0 || activeStations.length === 0) {
          await state.silentFetch();
          state = useStore.getState();
          activeStations = state.kitchenStations.filter(s => s.isActive);
          menuItems = state.menuItems;
        }

        const stationItems = new Map<string, { station: any, items: any[] }>();
        const unroutedItems: any[] = [];

        itemsToPrint.forEach((item: any) => {
          const station = getKitchenStationForOrderItem(item, menuItems, activeStations);
          if (station) {
            if (!stationItems.has(station.id)) stationItems.set(station.id, { station, items: [] });
            stationItems.get(station.id)!.items.push(item);
          } else {
            unroutedItems.push(item);
          }
        });

        // If there are unrouted items and some stations exist, route to default or general kitchen
        if (unroutedItems.length > 0 && stationItems.size > 0) {
          stationItems.set('general', {
            station: { id: 'general', name: 'Oshxona' },
            items: unroutedItems
          });
        }

        if (stationItems.size === 0) {
          console.log('[AUTO-PRINT] No kitchen items found, falling back to cashier receipt.');
          enqueuePrint({ order: { ...full, items: itemsToPrint, printCount: 1 }, type: 'cashier', isAddition }, `auto-fallback-${source}`);
        } else {
          stationItems.forEach(({ station, items }) => {
            enqueuePrint({ order: full, type: 'kitchen', stationName: station.name, items, isAddition }, `auto-${source}-${station.id}`);
          });
        }
      } catch (err) {
        console.error('[AUTO-PRINT] Error processing order', orderId, err);
      } finally {
        inFlightAuto.current.delete(orderId);
      }
    };

    const runCatchUp = async (reason: string) => {
      if (!isPrinterStation()) return;
      getOrInitArmedAt();
      const ids = await fetchCatchUpCandidates();
      for (const id of ids) {
        await processAutoPrint(id, `catchup:${reason}`);
      }
    };

    // 5. Supabase Realtime Database Listeners with unique channel topic
    const autoChannelName = `autoprint_orders_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const autoChannel = supabase.channel(autoChannelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload: any) => {
        const id = payload?.new?.id;
        if (!id || !isPrinterStation()) return;
        getOrInitArmedAt();
        processAutoPrint(id, 'realtime-orders');
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_items' }, (payload: any) => {
        const orderId = payload?.new?.order_id;
        if (!orderId || !isPrinterStation()) return;
        getOrInitArmedAt();
        processAutoPrint(orderId, 'realtime-order-items');
      });

    safeSubscribe(autoChannel, (status) => {
      if (status === 'SUBSCRIBED') runCatchUp('subscribed');
    });

    const fallbackTimer = setInterval(() => runCatchUp('fallback'), 20000);
    const onStorage = () => { if (isPrinterStation()) getOrInitArmedAt(); };
    window.addEventListener('storage', onStorage);
    if (isPrinterStation()) getOrInitArmedAt();

    return () => {
      window.removeEventListener('app:print-receipt', handleLocalPrint);
      window.removeEventListener('app:print-all-stations-test', handleTestAllStations);
      window.removeEventListener('storage', onStorage);
      if (removeIpcListener) removeIpcListener();
      clearInterval(fallbackTimer);
      try {
        supabase.removeChannel(autoChannel);
      } catch (err) {
        console.warn('[PRINT LISTENER] remove autoChannel error:', err);
      }
    };
  }, []);

  if (!job) return null;

  return <ReceiptPrint job={job} />;
};
