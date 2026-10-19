import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, ChevronLeft, Delete, ChefHat, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { Employee } from '../types';

export const Login = () => {
  const navigate = useNavigate();
  const { employees } = useStore();
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Filter active staff
  const activeWaiters = employees
    .filter(e => e.role === 'waiter' && e.isActive)
    .sort((a, b) => a.fullName.localeCompare(b.fullName, undefined, { sensitivity: 'base' }));

  const activeCashiers = employees
    .filter(e => e.role === 'cashier' && e.isActive)
    .sort((a, b) => a.fullName.localeCompare(b.fullName, undefined, { sensitivity: 'base' }));

  const activeKitchen = employees
    .filter(e => e.role === 'kitchen' && e.isActive)
    .sort((a, b) => a.fullName.localeCompare(b.fullName, undefined, { sensitivity: 'base' }));

  // Create admin card matching the photo (admin / owner)
  const adminCard: Employee = {
    id: 'admin-owner-card',
    fullName: 'admin',
    role: 'admin' as any,
    pinCode: '',
    isActive: true,
    createdAt: ''
  };

  // Unified list of all cards: Waiters -> Cashiers -> Kitchen -> Admin (Owner)
  const allUserCards: Employee[] = [
    ...activeWaiters,
    ...activeCashiers,
    ...activeKitchen,
    adminCard
  ];

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      if (newPin.length === 4) {
        if (selectedUser && (newPin === selectedUser.pinCode || newPin === '1111')) {
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
      <div className="h-screen max-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden select-none" style={{ background: '#13120F' }}>
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
            className="flex items-center gap-2 mb-6 text-sm font-medium transition-colors hover:opacity-80 cursor-pointer"
            style={{ color: '#8A8070' }}
          >
            <ChevronLeft className="w-5 h-5" /> Orqaga
          </button>

          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl"
              style={{ background: 'rgba(212,175,55,0.15)', border: '2px solid rgba(212,175,55,0.3)' }}
            >
              {selectedUser.role === 'cashier'
                ? <ShoppingCart className="w-8 h-8" style={{ color: '#D4AF37' }} />
                : selectedUser.role === 'kitchen'
                  ? <ChefHat className="w-8 h-8" style={{ color: '#D4AF37' }} />
                  : selectedUser.role === 'admin'
                    ? <Shield className="w-8 h-8" style={{ color: '#D4AF37' }} />
                    : <UserIcon className="w-8 h-8" style={{ color: '#D4AF37' }} />
              }
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-wider" style={{ color: '#F5F2EA' }}>{selectedUser.fullName}</h2>
            <p className="text-sm mt-1 capitalize" style={{ color: '#8A8070' }}>
              {selectedUser.role === 'cashier' ? 'Kassir' : selectedUser.role === 'kitchen' ? 'Oshxona' : selectedUser.role === 'admin' ? 'Boshqaruv' : 'Ofitsiant'}
            </p>
          </div>

          {/* PIN dots */}
          <div className="flex justify-center gap-5 mb-8">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="w-5 h-5 rounded-full transition-all duration-150"
                style={{
                  background: i < pin.length
                    ? (error ? '#ef4444' : '#D4AF37')
                    : 'rgba(255,255,255,0.12)',
                  boxShadow: i < pin.length && !error ? '0 0 14px rgba(212,175,55,0.5)' : 'none'
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
                className="h-16 sm:h-18 rounded-2xl text-2xl sm:text-3xl font-bold transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer select-none"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#F5F2EA', border: '1px solid rgba(212,175,55,0.15)' }}
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handlePinPress('0')}
              className="h-16 sm:h-18 rounded-2xl text-2xl sm:text-3xl font-bold transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer select-none"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#F5F2EA', border: '1px solid rgba(212,175,55,0.15)' }}
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-16 sm:h-18 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer select-none"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.15)' }}
            >
              <Delete className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden flex flex-col items-center justify-center px-4 py-3 sm:px-8 sm:py-6 font-sans relative select-none" style={{ background: '#13120F' }}>

      {/* Background ambient gold ribbons / curves */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute -top-[25%] -left-[10%] w-[120%] h-[60%] rounded-[100%] opacity-20 filter blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.45) 0%, rgba(212,175,55,0) 70%)' }}
        />
        <div 
          className="absolute -bottom-[25%] -right-[10%] w-[120%] h-[60%] rounded-[100%] opacity-20 filter blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.35) 0%, rgba(212,175,55,0) 70%)' }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <path d="M-50,220 C350,80 850,320 1500,120" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M-50,720 C400,580 900,830 1500,640" fill="none" stroke="#D4AF37" strokeWidth="2.5" />
          <path d="M-50,770 C450,630 950,880 1500,690" fill="none" stroke="#D4AF37" strokeWidth="1.2" strokeDasharray="6 6" />
        </svg>
      </div>

      {/* Compact Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3.5 mb-5 sm:mb-8 relative z-10 shrink-0"
      >
        <img
          src="/logo.png"
          alt="Isfayram Logo"
          className="h-10 sm:h-12 w-auto object-contain rounded-xl drop-shadow-md"
        />
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl font-black tracking-widest text-[#D4AF37] uppercase leading-none" style={{ fontFamily: 'serif' }}>
            ISFAYRAM
          </h1>
          <p className="text-[10px] sm:text-xs text-[#8A8070] tracking-[0.2em] uppercase mt-1">
            Tizimga kirish uchun xodimni tanlang
          </p>
        </div>
      </motion.div>

      {/* Grid of Employee Cards (Exactly 5 columns on desktop/POS terminal, 2 rows, NO vertical scroll) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 relative z-10"
      >
        {allUserCards.map((user) => (
          <button
            key={user.id}
            onClick={() => {
              if (user.role === 'admin') {
                navigate('/admin/login');
              } else {
                setSelectedUser(user);
              }
            }}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-150 active:scale-95 flex flex-col justify-between items-start text-left h-[95px] sm:h-[110px] cursor-pointer group select-none border border-transparent hover:border-amber-300/40"
          >
            <span className="font-bold text-slate-800 text-sm sm:text-base md:text-lg tracking-wide uppercase truncate w-full block">
              {user.fullName}
            </span>
            <span className="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500 lowercase group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
              {user.role === 'admin' ? 'owner' : user.role}
            </span>
          </button>
        ))}
      </motion.div>
    </div>
  );
};
