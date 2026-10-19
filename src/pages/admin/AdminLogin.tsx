import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, UtensilsCrossed } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanPass = password.trim();
      const employees = useStore.getState().employees || [];
      const adminEmployee = employees.find(emp => 
        ((emp.role as string) === 'admin' || emp.fullName.toLowerCase().includes('admin')) && 
        emp.pinCode === cleanPass
      );

      const normalizedPass = cleanPass.replace(/\s+/g, '');
      // Strictly require 181992 for admin access
      if (
        cleanPass === '181992' ||
        normalizedPass === '181992' ||
        cleanPass === '18 19 92'
      ) {
        const adminData = { role: 'admin', email: 'admin@isfayram.uz' };
        localStorage.setItem('adminUser', JSON.stringify(adminData));
        localStorage.setItem('currentUser', JSON.stringify({ role: 'admin', fullName: 'Administrator' }));
        navigate('/admin');
        return;
      }

      // 2. Supabase Auth fallback (email or login-based)
      try {
        const email = cleanPass.includes('@') ? cleanPass : `${cleanPass.toLowerCase().replace(/[^a-z0-9]/g, '') || 'admin'}@isfayram.com`;
        const { data: authData } = await supabase.auth.signInWithPassword({
          email,
          password: cleanPass
        });
        if (authData?.user) {
          const adminData = { role: 'admin', email: authData.user.email, id: authData.user.id };
          localStorage.setItem('adminUser', JSON.stringify(adminData));
          localStorage.setItem('currentUser', JSON.stringify({ role: 'admin', fullName: 'Administrator' }));
          navigate('/admin');
          return;
        }
      } catch {
        // Fallback to error message below
      }

      setError('Parol noto\'g\'ri');
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

        <div className="space-y-6" onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}>
          <div>
            <label className="block text-sm font-bold mb-2.5 ml-1 tracking-wider uppercase" style={{ color: '#8A8070' }}>Maxfiy Parol</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: '#D4AF37' }}>
                <Lock className="w-6 h-6" />
              </div>
              <input
                type="text"
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-13 pr-4 py-4 rounded-2xl text-lg outline-none transition-all font-mono font-bold"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: '#F5F2EA',
                  WebkitTextSecurity: 'disc',
                } as any}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleLogin()}
            disabled={loading}
            className="w-full py-4 font-black rounded-2xl flex items-center justify-center gap-2 mt-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-base cursor-pointer shadow-lg"
            style={{ background: '#D4AF37', color: '#13120F', boxShadow: '0 8px 30px rgba(212,175,55,0.25)' }}
          >
            {loading ? 'Tekshirilmoqda...' : 'Tizimga kirish'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-base font-medium transition-colors hover:opacity-80 cursor-pointer"
          style={{ color: '#8A8070' }}
        >
          <UtensilsCrossed className="w-5 h-5" />
          Kassa va Ofitsiant bo'limiga qaytish
        </button>
      </div>
    </div>
  );
};
