import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { MenuItem } from '../../types';

export const MenuManagement = () => {
  const { menuItems, categories, deleteMenuItem, addMenuItem } = useStore();
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    categoryId: categories[0]?.id || '',
    isAvailable: true,
  });

  const filteredItems = activeCategory ? menuItems.filter(m => m.categoryId === activeCategory) : menuItems;

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.categoryId || !newItem.price) return;
    
    await addMenuItem({
      id: crypto.randomUUID(),
      name: newItem.name,
      description: newItem.description || '',
      price: Number(newItem.price),
      categoryId: newItem.categoryId,
      isAvailable: newItem.isAvailable ?? true,
      image: '',
    });
    
    setIsModalOpen(false);
    setNewItem({
      name: '',
      description: '',
      price: 0,
      categoryId: categories[0]?.id || '',
      isAvailable: true,
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Menyu Boshqaruvi</h1>
          <p className="text-slate-500 text-sm mt-1">Taomlar va toifalar ro'yxati</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Yangi Taom
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setActiveCategory('')}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
            !activeCategory 
              ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
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
                ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col relative">
            <div className="absolute top-3 right-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm border ${item.isAvailable ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'}`}>
                {item.isAvailable ? "Mavjud" : "Tugagan"}
              </span>
            </div>
            
            <div className="p-5 flex flex-col flex-1 pt-12">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{item.name}</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 flex-1">{item.description}</p>
              
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <span className="font-bold text-lg text-slate-800 dark:text-slate-200 tracking-tight">{formatCurrency(item.price)}</span>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Yangi taom qo'shish</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Taom nomi</label>
                <input 
                  type="text" 
                  value={newItem.name} 
                  onChange={e => setNewItem({...newItem, name: e.target.value})} 
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Toifa</label>
                <select 
                  value={newItem.categoryId} 
                  onChange={e => setNewItem({...newItem, categoryId: e.target.value})} 
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  required
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Narxi (so'm)</label>
                <input 
                  type="number" 
                  min="0"
                  value={newItem.price || ''} 
                  onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} 
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tarkibi / Ta'rifi</label>
                <textarea 
                  value={newItem.description} 
                  onChange={e => setNewItem({...newItem, description: e.target.value})} 
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
