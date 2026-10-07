import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatTableName } from '../../utils/format';
import { Plus, Minus, ShoppingCart, ChevronLeft } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

export const NewOrder = () => {
  const { menuItems, categories, tables, orders, createOrder, addItemsToOrder, employees } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table');
  
  const storedUser = localStorage.getItem('currentUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isCashier = currentUser?.role === 'cashier';
  const adminUser = localStorage.getItem('adminUser');
  const actingWaiterId = localStorage.getItem('adminActingAsWaiter');
  const activeWaiterId = (adminUser && actingWaiterId) ? actingWaiterId : currentUser?.id;

  const [activeMainTab, setActiveMainTab] = useState<'taomlar' | 'modifikatorlar' | 'xizmatlar'>('taomlar');
  const [activeCategory, setActiveCategory] = useState('popular');
  const [selectedTable, setSelectedTable] = useState(tableParam || '');
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [cart, setCart] = useState<{id: string, quantity: number, price: number, weight?: number}[]>([]);

  // Check if this table has an active order
  const activeOrder = selectedTable ? orders.find(o => o.tableId === selectedTable && o.status !== 'paid' && o.status !== 'cancelled') : null;

  React.useEffect(() => {
    if (activeOrder && !localStorage.getItem('adminUser') && currentUser?.role !== 'admin' && activeOrder.waiterId !== currentUser?.id) {
      alert("Siz bu buyurtmaga kirolmaysiz. U boshqa ofitsiantga tegishli!");
      navigate('/waiter');
    }
  }, [activeOrder, currentUser, navigate]);
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
      
    if (sortedIds.length === 0) return menuItems.slice(0, 4);
    return sortedIds.map(id => menuItems.find(m => m.id === id)).filter(Boolean).slice(0, 6) as typeof menuItems;
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

  const handleSubmit = async () => {
    if (!selectedTable) return alert('Xonani tanlang!');
    if (cart.length === 0) return alert('Buyurtma bo\'sh!');

    const hasMissingStation = cart.some(item => {
      const menuItem = menuItems.find(m => m.id === item.id);
      return !menuItem?.kitchenStationId;
    });

    if (hasMissingStation) {
      return alert("Bu taomga oshxona yo'nalishi belgilanmagan.");
    }

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
      addItemsToOrder(activeOrder.id, mappedItems, totalAmount);
    } else {
      createOrder({
        tableId: selectedTable,
        waiterId: isCashier && selectedWaiter ? selectedWaiter : (activeWaiterId || undefined),
        status: 'pending',
        items: mappedItems,
        totalAmount
      });
    }
    
    // Kitchen printing is disabled per user request
    navigate(-1);
  };


  const getTableNumber = (tId: string) => {
    if (tId === 'takeaway') return 'S-oboy';
    const t = tables.find(x => x.id === tId);
    return t ? formatTableName(t.number) : tId;
  };

  const groupedCart = cart.reduce((acc, item) => {
    const menuItem = menuItems.find(m => m.id === item.id);
    if (!menuItem) return acc;
    const stationId = menuItem.kitchenStationId;
    const station = useStore.getState().kitchenStations.find(k => k.id === stationId);
    const stationName = station ? station.name : 'Belgilanmagan';
    if (!acc[stationName]) acc[stationName] = [];
    acc[stationName].push({ ...item, name: menuItem.name });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <>
    <div className="flex h-[calc(100vh-4rem)] font-sans print:hidden" style={{ background: '#13120F' }}>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-5" style={{ background: '#1C1A17', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
          <div className="flex items-center gap-4 mb-5">
            <Link to="/waiter" className="p-2 rounded-xl transition-colors hover:bg-white/5" style={{ color: '#8A8070' }}>
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase" style={{ color: '#D4AF37', fontFamily: 'serif' }}>Yangi Buyurtma</h1>
              <div className="flex rounded-xl overflow-hidden p-1 gap-1 mt-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {(['taomlar', 'modifikatorlar', 'xizmatlar'] as const).map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveMainTab(tab)}
                    className="px-5 py-1.5 rounded-lg text-sm font-medium transition-all capitalize"
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
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveCategory('popular')}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5"
              style={activeCategory === 'popular'
                ? { background: '#D4AF37', color: '#13120F' }
                : { background: 'rgba(255,255,255,0.05)', color: '#8A8070', border: '1px solid rgba(212,175,55,0.15)' }
              }
            >
              🔥 Populyar
            </button>
            {categories.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                style={activeCategory === c.id
                  ? { background: '#D4AF37', color: '#13120F' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#8A8070', border: '1px solid rgba(212,175,55,0.15)' }
                }
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide" style={{ background: '#13120F' }}>
          {activeMainTab === 'taomlar' ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => item.isAvailable && addToCart(item)}
                  className={`rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all group ${
                    !item.isAvailable ? 'opacity-40 grayscale cursor-not-allowed' : ''
                  }`}
                  style={{
                    background: '#1C1A17',
                    border: cart.find(c => c.id === item.id)
                      ? '1.5px solid #D4AF37'
                      : '1px solid rgba(212,175,55,0.12)'
                  }}
                >
                  <div className="p-4">
                    <h3 className="font-bold text-sm leading-tight line-clamp-1" style={{ color: '#F5F2EA' }}>{item.name}</h3>
                    {isCashier && <p className="font-bold mt-1 text-sm" style={{ color: '#D4AF37' }}>{formatCurrency(item.price)}</p>}
                    {cart.find(c => c.id === item.id) && (
                      <div className="mt-2 text-xs font-bold px-2 py-0.5 rounded-full w-fit" style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}>
                        {cart.find(c => c.id === item.id)?.quantity} ta
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="col-span-full py-12 text-center" style={{ color: '#6C6659' }}>
                  Bu kategoriyada taomlar topilmadi
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-3" style={{ color: '#6C6659' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <ShoppingCart className="w-8 h-8 opacity-20" />
              </div>
              <p>Hozircha {activeMainTab} kiritilmagan</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-[380px] flex flex-col h-full z-10" style={{ background: '#1C1A17', borderLeft: '1px solid rgba(212,175,55,0.12)' }}>
        <div className="p-5" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
          <h2 className="font-bold flex items-center gap-2 mb-4" style={{ color: '#D4AF37' }}>
            <ShoppingCart className="w-4 h-4" /> Joriy Buyurtma
          </h2>
          <select 
            value={selectedTable} 
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium appearance-none outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', color: '#F5F2EA' }}
          >
            <option value="">Xonani tanlang (Yoki S-oboy)</option>
            <option value="takeaway">S-oboy (Olib ketish)</option>
            {tables.filter(t => t.status === 'available' || t.id === selectedTable).map(t => (
              <option key={t.id} value={t.id}>{formatTableName(t.number)} {t.status === 'occupied' ? '(Qo\'shimcha)' : ''}</option>
            ))}
          </select>

          {isCashier && !activeOrder && (
            <div className="mt-3">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6C6659' }}>Ofitsiantga biriktirish</label>
              <select 
                value={selectedWaiter} 
                onChange={(e) => setSelectedWaiter(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium appearance-none outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.2)', color: '#F5F2EA' }}
              >
                <option value="">O'zim (Kassir)</option>
                {useStore.getState().employees.filter(e => e.role === 'waiter' && e.isActive).map(w => (
                  <option key={w.id} value={w.id}>{w.fullName}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide" style={{ background: 'rgba(0,0,0,0.2)' }}>
          
          {/* Avvalgi narsalar */}
          {activeOrder && activeOrder.items.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2 px-1" style={{ color: '#6C6659' }}>Avvalgi buyurtmalar</h3>
              <div className="space-y-2">
                {activeOrder.items.map(item => {
                  const menuItem = menuItems.find(m => m.id === item.menuItemId);
                  if (!menuItem) return null;
                  return (
                    <div key={item.id} className="flex justify-between items-center p-3 rounded-xl opacity-70" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.08)' }}>
                      <div className="flex-1 pr-3">
                        <h4 className="font-semibold text-sm" style={{ color: '#A39B8B' }}>{menuItem.name}</h4>
                        {isCashier && <p className="text-xs mt-0.5" style={{ color: '#6C6659' }}>{formatCurrency(item.price * item.quantity)}</p>}
                      </div>
                      <div className="px-3 py-1 rounded-lg font-bold text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: '#8A8070' }}>
                        {item.quantity} dona
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(cart.length > 0 || activeOrder) && (
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 px-1" style={{ color: '#D4AF37' }}>
              {activeOrder ? "Yangi qo'shilmoqda" : 'Tanlanganlar'}
            </h3>
          )}

          {cart.map(item => {
            const menuItem = menuItems.find(m => m.id === item.id);
            if (!menuItem) return null;
            const isBaliq = categories.find(c => c.id === menuItem.categoryId)?.name?.toLowerCase().includes('baliq');
            const effectiveTotal = isBaliq && item.weight ? Math.round(item.price * item.weight) : item.price * item.quantity;
            return (
              <div key={item.id} className="flex flex-col gap-2 p-3.5 rounded-2xl" style={{ background: '#1C1A17', border: '1.5px solid rgba(212,175,55,0.2)' }}>
                <div className="flex justify-between items-center">
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-sm leading-tight" style={{ color: '#F5F2EA' }}>{menuItem.name}</h4>
                    <p className="text-xs mt-1 font-medium" style={{ color: '#D4AF37' }}>{formatCurrency(effectiveTotal)}</p>
                  </div>
                  {!isBaliq && (
                    <div className="flex items-center gap-2 rounded-xl px-1.5 py-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id, 1); }} className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20" style={{ color: '#8A8070' }}>
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-sm w-5 text-center" style={{ color: '#F5F2EA' }}>{item.quantity}</span>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(menuItem, 0.5); }} className="px-1.5 text-xs font-bold rounded-lg transition-colors hover:bg-white/10" style={{ color: '#8A8070', border: '1px solid rgba(138, 128, 112, 0.5)' }}>+0.5</button>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(menuItem, 1); }} className="p-1.5 rounded-lg transition-colors" style={{ background: '#D4AF37', color: '#13120F' }}>
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {isBaliq && (
                    <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20" style={{ color: '#8A8070' }}>
                      <Minus className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {isBaliq && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#8A8070' }}>Vazn (kg):</span>
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
                      className="w-24 px-2 py-1 rounded-lg text-sm font-bold outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
                    />
                    <span className="text-xs font-bold" style={{ color: '#D4AF37' }}>= {formatCurrency(item.weight ? Math.round(item.price * item.weight) : 0)}</span>
                  </div>
                )}
              </div>
            )
          })}
          {cart.length === 0 && (
            <div className="text-center mt-12 flex flex-col items-center" style={{ color: '#6C6659' }}>
              <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
              <p>Savatcha bo'sh</p>
            </div>
          )}
        </div>

        <div className="p-5" style={{ borderTop: '1px solid rgba(212,175,55,0.1)', background: '#1C1A17' }}>
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold" style={{ color: '#8A8070' }}>{isCashier ? 'Jami summa:' : 'Tanlangan taomlar:'}</span>
            <span className="text-2xl font-black" style={{ color: '#D4AF37' }}>{isCashier ? formatCurrency(totalAmount) : `${cart.reduce((a, b) => a + b.quantity, 0)} ta`}</span>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={cart.length === 0 || !selectedTable}
            className="w-full font-bold py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 uppercase tracking-widest text-sm"
            style={{ background: '#D4AF37', color: '#13120F', boxShadow: '0 5px 20px rgba(212,175,55,0.2)' }}
          >
            {activeOrder ? 'Qo\'shimcha Qilish' : 'Oshxonaga Yuborish'}
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
