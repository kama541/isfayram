import { MapPin, Clock, Wifi, MoreHorizontal } from 'lucide-react';

export const AdminDashboard = () => {
  return (
    <div className="p-10 min-h-screen bg-[#222838] font-sans">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-2">Рестораны</h1>
        <p className="text-slate-400 mb-10 text-[15px]">Управление ресторанами вашей сети</p>

        <div className="bg-[#3b4358] rounded-3xl p-8 max-w-[400px] shadow-2xl relative overflow-hidden group hover:bg-[#434b61] transition-colors cursor-pointer">
          <div className="absolute top-6 right-6 flex gap-1 items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors">
            <MoreHorizontal className="w-5 h-5 text-slate-300" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-8">Isfayram Kafe</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-slate-300">
              <MapPin className="w-5 h-5 opacity-70" />
              <span className="text-[15px]">Quvasoy, Uzbekistan</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Clock className="w-5 h-5 opacity-70" />
              <span className="text-[15px]">Asia/Tashkent</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-slate-400/80 text-sm mb-3">Нет контактной информации</p>
            <div className="flex items-center gap-2 text-[#ff4b4b] text-sm font-medium">
              <Wifi className="w-4 h-4" /> Синхронизация 26 minutes ago
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
