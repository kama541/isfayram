import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { ChefHat, CheckCircle, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTableName } from '../../utils/format';
import { motion, AnimatePresence } from 'framer-motion';

export const KitchenDashboard = () => {
  const { orders, menuItems, employees, updateOrderItemStatus } = useStore();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return null;

  // Find employee record to get kitchenStationIds
  const employeeRecord = employees.find(e => e.id === currentUser.id);
  const myStationIds = employeeRecord?.kitchenStationIds || [];

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

  const relevantOrders = orders.filter(order => {
    if (['paid', 'cancelled'].includes(order.status)) return false;
    const myItems = order.items.filter(item => {
      const stationId = item.kitchenStationId || menuItems.find(m => m.id === item.menuItemId)?.kitchenStationId;
      return stationId && myStationIds.includes(stationId) && ['pending', 'accepted', 'cooking'].includes(item.status || 'pending');
    });
    return myItems.length > 0;
  });

  // Get my station name for display
  const myStation = useStore.getState().kitchenStations.find(k => myStationIds.includes(k.id));

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ background: '#13120F' }}>
      <header className="flex justify-between items-center p-6 sticky top-0 z-10"
        style={{ background: '#1C1A17', borderBottom: '1px solid rgba(212,175,55,0.12)' }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-widest uppercase" style={{ color: '#D4AF37', fontFamily: 'serif' }}>
              {myStation?.name || 'OSHXONA KDS'}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#8A8070' }}>Xodim: {currentUser.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-3xl font-bold tracking-tighter" style={{ color: '#F5F2EA' }}>
              {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-sm mt-0.5" style={{ color: '#8A8070' }}>Jami: {relevantOrders.length} buyurtma</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-3 rounded-xl transition-colors hover:bg-red-500/20"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
            {relevantOrders.map(order => {
              const myItems = order.items.filter(item => {
                const stationId = item.kitchenStationId || menuItems.find(m => m.id === item.menuItemId)?.kitchenStationId;
                return stationId && myStationIds.includes(stationId) && ['pending', 'accepted', 'cooking'].includes(item.status || 'pending');
              });

              const msElapsed = new Date().getTime() - new Date(order.createdAt).getTime();
              const minsElapsed = Math.floor(msElapsed / 60000);
              const isLate = minsElapsed > 20;
              const isWarning = minsElapsed > 10;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-3xl overflow-hidden flex flex-col"
                  style={{
                    background: '#1C1A17',
                    border: `2px solid ${isLate ? 'rgba(239,68,68,0.5)' : isWarning ? 'rgba(245,158,11,0.4)' : 'rgba(212,175,55,0.15)'}`,
                    boxShadow: isLate ? '0 0 30px rgba(239,68,68,0.1)' : '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="p-5 flex justify-between items-center"
                    style={{ background: isLate ? 'rgba(239,68,68,0.08)' : isWarning ? 'rgba(245,158,11,0.08)' : 'rgba(212,175,55,0.05)', borderBottom: '1px solid rgba(212,175,55,0.08)' }}
                  >
                    <div>
                      <h2 className="text-2xl font-black" style={{ color: '#F5F2EA' }}>
                        #{order.id.slice(0, 4).toUpperCase()}
                      </h2>
                      <p className="font-bold text-base mt-0.5" style={{ color: '#D4AF37' }}>{getTableName(order.tableId)}</p>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1.5 justify-end font-bold text-base`}
                        style={{ color: isLate ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981' }}
                      >
                        <Clock className="w-4 h-4" /> {minsElapsed} daq
                      </div>
                      <p className="text-sm mt-1" style={{ color: '#6C6659' }}>{getWaiterName(order.waiterId)}</p>
                    </div>
                  </div>

                  <div className="p-3 flex-1 space-y-2">
                    {myItems.map(item => {
                      const menuItem = menuItems.find(m => m.id === item.menuItemId);
                      const status = item.status || 'pending';
                      const isPending = status === 'pending';

                      return (
                        <div key={item.id}
                          className="p-4 rounded-2xl flex items-center justify-between gap-4 transition-all"
                          style={{
                            background: isPending ? 'rgba(255,255,255,0.04)' : 'rgba(212,175,55,0.08)',
                            border: `1px solid ${isPending ? 'rgba(212,175,55,0.1)' : 'rgba(212,175,55,0.3)'}`
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0"
                              style={{ background: '#13120F', color: '#D4AF37' }}
                            >
                              {item.quantity}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-lg truncate" style={{ color: '#F5F2EA' }}>{menuItem?.name}</h3>
                              {item.notes && (
                                <p className="text-sm mt-0.5 truncate" style={{ color: '#D4AF37' }}>Izoh: {item.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">
                            {isPending ? (
                              <button
                                onClick={() => updateOrderItemStatus(order.id, item.id, 'cooking')}
                                className="px-4 py-2.5 font-bold rounded-xl text-sm uppercase tracking-wider transition-all active:scale-95"
                                style={{ background: '#D4AF37', color: '#13120F', boxShadow: '0 4px 12px rgba(212,175,55,0.3)' }}
                              >
                                Qabul
                              </button>
                            ) : (
                              <button
                                onClick={() => updateOrderItemStatus(order.id, item.id, 'ready')}
                                className="px-4 py-2.5 font-bold rounded-xl text-sm uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
                                style={{ background: '#10b981', color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
                              >
                                <CheckCircle className="w-4 h-4" /> Tayyor
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            {relevantOrders.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-24" style={{ color: '#6C6659' }}>
                <ChefHat className="w-20 h-20 opacity-10 mb-4" />
                <h2 className="text-2xl font-bold" style={{ color: '#8A8070' }}>Yangi buyurtmalar yo'q</h2>
                <p className="mt-2">Barcha buyurtmalar tayyorlangan</p>
              </div>
            )}
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
};
