import { Users, Phone, Star, Search, Plus } from 'lucide-react';
import { useState } from 'react';

// Mock data since we don't have a customers table yet
const mockCustomers = [
  { id: 1, name: 'Sardorbek', phone: '+998 90 123 45 67', visits: 12, spent: 450000 },
  { id: 2, name: 'Aziz', phone: '+998 91 987 65 43', visits: 5, spent: 150000 },
  { id: 3, name: 'Malika', phone: '+998 93 456 78 90', visits: 24, spent: 1200000 },
];

export const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-500" /> Mijozlar (Loyalty)
        </h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors">
          <Plus className="w-5 h-5" /> Yangi mijoz
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative w-full md:w-96 mb-6">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Ism yoki raqam bo'yicha qidirish..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Mijoz ismi</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Telefon raqami</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Tashriflar</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Sarflangan summa</th>
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {mockCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="py-4 text-slate-800 dark:text-slate-200 font-medium">{customer.name}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" /> {customer.phone}
                  </td>
                  <td className="py-4 text-slate-800 dark:text-slate-200">{customer.visits} marta</td>
                  <td className="py-4 text-slate-800 dark:text-slate-200 font-medium">{customer.spent.toLocaleString('uz-UZ')} so'm</td>
                  <td className="py-4">
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg w-max text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> VIP
                    </div>
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
