import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { UserPlus, User as UserIcon, KeyRound, Save, X } from 'lucide-react';
import type { Employee } from '../../types';

export const StaffManagement = () => {
  const { employees, addEmployee, deleteEmployee, updateEmployee } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'waiter' as 'waiter' | 'cashier',
    pinCode: '',
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || formData.pinCode.length !== 4) return;
    
    if (editingId) {
      updateEmployee({
        id: editingId,
        ...formData
      });
      setEditingId(null);
    } else {
      addEmployee(formData);
    }
    
    setIsAdding(false);
    setFormData({ fullName: '', role: 'waiter', pinCode: '', isActive: true });
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      fullName: employee.fullName,
      role: employee.role,
      pinCode: employee.pinCode,
      isActive: employee.isActive
    });
    setEditingId(employee.id);
    setIsAdding(true);
  };

  return (
    <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Xodimlar Boshqaruvi</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Kassirlar va ofitsiantlarni qo'shish va parollar o'rnatish</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
            setFormData({ fullName: '', role: 'waiter', pinCode: '', isActive: true });
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/30"
        >
          {isAdding ? <X className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />} 
          {isAdding ? 'Bekor qilish' : 'Yangi Xodim'}
        </button>
      </div>
      
      {isAdding && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8 animation-fade-in">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{editingId ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ism familiyasi</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
                placeholder="Masalan: Alisher Vahobov"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lavozimi</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
              >
                <option value="waiter">Ofitsiant</option>
                <option value="cashier">Kassir</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PIN Kod (4 raqam)</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  maxLength={4}
                  required
                  pattern="[0-9]{4}"
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value.replace(/\D/g, '') })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono tracking-widest dark:text-white"
                  placeholder="1234"
                />
              </div>
            </div>
            <div>
              <button 
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> Saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 border-dashed">
            Hali xodimlar qo'shilmagan.
          </div>
        ) : employees.map(employee => (
          <div key={employee.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${employee.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                employee.role === 'cashier' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
              }`}>
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 dark:text-white truncate">{employee.fullName}</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize mt-1">
                  {employee.role === 'cashier' ? 'Kassir' : 'Ofitsiant'}
                </p>
              </div>
            </div>
            
            <div className="mt-auto bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 flex justify-between items-center border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-400" />
                <span className="font-mono font-bold tracking-widest text-slate-700 dark:text-slate-300">{employee.pinCode}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(employee)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Tahrirlash
                </button>
                <button 
                  onClick={() => deleteEmployee(employee.id)}
                  className="text-red-500 text-sm font-medium hover:underline"
                >
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
