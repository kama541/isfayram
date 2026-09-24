import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, UtensilsCrossed } from 'lucide-react';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In a real scenario with full Supabase Auth:
      // const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      // For demonstration with dummy data since we bypassed profiles auth reference:
      if (email === 'admin@admin.com' && password === 'admin123') {
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/30">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Boshqaruv tizimiga kirish</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Elektron pochta</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="admin@admin.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Parol</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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
          className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <UtensilsCrossed className="w-4 h-4" />
          Kassa va Ofitsiant bo'limiga qaytish
        </button>
      </div>
    </div>
  );
};
