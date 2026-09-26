import { CheckCircle, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';
import { TablesOverview } from '../../components/TablesOverview';
import { ReceiptPrint } from '../../components/ReceiptPrint';
import { NotebookModal } from '../../components/NotebookModal';
import { Printer, BookOpen, Power, ListX, X, Check, Calculator } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
export const CashierDashboard = () => {
  const { orders, tables, updateOrderStatus, isSystemOpen, setSystemOpen, menuItems, updateMenuItemAvailability } = useStore();
  const [printingOrder, setPrintingOrder] = useState<any>(null);
  const [showNotebook, setShowNotebook] = useState(false);
  const [showStopList, setShowStopList] = useState(false);
  const [showShiftReport, setShowShiftReport] = useState(false);

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

  const cashTotal = paidToday.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.totalAmount, 0);
  const cardTotal = paidToday.filter(o => o.paymentMethod === 'card').reduce((sum, o) => sum + o.totalAmount, 0);
  const totalRevenue = cashTotal + cardTotal;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Kassir Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">To'lovlarni qabul qilish va nazorat qilish</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (window.confirm(isSystemOpen ? "Diqqat! Saytni yopsangiz, ofitsiantlar va kassirlar kira olmaydi (mijozlar menyuni ko'ra oladi). Tasdiqlaysizmi?" : "Saytni qayta ochishni tasdiqlaysizmi?")) {
                setSystemOpen(!isSystemOpen);
              }
            }}
            className={`px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 ${
              isSystemOpen 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50' 
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
            }`}
          >
            <Power className="w-5 h-5" />
            {isSystemOpen ? 'Tizimni yopish' : 'Tizimni ochish'}
          </button>
          
          <button 
            onClick={() => setShowNotebook(true)}
            className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Daftarcha
          </button>
          
          <button 
            onClick={() => setShowStopList(true)}
            className="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 px-5 py-2.5 rounded-xl font-bold hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors flex items-center gap-2"
          >
            <ListX className="w-5 h-5" />
            Stop-list
          </button>
          
          <button 
            onClick={() => setShowShiftReport(true)}
            className="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 px-5 py-2.5 rounded-xl font-bold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            Z-otchyot
          </button>

          <Link 
            to="/cashier/new-order?table=takeaway"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
          >
            + S-oboy (Olib ketish)
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {/* Ochiq buyurtmalar (Otkrytye) */}
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" /> Ochiqlar {pendingOrders.length}
          </h2>
          {pendingOrders.map(order => {
            const waiter = useStore.getState().employees.find(e => e.id === order.waiterId);
            return (
              <div key={order.id} className="bg-[#2979ff] hover:bg-[#226add] transition-colors text-white p-5 rounded-3xl shadow-md flex flex-col gap-3 group relative cursor-pointer" onClick={() => handlePrint(order)}>
                <div className="flex justify-between items-center text-sm font-semibold opacity-90 tracking-wide">
                  <span>№{order.id.slice(-4)} • {waiter ? waiter.fullName.toUpperCase() : 'KASSIR'}</span>
                </div>
                <div className="text-[26px] font-bold tracking-tight">
                  {order.totalAmount.toLocaleString('uz-UZ')} sum
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    {getTableNumber(order.tableId)}
                  </div>
                  <div className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div className="bg-white/10 w-max px-3 py-1.5 rounded-full text-xs font-semibold mt-1">
                  {order.items.reduce((sum, i) => sum + i.quantity, 0)} taom
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                  <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'paid', 'cash'); }} className="w-full bg-emerald-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors">Naqd to'lov</button>
                  <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'paid', 'card'); }} className="w-full bg-blue-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors">Karta orqali</button>
                  <div className="flex gap-2 w-full mt-2">
                    <button onClick={(e) => { e.stopPropagation(); handlePrint(order); }} className="flex-1 bg-white/20 text-white py-2 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors">Chek</button>
                    <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'cancelled'); }} className="flex-1 bg-red-500/20 text-red-200 py-2 rounded-xl text-sm font-bold hover:bg-red-500/40 transition-colors">Bekor</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bekor qilingan (Zakrytye) */}
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <X className="w-5 h-5 text-red-500" /> Yopilgan {cancelledOrders.length}
          </h2>
          {cancelledOrders.map(order => {
            const waiter = useStore.getState().employees.find(e => e.id === order.waiterId);
            return (
              <div key={order.id} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 p-5 rounded-3xl shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm font-semibold opacity-70 tracking-wide">
                  <span>№{order.id.slice(-4)} • {waiter ? waiter.fullName.toUpperCase() : 'KASSIR'}</span>
                </div>
                <div className="text-[26px] font-bold tracking-tight opacity-70 line-through">
                  {order.totalAmount.toLocaleString('uz-UZ')} sum
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-slate-300 dark:bg-slate-600 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    {getTableNumber(order.tableId)}
                  </div>
                  <div className="bg-slate-300 dark:bg-slate-600 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.updatedAt).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div className="bg-slate-300 dark:bg-slate-600 w-max px-3 py-1.5 rounded-full text-xs font-semibold mt-1">
                  {order.items.reduce((sum, i) => sum + i.quantity, 0)} taom
                </div>
              </div>
            );
          })}
        </div>

        {/* To'langan (Oplachennye) */}
        <div className="space-y-4 lg:col-span-1 xl:col-span-2">
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500" /> To'langan {paidToday.length}
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {paidToday.map(order => {
              const waiter = useStore.getState().employees.find(e => e.id === order.waiterId);
              return (
                <div key={order.id} className="bg-[#2e7d32] text-white p-5 rounded-3xl shadow-sm flex flex-col gap-3 group relative cursor-pointer" onClick={() => handlePrint(order)}>
                  <div className="flex justify-between items-center text-sm font-semibold opacity-90 tracking-wide">
                    <span>№{order.id.slice(-4)} • {waiter ? waiter.fullName.toUpperCase() : 'KASSIR'}</span>
                  </div>
                  <div className="text-[26px] font-bold tracking-tight">
                    {order.totalAmount.toLocaleString('uz-UZ')} sum
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-amber-200">
                      {getTableNumber(order.tableId)}
                    </div>
                    <div className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(order.updatedAt).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  <div className="bg-white/10 w-max px-3 py-1.5 rounded-full text-xs font-semibold mt-1 flex items-center justify-between">
                    <span>{order.items.reduce((sum, i) => sum + i.quantity, 0)} taom</span>
                    <span className="ml-4 opacity-70 capitalize">{order.paymentMethod === 'cash' ? 'Naqd' : 'Karta'}</span>
                  </div>

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-[#1b5e20]/90 backdrop-blur-sm rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                    <button onClick={(e) => { e.stopPropagation(); handlePrint(order); }} className="w-full bg-white/20 text-white py-3 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
                      <Printer className="w-5 h-5" /> Chek chiqarish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <TablesOverview />
      </div>

      <div className="print-container">
        <ReceiptPrint order={printingOrder} />
      </div>

      {showNotebook && <NotebookModal onClose={() => setShowNotebook(false)} />}
      
      {showStopList && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <ListX className="w-6 h-6 text-orange-500" />
                Stop-list & Go-list
              </h2>
              <button 
                onClick={() => setShowStopList(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-3">
                {menuItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">{item.name}</h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{formatCurrency(item.price)}</p>
                    </div>
                    <button
                      onClick={() => updateMenuItemAvailability(item.id, !item.isAvailable)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${
                        item.isAvailable 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {item.isAvailable ? (
                        <><Check className="w-4 h-4" /> Go (Bor)</>
                      ) : (
                        <><X className="w-4 h-4" /> Stop (Tugagan)</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showShiftReport && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Calculator className="w-6 h-6 text-purple-500" />
                Smena Hisoboti
              </h2>
              <button 
                onClick={() => setShowShiftReport(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Naqd pul orqali:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{formatCurrency(cashTotal)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Plastik karta orqali:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{formatCurrency(cardTotal)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-800 dark:text-slate-200 font-bold text-lg">Jami tushum:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 text-2xl">{formatCurrency(totalRevenue)}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full mt-8 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" /> Chop etish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
