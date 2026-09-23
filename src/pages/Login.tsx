import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Shield, ShoppingCart, Users } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (role: string) => {
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/30">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Oshxona POS</h1>
          <p className="text-slate-500 text-sm mt-1">Tizimga kirish uchun rolni tanlang</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => handleLogin('admin')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50/50 transition-all group"
          >
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Shield className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Admin</h3>
              <p className="text-xs text-slate-500">To'liq boshqaruv</p>
            </div>
          </button>

          <button 
            onClick={() => handleLogin('cashier')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50/50 transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Kassir</h3>
              <p className="text-xs text-slate-500">To'lovlarni qabul qilish</p>
            </div>
          </button>

          <button 
            onClick={() => handleLogin('waiter')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50/50 transition-all group"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-slate-800">Ofitsiant</h3>
              <p className="text-xs text-slate-500">Buyurtmalar olish</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
