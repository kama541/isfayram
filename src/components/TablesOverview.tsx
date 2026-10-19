import { useStore } from '../store/useStore';
import { formatTableName, getDefaultTableSection, formatOrderId } from '../utils/format';
import { useNavigate } from 'react-router-dom';
import { TimeElapsed } from './TimeElapsed';
import { useState } from 'react';
import { triggerReceiptPrint } from '../utils/printReceipt';

export const TablesOverview = () => {
  const { tables, orders, employees } = useStore();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('currentUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isCashierOrAdmin = window.location.pathname.startsWith('/cashier') || window.location.pathname.startsWith('/admin');
  const adminUser = localStorage.getItem('adminUser');
  const actingWaiterId = localStorage.getItem('adminActingAsWaiter');
  const activeWaiterId = (adminUser && actingWaiterId) ? actingWaiterId : currentUser?.id;

  // Section tabs: Stollar (1-15 ta stol), Kabinalar (9 ta kabina), Hammasi
  const SECTIONS = ["Stollar", "Kabinalar", "Hammasi"];
  const [activeSection, setActiveSection] = useState("Stollar");
  const getSections = () => JSON.parse(localStorage.getItem('tableZones_v2') || '{}');
  const getSection = (tableId: string) => {
    const saved = getSections()[tableId];
    if (saved) return saved;
    const t = useStore.getState().tables.find(x => x.id === tableId);
    return t ? getDefaultTableSection(t.number) : 'Zal';
  };

  const isKabina = (t: any) => t.number.toLowerCase().includes('kabin') || getSection(t.id) === 'Kabina';

  const extractNum = (str: string) => {
    const m = String(str).match(/\d+/);
    return m ? parseInt(m[0], 10) : 999;
  };

  const handleSchet = (e: React.MouseEvent, order: any) => {
    e.stopPropagation();
    triggerReceiptPrint(order);
  };

  const handleTableClick = (tableId: string) => {
    const activeOrder = orders.find(o => o.tableId === tableId && o.status !== 'paid' && o.status !== 'cancelled');
    if (activeOrder && !isCashierOrAdmin && activeOrder.waiterId !== activeWaiterId) {
      const orderOwner = employees.find(e => e.id === activeOrder.waiterId);
      const ownerName = orderOwner ? orderOwner.fullName : 'boshqa ofitsiant';
      alert(`Ushbu stolda ${ownerName}ning buyurtmasi bor! Faqat o'sha ofitsiant o'zgartira oladi.`);
      return;
    }
    const rootRole = window.location.pathname.startsWith('/cashier') ? 'cashier' : 'waiter';
    navigate(`/${rootRole}/new-order?table=${tableId}`);
  };

  const tablesOnly = tables.filter(t => !isKabina(t));
  const kabinasOnly = tables.filter(t => isKabina(t));

  return (
    <>
    <div className="space-y-6">
      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {SECTIONS.map(s => {
            const count = s === 'Stollar' 
              ? tablesOnly.length 
              : s === 'Kabinalar' 
                ? kabinasOnly.length 
                : tables.length;
            const isActive = activeSection === s;
            return (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{s}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10'
                }`}>
                  {count} ta
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 bg-slate-800 dark:bg-slate-900 w-max text-white rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm">
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#10b981]"></div> Bo'sh</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#2563eb]"></div> Band</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#f59e0b]"></div> Bron qilingan</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
        {tables
          .filter(table => {
            if (activeSection === 'Stollar') return !isKabina(table);
            if (activeSection === 'Kabinalar') return isKabina(table);
            return true;
          })
          .sort((a, b) => {
            const kabA = isKabina(a);
            const kabB = isKabina(b);
            if (kabA && !kabB) return 1;
            if (!kabA && kabB) return -1;
            return extractNum(a.number) - extractNum(b.number);
          })
          .map(table => {
          const activeOrder = orders.find(o => o.tableId === table.id && o.status !== 'paid' && o.status !== 'cancelled');
          const isOccupied = Boolean(activeOrder) || table.status === 'occupied';
          const isReserved = !isOccupied && table.status === 'reserved';
          
          let waiterName = null;
          if (isOccupied && activeOrder && activeOrder.waiterId) {
            const waiter = employees.find(e => e.id === activeOrder.waiterId);
            waiterName = waiter ? waiter.fullName : null;
          }

          const parseTableDisplay = (tableName: string) => {
            const str = String(tableName || '');
            const numMatch = str.match(/\d+/);
            const num = numMatch ? numMatch[0] : str;
            const isKabin = str.toLowerCase().includes('kabin');
            const label = isKabin ? 'Kabina' : 'Stol';
            return { num, label };
          };

          const { num, label } = parseTableDisplay(table.number);

          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table.id)}
              className={`min-h-[160px] sm:min-h-[175px] rounded-3xl transition-all hover:scale-[1.02] hover:shadow-2xl cursor-pointer flex flex-col items-center justify-between text-center p-3.5 sm:p-4 shadow-lg select-none overflow-hidden
                  ${isOccupied 
                    ? 'bg-[#2563eb] text-white shadow-blue-500/40 ring-2 ring-blue-300/40' 
                    : isReserved
                      ? 'bg-[#f59e0b] text-white shadow-amber-500/40 ring-2 ring-amber-300/40'
                      : 'bg-[#10b981] text-white shadow-emerald-500/40 ring-2 ring-emerald-300/40'
                  }`}
            >
              {/* Top row: Label badge and status */}
              <div className="w-full flex items-center justify-between gap-1">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/25 text-white/95 truncate">
                  {label}
                </span>
                <span className="text-[11px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-full bg-black/30 tracking-wider shrink-0 shadow-inner">
                  {isOccupied ? 'Band' : isReserved ? 'Bron' : "Bo'sh"}
                </span>
              </div>
              
              {isOccupied && activeOrder ? (
                <div className="w-full flex flex-col items-center my-1 space-y-1">
                  <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white drop-shadow-sm">
                    № {num}
                  </div>
                  {isCashierOrAdmin && (
                    <div className="text-sm sm:text-base font-black tracking-tight bg-black/35 px-2.5 py-1 rounded-xl w-full text-center text-amber-200 truncate">
                      {activeOrder?.totalAmount?.toLocaleString('uz-UZ')} so'm
                    </div>
                  )}
                  {waiterName && (
                    <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-white drop-shadow-sm truncate max-w-full">
                      👤 {waiterName}
                    </div>
                  )}
                  <div className="text-[11px] sm:text-xs font-bold opacity-90">
                    ⏱️ <TimeElapsed createdAt={activeOrder.createdAt} />
                  </div>
                  {!isCashierOrAdmin && (
                    <button
                      onClick={(e) => handleSchet(e, activeOrder)}
                      className="mt-1 w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white text-blue-900 hover:bg-slate-100 shadow-md active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      📄 Schet chiqarish
                    </button>
                  )}
                </div>
              ) : (
                <div className="my-auto py-2 flex flex-col items-center justify-center">
                  <div className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-white drop-shadow-md">
                    {num}
                  </div>
                  <div className="text-xs sm:text-sm font-black uppercase tracking-widest mt-1 text-white/90">
                    {label}
                  </div>
                  <div className="text-xs sm:text-sm font-bold opacity-95 mt-2 flex items-center justify-center gap-1">
                    <span>🪑</span>
                    <span>{table.seats ? `${table.seats} o'rinli` : "4 o'rinli"}</span>
                  </div>
                </div>
              )}

              <div className="w-full text-xs font-bold opacity-80 border-t border-white/20 pt-1">
                {getSection(table.id)}
              </div>
            </div>
          );
        })}
        
        {/* Takeaway / S-oboy Orders */}
        {orders.filter(o => (!o.tableId || o.tableId === 'takeaway') && o.status !== 'paid' && o.status !== 'cancelled').map(order => {
          const creator = employees.find(e => e.id === order.waiterId);
          const creatorName = creator ? creator.fullName : "Noma'lum";
          return (
            <div
              key={order.id}
              onClick={() => {
                if (!isCashierOrAdmin && order.waiterId && order.waiterId !== activeWaiterId) {
                  alert(`Ushbu S-oboy buyurtmasini ${creatorName} olgan!`);
                  return;
                }
                navigate(`/${window.location.pathname.startsWith('/cashier') ? 'cashier' : 'waiter'}/new-order?table=takeaway&order=${order.id}`)
              }}
              className="min-h-[145px] sm:min-h-[160px] rounded-2xl transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer flex flex-col items-center justify-between text-center p-3.5 shadow-md bg-amber-600 text-white shadow-amber-600/30 select-none"
            >
              <div className="w-full flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-black tracking-tight whitespace-nowrap">S-oboy</span>
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-black/25">Olib ketish</span>
              </div>
              <div className="w-full my-1">
                <div className="text-base sm:text-lg font-black tracking-tight bg-black/30 px-3 py-1 rounded-xl w-full text-center text-amber-200">
                  {order.totalAmount?.toLocaleString('uz-UZ')} so'm
                </div>
                <div className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1 text-white truncate max-w-full">
                  👤 {creatorName}
                </div>
                <div className="text-xs font-semibold opacity-90 mt-0.5">
                  ⏱️ <TimeElapsed createdAt={order.createdAt} />
                </div>
              </div>
              <div className="w-full text-[11px] font-semibold opacity-75 border-t border-white/20 pt-1">
                Buyurtma №{formatOrderId(order.id)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </>);
};

