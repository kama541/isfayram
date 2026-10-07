import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, BellRing, Plus, Minus, CheckCircle, ChevronLeft, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';

interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  notes: string;
}

export const CustomerMenu = () => {
  const { tableId } = useParams();
  const { menuItems, categories, orders, createOrder, addItemsToOrder, createWaiterCall, isLoading } = useStore();
  
  const [appState, setAppState] = useState<'welcome' | 'menu' | 'cart' | 'status'>('welcome');
  const [activeCategory, setActiveCategory] = useState('popular');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [foodNotes, setFoodNotes] = useState('');
  
  const [justAdded, setJustAdded] = useState(false);

  // Derived order
  const activeOrder = orders.find(o => o.tableId === tableId && o.status !== 'paid' && o.status !== 'cancelled');

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

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tableDisplay = tableId?.replace('t', '') || '';

  const openFoodDetail = (item: any) => {
    if (!item.isAvailable) return;
    setSelectedFood(item);
    setFoodQuantity(1);
    setFoodNotes('');
  };

  const closeFoodDetail = () => {
    setSelectedFood(null);
  };

  const handleAddToCart = () => {
    if (!selectedFood) return;
    
    setCart(prev => {
      // Check if same item with same notes exists
      const existing = prev.find(i => i.menuItemId === selectedFood.id && i.notes === foodNotes);
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + foodQuantity } : i);
      }
      return [...prev, {
        id: crypto.randomUUID(),
        menuItemId: selectedFood.id,
        quantity: foodQuantity,
        price: selectedFood.price,
        notes: foodNotes
      }];
    });
    
    closeFoodDetail();
    
    // Trigger cart bounce
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 300);
  };

  const updateCartItemQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQ = item.quantity + delta;
          return newQ > 0 ? { ...item, quantity: newQ } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeCartItem = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const submitOrder = () => {
    if (cart.length === 0 || !tableId) return;
    
    const mappedItems = cart.map((i, idx) => ({
      id: `oi${Date.now()}${idx}`,
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      price: i.price,
      notes: i.notes
    }));

    if (activeOrder) {
      addItemsToOrder(activeOrder.id, mappedItems, totalAmount);
    } else {
      createOrder({
        tableId,
        status: 'pending',
        items: mappedItems,
        totalAmount
      });
    }
    
    setCart([]);
    setAppState('status');
  };

  const callWaiter = () => {
    (window as any).customConfirm("Ofitsiantni chaqirishni xohlaysizmi?", () => {
      if (tableId) {
        createWaiterCall(tableId);
        alert('Ofitsiant chaqirildi! Kuting...');
      }
    });
  };

  // Welcome Screen
  if (appState === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans" style={{ background: '#FAF8F3' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center z-10"
        >
          <img src="/logo.png" alt="Isfayram Kafe" className="w-36 h-36 object-contain mb-6 drop-shadow-xl" />
          <h1 className="text-4xl font-serif tracking-widest uppercase mb-2" style={{ color: '#241A16' }}>Isfayram</h1>
          <p className="font-medium tracking-[0.2em] text-sm mb-10 uppercase" style={{ color: '#D4AF37' }}>Premium Kafe</p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center space-y-3 mb-12"
          >
            <h2 className="text-3xl font-light" style={{ color: '#241A16' }}>Xush kelibsiz</h2>
            <p className="text-base leading-relaxed" style={{ color: '#665B53' }}>Buyurtmangizni telefon orqali<br/>oson va tez bering</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            onClick={() => setAppState('menu')}
            className="px-12 py-5 rounded-full font-bold tracking-widest uppercase text-base hover:scale-105 active:scale-95 transition-all"
            style={{ background: '#4A3A31', color: '#FFFFFF', boxShadow: '0 8px 30px rgba(74,58,49,0.3)' }}
          >
            Menyuni ko'rish
          </motion.button>
        </motion.div>
        
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      </div>
    );
  }

  // Order Status Screen
  if (appState === 'status') {
    return (
      <div className="min-h-screen flex flex-col p-6 font-sans" style={{ background: '#FAF8F3', color: '#241A16' }}>
        <div className="flex justify-between items-center mb-8 pt-4">
          <button onClick={() => setAppState('menu')} className="p-3 rounded-full transition-colors hover:bg-black/5" style={{ background: '#FFFFFF', border: '1px solid #E5DFD3', color: '#665B53' }}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h2 className="font-serif text-xl tracking-widest uppercase" style={{ color: '#D4AF37' }}>Isfayram</h2>
          </div>
          <div className="w-12"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto w-full"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </motion.div>
          
          <h1 className="text-3xl font-light mb-3">Buyurtma qabul qilindi</h1>
          <p className="text-lg mb-10" style={{ color: '#665B53' }}>Taomlaringiz tayyorlanmoqda.</p>
          
          <div className="w-full rounded-3xl p-7 border mb-10 text-left shadow-sm" style={{ background: '#FFFFFF', borderColor: '#E5DFD3' }}>
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-medium" style={{ color: '#665B53' }}>Stol №{tableDisplay}</span>
              <span className="font-bold text-lg" style={{ color: '#D4AF37' }}>№{activeOrder?.id.slice(0,4).toUpperCase() || 'YANGI'}</span>
            </div>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E5DFD3] before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-emerald-500 bg-white text-emerald-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2rem)] ml-5 md:ml-0 md:group-odd:text-right md:group-even:text-left">
                  <h4 className="font-bold text-[1.1rem]">Buyurtma olindi</h4>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-7 h-7 rounded-full border-2 bg-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" style={{ borderColor: '#D4AF37', color: '#D4AF37' }}>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2rem)] ml-5 md:ml-0 md:group-odd:text-right md:group-even:text-left">
                  <h4 className="font-bold text-[1.1rem]" style={{ color: '#D4AF37' }}>Tayyorlanmoqda</h4>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => setAppState('menu')} className="w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-[0_5px_20px_rgba(74,58,49,0.15)] hover:scale-[0.98] active:scale-95 transition-all" style={{ background: '#4A3A31', color: '#FFFFFF' }}>
            Menyuga qaytish
          </button>
        </motion.div>
      </div>
    );
  }

  // Cart Screen
  if (appState === 'cart') {
    return (
      <div className="min-h-screen flex flex-col font-sans pb-6" style={{ background: '#FAF8F3', color: '#241A16' }}>
        <header className="px-6 py-5 flex items-center justify-between sticky top-0 z-20" style={{ background: 'rgba(250, 248, 243, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E5DFD3' }}>
          <button onClick={() => setAppState('menu')} className="p-2 -ml-2 transition-colors hover:opacity-70" style={{ color: '#665B53' }}>
            <ChevronLeft className="w-7 h-7" />
          </button>
          <h1 className="font-bold tracking-widest uppercase text-xl">Savatcha</h1>
          <div className="w-7"></div>
        </header>

        <main className="flex-1 p-6 space-y-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium" style={{ color: '#665B53' }}>Sizning buyurtmangiz</h2>
            <span className="px-4 py-1.5 rounded-full text-sm font-bold shadow-sm" style={{ background: '#FFFFFF', color: '#4A3A31', border: '1px solid #E5DFD3' }}>Stol №{tableDisplay}</span>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="w-20 h-20 mx-auto mb-6 opacity-30" style={{ color: '#665B53' }} />
              <h3 className="text-2xl font-light mb-3">Savat hozircha bo'sh</h3>
              <p className="text-base mb-10" style={{ color: '#665B53' }}>Menudan taom tanlang</p>
              <button onClick={() => setAppState('menu')} className="px-10 py-4 rounded-full font-bold uppercase text-sm tracking-widest shadow-md hover:scale-105 transition-all" style={{ background: '#4A3A31', color: '#FFFFFF' }}>
                Menyuga qaytish
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {cart.map(item => {
                const menuItem = menuItems.find(m => m.id === item.menuItemId);
                if (!menuItem) return null;
                return (
                  <div key={item.id} className="p-5 rounded-3xl border flex flex-col gap-4 shadow-sm" style={{ background: '#FFFFFF', borderColor: '#E5DFD3' }}>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-[1.15rem] leading-tight mb-1">{menuItem.name}</h4>
                        <div className="font-bold text-lg" style={{ color: '#D4AF37' }}>{formatCurrency(item.price * item.quantity)}</div>
                        {item.notes && (
                          <p className="text-sm mt-3 italic p-2.5 rounded-xl border" style={{ background: '#FAF8F3', borderColor: '#E5DFD3', color: '#665B53' }}>Izoh: {item.notes}</p>
                        )}
                      </div>
                      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-[#E5DFD3]/50">
                        <img src={menuItem.image} alt={menuItem.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-4" style={{ borderTop: '1px solid #E5DFD3' }}>
                      <button onClick={() => removeCartItem(item.id)} className="text-red-500 text-[0.95rem] font-bold uppercase tracking-wide hover:opacity-80 px-2 py-1">
                        Olib tashlash
                      </button>
                      <div className="flex items-center gap-5 rounded-full px-2.5 py-1.5 border shadow-sm" style={{ background: '#FAF8F3', borderColor: '#E5DFD3' }}>
                        <button onClick={() => updateCartItemQuantity(item.id, -1)} className="p-2 transition-colors hover:bg-black/5 rounded-full" style={{ color: '#665B53' }}>
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="font-bold text-lg w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateCartItemQuantity(item.id, 1)} className="p-2 transition-colors hover:bg-black/5 rounded-full" style={{ color: '#D4AF37' }}>
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {cart.length > 0 && (
          <div className="p-6 sticky bottom-0 z-20" style={{ background: 'linear-gradient(to top, rgba(250,248,243,1) 80%, rgba(250,248,243,0))' }}>
            <div className="bg-white p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-[#E5DFD3]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-medium" style={{ color: '#665B53' }}>Jami:</span>
                <span className="text-3xl font-black" style={{ color: '#241A16' }}>{formatCurrency(totalAmount)}</span>
              </div>
              <button onClick={submitOrder} className="w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-[15px] shadow-[0_8px_25px_rgba(74,58,49,0.25)] hover:scale-[0.98] active:scale-95 transition-all" style={{ background: '#4A3A31', color: '#FFFFFF' }}>
                Buyurtmani tasdiqlash
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main Menu Screen
  return (
    <div className="min-h-screen font-sans pb-36" style={{ background: '#FAF8F3', color: '#241A16' }}>
      <header className="sticky top-0 z-20" style={{ background: 'rgba(250, 248, 243, 0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E5DFD3' }}>
        <div className="px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif tracking-widest uppercase" style={{ color: '#D4AF37' }}>Isfayram</h1>
            <p className="text-[13px] font-bold tracking-wider mt-1" style={{ color: '#665B53' }}>STOL №{tableDisplay}</p>
          </div>
          <div className="flex gap-4">
            {activeOrder && (
              <button onClick={() => setAppState('status')} className="w-12 h-12 rounded-full border flex items-center justify-center shadow-sm transition-all hover:scale-105" style={{ background: '#FFFFFF', borderColor: '#E5DFD3', color: '#D4AF37' }}>
                <Clock className="w-5 h-5" />
              </button>
            )}
            <button onClick={callWaiter} className="h-12 px-5 rounded-full flex items-center justify-center gap-2 font-bold text-sm tracking-wider uppercase shadow-sm transition-all hover:scale-105" style={{ background: '#FFFFFF', border: '1px solid #E5DFD3', color: '#4A3A31' }}>
              <BellRing className="w-5 h-5" />
              <span className="hidden sm:inline">Chaqirish</span>
            </button>
          </div>
        </div>
        
        <div className="flex overflow-x-auto px-6 py-4 gap-3 no-scrollbar">
          <button
            onClick={() => setActiveCategory('popular')}
            className="whitespace-nowrap px-7 py-3 rounded-full text-[15px] font-bold transition-all shadow-sm"
            style={activeCategory === 'popular'
              ? { background: '#4A3A31', color: '#FFFFFF' }
              : { background: '#FFFFFF', color: '#665B53', border: '1px solid #E5DFD3' }
            }
          >
            🔥 Populyar
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className="whitespace-nowrap px-7 py-3 rounded-full text-[15px] font-bold transition-all shadow-sm"
              style={activeCategory === category.id
                ? { background: '#4A3A31', color: '#FFFFFF' }
                : { background: '#FFFFFF', color: '#665B53', border: '1px solid #E5DFD3' }
              }
            >
              {category.name}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 pt-6">
        {isLoading ? (
          <div className="space-y-7">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse rounded-3xl h-72 border" style={{ background: '#FFFFFF', borderColor: '#E5DFD3' }}></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
            {filteredItems.map(item => (
              <motion.div 
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => openFoodDetail(item)}
                className={`rounded-3xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.03)] border cursor-pointer flex flex-col ${!item.isAvailable ? 'opacity-60 grayscale' : ''}`}
                style={{ background: '#FFFFFF', borderColor: '#E5DFD3' }}
              >
                <div className="aspect-[4/3] w-full relative bg-[#F3EDE2]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-opacity" loading="lazy" />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-red-500 text-white px-5 py-2 rounded-full text-[15px] font-bold tracking-widest uppercase shadow-md">Tugagan</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-[1.25rem] leading-tight mb-2">{item.name}</h3>
                  <p className="text-[15px] line-clamp-2 leading-relaxed flex-1" style={{ color: '#665B53' }}>{item.description}</p>
                  <div className="mt-5 flex justify-between items-center pt-4" style={{ borderTop: '1px solid #FAF8F3' }}>
                    <span className="font-black text-xl tracking-tight" style={{ color: '#D4AF37' }}>{formatCurrency(item.price)}</span>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-110" style={{ background: '#FAF8F3', color: '#4A3A31', border: '1px solid #E5DFD3' }}>
                      <Plus className="w-5 h-5 font-bold" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 z-30 max-w-md mx-auto"
          >
            <button onClick={() => setAppState('cart')} className="w-full p-5 rounded-3xl shadow-[0_12px_40px_rgba(74,58,49,0.3)] flex justify-between items-center active:scale-[0.98] transition-transform" style={{ background: '#4A3A31', color: '#FFFFFF' }}>
              <div className="flex items-center gap-5">
                <div className="relative p-2 bg-white/10 rounded-2xl">
                  <ShoppingCart className="w-7 h-7" />
                  <motion.div 
                    animate={justAdded ? { scale: [1, 1.5, 1], y: [0, -5, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-[12px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm"
                  >
                    {totalItems}
                  </motion.div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[13px] font-bold uppercase tracking-wider opacity-80 mb-0.5">Savatchada</span>
                  <span className="text-xl font-black leading-none">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
              <span className="text-[15px] font-bold uppercase tracking-widest bg-white/10 px-4 py-2.5 rounded-full">O'tish</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food Detail Bottom Sheet */}
      <AnimatePresence>
        {selectedFood && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeFoodDetail}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[2.5rem] max-h-[90vh] overflow-y-auto shadow-[0_-10px_50px_rgba(0,0,0,0.15)] max-w-lg mx-auto"
              style={{ background: '#FFFFFF' }}
            >
              <div className="w-full aspect-[4/3] relative bg-[#F3EDE2]">
                <img src={selectedFood.image} alt={selectedFood.name} className="w-full h-full object-cover" />
                <button onClick={closeFoodDetail} className="absolute top-5 right-5 w-11 h-11 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110" style={{ color: '#241A16' }}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-7 space-y-7">
                <div>
                  <h2 className="text-3xl font-bold leading-tight mb-3" style={{ color: '#241A16' }}>{selectedFood.name}</h2>
                  <p className="text-[16px] leading-relaxed" style={{ color: '#665B53' }}>{selectedFood.description}</p>
                </div>

                <div className="space-y-4 pt-2">
                  <label className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#665B53' }}>Buyurtmaga izoh (ixtiyoriy)</label>
                  <input 
                    type="text" 
                    value={foodNotes}
                    onChange={(e) => setFoodNotes(e.target.value)}
                    placeholder="Masalan: Kamroq achchiq, piyozsiz..."
                    className="w-full rounded-2xl px-5 py-4 text-[16px] transition-colors shadow-sm outline-none"
                    style={{ background: '#FAF8F3', border: '1px solid #E5DFD3', color: '#241A16' }}
                  />
                  <div className="flex gap-2 flex-wrap mt-3">
                    {['Kamroq achchiq', 'Piyozsiz', 'Yaxshi pishgan'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setFoodNotes(prev => prev ? `${prev}, ${tag}` : tag)}
                        className="px-4 py-2 rounded-xl text-[14px] font-medium transition-all shadow-sm active:scale-95"
                        style={{ background: '#FAF8F3', border: '1px solid #E5DFD3', color: '#665B53' }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-7 mt-2" style={{ borderTop: '1px solid #FAF8F3' }}>
                  <div className="flex items-center gap-5 rounded-full px-4 py-2.5 shadow-sm border" style={{ background: '#FAF8F3', borderColor: '#E5DFD3' }}>
                    <button onClick={() => setFoodQuantity(q => Math.max(1, q - 1))} className="p-2 transition-colors hover:bg-black/5 rounded-full" style={{ color: '#665B53' }}>
                      <Minus className="w-6 h-6" />
                    </button>
                    <span className="font-black text-2xl w-8 text-center" style={{ color: '#241A16' }}>{foodQuantity}</span>
                    <button onClick={() => setFoodQuantity(q => q + 1)} className="p-2 transition-colors hover:bg-black/5 rounded-full" style={{ color: '#D4AF37' }}>
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <button onClick={handleAddToCart} className="flex-1 ml-5 py-5 rounded-2xl font-bold uppercase tracking-widest text-[15px] shadow-[0_8px_25px_rgba(74,58,49,0.25)] hover:scale-[0.98] active:scale-95 transition-all flex flex-col items-center justify-center" style={{ background: '#4A3A31', color: '#FFFFFF' }}>
                    <span>Qo'shish</span>
                    <span className="text-[12px] opacity-90 mt-0.5 tracking-normal">{formatCurrency(selectedFood.price * foodQuantity)}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
