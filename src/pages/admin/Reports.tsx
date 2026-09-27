import { Search, ChevronDown, TrendingUp, ShoppingBag, Package, Wallet, Clock, Percent, BarChart3, X, ClipboardList } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatDate, formatOrderId } from '../../utils/format';
import { useState, useMemo } from 'react';
import { useLocalStore } from '../../store/useLocalStore';

type ReportSection = 'sotuvlar' | 'buyurtmalar' | 'otmenlar' | 'seyflar' | 'hisoblar' | 'bronlar' | 'qqs' | 'kapital';
type DishTab = 'taomlar' | 'modifikatorlar' | 'xizmatlar';

const sectionIcons: Record<ReportSection, any> = {
  sotuvlar: TrendingUp,
  buyurtmalar: ClipboardList,
  otmenlar: X,
  seyflar: Wallet,
  hisoblar: BarChart3,
  bronlar: Clock,
  qqs: Percent,
  kapital: ShoppingBag,
};

const sectionLabels: Record<ReportSection, string> = {
  sotuvlar: 'Sotuvlar',
  buyurtmalar: 'Buyurtmalar',
  otmenlar: 'Otmenlar',
  seyflar: 'Seyflar',
  hisoblar: 'Hisoblar',
  bronlar: 'Bronlar',
  qqs: 'QQS',
  kapital: 'Kapital',
};

const StatCard = ({ label, value, icon, highlight }: { label: string; value: string; icon: React.ReactNode; highlight?: 'green' | 'red' | 'amber' }) => {
  const colors: Record<string, string> = { green: 'text-emerald-400', red: 'text-red-400', amber: 'text-amber-400' };
  return (
    <div className="bg-[#2a3143] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
        {icon}<span>{label}</span>
      </div>
      <div className={`text-2xl font-bold tracking-tight ${highlight ? colors[highlight] : 'text-white'}`}>{value}</div>
    </div>
  );
};

