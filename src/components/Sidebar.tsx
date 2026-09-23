import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Settings, UtensilsCrossed, ClipboardList, LogOut, ChevronRight, User as UserIcon } from 'lucide-react';
import type { Role } from '../types';

interface SidebarProps {
  role: Role;
}

const adminLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Menyu', path: '/admin/menu', icon: UtensilsCrossed },
  { name: 'Buyurtmalar', path: '/admin/orders', icon: ClipboardList },
  { name: 'Xodimlar', path: '/admin/staff', icon: Users },
  { name: 'Sozlamalar', path: '/admin/settings', icon: Settings },
];

const cashierLinks = [
  { name: 'Dashboard', path: '/cashier', icon: LayoutDashboard },
  { name: 'To\'lovlar', path: '/cashier/payments', icon: ShoppingCart },
  { name: 'Buyurtmalar', path: '/cashier/orders', icon: ClipboardList },
];

const waiterLinks = [
  { name: 'Dashboard', path: '/waiter', icon: LayoutDashboard },
  { name: 'Yangi Buyurtma', path: '/waiter/new-order', icon: ShoppingCart },
  { name: 'Stollar', path: '/waiter/tables', icon: UtensilsCrossed },
];

export const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const links = role === 'admin' ? adminLinks : role === 'cashier' ? cashierLinks : waiterLinks;

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col shadow-2xl z-20">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <UtensilsCrossed className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Oshxona POS</h1>
          <p className="text-xs text-slate-400 font-medium capitalize tracking-wider">{role} Paneli</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto no-scrollbar">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="font-medium text-sm">{link.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-slate-700/50 flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white">
             <UserIcon className="w-5 h-5" />
           </div>
           <div className="flex-1 overflow-hidden">
             <p className="text-sm font-bold text-white truncate">Foydalanuvchi</p>
             <p className="text-xs text-slate-400 truncate capitalize">{role}</p>
           </div>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-3.5 px-4 py-3.5 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Chiqish</span>
        </button>
      </div>
    </aside>
  );
};
