import { ShoppingCart } from 'lucide-react';
export const Purchases = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-indigo-500" /> Xaridlar (Zakupki)
      </h1>
    </div>
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 text-center">
      <p className="text-slate-500 dark:text-slate-400">Xaridlar va ta'minot bo'limi tez orada ishga tushadi.</p>
    </div>
  </div>
);
