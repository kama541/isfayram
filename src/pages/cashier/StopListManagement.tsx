import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/format';
import { 
  ListX, CheckCircle2, XCircle, Search, Filter, RotateCcw, 
  UtensilsCrossed, AlertTriangle, Check, X, Sparkles, ChefHat
} from 'lucide-react';

interface StopListManagementProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const StopListManagement = ({ isModal = false, onClose }: StopListManagementProps) => {
  const { menuItems, categories, kitchenStations, updateMenuItemAvailability } = useStore();

  const [activeTab, setActiveTab] = useState<'all' | 'stop' | 'go'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Counters
  const stopCount = useMemo(() => menuItems.filter(i => !i.isAvailable).length, [menuItems]);
  const goCount = useMemo(() => menuItems.filter(i => i.isAvailable).length, [menuItems]);
  const totalCount = menuItems.length;

  // Filtered Items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // Tab filter
      if (activeTab === 'stop' && item.isAvailable) return false;
      if (activeTab === 'go' && !item.isAvailable) return false;

      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.name.toLowerCase().includes(q);
        const descMatch = (item.description || '').toLowerCase().includes(q);
        const cat = categories.find(c => c.id === item.categoryId);
        const catMatch = (cat?.name || '').toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !catMatch) return false;
      }

      return true;
    });
  }, [menuItems, activeTab, selectedCategory, searchQuery, categories]);

  // Handle single item toggle
  const handleToggle = async (item: any) => {
    setUpdatingId(item.id);
    try {
      await updateMenuItemAvailability(item.id, !item.isAvailable);
    } finally {
      setUpdatingId(null);
    }
  };

  // Bulk: restore all stop items to go
  const handleResetAllToGo = async () => {
    const stoppedItems = menuItems.filter(i => !i.isAvailable);
    if (stoppedItems.length === 0) {
      alert("Hozirda Stop-listda taomlar yo'q!");
      return;
    }

    const confirmed = window.confirm(
      `Diqqat! Stop-listdagi barcha ${stoppedItems.length} ta taomni yana sotuvga (Go-list) chiqarmoqchimisiz?`
    );
    if (!confirmed) return;

    for (const item of stoppedItems) {
      await updateMenuItemAvailability(item.id, true);
    }
  };

  return (
    <div className={`flex flex-col ${isModal ? 'h-full max-h-[85vh]' : 'p-4 sm:p-8 space-y-6 select-none'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ListX className="w-6 h-6 text-orange-400" />
            <span>Stop-List & Go-List Boshqaruvi</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#8A8070] mt-1">
            Taomlarning mavjudligini bir bosishda boshqaring (Ofitsiant va kassa darhol ko'radi)
          </p>
        </div>

        {/* Quick Bulk Action */}
        <div className="flex items-center gap-2">
          {stopCount > 0 && (
            <button
              onClick={handleResetAllToGo}
              className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title="Barcha to'xtatilgan taomlarni sotuvga qaytarish"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Barchasini Go Qilish ({stopCount})</span>
            </button>
          )}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Stats & Tabs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        {/* All Tab */}
        <button
          onClick={() => setActiveTab('all')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
              : 'bg-[#1C1A17] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8070]">Barcha Taomlar</span>
            <UtensilsCrossed className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-black text-white mt-1">{totalCount} ta</div>
        </button>

        {/* Stop Tab */}
        <button
          onClick={() => setActiveTab('stop')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'stop'
              ? 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/10'
              : 'bg-[#1C1A17] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">🛑 Stop-List (Tugagan)</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 mt-1">{stopCount} ta</div>
        </button>

        {/* Go Tab */}
        <button
          onClick={() => setActiveTab('go')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'go'
              ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/10'
              : 'bg-[#1C1A17] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">✅ Go-List (Sotuvda Bor)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{goCount} ta</div>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8070]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Taom nomi yoki toifasi bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm outline-none focus:border-[#D4AF37] transition-all placeholder-[#555]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#D4AF37] text-black shadow-sm'
                : 'bg-white/5 text-[#8A8070] hover:text-white border border-white/10'
            }`}
          >
            Barchasi
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#D4AF37] text-black shadow-sm'
                  : 'bg-white/5 text-[#8A8070] hover:text-white border border-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mt-2 max-h-[55vh]">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-[#8A8070] bg-white/5 rounded-2xl border border-white/10">
            <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-bold">Mos taomlar topilmadi</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const cat = categories.find(c => c.id === item.categoryId);
            const station = kitchenStations.find(s => s.id === item.kitchenStationId);
            const isBusy = updatingId === item.id;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.isAvailable
                    ? 'bg-[#1C1A17] border-white/10 hover:border-white/20'
                    : 'bg-red-950/20 border-red-500/30 hover:border-red-500/50'
                }`}
              >
                {/* Left: Info */}
                <div className="flex items-center gap-3">
                  {/* Status Indicator Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    item.isAvailable 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {item.isAvailable ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-black text-sm sm:text-base leading-snug ${
                        item.isAvailable ? 'text-white' : 'text-red-200 line-through opacity-80'
                      }`}>
                        {item.name}
                      </h3>
                      {cat && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-[#8A8070] border border-white/10">
                          {cat.name}
                        </span>
                      )}
                      {station && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1">
                          <ChefHat className="w-2.5 h-2.5" />
                          {station.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#D4AF37] mt-0.5">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>

                {/* Right: Big Toggle Button */}
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(item)}
                    disabled={isBusy}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md ${
                      item.isAvailable
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-500'
                        : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/25 border border-red-400'
                    }`}
                  >
                    {item.isAvailable ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Go (Sotuvda Bor)</span>
                        <span className="text-[10px] opacity-70 ml-1 bg-black/30 px-1.5 py-0.5 rounded">Tugatish</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-white" />
                        <span>🛑 STOPDA (Tugagan)</span>
                        <span className="text-[10px] opacity-90 ml-1 bg-white/20 px-1.5 py-0.5 rounded">Sotuvga chiqarish</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
