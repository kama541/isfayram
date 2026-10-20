import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatTableName } from '../../utils/format';
import { Plus, Minus, ShoppingCart, ChevronLeft, Send, Utensils, Lock, Search, Star, Zap, XCircle, X } from 'lucide-react';
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
    const isBaliq = menuItem && categories.find(c => c.id === menuItem.categoryId)?.name?.toLowerCase().includes('baliq');
    const effectivePrice = isBaliq && item.weight ? Math.round(item.price * item.weight) : item.price * item.quantity;
    return sum + effectivePrice;
  }, 0);

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!selectedTable) return alert('Xonani tanlang!');
    if (cart.length === 0) return alert('Buyurtma bo\'sh!');

    setIsSubmitting(true);
    try {
      const mappedItems = cart.map(i => {
        const menuItem = menuItems.find(m => m.id === i.id);
        const isBaliq = menuItem && categories.find(c => c.id === menuItem.categoryId)?.name?.toLowerCase().includes('baliq');
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
      
      if (!isCashier) {
        // Shared waiter terminal: immediately clear session and return to PIN screen for next waiter!
        localStorage.removeItem('currentUser');
        navigate('/login', { replace: true });
      } else {
        navigate(-1);
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

  return (
    <>
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] font-sans print:hidden select-none" style={{ background: '#F8FAFC' }}>
      
      {/* LEFT: Menu & Dishes Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header & Search */}
        <div className="p-3 sm:p-4" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <Link 
                to={isCashier ? "/cashier" : "/waiter"} 
                className="p-2.5 rounded-xl transition-all hover:bg-slate-100 active:scale-95 text-slate-800 border border-slate-200" 
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight uppercase text-slate-900">
                  {activeOrder ? `Buyurtmaga qo'shish: ${getTableNumber(selectedTable)}` : 'Menyu'}
                </h1>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500">
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
                  className="px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 active:scale-95"
                  title="Ofitsiantni almashtirish / PIN ekrani"
                >
                  <Lock className="w-3.5 h-3.5 text-red-600" />
                  <span className="hidden sm:inline">Qulflash</span>
                </button>
              )}
              <div className="hidden sm:flex rounded-xl overflow-hidden p-1 gap-1 bg-slate-100 border border-slate-200">
                {(['taomlar', 'modifikatorlar', 'xizmatlar'] as const).map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveMainTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                      activeMainTab === tab
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search bar matching photo */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Taomlarni qidirish..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-sm font-semibold outline-none transition-all border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-800"
              style={{
                background: '#FFFFFF',
                color: '#0F172A',
                borderColor: '#CBD5E1',
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Top 3 Status Buttons (3 columns) matching Photo 4 */}
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            {/* Ommabop */}
            <button
              onClick={() => {
                setFilterMode(prev => prev === 'popular' ? 'all' : 'popular');
                setActiveCategory(null);
              }}
              className={`p-2.5 sm:p-3 rounded-2xl flex flex-col justify-between text-left transition-all active:scale-[0.98] shadow-sm border ${
                filterMode === 'popular' ? 'ring-2 ring-amber-500 shadow-md' : 'hover:brightness-95'
              }`}
              style={{ background: '#FACC15', borderColor: '#EAB308', minHeight: '64px' }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-amber-800 text-sm font-black">★</span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-black/10 text-slate-950">
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
              className={`p-2.5 sm:p-3 rounded-2xl flex flex-col justify-between text-left transition-all active:scale-[0.98] shadow-sm border ${
                filterMode === 'go' ? 'ring-2 ring-emerald-600 shadow-md' : 'hover:brightness-95'
              }`}
              style={{ background: '#4ADE80', borderColor: '#22C55E', minHeight: '64px' }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">⚡</span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-black/10 text-slate-950">
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
              className={`p-2.5 sm:p-3 rounded-2xl flex flex-col justify-between text-left transition-all active:scale-[0.98] shadow-sm border ${
                filterMode === 'stop' ? 'ring-2 ring-rose-600 shadow-md' : 'hover:brightness-95'
              }`}
              style={{ background: '#FB7185', borderColor: '#F43F5E', minHeight: '64px' }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="w-4 h-4 rounded-full bg-rose-700 text-white flex items-center justify-center text-[10px] font-black">✕</span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-black/10 text-slate-950">
                  {stopCount}
                </span>
              </div>
              <span className="font-black text-xs sm:text-sm text-slate-950 mt-1">
                Stop ro'yxat
              </span>
            </button>
          </div>

          {/* Categories Grid (3 columns matching Photo 4) */}
          <div className="grid grid-cols-3 gap-2">
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
                  className={`p-2 sm:p-2.5 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.98] shadow-sm border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                  style={{
                    background: isSelected ? '#0F172A' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#0F172A',
                    borderColor: isSelected ? '#0F172A' : '#E2E8F0',
                    minHeight: '46px'
                  }}
                >
                  <span className="font-black text-[11px] sm:text-xs uppercase truncate flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-amber-400' : 'bg-slate-400'}`} />
                    <span className="truncate">{c.name}</span>
                  </span>
                  <span className={`text-[11px] font-black shrink-0 ml-1 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dish Grid Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-hide" style={{ background: '#F8FAFC' }}>
          {/* Centered Category Divider matching Photo 4 */}
          <div className="flex items-center justify-center gap-3 my-2 mb-3.5">
            <div className="h-px bg-slate-200 flex-1 max-w-[160px]" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              {currentSectionTitle}
            </span>
            <div className="h-px bg-slate-200 flex-1 max-w-[160px]" />
          </div>

          {activeMainTab === 'taomlar' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
              {filteredItems.map(item => {
                const inCart = cart.find(c => c.id === item.id);
                const isKgItem = item.name.toLowerCase().includes('kg') || 
                                 item.name.toLowerCase().includes('1kg') ||
                                 item.name.toLowerCase().includes('sazan') ||
                                 item.name.toLowerCase().includes('baliq 1');
                return (
                  <div 
                    key={item.id} 
                    onClick={() => item.isAvailable && addToCart(item)}
                    className={`rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] select-none shadow-sm hover:shadow-md border ${
                      inCart
                        ? 'border-slate-900 ring-2 ring-slate-900/30 shadow-md'
                        : 'border-slate-200 hover:border-slate-400'
                    } ${!item.isAvailable ? 'opacity-50 grayscale cursor-not-allowed bg-slate-100' : 'bg-white'}`}
                    style={{
                      background: item.isAvailable ? '#FFFFFF' : '#F1F5F9',
                      borderColor: inCart ? '#0F172A' : '#E2E8F0',
                      minHeight: '88px',
                    }}
                  >
                    {/* Top: Dish Name matching photo (Bold uppercase dark) */}
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="font-black text-slate-900 text-xs sm:text-sm leading-snug uppercase tracking-tight line-clamp-2" style={{ color: '#0F172A' }}>
                        {item.name}
                      </h3>
                      {inCart && (
                        <span className="shrink-0 px-2 py-0.5 rounded-lg text-xs font-black bg-slate-900 text-white shadow-sm">
                          x{inCart.quantity}
                        </span>
                      )}
                    </div>

                    {/* Bottom: Price and Badges matching photo */}
                    <div className="flex items-end justify-between mt-2 pt-1 border-t border-slate-100">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm tracking-tight" style={{ color: '#0F172A' }}>
                        {item.price.toLocaleString('ru-RU').replace(/,/g, ' ')}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Purple scale icon for weighing items */}
                        {isKgItem && (
                          <span 
                            className="w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold shadow-sm"
                            style={{ background: '#A855F7', color: '#FFFFFF' }}
                            title="Tarozi / kg"
                          >
                            ⚖
                          </span>
                        )}

                        {/* Stop badge matching photo */}
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
                <div className="col-span-full py-16 text-center text-sm font-bold text-slate-400">
                  Hech qanday taom topilmadi
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-3 py-16 text-slate-400">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-100">
                <Utensils className="w-8 h-8 opacity-40 text-slate-500" />
              </div>
              <p className="text-sm font-bold">Hozircha {activeMainTab} kiritilmagan</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: High-contrast Clean Light Cart Panel */}
      <div 
        className="w-full lg:w-[420px] flex flex-col h-[45vh] lg:h-full z-10 shadow-xl border-l border-slate-200" 
        style={{ background: '#FFFFFF' }}
      >
        {/* Table & Waiter Selectors */}
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-lg flex items-center gap-2 uppercase tracking-wide text-slate-900">
              <ShoppingCart className="w-5 h-5 text-slate-700" /> Joriy Buyurtma
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
              {cart.length} xil taom
            </span>
          </div>

          <select 
            value={selectedTable} 
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl text-base font-bold outline-none cursor-pointer bg-slate-50 border border-slate-300 text-slate-900"
          >
            <option value="">Stolni tanlang (Yoki S-oboy)</option>
            <option value="takeaway">🥡 S-oboy (Olib ketish)</option>
            {tables.filter(t => t.status === 'available' || t.id === selectedTable).map(t => (
              <option key={t.id} value={t.id}>
                {formatTableName(t.number)} {t.status === 'occupied' ? '(Qo\'shimcha)' : ''}
              </option>
            ))}
          </select>

          {isCashier && !activeOrder && (
            <div className="mt-3">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-500">
                Ofitsiantga biriktirish:
              </label>
              <select 
                value={selectedWaiter} 
                onChange={(e) => setSelectedWaiter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl text-sm font-bold outline-none bg-slate-50 border border-slate-300 text-slate-900"
              >
                <option value="">O'zim (Kassir)</option>
                {useStore.getState().employees.filter(e => e.role === 'waiter' && e.isActive).map(w => (
                  <option key={w.id} value={w.id}>{w.fullName}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-slate-50/60">
          
          {/* Previous items if this is an existing order */}
          {activeOrder && activeOrder.items.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider mb-2 px-1 text-slate-500">
                Avval berilgan buyurtmalar
              </h3>
              <div className="space-y-2">
                {activeOrder.items.map(item => {
                  const menuItem = menuItems.find(m => m.id === item.menuItemId);
                  if (!menuItem) return null;
                  return (
                    <div 
                      key={item.id} 
                      className="flex justify-between items-center p-3 rounded-2xl bg-white border border-slate-200 opacity-80"
                    >
                      <div className="flex-1 pr-3">
                        <h4 className="font-bold text-sm leading-tight text-slate-800">{menuItem.name}</h4>
                        <p className="text-xs font-bold mt-0.5 text-slate-500">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <div className="px-3 py-1 rounded-xl font-black text-sm bg-slate-100 text-slate-800">
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
            <h3 className="text-xs font-extrabold uppercase tracking-wider mb-2 px-1 text-slate-700">
              {activeOrder ? "Yangi qo'shilayotganlar" : 'Tanlangan taomlar'}
            </h3>
          )}

          {cart.map(item => {
            const menuItem = menuItems.find(m => m.id === item.id);
            if (!menuItem) return null;
            const isBaliq = categories.find(c => c.id === menuItem.categoryId)?.name?.toLowerCase().includes('baliq');
            const effectiveTotal = isBaliq && item.weight ? Math.round(item.price * item.weight) : item.price * item.quantity;
            
            return (
              <div 
                key={item.id} 
                className="flex flex-col gap-2 p-3.5 rounded-2xl transition-all bg-white border border-slate-200 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-base leading-snug text-slate-900">{menuItem.name}</h4>
                    <p className="text-sm font-black mt-1 text-slate-700">{formatCurrency(effectiveTotal)}</p>
                  </div>

                  {!isBaliq && (
                    <div className="flex items-center gap-1.5 rounded-2xl p-1 bg-slate-100 border border-slate-200">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFromCart(item.id, 1); }} 
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-rose-100 hover:text-rose-600 text-slate-700 active:scale-90" 
                        title="Kamaytirish"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="font-black text-base w-7 text-center text-slate-900">
                        {item.quantity}
                      </span>

                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(menuItem, 0.5); }} 
                        className="px-2 h-8 text-xs font-black rounded-xl transition-all hover:bg-slate-200 text-slate-700 border border-slate-300 active:scale-90" 
                        title="Yarim porsiya qo'shish"
                      >
                        +0.5
                      </button>

                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(menuItem, 1); }} 
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-slate-900 text-white active:scale-90" 
                        title="Bir porsiya qo'shish"
                      >
                        <Plus className="w-4 h-4 font-black" />
                      </button>
                    </div>
                  )}

                  {isBaliq && (
                    <button 
                      onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} 
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                      title="O'chirish"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isBaliq && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500">Vazn (kg):</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={item.weight || ''}
                      onChange={(e) => {
                        const w = parseFloat(e.target.value);
                        setCart(prev => prev.map(i => i.id === item.id ? { ...i, weight: isNaN(w) ? undefined : w } : i));
                      }}
                      placeholder="1.0"
                      className="w-24 px-3 py-1.5 rounded-xl text-sm font-black outline-none bg-slate-100 border border-slate-300 text-slate-900"
                    />
                    <span className="text-sm font-black text-slate-900">
                      = {formatCurrency(item.weight ? Math.round(item.price * item.weight) : 0)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {cart.length === 0 && !activeOrder && (
            <div className="text-center mt-12 flex flex-col items-center text-slate-400">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-30 text-slate-400" />
              <p className="text-base font-bold text-slate-600">Savatcha bo'sh</p>
              <p className="text-xs mt-1 text-slate-400">Chap tomondagi taomlarni bosib tanlang</p>
            </div>
          )}
        </div>

        {/* Total & Submit Button Area */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white">
          <div className="flex justify-between items-baseline mb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider block text-slate-500">
                Jami to'lov:
              </span>
              <span className="text-xs font-bold text-slate-400">
                {totalQuantity} dona taom
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={cart.length === 0 || !selectedTable || isSubmitting}
            className="w-full h-14 rounded-2xl font-black text-base uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-98 flex items-center justify-center gap-2 shadow-lg bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? 'Yuborilmoqda...' : (activeOrder ? 'Qo\'shimcha Qilish' : 'Oshxonaga Yuborish')}
          </button>
        </div>
      </div>
    </div>

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
          
          {/* Spacer and Cut line between different stations */}
          {index < Object.entries(groupedCart).length - 1 && (
            <div className="text-center w-full py-8">
              <p className="mb-8">.</p>
              <p className="border-b-2 border-dashed border-black"></p>
              <p className="text-xs mt-2">--- YIRTISH UCHUN (Qaychi) ---</p>
              <p className="mt-8">.</p>
            </div>
          )}
          
          {/* Final spacer to push out of printer for tearing */}
          {index === Object.entries(groupedCart).length - 1 && (
             <div className="h-16">.</div>
          )}
        </div>
      ))}
    </div>
    </>
  );
};
