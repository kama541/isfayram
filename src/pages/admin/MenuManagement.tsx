import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const MenuManagement = () => {
  const { menuItems, categories, deleteMenuItem } = useStore();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');

  const filteredItems = activeCategory ? menuItems.filter(m => m.categoryId === activeCategory) : menuItems;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Menyu Boshqaruvi</h1>
          <p className="text-slate-500 text-sm mt-1">Taomlar va toifalar ro'yxati</p>
        </div>
        <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm shadow-blue-600/20">
          <Plus className="w-4 h-4" /> Yangi Taom
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setActiveCategory('')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            !activeCategory 
              ? 'bg-slate-900 text-white shadow-md' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Barchasi
        </button>
        {categories.map(c => (
          <button 
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === c.id 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="relative h-48 w-full overflow-hidden bg-slate-100">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${item.isAvailable ? 'bg-white/90 text-emerald-600' : 'bg-white/90 text-red-600'}`}>
                  {item.isAvailable ? "Mavjud" : "Tugagan"}
                </span>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-slate-800 leading-tight">{item.name}</h3>
              </div>
              <p className="text-sm text-slate-500 mt-2 line-clamp-2 flex-1">{item.description}</p>
              
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
                <span className="font-bold text-lg text-slate-800 tracking-tight">{formatCurrency(item.price)}</span>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
