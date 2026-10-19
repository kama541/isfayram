import { useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ChefHat, Flame, Fish, Coffee, UtensilsCrossed, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatOrderId, formatTableName } from '../../utils/format';
import { getKitchenStationForOrderItem } from '../../utils/kitchenRouting';

export const KDS = ({ department: propDepartment }: { department?: string }) => {
  const params = useParams<{ department: string }>(); 
  const department = propDepartment || params.department || 'all';
  const { orders, menuItems, tables, employees, kitchenStations, updateOrderItemStatus, markOrderItemsReady } = useStore();

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  const getRelevantItems = (items: any[]) => {
    return items.filter(item => {
      if (item.quantity <= 0) return false;
      const station = getKitchenStationForOrderItem(item, menuItems, kitchenStations);
      const stationName = (station?.name || '').toLowerCase();
      
      if (department === 'all') return true;
      if (department === 'shashlik' && stationName.includes('shashlik')) return true;
      if ((department === 'baliq' || department === 'fish') && (stationName.includes('fish') || stationName.includes('baliq'))) return true;
      if (department === 'tandir' && stationName.includes('tandir')) return true;
      if (department === 'bar' && stationName.includes('bar')) return true;
      if ((department === 'oshxona' || department === 'kitchen') && (stationName.includes('oshxona') || stationName.includes('kitchen') || stationName.includes('asosiy'))) return true;

      return false;
    });
  };

  const getTableNumber = (tableId: string) => {
    if (!tableId || tableId === 'takeaway') return 'S-oboy';
    const t = tables.find(t => t.id === tableId);
    return t ? formatTableName(t.number) : 'Noma\'lum';
  };

  const getWaiterName = (waiterId?: string | null) => {
    if (!waiterId) return 'Kassir';
    const w = employees.find(e => e.id === waiterId);
    return w ? w.fullName : 'Noma\'lum';
  };

  const calculateTimeElapsed = (dateString: string) => {
    const ms = new Date().getTime() - new Date(dateString).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return '< 1 daq';
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remaining = mins % 60;
      return `${hrs}s ${remaining}daq`;
    }
    return `${mins} daq`;
  };

  const isUrgent = (dateString: string) => {
    const ms = new Date().getTime() - new Date(dateString).getTime();
    return ms > 15 * 60 * 1000; // 15 minutes = urgent
  };

  // Orders that are currently active and not yet delivered/paid
  const activeOrders = orders.filter(o => !['paid', 'cancelled'].includes(o.status));

  const displayOrders = activeOrders.map(order => {
    const relevantItems = getRelevantItems(order.items);
    // Uncompleted items
    const pendingItems = relevantItems.filter(i => ['pending', 'new', 'accepted', 'cooking'].includes(i.status || 'pending'));
    return { ...order, relevantItems, pendingItems };
  }).filter(order => order.pendingItems.length > 0);

  const getDeptTitle = () => {
    if (department === 'shashlik') return '🔥 SHASHLIK ROOM';
    if (department === 'baliq' || department === 'fish') return '🐟 FISH ROOM';
    if (department === 'tandir') return '🫓 TANDIR';
    if (department === 'bar') return '🥤 BAR';
    if (department === 'oshxona' || department === 'kitchen') return '🍲 ASOSIY OSHXONA';
    return '👨‍🍳 BARCHA SEXLAR (KDS)';
  };

  const getDeptColor = () => {
    if (department === 'shashlik') return '#ea580c';
    if (department === 'baliq' || department === 'fish') return '#0ea5e9';
    if (department === 'tandir') return '#d97706';
    if (department === 'bar') return '#8b5cf6';
    if (department === 'oshxona' || department === 'kitchen') return '#10b981';
    return '#D4AF37';
  };

  const deptColor = getDeptColor();

  // suppress tick lint
  void tick;

  return (
    <div className="min-h-screen text-slate-100 font-sans select-none" style={{ background: '#0D0C09' }}>
      
      {/* KDS Header — large and readable from across the kitchen */}
      <header 
        className="flex justify-between items-center px-6 sm:px-10 py-5 border-b"
        style={{ background: '#13120F', borderColor: `${deptColor}30` }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="p-4 rounded-3xl"
            style={{ background: `${deptColor}25`, border: `1.5px solid ${deptColor}40` }}
          >
            {department === 'shashlik' ? <Flame className="w-10 h-10" style={{ color: '#ea580c' }} /> :
             (department === 'baliq' || department === 'fish') ? <Fish className="w-10 h-10" style={{ color: '#0ea5e9' }} /> :
             department === 'tandir' ? <UtensilsCrossed className="w-10 h-10" style={{ color: '#d97706' }} /> :
             department === 'bar' ? <Coffee className="w-10 h-10" style={{ color: '#8b5cf6' }} /> :
             (department === 'oshxona' || department === 'kitchen') ? <ChefHat className="w-10 h-10" style={{ color: '#10b981' }} /> :
             <ChefHat className="w-10 h-10" style={{ color: '#D4AF37' }} />}
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase" style={{ color: deptColor }}>
              {getDeptTitle()}
            </h1>
            <p className="font-bold tracking-widest text-sm mt-0.5" style={{ color: '#8A8070' }}>
              ISFAYRAM KAFE — Realtime Oshxona Ekrani
            </p>
          </div>
        </div>

        {/* Clock & Stats */}
        <div className="text-right">
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight tabular-nums">
            {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <p className="font-extrabold text-sm mt-1" style={{ color: '#A39B8B' }}>
            Aktiv: <span style={{ color: deptColor }}>{displayOrders.length}</span> ta buyurtma
          </p>
        </div>
      </header>

      {/* Orders Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 items-start">
        {displayOrders.map(order => {
          const urgent = isUrgent(order.createdAt);
          const elapsed = calculateTimeElapsed(order.createdAt);

          return (
            <div 
              key={order.id} 
              className="rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all"
              style={{ 
                background: '#1C1A17',
                border: urgent ? '2px solid #ef4444' : `2px solid ${deptColor}30`,
                boxShadow: urgent ? '0 0 20px rgba(239,68,68,0.2)' : `0 0 20px ${deptColor}10`,
              }}
            >
              {/* Card Header */}
              <div 
                className="p-5 flex justify-between items-start border-b"
                style={{ 
                  background: urgent ? 'rgba(239,68,68,0.12)' : `${deptColor}12`,
                  borderColor: urgent ? 'rgba(239,68,68,0.3)' : `${deptColor}25`,
                }}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-3xl font-black text-white tracking-wide">
                      #{formatOrderId(order.id)}
                    </span>
                    {urgent && (
                      <span className="text-xs font-black uppercase tracking-wider bg-red-500 text-white px-2.5 py-1 rounded-xl animate-pulse">
                        Shoshilinch!
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black mt-1" style={{ color: deptColor }}>
                    {getTableNumber(order.tableId)}
                  </h3>
                  <p className="text-sm font-bold mt-1" style={{ color: '#A39B8B' }}>
                    {getWaiterName(order.waiterId)}
                  </p>
                </div>

                <div className="text-right">
                  <div 
                    className={`flex items-center gap-1.5 font-black text-lg justify-end ${urgent ? 'text-red-400' : 'text-emerald-400'}`}
                  >
                    <Clock className="w-5 h-5" />
                    <span>{elapsed}</span>
                  </div>
                  <p className="text-xs font-semibold mt-1" style={{ color: '#6C6659' }}>
                    {new Date(order.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 space-y-3 flex-1">
                {order.pendingItems.map((item: any) => {
                  const menuItem = menuItems.find(m => m.id === item.menuItemId);
                  const isCooking = item.status === 'cooking';

                  return (
                    <div 
                      key={item.id}
                      className="p-4 rounded-2xl border flex flex-col gap-3"
                      style={{
                        background: isCooking ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)',
                        borderColor: isCooking ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {/* Quantity Badge */}
                          <div 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0"
                            style={{ background: isCooking ? 'rgba(245,158,11,0.2)' : '#13120F', color: isCooking ? '#fbbf24' : deptColor }}
                          >
                            {item.quantity}×
                          </div>
                          {/* Dish Name */}
                          <span className="text-xl font-extrabold text-white leading-tight">
                            {menuItem?.name || item.notes || 'Taom'}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <span 
                          className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl flex-shrink-0"
                          style={isCooking 
                            ? { background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }
                            : { background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' }
                          }
                        >
                          {isCooking ? '🔥 Pishmoqda' : '🆕 Yangi'}
                        </span>
                      </div>

                      {/* Action Buttons - Large Touch Targets */}
                      <div className="flex gap-2">
                        {!isCooking && (
                          <button
                            onClick={() => updateOrderItemStatus(order.id, item.id, 'cooking')}
                            className="flex-1 h-12 rounded-2xl text-sm font-black uppercase tracking-wider transition-all active:scale-95 shadow-md"
                            style={{ 
                              background: 'rgba(245,158,11,0.2)', 
                              color: '#fbbf24',
                              border: '1px solid rgba(245,158,11,0.35)'
                            }}
                          >
                            🍳 Qabul qilish (Cooking)
                          </button>
                        )}
                        <button
                          onClick={() => updateOrderItemStatus(order.id, item.id, 'ready')}
                          className="flex-1 h-12 rounded-2xl text-sm font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                          style={{
                            background: '#059669',
                            color: 'white',
                            border: '1px solid rgba(5,150,105,0.5)',
                            boxShadow: '0 4px 12px rgba(5,150,105,0.35)',
                          }}
                        >
                          <CheckCircle className="w-5 h-5" /> Tayyor!
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* "Mark All Ready" Footer */}
              <div className="p-4 border-t" style={{ background: '#13120F', borderColor: 'rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => markOrderItemsReady(order.id, order.pendingItems.map((i: any) => i.id))}
                  className="w-full h-14 rounded-2xl font-black text-base uppercase tracking-widest transition-all active:scale-98 flex items-center justify-center gap-2 shadow-lg"
                  style={{
                    background: 'rgba(5,150,105,0.2)',
                    color: '#34d399',
                    border: '1.5px solid rgba(5,150,105,0.4)',
                  }}
                >
                  <CheckCircle className="w-5 h-5" />
                  Barchasini Tayyor Deb Belgilash ✓
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {displayOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-32 pb-16 text-center px-6">
          <div 
            className="w-32 h-32 rounded-full flex items-center justify-center mb-8"
            style={{ background: `${deptColor}12`, border: `2px solid ${deptColor}25` }}
          >
            <CheckCircle className="w-16 h-16 opacity-40" style={{ color: deptColor }} />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-white mb-3">Buyurtmalar yo'q</h2>
          <p className="text-xl font-bold" style={{ color: '#6C6659' }}>Barcha buyurtmalar tayyorlangan ✓</p>
        </div>
      )}
    </div>
  );
};
