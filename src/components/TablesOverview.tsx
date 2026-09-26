import { UtensilsCrossed } from 'lucide-react';
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
      <div className="flex gap-4 mb-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
          <UtensilsCrossed className="w-4 h-4" />
          Ochiq stollar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
              className={`p-4 rounded-xl transition-all hover:opacity-90 cursor-pointer relative flex flex-col gap-2 ${
                  computedStatus === 'occupied' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : computedStatus === 'available'
                      ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-dashed border-blue-200 dark:border-blue-500/30 shadow-sm'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
                }`}
            >
              <div className="flex justify-between items-center text-sm font-medium opacity-90">
                <span>{table.number} {waiterName ? `- ${waiterName}` : ''}</span>
              </div>
              
              <div className="text-xl font-bold">
                {computedStatus === 'occupied' ? 'Band' : computedStatus === 'available' ? 'Bo\'sh' : 'Band qilingan'}
              </div>
              
              <div className="flex items-center gap-4 text-xs font-medium opacity-80 mt-1">
                <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-md">
                   {computedStatus === 'occupied' ? 'Xizmatda' : 'Kutish'}
                </div>
              </div>
            </div>
          );
        })}
        
        {orders.filter(o => !o.tableId && o.status !== 'paid' && o.status !== 'cancelled').map(order => {
          const waiter = employees.find(e => e.id === order.waiterId);
          return (
            <div
              key={order.id}
              onClick={() => navigate(`/${window.location.pathname.startsWith('/cashier') ? 'cashier' : 'waiter'}/new-order?table=takeaway&order=${order.id}`)}
              className="p-4 rounded-xl transition-all hover:opacity-90 cursor-pointer relative flex flex-col gap-2 bg-blue-600 text-white shadow-md shadow-blue-600/20"
            >
              <div className="flex justify-between items-center text-sm font-medium opacity-90">
                <span>S-oboy {waiter ? `- ${waiter.fullName}` : ''}</span>
              </div>
              
              <div className="text-xl font-bold">
                Olib ketish
              </div>
              
              <div className="flex items-center gap-4 text-xs font-medium opacity-80 mt-1">
                <div className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md">
                   S-oboy
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

