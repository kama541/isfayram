import { Calendar, Plus, Clock, Users, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useLocalStore } from '../../store/useLocalStore';

export const Reservations = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReservation, setNewReservation] = useState({ name: '', phone: '', date: '', time: '', guests: 1, tableNumber: 1 });
  
  const { reservations, addReservation, deleteReservation, updateReservationStatus } = useLocalStore();

  const handleAddReservation = (e: React.FormEvent) => {
    e.preventDefault();
    addReservation({ ...newReservation, status: 'upcoming' });
    setNewReservation({ name: '', phone: '', date: '', time: '', guests: 1, tableNumber: 1 });
    setIsModalOpen(false);
  };
  
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const canCancel = currentUser?.role === 'cashier' || currentUser?.role === 'admin';
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-pink-500" /> Stol bron qilish
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" /> Yangi bron
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reservations.map(res => (
          <div key={res.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-pink-500"></div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{res.name}</h3>
            <p className="text-slate-500 text-sm mb-4">{res.phone}</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Vaqti</div>
                  <div className="font-semibold">{res.date} soat {res.time}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Users className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Odam soni</div>
                  <div className="font-semibold">{res.guests} kishi, {res.tableNumber}-stol</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {res.status === 'upcoming' && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">Kutilmoqda</span>}
              {res.status === 'completed' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">Yakunlangan</span>}
              {res.status === 'cancelled' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold">Bekor qilingan</span>}
            </div>

            <div className="mt-6 flex gap-3">
              {res.status === 'upcoming' && (
                <button 
                  onClick={() => updateReservationStatus(res.id, 'completed')} 
                  className="flex-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 py-2 rounded-xl font-semibold transition-colors flex justify-center items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Yakunlash
                </button>
              )}
              {res.status === 'upcoming' && canCancel && (
                <button 
                  onClick={() => updateReservationStatus(res.id, 'cancelled')} 
                  className="flex-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 py-2 rounded-xl font-semibold transition-colors flex justify-center items-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Otmen
                </button>
              )}
              <button 
                onClick={() => deleteReservation(res.id)} 
                className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 p-2 rounded-xl font-semibold transition-colors flex justify-center items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Stol bron qilish</h2>
            <form onSubmit={handleAddReservation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mijoz ismi</label>
                <input type="text" value={newReservation.name} onChange={e => setNewReservation({...newReservation, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefon</label>
                <input type="text" value={newReservation.phone} onChange={e => setNewReservation({...newReservation, phone: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" required />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sana</label>
                  <input type="date" value={newReservation.date} onChange={e => setNewReservation({...newReservation, date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vaqt</label>
                  <input type="time" value={newReservation.time} onChange={e => setNewReservation({...newReservation, time: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" required />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stol raqami</label>
                  <input type="number" min="1" value={newReservation.tableNumber} onChange={e => setNewReservation({...newReservation, tableNumber: Number(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Odam soni</label>
                  <input type="number" min="1" value={newReservation.guests} onChange={e => setNewReservation({...newReservation, guests: Number(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none" required />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition-colors">
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
