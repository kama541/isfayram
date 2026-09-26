import { Link, useLocation } from 'react-router-dom';
import { Building2, Users, UserSquare2, CreditCard, UserCog, BarChart3, ChevronRight, ChevronDown, ChefHat, LogOut, ClipboardList, Calendar, Banknote, BookOpen, Grid, ShoppingCart } from 'lucide-react';
import type { Role } from '../types';

interface SidebarProps {
  role: Role;
}

const adminLinks = [
  { name: 'Рестораны', path: '/admin', icon: Building2 },
  { name: 'Сотрудники', path: '/admin/staff', icon: Users },
  { name: 'Клиенты', path: '/admin/customers', icon: UserSquare2 },
  { name: 'Подписка', path: '/admin/subscription', icon: CreditCard },
  { name: 'HR Кабинет', path: '/admin/hr', icon: UserCog, hasSubmenu: true },
  { name: 'Отчёты', path: '/admin/reports', icon: BarChart3, hasSubmenu: true },
];

const cashierLinks = [
  { name: 'Buyurtmalar', path: '/cashier', icon: ClipboardList },
  { name: 'Oshxona', path: '/cashier/kitchen', icon: ChefHat },
  { name: 'Bronlar', path: '/cashier/reservations', icon: Calendar },
  { name: 'Mijozlar', path: '/cashier/customers', icon: Users },
  { name: 'Kassa', path: '/cashier/finance', icon: Banknote },
  { name: 'Taomlar', path: '/cashier/menu', icon: BookOpen },
  { name: 'Sozlamalar', path: '/cashier/settings', icon: Settings },
];

const waiterLinks = [
  { name: 'Stollar', path: '/waiter', icon: Grid },
  { name: 'Yangi Buyurtma', path: '/waiter/new-order', icon: ShoppingCart },
  { name: 'Taomlar', path: '/waiter/menu', icon: BookOpen },
];

export const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const links = role === 'admin' ? adminLinks : role === 'cashier' ? cashierLinks : waiterLinks;

  return (
    <aside className="w-[280px] bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col z-20 transition-colors duration-200 shadow-xl overflow-hidden">
      <div className="p-6 pb-2 mt-4">
        <div className="text-white font-black tracking-widest text-3xl mb-8 flex items-center gap-1">
          JOWi
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto scrollbar-hide pb-4">
        {role === 'admin' && (
          <>
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
              return (
                <div key={link.path}>
                  <Link
                    to={link.path}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/10 text-white font-bold' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 opacity-80" />
                      <span className="text-[15px]">{link.name}</span>
                    </div>
                    {link.hasSubmenu && (
                      <ChevronRight className={`w-4 h-4 opacity-50 ${isActive ? 'rotate-90' : ''}`} />
                    )}
                  </Link>
                  {link.hasSubmenu && isActive && link.name === 'Отчёты' && (
                    <div className="ml-4 pl-4 border-l border-white/10 mt-1 space-y-1">
                      <Link to="/admin/reports" className="block px-3 py-2 text-sm text-white font-medium bg-white/10 rounded-lg">Продажи</Link>
                      <Link to="/admin/reports/cancels" className="block px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">Отказы</Link>
                      <Link to="/admin/reports/safes" className="block px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">Сейфы</Link>
                      <Link to="/admin/reports/accounts" className="block px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">Счета</Link>
                      <Link to="/admin/reports/reservations" className="block px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">Бронирования</Link>
                      <Link to="/admin/reports/vat" className="block px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">НДС</Link>
                      <Link to="/admin/reports/capital" className="block px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg">Капитал</Link>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
        {role !== 'admin' && links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px]" />
                  <span className="font-medium text-[15px]">{link.name}</span>
                </div>
              </Link>
            );
          })}
      </nav>

      {/* User Profile */}
      <div className="p-4 mt-auto border-t border-white/10">
        <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white/5 rounded-xl transition-colors" onClick={() => {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
          }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              {role === 'admin' ? 'A' : role === 'cashier' ? 'K' : 'O'}
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">{role === 'admin' ? 'admin' : role}</div>
              <div className="text-slate-400 text-[11px] mt-1">+998916769198</div>
            </div>
          </div>
          <LogOut className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </aside>
  );
};
