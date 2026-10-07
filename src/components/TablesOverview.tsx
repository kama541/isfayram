import { useStore } from '../store/useStore';
import { formatTableName, getDefaultTableSection } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import { TimeElapsed } from './TimeElapsed';
import { ReceiptPrint } from './ReceiptPrint';
import { useState, useRef } from 'react';
import { printReceiptElement } from '../utils/printReceipt';
import { supabase } from '../lib/supabase';

export const TablesOverview = () => {
  const { tables, orders, employees } = useStore();
  const navigate = useNavigate();
  const [printOrder, setPrintOrder] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const storedUser = localStorage.getItem('currentUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isCashierOrAdmin = window.location.pathname.startsWith('/cashier') || window.location.pathname.startsWith('/admin');
  const adminUser = localStorage.getItem('adminUser');
  const actingWaiterId = localStorage.getItem('adminActingAsWaiter');
  const activeWaiterId = (adminUser && actingWaiterId) ? actingWaiterId : currentUser?.id;

  // Section tabs
  const SECTIONS = ["Hammasi", "Ko'cha", "Zal", "Kabina"];
  const [activeSection, setActiveSection] = useState("Hammasi");
  const getSections = () => JSON.parse(localStorage.getItem('tableZones_v2') || '{}');
  const getSection = (tableId: string) => {
    const saved = getSections()[tableId];
    if (saved) return saved;
    const t = useStore.getState().tables.find(x => x.id === tableId);
    return t ? getDefaultTableSection(t.number) : 'Zal';
  };

  const handleSchet = (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    setPrintOrder(order);
    
    setTimeout(() => {
      const electronApi = (window as any).electronApi;
      
      // Only print locally if user is Cashier or Admin
      if (isCashierOrAdmin) {
        if (electronApi?.isElectron) {
          electronApi.printMainWindowSilent().finally(() => {
            setTimeout(() => setPrintOrder(null), 1000);
          });
        } else {
          window.print();
          setTimeout(() => setPrintOrder(null), 1000);
        }
      } else {
        // If running on a Waiter's phone/tablet browser
        const uniquePrintId = `print_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        console.log('[ORDER CREATED] Sending print request with ID:', uniquePrintId);
        
        supabase.channel('print_channel').send({
          type: 'broadcast',
          event: 'remote_print',
          payload: { 
            orderId: order.id,
            printId: uniquePrintId
          }
        }).then(() => {
          setTimeout(() => setPrintOrder(null), 1000);
        }).catch(err => {
          console.error("Broadcast error:", err);
          alert("Ulanish xatosi! Iltimos, kassirga og'zaki ayting.");
          setTimeout(() => setPrintOrder(null), 1000);
        });
      }
    }, 150);
  };

  const handleTableClick = (tableId: string) => {
    const activeOrder = orders.find(o => o.tableId === tableId && o.status !== 'paid' && o.status !== 'cancelled');
    if (activeOrder && !isCashierOrAdmin && activeOrder.waiterId !== activeWaiterId) {
      alert("Bu xonada boshqa ofitsiantning buyurtmasi bor!");
      return;
    }
    const rootRole = window.location.pathname.startsWith('/cashier') ? 'cashier' : 'waiter';
    navigate(`/${rootRole}/new-order?table=${tableId}`);
  };

  return (
    <>
    <div className="space-y-6">
      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
              activeSection === s
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 bg-slate-800 dark:bg-slate-900 w-max text-white rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm">
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#33CC80]"></div> Bo'sh</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#3399FF]"></div> Band</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#FF9933]"></div> Bron qilingan</span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {tables
          .filter(table => activeSection === 'Hammasi' || getSection(table.id) === activeSection)
          .sort((a, b) => {
            const isKabinaA = a.number.toLowerCase().includes('kabin') || getSection(a.id) === 'Kabina';
            const isKabinaB = b.number.toLowerCase().includes('kabin') || getSection(b.id) === 'Kabina';
            if (isKabinaA && !isKabinaB) return 1;
            if (!isKabinaA && isKabinaB) return -1;
            return a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' });
          })
          .map(table => {
          const activeOrder = orders.find(o => o.tableId === table.id && o.status !== 'paid' && o.status !== 'cancelled');
          const computedStatus = activeOrder ? 'occupied' : table.status;
          
          let waiterName = null;
          if (computedStatus === 'occupied' && activeOrder && activeOrder.waiterId) {
            const waiter = employees.find(e => e.id === activeOrder.waiterId);
            waiterName = waiter ? waiter.fullName : null;
          }

          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table.id)}
              className={`aspect-[4/3] rounded-2xl transition-all hover:scale-[1.03] hover:shadow-lg cursor-pointer flex flex-col items-center justify-center text-center p-3 shadow-md
                  ${computedStatus === 'occupied' 
                    ? 'bg-[#3399FF] text-white shadow-[#3399FF]/30' 
                    : computedStatus === 'available'
                      ? 'bg-[#33CC80] text-white shadow-[#33CC80]/30'
                      : 'bg-[#FF9933] text-white shadow-[#FF9933]/30'
                  }`}
            >
              <div className="text-xl lg:text-2xl font-black tracking-tight leading-none mb-1">{formatTableName(table.number)}</div>
              
              {computedStatus === 'occupied' ? (
                <>
                  <div className="flex gap-1 items-center mt-1 text-white/90">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                  {isCashierOrAdmin && <div className="text-[13px] font-bold mt-1 tracking-tight">{activeOrder?.totalAmount?.toLocaleString('uz-UZ')} sum</div>}
                  {waiterName && <div className="text-[10px] font-bold uppercase tracking-wider mt-1 text-white/90">{waiterName}</div>}
                  {activeOrder && <div className="text-[10px] font-medium opacity-80 mt-1"><TimeElapsed createdAt={activeOrder.createdAt} /></div>}
                  {!isCashierOrAdmin && activeOrder && (
                    <button
                      onClick={(e) => handleSchet(e, activeOrder)}
                      className="mt-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      Schet
                    </button>
                  )}
                </>
              ) : (
                <div className="text-sm font-medium opacity-90 mt-2">{table.seats}</div>
              )}
            </div>
          );
        })}
        
        {orders.filter(o => !o.tableId && o.status !== 'paid' && o.status !== 'cancelled').map(order => {
          const waiter = employees.find(e => e.id === order.waiterId);
          return (
            <div
              key={order.id}
              onClick={() => {
                if (!isCashierOrAdmin && order.waiterId !== activeWaiterId) {
                  alert("Bu buyurtmani boshqa ofitsiant olgan!");
                  return;
                }
                navigate(`/${window.location.pathname.startsWith('/cashier') ? 'cashier' : 'waiter'}/new-order?table=takeaway&order=${order.id}`)
              }}
              className="aspect-[4/3] rounded-2xl transition-all hover:scale-[1.03] hover:shadow-lg cursor-pointer flex flex-col items-center justify-center text-center p-3 shadow-md bg-amber-500 text-white shadow-amber-500/30"
            >
              <div className="text-lg lg:text-xl font-black tracking-tight leading-none mb-1">S-oboy</div>
              <div className="flex gap-1 items-center mt-1 text-white/90">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              {isCashierOrAdmin && <div className="text-[13px] font-bold mt-1 tracking-tight">{order.totalAmount?.toLocaleString('uz-UZ')} sum</div>}
              {waiter && <div className="text-[10px] font-bold uppercase tracking-wider mt-1 text-white/90">{waiter.fullName}</div>}
              <div className="text-[10px] font-medium opacity-80 mt-1"><TimeElapsed createdAt={order.createdAt} /></div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Hidden receipt for schet printing */}
    <ReceiptPrint ref={receiptRef} order={printOrder} />
  </>);
};

