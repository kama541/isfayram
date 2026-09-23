import { useStore } from '../../store/useStore';
import { UserPlus, Shield, User as UserIcon, MoreVertical } from 'lucide-react';

export const StaffManagement = () => {
  const { users } = useStore();

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Xodimlar Boshqaruvi</h1>
          <p className="text-slate-500 text-sm mt-1">Kassirlar va ofitsiantlar ro'yxatini boshqarish</p>
        </div>
        <button className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm shadow-blue-600/20">
          <UserPlus className="w-4 h-4" /> Yangi Xodim
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white border border-slate-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 
              user.role === 'cashier' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {user.role === 'admin' ? <Shield className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 truncate">{user.name}</h3>
              <p className="text-xs text-slate-500 capitalize mt-1">{user.role}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs text-slate-500">Onlayn</span>
              </div>
            </div>
            <button className="text-slate-300 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
