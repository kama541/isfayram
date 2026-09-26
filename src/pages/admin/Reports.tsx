import { Search, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';

export const Reports = () => {
  const { menuItems, categories } = useStore();

  return (
    <div className="min-h-screen bg-[#222838] font-sans text-slate-300">
      
      {/* Top Navigation / Filters */}
      <div className="bg-[#2a3143] border-b border-white/5 p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-[#3b4358] rounded-xl overflow-hidden p-1">
            <button className="bg-white/10 text-white px-4 py-1.5 rounded-lg text-sm font-medium">Блюда</button>
            <button className="text-slate-400 hover:text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">Модификаторы</button>
            <button className="text-slate-400 hover:text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">Услуги</button>
          </div>
          
          <button className="bg-[#3b4358] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-[#434b61] transition-colors">
            Isfayram Kafe <ChevronDown className="w-4 h-4 opacity-50" />
          </button>
          
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Поиск" 
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
            Все официанты <ChevronDown className="w-4 h-4 opacity-50" />
          </button>
          <button className="bg-[#3b4358] text-slate-300 px-4 py-1.5 rounded-xl text-sm flex items-center gap-2 hover:text-white transition-colors">
            Все отделы <ChevronDown className="w-4 h-4 opacity-50" />
          </button>
          <button className="bg-[#3b4358] text-slate-300 px-4 py-1.5 rounded-xl text-sm flex items-center gap-2 hover:text-white transition-colors">
            Все категории <ChevronDown className="w-4 h-4 opacity-50" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Metric Cards */}
        <div className="flex gap-4 mb-6">
          <div className="bg-[#2a3143] border border-white/5 rounded-2xl p-5 min-w-[240px]">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
              <div className="w-4 h-4 rounded-sm border border-slate-400 flex items-center justify-center text-[10px]">-</div> Выручка
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">19 458 000 сум</div>
          </div>
          
          <div className="bg-[#2a3143] border border-white/5 rounded-2xl p-5 min-w-[200px]">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
              <div className="w-4 h-4 rounded-sm border border-slate-400 flex items-center justify-center text-[10px]">-</div> Продано блюд
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">36</div>
          </div>
          
          <div className="bg-[#2a3143] border border-white/5 rounded-2xl p-5 min-w-[200px]">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
              <div className="w-4 h-4 rounded-sm border border-slate-400 flex items-center justify-center text-[10px]">-</div> Всего единиц
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">829,45</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#2a3143] rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-4 px-6 font-medium text-slate-300">Блюдо</th>
                <th className="py-4 px-6 font-medium text-slate-300">Категория</th>
                <th className="py-4 px-6 font-medium text-slate-300">Отдел</th>
                <th className="py-4 px-6 font-medium text-slate-300">Кол-во</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-6 text-white font-medium uppercase text-xs">SAZAN 1kg</td>
                <td className="py-4 px-6 text-slate-400 uppercase text-xs">BALIQ TAOMLARI</td>
                <td className="py-4 px-6 text-slate-400">кухня</td>
                <td className="py-4 px-6 text-white font-medium">54,05</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors bg-[#32394a]/30">
                <td className="py-4 px-6 text-white font-medium uppercase text-xs">OQ BALIQ 1kg</td>
                <td className="py-4 px-6 text-slate-400 uppercase text-xs">BALIQ TAOMLARI</td>
                <td className="py-4 px-6 text-slate-400">кухня</td>
                <td className="py-4 px-6 text-white font-medium">74,7</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-6 text-white font-medium uppercase text-xs">ZOLOTAYA RIBKA 1kg</td>
                <td className="py-4 px-6 text-slate-400 uppercase text-xs">BALIQ TAOMLARI</td>
                <td className="py-4 px-6 text-slate-400">кухня</td>
                <td className="py-4 px-6 text-white font-medium">38</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors bg-[#32394a]/30">
                <td className="py-4 px-6 text-white font-medium uppercase text-xs">QIYMA SHASHLIK</td>
                <td className="py-4 px-6 text-slate-400 uppercase text-xs">KABOBLAR</td>
                <td className="py-4 px-6 text-slate-400">кухня</td>
                <td className="py-4 px-6 text-white font-medium">206</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-4 px-6 text-white font-medium uppercase text-xs">BUXARSKIY BALIQ PORCIYA</td>
                <td className="py-4 px-6 text-slate-400 uppercase text-xs">BALIQ TAOMLARI</td>
                <td className="py-4 px-6 text-slate-400">кухня</td>
                <td className="py-4 px-6 text-white font-medium">42</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors bg-[#32394a]/30">
                <td className="py-4 px-6 text-white font-medium uppercase text-xs">BUXARSKIY BALIQ 1kg</td>
                <td className="py-4 px-6 text-slate-400 uppercase text-xs">BALIQ TAOMLARI</td>
                <td className="py-4 px-6 text-slate-400">кухня</td>
                <td className="py-4 px-6 text-white font-medium">18</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
