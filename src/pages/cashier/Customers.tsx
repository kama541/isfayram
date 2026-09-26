import { Users, Phone, Star, Search, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLocalStore } from '../../store/useLocalStore';

export const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  
  const { customers, addCustomer, deleteCustomer } = useLocalStore();

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;
    addCustomer(newCustomer);
    setNewCustomer({ name: '', phone: '' });
    setIsModalOpen(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-500" /> Mijozlar (Loyalty)
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
        >
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
              <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="py-4 text-slate-800 dark:text-slate-200 font-medium">{customer.name}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" /> {customer.phone}
                  </td>
                  <td className="py-4 text-slate-800 dark:text-slate-200">{customer.visits} marta</td>
                  <td className="py-4 text-slate-800 dark:text-slate-200 font-medium">{customer.spent.toLocaleString('uz-UZ')} so'm</td>
                  <td className="py-4">
                    {customer.isVip && (
                      <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg w-max text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> VIP
                      </div>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <button onClick={() => deleteCustomer(customer.id)} className="text-red-500 hover:text-red-700 transition-colors p-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Yangi mijoz qo'shish</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mijoz ismi</label>
                <input 
                  type="text" 
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefon raqami</label>
                <input 
                  type="text" 
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
