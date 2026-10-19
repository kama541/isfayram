import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatDate, formatOrderId, formatTableName } from '../../utils/format';
import { Search, Calendar, Trash2, User, Clock, AlertTriangle, Eye, Printer, Filter } from 'lucide-react';
import { OrderDetailsModal } from '../../components/OrderDetailsModal';
import { triggerReceiptPrint } from '../../utils/printReceipt';

export const CancelledOrders = () => {
  const { orders, tables, employees } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilterType, setDateFilterType] = useState<'today' | 'yesterday' | 'week' | 'month' | 'range' | 'all'>('today');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [waiterFilter, setWaiterFilter] = useState<string>('all');

  const todayStr = new Date().toISOString().slice(0, 10);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Start of current week (Monday)
  const currentWeekStart = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  }, []);

  // Start of current month (1st)
  const currentMonthStart = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }, []);

  const getTableNumber = (tableId: string | undefined | null) => {
    if (!tableId) return 'S-oboy (Olib ketish)';
    const table = tables.find(t => t.id === tableId);
    return table ? formatTableName(table.number) : `ID:${tableId.substring(0, 4)}...`;
  };

  // ONLY show orders whose status is strictly 'cancelled'
  const cancelledOrders = useMemo(() => {
    return orders.filter(o => o.status === 'cancelled');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return cancelledOrders.filter(order => {
      // 1. Date filter
      // Use cancelledAt if available, otherwise order createdAt
      const dateToCheck = (order.cancelledAt || order.updatedAt || order.createdAt || '').slice(0, 10);

      if (dateFilterType === 'today') {
        if (dateToCheck !== todayStr) return false;
      } else if (dateFilterType === 'yesterday') {
        if (dateToCheck !== yesterdayStr) return false;
      } else if (dateFilterType === 'week') {
        if (dateToCheck < currentWeekStart || dateToCheck > todayStr) return false;
      } else if (dateFilterType === 'month') {
        if (dateToCheck < currentMonthStart || dateToCheck > todayStr) return false;
      } else if (dateFilterType === 'range') {
        if (dateToCheck < dateFrom || dateToCheck > dateTo) return false;
      }

      // 2. Table filter
      if (tableFilter !== 'all' && order.tableId !== tableFilter) return false;

      // 3. Waiter filter
      if (waiterFilter !== 'all' && order.waiterId !== waiterFilter) return false;

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const orderIdStr = formatOrderId(order.id).toLowerCase();
        const tableStr = getTableNumber(order.tableId).toLowerCase();
        const waiter = employees.find(e => e.id === order.waiterId);
        const waiterStr = (waiter?.fullName || '').toLowerCase();
        const reasonStr = (order.cancellationReason || '').toLowerCase();
        const byStr = (order.cancelledBy || '').toLowerCase();

        const matches = 
          orderIdStr.includes(q) ||
          tableStr.includes(q) ||
          waiterStr.includes(q) ||
          reasonStr.includes(q) ||
          byStr.includes(q);

        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.cancelledAt || a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.cancelledAt || b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    });
  }, [cancelledOrders, dateFilterType, dateFrom, dateTo, tableFilter, waiterFilter, searchQuery, todayStr, yesterdayStr, currentWeekStart, currentMonthStart, tables, employees]);

  // Summary Metrics
  const totalCancelledAmount = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [filteredOrders]);

  const todayCancelledCount = useMemo(() => {
    return cancelledOrders.filter(o => (o.cancelledAt || o.updatedAt || o.createdAt || '').slice(0, 10) === todayStr).length;
  }, [cancelledOrders, todayStr]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-2xl">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
                Bekor qilingan buyurtmalar
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Jami: {cancelledOrders.length} ta
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanlangan davrda otmen</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {filteredOrders.length} <span className="text-xs font-normal text-slate-400">ta</span>
            </h3>
          </div>
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center">
            <Trash2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bekor qilingan summa</p>
            <h3 className="text-xl font-black text-red-600 dark:text-red-400 mt-1">
              {formatCurrency(totalCancelledAmount)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">(Tushumga qo'shilmaydi)</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bugungi otmenlar</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {todayCancelledCount} <span className="text-xs font-normal text-slate-400">ta</span>
            </h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">O'rtacha bekor chek</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">
              {formatCurrency(filteredOrders.length ? Math.round(totalCancelledAmount / filteredOrders.length) : 0)}
            </h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
        {/* Date Filters & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Preset Date Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setDateFilterType('today')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                dateFilterType === 'today'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Bugun
            </button>
            <button
              onClick={() => setDateFilterType('yesterday')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                dateFilterType === 'yesterday'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kecha
            </button>
            <button
              onClick={() => setDateFilterType('week')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                dateFilterType === 'week'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Shu hafta
            </button>
            <button
              onClick={() => setDateFilterType('month')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                dateFilterType === 'month'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Shu oy
            </button>
            <button
              onClick={() => setDateFilterType('range')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                dateFilterType === 'range'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sana oralig'i
            </button>
            <button
              onClick={() => setDateFilterType('all')}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                dateFilterType === 'all'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Hammasi
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Raqam, stol, ofitsiant yoki sabab bo'yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-medium text-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Custom date range and secondary filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          {dateFilterType === 'range' && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-300 outline-none font-bold"
              />
              <span className="text-slate-400">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-300 outline-none font-bold"
              />
            </div>
          )}

          {/* Table filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 font-bold outline-none"
            >
              <option value="all">Barcha stollar</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>{formatTableName(t.number)}</option>
              ))}
            </select>
          </div>

          {/* Waiter filter */}
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={waiterFilter}
              onChange={(e) => setWaiterFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 font-bold outline-none"
            >
              <option value="all">Barcha ofitsiantlar</option>
              {employees.filter(e => e.role === 'waiter').map(w => (
                <option key={w.id} value={w.id}>{w.fullName}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-slate-400 font-medium">
            Topildi: <strong className="text-slate-800 dark:text-white">{filteredOrders.length}</strong> ta buyurtma
          </div>
        </div>
      </div>

      {/* Cancelled Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Bekor qilingan buyurtmalar topilmadi
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tanlangan vaqt oralig'ida yoki qidiruv bo'yicha hech qanday otmen bo'lgan buyurtma mavjud emas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map(order => {
            const waiter = employees.find(e => e.id === order.waiterId);
            const waiterName = waiter ? waiter.fullName : (order.waiterId || "Noma'lum");
            const cancelDate = order.cancelledAt || order.updatedAt || order.createdAt;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-800 rounded-3xl border border-red-200 dark:border-red-900/40 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 relative overflow-hidden"
              >
                {/* Top Badge Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />

                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                          №{formatOrderId(order.id)}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                          BEKOR QILINGAN
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {getTableNumber(order.tableId)}
                        </span>
                        <span>•</span>
                        <span>Ofitsiant: <strong>{waiterName}</strong></span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Cancellation Reason & Metadata Box */}
                  <div className="my-3 p-3 bg-red-50/70 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-2xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-red-500" />
                        {cancelDate ? formatDate(cancelDate) : '-'}
                      </span>
                      {order.cancelledBy && (
                        <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {order.cancelledBy}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-800 dark:text-slate-200">
                      <strong className="text-red-600 dark:text-red-400">Sabab: </strong>
                      <span className="italic">{order.cancellationReason || "Sabab ko'rsatilmadi"}</span>
                    </div>
                  </div>

                  {/* Items List Preview */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1.5">
                      Buyurtma taomlari ({order.items?.length || 0} xil):
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {order.items?.map((item: any, idx: number) => {
                        const menuItem = useStore.getState().menuItems.find(m => m.id === item.menuItemId);
                        const itemName = menuItem?.name || item.name || item.note || 'Taom';
                        return (
                          <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800 text-[11px]">
                            <span className="truncate pr-2 font-medium">{itemName}</span>
                            <span className="shrink-0 font-bold text-slate-500">
                              {item.quantity} x {formatCurrency(item.price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ko'rish
                  </button>
                  <button
                    onClick={() => triggerReceiptPrint(order)}
                    title="Otmen chekini chop etish"
                    className="py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-red-200 dark:border-red-900/40"
                  >
                    <Printer className="w-3.5 h-3.5" /> Chek
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Order Details Modal */}
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