const DataTable = ({ headers, rows, emptyText }: { headers: string[]; rows: string[][]; emptyText: string }) => (
  <div className="bg-[#2a3143] rounded-2xl border border-white/5 overflow-hidden">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-white/5">
          {headers.map(h => <th key={h} className="py-4 px-6 font-medium text-slate-400">{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {rows.length === 0 ? (
          <tr><td colSpan={headers.length} className="py-10 text-center text-slate-500">{emptyText}</td></tr>
        ) : rows.map((row, i) => (
          <tr key={i} className={`hover:bg-white/5 transition-colors ${i % 2 !== 0 ? 'bg-[#32394a]/30' : ''}`}>
            {row.map((cell, j) => (
              <td key={j} className={`py-4 px-6 ${j === 0 ? 'text-white font-medium' : 'text-slate-400'}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SummaryRow = ({ label, value, color, bold }: { label: string; value: string; color: string; bold?: boolean }) => {
  const colors: Record<string, string> = { emerald: 'text-emerald-400', red: 'text-red-400', amber: 'text-amber-400', blue: 'text-blue-400', slate: 'text-slate-300' };
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold ? 'text-white font-bold' : 'text-slate-400'}`}>{label}</span>
      <span className={`font-bold ${colors[color] || 'text-white'}`}>{value}</span>
    </div>
  );
};

export const Reports = () => {
  const { orders, menuItems, categories, employees, expenses, tables } = useStore();
  const { reservations } = useLocalStore();

  const getTableNumber = (tableId: string | undefined | null) => {
    if (!tableId) return 'S-oboy (Olib ketish)';
    const table = tables.find(t => t.id === tableId);
    return table ? table.number : `ID:${tableId.substring(0, 4)}...`;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<ReportSection>('sotuvlar');
  const [activeDishTab, setActiveDishTab] = useState<DishTab>('taomlar');
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [showWaiterFilter, setShowWaiterFilter] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const waiters = employees.filter(e => e.role === 'waiter');

  const filteredOrders = useMemo(() => orders.filter(o => {
    const d = o.createdAt.split('T')[0];
    return d >= dateFrom && d <= dateTo && (selectedWaiter ? o.waiterId === selectedWaiter : true);
  }), [orders, dateFrom, dateTo, selectedWaiter]);

  // SOTUVLAR
  const sotuvlarData = useMemo(() => {
    const paid = filteredOrders.filter(o => o.status === 'paid');
    const tushum = paid.reduce((s, o) => s + o.totalAmount, 0);
    const cashAmount = paid.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + o.totalAmount, 0);
    const cardAmount = paid.filter(o => o.paymentMethod === 'card').reduce((s, o) => s + o.totalAmount, 0);
    const map = new Map<string, { id: string; name: string; category: string; quantity: number; revenue: number }>();
    let totalUnits = 0;
    paid.forEach(order => order.items.forEach(item => {
      totalUnits += item.quantity;
      const mi = menuItems.find(m => m.id === item.menuItemId);
      const cat = categories.find(c => c.id === mi?.categoryId);
      if (!mi) return;
      if (selectedCategory && mi.categoryId !== selectedCategory) return;
      if (!mi.name.toLowerCase().includes(searchTerm.toLowerCase()) && !(cat?.name || '').toLowerCase().includes(searchTerm.toLowerCase())) return;
      if (map.has(item.menuItemId)) {
        map.get(item.menuItemId)!.quantity += item.quantity;
        map.get(item.menuItemId)!.revenue += item.price * item.quantity;
      } else {
        map.set(item.menuItemId, { id: item.menuItemId, name: mi.name, category: cat?.name || "Noma'lum", quantity: item.quantity, revenue: item.price * item.quantity });
      }
    }));
    const items = Array.from(map.values()).sort((a, b) => b.quantity - a.quantity);
    return { tushum, cashAmount, cardAmount, sotilganTaomlar: items.length, totalUnits, items, ordersCount: paid.length };
  }, [filteredOrders, menuItems, categories, searchTerm, selectedCategory]);

  // OTMENLAR
  const otmenlarData = useMemo(() => {
    const cancelled = filteredOrders.filter(o => o.status === 'cancelled');
    return { cancelled, total: cancelled.reduce((s, o) => s + o.totalAmount, 0) };
  }, [filteredOrders]);

  // SEYFLAR
  const seyflarData = useMemo(() => {
    const filtered = expenses.filter(e => { const d = (e.paymentDate || '').split('T')[0]; return d >= dateFrom && d <= dateTo; });
    return { expenses: filtered, total: filtered.reduce((s, e) => s + e.amount, 0) };
  }, [expenses, dateFrom, dateTo]);

  // HISOBLAR
  const hisoblarData = useMemo(() => ({
    income: sotuvlarData.tushum,
    expense: seyflarData.total,
    net: sotuvlarData.tushum - seyflarData.total,
  }), [sotuvlarData.tushum, seyflarData.total]);

  // BRONLAR
  const bronlarData = useMemo(() => ({
    reservations: (reservations || []).filter((r: any) => r.date >= dateFrom && r.date <= dateTo),
  }), [reservations, dateFrom, dateTo]);

  // QQS
  const qqsData = useMemo(() => ({ rate: 12, qqs: sotuvlarData.tushum * 0.12, base: sotuvlarData.tushum }), [sotuvlarData.tushum]);

  // KAPITAL
  const kapitalData = useMemo(() => {
    const gross = orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.totalAmount, 0);
    const exp = expenses.reduce((s, e) => s + e.amount, 0);
    return { gross, expenses: exp, net: gross - exp };
  }, [orders, expenses]);

  return (
    <div className="min-h-screen bg-[#222838] font-sans text-slate-300">

      {/* Top Bar */}
      <div className="bg-[#2a3143] border-b border-white/5 p-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {activeSection === 'sotuvlar' && (
            <>
              <div className="flex bg-[#3b4358] rounded-xl overflow-hidden p-1 gap-1">
                {(['taomlar', 'modifikatorlar', 'xizmatlar'] as DishTab[]).map(tab => (
                  <button key={tab} onClick={() => setActiveDishTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeDishTab === tab ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Qidiruv" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#3b4358] text-white px-10 py-2 rounded-xl text-sm outline-none focus:ring-1 focus:ring-white/20 placeholder-slate-400" />
              </div>
            </>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="bg-[#3b4358] text-white px-3 py-2 rounded-xl text-sm outline-none focus:ring-1 focus:ring-white/20 cursor-pointer" />
            <span className="text-slate-500">-</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="bg-[#3b4358] text-white px-3 py-2 rounded-xl text-sm outline-none focus:ring-1 focus:ring-white/20 cursor-pointer" />
          </div>
        </div>

        {activeSection === 'sotuvlar' && (
          <div className="flex items-center gap-3">
            {/* Waiter filter */}
            <div className="relative">
              <button onClick={() => { setShowWaiterFilter(v => !v); setShowCategoryFilter(false); }}
                className="bg-[#3b4358] text-slate-300 px-4 py-1.5 rounded-xl text-sm flex items-center gap-2 hover:text-white transition-colors">
                {selectedWaiter ? employees.find(e => e.id === selectedWaiter)?.fullName : 'Barcha ofitsiantlar'}
                <ChevronDown className="w-4 h-4 opacity-50" />
              </button>
              {showWaiterFilter && (
                <div className="absolute top-10 left-0 z-50 bg-[#2a3143] border border-white/10 rounded-xl shadow-2xl min-w-[200px] overflow-hidden">
                  <button onClick={() => { setSelectedWaiter(''); setShowWaiterFilter(false); }} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 text-white">Barcha ofitsiantlar</button>
                  {waiters.map(w => (
                    <button key={w.id} onClick={() => { setSelectedWaiter(w.id); setShowWaiterFilter(false); }}
                      className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 ${selectedWaiter === w.id ? 'text-blue-400' : 'text-slate-300'}`}>{w.fullName}</button>
                  ))}
                </div>
              )}
            </div>
            {/* Category filter */}
            <div className="relative">
              <button onClick={() => { setShowCategoryFilter(v => !v); setShowWaiterFilter(false); }}
                className="bg-[#3b4358] text-slate-300 px-4 py-1.5 rounded-xl text-sm flex items-center gap-2 hover:text-white transition-colors">
                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Barcha kategoriyalar'}
                <ChevronDown className="w-4 h-4 opacity-50" />
              </button>
              {showCategoryFilter && (
                <div className="absolute top-10 left-0 z-50 bg-[#2a3143] border border-white/10 rounded-xl shadow-2xl min-w-[200px] overflow-hidden">
                  <button onClick={() => { setSelectedCategory(''); setShowCategoryFilter(false); }} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 text-white">Barcha kategoriyalar</button>
                  {categories.map(c => (
                    <button key={c.id} onClick={() => { setSelectedCategory(c.id); setShowCategoryFilter(false); }}
                      className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 ${selectedCategory === c.id ? 'text-blue-400' : 'text-slate-300'}`}>{c.name}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-52 bg-[#2a3143] border-r border-white/5 min-h-screen p-3 shrink-0">
          <p className="text-xs text-slate-500 uppercase font-bold px-3 py-2 mb-1">Bo'limlar</p>
          {(Object.keys(sectionLabels) as ReportSection[]).map(sec => {
            const Icon = sectionIcons[sec];
            return (
              <button key={sec} onClick={() => setActiveSection(sec)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${activeSection === sec ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <Icon className="w-4 h-4" />{sectionLabels[sec]}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">

          {activeSection === 'sotuvlar' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
                <StatCard label="Tushum" value={formatCurrency(sotuvlarData.tushum)} icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} />
                <StatCard label="Buyurtmalar" value={String(sotuvlarData.ordersCount)} icon={<ShoppingBag className="w-5 h-5 text-blue-400" />} />
                <StatCard label="Taomlar turlari" value={String(sotuvlarData.sotilganTaomlar)} icon={<Package className="w-5 h-5 text-amber-400" />} />
                <StatCard label="Jami birliklar" value={String(sotuvlarData.totalUnits)} icon={<BarChart3 className="w-5 h-5 text-purple-400" />} />
                <StatCard label="Naqd" value={formatCurrency(sotuvlarData.cashAmount)} icon={<Wallet className="w-5 h-5 text-green-400" />} />
                <StatCard label="Karta" value={formatCurrency(sotuvlarData.cardAmount)} icon={<Wallet className="w-5 h-5 text-sky-400" />} />
              </div>
              <DataTable
                headers={['Taom', 'Kategoriya', 'Miqdori', 'Tushum']}
                rows={sotuvlarData.items.map(i => [i.name, i.category, String(i.quantity), formatCurrency(i.revenue)])}
                emptyText="Ushbu kunlarda to'langan buyurtma yo'q" />
            </div>
          )}

          {activeSection === 'buyurtmalar' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <StatCard label="Jami buyurtmalar" value={String(filteredOrders.length)} icon={<ShoppingBag className="w-5 h-5 text-blue-400" />} />
                <StatCard label="To'langanlar" value={String(filteredOrders.filter(o => o.status === 'paid').length)} icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} />
                <StatCard label="Bekor qilinganlar" value={String(filteredOrders.filter(o => o.status === 'cancelled').length)} icon={<X className="w-5 h-5 text-red-400" />} />
              </div>
              <DataTable
                headers={['№', 'Sana', 'Stol / Manba', 'Holati', 'Summa']}
                rows={filteredOrders.slice().reverse().map(o => [
                  `#${formatOrderId(o.id)}`,
                  formatDate(o.createdAt),
                  `${getTableNumber(o.tableId)} (${o.waiterId ? employees.find(e => e.id === o.waiterId)?.fullName || 'Xodim' : 'Mijoz'})`,
                  o.status === 'paid' ? 'To\'langan' : o.status === 'cancelled' ? 'Bekor qilingan' : o.status,
                  formatCurrency(o.totalAmount)
                ])}
                emptyText="Tanlangan vaqt oralig'ida buyurtmalar topilmadi" />
            </div>
          )}

          {activeSection === 'otmenlar' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <StatCard label="Bekor qilinganlar" value={String(otmenlarData.cancelled.length)} icon={<X className="w-5 h-5 text-red-400" />} />
                <StatCard label="Yo'qotilgan summa" value={formatCurrency(otmenlarData.total)} icon={<TrendingUp className="w-5 h-5 text-red-400" />} highlight="red" />
              </div>
              <DataTable
                headers={['№', 'Stol', 'Sana', 'Summa', 'Ofitsiant']}
                rows={otmenlarData.cancelled.map(o => [
                  `#${formatOrderId(o.id)}`, o.tableId || 'S-oboy',
                  new Date(o.createdAt).toLocaleString('uz-UZ'),
                  formatCurrency(o.totalAmount),
                  employees.find(e => e.id === o.waiterId)?.fullName || 'Kassir'
                ])}
                emptyText="Bekor qilingan buyurtma yo'q" />
            </div>
          )}

          {activeSection === 'seyflar' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <StatCard label="Jami xarajatlar" value={formatCurrency(seyflarData.total)} icon={<Wallet className="w-5 h-5 text-orange-400" />} />
                <StatCard label="Yozuvlar soni" value={String(seyflarData.expenses.length)} icon={<Package className="w-5 h-5 text-slate-400" />} />
              </div>
              <DataTable
                headers={["Kategoriya", "Tavsif", "To'lov usuli", "Sana", "Summa"]}
                rows={seyflarData.expenses.map(e => [
                  e.category, e.description || '-', e.paymentMethod,
                  new Date(e.paymentDate).toLocaleDateString('uz-UZ'),
                  formatCurrency(e.amount)
                ])}
                emptyText="Xarajatlar yo'q" />
            </div>
          )}

          {activeSection === 'hisoblar' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <StatCard label="Jami tushum" value={formatCurrency(hisoblarData.income)} icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} />
                <StatCard label="Jami xarajat" value={formatCurrency(hisoblarData.expense)} icon={<X className="w-5 h-5 text-red-400" />} />
                <StatCard label="Sof foyda" value={formatCurrency(hisoblarData.net)} icon={<BarChart3 className="w-5 h-5 text-blue-400" />} highlight={hisoblarData.net >= 0 ? 'green' : 'red'} />
              </div>
              <div className="bg-[#2a3143] rounded-2xl border border-white/5 p-6 space-y-3">
                <h3 className="text-base font-bold text-white mb-4">Hisobot xulosa</h3>
                <SummaryRow label="Tushum (to'langan buyurtmalar)" value={formatCurrency(hisoblarData.income)} color="emerald" />
                <SummaryRow label="Xarajatlar" value={`-${formatCurrency(hisoblarData.expense)}`} color="red" />
                <div className="border-t border-white/10 pt-3">
                  <SummaryRow label="Sof foyda" value={formatCurrency(hisoblarData.net)} color={hisoblarData.net >= 0 ? 'emerald' : 'red'} bold />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'bronlar' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <StatCard label="Jami bronlar" value={String(bronlarData.reservations.length)} icon={<Clock className="w-5 h-5 text-pink-400" />} />
                <StatCard label="Kutilayotgan" value={String(bronlarData.reservations.filter((r: any) => r.status === 'upcoming').length)} icon={<Clock className="w-5 h-5 text-amber-400" />} />
                <StatCard label="Tasdiqlangan" value={String(bronlarData.reservations.filter((r: any) => r.status === 'confirmed').length)} icon={<Clock className="w-5 h-5 text-emerald-400" />} />
              </div>
              <DataTable
                headers={['Mijoz', 'Telefon', 'Sana', 'Vaqt', 'Mehmonlar', 'Holati']}
                rows={bronlarData.reservations.map((r: any) => [
                  r.name, r.phone, r.date, r.time, String(r.guests),
                  r.status === 'upcoming' ? 'Kutilmoqda' : r.status === 'confirmed' ? 'Tasdiqlangan' : 'Bekor qilingan'
                ])}
                emptyText="Bron yo'q" />
            </div>
          )}

          {activeSection === 'qqs' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <StatCard label="QQS stavkasi" value={`${qqsData.rate}%`} icon={<Percent className="w-5 h-5 text-blue-400" />} />
                <StatCard label="Soliq bazasi" value={formatCurrency(qqsData.base)} icon={<BarChart3 className="w-5 h-5 text-slate-400" />} />
                <StatCard label="To'lanadigan QQS" value={formatCurrency(qqsData.qqs)} icon={<Percent className="w-5 h-5 text-amber-400" />} highlight="amber" />
              </div>
              <div className="bg-[#2a3143] rounded-2xl border border-white/5 p-6 space-y-3">
                <h3 className="text-base font-bold text-white mb-4">QQS Hisob-kitobi</h3>
                <SummaryRow label="Jami savdo aylanmasi" value={formatCurrency(qqsData.base)} color="slate" />
                <SummaryRow label={`QQS (${qqsData.rate}%)`} value={formatCurrency(qqsData.qqs)} color="amber" />
                <div className="border-t border-white/10 pt-3">
                  <SummaryRow label="QQSsiz sof tushum" value={formatCurrency(qqsData.base - qqsData.qqs)} color="emerald" bold />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'kapital' && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <StatCard label="Jami daromad (barcha vaqt)" value={formatCurrency(kapitalData.gross)} icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} />
                <StatCard label="Jami xarajat (barcha vaqt)" value={formatCurrency(kapitalData.expenses)} icon={<X className="w-5 h-5 text-red-400" />} />
                <StatCard label="Sof kapital" value={formatCurrency(kapitalData.net)} icon={<BarChart3 className="w-5 h-5 text-blue-400" />} highlight={kapitalData.net >= 0 ? 'green' : 'red'} />
              </div>
              <div className="bg-[#2a3143] rounded-2xl border border-white/5 p-6 space-y-3">
                <h3 className="text-base font-bold text-white mb-4">Kapital balansi (umumiy)</h3>
                <SummaryRow label="Jami sotuvlardan tushum" value={formatCurrency(kapitalData.gross)} color="emerald" />
                <SummaryRow label="Jami xarajatlar" value={`-${formatCurrency(kapitalData.expenses)}`} color="red" />
                <div className="border-t border-white/10 pt-3">
                  <SummaryRow label="Sof kapital" value={formatCurrency(kapitalData.net)} color={kapitalData.net >= 0 ? 'emerald' : 'red'} bold />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
