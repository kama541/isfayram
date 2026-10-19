import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

/**
 * Central auto-print service helpers.
 *
 * Flow: Waiter PC -> INSERT orders (Supabase) -> Realtime -> Printer station (Cashier PC)
 *       -> fetch fresh order + items from DB -> ONE receipt via existing ReceiptPrint pipeline.
 *
 * Idempotency is persisted in localStorage so the same order is never auto-printed twice,
 * even after refresh / EXE restart / Realtime reconnect. Manual reprints are NOT affected.
 */

const AUTO_PRINTED_KEY = 'autoPrintedOrders';      // { [orderId]: timestampMs }
const LOCAL_CREATED_KEY = 'locallyCreatedOrders';  // { [orderId]: timestampMs }
const ARMED_AT_KEY = 'autoPrintArmedAt';           // ISO timestamp when this device first became a printer station
export const STATION_MODE_KEY = 'printerStationMode'; // 'auto' | 'on' | 'off'

const RETENTION_MS = 3 * 24 * 60 * 60 * 1000;      // keep idempotency records for 3 days
export const CATCH_UP_WINDOW_MS = 30 * 60 * 1000;  // reconnect catch-up: only last 30 minutes
const NON_PRINTABLE_STATUSES = ['cancelled', 'paid'];

type StampMap = Record<string, number>;

const readMap = (key: string): StampMap => {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}') || {};
  } catch {
    return {};
  }
};

const writeMap = (key: string, map: StampMap) => {
  const now = Date.now();
  const pruned: StampMap = {};
  for (const [id, ts] of Object.entries(map)) {
    if (now - ts < RETENTION_MS) pruned[id] = ts;
  }
  localStorage.setItem(key, JSON.stringify(pruned));
};

export type StationMode = 'auto' | 'on' | 'off';

export const getStationMode = (): StationMode => {
  const v = localStorage.getItem(STATION_MODE_KEY);
  return v === 'on' || v === 'off' ? v : 'auto';
};

export const setStationMode = (mode: StationMode) => {
  localStorage.setItem(STATION_MODE_KEY, mode);
};

const PRINTED_ITEMS_KEY = 'autoPrintedOrderItems'; // { [itemId]: timestampMs }

export const isItemPrinted = (itemId: string): boolean => Boolean(readMap(PRINTED_ITEMS_KEY)[itemId]);

/**
 * Is THIS computer the central printer computer?
 * - 'on'  : always (configured in Settings)
 * - 'off' : never
 * - 'auto': Cashier or Admin workstation, or Electron Desktop POS. Waiter computers never print.
 */
export const isPrinterStation = (): boolean => {
  const mode = getStationMode();
  if (mode === 'on') return true;
  if (mode === 'off') return false;
  try {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const isAdmin = Boolean(localStorage.getItem('adminUser')) || user?.role === 'admin';
    const isCashier = user?.role === 'cashier';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isCashierOrAdminPath = pathname.startsWith('/cashier') || pathname.startsWith('/admin');

    // On waiter devices, if role is strictly 'waiter' and not an admin/cashier path, NEVER act as printer station
    if (user?.role === 'waiter' && !isAdmin && !isCashierOrAdminPath) {
      return false;
    }

    // If running in Desktop Electron POS and logged in as Cashier/Admin (or on cashier/admin routes), it is the primary printer station
    const isElectron = Boolean((window as any).electronApi?.isElectron);
    if (isElectron && (isCashier || isAdmin || isCashierOrAdminPath || !user)) {
      return true;
    }

    return Boolean(isCashier || isAdmin || isCashierOrAdminPath);
  } catch {
    return false;
  }
};

/** Called once the station becomes eligible; history before this moment is never auto-printed. */
export const getOrInitArmedAt = (): string => {
  let armed = localStorage.getItem(ARMED_AT_KEY);
  if (!armed) {
    armed = new Date().toISOString();
    localStorage.setItem(ARMED_AT_KEY, armed);
  }
  return armed;
};

export const markLocallyCreated = (orderId: string) => {
  const map = readMap(LOCAL_CREATED_KEY);
  map[orderId] = Date.now();
  writeMap(LOCAL_CREATED_KEY, map);
};

export const isLocallyCreated = (orderId: string) => Boolean(readMap(LOCAL_CREATED_KEY)[orderId]);

export const isAutoPrinted = (orderId: string) => Boolean(readMap(AUTO_PRINTED_KEY)[orderId]);

/**
 * Atomically claim an order for auto-printing on this device.
 * Returns false if it was already claimed (duplicate Realtime event, other tab, reconnect, etc.).
 */
