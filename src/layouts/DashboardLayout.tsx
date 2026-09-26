import type { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Search, Bell, Calendar, Moon, Sun } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Role } from '../types';

interface DashboardLayoutProps {
  children: ReactNode;
  role: Role;
}

export const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const { theme, setTheme } = useStore();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans text-slate-900 dark:text-white transition-colors duration-200">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 z-10 shrink-0 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96 hidden md:block">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Qidirish..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-700 rounded-full"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="relative p-2 text-slate-400 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 scrollbar-hide transition-colors duration-200">
          <div className="mx-auto max-w-7xl p-6">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
};
