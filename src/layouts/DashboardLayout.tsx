import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Bell, Calendar, Menu } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Role } from '../types';

interface DashboardLayoutProps {
  children: ReactNode;
  role: Role;
}

export const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const { waiterCalls } = useStore();
  const pendingCallsCount = waiterCalls.filter(c => c.status === 'pending').length;
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mobil: sahifa almashganda sidebarni yopish
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: '#13120F', color: '#F5F2EA' }}>
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-8 shrink-0 z-10"
          style={{ background: '#1C1A17', borderBottom: '1px solid rgba(212,175,55,0.1)' }}
        >
          <div className="flex items-center gap-4 flex-1">
            {/* Breadcrumb area - empty for now */}
            <button
              id="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/5"
              style={{ color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}
              aria-label="Menyu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full"
              style={{ color: '#8A8070', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.08)' }}
            >
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>

            <div className="relative">
              <button
                className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/5"
                style={{ color: '#8A8070', border: '1px solid rgba(212,175,55,0.1)' }}
              >
                <Bell className="w-4 h-4" />
                {pendingCallsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                    {pendingCallsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-hide" style={{ background: '#13120F' }}>
          <div className="mx-auto max-w-7xl p-3 md:p-6">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
};
