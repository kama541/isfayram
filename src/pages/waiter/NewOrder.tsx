import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatTableName } from '../../utils/format';
import { Plus, Minus, ShoppingCart, ChevronLeft, Send, Utensils, Lock } from 'lucide-react';
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
  const [activeCategory, setActiveCategory] = useState('popular');
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

  const filteredItems = activeCategory === 'popular' 
    ? popularItems 
    : (activeCategory ? menuItems.filter(m => m.categoryId === activeCategory) : menuItems);

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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] font-sans print:hidden select-none" style={{ background: '#13120F' }}>
      
      {/* LEFT: Menu & Dishes Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Category Header */}
        <div className="p-4 sm:p-5" style={{ background: '#1C1A17', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Link 
                to={isCashier ? "/cashier" : "/waiter"} 
                className="p-3 rounded-2xl transition-all hover:bg-white/10 active:scale-95" 
                style={{ color: '#D4AF37', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase" style={{ color: '#D4AF37' }}>
                  {activeOrder ? `Buyurtmaga qo'shish: ${getTableNumber(selectedTable)}` : 'Yangi Buyurtma'}
                </h1>
                <p className="text-xs sm:text-sm font-semibold" style={{ color: '#8A8070' }}>
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
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 border border-red-500/40 text-red-400 bg-red-950/20 hover:bg-red-500/20 active:scale-95"
                  title="Ofitsiantni almashtirish / PIN ekrani"
                >
                  <Lock className="w-4 h-4 text-red-400" />
                  <span className="hidden sm:inline">Qulflash (PIN)</span>
                </button>
              )}
              <div className="hidden sm:flex rounded-2xl overflow-hidden p-1.5 gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}>
                {(['taomlar', 'modifikatorlar', 'xizmatlar'] as const).map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveMainTab(tab)}
                    className="px-5 py-2 rounded-xl text-sm font-bold transition-all capitalize"
                    style={activeMainTab === tab
                      ? { background: '#D4AF37', color: '#13120F' }
                      : { color: '#8A8070' }
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Pills (Touch-friendly & large) */}
          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveCategory('popular')}
              className="px-5 py-3 rounded-2xl text-sm sm:text-base font-extrabold whitespace-nowrap transition-all flex items-center gap-2 active:scale-95 shadow-sm"
              style={activeCategory === 'popular'
                ? { background: '#D4AF37', color: '#13120F', boxShadow: '0 4px 15px rgba(212,175,55,0.3)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#A39B8B', border: '1px solid rgba(212,175,55,0.15)' }
              }
            >
              🔥 Populyar
            </button>
            {categories.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className="px-5 py-3 rounded-2xl text-sm sm:text-base font-extrabold whitespace-nowrap transition-all active:scale-95 shadow-sm"
                style={activeCategory === c.id
                  ? { background: '#D4AF37', color: '#13120F', boxShadow: '0 4px 15px rgba(212,175,55,0.3)' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#A39B8B', border: '1px solid rgba(212,175,55,0.15)' }
                }
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dish Grid Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-hide" style={{ background: '#13120F' }}>
          {activeMainTab === 'taomlar' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
              {filteredItems.map(item => {
                const inCart = cart.find(c => c.id === item.id);
                return (
                  <div 
                    key={item.id} 
                    onClick={() => item.isAvailable && addToCart(item)}
                    className={`rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all active:scale-95 min-h-[110px] select-none ${
                      !item.isAvailable ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:scale-[1.02]'
                    }`}
                    style={{
                      background: '#1C1A17',
                      border: inCart
                        ? '2px solid #D4AF37'
                        : '1px solid rgba(212,175,55,0.15)',
                      boxShadow: inCart ? '0 0 15px rgba(212,175,55,0.2)' : 'none'
                    }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <h3 className="font-extrabold text-base sm:text-lg leading-snug line-clamp-2" style={{ color: '#F5F2EA' }}>
                          {item.name}
                        </h3>
                        {!item.isAvailable && (
                          <span className="shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
                            STOP
                          </span>
                        )}
                      </div>
                      {/* Price always clearly visible for all roles */}
                      <p className="font-black text-base sm:text-lg mt-1" style={{ color: !item.isAvailable ? '#A39B8B' : '#D4AF37' }}>
                        {formatCurrency(item.price)}
                      </p>
                    </div>

                    {inCart && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#A39B8B]">Savatchada:</span>
                        <span className="text-sm font-black px-3 py-1 rounded-xl shadow-sm" style={{ background: '#D4AF37', color: '#13120F' }}>
                          {inCart.quantity} ta
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="col-span-full py-16 text-center text-lg font-bold" style={{ color: '#6C6659' }}>
                  Bu kategoriyada taomlar mavjud emas
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-3" style={{ color: '#6C6659' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Utensils className="w-10 h-10 opacity-30" />
              </div>
              <p className="text-base font-bold">Hozircha {activeMainTab} kiritilmagan</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: High-contrast JOWi POS Cart Panel */}
      <div 
        className="w-full lg:w-[420px] flex flex-col h-[45vh] lg:h-full z-10 shadow-2xl" 
        style={{ background: '#1C1A17', borderLeft: '1px solid rgba(212,175,55,0.15)' }}
      >
        {/* Table & Waiter Selectors */}
        <div className="p-4 sm:p-5" style={{ borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-lg flex items-center gap-2 uppercase tracking-wide" style={{ color: '#D4AF37' }}>
              <ShoppingCart className="w-5 h-5" /> Joriy Buyurtma
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10" style={{ color: '#A39B8B' }}>
              {cart.length} xil taom
            </span>
          </div>

          <select 
            value={selectedTable} 
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl text-base font-bold outline-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(212,175,55,0.25)', color: '#F5F2EA' }}
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
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#8A8070' }}>
                Ofitsiantga biriktirish:
              </label>
              <select 
                value={selectedWaiter} 
                onChange={(e) => setSelectedWaiter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl text-sm font-bold outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.2)', color: '#F5F2EA' }}
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide" style={{ background: 'rgba(0,0,0,0.25)' }}>
          
          {/* Previous items if this is an existing order */}
          {activeOrder && activeOrder.items.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider mb-2 px-1" style={{ color: '#8A8070' }}>
                Avval berilgan buyurtmalar
              </h3>
              <div className="space-y-2">
                {activeOrder.items.map(item => {
                  const menuItem = menuItems.find(m => m.id === item.menuItemId);
                  if (!menuItem) return null;
                  return (
                    <div 
                      key={item.id} 
                      className="flex justify-between items-center p-3 rounded-2xl opacity-75" 
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}
                    >
                      <div className="flex-1 pr-3">
                        <h4 className="font-bold text-sm leading-tight" style={{ color: '#D4CFCA' }}>{menuItem.name}</h4>
                        <p className="text-xs font-bold mt-0.5" style={{ color: '#D4AF37' }}>{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <div className="px-3 py-1 rounded-xl font-black text-sm" style={{ background: 'rgba(255,255,255,0.08)', color: '#F5F2EA' }}>
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
            <h3 className="text-xs font-extrabold uppercase tracking-wider mb-2 px-1" style={{ color: '#D4AF37' }}>
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
                className="flex flex-col gap-2 p-3.5 rounded-2xl transition-all" 
                style={{ background: '#1C1A17', border: '1.5px solid rgba(212,175,55,0.25)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-base leading-snug" style={{ color: '#F5F2EA' }}>{menuItem.name}</h4>
                    <p className="text-sm font-black mt-1" style={{ color: '#D4AF37' }}>{formatCurrency(effectiveTotal)}</p>
                  </div>

                  {!isBaliq && (
                    <div className="flex items-center gap-1.5 rounded-2xl p-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFromCart(item.id, 1); }} 
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-500/20 active:scale-90" 
                        style={{ color: '#F5F2EA' }}
                        title="Kamaytirish"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="font-black text-base w-7 text-center" style={{ color: '#F5F2EA' }}>
                        {item.quantity}
                      </span>

                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(menuItem, 0.5); }} 
                        className="px-2 h-9 text-xs font-black rounded-xl transition-all hover:bg-white/10 active:scale-90" 
                        style={{ color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
                        title="Yarim porsiya qo'shish"
                      >
                        +0.5
                      </button>

                      <button 
                        onClick={(e) => { e.stopPropagation(); addToCart(menuItem, 1); }} 
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90" 
                        style={{ background: '#D4AF37', color: '#13120F' }}
                        title="Bir porsiya qo'shish"
                      >
                        <Plus className="w-4 h-4 font-black" />
                      </button>
                    </div>
                  )}

                  {isBaliq && (
                    <button 
                      onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} 
                      className="p-2 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
                      title="O'chirish"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isBaliq && (
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <span className="text-xs font-bold" style={{ color: '#A39B8B' }}>Vazn (kg):</span>
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
                      className="w-24 px-3 py-1.5 rounded-xl text-sm font-black outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
                    />
                    <span className="text-sm font-black" style={{ color: '#D4AF37' }}>
                      = {formatCurrency(item.weight ? Math.round(item.price * item.weight) : 0)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {cart.length === 0 && !activeOrder && (
            <div className="text-center mt-12 flex flex-col items-center" style={{ color: '#6C6659' }}>
              <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-base font-bold">Savatcha bo'sh</p>
              <p className="text-xs mt-1">Chap tomondagi taomlarni bosib tanlang</p>
            </div>
          )}
        </div>

        {/* Total & Submit Button Area */}
        <div className="p-4 sm:p-5" style={{ borderTop: '1px solid rgba(212,175,55,0.15)', background: '#1C1A17' }}>
          <div className="flex justify-between items-baseline mb-4">
            <div>
              <span className="text-sm font-extrabold uppercase tracking-wider block" style={{ color: '#8A8070' }}>
                Jami to'lov:
              </span>
              <span className="text-xs font-bold" style={{ color: '#A39B8B' }}>
                {totalQuantity} dona taom
              </span>
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#D4AF37' }}>
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={cart.length === 0 || !selectedTable || isSubmitting}
            className="w-full h-14 sm:h-16 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-98 flex items-center justify-center gap-2 shadow-xl"
            style={{ 
              background: '#D4AF37', 
              color: '#13120F', 
              boxShadow: cart.length > 0 ? '0 6px 25px rgba(212,175,55,0.35)' : 'none' 
            }}
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
