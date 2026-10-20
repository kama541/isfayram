import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatTableName } from '../../utils/format';
import { Plus, Minus, ShoppingCart, ChevronLeft, Send, Utensils, Lock, Search, Star, Zap, XCircle, X, LayoutGrid, Delete } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { notifyOrderCreated } from '../../utils/printReceipt';
import { getKitchenStationForOrderItem } from '../../utils/kitchenRouting';

export const NewOrder = () => {
  const { menuItems, categories, tables, orders, createOrder, addItemsToOrder, employees, kitchenStations } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table');
  
  const storedUser = localStorage.getItem('currentUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isCashier = currentUser?.role === 'cashier' || window.location.pathname.startsWith('/cashier');
  const adminUser = localStorage.getItem('adminUser');
  const actingWaiterId = localStorage.getItem('adminActingAsWaiter');
  const activeWaiterId = (adminUser && actingWaiterId) ? actingWaiterId : currentUser?.id;

  const handleQuickLock = () => {
    localStorage.removeItem('currentUser');
    navigate('/login', { replace: true });
  };

  const [activeMainTab, setActiveMainTab] = useState<'taomlar' | 'modifikatorlar' | 'xizmatlar'>('taomlar');
  const [filterMode, setFilterMode] = useState<'all' | 'popular' | 'go' | 'stop' | 'category'>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Table Picker Modal state
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Touch Numeric Keypad Modal state for weight (kg)
  const [weightModalItem, setWeightModalItem] = useState<{ id: string; name: string; price: number; initialWeight: number } | null>(null);
  const [weightInputStr, setWeightInputStr] = useState<string>('1.0');

  // Resolve tableParam to actual table UUID
  const resolvedTable = React.useMemo(() => {
    if (!tableParam) return null;
    return tables.find(t => 
      t.id === tableParam || 
      t.number === tableParam || 
      t.number === `${tableParam}-stol` || 
      t.number === `${tableParam}-kabina` || 
      t.number === `${tableParam}-kabinet` ||
      (t.number.replace(/\D/g, '') === tableParam.replace(/\D/g, '') && tableParam.replace(/\D/g, '').length > 0)
    ) || null;
  }, [tables, tableParam]);

  const [selectedTable, setSelectedTable] = useState(resolvedTable ? resolvedTable.id : (tableParam || ''));
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [cart, setCart] = useState<{id: string, quantity: number, price: number, weight?: number}[]>([]);

  React.useEffect(() => {
    if (resolvedTable && (!selectedTable || selectedTable === tableParam)) {
      setSelectedTable(resolvedTable.id);
    }
  }, [resolvedTable]);

  // Check if this table has an active order
  const activeOrder = selectedTable ? orders.find(o => o.tableId === selectedTable && o.status !== 'paid' && o.status !== 'cancelled') : null;

  React.useEffect(() => {
    if (activeOrder && !localStorage.getItem('adminUser') && currentUser?.role !== 'admin' && activeOrder.waiterId !== currentUser?.id && !isCashier) {
      const orderOwner = employees.find(e => e.id === activeOrder.waiterId);
      const ownerName = orderOwner ? orderOwner.fullName : 'boshqa ofitsiant';
      alert(`Siz bu stolga kirolmaysiz! Bu stol ${ownerName}ga tegishli.`);
      navigate('/waiter');
    }
  }, [activeOrder, currentUser, navigate, isCashier, employees]);

  const popularItems = React.useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      o.items.forEach(i => {
        counts[i.menuItemId] = (counts[i.menuItemId] || 0) + i.quantity;
      });
    });
    const sortedIds = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
      
    if (sortedIds.length === 0) return menuItems.slice(0, 8);
    return sortedIds.map(id => menuItems.find(m => m.id === id)).filter(Boolean).slice(0, 10) as typeof menuItems;
  }, [orders, menuItems]);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(c => {
      counts[c.id] = menuItems.filter(m => m.categoryId === c.id).length;
    });
    return counts;
  }, [categories, menuItems]);

  const popularCount = popularItems.length;
  const goCount = React.useMemo(() => menuItems.filter(m => m.isAvailable).length, [menuItems]);
  const stopCount = React.useMemo(() => menuItems.filter(m => !m.isAvailable).length, [menuItems]);

  const filteredItems = React.useMemo(() => {
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

  const currentSectionTitle = React.useMemo(() => {
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

  const checkIsKgItem = (item: any) => {
    return item.name.toLowerCase().includes('kg') || 
           item.name.toLowerCase().includes('1kg') ||
           item.name.toLowerCase().includes('sazan') ||
           item.name.toLowerCase().includes('baliq 1') ||
           categories.find(c => c.id === item.categoryId)?.name?.toLowerCase().includes('baliq');
  };

  const handleDishClick = (item: any) => {
    if (!item.isAvailable) return;
    if (checkIsKgItem(item)) {
      // Automatic touch numpad for weight!
      const existing = cart.find(c => c.id === item.id);
      setWeightInputStr(existing?.weight ? String(existing.weight) : '1.0');
      setWeightModalItem({
        id: item.id,
        name: item.name,
        price: item.price,
        initialWeight: existing?.weight || 1.0
      });
    } else {
      addToCart(item, 1);
    }
  };

  const addToCart = (item: any, amount: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + amount } : i);
      }
      return [...prev, { id: item.id, quantity: amount, price: item.price }];
    });
  };

  const removeFromCart = (id: string, amount: number = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > amount) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - amount } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const totalAmount = cart.reduce((sum, item) => {
    const menuItem = menuItems.find(m => m.id === item.id);
    const isBaliq = menuItem && checkIsKgItem(menuItem);
    const effectivePrice = isBaliq && item.weight ? Math.round(item.price * item.weight) : item.price * item.quantity;
    return sum + effectivePrice;
  }, 0);

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!selectedTable) return alert('Iltimos, stolni tanlang!');
    if (cart.length === 0) return alert('Buyurtma bo\'sh!');

    setIsSubmitting(true);
    try {
      const mappedItems = cart.map(i => {
        const menuItem = menuItems.find(m => m.id === i.id);
        const isBaliq = menuItem && checkIsKgItem(menuItem);
        const effectivePrice = isBaliq && i.weight ? Math.round(i.price * i.weight) : i.price;
        const label = isBaliq && i.weight ? `${menuItem?.name} (${i.weight} kg)` : undefined;
        return {
          id: `oi${Date.now()}${i.id}`,
          menuItemId: i.id,
          quantity: i.quantity,
          price: effectivePrice,
          note: label
        };
      });

      if (activeOrder) {
        await addItemsToOrder(activeOrder.id, mappedItems, totalAmount);
        notifyOrderCreated(activeOrder.id);
      } else {
        const createdOrder = await createOrder({
          tableId: selectedTable,
          waiterId: isCashier && selectedWaiter ? selectedWaiter : (activeWaiterId || currentUser?.id || undefined),
          status: 'pending',
          items: mappedItems,
          totalAmount
        });
        if (createdOrder?.id) {
          notifyOrderCreated(createdOrder.id);
        }
      }
      
      // DO NOT LOG OUT! Stay inside the panel as requested by user
      if (isCashier) {
        navigate('/cashier');
      } else {
        navigate('/waiter');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      alert('Xatolik yuz berdi: ' + (err.message || 'Buyurtma yuborilmadi'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTableNumber = (tId: string) => {
    if (tId === 'takeaway') return 'S-oboy';
    const t = tables.find(x => x.id === tId);
    return t ? formatTableName(t.number) : tId;
  };

  const groupedCart = cart.reduce((acc, item) => {
    const menuItem = menuItems.find(m => m.id === item.id);
    if (!menuItem) return acc;
    const station = getKitchenStationForOrderItem(item, menuItems, kitchenStations);
    const stationName = station ? station.name : 'Belgilanmagan';
    if (!acc[stationName]) acc[stationName] = [];
    acc[stationName].push({ ...item, name: menuItem.name });
    return acc;
  }, {} as Record<string, any[]>);

  // Numpad key press handler
  const handleNumpadKey = (key: string) => {
    if (key === 'C') {
      setWeightInputStr('0');
      return;
    }
    if (key === 'DEL') {
      if (weightInputStr.length <= 1) {
        setWeightInputStr('0');
      } else {
        setWeightInputStr(prev => prev.slice(0, -1));
      }
      return;
    }
    if (key === '.') {
      if (!weightInputStr.includes('.')) {
        setWeightInputStr(prev => prev + '.');
      }
      return;
    }
    if (weightInputStr === '0' || weightInputStr === '1.0') {
      setWeightInputStr(key);
    } else {
      setWeightInputStr(prev => prev + key);
    }
  };

  const handleConfirmWeight = () => {
    if (!weightModalItem) return;
    const w = parseFloat(weightInputStr);
    if (!w || w <= 0) {
      alert("Iltimos, to'g'ri vazn kiriting!");
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === weightModalItem.id);
      if (existing) {
        return prev.map(i => i.id === weightModalItem.id ? { ...i, quantity: 1, weight: w } : i);
      }
      return [...prev, { id: weightModalItem.id, quantity: 1, price: weightModalItem.price, weight: w }];
    });

    setWeightModalItem(null);
  };

  return (
    <>
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] font-sans print:hidden select-none" style={{ background: '#131920' }}>
      
      {/* LEFT: Menu & Dishes Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header & Search matching Photo 4 */}
        <div className="p-3 sm:p-4" style={{ background: '#182028', borderBottom: '1px solid #242D38' }}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <Link 
                to={isCashier ? "/cashier" : "/waiter"} 
                className="p-2.5 rounded-2xl transition-all hover:bg-white/10 active:scale-95 text-white border border-white/15" 
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase text-white">
                  {activeOrder ? `Buyurtmaga qo'shish: ${getTableNumber(selectedTable)}` : 'Menyu'}
                </h1>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-400">
                  {isCashier ? 'Kassa terminali' : `Ofitsiant: ${employees.find(e => e.id === activeWaiterId)?.fullName || 'O\'zingiz'}`}
                </p>
              </div>
            </div>

            {/* Quick Lock & Sub-tabs */}
            <div className="flex items-center gap-2">
              {!isCashier && (
                <button
                  type="button"
                  onClick={handleQuickLock}
                  className="px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 active:scale-95"
                  title="Ofitsiantni almashtirish / PIN ekrani"
                >
                  <Lock className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">Qulflash</span>
                </button>
              )}
              <div className="hidden sm:flex rounded-2xl overflow-hidden p-1 gap-1 bg-[#12171E] border border-white/10">
                {(['taomlar', 'modifikatorlar', 'xizmatlar'] as const).map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveMainTab(tab)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                      activeMainTab === tab
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search bar matching Photo 4 */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Taomlarni qidirish..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-sm font-semibold outline-none transition-all border border-slate-700/60 text-white placeholder-slate-400 focus:border-amber-400"
              style={{
                background: '#1F2732',
                color: '#FFFFFF',
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Top 3 Status Buttons (3 columns) EXACT MATCH Photo 4 */}
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            {/* Ommabop */}
            <button
              onClick={() => {
                setFilterMode(prev => prev === 'popular' ? 'all' : 'popular');
                setActiveCategory(null);
              }}
              className={`p-3 rounded-2xl flex flex-col justify-between text-left transition-all active:scale-[0.98] shadow-md border ${
                filterMode === 'popular' ? 'ring-2 ring-amber-300 scale-[1.01]' : 'hover:brightness-105'
              }`}
              style={{ background: '#F5B82E', borderColor: '#EAB308', minHeight: '66px' }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-amber-900 text-base font-black">★</span>
                <span className="text-xs sm:text-sm font-black text-slate-950">
                  {popularCount}
                </span>
              </div>
              <span className="font-black text-xs sm:text-sm text-slate-950 mt-1">
                Ommabop
              </span>
            </button>

            {/* Go ro'yxat */}
            <button
              onClick={() => {
                setFilterMode(prev => prev === 'go' ? 'all' : 'go');
                setActiveCategory(null);
              }}
              className={`p-3 rounded-2xl flex flex-col justify-between text-left transition-all active:scale-[0.98] shadow-md border ${
                filterMode === 'go' ? 'ring-2 ring-emerald-300 scale-[1.01]' : 'hover:brightness-105'
              }`}
              style={{ background: '#4ADE80', borderColor: '#22C55E', minHeight: '66px' }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">⚡</span>
                <span className="text-xs sm:text-sm font-black text-slate-950">
                  {goCount}
                </span>
              </div>
              <span className="font-black text-xs sm:text-sm text-slate-950 mt-1">
                Go ro'yxat
              </span>
            </button>

            {/* Stop ro'yxat */}
            <button
              onClick={() => {
                setFilterMode(prev => prev === 'stop' ? 'all' : 'stop');
                setActiveCategory(null);
              }}
              className={`p-3 rounded-2xl flex flex-col justify-between text-left transition-all active:scale-[0.98] shadow-md border ${
                filterMode === 'stop' ? 'ring-2 ring-rose-300 scale-[1.01]' : 'hover:brightness-105'
              }`}
              style={{ background: '#FB7185', borderColor: '#F43F5E', minHeight: '66px' }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="w-5 h-5 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs font-black">✕</span>
                <span className="text-xs sm:text-sm font-black text-slate-950">
                  {stopCount}
                </span>
              </div>
              <span className="font-black text-xs sm:text-sm text-slate-950 mt-1">
                Stop ro'yxat
              </span>
            </button>
          </div>

          {/* Categories Grid (EXACTLY 3 COLUMNS matching Photo 4: 2 rows inside each card) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {categories.map(c => {
              const isSelected = activeCategory === c.id;
              const count = categoryCounts[c.id] || 0;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setFilterMode('category');
                    setActiveCategory(isSelected ? null : c.id);
                  }}
                  className={`p-2.5 sm:p-3 rounded-2xl flex flex-col justify-between text-left transition-all active:scale-[0.98] shadow-md border ${
                    isSelected
                      ? 'ring-2 ring-amber-400 shadow-lg'
                      : 'hover:brightness-95'
                  }`}
                  style={{
                    background: isSelected ? '#0F172A' : '#EAEEF3',
                    color: isSelected ? '#FFFFFF' : '#0F172A',
                    borderColor: isSelected ? '#F59E0B' : '#D5DDE6',
                    minHeight: '62px'
                  }}
                >
                  {/* Top row: Dot on left, count on right */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-amber-400' : 'bg-slate-400'}`} />
                    <span className={`text-[11px] sm:text-xs font-black ${isSelected ? 'text-amber-400' : 'text-slate-600'}`}>
                      {count}
                    </span>
                  </div>

                  {/* Bottom row: Category Name in bold uppercase */}
                  <span className={`font-black text-[11px] sm:text-xs uppercase truncate tracking-tight mt-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dish Grid Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-hide" style={{ background: '#131920' }}>
          {/* Centered Category Divider matching Photo 4 */}
          <div className="flex items-center justify-center gap-3 my-2 mb-3.5">
            <div className="h-px bg-slate-700/60 flex-1 max-w-[200px]" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              {currentSectionTitle}
            </span>
            <div className="h-px bg-slate-700/60 flex-1 max-w-[200px]" />
          </div>

          {activeMainTab === 'taomlar' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
              {filteredItems.map(item => {
                const inCart = cart.find(c => c.id === item.id);
                const isKgItem = checkIsKgItem(item);
                return (
                  <div 
                    key={item.id} 
                    onClick={() => handleDishClick(item)}
                    className={`rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] select-none shadow-md border ${
                      inCart
                        ? 'ring-2 ring-amber-400 shadow-amber-500/20'
                        : 'hover:brightness-95'
                    } ${!item.isAvailable ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                    style={{
                      background: '#EAEEF3',
                      borderColor: inCart ? '#F59E0B' : '#D5DDE6',
                      minHeight: '86px',
                    }}
                  >
                    {/* Top: Dish Name matching Photo 1, 2, 4, 5 (Bold uppercase dark) */}
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="font-black text-slate-900 text-xs sm:text-sm leading-snug uppercase tracking-tight line-clamp-2" style={{ color: '#0F172A' }}>
                        {item.name}
                      </h3>
                      {inCart && (
                        <span className="shrink-0 px-2 py-0.5 rounded-lg text-xs font-black bg-slate-950 text-white shadow-sm">
                          {isKgItem && inCart.weight ? `${inCart.weight} kg` : `x${inCart.quantity}`}
                        </span>
                      )}
                    </div>

                    {/* Bottom: Price and Badges matching Photo 1, 2, 4, 5 */}
                    <div className="flex items-end justify-between mt-2 pt-1 border-t border-slate-300/60">
                      <span className="font-black text-slate-800 text-sm tracking-tight" style={{ color: '#1E293B' }}>
                        {item.price.toLocaleString('ru-RU').replace(/,/g, ' ')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Purple scale icon for weighing items */}
                        {isKgItem && (
                          <span 
                            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shadow-sm"
                            style={{ background: '#A855F7', color: '#FFFFFF' }}
                            title="Tarozi / kg"
                          >
                            ⚖
                          </span>
                        )}

                        {/* Stop badge matching Photo 1 & 2 */}
                        {!item.isAvailable && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-950 text-white flex items-center gap-0.5">
                            ✕ Stop
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="col-span-full py-20 text-center text-sm font-bold text-slate-500">
                  Hech qanday taom topilmadi
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-3 py-20 text-slate-500">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/5">
                <Utensils className="w-8 h-8 opacity-40 text-slate-400" />
              </div>
              <p className="text-sm font-bold">Hozircha {activeMainTab} kiritilmagan</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: High-contrast Sleek Dark Cart Panel matching POS */}
      <div 
        className="w-full lg:w-[420px] flex flex-col h-[45vh] lg:h-full z-10 shadow-2xl border-l border-slate-700/60" 
        style={{ background: '#182028' }}
      >
        {/* Table & Waiter Selectors */}
        <div className="p-4 sm:p-5 border-b border-slate-700/60" style={{ background: '#1D2631' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-lg flex items-center gap-2 uppercase tracking-wide text-white">
              <ShoppingCart className="w-5 h-5 text-amber-400" /> Joriy Buyurtma
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTableModalOpen(true)}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center gap-1 transition-colors"
                title="Stollar xaritasidan tanlash"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                <span>Xarita</span>
              </button>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-slate-300">
                {cart.length} xil taom
              </span>
            </div>
          </div>

          {/* Select table */}
          <select 
            value={selectedTable} 
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl text-base font-black outline-none cursor-pointer border border-slate-600 shadow-md transition-all focus:border-amber-400 text-white"
            style={{ background: '#25303D', color: '#FFFFFF' }}
          >
            <option value="" style={{ background: '#25303D', color: '#FFFFFF', fontWeight: 'bold' }}>
              Stolni tanlang (Yoki S-oboy)
            </option>
            <option value="takeaway" style={{ background: '#25303D', color: '#FFFFFF', fontWeight: 'bold' }}>
              🥡 S-oboy (Olib ketish)
            </option>
            {tables.filter(t => t.status === 'available' || t.id === selectedTable).map(t => (
              <option key={t.id} value={t.id} style={{ background: '#25303D', color: '#FFFFFF', fontWeight: 'bold' }}>
                {formatTableName(t.number)} {t.status === 'occupied' ? '(Qo\'shimcha)' : ''}
              </option>
            ))}
          </select>

          {isCashier && !activeOrder && (
            <div className="mt-3">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                Ofitsiantga biriktirish:
              </label>
              <select 
                value={selectedWaiter} 
                onChange={(e) => setSelectedWaiter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl text-sm font-bold outline-none border border-slate-600 text-white"
                style={{ background: '#25303D', color: '#FFFFFF' }}
              >
                <option value="" style={{ background: '#25303D', color: '#FFFFFF' }}>O'zim (Kassir)</option>
                {useStore.getState().employees.filter(e => e.role === 'waiter' && e.isActive).map(w => (
                  <option key={w.id} value={w.id} style={{ background: '#25303D', color: '#FFFFFF' }}>{w.fullName}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide" style={{ background: '#131920' }}>
          
          {/* Previous items if this is an existing order */}
          {activeOrder && activeOrder.items.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider mb-2 px-1 text-slate-400">
                Avval berilgan buyurtmalar
              </h3>
              <div className="space-y-2">
                {activeOrder.items.map(item => {
                  const menuItem = menuItems.find(m => m.id === item.menuItemId);
                  if (!menuItem) return null;
                  return (
                    <div 
                      key={item.id} 
                      className="flex justify-between items-center p-3 rounded-2xl border border-white/5 opacity-80"
                      style={{ background: '#1F2732' }}
                    >
                      <div className="flex-1 pr-3">
                        <h4 className="font-bold text-sm leading-tight text-white">{menuItem.name}</h4>
                        <p className="text-xs font-bold mt-0.5 text-amber-400">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <div className="px-3 py-1 rounded-xl font-black text-sm bg-white/10 text-white">
                        {item.quantity} ta
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* New Cart Items */}
          {(cart.length > 0 || activeOrder) && (
            <h3 className="text-xs font-extrabold uppercase tracking-wider mb-2 px-1 text-slate-400">
              {activeOrder ? "Yangi qo'shilayotganlar" : 'Tanlangan taomlar'}
            </h3>
          )}

          {cart.map(item => {
            const menuItem = menuItems.find(m => m.id === item.id);
            if (!menuItem) return null;
            const isBaliq = checkIsKgItem(menuItem);
            const effectiveTotal = isBaliq && item.weight ? Math.round(item.price * item.weight) : item.price * item.quantity;
            
            return (
              <div 
                key={item.id} 
                className="flex flex-col gap-2 p-3.5 rounded-2xl transition-all border border-slate-700/60 shadow-md"
                style={{ background: '#1E2733' }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-base leading-snug text-white">{menuItem.name}</h4>
                    <p className="text-sm font-black mt-1 text-amber-400">{formatCurrency(effectiveTotal)}</p>
                  </div>

                  {!isBaliq && (
                    <div className="flex items-center gap-1.5 rounded-2xl p-1 bg-[#131920] border border-white/10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFromCart(item.id, 1); }} 
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 active:scale-90" 
                        title="Kamaytirish"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="font-black text-base w-7 text-center text-white">
                        {item.quantity}
                      </span>

                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(menuItem, 0.5); }} 
                        className="px-2 h-8 text-xs font-black rounded-xl transition-all hover:bg-white/10 text-slate-300 border border-white/15 active:scale-90" 
                        title="Yarim porsiya qo'shish"
                      >
                        +0.5
                      </button>

                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(menuItem, 1); }} 
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-90 font-black" 
                        title="Bir porsiya qo'shish"
                      >
                        <Plus className="w-4 h-4 font-black" />
                      </button>
                    </div>
                  )}

                  {isBaliq && (
                    <div className="flex items-center gap-2">
                      {/* Tap to open Touch Numpad */}
                      <button
                        onClick={() => {
                          setWeightInputStr(item.weight ? String(item.weight) : '1.0');
                          setWeightModalItem({
                            id: menuItem.id,
                            name: menuItem.name,
                            price: menuItem.price,
                            initialWeight: item.weight || 1.0
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black text-xs flex items-center gap-1 hover:bg-purple-500/30 active:scale-95"
                        title="Vaznni o'zgartirish (Klaviatura)"
                      >
                        <span>⚖ {item.weight || 1.0} kg</span>
                      </button>

                      <button 
                        onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} 
                        className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/15 transition-colors"
                        title="O'chirish"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {cart.length === 0 && !activeOrder && (
            <div className="text-center mt-12 flex flex-col items-center text-slate-500">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-30 text-slate-500" />
              <p className="text-base font-bold text-slate-400">Savatcha bo'sh</p>
              <p className="text-xs mt-1 text-slate-500">Chap tomondagi taomlarni bosib tanlang</p>
            </div>
          )}
        </div>

        {/* Total & Submit Button Area */}
        <div className="p-4 sm:p-5 border-t border-slate-700/60" style={{ background: '#182028' }}>
          <div className="flex justify-between items-baseline mb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider block text-slate-400">
                Jami to'lov:
              </span>
              <span className="text-xs font-bold text-slate-500">
                {totalQuantity} dona taom
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={cart.length === 0 || !selectedTable || isSubmitting}
            className="w-full h-14 rounded-2xl font-black text-base uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-98 flex items-center justify-center gap-2 shadow-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer"
          >
            <Send className="w-5 h-5 font-black" />
            {isSubmitting ? 'Yuborilmoqda...' : (activeOrder ? 'Qo\'shimcha Qilish' : 'Oshxonaga Yuborish')}
          </button>
        </div>
      </div>
    </div>

    {/* TOUCH NUMPAD MODAL FOR WEIGHT (KG) INPUT */}
    {weightModalItem && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl border border-slate-200 flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                {weightModalItem.name}
              </h2>
              <p className="text-xs font-bold text-slate-500">
                1 kg narxi: {formatCurrency(weightModalItem.price)}
              </p>
            </div>
            <button 
              onClick={() => setWeightModalItem(null)} 
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Numeric Weight Display & Calculated Total */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Tarozi Vazni (kg):
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 my-1 font-mono">
              {weightInputStr} <span className="text-lg text-purple-600">kg</span>
            </div>
            <div className="text-sm font-black text-emerald-600">
              = {formatCurrency(Math.round(weightModalItem.price * (parseFloat(weightInputStr) || 0)))}
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {['0.5', '1.0', '1.5', '2.0', '2.5', '3.0'].map(preset => (
              <button
                key={preset}
                onClick={() => setWeightInputStr(preset)}
                className="py-2 rounded-xl text-xs font-black bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all active:scale-95"
              >
                {preset} kg
              </button>
            ))}
          </div>

          {/* Touch Numpad Grid */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'].map(btn => (
              <button
                key={btn}
                onClick={() => handleNumpadKey(btn)}
                className={`h-12 rounded-2xl font-black text-lg transition-all active:scale-90 flex items-center justify-center ${
                  btn === 'DEL' 
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                {btn === 'DEL' ? <Delete className="w-5 h-5" /> : btn}
              </button>
            ))}
          </div>

          {/* Modal Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setWeightModalItem(null)}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold transition-colors"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleConfirmWeight}
              className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-black transition-colors shadow-lg active:scale-95"
            >
              Qo'shish ({weightInputStr} kg)
            </button>
          </div>
        </div>
      </div>
    )}

    {/* VISUAL TABLE PICKER MODAL (Alternative to Select Dropdown) */}
    {isTableModalOpen && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#182028] rounded-3xl p-5 sm:p-6 w-full max-w-xl shadow-2xl border border-white/10 flex flex-col max-h-[85vh]">
          <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                Stolni Tanlang
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Bo'sh yoki o'zingizga tegishli stolni bosing
              </p>
            </div>
            <button 
              onClick={() => setIsTableModalOpen(false)} 
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-1">
            {/* Takeaway Option */}
            <div
              onClick={() => {
                setSelectedTable('takeaway');
                setIsTableModalOpen(false);
              }}
              className={`p-3 rounded-2xl border cursor-pointer transition-all active:scale-95 flex items-center justify-between ${
                selectedTable === 'takeaway'
                  ? 'bg-amber-500/20 text-white border-amber-400 ring-2 ring-amber-400/30'
                  : 'bg-[#241B12] hover:bg-[#2E2217] border-amber-500/30 text-amber-200'
              }`}
            >
              <span className="font-black text-sm">🥡 S-oboy (Olib ketish)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Tezkor
              </span>
            </div>

            {/* Grid of Tables (5 columns on desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {tables.map(t => {
                const isSelected = selectedTable === t.id;
                const isOccupied = t.status === 'occupied';
                const cleanTableNum = String(t.number || '').replace(/[^0-9]/g, '') || t.number;

                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTable(t.id);
                      setIsTableModalOpen(false);
                    }}
                    className={`h-[105px] rounded-2xl border text-left transition-all active:scale-95 shadow-sm flex flex-col justify-between p-2.5 cursor-pointer select-none ${
                      isSelected
                        ? 'ring-2 ring-amber-400 border-amber-400 shadow-amber-500/20 bg-[#1E293B]'
                        : isOccupied
                          ? 'bg-[#182029] border-slate-700/60 hover:border-slate-500'
                          : 'bg-[#0B2117] border-emerald-500/35 hover:border-emerald-400/60'
                    }`}
                  >
                    {/* Top: Status Badge */}
                    <div className="flex items-center justify-start w-full">
                      {isOccupied ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-tight bg-slate-700/40 text-slate-300 border border-slate-600/40">
                          Band
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-tight bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Bo‘sh
                        </span>
                      )}
                    </div>

                    {/* Center: Large Table Number */}
                    <div className="flex-1 flex items-center justify-center -mt-1">
                      <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
                        isSelected ? 'text-amber-300' : isOccupied ? 'text-slate-200' : 'text-white'
                      }`}>
                        {cleanTableNum}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* KITCHEN RECEIPTS FOR PRINTING */}
    <div className="hidden print:block font-mono text-black">
      {Object.entries(groupedCart).map(([catName, items], index) => (
        <div key={catName} className="w-[80mm] mx-auto">
          <div className="p-4" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="text-center font-bold text-2xl mb-1 uppercase border-b-2 border-black pb-2">{catName}</h2>
            <div className="text-center mb-4 mt-2">
              <p className="text-xl font-bold">Xona: {selectedTable ? getTableNumber(selectedTable) : '-'}</p>
              <p className="text-sm">Ofitsiant: {adminUser ? (employees.find((e: any) => e.id === activeWaiterId)?.fullName || 'Noma\'lum') : (currentUser?.fullName || 'Kassir')}</p>
              <p className="text-xs mt-1">{new Date().toLocaleString('uz-UZ')}</p>
            </div>
            <div className="border-t-2 border-black border-dashed pt-4 mb-4">
              {items.map((item: any, idx) => (
                <div key={idx} className="flex justify-between items-start mb-3 font-bold text-lg">
                  <span className="pr-4">{item.name}</span>
                  <span className="whitespace-nowrap border-l-2 pl-2 border-black">{item.quantity} ta</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs mt-8">--- ISFAYRAM Oshxona ---</p>
          </div>
          
          {index < Object.entries(groupedCart).length - 1 && (
            <div className="text-center w-full py-8">
              <p className="mb-8">.</p>
              <p className="border-b-2 border-dashed border-black"></p>
              <p className="text-xs mt-2">--- YIRTISH UCHUN (Qaychi) ---</p>
              <p className="mt-8">.</p>
            </div>
          )}
          
          {index === Object.entries(groupedCart).length - 1 && (
             <div className="h-16">.</div>
          )}
        </div>
      ))}
    </div>
    </>
  );
};
