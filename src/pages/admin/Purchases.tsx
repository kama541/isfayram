import { ShoppingCart, Plus, Search, Filter } from 'lucide-react';
import { useState } from 'react';

const mockPurchases = [
  { id: 'PUR-001', item: 'Mol go\'shti (lahm)', quantity: '50 kg', price: 85000, total: 4250000, date: '2026-09-27 08:30', user: 'Admin' },
  { id: 'PUR-002', item: 'Kartoshka', quantity: '100 kg', price: 4500, total: 450000, date: '2026-09-27 09:15', user: 'Admin' },
  { id: 'PUR-003', item: 'O\'simlik yog\'i', quantity: '20 litr', price: 18000, total: 360000, date: '2026-09-26 14:20', user: 'Omborchi' },
];

export const Purchases = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-500" /> Xaridlar tarixi
          </h1>
          <p className="text-slate-500 text-sm mt-1">Bozor va do'konlardan qilingan kunlik xaridlar ro'yxati</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors">
          <Plus className="w-5 h-5" /> Xarid qo'shish
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Mahsulot nomi bilan qidiring..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 dark:text-slate-200"
            />
          </div>
          <button className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Filter className="w-5 h-5" /> Filtr
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">№</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Mahsulot</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Miqdor</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Narxi (birlik)</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Jami summa</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Sana</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Xodim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {mockPurchases.map(purchase => (
                <tr key={purchase.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="py-4 text-slate-500 dark:text-slate-400 text-sm">{purchase.id}</td>
                  <td className="py-4 text-slate-800 dark:text-slate-200 font-bold">{purchase.item}</td>
                  <td className="py-4 text-slate-700 dark:text-slate-300">{purchase.quantity}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400">{purchase.price.toLocaleString('uz-UZ')} so'm</td>
                  <td className="py-4 text-emerald-600 dark:text-emerald-400 font-bold">{purchase.total.toLocaleString('uz-UZ')} so'm</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400 text-sm">{purchase.date}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400 text-sm">{purchase.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
