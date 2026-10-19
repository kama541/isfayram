import React, { useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Plus, Lock, User, Settings as SettingsIcon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Link, useNavigate } from 'react-router-dom';
import { TablesOverview } from '../../components/TablesOverview';

export const WaiterDashboard = () => {
  const { waiterCalls, resolveWaiterCall } = useStore();
  const navigate = useNavigate();
  const pendingCalls = waiterCalls.filter(c => c.status === 'pending');

  const storedUser = localStorage.getItem('currentUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  // Auto-lock timer: if shared terminal is idle for 60 seconds, return to PIN screen
  const idleTimerRef = useRef<any>(null);

  const handleLock = () => {
    localStorage.removeItem('currentUser');
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const resetTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        handleLock();
      }, 60000); // 60 seconds idle auto-lock
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      events.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, []);

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 select-none">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase" style={{ color: '#D4AF37' }}>
              Ofitsiant Paneli
            </h1>
            {currentUser && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-black bg-amber-500/10 border border-amber-500/30 text-amber-300">
                <User className="w-4 h-4 text-amber-400" />
                {currentUser.fullName}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base font-semibold mt-1" style={{ color: '#A39B8B' }}>
            Stollar xaritasi va chaqiriqlar (Buyurtmadan so'ng avtomatik qulflanadi)
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <Link
            to="/waiter/settings"
            className="px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl text-sm sm:text-base font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 bg-amber-950/20 shadow-md"
            title="Sozlamalar va Rol tanlash"
          >
            <SettingsIcon className="w-5 h-5 text-amber-400" />
            <span className="hidden sm:inline">Sozlamalar</span>
          </Link>

          <button
            onClick={handleLock}
            className="px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl text-sm sm:text-base font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 border border-red-500/40 hover:bg-red-500/20 text-red-400 bg-red-950/20"
            title="Boshqa ofitsiant uchun qulflash"
          >
            <Lock className="w-5 h-5 text-red-400" />
            <span className="hidden sm:inline">Qulflash (PIN)</span>
          </button>

          <Link 
            to="/waiter/new-order" 
            className="px-6 sm:px-8 py-3.5 rounded-2xl text-base font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-xl"
            style={{ background: '#D4AF37', color: '#13120F', boxShadow: '0 4px 20px rgba(212,175,55,0.25)' }}
          >
            <Plus className="w-5 h-5" />
            Yangi Buyurtma
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <TablesOverview />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-wide" style={{ color: '#D4AF37' }}>
              <Bell className="w-5 h-5 text-red-500 animate-bounce" /> Chaqiriqlar
            </h2>
            {pendingCalls.length > 0 && (
              <span className="bg-red-500 text-white font-black text-xs px-2.5 py-0.5 rounded-full shadow-sm">
                {pendingCalls.length} ta
              </span>
            )}
          </div>

          <div className="rounded-3xl p-4 sm:p-5 space-y-3" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.15)' }}>
            {pendingCalls.map(call => (
              <div 
                key={call.id} 
                className="p-4 rounded-2xl relative overflow-hidden transition-all shadow-md" 
                style={{ background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.3)' }}
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-l-2xl"></div>
                <div className="flex justify-between items-center pl-2">
                  <div>
                    <h3 className="font-black text-lg text-red-400">Stol №{call.tableId.replace('t', '')}</h3>
                    <p className="text-xs font-bold mt-0.5 text-red-300">Ofitsiant chaqirmoqda!</p>
                  </div>
                  <button 
                    onClick={() => resolveWaiterCall(call.id)}
                    className="p-2.5 rounded-xl transition-all hover:bg-emerald-500/20 active:scale-90 text-emerald-400 border border-emerald-500/30"
                    title="Bajarildi deb belgilash"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
            {pendingCalls.length === 0 && (
              <div className="text-base font-bold text-center py-10" style={{ color: '#6C6659' }}>
                Yangi chaqiriqlar yo'q
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
