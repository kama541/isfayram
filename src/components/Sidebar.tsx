import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, Users, UserSquare2, BarChart3, ChefHat, LogOut, 
  ClipboardList, Calendar, Banknote, BookOpen, Grid, ShoppingCart, 
  Settings, UserIcon, X, ShieldCheck, Package, Trash2, 
  ReceiptText, Smartphone, History, LayoutDashboard, Monitor, Flame, ListX
} from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Role } from '../types';

interface SidebarProps {
  role: Role;
  open?: boolean;
  onClose?: () => void;
}

const adminManagementLinks = [
  { name: 'Bosh sahifa', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Buyurtmalar', path: '/admin/orders', icon: ClipboardList },
  { name: 'Bekor qilinganlar', path: '/admin/cancelled-orders', icon: Trash2 },
  { name: 'Stollar', path: '/admin/tables', icon: Grid },
  { name: 'Menyu', path: '/admin/menu', icon: BookOpen },
  { name: 'Stop & Go List', path: '/admin/stop-list', icon: ListX },
  { name: 'Oshxona', path: '/admin/kitchens', icon: ChefHat },
  { name: 'Xodimlar', path: '/admin/staff', icon: Users },
  { name: 'Moliya', path: '/admin/finance', icon: Banknote },
  { name: 'Hisobotlar', path: '/admin/reports', icon: BarChart3 },
  { name: 'Ombor', path: '/admin/inventory', icon: Package },
  { name: 'Shashlik & Somsa', path: '/admin/shashlik', icon: Flame },
  { name: 'Mijozlar', path: '/admin/customers', icon: UserSquare2 },
  { name: 'Qurilmalar', path: '/admin/devices', icon: Monitor },
  { name: 'Sozlamalar', path: '/admin/settings', icon: Settings },
];

const adminQuickPosLinks = [
  { name: 'Kassa', path: '/cashier', icon: ReceiptText },
  { name: 'Ofitsiant', path: '/waiter', icon: Smartphone },
];

const adminLinks = [...adminManagementLinks, ...adminQuickPosLinks];

const cashierLinks = [
  { name: 'Buyurtmalar', path: '/cashier', icon: ClipboardList },
  { name: 'Stop & Go List', path: '/cashier/stop-list', icon: ListX },
  { name: 'Buyurtmalar Tarixi', path: '/cashier/orders', icon: History },
  { name: 'Oshxona (KDS)', path: '/cashier/kitchen', icon: ChefHat },
  { name: 'Bronlar', path: '/cashier/reservations', icon: Calendar },
  { name: 'Mijozlar Bazasi', path: '/cashier/customers', icon: UserSquare2 },
  { name: 'Kassa & Kirim', path: '/cashier/finance', icon: Banknote },
  { name: 'Taomlar Menyusi', path: '/cashier/menu', icon: BookOpen },
  { name: 'Sozlamalar', path: '/cashier/settings', icon: Settings },
];

const waiterLinks = [
  { name: 'Xonalar & Stollar', path: '/waiter', icon: Grid },
  { name: 'Yangi Buyurtma', path: '/waiter/new-order', icon: ShoppingCart },
  { name: 'Taomlar Menyusi', path: '/waiter/menu', icon: BookOpen },
  { name: 'Sozlamalar', path: '/waiter/settings', icon: Settings },
];

export const Sidebar = ({ role, open = false, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { employees } = useStore();
  const waiters = employees.filter(e => e.role === 'waiter');
  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const hasAdminAuth = !!localStorage.getItem('adminUser') || currentUser?.role === 'admin';
  const baseLinks = role === 'admin' ? adminLinks : role === 'cashier' ? cashierLinks : waiterLinks;
  const links = (hasAdminAuth && role !== 'admin')
    ? [{ name: 'Admin Panel', path: '/admin', icon: ShieldCheck }, ...baseLinks]
    : baseLinks;

  const handleWaiterSelect = (waiterId: string) => {
    localStorage.setItem('adminActingAsWaiter', waiterId);
    setShowWaiterModal(false);
    navigate('/waiter');
  };

  const roleLabel = role === 'admin' ? 'Administrator' : role === 'cashier' ? 'Kassir' : 'Ofitsiant';
  
  let userName = role === 'admin' ? 'Administrator' : (currentUser?.fullName || roleLabel);
  
  // If admin is acting as waiter, show the selected waiter's name
  if (role === 'waiter' && localStorage.getItem('adminUser')) {
    const actingId = localStorage.getItem('adminActingAsWaiter');
    if (actingId) {
      const actingWaiter = waiters.find(w => w.id === actingId);
      if (actingWaiter) {
        userName = actingWaiter.fullName + ' (Admin)';
      }
    }
  }

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
    {/* Mobil overlay */}
    {open && (
      <div className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    )}
    <aside className={`w-[260px] max-w-[80vw] h-screen fixed md:sticky top-0 left-0 flex flex-col z-40 md:z-20 overflow-hidden shadow-2xl shrink-0 transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ background: 'linear-gradient(180deg, #1C1A17 0%, #13120F 100%)', borderRight: '1px solid rgba(212,175,55,0.1)' }}
    >
      {/* Mobil yopish tugmasi */}
      <button onClick={onClose} className="md:hidden absolute top-4 right-4 p-2 rounded-full hover:bg-white/10" style={{ color: '#8A8070' }} aria-label="Yopish">
        <X className="w-5 h-5" />
      </button>
      {/* Logo */}
      <div className="p-6 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-lg" style={{ boxShadow: '0 0 20px rgba(212,175,55,0.2)' }}>
            <img src="/logo.png" alt="Isfayram" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-black tracking-widest text-base uppercase" style={{ color: '#D4AF37', fontFamily: 'serif' }}>ISFAYRAM</div>
            <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: '#6C6659' }}>Premium Kafe</div>
          </div>
        </div>

        <div className="text-[10px] tracking-[0.25em] uppercase mb-3 pl-1" style={{ color: '#6C6659' }}>
          {role === 'admin' ? 'Boshqaruv' : role === 'cashier' ? 'Kassir' : 'Ofitsiant'} paneli
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-hide pb-4">
        {role === 'admin' && (
          <>
            {adminManagementLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
              return (
                <div key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5"
                    style={isActive
                      ? { background: 'rgba(212,175,55,0.15)', color: '#D4AF37', borderLeft: '3px solid #D4AF37' }
                      : { color: '#8A8070' }
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-base font-bold">{link.name}</span>
                  </Link>
                </div>
              );
            })}

            {/* Quick POS Mode Switch */}
            <div className="pt-3 pb-1 px-3 mt-2 border-t" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold" style={{ color: '#6C6659' }}>
                Tezkor o'tish
              </div>
            </div>

            {adminQuickPosLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || location.pathname.startsWith(link.path);
              if (link.path === '/waiter') {
                return (
                  <div key={link.path}>
                    <button
                      onClick={() => setShowWaiterModal(true)}
                      className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5"
                      style={isActive
                        ? { background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }
                        : { color: '#8A8070' }
                      }
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-base font-bold">{link.name}</span>
                    </button>
                  </div>
                );
              }
              return (
                <div key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5"
                    style={isActive
                      ? { background: 'rgba(212,175,55,0.15)', color: '#D4AF37', borderLeft: '3px solid #D4AF37' }
                      : { color: '#8A8070' }
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-base font-bold">{link.name}</span>
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
              className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5"
              style={isActive
                ? { background: 'rgba(212,175,55,0.15)', color: '#D4AF37', borderLeft: '3px solid #D4AF37' }
                : { color: '#8A8070' }
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-bold text-base">{link.name}</span>
            </Link>
          );
        })}

        {role !== 'admin' && localStorage.getItem('adminUser') && (
          <div className="pt-4 mt-2 border-t" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
            <Link
              to="/admin"
              className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/5"
              style={{ color: '#D4AF37' }}
            >
              <Building2 className="w-5 h-5 shrink-0" />
              <span className="text-base font-black">Admin Panelga Qaytish</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 mt-auto" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
        <div
          className="flex items-center justify-between px-4 py-3.5 cursor-pointer rounded-2xl transition-all duration-200 hover:bg-white/5 active:scale-98"
          onClick={() => {
            sessionStorage.setItem('explicitLogout', 'true');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-base"
              style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', border: '1.5px solid rgba(212,175,55,0.35)' }}
            >
              {userInitial}
            </div>
            <div>
              <div className="font-extrabold text-base truncate max-w-[130px]" style={{ color: '#F5F2EA' }}>{userName}</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: '#6C6659' }}>{roleLabel}dan chiqish</div>
            </div>
          </div>
          <LogOut className="w-5 h-5" style={{ color: '#6C6659' }} />
        </div>
      </div>
    </aside>

    {/* Waiter selection modal */}
    {showWaiterModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
        <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl" style={{ background: '#1C1A17', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="p-6 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
            <h2 className="text-xl font-bold" style={{ color: '#F5F2EA' }}>Qaysi ofitsiant nomidan kirasiz?</h2>
            <button onClick={() => setShowWaiterModal(false)} className="p-2 rounded-full hover:bg-white/10 transition-colors" style={{ color: '#8A8070' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2">
            {waiters.map(waiter => (
              <button
                key={waiter.id}
                onClick={() => handleWaiterSelect(waiter.id)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 text-left hover:bg-white/5"
                style={{ border: '1px solid rgba(212,175,55,0.15)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: '#F5F2EA' }}>{waiter.fullName}</h3>
                  <p className="text-sm" style={{ color: '#6C6659' }}>PIN: {waiter.pinCode}</p>
                </div>
              </button>
            ))}
            {waiters.length === 0 && (
              <p className="text-center py-4" style={{ color: '#6C6659' }}>Ofitsiantlar topilmadi</p>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};
