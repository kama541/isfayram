import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, BellRing, Plus, Minus, CheckCircle, UtensilsCrossed } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';

export const CustomerMenu = () => {
  const { tableId } = useParams();
  const { menuItems, categories, orders, createOrder, createWaiterCall } = useStore();
  
  const [activeCategory, setActiveCategory] = useState('popular');
  const [cart, setCart] = useState<{id: string, quantity: number, price: number}[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

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
    : (activeCategory ? menuItems.filter(item => item.categoryId === activeCategory) : menuItems);

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

  const getQuantity = (id: string) => cart.find(i => i.id === id)?.quantity || 0;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const submitOrder = () => {
    if (cart.length === 0 || !tableId) return;
    
    createOrder({
      tableId,
      status: 'pending',
      items: cart.map(i => ({
        id: `oi${Date.now()}${i.id}`,
        menuItemId: i.id,
        quantity: i.quantity,
        price: i.price
      })),
      totalAmount
    });
    
    setCart([]);
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 3000);
  };

  const callWaiter = () => {
    if (tableId) {
      createWaiterCall(tableId);
      alert('Ofitsiant chaqirildi! Kuting...');
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Buyurtma qabul qilindi!</h1>
          <p className="text-slate-500 mt-2">Oshpazlar taomingizni tayyorlashni boshlashdi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-600/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">Oshxona</h1>
              <p className="text-xs text-slate-500 font-medium">Stol: {tableId?.replace('t', '')}</p>
            </div>
          </div>
          <button onClick={callWaiter} className="flex items-center justify-center w-10 h-10 bg-amber-50 text-amber-600 rounded-xl relative shadow-sm hover:bg-amber-100 transition-colors">
            <BellRing className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex overflow-x-auto px-6 py-3.5 gap-2.5 no-scrollbar border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveCategory('popular')}
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              activeCategory === 'popular' 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                : 'bg-white text-slate-600 shadow-sm border border-slate-200'
            }`}
          >
            🔥 Populyar
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeCategory === category.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white text-slate-600 shadow-sm border border-slate-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-md mx-auto">
        {filteredItems.map(item => (
          <div key={item.id} className={`bg-white rounded-3xl overflow-hidden shadow-sm border flex flex-col transition-all ${!item.isAvailable ? 'opacity-60 grayscale' : 'border-slate-100 hover:shadow-md'}`}>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-800 leading-tight tracking-tight">{item.name}</h3>
                <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
              </div>
              <div className="mt-5 flex justify-between items-end">
                <span className="font-bold text-xl text-blue-600 tracking-tight">{formatCurrency(item.price)}</span>
                
                {item.isAvailable ? (
                  getQuantity(item.id) > 0 ? (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-1.5 py-1.5 border border-slate-100">
                      <button onClick={() => removeFromCart(item.id)} className="p-2 rounded-xl bg-white text-slate-600 shadow-sm">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-base w-4 text-center text-slate-800">{getQuantity(item.id)}</span>
                      <button onClick={() => addToCart(item)} className="p-2 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(item)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
                      Qo'shish
                    </button>
                  )
                ) : (
                  <span className="text-sm font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">Tugagan</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>

      {totalItems > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-30 max-w-md mx-auto">
          <button onClick={submitOrder} className="w-full bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-600/30 font-bold flex justify-between items-center hover:bg-blue-700 transition-colors active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="text-left flex flex-col">
                <span className="text-xs text-blue-100 font-medium">{totalItems} ta mahsulot</span>
                <span className="text-lg">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
            <span className="flex items-center gap-2">
              Buyurtma berish
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
