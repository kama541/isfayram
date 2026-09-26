import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Settings, UtensilsCrossed, ClipboardList, ChevronRight, ChevronDown, Wallet, Package, LogOut, ChefHat, QrCode, FileText, Receipt, Grid, Calendar, BookOpen, Banknote } from 'lucide-react';
import type { Role } from '../types';

interface SidebarProps {
  role: Role;
}

const adminLinks = [
  { name: 'Oshxona', path: '/admin', icon: ChefHat },
  { name: 'Moliya', path: '/admin/finance', icon: Wallet, hasSubmenu: true },
  { name: 'Zallar va stollar', path: '/admin/tables', icon: Grid },
  { name: 'QR Menyu', path: '/admin/qr', icon: QrCode },
  { name: 'Xodimlar', path: '/admin/staff', icon: Users },
  { name: 'Omborxona', path: '/admin/inventory', icon: Package },
  { name: 'Hisob-fakturalar', path: '/admin/invoices', icon: FileText },
  { name: 'Xaridlar', path: '/admin/purchases', icon: ShoppingCart },
  { name: 'Fiskalizatsiya', path: '/admin/fiscal', icon: Receipt },
  { name: 'Sozlamalar', path: '/admin/settings', icon: Settings },
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
      {/* Brand Header */}
      <div className="p-6 pb-2">
        <Link to="/restaurants" className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors text-sm font-medium">
          <ChevronRight className="w-4 h-4 rotate-180" /> Barcha restoranlar
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
            <ChefHat className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Isfayram Kafe</h1>
            <p className="text-slate-400 text-xs mt-0.5">Quvasoy, UZ</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto scrollbar-hide pb-4">
        {role === 'admin' && <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Boshqaruv</div>}
        {links.map((link) => {
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
              {(link as any).hasSubmenu && <ChevronDown className="w-4 h-4 opacity-50" />}
              {(!(link as any).hasSubmenu && isActive) && <ChevronRight className="w-4 h-4 opacity-50" />}
              {(!(link as any).hasSubmenu && !isActive) && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />}
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
