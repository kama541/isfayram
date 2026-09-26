import { Search } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState } from 'react';

export const StaffManagement = () => {
  const { employees } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (emp.phone && emp.phone.includes(searchTerm)) ||
    (emp.pin && emp.pin.includes(searchTerm))
  );
    <div className="min-h-screen bg-[#222838] font-sans text-slate-300">
      
      {/* Search Header */}
      <div className="bg-[#2a3143] border-b border-white/5 p-6 flex flex-col gap-6">
        <h1 className="text-[22px] font-medium text-slate-200 tracking-wide">Tarmoq xodimlarini va ularning huquqlarini boshqarish</h1>
        
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Ism, telefon yoki email orqali qidirish..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#3b4358] text-white pl-12 pr-4 py-3 rounded-xl text-[15px] outline-none focus:ring-1 focus:ring-white/20 placeholder-slate-400 transition-all border border-white/5"
          />
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
              {filteredEmployees.map((emp, index) => (
                <tr key={emp.id} className={`hover:bg-white/5 transition-colors group cursor-pointer ${index % 2 !== 0 ? 'bg-[#32394a]/30' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className={`text-white font-medium ${emp.role === 'admin' ? '' : 'uppercase text-sm'}`}>{emp.fullName}</span>
                      {emp.role === 'admin' && (
                        <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">✓</div>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 mt-0.5">
                      {emp.role === 'admin' ? 'Rahbar' : emp.role === 'cashier' ? 'Kassir' : emp.role === 'waiter' ? 'Ofitsiant' : emp.role}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">📞</span> {emp.phone || 'Kiritilmagan'}
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
    </div>
  );
};
