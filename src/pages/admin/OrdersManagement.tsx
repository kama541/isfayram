import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatDate, formatOrderId, formatTableName } from '../../utils/format';
import { Filter, Search, Calendar, CheckCircle2, Clock, XCircle, Printer, Download } from 'lucide-react';
import { OrderDetailsModal } from '../../components/OrderDetailsModal';
import { triggerReceiptPrint } from '../../utils/printReceipt';

export const OrdersManagement = () => {
  const { orders, tables, employees } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paid' | 'cancelled'>('all');
  const [dateFilterType, setDateFilterType] = useState<'all' | 'today' | 'yesterday' | 'range'>('today');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [waiterFilter, setWaiterFilter] = useState<string>('all');

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const getTableNumber = (tableId: string | undefined | null) => {
    if (!tableId) return 'S-oboy (Olib ketish)';
    const table = tables.find(t => t.id === tableId);
    return table ? formatTableName(table.number) : `ID:${tableId.substring(0, 4)}...`;
  };

  const filteredOrders = useMemo(() => {
    return orders.slice().reverse().filter(o => {
      // 1. Status Filter
      if (statusFilter === 'paid' && o.status !== 'paid') return false;
      if (statusFilter === 'cancelled' && o.status !== 'cancelled') return false;
      if (statusFilter === 'active' && (o.status === 'paid' || o.status === 'cancelled')) return false;

      // 2. Date Filter
      const orderDate = (o.createdAt || '').slice(0, 10);
      if (dateFilterType === 'today' && orderDate !== todayStr) return false;
      if (dateFilterType === 'yesterday' && orderDate !== yesterdayStr) return false;
      if (dateFilterType === 'range') {
        if (dateFrom && orderDate < dateFrom) return false;
        if (dateTo && orderDate > dateTo) return false;
      }

      // 3. Table Filter
      if (tableFilter !== 'all' && o.tableId !== tableFilter) return false;

      // 4. Waiter Filter
      if (waiterFilter !== 'all' && o.waiterId !== waiterFilter) return false;

      // 5. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const orderIdStr = formatOrderId(o.id).toLowerCase();
        const tableName = getTableNumber(o.tableId).toLowerCase();
        const waiter = employees.find(e => e.id === o.waiterId)?.fullName.toLowerCase() || '';
        if (!orderIdStr.includes(query) && !tableName.includes(query) && !waiter.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, dateFilterType, dateFrom, dateTo, tableFilter, waiterFilter, searchQuery, todayStr, yesterdayStr, tables, employees]);

  const handleExport = () => {
    let csv = "Buyurtma ID,Sana,Xona/Manba,Ofitsiant,Holati,To'lov turi,Summa\n";
    filteredOrders.forEach(o => {
      const t = getTableNumber(o.tableId);
      const w = o.waiterId ? employees.find(e => e.id === o.waiterId)?.fullName || 'Xodim' : 'Mijoz';
      csv += `#${formatOrderId(o.id)},${formatDate(o.createdAt)},"${t}","${w}",${o.status},${o.paymentMethod || '-'},${o.totalAmount}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyurtmalar_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const totalFilteredAmount = useMemo(() => {
    return filteredOrders.filter(o => o.status === 'paid').reduce((s, o) => s + (o.totalAmount || 0), 0);
  }, [filteredOrders]);

  return (
    <div className="p-6 lg:p-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Buyurtmalar
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl px-4 py-2 text-right">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">To'langan jami</span>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(totalFilteredAmount)}</span>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" /> Eksport CSV
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        {/* Top row: Quick Date Tabs & Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
            <button
              onClick={() => setDateFilterType('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilterType === 'today' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bugun
            </button>
            <button
              onClick={() => setDateFilterType('yesterday')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilterType === 'yesterday' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Kecha
            </button>
            <button
              onClick={() => setDateFilterType('range')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilterType === 'range' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sana oralig'i
            </button>
            <button
              onClick={() => setDateFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilterType === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Barchasi
            </button>
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Hammasi
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'active' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Faol
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              To'langan
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'cancelled' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bekor qilingan
            </button>
          </div>
        </div>

        {/* Date range pickers (if range selected) */}
        {dateFilterType === 'range' && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold">Dan:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold">Gacha:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>
        )}

        {/* Search, Table, and Waiter dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Qidiruv: #ID, Xona, Ofitsiant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Barcha xonalar & kabinalar</option>
            {tables.map(t => (
              <option key={t.id} value={t.id}>{formatTableName(t.number)}</option>
            ))}
          </select>

          <select
            value={waiterFilter}
            onChange={(e) => setWaiterFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Barcha ofitsiantlar</option>
            {employees.filter(e => e.role === 'waiter').map(w => (
              <option key={w.id} value={w.id}>{w.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Buyurtma №</th>
                <th className="px-6 py-4">Sana & Vaqt</th>
                <th className="px-6 py-4">Xona / Manba</th>
                <th className="px-6 py-4">Ofitsiant</th>
                <th className="px-6 py-4">Holati</th>
                <th className="px-6 py-4 text-right">Summa</th>
                <th className="px-6 py-4 text-center">Chek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredOrders.map(order => {
                const waiter = employees.find(e => e.id === order.waiterId);
                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-200">
                      #{formatOrderId(order.id)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                      {getTableNumber(order.tableId)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs font-medium">
                      {waiter ? waiter.fullName : 'Mijoz / Kassir'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        order.status === 'paid'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : order.status === 'cancelled'
                            ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      }`}>
                        {order.status === 'paid' ? "To'langan" : order.status === 'cancelled' ? 'Bekor' : 'Faol'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => triggerReceiptPrint(order)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors"
                        title="Chek chiqarish"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="p-16 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
              Hech qanday buyurtma topilmadi
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPrint={() => triggerReceiptPrint(selectedOrder)}
        />
      )}
    </div>
  );
};
