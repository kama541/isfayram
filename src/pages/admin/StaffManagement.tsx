import { Search, Plus, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState } from 'react';

export const StaffManagement = () => {
  const { employees, addEmployee } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    role: 'waiter' as 'waiter' | 'cashier',
    pinCode: '',
    isActive: true
  });

  const handleAddEmployee = async () => {
    if (!newEmployee.fullName.trim() || !newEmployee.pinCode.trim()) return;
    await addEmployee(newEmployee);
    setIsModalOpen(false);
    setNewEmployee({ fullName: '', role: 'waiter', pinCode: '', isActive: true });
  };

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (emp.pinCode && emp.pinCode.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-[#222838] font-sans text-slate-300">
      
      {/* Search Header */}
      <div className="bg-[#2a3143] border-b border-white/5 p-6 flex flex-col gap-6">
        <h1 className="text-[22px] font-medium text-slate-200 tracking-wide">Tarmoq xodimlarini va ularning huquqlarini boshqarish</h1>
        
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Ism, telefon yoki email orqali qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#3b4358] text-white pl-12 pr-4 py-3 rounded-xl text-[15px] outline-none focus:ring-1 focus:ring-white/20 placeholder-slate-400 transition-all border border-white/5"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-5 py-3 bg-[#2979ff] hover:bg-[#226add] text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-5 h-5" />
            Yangi Xodim
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Table */}
        <div className="bg-[#2a3143] rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="border-b border-white/5 bg-[#2a3143]">
                <th className="py-4 px-6 font-medium text-slate-200">Ism</th>
                <th className="py-4 px-6 font-medium text-slate-200">Kontaktlar</th>
                <th className="py-4 px-6 font-medium text-slate-200">Restoranlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              
              <tr className="hover:bg-white/5 transition-colors group cursor-pointer">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">admin</span>
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">✓</div>
                  </div>
                  <div className="text-sm text-slate-400 mt-0.5">Rahbar</div>
                </td>
                <td className="py-4 px-6 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs">📞</span> +998 91 676 91 98
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-block px-3 py-1 bg-[#3b4358] rounded-full text-xs text-slate-300 font-medium border border-white/5">
                    Isfayram Kafe
                  </span>
                </td>
              </tr>

              {filteredEmployees.map((emp, index) => (
                <tr key={emp.id} className={`hover:bg-white/5 transition-colors group cursor-pointer ${(index + 1) % 2 !== 0 ? 'bg-[#32394a]/30' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium uppercase text-sm">{emp.fullName}</span>
                    </div>
                    <div className="text-sm text-slate-400 mt-0.5">
                      {emp.role === 'cashier' ? 'Kassir' : emp.role === 'waiter' ? 'Ofitsiant' : emp.role}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">🔒</span> PIN: {emp.pinCode || 'Kiritilmagan'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 bg-[#3b4358] rounded-full text-xs text-slate-300 font-medium border border-white/5">
                      Isfayram Kafe
                    </span>
                  </td>
                </tr>
              ))}
              
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">
                    Xodimlar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#2a3143] rounded-2xl w-full max-w-md overflow-hidden border border-white/10 shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#32394a]/30">
              <h2 className="text-xl font-bold text-white">Yangi Xodim Qo'shish</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">F.I.O</label>
                <input
                  type="text"
                  value={newEmployee.fullName}
                  onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                  className="w-full bg-[#1e2330] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Xodimning to'liq ismini kiriting"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Lavozimi</label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as 'waiter' | 'cashier' })}
                  className="w-full bg-[#1e2330] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="waiter">Ofitsiant</option>
                  <option value="cashier">Kassir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">PIN kod (kirish uchun)</label>
                <input
                  type="text"
                  value={newEmployee.pinCode}
                  onChange={(e) => setNewEmployee({ ...newEmployee, pinCode: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-[#1e2330] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 tracking-widest font-mono"
                  placeholder="0000"
                  maxLength={4}
                />
              </div>
            </div>
            
            <div className="p-6 pt-2 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-medium transition-colors">
                Bekor qilish
              </button>
              <button onClick={handleAddEmployee} disabled={!newEmployee.fullName || !newEmployee.pinCode} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
