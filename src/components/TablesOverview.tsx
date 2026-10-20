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
      {/* Top Controls: Minimal Section Filter & Status Legend */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pb-1">
        {/* Section tabs */}
        <div className="flex gap-1.5 p-1 rounded-2xl bg-[#141B22] border border-white/10">
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
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{s}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Minimal Legend */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#141B22] border border-white/10 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Bo‘sh</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span>Band</span>
          </span>
        </div>
      </div>

      {/* 5-Column Responsive Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-3.5">
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

            const cleanTableNum = String(table.number || '').replace(/[^0-9]/g, '') || table.number;

            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table.id)}
                className={`h-[110px] sm:h-[120px] rounded-2xl transition-all duration-150 active:scale-95 hover:scale-[1.01] cursor-pointer flex flex-col justify-between p-3 select-none relative ${
                  isOccupied
                    ? 'bg-[#182029] border border-slate-700/60 shadow-sm hover:border-slate-500'
                    : 'bg-[#0B2117] border border-emerald-500/35 shadow-sm hover:border-emerald-400/60'
                }`}
              >
                {/* Top: Status Badge ONLY */}
                <div className="flex items-center justify-start w-full">
                  {isOccupied ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-tight bg-slate-700/40 text-slate-300 border border-slate-600/40">
                      Band
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-tight bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Bo‘sh
                    </span>
                  )}
                </div>

                {/* Center: Large Table Number ONLY */}
                <div className="flex-1 flex items-center justify-center -mt-2">
                  <span className={`text-3xl sm:text-4xl font-black tracking-tight ${
                    isOccupied ? 'text-slate-200' : 'text-white'
                  }`}>
                    {cleanTableNum}
                  </span>
                </div>
              </div>
            );
          })}
        
        {/* Takeaway / S-oboy Active Orders */}
        {orders.filter(o => (!o.tableId || o.tableId === 'takeaway') && o.status !== 'paid' && o.status !== 'cancelled').map(order => {
          return (
            <div
              key={order.id}
              onClick={() => {
                const rootRole = window.location.pathname.startsWith('/cashier') ? 'cashier' : 'waiter';
                navigate(`/${rootRole}/new-order?table=takeaway&order=${order.id}`);
              }}
              className="h-[110px] sm:h-[120px] rounded-2xl transition-all duration-150 active:scale-95 hover:scale-[1.01] cursor-pointer flex flex-col justify-between p-3 select-none bg-[#241B12] border border-amber-500/40 shadow-sm"
            >
              <div className="flex items-center justify-start w-full">
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-tight bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  S-oboy
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center -mt-2">
                <span className="text-xl sm:text-2xl font-black text-amber-200 tracking-tight">
                  №{formatOrderId(order.id)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </>);
};

