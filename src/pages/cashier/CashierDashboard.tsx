import { CheckCircle, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatDate } from '../../utils/format';
import { TablesOverview } from '../../components/TablesOverview';
import { ReceiptPrint } from '../../components/ReceiptPrint';
import { NotebookModal } from '../../components/NotebookModal';
import { Printer, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
export const CashierDashboard = () => {
  const { orders, tables, updateOrderStatus } = useStore();
  const [printingOrder, setPrintingOrder] = useState<any>(null);
  const [showNotebook, setShowNotebook] = useState(false);

  const getTableNumber = (tableId: string) => {
    if (!tableId) return 'S-oboy (Olib ketish)';
    const table = tables.find(t => t.id === tableId);
    return table ? table.number : 'Noma\'lum';
  };

  const handlePrint = (order: any) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const pendingOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');
  const paidToday = orders.filter(o => o.status === 'paid' && new Date(o.updatedAt || o.createdAt).toDateString() === new Date().toDateString());
  const cancelledOrders = orders.filter(o => o.status === 'cancelled' && new Date(o.createdAt).toDateString() === new Date().toDateString());

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kassir Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">To'lovlarni qabul qilish va nazorat qilish</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowNotebook(true)}
            className="bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Daftarcha
          </button>
          <Link 
            to="/cashier/new-order?table=takeaway"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
          >
            + S-oboy (Olib ketish)
          </Link>
        </div>
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
                    <h3 className="font-bold text-lg text-slate-800">№{getTableNumber(order.tableId)}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="capitalize text-blue-600 font-medium">{order.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-sm font-medium text-emerald-600 mt-1 flex items-center justify-end gap-1">
                      Xizmat haqi (10%): {formatCurrency(order.totalAmount * 0.1)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="bg-amber-100 text-amber-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-200 transition-colors flex items-center gap-2"
                      >
                        Oshxonaga jo'natish
                      </button>
                    )}
                    <button 
                      onClick={() => handlePrint(order)}
                      className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Chek
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'paid', 'cash')}
                      className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 flex items-center gap-2"
                    >
                      Naqd
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'paid', 'card')}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 flex items-center gap-2"
                    >
                      Karta
                    </button>
                  </div>
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

          {/* Cancelled Orders Section */}
          {cancelledOrders.length > 0 && (
            <div className="mt-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Bekor qilingan buyurtmalar (Bugun)
              </h2>
              
              <div className="grid gap-4 opacity-75">
                {cancelledOrders.map(order => (
                  <div key={order.id} className="bg-red-50/30 p-6 rounded-2xl border border-red-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-400">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">№{getTableNumber(order.tableId)}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span>{formatDate(order.createdAt)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="capitalize text-red-600 font-medium">{order.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-800 line-through">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                     <h4 className="font-bold text-slate-800">№{order.tableId.replace('t', '') || 'S-oboy'}</h4>
                     <p className="text-xs text-slate-400 mt-0.5">
                       {new Date(order.updatedAt).toLocaleTimeString('uz-UZ')}
                       {order.paymentMethod && <span className="ml-2 font-semibold text-slate-500">• {order.paymentMethod === 'cash' ? 'Naqd' : 'Karta'}</span>}
                     </p>
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
      
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <TablesOverview />
      </div>

      <div className="print-container">
        <ReceiptPrint order={printingOrder} />
      </div>

      {showNotebook && <NotebookModal onClose={() => setShowNotebook(false)} />}
    </div>
  );
};
