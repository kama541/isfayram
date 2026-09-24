import type { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Search, Bell, Calendar } from 'lucide-react';
import type { Role } from '../types';

interface DashboardLayoutProps {
  children: ReactNode;
  role: Role;
}

export const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96 hidden md:block">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Qidirish..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 font-medium">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 scrollbar-hide">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
};
