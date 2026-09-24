import { useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ChefHat, Flame, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export const KDS = () => {
  const { department } = useParams<{ department: string }>(); // 'kitchen' or 'shashlik'
  const { orders, menuItems, categories, tables, employees } = useStore();
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  // Trigger re-render to update elapsed time every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleItemComplete = (uniqueItemId: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [uniqueItemId]: !prev[uniqueItemId]
    }));
  };

  // 1. Get preparing orders
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  // 2. Identify categories
  const shashlikCategories = categories.filter(c => c.name.toLowerCase().includes('shashlik')).map(c => c.id);
  const drinkCategories = categories.filter(c => c.name.toLowerCase().includes('ichimlik') || c.name.toLowerCase().includes('napitka')).map(c => c.id);

  // 3. Filter order items based on department
  const getRelevantItems = (items: any[]) => {
    return items.filter(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      if (!menuItem) return false;
      
      const isShashlik = shashlikCategories.includes(menuItem.categoryId);
      const isDrink = drinkCategories.includes(menuItem.categoryId);

      if (isDrink) return false; // Drinks go to bar, not KDS

      if (department === 'shashlik') return isShashlik;
      if (department === 'kitchen') return !isShashlik;
      
      return false;
    });
  };

  const getTableNumber = (tableId: string) => {
    if (!tableId) return 'S-oboy';
    const t = tables.find(t => t.id === tableId);
    return t ? t.number : 'Noma\'lum';
  };

  const getWaiterName = (waiterId?: string | null) => {
    if (!waiterId) return 'Kassir';
    const w = employees.find(e => e.id === waiterId);
    return w ? w.fullName : 'Noma\'lum';
  };

  const calculateTimeElapsed = (dateString: string) => {
    const ms = new Date().getTime() - new Date(dateString).getTime();
    const mins = Math.floor(ms / 60000);
    return `${mins} daq`;
  };

  // We only want to show orders that actually have items for this department
  const displayOrders = preparingOrders.map(order => {
    const relevantItems = getRelevantItems(order.items);
    return { ...order, relevantItems };
  }).filter(order => order.relevantItems.length > 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6">
      <header className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${department === 'shashlik' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
            {department === 'shashlik' ? <Flame className="w-8 h-8" /> : <ChefHat className="w-8 h-8" />}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase">
              {department === 'shashlik' ? 'SHASHLIKXONA' : 'OSHXONA'}
            </h1>
            <p className="text-slate-400 font-medium tracking-wide mt-1">Buyurtmalar ekrani (KDS)</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-white tracking-tighter">
            {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <p className="text-slate-400 font-medium">Jami: {displayOrders.length} ta buyurtma</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 items-start">
        {displayOrders.map(order => (
          <div key={order.id} className="bg-slate-800 rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">№{getTableNumber(order.tableId)}</h2>
                <p className="text-slate-400 text-sm mt-1 font-medium">{getWaiterName(order.waiterId)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5 bg-slate-700/50 px-3 py-1.5 rounded-xl text-slate-300 font-bold text-lg">
                  <Clock className="w-5 h-5 text-amber-500" />
                  {calculateTimeElapsed(order.updatedAt || order.createdAt)}
                </div>
                <div className="text-xs text-slate-500 font-medium">#{order.id.slice(0, 6)}</div>
              </div>
            </div>

            <div className="p-2 flex-1 space-y-2">
              {order.relevantItems.map((item: any, index: number) => {
                const menuItem = menuItems.find(m => m.id === item.menuItemId);
                const uniqueId = `${order.id}-${item.menuItemId}-${index}`;
                const isComplete = completedItems[uniqueId];

                return (
                  <div 
                    key={uniqueId}
                    onClick={() => toggleItemComplete(uniqueId)}
                    className={`flex justify-between items-center p-4 rounded-2xl cursor-pointer transition-all ${
                      isComplete ? 'bg-emerald-900/20 border border-emerald-900/50' : 'bg-slate-700/50 hover:bg-slate-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
                        isComplete ? 'bg-emerald-800 text-emerald-300' : 'bg-slate-600 text-white'
                      }`}>
                        {isComplete ? <CheckCircle className="w-6 h-6" /> : item.quantity}
                      </div>
                      <span className={`text-xl font-bold transition-all ${
                        isComplete ? 'line-through text-emerald-500/50' : 'text-slate-100'
                      }`}>
                        {menuItem?.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* If they are all complete */}
            {order.relevantItems.every((item: any, i: number) => completedItems[`${order.id}-${item.menuItemId}-${i}`]) && (
              <div className="bg-emerald-600 p-4 text-center">
                <p className="text-white font-bold tracking-widest uppercase">Barchasi tayyor</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {displayOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-32 text-slate-600">
          <CheckCircle className="w-24 h-24 mb-6 opacity-20" />
          <h2 className="text-3xl font-bold tracking-tight">Hozircha buyurtmalar yo'q</h2>
          <p className="text-lg mt-2 font-medium">Yangi buyurtmalar kutilmoqda...</p>
        </div>
      )}
    </div>
  );
};
