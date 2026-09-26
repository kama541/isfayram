import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';
import { Plus, Minus, ShoppingCart, ChevronLeft } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

export const NewOrder = () => {
  const { menuItems, categories, tables, orders, createOrder, addItemsToOrder } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table');
  
  const storedUser = localStorage.getItem('currentUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isCashier = currentUser?.role === 'cashier';

  const [activeCategory, setActiveCategory] = useState('popular');
  const [selectedTable, setSelectedTable] = useState(tableParam || '');
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [cart, setCart] = useState<{id: string, quantity: number, price: number}[]>([]);

  // Check if this table has an active order
  const activeOrder = selectedTable ? orders.find(o => o.tableId === selectedTable && o.status !== 'paid' && o.status !== 'cancelled') : null;


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

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, quantity: 1, price: item.price }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = () => {
    if (!selectedTable) return alert('Stolni tanlang!');
    if (cart.length === 0) return alert('Buyurtma bo\'sh!');

    const mappedItems = cart.map(i => ({
      id: `oi${Date.now()}${i.id}`,
      menuItemId: i.id,
      quantity: i.quantity,
      price: i.price
    }));

    if (activeOrder) {
      addItemsToOrder(activeOrder.id, mappedItems, totalAmount);
    } else {
      createOrder({
        tableId: selectedTable,
        waiterId: isCashier && selectedWaiter ? selectedWaiter : (currentUser?.id || undefined),
        status: 'pending',
        items: mappedItems,
        totalAmount
      });
    }
    
    // Go back
    navigate(-1);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-900 font-sans">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/waiter" className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Yangi Buyurtma</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Taomlarni tanlang va buyurtma formating</p>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setActiveCategory('popular')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                activeCategory === 'popular' 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              🔥 Populyar
            </button>
            {categories.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === c.id 
                    ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => item.isAvailable && addToCart(item)}
                className={`bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden shadow-sm flex flex-col cursor-pointer transition-all hover:shadow-md hover:border-blue-500 group ${
                  !item.isAvailable ? 'opacity-50 grayscale cursor-not-allowed border-slate-200 dark:border-slate-700' : 'border-slate-100 dark:border-slate-700'
                }`}
              >
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight line-clamp-1">{item.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">{formatCurrency(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[400px] bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col h-full shadow-2xl z-10">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Joriy Buyurtma
          </h2>
          <select 
            value={selectedTable} 
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
          >
            <option value="">Stolni tanlang (Yoki S-oboy)</option>
            <option value="takeaway" className="font-bold text-blue-600">S-oboy (Olib ketish)</option>
            {tables.filter(t => t.status === 'available' || t.id === selectedTable).map(t => (
              <option key={t.id} value={t.id}>{t.number} {t.status === 'occupied' ? '(Qo\'shimcha)' : ''}</option>
            ))}
          </select>

          {isCashier && !activeOrder && (
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Ofitsiantga biriktirish (ixtiyoriy)</label>
              <select 
                value={selectedWaiter} 
                onChange={(e) => setSelectedWaiter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="">O'zim (Kassir)</option>
                {useStore.getState().employees.filter(e => e.role === 'waiter' && e.isActive).map(w => (
                  <option key={w.id} value={w.id}>{w.fullName}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/30">
          
          {/* Odingi narsalar (Existing items) */}
          {activeOrder && activeOrder.items.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 px-1 uppercase tracking-wider">Avvalgi buyurtmalar</h3>
              <div className="space-y-3">
                {activeOrder.items.map(item => {
                  const menuItem = menuItems.find(m => m.id === item.menuItemId);
                  if (!menuItem) return null;
                  return (
                    <div key={item.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 p-3 rounded-xl opacity-80">
                      <div className="flex-1 pr-4">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{menuItem.name}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <div className="bg-white dark:bg-slate-700 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 font-bold text-sm text-slate-600 dark:text-slate-300">
                        {item.quantity} dona
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Yangi qo'shilgan narsalar */}
          {(cart.length > 0 || activeOrder) && (
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3 px-1 uppercase tracking-wider">
              {activeOrder ? 'Yangi qo\'shilmoqda' : 'Tanlanganlar'}
            </h3>
          )}

          {cart.map(item => {
            const menuItem = menuItems.find(m => m.id === item.id);
            if (!menuItem) return null;
            return (
              <div key={item.id} className="flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl shadow-sm">
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight">{menuItem.name}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-xl px-1.5 py-1.5 border border-slate-100 dark:border-slate-700/50">
                  <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} className="p-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shadow-sm hover:text-red-600 dark:hover:text-red-400 transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-sm w-4 text-center text-slate-800 dark:text-slate-200">{item.quantity}</span>
                  <button onClick={(e) => { e.stopPropagation(); addToCart(menuItem); }} className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
          {cart.length === 0 && (
            <div className="text-center text-slate-400 dark:text-slate-500 mt-12 flex flex-col items-center">
              <ShoppingCart className="w-12 h-12 mb-4 text-slate-200 dark:text-slate-700" />
              <p>Savatcha bo'sh</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-slate-500 dark:text-slate-400">Jami summa:</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{formatCurrency(totalAmount)}</span>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={cart.length === 0 || !selectedTable}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
          >
            {activeOrder ? 'Qo\'shimcha Qilish' : 'Buyurtmani Yuborish'}
          </button>
        </div>
      </div>
    </div>
  );
};
