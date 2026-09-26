import { Receipt } from 'lucide-react';
export const Fiscalization = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
        <Receipt className="w-6 h-6 text-emerald-500" /> Fiskalizatsiya
      </h1>
    </div>
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 text-center">
      <p className="text-slate-500 dark:text-slate-400">Soliq qo'mitasi (SoliqUz) va kassa apparatlari bilan integratsiya tez orada ishga tushadi.</p>
    </div>
  </div>
);
