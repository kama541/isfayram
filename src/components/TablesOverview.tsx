import { UtensilsCrossed, User } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export const TablesOverview = () => {
  const { tables, orders, employees } = useStore();
  const navigate = useNavigate();

  const getWaiterForTable = (tableId: string) => {
    // Find active order for this table
    const activeOrder = orders.find(o => o.tableId === tableId && o.status !== 'paid' && o.status !== 'cancelled');
    if (!activeOrder || !activeOrder.waiterId) return null;

    // Find waiter
    const waiter = employees.find(e => e.id === activeOrder.waiterId);
    return waiter ? waiter.fullName : null;
  };

  const handleTableClick = (tableId: string) => {
    const rootRole = window.location.pathname.startsWith('/cashier') ? 'cashier' : 'waiter';
    navigate(`/${rootRole}/new-order?table=${tableId}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <UtensilsCrossed className="w-5 h-5 text-blue-500" /> Stollar holati
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map(table => {
          const waiterName = table.status === 'occupied' ? getWaiterForTable(table.id) : null;

          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table.id)}
              className={`p-6 rounded-2xl border-2 transition-all hover:shadow-md cursor-pointer relative ${table.status === 'available' ? 'border-transparent bg-emerald-50 text-emerald-900' :
                  table.status === 'occupied' ? 'border-transparent bg-red-50 text-red-900' :
                    'border-transparent bg-amber-50 text-amber-900'
                }`}
            >
              <div className="absolute top-3 right-3">
                <div className={`w-2 h-2 rounded-full ${table.status === 'available' ? 'bg-emerald-500' :
                    table.status === 'occupied' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">Stol {table.number}</h3>
              <p className={`text-center text-xs font-semibold capitalize ${table.status === 'available' ? 'text-emerald-600' :
                  table.status === 'occupied' ? 'text-red-600' : 'text-amber-600'
                }`}>
                {table.status === 'available' ? 'Bo\'sh' : table.status === 'occupied' ? 'Band' : 'Band qilingan'}
              </p>

              {waiterName && (
                <div className="mt-3 pt-3 border-t border-red-100 flex items-center justify-center gap-1.5 text-xs text-red-700 font-medium">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate">{waiterName}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

