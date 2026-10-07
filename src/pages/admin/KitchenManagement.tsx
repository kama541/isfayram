import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { KitchenStation } from '../../types';

export const KitchenManagement = () => {
  const { kitchenStations, addKitchenStation, updateKitchenStation, deleteKitchenStation } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<KitchenStation | null>(null);
  const [newStation, setNewStation] = useState<Partial<KitchenStation>>({
    name: '',
    description: '',
    isActive: true,
  });

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

  const handleSeed = async () => {
    (window as any).customConfirm("Avtomatik ravishda 4 ta asosiy oshxona xonalarini qo'shishni xohlaysizmi?", async () => {
      await addKitchenStation({ name: 'Baliq xonasi', description: 'Baliq taomlari pishiriladigan xona' });
      await addKitchenStation({ name: 'Shashlik xonasi', description: 'Shashlik pishiriladigan xona' });
      await addKitchenStation({ name: 'Tandir', description: 'Tandir taomlari va non pishiriladigan xona' });
      await addKitchenStation({ name: 'Bar', description: 'Ichimliklar tayyorlanadigan xona' });
      alert("Xonalar muvaffaqiyatli qo'shildi!");
    });
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Oshxonalar Boshqaruvi</h1>
          <p className="text-slate-500 text-sm mt-1">Oshxona bo'limlarini boshqarish</p>
        </div>
        <div className="flex gap-2">
          {kitchenStations.length === 0 && (
            <button 
              onClick={handleSeed}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
            >
              Avto to'ldirish
            </button>
          )}
          <button 
            onClick={() => openModal()}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" /> Yangi Oshxona
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kitchenStations.map(station => (
          <div key={station.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-slate-800">{station.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${station.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {station.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {station.isActive ? 'Faol' : 'Nofaol'}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 mb-6 min-h-[40px]">
              {station.description || "Ta'rif kiritilmagan"}
            </p>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-50">
              <button 
                onClick={() => openModal(station)} 
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  (window as any).customConfirm("Rostdan ham ushbu oshxonani o'chirmoqchimisiz?", () => { deleteKitchenStation(station.id); });
                }} 
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {kitchenStations.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white border border-dashed border-slate-200 rounded-2xl">
            Hali oshxona bo'limlari qo'shilmagan
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{editingStation ? "Oshxonani tahrirlash" : "Yangi oshxona"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nomi</label>
                <input 
                  type="text" 
                  value={newStation.name} 
                  onChange={e => setNewStation({...newStation, name: e.target.value})} 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ta'rifi (ixtiyoriy)</label>
                <textarea 
                  value={newStation.description || ''} 
                  onChange={e => setNewStation({...newStation, description: e.target.value})} 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                />
              </div>
              {editingStation && (
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newStation.isActive}
                    onChange={(e) => setNewStation({...newStation, isActive: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Holati (Faol)</label>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
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
