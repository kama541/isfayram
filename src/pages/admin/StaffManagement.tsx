import { Search } from 'lucide-react';

export const StaffManagement = () => {

  return (
    <div className="min-h-screen bg-[#222838] font-sans text-slate-300">
      
      {/* Search Header */}
      <div className="bg-[#2a3143] border-b border-white/5 p-6 flex flex-col gap-6">
        <h1 className="text-[22px] font-medium text-slate-200 tracking-wide">Tarmoq xodimlarini va ularning huquqlarini boshqarish</h1>
        
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Ism, telefon yoki email orqali qidirish..." 
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

              <tr className="hover:bg-white/5 transition-colors bg-[#32394a]/30 group cursor-pointer">
                <td className="py-4 px-6">
                  <div className="text-white font-medium">Diyorbek</div>
                  <div className="text-sm text-slate-400 mt-0.5">Ofitsiant</div>
                </td>
                <td className="py-4 px-6 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs">📞</span> +998 93 595 70 12
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-block px-3 py-1 bg-[#3b4358] rounded-full text-xs text-slate-300 font-medium border border-white/5">
                    Isfayram Kafe
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-white/5 transition-colors group cursor-pointer">
                <td className="py-4 px-6">
                  <div className="text-white font-medium uppercase text-sm">SHAXNOZ</div>
                  <div className="text-sm text-slate-400 mt-0.5">Ofitsiant</div>
                </td>
                <td className="py-4 px-6 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs">📞</span> +998 93 999 48 57
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-block px-3 py-1 bg-[#3b4358] rounded-full text-xs text-slate-300 font-medium border border-white/5">
                    Isfayram Kafe
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-white/5 transition-colors bg-[#32394a]/30 group cursor-pointer">
                <td className="py-4 px-6">
                  <div className="text-white font-medium uppercase text-sm">SHODIYOR</div>
                  <div className="text-sm text-slate-400 mt-0.5">Ofitsiant</div>
                </td>
                <td className="py-4 px-6 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs">📞</span> +998 93 229 88 96
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-block px-3 py-1 bg-[#3b4358] rounded-full text-xs text-slate-300 font-medium border border-white/5">
                    Isfayram Kafe
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-white/5 transition-colors group cursor-pointer">
                <td className="py-4 px-6">
                  <div className="text-white font-medium uppercase text-sm">JAMILA</div>
                  <div className="text-sm text-slate-400 mt-0.5">Ofitsiant</div>
                </td>
                <td className="py-4 px-6 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs">📞</span> +998 95 962 15 08
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-block px-3 py-1 bg-[#3b4358] rounded-full text-xs text-slate-300 font-medium border border-white/5">
                    Isfayram Kafe
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-white/5 transition-colors bg-[#32394a]/30 group cursor-pointer">
                <td className="py-4 px-6">
                  <div className="text-white font-medium uppercase text-sm">NARGIZA</div>
                </td>
                <td className="py-4 px-6 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs">📞</span> +998 99 391 19 09
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-block px-3 py-1 bg-[#3b4358] rounded-full text-xs text-slate-300 font-medium border border-white/5">
                    Isfayram Kafe
                  </span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
