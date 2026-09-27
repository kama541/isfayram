import { useStore } from '../../store/useStore';
import { formatCurrency, formatDate, formatOrderId, formatTableName } from '../../utils/format';
import { Filter, Download } from 'lucide-react';
import { useState, useMemo } from 'react';
import { OrderDetailsModal } from '../../components/OrderDetailsModal';

export const OrdersManagement = () => {
  const { orders, tables, employees } = useStore();
  const [showFilter, setShowFilter] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const getTableNumber = (tableId: string | undefined | null) => {
    if (!tableId) return 'S-oboy (Olib ketish)';
    const table = tables.find(t => t.id === tableId);
    return table ? formatTableName(table.number) : `ID:${tableId.substring(0, 4)}...`;
  };

  const filteredOrders = useMemo(() => {
    return orders.slice().reverse().filter(o => {
      let match = true;
      if (filterDate && !o.createdAt.startsWith(filterDate)) match = false;
      if (filterStatus && o.status !== filterStatus) match = false;
      return match;
    });
  }, [orders, filterDate, filterStatus]);

  const handleExport = () => {
    let csv = "Buyurtma ID,Sana,Xona/Manba,Holati,Summa\n";
    filteredOrders.forEach(o => {
      const t = getTableNumber(o.tableId);
      const w = o.waiterId ? employees.find(e => e.id === o.waiterId)?.fullName || 'Xodim' : 'Mijoz';
      csv += `#${formatOrderId(o.id)},${formatDate(o.createdAt)},"${t} (${w})",${o.status},${o.totalAmount}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buyurtmalar_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center relative">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Barcha Buyurtmalar</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Tarixdagi barcha tranzaksiyalar va buyurtmalar ro'yxati</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button onClick={() => setShowFilter(!showFilter)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            {showFilter && (
              <div className="absolute top-12 right-0 bg-[#2a3143] border border-white/10 rounded-xl shadow-2xl p-4 w-64 z-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Sana bo'yicha</label>
                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-full bg-[#1e2330] text-white rounded-lg px-3 py-2 text-sm border border-white/10" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Holati bo'yicha</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full bg-[#1e2330] text-white rounded-lg px-3 py-2 text-sm border border-white/10">
                      <option value="">Barchasi</option>
                      <option value="paid">To'langan</option>
                      <option value="cancelled">Bekor qilingan</option>
                      <option value="new">Yangi</option>
                    </select>
                  </div>
                  <button onClick={() => { setFilterDate(''); setFilterStatus(''); }} className="w-full bg-white/5 hover:bg-white/10 text-white rounded-lg px-3 py-2 text-sm transition-colors">
                    Filterni tozalash
                  </button>
                </div>
              </div>
            )}
          </div>
          <button onClick={handleExport} className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-slate-800 dark:hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm shadow-slate-900/20">
            <Download className="w-4 h-4" />
            Eksport
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-400 dark:text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Buyurtma ID</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Sana</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Xona / Manba</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Holati</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredOrders.map(order => (
                <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">#{formatOrderId(order.id)}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700 dark:text-slate-200 font-medium">
                      {getTableNumber(order.tableId)}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{order.waiterId ? `Xodim: ${employees.find(e => e.id === order.waiterId)?.fullName || order.waiterId.substring(0, 4)}` : 'Mijoz (QR/Kassir)'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      order.status === 'paid' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20' :
                      order.status === 'cancelled' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-500/20' :
                      'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-200">{formatCurrency(order.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
             <div className="p-12 text-center text-slate-400 dark:text-slate-500">
               Hech qanday buyurtma topilmadi
             </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPrint={() => {}}
        />
      )}
    </div>
  );
};
