import { CheckCircle, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatDate } from '../../utils/format';

export const CashierDashboard = () => {
  const { orders, updateOrderStatus } = useStore();

  const pendingOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');
  const paidToday = orders.filter(o => o.status === 'paid' && new Date(o.createdAt).toDateString() === new Date().toDateString());

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kassir Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">To'lovlarni qabul qilish va nazorat qilish</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" /> To'lov kutayotgan buyurtmalar
          </h2>
          
          <div className="grid gap-4">
            {pendingOrders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Stol {order.tableId.replace('t', '')}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="capitalize text-blue-600 font-medium">{order.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                  <p className="text-2xl font-bold text-slate-800">{formatCurrency(order.totalAmount)}</p>
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'paid')}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 flex items-center gap-2"
                  >
                    To'lovni tasdiqlash
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {pendingOrders.length === 0 && (
              <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Barcha to'lovlar qabul qilingan</h3>
                <p className="text-slate-500 text-sm mt-1">Kutayotgan buyurtmalar yo'q</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" /> So'nggi to'lovlar
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {paidToday.slice(-8).reverse().map(order => (
                 <div key={order.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                   <div>
                     <h4 className="font-bold text-slate-800">Stol {order.tableId.replace('t', '')}</h4>
                     <p className="text-xs text-slate-400 mt-0.5">{new Date(order.updatedAt).toLocaleTimeString('uz-UZ')}</p>
                   </div>
                   <span className="font-bold text-emerald-600">{formatCurrency(order.totalAmount)}</span>
                 </div>
              ))}
              {paidToday.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Bugun qabul qilingan to'lovlar yo'q
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
