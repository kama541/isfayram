import { ShoppingCart, Plus, Search, Filter, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLocalStore } from '../../store/useLocalStore';

export const Purchases = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPurchase, setNewPurchase] = useState({ item: '', quantity: '', price: 0, total: 0, date: '', user: 'Admin' });
  
  const { purchases, addPurchase, deletePurchase } = useLocalStore();

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    addPurchase(newPurchase);
    setNewPurchase({ item: '', quantity: '', price: 0, total: 0, date: '', user: 'Admin' });
    setIsModalOpen(false);
  };

  const filteredPurchases = purchases.filter(p => 
    p.item.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-500" /> Xaridlar tarixi
          </h1>
          <p className="text-slate-500 text-sm mt-1">Bozor va do'konlardan qilingan kunlik xaridlar ro'yxati</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
        >
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
                <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredPurchases.map(purchase => (
                <tr key={purchase.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="py-4 text-slate-500 dark:text-slate-400 text-sm">{purchase.id}</td>
                  <td className="py-4 text-slate-800 dark:text-slate-200 font-bold">{purchase.item}</td>
                  <td className="py-4 text-slate-700 dark:text-slate-300">{purchase.quantity}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400">{purchase.price.toLocaleString('uz-UZ')} so'm</td>
                  <td className="py-4 text-emerald-600 dark:text-emerald-400 font-bold">{purchase.total.toLocaleString('uz-UZ')} so'm</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400 text-sm">{purchase.date}</td>
                  <td className="py-4 text-slate-600 dark:text-slate-400 text-sm">{purchase.user}</td>
                  <td className="py-4 text-right">
                    <button onClick={() => deletePurchase(purchase.id)} className="text-red-400 hover:text-red-500 transition-colors p-2">
                      <Trash2 className="w-4 h-4" />
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
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Yangi xarid qo'shish</h2>
            <form onSubmit={handleAddPurchase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mahsulot nomi</label>
                <input type="text" value={newPurchase.item} onChange={e => setNewPurchase({...newPurchase, item: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Miqdor</label>
                  <input type="text" placeholder="Masalan: 10 kg" value={newPurchase.quantity} onChange={e => setNewPurchase({...newPurchase, quantity: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Narxi (birlik)</label>
                  <input type="number" min="0" value={newPurchase.price || ''} onChange={e => setNewPurchase({...newPurchase, price: Number(e.target.value), total: Number(e.target.value) * (parseFloat(newPurchase.quantity) || 1)})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jami summa</label>
                  <input type="number" min="0" value={newPurchase.total || ''} onChange={e => setNewPurchase({...newPurchase, total: Number(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sana</label>
                  <input type="datetime-local" value={newPurchase.date} onChange={e => setNewPurchase({...newPurchase, date: e.target.value})} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" required />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
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
