import { Receipt, RefreshCw, Download, CheckCircle2 } from 'lucide-react';

export const Fiscalization = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-purple-500" /> Fiskalizatsiya va Soliq
          </h1>
          <p className="text-slate-500 text-sm mt-1">Soliq qo'mitasi (UzDSt) bilan integratsiya va Z-otchyotlar</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors">
            <RefreshCw className="w-5 h-5" /> Sinxronizatsiya
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">Bugungi aylanma (Fiskal)</div>
            <div className="text-3xl font-black text-slate-800 dark:text-white">4,250,000 <span className="text-xl font-bold text-slate-500">so'm</span></div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-500 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> 24 ta chek yuborildi
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">Oydagi aylanma</div>
            <div className="text-3xl font-black text-slate-800 dark:text-white">125,400,000 <span className="text-xl font-bold text-slate-500">so'm</span></div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-500 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Barchasi sinxronlashtirilgan
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">Xatoliklar</div>
            <div className="text-3xl font-black text-red-500">0 <span className="text-xl font-bold text-slate-500">ta chek</span></div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 font-semibold">
            Soliq bazasiga o'tmagan cheklar yo'q
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Oxirgi Z-otchyotlar (Smena yopilishi)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Sana</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Smena ochilgan</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Smena yopilgan</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Naqd</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Karta</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Jami</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="py-4 text-slate-800 dark:text-slate-200 font-medium">2026-09-{27 - i}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400">08:00</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400">23:45</td>
                  <td className="py-4 text-slate-700 dark:text-slate-300">2,500,000</td>
                  <td className="py-4 text-slate-700 dark:text-slate-300">1,200,000</td>
                  <td className="py-4 text-slate-800 dark:text-slate-200 font-bold">3,700,000 so'm</td>
                  <td className="py-4 text-right">
                    <button className="text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1 justify-end w-full font-medium text-sm">
                      <Download className="w-4 h-4" /> PDF
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
