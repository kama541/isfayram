import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, ChefHat, Activity, Flame, UtensilsCrossed, Wine, Wheat } from 'lucide-react';
import type { KitchenStation } from '../../types';
import { formatOrderId, formatTableName } from '../../utils/format';
import { getKitchenStationForOrderItem } from '../../utils/kitchenRouting';

const STATION_ICONS: Record<string, any> = {
  '🐟 Fish Room': UtensilsCrossed,
  '🔥 Shashlik Room': Flame,
  '🫓 Tandir': Wheat,
  '🥤 Bar': Wine,
  '🍲 Asosiy Oshxona': ChefHat,
};

export const KitchenManagement = () => {
  const { kitchenStations, orders, menuItems, tables, addKitchenStation, updateKitchenStation, deleteKitchenStation } = useStore();
  const [activeTab, setActiveTab] = useState<'monitor' | 'stations'>('monitor');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<KitchenStation | null>(null);
  const [newStation, setNewStation] = useState<Partial<KitchenStation>>({
    name: '',
    description: '',
    isActive: true,
  });

  const activeStations = useMemo(() => {
    return kitchenStations.filter(s => s.isActive);
  }, [kitchenStations]);

  // Aggregate items across active & recent orders per kitchen station
  const stationActivity = useMemo(() => {
    const activityMap: Record<string, { current: any[]; preparing: any[]; ready: any[]; completed: any[] }> = {};

    activeStations.forEach(st => {
      activityMap[st.id] = { current: [], preparing: [], ready: [], completed: [] };
    });

    orders.forEach(order => {
      const table = tables.find(t => t.id === order.tableId);
      const tableLabel = table ? formatTableName(table.number) : (order.tableId === 'takeaway' ? 'S-oboy' : 'Stol');

      order.items.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        let station = getKitchenStationForOrderItem(item, menuItems, activeStations);
        let stationId = station?.id;

        if (stationId && activityMap[stationId]) {
          const entry = {
            orderId: order.id,
            tableLabel,
            itemName: menuItem?.name || item.name || 'Taom',
            quantity: item.quantity,
            status: item.status || 'pending',
            createdAt: order.createdAt,
            orderStatus: order.status
          };

          if (order.status === 'paid' || item.status === 'delivered') {
            activityMap[stationId].completed.push(entry);
          } else if (item.status === 'ready') {
            activityMap[stationId].ready.push(entry);
            activityMap[stationId].current.push(entry);
          } else if (item.status === 'cooking' || item.status === 'accepted') {
            activityMap[stationId].preparing.push(entry);
            activityMap[stationId].current.push(entry);
          } else {
            activityMap[stationId].preparing.push(entry);
            activityMap[stationId].current.push(entry);
          }
        }
      });
    });

    return activityMap;
  }, [orders, menuItems, activeStations, tables]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStation.name) return;
    
    if (editingStation) {
      await updateKitchenStation({
        ...editingStation,
        name: newStation.name,
        description: newStation.description,
        isActive: newStation.isActive ?? true,
      });
    } else {
      await addKitchenStation({
        name: newStation.name,
        description: newStation.description,
      });
    }
    
    closeModal();
  };

  const openModal = (station?: KitchenStation) => {
    if (station) {
      setEditingStation(station);
      setNewStation({
        name: station.name,
        description: station.description,
        isActive: station.isActive,
      });
    } else {
      setEditingStation(null);
      setNewStation({
        name: '',
        description: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStation(null);
    setNewStation({ name: '', description: '', isActive: true });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <ChefHat className="w-7 h-7 text-amber-500" /> Oshxona
          </h1>
        </div>

        <div className="flex gap-2">
          {activeTab === 'stations' && (
            <button 
              onClick={() => openModal()}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" /> Yangi Xona
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'monitor'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-400" /> Jonli Oshxona Monitoringi
        </button>
        <button
          onClick={() => setActiveTab('stations')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'stations'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Xonalar Ro'yxati & Sozlamalar
        </button>
      </div>

      {/* TAB 1: LIVE KITCHEN MONITORING */}
      {activeTab === 'monitor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {activeStations.map(station => {
            const data = stationActivity[station.id] || { current: [], preparing: [], ready: [], completed: [] };
            const Icon = STATION_ICONS[station.name] || ChefHat;

            return (
              <div 
                key={station.id} 
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-black text-slate-800 dark:text-white text-base">{station.name}</h2>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{station.description || 'Oshxona bo\'limi'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Counters */}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Jarayonda</span>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400">{data.preparing.length}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Tayyor</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{data.ready.length}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Bajarilgan</span>
                      <span className="text-base font-black text-slate-600 dark:text-slate-400">{data.completed.length}</span>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="mt-5 space-y-2.5 max-h-72 overflow-y-auto no-scrollbar pr-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Faol Buyurtmalar:</p>
                    {data.current.length === 0 ? (
                      <p className="text-xs text-center py-6 text-slate-400 italic">Hozirda yangi buyurtma yo'q</p>
                    ) : (
                      data.current.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex justify-between items-center"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{item.itemName}</span>
                              <span className="font-black text-xs text-indigo-600">x{item.quantity}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {item.tableLabel} • #{formatOrderId(item.orderId)}
                            </span>
                          </div>

                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            item.status === 'ready' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                          }`}>
                            {item.status === 'ready' ? 'Tayyor' : 'Kutilmoqda'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <span>Jami kirim: {data.current.length + data.completed.length} taom</span>
                  <span className="flex items-center gap-1 font-bold text-emerald-500">
                    <CheckCircle className="w-3.5 h-3.5" /> Faol
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: STATIONS LIST & EDIT */}
      {activeTab === 'stations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kitchenStations.map(station => (
            <div key={station.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-black text-base text-slate-800 dark:text-white">{station.name}</h3>
                  <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${station.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600'}`}>
                    {station.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {station.isActive ? 'Faol' : 'Nofaol'}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 min-h-[30px]">
                  {station.description || "Ta'rif kiritilmagan"}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                  onClick={() => openModal(station)} 
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    (window as any).customConfirm?.("Rostdan ham ushbu oshxonani o'chirmoqchimisiz?", () => { deleteKitchenStation(station.id); });
                  }} 
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              {editingStation ? "Xonani tahrirlash" : "Yangi oshxona xonasi"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Xona nomi</label>
                <input 
                  type="text" 
                  value={newStation.name} 
                  onChange={e => setNewStation({ ...newStation, name: e.target.value })} 
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" 
                  required 
                  placeholder="Masalan: 🔥 Shashlik Room"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ta'rif</label>
                <textarea 
                  value={newStation.description} 
                  onChange={e => setNewStation({ ...newStation, description: e.target.value })} 
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" 
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold text-xs">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
