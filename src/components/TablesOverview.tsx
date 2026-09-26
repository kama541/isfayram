
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export const TablesOverview = () => {
  const { tables, orders, employees } = useStore();
  const navigate = useNavigate();

  const handleTableClick = (tableId: string) => {
    const rootRole = window.location.pathname.startsWith('/cashier') ? 'cashier' : 'waiter';
    navigate(`/${rootRole}/new-order?table=${tableId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-slate-800 dark:bg-slate-900 w-max text-white rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm">
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#33CC80]"></div> Bo'sh</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#3399FF]"></div> Band</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#FF9933]"></div> Bron qilingan</span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {tables.map(table => {
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
              <div className="text-2xl lg:text-3xl font-black tracking-tight leading-none mb-1">{table.number}</div>
              
              {computedStatus === 'occupied' ? (
                <>
                  <div className="flex gap-1 items-center mt-1 text-white/90">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                  <div className="text-[13px] font-bold mt-1 tracking-tight">{activeOrder?.totalAmount?.toLocaleString('uz-UZ')} sum</div>
                  {waiterName && <div className="text-[10px] font-bold uppercase tracking-wider mt-1 text-white/90">{waiterName}</div>}
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
              onClick={() => navigate(`/${window.location.pathname.startsWith('/cashier') ? 'cashier' : 'waiter'}/new-order?table=takeaway&order=${order.id}`)}
              className="aspect-[4/3] rounded-2xl transition-all hover:scale-[1.03] hover:shadow-lg cursor-pointer flex flex-col items-center justify-center text-center p-3 shadow-md bg-amber-500 text-white shadow-amber-500/30"
            >
              <div className="text-lg lg:text-xl font-black tracking-tight leading-none mb-1">S-oboy</div>
              <div className="flex gap-1 items-center mt-1 text-white/90">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              <div className="text-[13px] font-bold mt-1 tracking-tight">{order.totalAmount?.toLocaleString('uz-UZ')} sum</div>
              {waiter && <div className="text-[10px] font-bold uppercase tracking-wider mt-1 text-white/90">{waiter.fullName}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

