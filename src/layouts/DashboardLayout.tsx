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

  const isMenuPage = location.pathname.endsWith('/menu');

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background: isMenuPage ? '#F8FAFC' : '#13120F', color: isMenuPage ? '#0F172A' : '#F5F2EA' }}>
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-8 shrink-0 z-10"
          style={{ 
            background: isMenuPage ? '#FFFFFF' : '#1C1A17', 
            borderBottom: isMenuPage ? '1px solid #E2E8F0' : '1px solid rgba(212,175,55,0.1)' 
          }}
        >
          <div className="flex items-center gap-4 flex-1">
            {/* Breadcrumb area - empty for now */}
            <button
              id="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-black/5"
              style={{ color: isMenuPage ? '#0F172A' : '#D4AF37', border: isMenuPage ? '1px solid #CBD5E1' : '1px solid rgba(212,175,55,0.2)' }}
              aria-label="Menyu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full"
              style={{ 
                color: isMenuPage ? '#64748B' : '#8A8070', 
                background: isMenuPage ? '#F1F5F9' : 'rgba(255,255,255,0.04)', 
                border: isMenuPage ? '1px solid #E2E8F0' : '1px solid rgba(212,175,55,0.08)' 
              }}
            >
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>

            <div className="relative">
              <button
                className="flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-black/5"
                style={{ 
                  color: isMenuPage ? '#64748B' : '#8A8070', 
                  border: isMenuPage ? '1px solid #E2E8F0' : '1px solid rgba(212,175,55,0.1)' 
                }}
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
        <main 
          className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-hide" 
          style={{ background: isMenuPage ? '#F8FAFC' : '#13120F' }}
        >
          <div className={isMenuPage ? "w-full max-w-[1600px] mx-auto p-3 md:p-6" : "mx-auto max-w-7xl p-3 md:p-6"}>
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
};
