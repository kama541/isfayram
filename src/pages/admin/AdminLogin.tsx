import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, UtensilsCrossed } from 'lucide-react';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (password === '111111') {
        localStorage.setItem('adminUser', JSON.stringify({ role: 'admin', email: 'admin' }));
        navigate('/admin');
      } else {
        setError('Email yoki parol notog\'ri');
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
        <div className="flex flex-col items-center mb-6">
          <div className="mb-4 shadow-xl rounded-[1.5rem] overflow-hidden drop-shadow-md">
            <img src="/logo.png" alt="Isfayram Logo" className="h-28 w-auto object-contain scale-110" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight hidden">Isfayram Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Boshqaruv tizimiga kirish</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Maxfiy Parol</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Tekshirilmoqda...' : 'Tizimga kirish'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <button 
          onClick={() => navigate('/login')}
          className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <UtensilsCrossed className="w-4 h-4" />
          Kassa va Ofitsiant bo'limiga qaytish
        </button>
      </div>
    </div>
  );
};
