import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, ShoppingBag, Users, Grid, 
  ArrowUpRight, Clock, Banknote, CreditCard, 
  AlertCircle, ChevronRight, Activity, Calendar, 
  Sparkles, RefreshCw, Eye
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatTime, formatTableName } from '../../utils/format';
import { OrderDetailsModal } from '../../components/OrderDetailsModal';

export const AdminDashboard = () => {
  const { orders, tables, menuItems, employees, fetchInitialData, isLoading } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | 'week'>('today');

  // Filter dates
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const weekAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }, []);

  // Filtered orders based on selected time horizon
  const periodOrders = useMemo(() => {
    return orders.filter(o => {
      const orderDate = (o.createdAt || '').slice(0, 10);
      if (timeFilter === 'today') return orderDate === todayStr;
      if (timeFilter === 'yesterday') return orderDate === yesterdayStr;
      return orderDate >= weekAgoStr && orderDate <= todayStr;
    });
  }, [orders, timeFilter, todayStr, yesterdayStr, weekAgoStr]);

  // Key KPI metrics
  const paidOrders = useMemo(() => periodOrders.filter(o => o.status === 'paid'), [periodOrders]);
  const totalRevenue = useMemo(() => paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0), [paidOrders]);
  
  const cashRevenue = useMemo(() => 
    paidOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  , [paidOrders]);

  const cardRevenue = useMemo(() => 
    paidOrders.filter(o => o.paymentMethod === 'card' || o.paymentMethod === 'bank_card').reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  , [paidOrders]);

  const avgCheck = useMemo(() => {
    return paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;
  }, [paidOrders, totalRevenue]);

  const cancelledOrders = useMemo(() => periodOrders.filter(o => o.status === 'cancelled'), [periodOrders]);
  const cancelledAmount = useMemo(() => cancelledOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0), [cancelledOrders]);

  // Table occupancy
  const occupiedTablesCount = useMemo(() => tables.filter(t => t.status === 'occupied').length, [tables]);
  const totalTablesCount = tables.length;
  const occupancyPercentage = totalTablesCount > 0 ? Math.round((occupiedTablesCount / totalTablesCount) * 100) : 0;

  // Hourly distribution for chart (10:00 to 23:00)
  const hourlyData = useMemo(() => {
    const hours = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const buckets: Record<string, number> = {
      '10:00': 0, '12:00': 0, '14:00': 0, '16:00': 0, '18:00': 0, '20:00': 0, '22:00': 0
    };

    paidOrders.forEach(o => {
      if (!o.createdAt) return;
      const hour = new Date(o.createdAt).getHours();
      if (hour < 11) buckets['10:00'] += o.totalAmount || 0;
      else if (hour < 13) buckets['12:00'] += o.totalAmount || 0;
      else if (hour < 15) buckets['14:00'] += o.totalAmount || 0;
      else if (hour < 17) buckets['16:00'] += o.totalAmount || 0;
      else if (hour < 19) buckets['18:00'] += o.totalAmount || 0;
      else if (hour < 21) buckets['20:00'] += o.totalAmount || 0;
      else buckets['22:00'] += o.totalAmount || 0;
    });

    const maxVal = Math.max(...Object.values(buckets), 100000);
    return hours.map(h => ({
      hour: h,
      amount: buckets[h],
      pct: Math.min(100, Math.round((buckets[h] / maxVal) * 100))
    }));
  }, [paidOrders]);

  // Top Selling Dishes
  const topDishes = useMemo(() => {
    const countMap: Record<string, { name: string; count: number; revenue: number }> = {};
    paidOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const itemInfo = menuItems.find(m => m.id === item.menuItemId);
        const name = itemInfo?.name || 'Taom';
        if (!countMap[name]) {
          countMap[name] = { name, count: 0, revenue: 0 };
        }
        countMap[name].count += item.quantity || 1;
        countMap[name].revenue += (item.quantity || 1) * (item.price || itemInfo?.price || 0);
      });
    });

    return Object.values(countMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [paidOrders, menuItems]);

  // Waiter performance
  const waiterStats = useMemo(() => {
    const waiters = employees.filter(e => e.role === 'waiter');
    return waiters.map(w => {
      const wOrders = paidOrders.filter(o => o.waiterId === w.id);
      const wRevenue = wOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      return {
        id: w.id,
        name: w.fullName,
        ordersCount: wOrders.length,
        revenue: wRevenue
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [employees, paidOrders]);

  // Live recent orders (last 6)
  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 6);
  }, [orders]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 font-sans max-w-7xl mx-auto" style={{ color: '#F5F2EA' }}>
      
      {/* Top Welcome & Horizon Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Onlayn
            </span>
            <span className="text-xs text-[#8A8070] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#F5F2EA', fontFamily: 'serif' }}>
            Boshqaruv paneli
          </h1>
        </div>

        {/* Action & Filter Pills */}
        <div className="flex items-center gap-2.5">
          <div className="flex rounded-xl p-1" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.15)' }}>
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'today' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-[#8A8070] hover:text-white'}`}
            >
              Bugun
            </button>
            <button
              onClick={() => setTimeFilter('yesterday')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'yesterday' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-[#8A8070] hover:text-white'}`}
            >
              Kecha
            </button>
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === 'week' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-[#8A8070] hover:text-white'}`}
            >
              Haftalik
            </button>
          </div>

          <button
            onClick={() => fetchInitialData()}
            className="p-2.5 rounded-xl border transition-all hover:bg-white/5 active:scale-95"
            style={{ background: '#1C1A17', borderColor: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 PRIMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Revenue */}
        <div className="rounded-3xl p-6 relative overflow-hidden shadow-xl" style={{ background: 'linear-gradient(145deg, #1C1A17 0%, #151412 100%)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider font-bold text-[#8A8070]">Jami Tushum</span>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#F5F2EA' }}>
            {formatCurrency(totalRevenue)}
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
            <span className="flex items-center gap-1 text-[#8A8070]">
              <Banknote className="w-3.5 h-3.5 text-emerald-400" /> Naqd: {formatCurrency(cashRevenue)}
            </span>
            <span className="flex items-center gap-1 text-[#8A8070]">
              <CreditCard className="w-3.5 h-3.5 text-blue-400" /> Karta: {formatCurrency(cardRevenue)}
            </span>
          </div>
        </div>

        {/* Card 2: Orders & Avg Check */}
        <div className="rounded-3xl p-6 relative overflow-hidden shadow-xl" style={{ background: 'linear-gradient(145deg, #1C1A17 0%, #151412 100%)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider font-bold text-[#8A8070]">To'langan buyurtmalar</span>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {paidOrders.length} <span className="text-base font-medium text-[#8A8070]">ta</span>
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
            <span className="text-[#8A8070]">O'rtacha chek:</span>
            <span className="font-bold text-[#D4AF37]">{formatCurrency(avgCheck)}</span>
          </div>
        </div>

        {/* Card 3: Tables & Occupancy */}
        <div className="rounded-3xl p-6 relative overflow-hidden shadow-xl" style={{ background: 'linear-gradient(145deg, #1C1A17 0%, #151412 100%)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider font-bold text-[#8A8070]">Band stollar</span>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-400">
              <Grid className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-baseline gap-2">
            <span>{occupiedTablesCount} / {totalTablesCount}</span>
            <span className="text-sm font-bold text-amber-400">({occupancyPercentage}%)</span>
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
            <span className="text-emerald-400 font-medium">● {totalTablesCount - occupiedTablesCount} ta bo'sh</span>
            <Link to="/admin/tables" className="text-[#D4AF37] hover:underline flex items-center">
              Stollar <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Cancelled Orders */}
        <div className="rounded-3xl p-6 relative overflow-hidden shadow-xl" style={{ background: 'linear-gradient(145deg, #1C1A17 0%, #151412 100%)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider font-bold text-[#8A8070]">Bekor qilinganlar</span>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-red-500/10 text-red-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-red-400">
            {cancelledOrders.length} <span className="text-base font-medium text-[#8A8070]">ta</span>
          </div>
          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
            <span className="text-[#8A8070]">Bekor qilingan summa:</span>
            <span className="font-bold text-red-400">{formatCurrency(cancelledAmount)}</span>
          </div>
        </div>

      </div>

      {/* MIDDLE SECTION: HOURLY SALES CHART & TOP DISHES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hourly Trend Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl p-6 shadow-xl flex flex-col justify-between" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#D4AF37]" /> Soatlik savdo
              </h2>
            </div>
          </div>

          {/* Clean Bar Visualization */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {hourlyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] text-[#8A8070] mb-1 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                  {d.amount > 0 ? (d.amount / 1000).toFixed(0) + 'k' : '0'}
                </span>
                <div 
                  className="w-full max-w-[42px] rounded-t-xl transition-all duration-300 group-hover:brightness-125"
                  style={{ 
                    height: `${Math.max(8, d.pct)}%`,
                    background: d.amount > 0 
                      ? 'linear-gradient(180deg, #D4AF37 0%, rgba(212,175,55,0.3) 100%)' 
                      : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(212,175,55,0.3)'
                  }}
                />
                <span className="text-[11px] text-[#8A8070] mt-2 font-medium">{d.hour}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs text-[#8A8070]" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
            <span>Eng gavjum vaqt: <strong className="text-[#D4AF37]">18:00 — 21:00</strong></span>
            <Link to="/admin/reports" className="text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold">
              Batafsil hisobotlar <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Top 5 Dishes (1 col) */}
        <div className="rounded-3xl p-6 shadow-xl flex flex-col justify-between" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Eng ko'p sotilgan taomlar
              </h2>
            </div>
          </div>

          <div className="space-y-3.5 flex-1">
            {topDishes.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#8A8070]">
                Ma'lumot mavjud emas
              </div>
            ) : (
              topDishes.map((dish, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#D4AF37]/20 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                      style={{ 
                        background: idx === 0 ? '#D4AF37' : idx === 1 ? '#94A3B8' : idx === 2 ? '#B45309' : 'rgba(255,255,255,0.08)',
                        color: idx === 0 ? '#000' : '#FFF'
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[130px]">{dish.name}</div>
                      <div className="text-[10px] text-[#8A8070]">{dish.count} ta</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[#D4AF37] text-right">
                    {formatCurrency(dish.revenue)}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t text-right" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
            <Link to="/admin/menu" className="text-xs text-[#8A8070] hover:text-[#D4AF37] font-medium inline-flex items-center gap-1">
              Menyu <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: LIVE ORDERS STREAM & WAITERS PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Orders Stream (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl p-6 shadow-xl" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D4AF37]" /> So'nggi buyurtmalar
              </h2>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1">
              Barchasi ({orders.length}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="border-b text-[#8A8070]" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                  <th className="py-3 px-3 font-semibold">Stol</th>
                  <th className="py-3 px-3 font-semibold">Ofitsiant</th>
                  <th className="py-3 px-3 font-semibold">Holat</th>
                  <th className="py-3 px-3 font-semibold">Vaqt</th>
                  <th className="py-3 px-3 font-semibold text-right">Summa</th>
                  <th className="py-3 px-3 font-semibold text-center">Ko'rish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map(order => {
                  const statusColors: Record<string, string> = {
                    paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    ready: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    preparing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    new: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20'
                  };
                  const statusLabels: Record<string, string> = {
                    paid: "To'langan",
                    ready: 'Tayyor',
                    preparing: 'Pishirilmoqda',
                    new: 'Yangi',
                    cancelled: 'Bekor qilingan'
                  };

                  const waiterName = employees.find(e => e.id === order.waiterId)?.fullName || 'Noma\'lum';

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-3 font-bold text-white">
                        {formatTableName(order.tableName || order.tableNumber || (order.tableId ? `Stol ${order.tableId.slice(0, 4)}` : 'S-oboy'))}
                      </td>
                      <td className="py-3.5 px-3 text-[#8A8070] font-medium">{waiterName}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColors[order.status] || 'bg-slate-500/10 text-slate-400'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[#8A8070]">{formatTime(order.createdAt)}</td>
                      <td className="py-3.5 px-3 font-bold text-[#D4AF37] text-right">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-[#8A8070] hover:text-[#D4AF37] transition-colors"
                          title="Batafsil ko'rish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Waiter Ranking (1 col) */}
        <div className="rounded-3xl p-6 shadow-xl flex flex-col justify-between" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4AF37]" /> Ofitsiantlar
              </h2>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {waiterStats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#8A8070]">
                Ma'lumot mavjud emas
              </div>
            ) : (
              waiterStats.map((waiter) => (
                <div key={waiter.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
                      {waiter.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{waiter.name}</div>
                      <div className="text-[10px] text-[#8A8070]">{waiter.ordersCount} ta buyurtma</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">{formatCurrency(waiter.revenue)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t text-right" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
            <Link to="/admin/staff" className="text-xs text-[#8A8070] hover:text-[#D4AF37] font-medium inline-flex items-center gap-1">
              Xodimlar <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* QUICK WORKFLOW SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/cashier" className="group p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="text-sm font-bold text-white flex items-center justify-between">
            Kassa <ArrowUpRight className="w-4 h-4 text-[#D4AF37]" />
          </div>
        </Link>
        <Link to="/waiter" className="group p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="text-sm font-bold text-white flex items-center justify-between">
            Ofitsiant <ArrowUpRight className="w-4 h-4 text-[#D4AF37]" />
          </div>
        </Link>
        <Link to="/admin/finance" className="group p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="text-sm font-bold text-white flex items-center justify-between">
            Moliya <ArrowUpRight className="w-4 h-4 text-[#D4AF37]" />
          </div>
        </Link>
        <Link to="/admin/reports" className="group p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02]" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="text-sm font-bold text-white flex items-center justify-between">
            Hisobotlar <ArrowUpRight className="w-4 h-4 text-[#D4AF37]" />
          </div>
        </Link>
      </div>

      {/* Order Details Modal when clicked */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

    </div>
  );
};
