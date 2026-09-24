import { useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut } from 'lucide-react';
import type { Role } from '../../types';

interface SettingsProps {
  role?: Role;
}

export const Settings = ({ role = 'admin' }: SettingsProps) => {
  const navigate = useNavigate();

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
      </div>
    </div>
  );
};
