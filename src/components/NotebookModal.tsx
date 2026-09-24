import { useState } from 'react';
import { BookOpen, Plus, CheckCircle, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/format';
// import type { NotebookEntry } from '../types';

interface NotebookModalProps {
  onClose: () => void;
}

export const NotebookModal = ({ onClose }: NotebookModalProps) => {
  const { notebookEntries, addNotebookEntry, updateNotebookEntryStatus } = useStore();
  const [activeTab, setActiveTab] = useState<'debts' | 'advances'>('debts');
  const [isAdding, setIsAdding] = useState(false);
  
  const [form, setForm] = useState({ personName: '', amount: 0, notes: '' });

  const filteredEntries = notebookEntries.filter(e => e.type === (activeTab === 'debts' ? 'debt' : 'advance'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.personName || form.amount <= 0) return;
    
    addNotebookEntry({
      type: activeTab === 'debts' ? 'debt' : 'advance',
      personName: form.personName,
      amount: form.amount,
      notes: form.notes,
      status: 'unpaid'
    });
    
    setForm({ personName: '', amount: 0, notes: '' });
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Qarzlar va Avanslar Daftarchasi</h2>
              <p className="text-slate-500 text-sm">Kassir uchun qaydlar</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button
                onClick={() => setActiveTab('debts')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'debts' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Mijozlar Qarzlari
              </button>
              <button
                onClick={() => setActiveTab('advances')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'advances' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Xodimlar Avanslari
              </button>
            </div>
            
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'debts' ? 'Qarz yozish' : 'Avans berish'}
            </button>
          </div>

          {isAdding && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 mb-6">
              <h3 className="font-bold text-slate-800 mb-4">
                Yangi {activeTab === 'debts' ? 'qarz' : 'avans'} qo'shish
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Kimga ({activeTab === 'debts' ? 'Mijoz' : 'Xodim'})</label>
                  <input autoFocus required type="text" value={form.personName} onChange={e => setForm({...form, personName: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Ismi..." />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Summa</label>
                  <input required type="number" value={form.amount || ''} onChange={e => setForm({...form, amount: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Izoh</label>
                  <input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Nimaga olindi..." />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-indigo-600 text-white p-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">Saqlash</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Sana</th>
                  <th className="px-6 py-4">{activeTab === 'debts' ? 'Mijoz' : 'Xodim'}</th>
                  <th className="px-6 py-4">Izoh</th>
                  <th className="px-6 py-4">Summa</th>
                  <th className="px-6 py-4">Holati</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-slate-500">{formatDate(entry.createdAt || '')}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{entry.personName}</td>
                    <td className="px-6 py-4 text-slate-500">{entry.notes || '-'}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{formatCurrency(entry.amount)}</td>
                    <td className="px-6 py-4">
                      {entry.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs bg-emerald-50 text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5" /> Uzildi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs bg-orange-50 text-orange-700">
                          <Clock className="w-3.5 h-3.5" /> To'lanmagan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {entry.status === 'unpaid' && (
                        <button 
                          onClick={() => updateNotebookEntryStatus(entry.id, 'paid')}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors shadow-sm"
                        >
                          To'landi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Hech qanday ma'lumot topilmadi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
