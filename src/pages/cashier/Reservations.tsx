import { Calendar, Plus, Clock, Users } from 'lucide-react';
import { useState } from 'react';

const mockReservations = [
  { id: 1, name: 'Sardor', phone: '+998 90 123 45 67', date: '2026-09-27', time: '19:00', guests: 4, tableNumber: 5, status: 'upcoming' },
  { id: 2, name: 'Oila', phone: '+998 91 987 65 43', date: '2026-09-27', time: '20:30', guests: 8, tableNumber: 12, status: 'upcoming' },
];

export const Reservations = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-pink-500" /> Stol bron qilish
        </h1>
        <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors">
          <Plus className="w-5 h-5" /> Yangi bron
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockReservations.map(res => (
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

            <div className="mt-6 flex gap-3">
              <button className="flex-1 bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 py-2 rounded-xl font-semibold transition-colors">Tahrirlash</button>
              <button className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 py-2 rounded-xl font-semibold transition-colors">Bekor qilish</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
