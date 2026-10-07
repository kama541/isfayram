import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, ChevronLeft, Delete, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { Employee } from '../types';

export const Login = () => {
  const navigate = useNavigate();
  const { employees } = useStore();
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [pin, setPin] = useState('');
  const [adminClicks, setAdminClicks] = useState(0);
  const [error, setError] = useState(false);

  const handleAdminClick = () => {
    const newClicks = adminClicks + 1;
    setAdminClicks(newClicks);
    if (newClicks >= 3) {
      navigate('/admin/login');
    }
  };

  const activeWaiters = employees.filter(e => e.role === 'waiter' && e.isActive);

  const activeKitchen = employees.filter(e => e.role === 'kitchen' && e.isActive);

  const { computerDevices } = useStore();
  const deviceId = localStorage.getItem('device_id');
  const device = computerDevices?.find(d => d.computer_id === deviceId);
  const isAssignedDevice = device && device.status === 'active' && device.assigned_role !== 'none';
  const showReturnButton = isAssignedDevice && sessionStorage.getItem('explicitLogout') === 'true';

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      if (newPin.length === 4) {
        if (selectedUser && newPin === selectedUser.pinCode) {
          sessionStorage.removeItem('explicitLogout');
          localStorage.setItem('currentUser', JSON.stringify(selectedUser));
          navigate(`/${selectedUser.role}`);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  if (selectedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden" style={{ background: '#13120F' }}>
        {/* Animated Background Logo */}
        <motion.div
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-5"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <img src="/logo.png" alt="" className="w-[800px] h-[800px] object-contain filter blur-[2px]" />
        </motion.div>

        <div className="max-w-sm w-full relative z-10">
          <button
            onClick={() => { setSelectedUser(null); setPin(''); setError(false); }}
            className="flex items-center gap-2 mb-8 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: '#8A8070' }}
          >
            <ChevronLeft className="w-5 h-5" /> Orqaga
          </button>

          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl"
              style={{ background: 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.3)' }}
            >
              {selectedUser.role === 'cashier'
                ? <ShoppingCart className="w-8 h-8" style={{ color: '#D4AF37' }} />
                : selectedUser.role === 'kitchen'
                  ? <ChefHat className="w-8 h-8" style={{ color: '#D4AF37' }} />
                  : <UserIcon className="w-8 h-8" style={{ color: '#D4AF37' }} />
              }
            </div>
            <h2 className="text-2xl font-bold" style={{ color: '#F5F2EA' }}>{selectedUser.fullName}</h2>
            <p className="text-sm mt-1 capitalize" style={{ color: '#8A8070' }}>
              {selectedUser.role === 'cashier' ? 'Kassir' : selectedUser.role === 'kitchen' ? 'Oshxona' : 'Ofitsiant'}
            </p>
          </div>

          {/* PIN dots */}
          <div className="flex justify-center gap-4 mb-10">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="w-4 h-4 rounded-full transition-all duration-150"
                style={{
                  background: i < pin.length
                    ? (error ? '#ef4444' : '#D4AF37')
                    : 'rgba(255,255,255,0.1)',
                  boxShadow: i < pin.length && !error ? '0 0 12px rgba(212,175,55,0.4)' : 'none'
                }}
              />
            ))}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handlePinPress(num.toString())}
                className="h-16 rounded-2xl text-2xl font-medium transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F2EA', border: '1px solid rgba(212,175,55,0.1)' }}
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handlePinPress('0')}
              className="h-16 rounded-2xl text-2xl font-medium transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#F5F2EA', border: '1px solid rgba(212,175,55,0.1)' }}
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#8A8070', border: '1px solid rgba(212,175,55,0.1)' }}
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden" style={{ background: '#13120F' }}>
      {showReturnButton && (
        <div className="absolute top-6 right-6 z-50">
          <button 
            onClick={() => {
              sessionStorage.removeItem('explicitLogout');
              window.location.reload();
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95"
            style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            Qaytish ({device?.assigned_role === 'cashier' ? 'Kassir' : 'Ofitsiant'})
          </button>
        </div>
      )}

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none z-0"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
      />

      {/* Animated Background Logo */}
      <motion.div
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-5"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <img src="/logo.png" alt="" className="w-[800px] h-[800px] object-contain filter blur-[2px]" />
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mb-12 relative z-10"
      >
        <div
          onClick={handleAdminClick}
          className="mb-5 cursor-pointer select-none"
        >
          <motion.img
            src="/logo.png"
            alt="Isfayram Logo"
            className="h-28 object-contain rounded-3xl drop-shadow-2xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            whileTap={{ scale: 0.95 }}
          />
        </div>
        <h1 className="text-3xl font-black tracking-widest uppercase" style={{ color: '#D4AF37', fontFamily: 'serif' }}>ISFAYRAM</h1>
        <p className="text-sm mt-2 tracking-[0.2em] uppercase" style={{ color: '#6C6659' }}>Tizimga kirish uchun o'zingizni tanlang</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={`max-w-4xl w-full grid grid-cols-1 ${activeKitchen.length > 0 ? 'md:grid-cols-[1fr_300px]' : ''} gap-6 relative z-10 px-4`}
      >
        {/* Waiters */}
        <div className="p-6 rounded-3xl" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.12)' }}>
          <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: '#D4AF37' }}>
            <UserIcon className="w-4 h-4" /> Ofitsiantlar
          </h2>
          {activeWaiters.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: '#6C6659' }}>Hali ofitsiantlar qo'shilmagan.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {activeWaiters.map(waiter => (
                <button
                  key={waiter.id}
                  onClick={() => setSelectedUser(waiter)}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all active:scale-95 hover:bg-white/5 w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-11px)] lg:w-[calc(25%-12px)]"
                  style={{ border: '1px solid rgba(212,175,55,0.12)' }}
                >
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-sm text-center leading-tight" style={{ color: '#F5F2EA' }}>{waiter.fullName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cashier + Kitchen */}
        <div className="space-y-4">
          {activeKitchen.length > 0 && (
            <div className="p-5 rounded-3xl" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.12)' }}>
              <h2 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: '#D4AF37' }}>
                <ChefHat className="w-4 h-4" /> Oshxona
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {activeKitchen.map(kitchen => (
                  <button
                    key={kitchen.id}
                    onClick={() => setSelectedUser(kitchen)}
                    className="flex items-center gap-2 p-3 rounded-2xl transition-all active:scale-95 hover:bg-white/5"
                    style={{ border: '1px solid rgba(212,175,55,0.12)' }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
                      <ChefHat className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs truncate" style={{ color: '#F5F2EA' }}>{kitchen.fullName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
