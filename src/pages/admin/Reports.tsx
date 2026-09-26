import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatDate } from '../../utils/format';
import { FileText, Printer, Calendar, DollarSign, ArrowDownRight, TrendingUp, Users } from 'lucide-react';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

type DateRange = 'today' | 'yesterday' | 'thisMonth' | 'all';

export const Reports = () => {
  const { orders, expenses, menuItems, employees, tables } = useStore();
  const [dateRange, setDateRange] = useState<DateRange>('today');

  const getDateInterval = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'all':
      default:
        return { start: new Date(2000, 0, 1), end: new Date(2100, 0, 1) };
    }
  };

  const interval = getDateInterval();

  const filteredOrders = orders.filter(o => {
    const date = new Date(o.createdAt);
    return isWithinInterval(date, interval);
  });

  const filteredExpenses = expenses.filter(e => {
    const date = new Date(e.paymentDate);
    return isWithinInterval(date, interval);
  });

  // Calculate totals
  const totalRevenue = filteredOrders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalServiceFee = totalRevenue * 0.1; // Assuming 10% service fee is included in totalAmount or added. If included, this is the portion.

  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const netProfit = totalRevenue - totalExpensesAmount;

  const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled');

  // Product sales calculation
  const productSales: Record<string, { quantity: number; revenue: number }> = {};
  filteredOrders.filter(o => o.status === 'paid').forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.menuItemId]) {
        productSales[item.menuItemId] = { quantity: 0, revenue: 0 };
      }
      productSales[item.menuItemId].quantity += item.quantity;
      productSales[item.menuItemId].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([menuItemId, data]) => ({
      name: menuItems.find(m => m.id === menuItemId)?.name || 'Noma\'lum',
      ...data
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Waiter performance calculation
  const waiterPerformance = employees
    .filter(e => e.role === 'waiter')
    .map(waiter => {
      const waiterOrders = filteredOrders.filter(o => o.waiterId === waiter.id && o.status === 'paid');
      const totalSales = waiterOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      
      // Get unique tables served
      const uniqueTables = Array.from(new Set(waiterOrders.map(o => o.tableId).filter(Boolean)));
      const tableNumbers = uniqueTables.map(tId => tables.find(t => t.id === tId)?.number || tId.replace('t', ''));

      return {
        id: waiter.id,
        name: waiter.fullName,
        orderCount: waiterOrders.length,
        totalSales,
        tablesServed: tableNumbers.join(', ')
      };
    })
    .filter(w => w.orderCount > 0)
    .sort((a, b) => b.totalSales - a.totalSales);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans space-y-8">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Hisobotlar (Achot)</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Moliya va savdo bo'yicha batafsil hisobot</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['today', 'yesterday', 'thisMonth', 'all'] as DateRange[]).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  dateRange === range 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {range === 'today' ? 'Bugun' : 
                 range === 'yesterday' ? 'Kecha' : 
                 range === 'thisMonth' ? 'Shu oy' : 'Barchasi'}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handlePrint}
            className="bg-slate-900 dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Chop etish
          </button>
        </div>
      </div>

      {/* Printable Report Section */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 print:shadow-none print:border-none print:p-0">
        
        <div className="text-center mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white uppercase tracking-wider">Isfayram Kafesi Hisoboti</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" /> 
            {formatDate(interval.start.toISOString())} - {formatDate(interval.end.toISOString())}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
              <h3 className="font-bold">Umumiy Tushum</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{filteredOrders.filter(o => o.status === 'paid').length} ta to'langan buyurtma</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-2">
              <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg"><ArrowDownRight className="w-5 h-5" /></div>
              <h3 className="font-bold">Umumiy Xarajatlar</h3>
            </div>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalExpensesAmount)}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{filteredExpenses.length} ta xarajat yozuvi</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg"><DollarSign className="w-5 h-5" /></div>
              <h3 className="font-bold">Sof Foyda</h3>
            </div>
            <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(netProfit)}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Xizmat haqi qismi: {formatCurrency(totalServiceFee)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
              <FileText className="w-5 h-5 text-slate-400 dark:text-slate-500" /> Eng ko'p sotilgan taomlar
            </h3>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 uppercase text-xs">
                  <th className="py-3 font-medium">Taom nomi</th>
                  <th className="py-3 font-medium text-center">Miqdori</th>
                  <th className="py-3 font-medium text-right">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {topProducts.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                    <td className="py-3 font-medium text-slate-700 dark:text-slate-200">{p.name}</td>
                    <td className="py-3 text-center text-slate-600 dark:text-slate-300 font-bold">{p.quantity}</td>
                    <td className="py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-center text-slate-400 dark:text-slate-500">Ma'lumot topilmadi</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cancelled Orders summary */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
              <FileText className="w-5 h-5 text-red-400 dark:text-red-500" /> Otmen (Bekor qilingan) buyurtmalar
            </h3>
            <div className="bg-red-50/50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 mb-4">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Bu muddatda {cancelledOrders.length} ta buyurtma bekor qilingan.</p>
              <p className="text-xs text-red-500 dark:text-red-400/80 mt-1">Yo'qotilgan summa: {formatCurrency(cancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0))}</p>
            </div>
            
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 uppercase text-xs">
                  <th className="py-2 font-medium">ID</th>
                  <th className="py-2 font-medium">Vaqti</th>
                  <th className="py-2 font-medium text-right">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {cancelledOrders.slice(0, 5).map(o => (
                  <tr key={o.id}>
                    <td className="py-2 font-medium text-slate-700 dark:text-slate-300">#{o.id.slice(0,6)}</td>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{new Date(o.updatedAt).toLocaleTimeString('uz-UZ')}</td>
                    <td className="py-2 text-right text-slate-600 dark:text-slate-400 line-through">{formatCurrency(o.totalAmount)}</td>
                  </tr>
                ))}
                {cancelledOrders.length === 0 && (
                  <tr><td colSpan={3} className="py-4 text-center text-slate-400 dark:text-slate-500">Bekor qilingan buyurtmalar yo'q</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Waiter Performance Section */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
            <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Ofitsiantlar Savdosi va Stollar
          </h3>
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr className="text-slate-500 dark:text-slate-400 uppercase text-xs">
                  <th className="px-4 py-3 font-medium">Ofitsiant Ismi</th>
                  <th className="px-4 py-3 font-medium text-center">Buyurtmalar Soni</th>
                  <th className="px-4 py-3 font-medium">Xizmat ko'rsatgan stollari</th>
                  <th className="px-4 py-3 font-medium text-right">Jami Savdo Summasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {waiterPerformance.map(waiter => (
                  <tr key={waiter.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{waiter.name}</td>
                    <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{waiter.orderCount} ta</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {waiter.tablesServed ? `Stollar: ${waiter.tablesServed}` : 'Faqat S-oboy'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(waiter.totalSales)}
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5">Xizmat haqi: {formatCurrency(waiter.totalSales * 0.1)}</div>
                    </td>
                  </tr>
                ))}
                {waiterPerformance.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500">Bu muddatda ofitsiantlar tomonidan savdo qilinmagan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
