import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, UtensilsCrossed } from 'lucide-react';

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
        setError('Parol noto\'g\'ri');
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ background: '#13120F' }}>
      <div className="max-w-md w-full p-8 rounded-3xl shadow-2xl" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="flex flex-col items-center mb-8">
          <div className="mb-5 rounded-[1.5rem] overflow-hidden shadow-2xl" style={{ boxShadow: '0 0 40px rgba(212,175,55,0.15)' }}>
            <img src="/logo.png" alt="Isfayram Logo" className="h-28 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-black tracking-widest uppercase" style={{ color: '#D4AF37', fontFamily: 'serif' }}>ISFAYRAM</h1>
          <p className="text-sm mt-1 tracking-widest uppercase" style={{ color: '#6C6659' }}>Boshqaruv tizimi</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl text-red-400 text-sm text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 ml-1 tracking-wider uppercase" style={{ color: '#8A8070' }}>Maxfiy Parol</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: '#6C6659' }}>
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  color: '#F5F2EA',
                }}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 mt-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
            style={{ background: '#D4AF37', color: '#13120F', boxShadow: '0 5px 30px rgba(212,175,55,0.2)' }}
          >
            {loading ? 'Tekshirilmoqda...' : 'Tizimga kirish'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <button
          onClick={() => navigate('/login')}
          className="w-full mt-5 py-3 flex items-center justify-center gap-2 text-sm transition-colors hover:opacity-80"
          style={{ color: '#6C6659' }}
        >
          <UtensilsCrossed className="w-4 h-4" />
          Kassa va Ofitsiant bo'limiga qaytish
        </button>
      </div>
    </div>
  );
};