export const claimAutoPrint = async (orderId: string): Promise<boolean> => {
  const doClaim = () => {
    if (isAutoPrinted(orderId)) return false;
    const map = readMap(AUTO_PRINTED_KEY);
    map[orderId] = Date.now();
    writeMap(AUTO_PRINTED_KEY, map);
    return true;
  };

  const locks = (navigator as any).locks;
  if (locks?.request) {
    // Cross-tab mutual exclusion (several cashier tabs on the same PC)
    return locks.request(`isfayram-autoprint-${orderId}`, () => doClaim());
  }
  return doClaim();
};

/**
 * Atomically claim unprinted items for an order.
 * Returns only the array of item IDs that have NOT yet been printed by any tab.
 */
export const claimUnprintedItems = async (orderId: string, itemIds: string[]): Promise<string[]> => {
  const doClaim = () => {
    const map = readMap(PRINTED_ITEMS_KEY);
    const unprinted = itemIds.filter(id => !map[id]);
    if (unprinted.length === 0) return [];
    const now = Date.now();
    for (const id of unprinted) {
      map[id] = now;
    }
    writeMap(PRINTED_ITEMS_KEY, map);
    return unprinted;
  };

  const locks = (navigator as any).locks;
  if (locks?.request) {
    return locks.request(`isfayram-autoprint-items-${orderId}`, () => doClaim());
  }
  return doClaim();
};

/** Build a printable Order object directly from the database (no dependency on local store timing). */
export const fetchOrderForPrint = async (orderId: string): Promise<any | null> => {
  let storeMenuItems = useStore.getState().menuItems;
  if (!storeMenuItems || storeMenuItems.length === 0) {
    const { data: dbMenuItems } = await supabase.from('menu_items').select('*');
    if (dbMenuItems && dbMenuItems.length > 0) {
      useStore.setState({
        menuItems: dbMenuItems.map((m: any) => ({
          id: m.id,
          name: m.name,
          categoryId: m.category_id,
          price: Number(m.price),
          kitchenStationId: m.kitchen_station_id,
          isAvailable: m.is_available,
        }))
      });
      storeMenuItems = useStore.getState().menuItems;
    }
  }

  const [{ data: o, error }, { data: items }] = await Promise.all([
    supabase.from('orders').select('*').eq('id', orderId).maybeSingle(),
    supabase.from('order_items').select('*').eq('order_id', orderId),
  ]);
  if (error || !o) return null;

  return {
    id: o.id,
    tableId: o.table_id || 'takeaway',
    waiterId: o.waiter_id,
    status: o.status,
    totalAmount: Number(o.total_amount),
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    notes: o.notes,
    items: (items || [])
      .filter((oi: any) => Number(oi.quantity) > 0)
      .map((oi: any) => {
        const currentMenuItems = useStore.getState().menuItems || [];
        const found = storeMenuItems?.find((m: any) => m.id === oi.menu_item_id) || currentMenuItems.find((m: any) => m.id === oi.menu_item_id);
        return {
          id: oi.id,
          menuItemId: oi.menu_item_id,
          name: found?.name || oi.special_instructions || 'Taom',
          quantity: Number(oi.quantity),
          price: Number(oi.unit_price) || found?.price || 0,
          notes: oi.special_instructions || '',
          kitchenStationId: oi.kitchen_station_id || found?.kitchenStationId,
          status: oi.status,
        };
      }),
  };
};

/**
 * Items are inserted right after the order row, so wait until they exist
 * (and the total matches) before printing, otherwise the receipt could miss items.
 */
export const waitForCompleteOrder = async (orderId: string, maxWaitMs = 8000): Promise<any | null> => {
  const started = Date.now();
  let last: any = null;
  let lastCount = -1;
  let stableRounds = 0;

  while (Date.now() - started < maxWaitMs) {
    last = await fetchOrderForPrint(orderId);
    if (!last) return null;
    if (NON_PRINTABLE_STATUSES.includes(last.status)) return last;

    const count = last.items.length;
    const sum = last.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    const totalsMatch = count > 0 && Math.abs(sum - last.totalAmount) < 1;

    if (count > 0 && count === lastCount) stableRounds++;
    else stableRounds = 0;
    lastCount = count;

    if (totalsMatch || stableRounds >= 2) return last;
    await new Promise(r => setTimeout(r, 600));
  }
  return last && last.items.length > 0 ? last : null;
};

export const isPrintableStatus = (status: string) => !NON_PRINTABLE_STATUSES.includes(status);

/** Orders that genuinely still need an auto-print (used after reconnect / restart). */
export const fetchCatchUpCandidates = async (): Promise<string[]> => {
  const armedAt = new Date(getOrInitArmedAt()).getTime();
  const since = new Date(Math.max(armedAt, Date.now() - CATCH_UP_WINDOW_MS)).toISOString();

  const { data, error } = await supabase
    .from('orders')
    .select('id,status,created_at')
    .gte('created_at', since)
    .not('status', 'in', `(${NON_PRINTABLE_STATUSES.join(',')})`)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data
    .map((o: any) => o.id)
    .filter((id: string) => !isAutoPrinted(id) && !isLocallyCreated(id));
};
