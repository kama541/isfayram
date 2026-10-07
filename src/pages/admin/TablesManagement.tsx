import { useState } from 'react';
import { Grid, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Table } from '../../types';
import { getDefaultTableSection } from '../../utils/format';

export const TablesManagement = () => {
  const { tables, addTable, updateTable, deleteTable } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  
  const [formData, setFormData] = useState({
    number: '1',
    seats: 4,
    status: 'available' as 'available' | 'occupied' | 'reserved'
  });

  // Section stored in localStorage: { [tableId]: section }
  const getSections = () => JSON.parse(localStorage.getItem('tableZones_v2') || '{}');
  const setSection = (tableId: string, section: string) => {
    const s = getSections();
    s[tableId] = section;
    localStorage.setItem('tableZones_v2', JSON.stringify(s));
  };
  const getSection = (tableId: string) => {
    const saved = getSections()[tableId];
    if (saved) return saved;
    const t = useStore.getState().tables.find(x => x.id === tableId);
    return t ? getDefaultTableSection(t.number) : 'Zal';
  };

  const [editingSection, setEditingSection] = useState('Zal');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTable) {
        await updateTable({ ...editingTable, ...formData });
        setSection(editingTable.id, editingSection);
      } else {
        await addTable(formData);
      }
      setIsModalOpen(false);
      setEditingTable(null);
      setFormData({ number: '1', seats: 4, status: 'available' });
      setEditingSection('Zal');
    } catch (error: any) {
      alert("Xatolik yuz berdi! Bunday raqamli xona allaqachon mavjud bo'lishi mumkin.");
    }
  };

  const openEditModal = (table: Table) => {
    setEditingTable(table);
    setFormData({ number: table.number, seats: table.seats, status: table.status });
    setEditingSection(getSection(table.id));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    (window as any).customConfirm("Haqiqatan ham bu xonani o'chirmoqchimisiz?", async () => {
      try {
        await deleteTable(id);
      } catch (error) {
        alert("Xatolik! Bu xonani o'chirib bo'lmaydi, chunki unga bog'langan eski buyurtmalar mavjud. Iltimos, oldin bazani tozalang.");
      }
    });
  };

  const handleSeed = async () => {
    (window as any).customConfirm("9 ta kabinet va 15 ta stol qo'shilsinmi?", async () => {
      for(let i=1; i<=9; i++) {
        await addTable({ number: `${i}-kabinet`, seats: 4, status: 'available' });
      }
      for(let i=1; i<=15; i++) {
        await addTable({ number: `${i}-stol`, seats: 4, status: 'available' });
      }
      alert("Muvaffaqiyatli qo'shildi!");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Grid className="w-6 h-6 text-blue-500" /> Xonalar
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={handleSeed}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
          >
            Seed
          </button>
          <button 
          onClick={() => {
            setEditingTable(null);
            setFormData({ number: '1', seats: 4, status: 'available' });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Yangi xona qo'shish
        </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.map(table => (
          <div key={table.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 relative group overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{table.number}</h3>
                <p className="text-slate-500 text-sm mt-1">{table.seats} kishilik</p>
                <span className="text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{getSection(table.id)}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                table.status === 'available' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                table.status === 'occupied' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {table.status === 'available' ? "Bo'sh" : table.status === 'occupied' ? 'Band' : 'Bron'}
              </div>
            </div>

            <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <button onClick={() => openEditModal(table)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Tahrirlash">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(table.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="O'chirish">
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
                {editingTable ? "Xonani tahrirlash" : "Yangi xona"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Xona nomi</label>
                <input 
                  type="text" 
                  value={formData.number}
                  onChange={e => setFormData({...formData, number: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sig'imi (kishi)</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.seats}
                  onChange={e => setFormData({...formData, seats: parseInt(e.target.value) || 1})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bo'lim</label>
                <select
                  value={editingSection}
                  onChange={e => setEditingSection(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                >
                  <option value="Ko'cha">Ko'cha (Tashqi)</option>
                  <option value="Zal">Zal (Ichki)</option>
                  <option value="Kabina">Kabina</option>
                </select>
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
