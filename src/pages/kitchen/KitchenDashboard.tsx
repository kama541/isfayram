import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { ChefHat, CheckCircle2, Clock, LogOut, Flame, Fish, Coffee, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTableName, formatOrderId } from '../../utils/format';
import { motion, AnimatePresence } from 'framer-motion';

export const KitchenDashboard = () => {
  const { orders, menuItems, employees, kitchenStations, updateOrderItemStatus, markOrderItemsReady } = useStore();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedStationId, setSelectedStationId] = useState<string>('all');
  const [, setTick] = useState(0);

  // 4 standard rooms
  const activeStations = kitchenStations.filter(s => s.isActive);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const u = JSON.parse(userStr);
      setCurrentUser(u);
      const emp = employees.find(e => e.id === u.id);
      if (emp?.kitchenStationIds && emp.kitchenStationIds.length > 0) {
        setSelectedStationId(emp.kitchenStationIds[0]);
      }
    }
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, [employees]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const getTableName = (tableId: string) => {
    if (!tableId || tableId === 'takeaway') return 'S-oboy';
    const table = useStore.getState().tables.find(t => t.id === tableId);
    return table ? formatTableName(table.number) : 'Noma\'lum';
  };

  const getWaiterName = (waiterId?: string) => {
    if (!waiterId) return 'Kassir';
    return employees.find(e => e.id === waiterId)?.fullName || 'Noma\'lum';
  };

  const getStationIdForItem = (item: any) => {
    if (item.kitchenStationId) return item.kitchenStationId;
    const mi = menuItems.find(m => m.id === item.menuItemId);
    if (mi?.kitchenStationId) return mi.kitchenStationId;
    const name = (mi?.name || '').toLowerCase();
    if (name.includes('shashlik') || name.includes('kabob') || name.includes('mangal') || name.includes('osh') || name.includes('mastava')) {
      return '525ef16d-b118-4942-8617-41a90b39e64d'; // Shashlik Room
    }
    if (name.includes('baliq') || name.includes('fish') || name.includes('sazan')) {
      return '16b9952b-1b9e-40f1-871f-2179ff167d3f'; // Fish Room
    }
    if (name.includes('somsa') || name.includes('tandir') || name.includes('non')) {
      return 'cd884f76-4022-4ae0-863e-a6f4405fae61'; // Tandir
    }
    if (name.includes('cola') || name.includes('choy') || name.includes('ichimlik') || name.includes('suv') || name.includes('pepsi') || name.includes('bar')) {
      return '4b29fc40-ca47-1067-b31d-00dd010662db'; // Bar
    }
    return '525ef16d-b118-4942-8617-41a90b39e64d';
  };

  const getStationIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('shashlik')) return <Flame className="w-5 h-5 text-orange-400" />;
    if (lower.includes('fish') || lower.includes('baliq')) return <Fish className="w-5 h-5 text-cyan-400" />;
    if (lower.includes('tandir')) return <UtensilsCrossed className="w-5 h-5 text-amber-400" />;
    if (lower.includes('bar')) return <Coffee className="w-5 h-5 text-purple-400" />;
    return <ChefHat className="w-5 h-5 text-yellow-400" />;
  };

  // Filter orders: active orders that have uncompleted items for the selected room(s)
  const relevantOrders = orders.filter(order => {
    if (['paid', 'cancelled'].includes(order.status)) return false;
    const itemsForRoom = order.items.filter(item => {
      if (item.quantity <= 0) return false;
      const sId = getStationIdForItem(item);
      const matchesStation = selectedStationId === 'all' || sId === selectedStationId;
      const notDelivered = ['pending', 'new', 'accepted', 'cooking'].includes(item.status || 'pending');
      return matchesStation && notDelivered;
    });
    return itemsForRoom.length > 0;
  });

  const currentStationObj = activeStations.find(s => s.id === selectedStationId);

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#13120F' }}>
      {/* Top Header */}
      <header className="flex flex-wrap justify-between items-center p-5 sticky top-0 z-20 gap-4"
        style={{ background: '#1C1A17', borderBottom: '1px solid rgba(212,175,55,0.15)' }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-widest uppercase" style={{ color: '#D4AF37', fontFamily: 'serif' }}>
              ISFAYRAM KITCHEN
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#8A8070' }}>
              {currentStationObj ? currentStationObj.name : 'Barcha Oshxonalar'} • {currentUser?.fullName || currentUser?.name || 'Oshpaz'}
            </p>
          </div>
        </div>

        {/* Station Navigation Tabs */}
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setSelectedStationId('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedStationId === 'all'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-stone-300 hover:bg-white/10'
            }`}
          >
            Hammasi
          </button>
          {activeStations.map(station => (
            <button
              key={station.id}
              onClick={() => setSelectedStationId(station.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                selectedStationId === station.id
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
                  : 'bg-white/5 text-stone-300 hover:bg-white/10'
              }`}
            >
              {getStationIcon(station.name)}
              <span>{station.name}</span>
            </button>
          ))}
        </div>

        {/* Time and Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-2xl font-bold tracking-tighter" style={{ color: '#F5F2EA' }}>
              {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#8A8070' }}>{relevantOrders.length} faol zakaz</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-3 rounded-xl transition-colors hover:bg-red-500/20"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
            title="Chiqish"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Order Cards Grid */}
      <main className="flex-1 p-6 overflow-auto">
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {relevantOrders.map(order => {
              const myItems = order.items.filter(item => {
                if (item.quantity <= 0) return false;
                const sId = getStationIdForItem(item);
                const matchesStation = selectedStationId === 'all' || sId === selectedStationId;
                const notDelivered = ['pending', 'new', 'accepted', 'cooking'].includes(item.status || 'pending');
                return matchesStation && notDelivered;
              });

              const msElapsed = new Date().getTime() - new Date(order.createdAt).getTime();
              const minsElapsed = Math.floor(msElapsed / 60000);
              const isLate = minsElapsed > 20;
              const isWarning = minsElapsed > 10;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-3xl overflow-hidden flex flex-col shadow-2xl"
                  style={{
                    background: '#1C1A17',
                    border: `2px solid ${isLate ? 'rgba(239,68,68,0.6)' : isWarning ? 'rgba(245,158,11,0.5)' : 'rgba(212,175,55,0.2)'}`,
                  }}
                >
                  {/* Card Header */}
                  <div
                    className="p-4 flex justify-between items-center"
                    style={{
                      background: isLate ? 'rgba(239,68,68,0.12)' : isWarning ? 'rgba(245,158,11,0.1)' : 'rgba(212,175,55,0.06)',
                      borderBottom: '1px solid rgba(212,175,55,0.1)'
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black tracking-tight" style={{ color: '#F5F2EA' }}>
                          #{formatOrderId(order.id)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>
                          {order.status}
                        </span>
                      </div>
                      <p className="font-black text-xl mt-1 tracking-tight" style={{ color: '#D4AF37' }}>
                        {getTableName(order.tableId)}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end font-bold text-sm"
                        style={{ color: isLate ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981' }}
                      >
                        <Clock className="w-4 h-4" /> {minsElapsed} daq
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#8A8070' }}>{getWaiterName(order.waiterId)}</p>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="p-4 flex-1 space-y-3">
                    {myItems.map(item => {
                      const menuItem = menuItems.find(m => m.id === item.menuItemId);
                      const status = item.status || 'pending';
                      const isPending = status === 'pending' || status === 'new';
                      const isCooking = status === 'cooking' || status === 'accepted';

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl flex flex-col gap-2.5 transition-all"
                          style={{
                            background: isPending ? 'rgba(255,255,255,0.04)' : 'rgba(212,175,55,0.08)',
                            border: `1px solid ${isPending ? 'rgba(255,255,255,0.08)' : 'rgba(212,175,55,0.25)'}`
                          }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
                                style={{ background: '#13120F', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}
                              >
                                {item.quantity}×
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-base leading-tight truncate" style={{ color: '#F5F2EA' }}>
                                  {menuItem?.name || item.notes || 'Noma\'lum'}
                                </h3>
                                {item.notes && (
                                  <p className="text-xs mt-0.5 truncate font-medium" style={{ color: '#D4AF37' }}>
                                    Izoh: {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Status badge */}
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
                              style={{
                                background: isPending ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                                color: isPending ? '#f59e0b' : '#10b981'
                              }}
                            >
                              {isPending ? 'Yangi' : 'Pishmoqda'}
                            </span>
                          </div>

                          {/* Action Buttons for this Item */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                            {isPending ? (
                              <button
                                onClick={() => updateOrderItemStatus(order.id, item.id, 'cooking')}
                                className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1"
                                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
                              >
                                <Flame className="w-3.5 h-3.5" /> Pishirish
                              </button>
                            ) : (
                              <button
                                onClick={() => updateOrderItemStatus(order.id, item.id, 'cooking')}
                                disabled
                                className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider opacity-60 text-stone-400 bg-white/5"
                              >
                                Pishmoqda...
                              </button>
                            )}

                            <button
                              onClick={() => updateOrderItemStatus(order.id, item.id, 'ready')}
                              className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                              style={{ background: '#10b981', color: '#FFFFFF' }}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Tayyor
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bulk Complete for this ticket */}
                  {myItems.length > 1 && (
                    <div className="p-3 border-t border-white/5" style={{ background: '#161412' }}>
                      <button
                        onClick={() => markOrderItemsReady(order.id, myItems.map(i => i.id))}
                        className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Barcha taomlarni Tayyor qilish
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {relevantOrders.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-28 text-center" style={{ color: '#6C6659' }}>
                <ChefHat className="w-24 h-24 opacity-15 mb-4" />
                <h2 className="text-2xl font-bold" style={{ color: '#8A8070' }}>Yangi buyurtmalar yo'q</h2>
                <p className="mt-2 text-sm text-stone-500">
                  {currentStationObj ? `${currentStationObj.name} uchun barcha buyurtmalar tayyorlangan` : 'Barcha xonalar uchun buyurtmalar tayyorlangan'}
                </p>
              </div>
            )}
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
};
