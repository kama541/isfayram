import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';
import { Plus, Minus, ShoppingCart, ChevronLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const NewOrder = () => {
  const { menuItems, categories, tables, createOrder } = useStore();
  const navigate = useNavigate();
  
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '');
  const [selectedTable, setSelectedTable] = useState('');
  const [cart, setCart] = useState<{id: string, quantity: number, price: number}[]>([]);

  const filteredItems = activeCategory ? menuItems.filter(m => m.categoryId === activeCategory) : menuItems;

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

    createOrder({
      tableId: selectedTable,
      waiterId: '3', // Mock waiter id
      status: 'pending',
      items: cart.map(i => ({
        id: `oi${Date.now()}${i.id}`,
        menuItemId: i.id,
        quantity: i.quantity,
        price: i.price
      })),
      totalAmount
    });
    navigate('/waiter');
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-slate-50 font-sans">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-6 bg-white border-b border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/waiter" className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Yangi Buyurtma</h1>
              <p className="text-slate-500 text-sm mt-1">Taomlarni tanlang va buyurtma formating</p>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
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
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => item.isAvailable && addToCart(item)}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm flex flex-col cursor-pointer transition-all hover:shadow-md hover:border-blue-500 group ${
                  !item.isAvailable ? 'opacity-50 grayscale cursor-not-allowed border-slate-200' : 'border-slate-100'
                }`}
              >
                <div className="h-36 bg-slate-100 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1">{item.name}</h3>
                  <p className="text-blue-600 font-bold mt-1">{formatCurrency(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[400px] bg-white border-l border-slate-200 flex flex-col h-full shadow-2xl z-10">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-500" /> Joriy Buyurtma
          </h2>
          <select 
            value={selectedTable} 
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
          >
            <option value="">Stolni tanlang</option>
            {tables.filter(t => t.status === 'available').map(t => (
              <option key={t.id} value={t.id}>Stol {t.number}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {cart.map(item => {
            const menuItem = menuItems.find(m => m.id === item.id);
            if (!menuItem) return null;
            return (
              <div key={item.id} className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-slate-800 text-sm leading-tight">{menuItem.name}</h4>
                  <p className="text-slate-500 text-xs mt-1 font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-1.5 py-1.5 border border-slate-100">
                  <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} className="p-1.5 bg-white text-slate-600 rounded-lg shadow-sm hover:text-red-600 transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-sm w-4 text-center text-slate-800">{item.quantity}</span>
                  <button onClick={(e) => { e.stopPropagation(); addToCart(menuItem); }} className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
          {cart.length === 0 && (
            <div className="text-center text-slate-400 mt-12 flex flex-col items-center">
              <ShoppingCart className="w-12 h-12 mb-4 text-slate-200" />
              <p>Savatcha bo'sh</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-white">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-slate-500">Jami summa:</span>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">{formatCurrency(totalAmount)}</span>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={cart.length === 0 || !selectedTable}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
          >
            Buyurtmani Yuborish
          </button>
        </div>
      </div>
    </div>
  );
};
