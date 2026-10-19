import { CheckCircle, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatOrderId, formatTableName, getDefaultTableSection } from '../../utils/format';
import { TablesOverview } from '../../components/TablesOverview';
import { NotebookModal } from '../../components/NotebookModal';
import { PaymentModal } from '../../components/PaymentModal';
import { OrderDetailsModal } from '../../components/OrderDetailsModal';
import { Printer, BookOpen, Power, ListX, X, Check, Calculator, Banknote, Plus, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { triggerReceiptPrint } from '../../utils/printReceipt';
import { StopListManagement } from './StopListManagement';

export const CashierDashboard = () => {
  const { orders, tables, updateOrderStatus, isSystemOpen, setSystemOpen, menuItems, updateMenuItemAvailability } = useStore();
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
    if (!tableId || tableId === 'takeaway') return 'S-oboy (Olib ketish)';
    const table = tables.find(t => t.id === tableId);
    return table ? formatTableName(table.number) : 'Noma\'lum';
  };

  const handlePrint = (order: any) => {
    triggerReceiptPrint(order);
  };

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
  
  // 4. Bekor qilingan (Otmen bo'lganlar)
  const cancelledOrders = orders.filter(o => 
    (o.status === 'cancelled' || (o.items && o.items.some((i: any) => i.quantity === 0))) &&
    getLogicalDate(o.updatedAt || o.createdAt) === todayLogicalDate
  );

  const cashTotal = paidToday.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.totalAmount, 0);
  const cardTotal = paidToday.filter(o => o.paymentMethod === 'card').reduce((sum, o) => sum + o.totalAmount, 0);
  const totalRevenue = cashTotal + cardTotal;

  return (
    <div className="p-4 sm:p-8 space-y-8 select-none">
      {/* Top Header */}
      <div className="flex justify-between items-start lg:items-center flex-col lg:flex-row gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase" style={{ color: '#D4AF37' }}>
            Kassa Paneli
          </h1>
          <p className="text-sm sm:text-base font-semibold mt-1" style={{ color: '#A39B8B' }}>
            Buyurtmalar nazorati va to'lovlarni qabul qilish
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-2.5 flex-wrap items-center">
          <button
            onClick={() => {
              (window as any).customConfirm?.(isSystemOpen ? "Diqqat! Saytni yopsangiz, ofitsiantlar va kassirlar kira olmaydi. Tasdiqlaysizmi?" : "Saytni qayta ochishni tasdiqlaysizmi?", () => {
                setSystemOpen(!isSystemOpen);
              }) || setSystemOpen(!isSystemOpen);
            }}
            className={`px-5 py-3 rounded-2xl font-black text-sm sm:text-base transition-all active:scale-95 flex items-center gap-2 shadow-sm ${
              isSystemOpen 
                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30' 
                : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
            }`}
          >
            <Power className="w-5 h-5" />
            {isSystemOpen ? 'Tizimni yopish' : 'Tizimni ochish'}
          </button>
          
          <button 
            onClick={() => setShowNotebook(true)}
            className="px-5 py-3 rounded-2xl font-black text-sm sm:text-base transition-all active:scale-95 flex items-center gap-2 shadow-sm bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30"
          >
            <BookOpen className="w-5 h-5" />
            Daftarcha
          </button>
          
          <Link 
            to="/cashier/menu"
            className="px-5 py-3 rounded-2xl font-black text-sm sm:text-base transition-all active:scale-95 flex items-center gap-2 shadow-sm bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border border-blue-500/30"
            title="Taomlar va narxlarni boshqarish"
          >
            <BookOpen className="w-5 h-5" />
            Menyu
          </Link>

          <button 
            onClick={() => setShowStopList(true)}
            className="px-5 py-3 rounded-2xl font-black text-sm sm:text-base transition-all active:scale-95 flex items-center gap-2 shadow-sm bg-orange-500/15 text-orange-300 hover:bg-orange-500/25 border border-orange-500/30"
          >
            <ListX className="w-5 h-5" />
            Stop-list
          </button>
          
          <button 
            onClick={() => setShowShiftReport(true)}
            className="px-5 py-3 rounded-2xl font-black text-sm sm:text-base transition-all active:scale-95 flex items-center gap-2 shadow-sm bg-purple-500/15 text-purple-300 hover:bg-purple-500/25 border border-purple-500/30"
          >
            <Calculator className="w-5 h-5" />
            Z-otchyot
          </button>

          <Link 
            to="/cashier/new-order?table=takeaway"
            className="px-6 py-3 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-xl"
            style={{ background: '#D4AF37', color: '#13120F', boxShadow: '0 4px 20px rgba(212,175,55,0.25)' }}
          >
            <Plus className="w-5 h-5" />
            S-oboy
          </Link>
        </div>
      </div>
      
      {/* Section Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map(sec => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`px-5 py-2.5 rounded-2xl text-sm sm:text-base font-black transition-all active:scale-95 shadow-sm ${
              activeSection === sec
                ? 'bg-[#D4AF37] text-[#13120F]'
                : 'bg-[#1C1A17] text-[#A39B8B] hover:text-[#F5F2EA] hover:bg-[#24211D] border border-[rgba(212,175,55,0.12)]'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* 4 JOWi-Style Order Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        
        {/* 1. Ochiq buyurtmalar (Otkrytye) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-blue-500/20">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" /> Ochiqlar ({openOrders.length})
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">
              Chek berilmagan
            </span>
          </div>

          <div className="space-y-4">
            {openOrders.map(order => {
              const waiter = useStore.getState().employees.find(e => e.id === order.waiterId);
              return (
                <div 
                  key={order.id} 
                  className="bg-[#1e40af] hover:bg-[#1d4ed8] transition-all text-white p-5 rounded-3xl shadow-xl flex flex-col gap-3 relative border-2 border-blue-400/30"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-center text-sm font-extrabold tracking-wide border-b border-white/10 pb-2">
                    <span className="text-base font-black">№{formatOrderId(order.id)}</span>
                    <span className="text-xs uppercase bg-black/25 px-2.5 py-1 rounded-lg">
                      {waiter ? waiter.fullName : 'KASSIR'}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="flex flex-col gap-1.5 my-1 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                    {order.items.map((i: any, index: number) => {
                      const itemName = menuItems.find(m => m.id === i.menuItemId)?.name;
                      return (
                        <div key={index} className={`flex justify-between items-center bg-white/10 px-3 py-1.5 rounded-xl text-sm font-bold ${i.quantity === 0 ? 'line-through opacity-50' : ''}`}>
                          <span className="truncate pr-2">{itemName || 'Taom'}</span>
                          <span className="font-black shrink-0">{i.quantity} x</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Metadata & Total */}
                  <div className="flex justify-between items-center pt-1 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="bg-black/30 px-3 py-1 rounded-xl text-xs sm:text-sm font-black">
                        {getTableNumber(order.tableId)}
                      </span>
                      <span className="text-xs opacity-80 flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black text-amber-300">
                        {Math.round((order.totalAmount || 0) * 1.1).toLocaleString('uz-UZ')} so'm
                      </div>
                      <div className="text-[10px] text-amber-300/60 font-semibold">+10% servis bilan</div>
                    </div>
                  </div>

                  {/* Touch Action Buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    <button 
                      onClick={() => setPaymentOrder(order)} 
                      className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-2xl text-base font-black transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
                    >
                      <Banknote className="w-5 h-5" /> To'lov qilish
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handlePrint(order)} 
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-white py-3.5 rounded-xl text-base font-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-amber-500/30"
                      >
                        <Printer className="w-5 h-5" /> Chek
                      </button>
                      <button 
                        onClick={() => setSelectedOrderDetails(order)} 
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Eye className="w-4 h-4" /> Ko'rish
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {openOrders.length === 0 && (
              <div className="text-center py-10 font-bold text-sm" style={{ color: '#6C6659' }}>
                Ochiq buyurtmalar yo'q
              </div>
            )}
          </div>
        </div>

        {/* 2. Yopilgan (Zakritiy) - Precheck printed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-400" /> Yopilgan ({closedOrders.length})
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300">
              Hisob berilgan
            </span>
          </div>

          <div className="space-y-4">
            {closedOrders.map(order => {
              const waiter = useStore.getState().employees.find(e => e.id === order.waiterId);
              return (
                <div 
                  key={order.id} 
                  className="bg-[#b45309] hover:bg-[#92400e] transition-all text-white p-5 rounded-3xl shadow-xl flex flex-col gap-3 relative border-2 border-amber-300/40 ring-1 ring-amber-400/30"
                >
                  <div className="flex justify-between items-center text-sm font-extrabold tracking-wide border-b border-white/10 pb-2">
                    <span className="text-base font-black">№{formatOrderId(order.id)}</span>
                    <span className="text-xs uppercase bg-black/25 px-2.5 py-1 rounded-lg">
                      {waiter ? waiter.fullName : 'KASSIR'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 my-1 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                    {order.items.map((i: any, index: number) => {
                      const itemName = menuItems.find(m => m.id === i.menuItemId)?.name;
                      return (
                        <div key={index} className={`flex justify-between items-center bg-black/20 px-3 py-1.5 rounded-xl text-sm font-bold ${i.quantity === 0 ? 'line-through opacity-50' : ''}`}>
                          <span className="truncate pr-2">{itemName || 'Taom'}</span>
                          <span className="font-black shrink-0">{i.quantity} x</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="bg-black/30 px-3 py-1 rounded-xl text-xs sm:text-sm font-black">
                        {getTableNumber(order.tableId)}
                      </span>
                      <span className="text-xs opacity-80 flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black text-amber-200">
                        {Math.round((order.totalAmount || 0) * 1.1).toLocaleString('uz-UZ')} so'm
                      </div>
                      <div className="text-[10px] text-amber-200/60 font-semibold">+10% servis bilan</div>
                    </div>
                  </div>

                  {/* Touch Action Buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    <button 
                      onClick={() => setPaymentOrder(order)} 
                      className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-2xl text-base font-black transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
                    >
                      <Banknote className="w-5 h-5" /> To'lov qilish
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handlePrint(order)} 
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-white py-3.5 rounded-xl text-base font-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-amber-500/30"
                      >
                        <Printer className="w-5 h-5" /> Qayta Chek
                      </button>
                      <button 
                        onClick={() => setSelectedOrderDetails(order)} 
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Eye className="w-4 h-4" /> Ko'rish
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {closedOrders.length === 0 && (
              <div className="text-center py-10 font-bold text-sm" style={{ color: '#6C6659' }}>
                Yopilgan buyurtmalar yo'q
              </div>
            )}
          </div>
        </div>

        {/* 3. To'langan (Oplachennye) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" /> To'langan ({paidToday.length})
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
              Bugun
            </span>
          </div>

          <div className="space-y-4">
            {paidToday.map(order => {
              const waiter = useStore.getState().employees.find(e => e.id === order.waiterId);
              return (
                <div 
                  key={order.id} 
                  className="bg-[#065f46] hover:bg-[#047857] text-white p-5 rounded-3xl shadow-md flex flex-col gap-3 relative border-2 border-emerald-400/30 transition-all"
                >
                  <div className="flex justify-between items-center text-sm font-extrabold tracking-wide border-b border-white/10 pb-2">
                    <span className="text-base font-black">№{formatOrderId(order.id)}</span>
                    <span className="text-xs uppercase bg-black/25 px-2.5 py-1 rounded-lg">
                      {waiter ? waiter.fullName : 'KASSIR'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 my-1 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
                    {order.items.map((i: any, index: number) => {
                      const itemName = menuItems.find(m => m.id === i.menuItemId)?.name;
                      return (
                        <div key={index} className="flex justify-between items-center bg-white/10 px-3 py-1.5 rounded-xl text-sm font-bold">
                          <span className="truncate pr-2">{itemName || 'Taom'}</span>
                          <span className="font-black shrink-0">{i.quantity} x</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-white/10">
                    <span className="bg-black/30 px-3 py-1 rounded-xl text-xs sm:text-sm font-black">
                      {getTableNumber(order.tableId)}
                    </span>
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-black text-emerald-200">
                        {Math.round((order.totalAmount || 0) * 1.1).toLocaleString('uz-UZ')} so'm
                      </div>
                      <div className="text-[10px] text-emerald-200/60 font-semibold">+10% servis bilan</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => handlePrint(order)} 
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-white py-3.5 rounded-xl text-base font-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-amber-500/30"
                    >
                      <Printer className="w-5 h-5" /> Chek
                    </button>
                    <button 
                      onClick={() => setSelectedOrderDetails(order)} 
                      className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Eye className="w-4 h-4" /> Ko'rish
                    </button>
                  </div>
                </div>
              );
            })}
            {paidToday.length === 0 && (
              <div className="text-center py-10 font-bold text-sm" style={{ color: '#6C6659' }}>
                Hali to'langan buyurtmalar yo'q
              </div>
            )}
          </div>
        </div>

        {/* 4. Bekor qilingan (Otmen) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-red-500/20">
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <X className="w-5 h-5 text-red-500" /> Otmen ({cancelledOrders.length})
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-300">
              Bekor qilingan
            </span>
          </div>

          <div className="space-y-4">
            {cancelledOrders.map(order => {
              const waiter = useStore.getState().employees.find(e => e.id === order.waiterId);
              const isFullyCancelled = order.status === 'cancelled';
              return (
                <div 
                  key={order.id} 
                  className="bg-[#24211D] text-[#A39B8B] p-5 rounded-3xl shadow-sm flex flex-col gap-3 relative border border-red-500/25"
                >
                  <div className="flex justify-between items-center text-sm font-extrabold tracking-wide border-b border-white/5 pb-2 text-white">
                    <span className="text-base font-black">№{formatOrderId(order.id)}</span>
                    <span className="text-xs uppercase bg-red-500/20 text-red-300 px-2 py-0.5 rounded-lg">
                      {isFullyCancelled ? 'To\'liq otmen' : 'Qisman otmen'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 my-1 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
                    {order.items.map((i: any, index: number) => {
                      const itemName = menuItems.find(m => m.id === i.menuItemId)?.name;
                      const isCancelledItem = i.quantity === 0;
                      return (
                        <div key={index} className={`flex justify-between items-center px-3 py-1.5 rounded-xl text-sm font-bold ${isCancelledItem ? 'bg-red-950/40 text-red-400 line-through' : 'bg-white/5 text-white/80'}`}>
                          <span className="truncate pr-2">{itemName || 'Taom'}</span>
                          <span className="font-black shrink-0">{i.quantity} x</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-white/5">
                    <span className="bg-white/5 text-white px-3 py-1 rounded-xl text-xs sm:text-sm font-bold">
                      {getTableNumber(order.tableId)}
                    </span>
                    <span className="text-xs font-semibold text-white/60">
                      {waiter ? waiter.fullName : 'Kassir'}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => handlePrint(order)} 
                      className="flex-1 bg-white/10 hover:bg-white/15 text-white py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Printer className="w-4 h-4" /> Chek
                    </button>
                    <button 
                      onClick={() => setSelectedOrderDetails(order)} 
                      className="flex-1 bg-white/10 hover:bg-white/15 text-white py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Eye className="w-4 h-4" /> Ko'rish
                    </button>
                  </div>
                </div>
              );
            })}
            {cancelledOrders.length === 0 && (
              <div className="text-center py-10 font-bold text-sm" style={{ color: '#6C6659' }}>
                Bekor qilingan buyurtmalar yo'q
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Table Map Section */}
      <div className="rounded-3xl p-6 sm:p-8 shadow-xl" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.15)' }}>
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-6" style={{ color: '#D4AF37' }}>
          Stollar Xaritasi (Zal Ko'rinishi)
        </h2>
        <TablesOverview />
      </div>

      {/* Modals */}
      {selectedOrderDetails && (
        <OrderDetailsModal 
          order={selectedOrderDetails} 
          onClose={() => setSelectedOrderDetails(null)}
          onPrint={() => handlePrint(selectedOrderDetails)}
        />
      )}

      {showNotebook && <NotebookModal onClose={() => setShowNotebook(false)} />}
      
      {showStopList && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#1C1A17] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-[rgba(212,175,55,0.25)] p-4 sm:p-6">
            <StopListManagement isModal={true} onClose={() => setShowStopList(false)} />
          </div>
        </div>
      )}

      {showShiftReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1A17] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-[rgba(212,175,55,0.2)]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#24211D]">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Calculator className="w-6 h-6 text-purple-400" />
                Smena Hisoboti (Z-Otchyot)
              </h2>
              <button 
                onClick={() => setShowShiftReport(false)}
                className="p-2 text-white/60 hover:text-white transition-colors bg-white/5 rounded-2xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-white/70 font-bold text-sm">Naqd pul tushumi:</span>
                  <span className="font-black text-emerald-400 text-lg">{formatCurrency(cashTotal)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-white/70 font-bold text-sm">Plastik karta tushumi:</span>
                  <span className="font-black text-blue-400 text-lg">{formatCurrency(cardTotal)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-white font-extrabold text-base">Jami tushum:</span>
                  <span className="font-black text-[#D4AF37] text-2xl">{formatCurrency(totalRevenue)}</span>
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
                className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider text-[#13120F] transition-all flex items-center justify-center gap-2 shadow-xl active:scale-98"
                style={{ background: '#D4AF37' }}
              >
                <Printer className="w-5 h-5" /> Hisobotni Chop Etish
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          onClose={() => setPaymentOrder(null)}
          onPay={async (orderId, method, paymentData) => {
            await updateOrderStatus(orderId, 'paid', method, paymentData);
            setPaymentOrder(null);
          }}
        />
      )}
    </div>
  );
};
