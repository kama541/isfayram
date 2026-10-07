import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

// Global state for simple UI without adding to the main store
let alertCallback: (msg: string) => void = () => {};
let confirmCallback: (msg: string, onConfirm: () => void) => void = () => {};

// Override native window methods safely
if (typeof window !== 'undefined') {
  window.alert = (msg: string) => {
    alertCallback(msg);
  };
  
  (window as any).customConfirm = (msg: string, onConfirm: () => void) => {
    confirmCallback(msg, onConfirm);
  };
}

export const GlobalUI = () => {
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState<{ msg: string; onConfirm: () => void } | null>(null);

  useEffect(() => {
    alertCallback = (msg) => {
      setAlertMsg(msg);
      setTimeout(() => setAlertMsg(null), 3500); // Auto close alert
    };
    
    confirmCallback = (msg, onConfirm) => {
      setConfirmData({ msg, onConfirm });
    };
  }, []);

  return (
    <>
      {/* Alert Toast */}
      {alertMsg && (
        <div className="fixed top-4 right-4 z-[9999] bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in max-w-sm">
          <Info className="w-5 h-5 text-blue-400 shrink-0" />
          <p className="text-sm font-medium">{alertMsg}</p>
          <button onClick={() => setAlertMsg(null)} className="ml-auto text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmData && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scale-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                Tasdiqlang
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-8 pl-1">
              {confirmData.msg}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmData(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Yo'q
              </button>
              <button 
                onClick={() => {
                  confirmData.onConfirm();
                  setConfirmData(null);
                }}
                className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
              >
                Ha, Tasdiqlayman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Banner */}
      {import.meta.env.VITE_IS_DEMO_MODE === 'true' && (
        <div className="fixed top-0 left-0 right-0 z-[10000] bg-red-600/90 backdrop-blur-sm text-white text-[11px] uppercase font-bold text-center py-1 tracking-[0.2em] shadow-md pointer-events-none">
          DEMO VERSION - Real tizim emas
        </div>
      )}
    </>
  );
};
