import { FileText } from 'lucide-react';
export const Invoices = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
        <FileText className="w-6 h-6 text-amber-500" /> Hisob-fakturalar (Nakladnye)
      </h1>
    </div>
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 text-center">
      <p className="text-slate-500 dark:text-slate-400">Hisob-fakturalar bo'limi tez orada ishga tushadi.</p>
    </div>
  </div>
);
