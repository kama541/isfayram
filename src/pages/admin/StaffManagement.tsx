import { Search, Plus, X, Trash2, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState } from 'react';

export const StaffManagement = () => {
  const { employees, kitchenStations, addEmployee, updateEmployee, deleteEmployee } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'waiter' | 'cashier' | 'kitchen'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    role: 'waiter' as 'waiter' | 'cashier' | 'kitchen',
    pinCode: '',
    isActive: true,
    kitchenStationIds: [] as string[]
  });

  const handleAddEmployee = async () => {
    if (!newEmployee.fullName.trim() || !newEmployee.pinCode.trim()) {
      alert("Iltimos, xodim ismi va PIN kodini kiriting!");
      return;
    }
    await addEmployee(newEmployee);
    setIsModalOpen(false);
    setNewEmployee({ fullName: '', role: 'waiter', pinCode: '', isActive: true, kitchenStationIds: [] });
  };

  const handleToggleActive = async (emp: any) => {
    await updateEmployee({
      ...emp,
      isActive: !emp.isActive
    });
  };

  const filteredEmployees = employees.filter(emp => {
    if (roleFilter !== 'all' && emp.role !== roleFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return emp.fullName.toLowerCase().includes(q) || (emp.pinCode && emp.pinCode.includes(q));
    }
    return true;
  });

  const showAdminRow = (roleFilter === 'all') && (
    searchTerm.trim() === '' || 
    'admin'.includes(searchTerm.toLowerCase()) || 
    '+998 91 676 91 98'.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#222838] font-sans text-slate-300">
      
      {/* Search Header */}
      <div className="bg-[#2a3143] border-b border-white/5 p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-wide">
            Xodimlar
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Ism yoki PIN-kod orqali qidirish..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#3b4358] text-white pl-12 pr-4 py-3 rounded-xl text-[14px] outline-none focus:ring-1 focus:ring-white/20 placeholder-slate-400 transition-all border border-white/5"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#1e2330] p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-2 rounded-lg transition-all ${roleFilter === 'all' ? 'bg-[#2979ff] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Hammasi
              </button>
              <button
                onClick={() => setRoleFilter('waiter')}
                className={`px-3 py-2 rounded-lg transition-all ${roleFilter === 'waiter' ? 'bg-[#2979ff] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Ofitsiant
              </button>
              <button
                onClick={() => setRoleFilter('cashier')}
                className={`px-3 py-2 rounded-lg transition-all ${roleFilter === 'cashier' ? 'bg-[#2979ff] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Kassir
              </button>
              <button
                onClick={() => setRoleFilter('kitchen')}
                className={`px-3 py-2 rounded-lg transition-all ${roleFilter === 'kitchen' ? 'bg-[#2979ff] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Oshxona
              </button>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)} 
              className="px-5 py-3 bg-[#2979ff] hover:bg-[#226add] text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Yangi Xodim
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Table */}
        <div className="bg-[#2a3143] rounded-2xl border border-white/5 overflow-hidden shadow-sm">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-white/5 bg-[#2a3143] text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Ism & Lavozim</th>
                <th className="py-4 px-6">PIN Kod</th>
                <th className="py-4 px-6">Holati</th>
                <th className="py-4 px-6 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {showAdminRow && (
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">Admin</span>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Tizim rahbari / Administrator</div>
                  </td>
                  <td className="py-4 px-6 text-slate-300 font-mono text-xs">
                    🔒 PIN: 181992
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Faol
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right text-xs text-slate-500">
                    Himoyalangan
                  </td>
                </tr>
              )}

              {filteredEmployees.map((emp, index) => (
                <tr key={emp.id} className={`hover:bg-white/5 transition-colors ${index % 2 !== 0 ? 'bg-[#32394a]/30' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold uppercase text-sm">{emp.fullName}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                        emp.role === 'cashier' 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : emp.role === 'waiter' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {emp.role === 'cashier' ? 'Kassir' : emp.role === 'waiter' ? 'Ofitsiant' : 'Oshxona'}
                      </span>
                      {emp.role === 'kitchen' && emp.kitchenStationIds && emp.kitchenStationIds.length > 0 && (
                        <span>
                          {emp.kitchenStationIds.map(id => kitchenStations.find(k => k.id === id)?.name).filter(Boolean).join(', ')}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-slate-300 font-mono text-sm">
                    🔒 {emp.pinCode || 'Yo\'q'}
                  </td>

                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleActive(emp)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        emp.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                      }`}
                      title="Holatini o'zgartirish uchun bosing"
                    >
                      {emp.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {emp.isActive ? 'Faol (Kirish mumkin)' : 'Nofaol (Bloklangan)'}
                    </button>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => {
                        (window as any).customConfirm?.(`Rostdan ham ${emp.fullName} ismli xodimni o'chirib tashlamoqchimisiz?`, () => {
                          deleteEmployee(emp.id);
                        });
                      }}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {!showAdminRow && filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500 text-sm">
                    Xodimlar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#2a3143] rounded-3xl p-6 w-full max-w-md border border-white/10 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Yangi Xodim Qo'shish</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">To'liq Ismi</label>
                <input
                  type="text"
                  placeholder="Masalan: Sardor Rahimov"
                  value={newEmployee.fullName}
                  onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                  className="w-full bg-[#1e2330] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Lavozimi (Rol)</label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as any })}
                  className="w-full bg-[#1e2330] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="waiter">Ofitsiant</option>
                  <option value="cashier">Kassir</option>
                  <option value="kitchen">Oshxona xodimi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Kirish PIN Kori (4 xonali)</label>
                <input
                  type="text"
                  autoComplete="off"
                  data-lpignore="true"
                  maxLength={6}
                  placeholder="Masalan: 1234"
                  value={newEmployee.pinCode}
                  onChange={(e) => setNewEmployee({ ...newEmployee, pinCode: e.target.value })}
                  style={{ WebkitTextSecurity: 'disc' } as any}
                  className="w-full bg-[#1e2330] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              {newEmployee.role === 'kitchen' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Biriktirilgan Oshxonalar</label>
                  <div className="space-y-2 mt-2">
                    {kitchenStations.filter(k => k.isActive).map(station => (
                      <label key={station.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newEmployee.kitchenStationIds.includes(station.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewEmployee({
                                ...newEmployee,
                                kitchenStationIds: [...newEmployee.kitchenStationIds, station.id]
                              });
                            } else {
                              setNewEmployee({
                                ...newEmployee,
                                kitchenStationIds: newEmployee.kitchenStationIds.filter(id => id !== station.id)
                              });
                            }
                          }}
                          className="rounded border-white/20 bg-slate-800"
                        />
                        <span>{station.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-medium transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleAddEmployee}
                className="flex-1 py-2.5 bg-[#2979ff] hover:bg-[#226add] text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-500/20"
              >
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
