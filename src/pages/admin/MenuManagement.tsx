import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Edit2, Trash2, Search, Star, Zap, XCircle, X } from 'lucide-react';
import type { MenuItem } from '../../types';

export const MenuManagement = () => {
  const { menuItems, categories, kitchenStations, deleteMenuItem, addMenuItem, updateMenuItem, updateMenuItemAvailability } = useStore();
  
  const [filterMode, setFilterMode] = useState<'all' | 'popular' | 'go' | 'stop' | 'category'>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    categoryId: categories[0]?.id || '',
    isAvailable: true,
    kitchenStationId: '',
  });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const storedUser = localStorage.getItem('currentUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const adminUser = localStorage.getItem('adminUser');
  const hasManagePermission = currentUser?.role === 'admin' || currentUser?.role === 'cashier' || !!adminUser;

  // Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(c => {
      counts[c.id] = menuItems.filter(m => m.categoryId === c.id).length;
    });
    return counts;
  }, [categories, menuItems]);

  const popularItems = useMemo(() => {
    return menuItems.slice(0, 15);
  }, [menuItems]);

  const popularCount = popularItems.length;
  const goCount = useMemo(() => menuItems.filter(m => m.isAvailable).length, [menuItems]);
  const stopCount = useMemo(() => menuItems.filter(m => !m.isAvailable).length, [menuItems]);

  const filteredItems = useMemo(() => {
    let items = menuItems;
    if (filterMode === 'popular') {
      items = popularItems;
    } else if (filterMode === 'go') {
      items = menuItems.filter(m => m.isAvailable);
    } else if (filterMode === 'stop') {
      items = menuItems.filter(m => !m.isAvailable);
    } else if (activeCategory) {
      items = menuItems.filter(m => m.categoryId === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(m => m.name.toLowerCase().includes(q));
    }
    return items;
  }, [menuItems, popularItems, filterMode, activeCategory, searchQuery]);

  const currentSectionTitle = useMemo(() => {
    if (searchQuery.trim()) return `Qidiruv natijalari: "${searchQuery}"`;
    if (filterMode === 'popular') return 'Ommabop taomlar';
    if (filterMode === 'go') return "Go ro'yxat (Mavjud taomlar)";
    if (filterMode === 'stop') return "Stop ro'yxat (Tugagan taomlar)";
    if (activeCategory) {
      const cat = categories.find(c => c.id === activeCategory);
      return cat ? cat.name.toUpperCase() : 'Barcha taomlar';
    }
    return 'Barcha taomlar';
  }, [filterMode, activeCategory, searchQuery, categories]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasManagePermission) return;
    if (!newItem.name || !newItem.categoryId || !newItem.price) return;
    
    if (editingItem) {
      await updateMenuItem({
        ...editingItem,
        name: newItem.name!,
        description: newItem.description || '',
        price: Number(newItem.price),
        categoryId: newItem.categoryId!,
        isAvailable: newItem.isAvailable ?? true,
        kitchenStationId: newItem.kitchenStationId
      });
    } else {
      await addMenuItem({
        id: crypto.randomUUID(),
        name: newItem.name,
        description: newItem.description || '',
        price: Number(newItem.price),
        categoryId: newItem.categoryId,
        isAvailable: newItem.isAvailable ?? true,
        image: '',
        kitchenStationId: newItem.kitchenStationId
      });
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
    setNewItem({
      name: '',
      description: '',
      price: 0,
      categoryId: categories[0]?.id || '',
      isAvailable: true,
      kitchenStationId: '',
    });
  };

  const toggleAvailability = async (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasManagePermission) return;
    await updateMenuItemAvailability(item.id, !item.isAvailable);
  };

  const openModal = (item?: MenuItem) => {
    if (!hasManagePermission) return;
    if (item) {
      setEditingItem(item);
      setNewItem({
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: item.categoryId,
        isAvailable: item.isAvailable,
        kitchenStationId: item.kitchenStationId || '',
      });
    } else {
      setEditingItem(null);
      setNewItem({
        name: '',
        description: '',
        price: 0,
        categoryId: categories[0]?.id || '',
        isAvailable: true,
        kitchenStationId: '',
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-4 max-w-[1600px] mx-auto select-none font-sans" style={{ background: '#F8FAFC', minHeight: '100%' }}>
      {/* Search Bar matching Photo 4 Top */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Taomlarni qidirish..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 font-semibold outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 shadow-sm transition-all text-sm sm:text-base"
          style={{ background: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1' }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Header: Menyu title + Admin controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            Menyu
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">Barcha taomlar va toifalar</p>
        </div>

        {hasManagePermission && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-300 shadow-sm"
              style={{ background: '#FFFFFF', color: '#334155' }}
            >
              <Plus className="w-4 h-4" /> Kategoriya qo'shish
            </button>
            <button 
              onClick={() => openModal()}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              style={{ background: '#0F172A', color: '#FFFFFF' }}
            >
              <Plus className="w-4 h-4" /> Yangi Taom
            </button>
          </div>
        )}
      </div>

      {/* Top 3 Status Buttons matching Photo 4 (3 Columns) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Ommabop */}
        <button
          onClick={() => {
            setFilterMode(prev => prev === 'popular' ? 'all' : 'popular');
            setActiveCategory(null);
          }}
          className={`p-2.5 rounded-lg flex flex-col justify-between text-left transition-all active:scale-[0.98] border ${
            filterMode === 'popular' ? 'ring-2 ring-amber-300' : 'hover:brightness-105'
          }`}
          style={{ background: '#F5B82E', borderColor: '#D99B1A', height: '54px' }}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-amber-950 text-xs font-black">★</span>
            <span className="text-xs font-black text-slate-950">
              {popularCount}
            </span>
          </div>
          <span className="font-extrabold text-xs text-slate-950 leading-none">
            Ommabop
          </span>
        </button>

        {/* Go ro'yxat */}
        <button
          onClick={() => {
            setFilterMode(prev => prev === 'go' ? 'all' : 'go');
            setActiveCategory(null);
          }}
          className={`p-2.5 rounded-lg flex flex-col justify-between text-left transition-all active:scale-[0.98] border ${
            filterMode === 'go' ? 'ring-2 ring-emerald-300' : 'hover:brightness-105'
          }`}
          style={{ background: '#4ADE80', borderColor: '#22C55E', height: '54px' }}
        >
          <div className="flex items-center justify-between w-full">
            <span className="w-4 h-4 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold">⚡</span>
            <span className="text-xs font-black text-slate-950">
              {goCount}
            </span>
          </div>
          <span className="font-extrabold text-xs text-slate-950 leading-none">
            Go ro'yxat
          </span>
        </button>

        {/* Stop ro'yxat */}
        <button
          onClick={() => {
            setFilterMode(prev => prev === 'stop' ? 'all' : 'stop');
            setActiveCategory(null);
          }}
          className={`p-2.5 rounded-lg flex flex-col justify-between text-left transition-all active:scale-[0.98] border ${
            filterMode === 'stop' ? 'ring-2 ring-rose-300' : 'hover:brightness-105'
          }`}
          style={{ background: '#FB7185', borderColor: '#F43F5E', height: '54px' }}
        >
          <div className="flex items-center justify-between w-full">
            <span className="w-4 h-4 rounded-full bg-rose-800 text-white flex items-center justify-center text-[10px] font-black">✕</span>
            <span className="text-xs font-black text-slate-950">
              {stopCount}
            </span>
          </div>
          <span className="font-extrabold text-xs text-slate-950 leading-none">
            Stop ro'yxat
          </span>
        </button>
      </div>

      {/* Categories Grid (EXACTLY 3 COLUMNS matching Photo 4: 2 rows inside each card) */}
      <div className="grid grid-cols-3 gap-2">
        {categories.map(c => {
          const isSelected = activeCategory === c.id;
          const count = categoryCounts[c.id] || 0;
          return (
            <div
              key={c.id}
              onClick={() => {
                setFilterMode('category');
                setActiveCategory(isSelected ? null : c.id);
              }}
              className={`p-2 rounded-lg flex flex-col justify-between text-left transition-all cursor-pointer active:scale-[0.98] border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20 shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
              style={{
                background: isSelected ? '#0F172A' : '#EAEEF3',
                color: isSelected ? '#FFFFFF' : '#0F172A',
                borderColor: isSelected ? '#0F172A' : '#D0D7E1',
                height: '50px'
              }}
            >
              {/* Top row: Dot on left, count + trash on right */}
              <div className="flex items-center justify-between w-full leading-none">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-amber-400' : 'bg-slate-400'}`} />
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <span className={`text-[10px] sm:text-[11px] font-extrabold ${isSelected ? 'text-amber-400' : 'text-slate-600'}`}>
                    {count}
                  </span>
                  {hasManagePermission && (
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        if(window.confirm(`Haqiqatan ham "${c.name}" kategoriyasini o'chirmoqchimisiz?`)) {
                          useStore.getState().deleteCategory(c.id);
                          if (activeCategory === c.id) setActiveCategory(null);
                        }
                      }}
                      className={`p-0.5 rounded transition-colors ${isSelected ? 'hover:bg-white/10 text-rose-300' : 'hover:bg-rose-50 text-rose-500'}`}
                      title="Kategoriyani o'chirish"
                    >
                      <Trash2 className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom row: Category Name in bold uppercase */}
              <span className={`font-black text-[11px] uppercase truncate tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                {c.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Centered Category Divider matching Photo 4 */}
      <div className="flex items-center justify-center gap-3 my-2">
        <div className="h-px bg-slate-200 flex-1 max-w-[200px]" />
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
          {currentSectionTitle}
        </span>
        <div className="h-px bg-slate-200 flex-1 max-w-[200px]" />
      </div>

      {/* Dish Cards Grid (EXACTLY 3 COLUMNS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {filteredItems.map(item => {
          const isKgItem = item.name.toLowerCase().includes('kg') || 
                           item.name.toLowerCase().includes('1kg') ||
                           item.name.toLowerCase().includes('sazan') ||
                           item.name.toLowerCase().includes('baliq 1');
          return (
            <div 
              key={item.id} 
              onClick={() => hasManagePermission && openModal(item)}
              className={`rounded-lg p-2.5 flex flex-col justify-between transition-all select-none border cursor-pointer ${
                !item.isAvailable ? 'opacity-50 bg-slate-100 border-slate-200' : 'bg-white hover:border-slate-400 border-slate-200'
              }`}
              style={{
                background: item.isAvailable ? '#EAEEF3' : '#F1F5F9',
                borderColor: '#D0D7E1',
                height: '72px',
              }}
            >
              {/* Top: Dish Name in BOLD UPPERCASE BLACK matching Photos 1, 2, 3, 5 */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-black text-slate-900 text-xs sm:text-sm leading-snug uppercase tracking-tight line-clamp-2" style={{ color: '#0F172A' }}>
                  {item.name}
                </h3>

                {hasManagePermission && (
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={(e) => toggleAvailability(item, e)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-600 text-white hover:bg-rose-700'
                      }`}
                      title="Holatni o'zgartirish"
                    >
                      {item.isAvailable ? 'Go' : 'Stop'}
                    </button>
                    <button 
                      onClick={() => openModal(item)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom: Price and Scale/Stop Badges matching Photos */}
              <div className="flex items-end justify-between mt-2 pt-1 border-t border-slate-100">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight" style={{ color: '#0F172A' }}>
                  {item.price.toLocaleString('ru-RU').replace(/,/g, ' ')}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Purple scale icon for weighing items matching Photo 1, 2, 5 */}
                  {isKgItem && (
                    <span 
                      className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shadow-sm"
                      style={{ background: '#A855F7', color: '#FFFFFF' }}
                      title="Tarozi / kg"
                    >
                      ⚖
                    </span>
                  )}

                  {/* Stop badge matching Photos */}
                  {!item.isAvailable && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-700 text-white flex items-center gap-0.5">
                      ✕ Stop
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center text-base font-bold text-slate-400">
            Hech qanday taom topilmadi
          </div>
        )}
      </div>

      {/* Edit/Add Dish Modal */}
      {isModalOpen && hasManagePermission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{editingItem ? 'Taomni tahrirlash' : 'Yangi taom qo\'shish'}</h2>
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Qaysi oshxona xonasiga yuboriladi?</label>
                <select 
                  value={newItem.kitchenStationId || ''} 
                  onChange={e => setNewItem({...newItem, kitchenStationId: e.target.value})} 
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  required
                >
                  <option value="" disabled>Xonani tanlang...</option>
                  {(kitchenStations.filter(k => k.isActive).length > 0 ? kitchenStations.filter(k => k.isActive) : [
                    { id: '525ef16d-b118-4942-8617-41a90b39e64d', name: '🔥 Shashlik Room' },
                    { id: '16b9952b-1b9e-40f1-871f-2179ff167d3f', name: '🐟 Fish Room' },
                    { id: 'cd884f76-4022-4ae0-863e-a6f4405fae61', name: '🫓 Tandir' },
                    { id: '4b29fc40-ca47-1067-b31d-00dd010662db', name: '🥤 Bar' }
                  ]).map(k => (
                    <option key={k.id} value={k.id}>{k.name}</option>
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
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && hasManagePermission && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Yangi kategoriya qo'shish</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newCategoryName.trim()) {
                useStore.getState().addCategory({
                  id: crypto.randomUUID(),
                  name: newCategoryName.trim(),
                });
                setNewCategoryName('');
                setIsCategoryModalOpen(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategoriya nomi</label>
                <input 
                  type="text" 
                  value={newCategoryName} 
                  onChange={e => setNewCategoryName(e.target.value)} 
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  required 
                  autoFocus
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
