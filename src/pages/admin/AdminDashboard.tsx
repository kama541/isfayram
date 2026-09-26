import { Users, ClipboardList, DollarSign, TrendingUp, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '../../utils/format';
import { useStore } from '../../store/useStore';
import { TablesOverview } from '../../components/TablesOverview';
import { WaiterDetailsModal } from '../../components/WaiterDetailsModal';

export const AdminDashboard = () => {
  const { orders, employees, tables } = useStore();
  const [selectedWaiterId, setSelectedWaiterId] = useState<string | null>(null);

  const getTableNumber = (tableId: string | undefined | null) => {
    if (!tableId) return 'S-oboy';
    const table = tables.find(t => t.id === tableId);
    return table ? table.number : tableId.substring(0, 4) + '...';
  };

  const todayRevenue = orders
    .filter(o => o.status === 'paid' && new Date(o.updatedAt || o.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = orders
    .filter(o => o.status === 'paid' && new Date(o.updatedAt || o.createdAt).getMonth() === currentMonth && new Date(o.updatedAt || o.createdAt).getFullYear() === currentYear)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrdersCount = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled').length;
  
  const staffCount = employees.filter(e => e.isActive).length;
  


  const stats = [
    { title: 'Bugungi Tushum', value: formatCurrency(todayRevenue), icon: DollarSign, color: 'bg-blue-500', trend: 'Bugun' },
    { title: 'Oylik Tushum', value: formatCurrency(monthlyRevenue), icon: TrendingUp, color: 'bg-indigo-500', trend: 'Shu oy' },
    { title: 'Faol Buyurtmalar', value: activeOrdersCount.toString(), icon: ClipboardList, color: 'bg-purple-500', trend: 'Jarayonda' },
    { title: 'Xodimlar', value: staffCount.toString(), icon: Users, color: 'bg-orange-500', trend: 'Faol xodimlar' },
  ];

  // Calculate Waiter Performance
  const waiterStats = employees.filter(e => e.role === 'waiter').map(waiter => {
    const waiterOrders = orders.filter(o => o.waiterId === waiter.id && o.status === 'paid' && new Date(o.updatedAt || o.createdAt).getMonth() === currentMonth);
    const orderCount = waiterOrders.length;
    const totalSales = waiterOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { ...waiter, orderCount, totalSales, orders: waiterOrders };
  }).sort((a, b) => b.totalSales - a.totalSales);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Restoraningizning bugungi ko'rsatkichlari</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isPositive = stat.trend.startsWith('+');
          return (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10 dark:bg-opacity-20 text-opacity-100`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${isPositive ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  {isPositive && <TrendingUp className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{stat.value}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">So'nggi Buyurtmalar</h2>
          <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-400 dark:text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Buyurtma ID</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Stol</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Xodim</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Summa</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {orders.slice(-5).reverse().map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">#{order.id.slice(0, 6)}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{getTableNumber(order.tableId)}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {employees.find(e => e.id === order.waiterId)?.fullName || 'Noma\'lum'}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                    <div>{formatCurrency(order.totalAmount)}</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">+ {formatCurrency(order.totalAmount * 0.1)} xizmat</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      order.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20' :
                      order.status === 'cancelled' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-500/20' :
                      'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20'
                    }`}>
                      {order.status}
                      {order.paymentMethod === 'cash' ? ' (Naqd)' : order.paymentMethod === 'card' ? ' (Karta)' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400">{new Date(order.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
             <div className="p-8 text-center text-slate-400 dark:text-slate-500">
               Hali buyurtmalar yo'q
             </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Ofitsiantlar Ko'rsatkichi (Shu oy)</h2>
            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {waiterStats.map((waiter, index) => (
                <div 
                  key={waiter.id} 
                  onClick={() => setSelectedWaiterId(waiter.id)}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{waiter.fullName}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{waiter.orderCount} ta buyurtma</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(waiter.totalSales)}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Savdo hajmi</div>
                  </div>
                </div>
              ))}
              {waiterStats.length === 0 && (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500">Ofitsiantlar topilmadi</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col">
          <TablesOverview />
        </div>
      </div>

      {selectedWaiterId && (
        <WaiterDetailsModal
          waiterId={selectedWaiterId}
          onClose={() => setSelectedWaiterId(null)}
          monthOrders={waiterStats.find(w => w.id === selectedWaiterId)?.orders || []}
        />
      )}
    </div>
  );
};
