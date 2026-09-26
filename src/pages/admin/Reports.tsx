import { Search, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';
import { useState, useMemo } from 'react';

export const Reports = () => {
  const { orders, menuItems, categories } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const reportData = useMemo(() => {
    const paidOrders = orders.filter(o => o.status === 'paid');
    const tushum = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    const dishStats = new Map<string, { id: string, name: string, category: string, quantity: number }>();
    
    let totalUnits = 0;
    
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        totalUnits += item.quantity;
        
        if (dishStats.has(item.menuItemId)) {
          dishStats.get(item.menuItemId)!.quantity += item.quantity;
        } else {
          const menuItem = menuItems.find(m => m.id === item.menuItemId);
          const category = categories.find(c => c.id === menuItem?.categoryId);
          dishStats.set(item.menuItemId, {
            id: item.menuItemId,
            name: menuItem?.name || 'Noma\'lum',
            category: category?.name || 'Noma\'lum',
            quantity: item.quantity
          });
        }
      });
    });

    const items = Array.from(dishStats.values())
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.quantity - a.quantity);

    return {
      tushum,
      sotilganTaomlar: items.length,
      totalUnits,
      items
    };
  }, [orders, menuItems, categories, searchTerm]);

  return (
    <div className="min-h-screen bg-[#222838] font-sans text-slate-300">
      
      {/* Top Navigation / Filters */}
      <div className="bg-[#2a3143] border-b border-white/5 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-[#3b4358] rounded-xl overflow-hidden p-1">
            <button className="bg-white/10 text-white px-4 py-1.5 rounded-lg text-sm font-medium">Taomlar</button>
            <button className="text-slate-400 hover:text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">Modifikatorlar</button>
            <button className="text-slate-400 hover:text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">Xizmatlar</button>
          </div>
          
          <button className="bg-[#3b4358] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-[#434b61] transition-colors">
            Isfayram Kafe <ChevronDown className="w-4 h-4 opacity-50" />
          </button>
          
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Qidiruv" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#3b4358] text-white px-10 py-2 rounded-xl text-sm outline-none focus:ring-1 focus:ring-white/20 placeholder-slate-400 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="bg-[#3b4358] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-[#434b61] transition-colors">
              26.09.2026 <CalendarIcon className="w-4 h-4 opacity-50" />
            </button>
            <span className="text-slate-500">-</span>
            <button className="bg-[#3b4358] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-[#434b61] transition-colors">
              26.09.2026 <CalendarIcon className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-[#3b4358] text-slate-300 px-4 py-1.5 rounded-xl text-sm flex items-center gap-2 hover:text-white transition-colors">
            Barcha ofitsiantlar <ChevronDown className="w-4 h-4 opacity-50" />
          </button>
          <button className="bg-[#3b4358] text-slate-300 px-4 py-1.5 rounded-xl text-sm flex items-center gap-2 hover:text-white transition-colors">
            Barcha bo'limlar <ChevronDown className="w-4 h-4 opacity-50" />
          </button>
          <button className="bg-[#3b4358] text-slate-300 px-4 py-1.5 rounded-xl text-sm flex items-center gap-2 hover:text-white transition-colors">
            Barcha kategoriyalar <ChevronDown className="w-4 h-4 opacity-50" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Metric Cards */}
        <div className="flex gap-4 mb-6">
          <div className="bg-[#2a3143] border border-white/5 rounded-2xl p-5 min-w-[240px]">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
              <div className="w-4 h-4 rounded-sm border border-slate-400 flex items-center justify-center text-[10px]">-</div> Tushum
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{formatCurrency(reportData.tushum)}</div>
          </div>
          
          <div className="bg-[#2a3143] border border-white/5 rounded-2xl p-5 min-w-[200px]">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
              <div className="w-4 h-4 rounded-sm border border-slate-400 flex items-center justify-center text-[10px]">-</div> Sotilgan taomlar turlari
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{reportData.sotilganTaomlar}</div>
          </div>
          
          <div className="bg-[#2a3143] border border-white/5 rounded-2xl p-5 min-w-[200px]">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
              <div className="w-4 h-4 rounded-sm border border-slate-400 flex items-center justify-center text-[10px]">-</div> Jami birliklar
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{reportData.totalUnits}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#2a3143] rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-4 px-6 font-medium text-slate-300">Taom</th>
                <th className="py-4 px-6 font-medium text-slate-300">Kategoriya</th>
                <th className="py-4 px-6 font-medium text-slate-300">Bo'lim</th>
                <th className="py-4 px-6 font-medium text-slate-300 text-right">Miqdori</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reportData.items.map((item, index) => (
                <tr key={item.id} className={`hover:bg-white/5 transition-colors ${index % 2 !== 0 ? 'bg-[#32394a]/30' : ''}`}>
                  <td className="py-4 px-6 text-white font-medium uppercase text-xs">{item.name}</td>
                  <td className="py-4 px-6 text-slate-400 uppercase text-xs">{item.category}</td>
                  <td className="py-4 px-6 text-slate-400">oshxona</td>
                  <td className="py-4 px-6 text-white font-medium text-right">{item.quantity}</td>
                </tr>
              ))}
              {reportData.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    Ma'lumot topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
