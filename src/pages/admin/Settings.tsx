import { useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, Power } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Role } from '../../types';

interface SettingsProps {
  role?: Role;
}

export const Settings = ({ role = 'admin' }: SettingsProps) => {
  const navigate = useNavigate();
  const { isSystemOpen, setSystemOpen } = useStore();

  const handleToggleSystem = () => {
    if (window.confirm(isSystemOpen ? "Diqqat! Saytni yopsangiz, ofitsiantlar va kassirlar kira olmaydi. Tasdiqlaysizmi?" : "Saytni qayta ochishni tasdiqlaysizmi?")) {
      setSystemOpen(!isSystemOpen);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Sozlamalar</h1>
      
      <div className="max-w-md">
        <h2 className="text-lg font-semibold mb-4">Profil</h2>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Foydalanuvchi</p>
              <p className="text-sm text-slate-500 capitalize">{role}</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Chiqish
          </button>
        </div>

        {role === 'admin' && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Tizim holati (Xavfli zona)</h2>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${isSystemOpen ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'}`}>
                  <Power className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{isSystemOpen ? "Tizim ochiq" : "Tizim yopilgan"}</p>
                  <p className="text-sm text-slate-500">Xodimlar uchun tizimga kirish holati</p>
                </div>
              </div>
              
              <button 
                onClick={handleToggleSystem}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors font-bold text-sm ${isSystemOpen ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
              >
                {isSystemOpen ? "Tizimni yopish" : "Tizimni ochish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
