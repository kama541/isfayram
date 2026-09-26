import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, Lock, ChevronLeft, Delete } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { Employee } from '../types';

export const Login = () => {
  const navigate = useNavigate();
  const { employees } = useStore();
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [pin, setPin] = useState('');
  const [adminClicks, setAdminClicks] = useState(0);

  const handleAdminClick = () => {
    const newClicks = adminClicks + 1;
    setAdminClicks(newClicks);
    if (newClicks >= 3) {
      navigate('/admin/login');
    }
  };

  const activeWaiters = employees.filter(e => e.role === 'waiter' && e.isActive);
  const activeCashiers = employees.filter(e => e.role === 'cashier' && e.isActive);

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        if (selectedUser && newPin === selectedUser.pinCode) {
          localStorage.setItem('currentUser', JSON.stringify(selectedUser));
          navigate(`/${selectedUser.role}`);
        } else {
          alert('Notog\'ri PIN kod!');
          setPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  if (selectedUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="max-w-sm w-full">
          <button 
            onClick={() => { setSelectedUser(null); setPin(''); }}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Orqaga
          </button>
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
              {selectedUser.role === 'cashier' ? <ShoppingCart className="w-8 h-8 text-emerald-400" /> : <UserIcon className="w-8 h-8 text-blue-400" />}
            </div>
            <h2 className="text-2xl font-bold text-white">{selectedUser.fullName}</h2>
            <p className="text-slate-400 text-sm mt-1 capitalize">{selectedUser.role === 'cashier' ? 'Kassir' : 'Ofitsiant'}</p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < pin.length ? 'bg-blue-500 scale-110 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`} />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button 
                key={num}
                onClick={() => handlePinPress(num.toString())}
                className="h-16 bg-slate-800 text-white text-2xl font-medium rounded-2xl hover:bg-slate-700 active:bg-slate-600 transition-colors shadow-sm"
              >
                {num}
              </button>
            ))}
            <div />
            <button 
              onClick={() => handlePinPress('0')}
              className="h-16 bg-slate-800 text-white text-2xl font-medium rounded-2xl hover:bg-slate-700 active:bg-slate-600 transition-colors shadow-sm"
            >
              0
            </button>
            <button 
              onClick={handleBackspace}
              className="h-16 bg-slate-800 text-slate-400 flex items-center justify-center rounded-2xl hover:bg-slate-700 hover:text-white active:bg-slate-600 transition-colors shadow-sm"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <img src="/logo.png" alt="Background Logo" className="w-[80vw] h-[80vh] object-contain" />
      </div>

      <div className="flex flex-col items-center mb-10 relative z-10">
        <div 
          onClick={handleAdminClick}
          className="mb-6 cursor-pointer select-none transition-all"
        >
          <motion.img 
            src="/logo.png" 
            alt="Isfayram Logo" 
            className="h-36 object-contain drop-shadow-2xl rounded-3xl"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight hidden">Isfayram</h1>
        <p className="text-slate-500 mt-2 font-medium">Tizimga kirish uchun o'zingizni tanlang</p>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Waiters Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-500" /> Ofitsiantlar
          </h2>
          {activeWaiters.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Hali ofitsiantlar qo'shilmagan.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {activeWaiters.map(waiter => (
                <button 
                  key={waiter.id}
                  onClick={() => setSelectedUser(waiter)}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-blue-600 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm text-center">{waiter.fullName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cashier Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-500" /> Kassa
          </h2>
          {activeCashiers.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Hali kassirlar qo'shilmagan.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {activeCashiers.map(cashier => (
                <button 
                  key={cashier.id}
                  onClick={() => setSelectedUser(cashier)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                >
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-800 text-lg">{cashier.fullName}</h3>
                    <p className="text-sm text-slate-500">Kassaga kirish uchun bosing</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 h-10">
        {/* Admin login button removed. Secretly click the main logo icon 3 times to access admin panel. */}
      </div>
    </div>
  );
};
