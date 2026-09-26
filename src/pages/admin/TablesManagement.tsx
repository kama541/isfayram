import { useState } from 'react';
import { Grid, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Table } from '../../types';

export const TablesManagement = () => {
  const { tables, addTable, updateTable, deleteTable } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    capacity: 4,
    status: 'available' as 'available' | 'occupied' | 'reserved'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTable) {
      await updateTable({ ...editingTable, ...formData });
    } else {
      await addTable(formData);
    }
    setIsModalOpen(false);
    setEditingTable(null);
    setFormData({ name: '', capacity: 4, status: 'available' });
  };

  const openEditModal = (table: Table) => {
    setEditingTable(table);
    setFormData({ name: table.name, capacity: table.capacity, status: table.status });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Haqiqatan ham bu stolni o'chirmoqchimisiz?")) {
      await deleteTable(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Grid className="w-6 h-6 text-blue-500" /> Zallar va Stollar
        </h1>
        <button 
          onClick={() => {
            setEditingTable(null);
            setFormData({ name: '', capacity: 4, status: 'available' });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Yangi stol qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.map(table => (
          <div key={table.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 relative group overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{table.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{table.capacity} kishilik</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                table.status === 'available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                table.status === 'occupied' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {table.status === 'available' ? "Bo'sh" : table.status === 'occupied' ? 'Band' : 'Bron'}
              </div>
            </div>

            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 p-2 rounded-xl backdrop-blur-sm">
              <button onClick={() => openEditModal(table)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(table.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingTable ? "Stolni tahrirlash" : "Yangi stol"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stol raqami/nomi</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sig'imi (kishi)</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.capacity}
                  onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 1})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Check className="w-5 h-5" /> Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
