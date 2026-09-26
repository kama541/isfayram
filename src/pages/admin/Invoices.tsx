import { FileText, Plus, Search, Filter, Download } from 'lucide-react';
import { useState } from 'react';

const mockInvoices = [
  { id: 'INV-2026-001', supplier: 'Meva-Cheva MChJ', date: '2026-09-25', amount: 1250000, status: 'To\'langan' },
  { id: 'INV-2026-002', supplier: 'Go\'sht markazi', date: '2026-09-26', amount: 3400000, status: 'Kutilmoqda' },
  { id: 'INV-2026-003', supplier: 'Nonvoyxona', date: '2026-09-27', amount: 150000, status: 'To\'langan' },
  { id: 'INV-2026-004', supplier: 'Ichimliklar savdo', date: '2026-09-27', amount: 890000, status: 'Kutilmoqda' },
];

export const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" /> Hisob-fakturalar (Nakladnoy)
          </h1>
          <p className="text-slate-500 text-sm mt-1">Kirim hujjatlari va fakturalarni boshqarish</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors">
            <Download className="w-5 h-5" /> Eksport
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors">
            <Plus className="w-5 h-5" /> Yangi faktura
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Faktura raqami yoki yetkazib beruvchini qidiring..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 dark:text-slate-200"
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
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Faktura №</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Yetkazib beruvchi</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Sana</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Summa</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Holat</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {mockInvoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="py-4 text-blue-600 dark:text-blue-400 font-bold">{invoice.id}</td>
                  <td className="py-4 text-slate-800 dark:text-slate-200 font-medium">{invoice.supplier}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400">{invoice.date}</td>
                  <td className="py-4 text-slate-800 dark:text-slate-200 font-bold">{invoice.amount.toLocaleString('uz-UZ')} so'm</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      invoice.status === 'To\'langan' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="text-slate-400 hover:text-blue-500 transition-colors">
                      Ko'rish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
