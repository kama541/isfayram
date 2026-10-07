import { CheckCircle, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatOrderId, formatTableName, getDefaultTableSection } from '../../utils/format';
import { TablesOverview } from '../../components/TablesOverview';
import { ReceiptPrint } from '../../components/ReceiptPrint';
import { NotebookModal } from '../../components/NotebookModal';
import { TimeElapsed } from '../../components/TimeElapsed';
import { PaymentModal } from '../../components/PaymentModal';
import { OrderDetailsModal } from '../../components/OrderDetailsModal';
import { Printer, BookOpen, Power, ListX, X, Check, Calculator, Banknote } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { printReceiptElement } from '../../utils/printReceipt';
export const CashierDashboard = () => {
  const { orders, tables, updateOrderStatus, isSystemOpen, setSystemOpen, menuItems, updateMenuItemAvailability } = useStore();
  const [printingOrder, setPrintingOrder] = useState<any>(null);
  const [showNotebook, setShowNotebook] = useState(false);
  const [showStopList, setShowStopList] = useState(false);
  const [showShiftReport, setShowShiftReport] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('Hammasi');

  const SECTIONS = ["Hammasi", "Ko'cha", "Zal", "Kabina"];
  const getSections = () => JSON.parse(localStorage.getItem('tableZones_v2') || '{}');
  const getSection = (tableId: string) => {
    const saved = getSections()[tableId];
    if (saved) return saved;
    const t = useStore.getState().tables.find(x => x.id === tableId);
    return t ? getDefaultTableSection(t.number) : 'Zal';
  };

  const getTableNumber = (tableId: string) => {
    if (!tableId) return 'S-oboy (Olib ketish)';
    const table = tables.find(t => t.id === tableId);
    return table ? formatTableName(table.number) : 'Noma\'lum';
  };

  const handlePrint = (order: any) => {
    // Prevent duplicate prints (debounce)
    if ((window as any).__isPrinting) return;
    (window as any).__isPrinting = true;
    setTimeout(() => { (window as any).__isPrinting = false; }, 3000);

    // Track print count
    const printedOrders = JSON.parse(localStorage.getItem('printedOrders') || '{}');
    const newCount = (printedOrders[order.id] || 0) + 1;
    printedOrders[order.id] = newCount;
    localStorage.setItem('printedOrders', JSON.stringify(printedOrders));
    
    setPrintingOrder({ ...order, printCount: newCount });
    setTimeout(() => {
      printReceiptElement(order.id).finally(() => {
        setTimeout(() => setPrintingOrder(null), 1000);
      });
    }, 150);
  };

  // Remote print triggers (from waiters' phones) are handled globally by RemotePrintListener

  const getPrintedCount = (orderId: string) => {
    const printedOrders = JSON.parse(localStorage.getItem('printedOrders') || '{}');
    return printedOrders[orderId] || 0;
  };

  const allPendingOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');
  const pendingFiltered = activeSection === 'Hammasi'
    ? allPendingOrders
    : allPendingOrders.filter(o => o.tableId === 'takeaway' ? false : getSection(o.tableId) === activeSection);
    
  // 1. Ochiqlar (Zakaz berildi / Chek chiqarilmagan)
  const openOrders = pendingFiltered.filter(o => getPrintedCount(o.id) === 0);
  // 2. Yopilgan (Zakritiy / Chek chiqarilgan, lekin to'lanmagan)
  const closedOrders = pendingFiltered.filter(o => getPrintedCount(o.id) > 0);
  
  const getLogicalDate = (dateString?: string) => {
    const d = dateString ? new Date(dateString) : new Date();
    d.setHours(d.getHours() - 5);
    return d.toDateString();
  };

  const todayLogicalDate = getLogicalDate();

  // 3. To'langan (Bugungi smena)
  const paidToday = orders.filter(o => o.status === 'paid' && getLogicalDate(o.updatedAt || o.createdAt) === todayLogicalDate);
  
  // 4. Bekor qilingan (Otmen bo'lganlar - butunlay bekor qilingan yoki ichida otmen qilingan taom borlar)
  const cancelledOrders = orders.filter(o => 
    (o.status === 'cancelled' || (o.items && o.items.some((i: any) => i.quantity === 0))) &&
    getLogicalDate(o.updatedAt || o.createdAt) === todayLogicalDate
  );

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
              (window as any).customConfirm(isSystemOpen ? "Diqqat! Saytni yopsangiz, ofitsiantlar va kassirlar kira olmaydi (mijozlar menyuni ko'ra oladi). Tasdiqlaysizmi?" : "Saytni qayta ochishni tasdiqlaysizmi?", () => {
                setSystemOpen(!isSystemOpen);
              });
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
      
      <div className="flex gap-2 flex-wrap mb-2">
        {SECTIONS.map(sec => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${
              activeSection === sec
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* 1. Ochiq buyurtmalar (Otkrytye) */}
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" /> Ochiqlar (Zakaz berildi) {openOrders.length}
          </h2>
          {openOrders.map(order => {
            const waiter = useStore.getState().employees.find(e => e.id === order.waiterId);
            return (
              <div key={order.id} className="bg-[#2979ff] hover:bg-[#226add] transition-colors text-white p-5 rounded-3xl shadow-md flex flex-col gap-3 group relative cursor-pointer" onClick={() => setSelectedOrderDetails(order)}>
                <div className="flex justify-between items-center text-sm font-semibold opacity-90 tracking-wide">
                  <span>№{formatOrderId(order.id)} • {waiter ? waiter.fullName.toUpperCase() : 'KASSIR'}</span>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  {order.items.map((i: any, index: number) => {
                    const itemName = menuItems.find(m => m.id === i.menuItemId)?.name;
                    return (
                      <div key={index} className={`flex justify-between items-center bg-white/10 px-3 py-1.5 rounded-lg text-sm font-medium ${i.quantity === 0 ? 'line-through opacity-50' : ''}`}>
                        <span className="truncate pr-2">{itemName || 'Taom'}</span>
                        <span className="font-bold opacity-80 shrink-0">{i.quantity} x</span>
                      </div>
                    );
                  })}
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
                {/* Hover actions */}
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                  <button onClick={(e) => { e.stopPropagation(); setPaymentOrder(order); }} className="w-full bg-emerald-500 text-white py-3 rounded-xl text-[15px] font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                    <Banknote className="w-5 h-5" /> To'lov qilish
                  </button>
                  <div className="flex gap-2 w-full mt-1">
                    <button onClick={(e) => { e.stopPropagation(); handlePrint(order); }} className="flex-1 bg-white/20 text-white py-2 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors">Chek</button>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedOrderDetails(order); }} className="flex-1 bg-white/20 text-white py-2 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors">Ko'rish</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Yopilgan (Zakritiy) - Precheck printed */}
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <Printer className="w-5 h-5 text-amber-500" /> Yopilgan (Zakritiy) {closedOrders.length}
          </h2>
          {closedOrders.map(order => {
            const waiter = useStore.getState().employees.find(e => e.id === order.waiterId);
            return (
              <div key={order.id} className="bg-amber-500 hover:bg-amber-600 transition-colors text-white p-5 rounded-3xl shadow-md flex flex-col gap-3 group relative cursor-pointer" onClick={() => setSelectedOrderDetails(order)}>
                <div className="flex justify-between items-center text-sm font-semibold opacity-90 tracking-wide">
                  <span>№{formatOrderId(order.id)} • {waiter ? waiter.fullName.toUpperCase() : 'KASSIR'}</span>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  {order.items.map((i: any, index: number) => {
                    const itemName = menuItems.find(m => m.id === i.menuItemId)?.name;
                    return (
                      <div key={index} className={`flex justify-between items-center bg-white/20 px-3 py-1.5 rounded-lg text-sm font-medium ${i.quantity === 0 ? 'line-through opacity-50' : ''}`}>
                        <span className="truncate pr-2">{itemName || 'Taom'}</span>
                        <span className="font-bold shrink-0">{i.quantity} x</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-black/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    {getTableNumber(order.tableId)}
                  </div>
                  <div className="bg-black/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'})} 
                  </div>
                </div>
                {/* Hover actions */}
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                  <button onClick={(e) => { e.stopPropagation(); setPaymentOrder(order); }} className="w-full bg-emerald-500 text-white py-3 rounded-xl text-[15px] font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                    <Banknote className="w-5 h-5" /> To'lov qilish
                  </button>
                  <div className="flex gap-2 w-full mt-1">
                    <button onClick={(e) => { e.stopPropagation(); handlePrint(order); }} className="flex-1 bg-white/20 text-white py-2 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors">Qayta Chek</button>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedOrderDetails(order); }} className="flex-1 bg-white/20 text-white py-2 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors">Ko'rish</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. To'langan (Oplachennye) */}
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500" /> To'langan {paidToday.length}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {paidToday.map(order => {
              const waiter = useStore.getState().employees.find(e => e.id === order.waiterId);
              return (
                <div key={order.id} className="bg-[#2e7d32] text-white p-5 rounded-3xl shadow-sm flex flex-col gap-3 group relative cursor-pointer" onClick={() => setSelectedOrderDetails(order)}>
                  <div className="flex justify-between items-center text-sm font-semibold opacity-90 tracking-wide">
                    <span>№{formatOrderId(order.id)} • {waiter ? waiter.fullName.toUpperCase() : 'KASSIR'}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {order.items.map((i: any, index: number) => {
                      const itemName = menuItems.find(m => m.id === i.menuItemId)?.name;
                      return (
                        <div key={index} className={`flex justify-between items-center bg-white/10 px-3 py-1.5 rounded-lg text-sm font-medium ${i.quantity === 0 ? 'line-through opacity-50' : ''}`}>
                          <span className="truncate pr-2">{itemName || 'Taom'}</span>
                          <span className="font-bold opacity-80 shrink-0">{i.quantity} x</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-amber-200">
                      {getTableNumber(order.tableId)}
                    </div>
                  </div>
                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-[#1b5e20]/90 backdrop-blur-sm rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handlePrint(order); }} className="w-full bg-white/20 text-white py-3 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
                      <Printer className="w-5 h-5" /> Chek chiqarish
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedOrderDetails(order); }} className="w-full bg-white/20 text-white py-3 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
                      Ko'rish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Bekor qilingan (Otmen qilinganlar / Otmen qilingan taomi borlar) */}
        <div className="space-y-4">
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <X className="w-5 h-5 text-red-500" /> Otmen {cancelledOrders.length}
          </h2>
          {cancelledOrders.map(order => {
            const waiter = useStore.getState().employees.find(e => e.id === order.waiterId);
            const isFullyCancelled = order.status === 'cancelled';
            return (
              <div key={order.id} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 p-5 rounded-3xl shadow-sm flex flex-col gap-3 cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors relative group" onClick={() => setSelectedOrderDetails(order)}>
                <div className="flex justify-between items-center text-sm font-semibold opacity-70 tracking-wide">
                  <span>№{formatOrderId(order.id)} • {waiter ? waiter.fullName.toUpperCase() : 'KASSIR'} {isFullyCancelled ? '(To\'liq otmen)' : '(Qisman otmen)'}</span>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  {order.items.map((i: any, index: number) => {
                    const itemName = menuItems.find(m => m.id === i.menuItemId)?.name;
                    const isCancelledItem = i.quantity === 0;
                    return (
                      <div key={index} className={`flex justify-between items-center px-3 py-1.5 rounded-lg text-sm font-medium opacity-80 ${isCancelledItem ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <span className={`truncate pr-2 ${isCancelledItem ? 'line-through' : ''}`}>{itemName || 'Taom'}</span>
                        <span className="font-bold shrink-0">{i.quantity} x</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-slate-300 dark:bg-slate-600 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    {getTableNumber(order.tableId)}
                  </div>
                </div>
                {/* Hover for reprint */}
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                  <button onClick={(e) => { e.stopPropagation(); handlePrint(order); }} className="w-full bg-white/20 text-white py-3 rounded-xl text-[15px] font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
                    <Printer className="w-5 h-5" /> Chekni qayta chiqarish
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedOrderDetails(order); }} className="w-full bg-white/20 text-white py-3 rounded-xl text-sm font-bold hover:bg-white/30 transition-colors">
                    Ko'rish
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <TablesOverview />
      </div>

      <div className="print-container">
        <ReceiptPrint order={printingOrder} />
      </div>

      {selectedOrderDetails && (
        <OrderDetailsModal 
          order={selectedOrderDetails} 
          onClose={() => setSelectedOrderDetails(null)}
          onPrint={() => handlePrint(selectedOrderDetails)}
        />
      )}

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
                  const electronApi = (window as any).electronApi;
                  if (electronApi?.isElectron) {
                    electronApi.printMainWindowSilent();
                  } else {
                    window.print();
                  }
                }}
                className="w-full mt-8 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" /> Chop etish
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          onClose={() => setPaymentOrder(null)}
          onPay={async (orderId, method) => {
            await updateOrderStatus(orderId, 'paid', method);
            const ord = orders.find(o => o.id === orderId);
            if (ord) handlePrint({ ...ord, status: 'paid', paymentMethod: method });
          }}
        />
      )}
    </div>
  );
};
