import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Settings, UtensilsCrossed, ClipboardList, ChevronRight, Wallet, Video, Package, LogOut } from 'lucide-react';
import type { Role } from '../types';

interface SidebarProps {
  role: Role;
}

const adminLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Hisobotlar', path: '/admin/reports', icon: ClipboardList },
  { name: 'Menyu', path: '/admin/menu', icon: UtensilsCrossed },
  { name: 'Buyurtmalar', path: '/admin/orders', icon: ClipboardList },
  { name: 'Moliya', path: '/admin/finance', icon: Wallet },
  { name: 'Omborxona', path: '/admin/inventory', icon: Package },
  { name: 'Xodimlar', path: '/admin/staff', icon: Users },
  { name: 'Kameralar', path: '/admin/cameras', icon: Video },
  { name: 'Sozlamalar', path: '/admin/settings', icon: Settings },
];

const cashierLinks = [
  { name: 'Dashboard', path: '/cashier', icon: LayoutDashboard },
  { name: 'Buyurtmalar', path: '/cashier/orders', icon: ClipboardList },
  { name: 'Moliya', path: '/cashier/finance', icon: Wallet },
];

const waiterLinks = [
  { name: 'Dashboard', path: '/waiter', icon: LayoutDashboard },
  { name: 'Yangi Buyurtma', path: '/waiter/new-order', icon: ShoppingCart },
  { name: 'Stollar', path: '/waiter/tables', icon: UtensilsCrossed },
];

export const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const links = role === 'admin' ? adminLinks : role === 'cashier' ? cashierLinks : waiterLinks;

  return (
    <aside className="w-72 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 h-screen sticky top-0 flex flex-col border-r border-slate-200 dark:border-slate-700 z-20 transition-colors duration-200">
      <div className="p-8 flex items-center justify-center border-b border-slate-100 dark:border-slate-700">
        <div className="shadow-lg rounded-2xl overflow-hidden drop-shadow-sm transition-transform hover:scale-105">
          <img src="/logo.png" alt="Isfayram Logo" className="h-16 w-auto object-contain scale-110" />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto scrollbar-hide">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-white'}`} />
                <span className="font-medium text-sm">{link.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button 
          onClick={() => {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Tizimdan chiqish</span>
        </button>
      </div>
    </aside>
  );
};
