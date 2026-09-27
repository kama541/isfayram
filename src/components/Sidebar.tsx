import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Users, UserSquare2, CreditCard, BarChart3, ChefHat, LogOut, ClipboardList, Calendar, Banknote, BookOpen, Grid, ShoppingCart, Settings, UserIcon, X } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Role } from '../types';

interface SidebarProps {
  role: Role;
}

const adminLinks = [
  { name: 'Restoranlar', path: '/admin', icon: Building2 },
  { name: 'Xodimlar', path: '/admin/staff', icon: Users },
  { name: 'Mijozlar', path: '/admin/customers', icon: UserSquare2 },
  { name: 'Obuna', path: '/admin/subscription', icon: CreditCard },
  { name: 'Hisobotlar', path: '/admin/reports', icon: BarChart3 },
  { name: 'Kassir Panel', path: '/cashier', icon: ClipboardList },
  { name: 'Ofitsiant Panel', path: '/waiter', icon: Grid },
];

const cashierLinks = [
  { name: 'Buyurtmalar', path: '/cashier', icon: ClipboardList },
  { name: 'Tarix', path: '/cashier/orders', icon: ClipboardList },
  { name: 'Oshxona', path: '/cashier/kitchen', icon: ChefHat },
  { name: 'Bronlar', path: '/cashier/reservations', icon: Calendar },
  { name: 'Mijozlar', path: '/cashier/customers', icon: Users },
  { name: 'Kassa', path: '/cashier/finance', icon: Banknote },
  { name: 'Taomlar', path: '/cashier/menu', icon: BookOpen },
  { name: 'Sozlamalar', path: '/cashier/settings', icon: Settings },
];

const waiterLinks = [
  { name: 'Xonalar', path: '/waiter', icon: Grid },
  { name: 'Yangi Buyurtma', path: '/waiter/new-order', icon: ShoppingCart },
  { name: 'Taomlar', path: '/waiter/menu', icon: BookOpen },
];

export const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { employees } = useStore();
  const waiters = employees.filter(e => e.role === 'waiter');
  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const links = role === 'admin' ? adminLinks : role === 'cashier' ? cashierLinks : waiterLinks;

  const handleWaiterSelect = (waiterId: string) => {
    localStorage.setItem('adminActingAsWaiter', waiterId);
    setShowWaiterModal(false);
    navigate('/waiter');
  };

  return (
    <>
    <aside className="w-[280px] bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col z-20 transition-colors duration-200 shadow-xl overflow-hidden">
      <div className="p-6 pb-2 mt-4">
        <div className="text-white font-black tracking-widest text-2xl mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <ChefHat className="w-6 h-6 text-slate-900" />
          </div>
          ISFAYRAM
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto scrollbar-hide pb-4">
        {role === 'admin' && (
          <>
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
              if (link.path === '/waiter') {
                return (
                  <div key={link.path}>
                    <button
                      onClick={() => setShowWaiterModal(true)}
                      className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-white/10 text-white font-bold' 
                          : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 opacity-80" />
                        <span className="text-[15px]">{link.name}</span>
                      </div>
                    </button>
                  </div>
                );
              }
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

                  </Link>
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
          {role !== 'admin' && localStorage.getItem('adminUser') && (
            <div className="pt-4 mt-2 border-t border-white/10">
              <Link
                to="/admin"
                className="group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-amber-400 hover:bg-white/5 hover:text-amber-300 font-bold"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-[18px] h-[18px]" />
                  <span className="text-[15px]">Admin Panelga Qaytish</span>
                </div>
              </Link>
            </div>
          )}
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

    {showWaiterModal && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Qaysi ofitsiant nomidan kirasiz?</h2>
            <button onClick={() => setShowWaiterModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2">
            {waiters.map(waiter => (
              <button
                key={waiter.id}
                onClick={() => handleWaiterSelect(waiter.id)}
                className="w-full flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-2xl transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white">{waiter.fullName}</h3>
                  <p className="text-sm text-slate-500">PIN: {waiter.pinCode}</p>
                </div>
              </button>
            ))}
            {waiters.length === 0 && (
              <p className="text-center text-slate-500 py-4">Ofitsiantlar topilmadi</p>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};
