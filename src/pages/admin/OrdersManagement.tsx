import { useStore } from '../../store/useStore';
import { formatCurrency, formatDate } from '../../utils/format';
import { Filter, Download } from 'lucide-react';

export const OrdersManagement = () => {
  const { orders } = useStore();

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Barcha Buyurtmalar</h1>
          <p className="text-slate-500 text-sm mt-1">Tarixdagi barcha tranzaksiyalar va buyurtmalar ro'yxati</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 flex items-center gap-2 transition-colors shadow-sm shadow-slate-900/20">
            <Download className="w-4 h-4" />
            Eksport
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Buyurtma ID</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Sana</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Stol / Manba</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Holati</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice().reverse().map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">#{order.id.slice(1)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700 font-medium">Stol {order.tableId.replace('t', '')}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{order.waiterId ? `Xodim: ${order.waiterId}` : 'Mijoz (QR)'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      order.status === 'paid' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-500/20' :
                      order.status === 'cancelled' ? 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-500/20' :
                      'bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">{formatCurrency(order.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
             <div className="p-12 text-center text-slate-400">
               Hech qanday buyurtma topilmadi
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
