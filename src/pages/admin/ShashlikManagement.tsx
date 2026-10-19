import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Flame, Plus, Calendar, AlertCircle, CheckCircle2, 
  TrendingUp, Package, History, Printer, RefreshCw, X, ChevronRight,
  Sparkles, Layers
} from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface ItemBatch {
  id: string;
  menuItemId: string;
  quantity: number;
  time: string;
  date: string;
  notes?: string;
}

interface DailyAudit {
  initialStock: number;
  actualStock: number | null;
  notes?: string;
}

type TabType = 'shashlik' | 'somsa' | 'all';

export const ShashlikManagement = () => {
  const { menuItems, orders, categories, silentFetch } = useStore();

  // Active Tab: 'shashlik' | 'somsa' | 'all'
  const [activeTab, setActiveTab] = useState<TabType>('shashlik');

  // Selected date (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Raw batches (Xom sixlar va xom somsalar kiritilgan tarixi)
  const [batches, setBatches] = useState<ItemBatch[]>(() => {
    try {
      const saved = localStorage.getItem('shashlik_batches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Daily audits (Boshlang'ich va kechki sanalgan qoldiq)
  // Key format: `${date}_${menuItemId}`
  const [audits, setAudits] = useState<Record<string, DailyAudit>>(() => {
    try {
      const saved = localStorage.getItem('shashlik_audits');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal State for adding raw batches
  const [selectedItemForBatch, setSelectedItemForBatch] = useState<any | null>(null);
  const [batchQuantity, setBatchQuantity] = useState<string>('20');
  const [batchNotes, setBatchNotes] = useState<string>('');

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('shashlik_batches', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('shashlik_audits', JSON.stringify(audits));
  }, [audits]);

  // Identify all shashlik items from menu
  const shashlikMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const name = item.name.toLowerCase();
      const cat = categories.find(c => c.id === item.categoryId);
      const catName = cat?.name?.toLowerCase() || '';
      return (
        catName.includes('shashlik') ||
        name.includes('shashlik') ||
        name.includes('kabob') ||
        name.includes('kuskavoy') ||
        name.includes('qiyma') ||
        name.includes('tovuq file') ||
        name.includes('tovuq qanot')
      );
    });
  }, [menuItems, categories]);

  // Identify all somsa items from menu
  const somsaMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const name = item.name.toLowerCase();
      const cat = categories.find(c => c.id === item.categoryId);
      const catName = cat?.name?.toLowerCase() || '';
      return (
        catName.includes('somsa') ||
        catName.includes('tandir') ||
        name.includes('somsa') ||
        name.includes('tandir somsa')
      );
    });
  }, [menuItems, categories]);

  // Current display items based on activeTab
  const currentItems = useMemo(() => {
    if (activeTab === 'shashlik') return shashlikMenuItems;
    if (activeTab === 'somsa') return somsaMenuItems;
    return [...shashlikMenuItems, ...somsaMenuItems];
  }, [activeTab, shashlikMenuItems, somsaMenuItems]);

  // Calculate sold items for selected date automatically from orders
  const soldMap = useMemo(() => {
    const map: Record<string, number> = {};
    const allTracked = [...shashlikMenuItems, ...somsaMenuItems];

    orders.forEach(order => {
      if (order.status === 'cancelled') return;
      
      const orderDate = (order.createdAt || '').split('T')[0];
      if (orderDate !== selectedDate) return;

      order.items?.forEach((item: any) => {
        const id = item.menuItemId || item.id;
        const name = (item.name || '').toLowerCase();
        
        const match = allTracked.find(m => m.id === id || m.name.toLowerCase() === name);
        if (match) {
          map[match.id] = (map[match.id] || 0) + (item.quantity || 0);
        }
      });
    });
    return map;
  }, [orders, selectedDate, shashlikMenuItems, somsaMenuItems]);

  // Add raw batch (Xom six yoki xom somsa olib chiqildi)
  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(batchQuantity, 10);
    if (!selectedItemForBatch || isNaN(qty) || qty <= 0) return;

    const newBatch: ItemBatch = {
      id: 'batch_' + Date.now(),
      menuItemId: selectedItemForBatch.id,
      quantity: qty,
      date: selectedDate,
      time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      notes: batchNotes.trim() || undefined
    };

    setBatches(prev => [newBatch, ...prev]);
    setSelectedItemForBatch(null);
    setBatchQuantity('20');
    setBatchNotes('');
  };

  // Delete a batch
  const handleDeleteBatch = (batchId: string) => {
    setBatches(prev => prev.filter(b => b.id !== batchId));
  };

  // Update audit (boshlang'ich yoki haqiqiy qoldiq)
  const handleUpdateAudit = (menuItemId: string, field: 'initialStock' | 'actualStock', val: string) => {
    const key = `${selectedDate}_${menuItemId}`;
    const parsed = val === '' ? null : parseInt(val, 10);
    const existing = audits[key] || { initialStock: 0, actualStock: null };

    setAudits(prev => ({
      ...prev,
      [key]: {
        ...existing,
        [field]: parsed === null ? (field === 'initialStock' ? 0 : null) : (isNaN(parsed) ? 0 : parsed)
      }
    }));
  };

  // Calculate metrics for currentItems
  const summary = useMemo(() => {
    let totalInitial = 0;
    let totalRawAdded = 0;
    let totalSold = 0;
    let totalExpected = 0;
    let totalRevenue = 0;
    let totalDiscrepancy = 0;

    currentItems.forEach(item => {
      const key = `${selectedDate}_${item.id}`;
      const audit = audits[key] || { initialStock: 0, actualStock: null };
      const rawAdded = batches
        .filter(b => b.date === selectedDate && b.menuItemId === item.id)
        .reduce((sum, b) => sum + b.quantity, 0);
      const sold = soldMap[item.id] || 0;
      const expected = (audit.initialStock || 0) + rawAdded - sold;

      totalInitial += audit.initialStock || 0;
      totalRawAdded += rawAdded;
      totalSold += sold;
      totalExpected += expected;
      totalRevenue += sold * item.price;

      if (audit.actualStock !== null && audit.actualStock !== undefined) {
        totalDiscrepancy += (audit.actualStock - expected);
      }
    });

    return {
      totalInitial,
      totalRawAdded,
      totalSold,
      totalExpected,
      totalRevenue,
      totalDiscrepancy
    };
  }, [currentItems, batches, soldMap, audits, selectedDate]);

  // Selected date batches list
  const currentDayBatches = useMemo(() => {
    const itemIds = new Set(currentItems.map(i => i.id));
    return batches.filter(b => b.date === selectedDate && itemIds.has(b.menuItemId));
  }, [batches, selectedDate, currentItems]);

  const isSomsa = (item: any) => {
    const n = item.name.toLowerCase();
    return n.includes('somsa') || n.includes('tandir');
  };

  const getUnit = (item: any) => {
    return isSomsa(item) ? 'dona' : 'six';
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto font-sans min-h-screen text-[#F5F2EA]">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                 style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <Flame className="w-7 h-7 text-[#D4AF37]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Shashlik & Tandir Somsa Hisobi
              </h1>
              <p className="text-xs sm:text-sm text-[#8A8070] mt-0.5">
                Xom olib chiqilishi, pishganini sotilishi va kunlik qoldiq/kamomad nazorati
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border"
               style={{ background: '#1C1A17', borderColor: 'rgba(212,175,55,0.2)' }}>
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedDate === todayStr 
                ? 'bg-[#D4AF37] text-black shadow-md' 
                : 'bg-[#1C1A17] text-[#8A8070] hover:text-white border border-white/5'
            }`}
          >
            Bugun
          </button>

          <button
            onClick={() => silentFetch()}
            title="Yangilash"
            className="p-2.5 rounded-xl bg-[#1C1A17] hover:bg-white/5 border border-white/5 text-[#D4AF37] transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1C1A17] hover:bg-white/5 border border-[#D4AF37]/30 text-white flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" /> Hisobotni Chop Etish
          </button>
        </div>
      </div>

      {/* ── TABS: SHASHLIK vs SOMSA vs BARCHASI ── */}
      <div className="flex items-center gap-2 mb-6 p-1.5 rounded-2xl bg-[#1C1A17] border border-white/5 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('shashlik')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'shashlik'
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
              : 'text-[#8A8070] hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame className="w-4 h-4" />
          🍢 Shashlik Hisobi ({shashlikMenuItems.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('somsa')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'somsa'
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
              : 'text-[#8A8070] hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="text-base">🥟</span>
          Tandir Somsa Hisobi ({somsaMenuItems.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
              : 'text-[#8A8070] hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          📊 Barchasi ({currentItems.length})
        </button>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
        {/* 1. Xom kirim */}
        <div className="p-4 rounded-2xl border" style={{ background: '#1C1A17', borderColor: 'rgba(212,175,55,0.15)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8070]">Xom Kirim</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold">Bugun</span>
          </div>
          <div className="text-2xl font-black text-blue-400">
            {summary.totalRawAdded} <span className="text-sm font-semibold text-slate-400">{activeTab === 'somsa' ? 'dona' : 'birlik'}</span>
          </div>
          <div className="text-[11px] text-[#8A8070] mt-1">Olib chiqilgan xomashyo</div>
        </div>

        {/* 2. Sotilgan pishgani */}
        <div className="p-4 rounded-2xl border" style={{ background: '#1C1A17', borderColor: 'rgba(212,175,55,0.15)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8070]">Sotildi (Pishgani)</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold">Avtomat</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {summary.totalSold} <span className="text-sm font-semibold text-slate-400">dona</span>
          </div>
          <div className="text-[11px] text-[#8A8070] mt-1">Buyurtmalar orqali ketgan</div>
        </div>

        {/* 3. Kutilayotgan qoldiq */}
        <div className="p-4 rounded-2xl border" style={{ background: '#1C1A17', borderColor: 'rgba(212,175,55,0.15)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8070]">Qolishi kerak</span>
            <Package className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-black text-[#D4AF37]">
            {summary.totalExpected} <span className="text-sm font-semibold text-slate-400">{activeTab === 'somsa' ? 'dona' : 'birlik'}</span>
          </div>
          <div className="text-[11px] text-[#8A8070] mt-1">Boshlang'ich + Kirim - Chiqim</div>
        </div>

        {/* 4. Tushum */}
        <div className="p-4 rounded-2xl border" style={{ background: '#1C1A17', borderColor: 'rgba(212,175,55,0.15)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8070]">Tushum</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-white truncate">
            {formatCurrency(summary.totalRevenue)}
          </div>
          <div className="text-[11px] text-[#8A8070] mt-1">Sotuvdan jami summa</div>
        </div>

        {/* 5. Kamomad / Farq */}
        <div className="p-4 rounded-2xl border col-span-2 lg:col-span-1" style={{ background: '#1C1A17', borderColor: 'rgba(212,175,55,0.15)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8070]">Kamomad / Farq</span>
            {summary.totalDiscrepancy === 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className={`text-2xl font-black ${
            summary.totalDiscrepancy === 0 
              ? 'text-emerald-400' 
              : summary.totalDiscrepancy < 0 
                ? 'text-red-400' 
                : 'text-amber-400'
          }`}>
            {summary.totalDiscrepancy > 0 ? `+${summary.totalDiscrepancy}` : summary.totalDiscrepancy}
            <span className="text-sm font-semibold text-slate-400 ml-1">dona</span>
          </div>
          <div className="text-[11px] text-[#8A8070] mt-1">
            {summary.totalDiscrepancy === 0 ? "Barchasi to'liq mos" : summary.totalDiscrepancy < 0 ? "Kamomad aniqlandi" : "Ortiqcha qoldiq bor"}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT: TABLE & BATCHES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN TABLE (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl border overflow-hidden shadow-2xl"
               style={{ background: '#1C1A17', borderColor: 'rgba(212,175,55,0.15)' }}>
            <div className="p-5 border-b flex items-center justify-between"
                 style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{activeTab === 'somsa' ? '🥟 Tandir Somsalar' : activeTab === 'shashlik' ? '🍢 Shashliklar' : '🍢 Shashlik & 🥟 Somsa'} Bo'yicha Hisobot</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold">
                    {currentItems.length} xil
                  </span>
                </h2>
                <p className="text-xs text-[#8A8070] mt-0.5">
                  Xom kiritish uchun "+" tugmasini bosing yoki haqiqiy kechki sanoqni kiriting
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase font-bold text-[#8A8070] border-b"
                      style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(212,175,55,0.1)' }}>
                    <th className="py-3.5 px-4">Nomi</th>
                    <th className="py-3.5 px-2 text-center" title="Ertalab qolgan soni">Ertalabki</th>
                    <th className="py-3.5 px-2 text-center" title="Bugun olib chiqilgan xom">+ Xom Kirim</th>
                    <th className="py-3.5 px-2 text-center" title="Buyurtmalardan sotilgan">Sotildi</th>
                    <th className="py-3.5 px-2 text-center" title="Hisob bo'yicha qolishi kerak">Kutilgan</th>
                    <th className="py-3.5 px-2 text-center" title="Kechqurun sanalgan haqiqiy soni">Haqiqiy Qoldiq</th>
                    <th className="py-3.5 px-3 text-center">Farq</th>
                    <th className="py-3.5 px-3 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {currentItems.map(item => {
                    const key = `${selectedDate}_${item.id}`;
                    const audit = audits[key] || { initialStock: 0, actualStock: null };
                    const rawAdded = batches
                      .filter(b => b.date === selectedDate && b.menuItemId === item.id)
                      .reduce((sum, b) => sum + b.quantity, 0);
                    const sold = soldMap[item.id] || 0;
                    const expected = (audit.initialStock || 0) + rawAdded - sold;
                    const hasActual = audit.actualStock !== null && audit.actualStock !== undefined;
                    const diff = hasActual ? (audit.actualStock! - expected) : null;
                    const unitLabel = getUnit(item);

                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Name & Price */}
                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-bold text-white text-[13px] flex items-center gap-1.5">
                            <span>{isSomsa(item) ? '🥟' : '🍢'}</span>
                            <span>{item.name}</span>
                          </div>
                          <div className="text-[11px] text-[#D4AF37] font-mono">{formatCurrency(item.price)}</div>
                        </td>

                        {/* Initial Stock */}
                        <td className="py-3.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            value={audit.initialStock || ''}
                            placeholder="0"
                            onChange={(e) => handleUpdateAudit(item.id, 'initialStock', e.target.value)}
                            className="w-14 px-1.5 py-1 text-center font-bold text-xs bg-black/30 border border-white/10 rounded-lg text-white outline-none focus:border-[#D4AF37]"
                          />
                        </td>

                        {/* Raw Added (Xom kirim) */}
                        <td className="py-3.5 px-2 text-center">
                          <span className="font-extrabold text-blue-400 text-sm">
                            +{rawAdded}
                          </span>
                        </td>

                        {/* Sold (Pishgani) */}
                        <td className="py-3.5 px-2 text-center">
                          <span className="font-extrabold text-emerald-400 text-sm">
                            {sold}
                          </span>
                        </td>

                        {/* Expected Remaining */}
                        <td className="py-3.5 px-2 text-center">
                          <span className="font-extrabold text-[#D4AF37] text-sm bg-[#D4AF37]/10 px-2 py-0.5 rounded-md">
                            {expected}
                          </span>
                        </td>

                        {/* Actual Count (Kechqurun sanalgani) */}
                        <td className="py-3.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            value={audit.actualStock !== null && audit.actualStock !== undefined ? audit.actualStock : ''}
                            placeholder="Sanoq..."
                            onChange={(e) => handleUpdateAudit(item.id, 'actualStock', e.target.value)}
                            className="w-16 px-1.5 py-1 text-center font-bold text-xs bg-black/40 border border-white/15 rounded-lg text-white outline-none focus:border-[#D4AF37]"
                          />
                        </td>

                        {/* Discrepancy / Kamomad */}
                        <td className="py-3.5 px-3 text-center">
                          {diff === null ? (
                            <span className="text-[11px] text-[#6C6659] italic">—</span>
                          ) : diff === 0 ? (
                            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              ✓ Aniq
                            </span>
                          ) : diff < 0 ? (
                            <span className="text-[11px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                              {diff} {unitLabel}
                            </span>
                          ) : (
                            <span className="text-[11px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              +{diff} {unitLabel}
                            </span>
                          )}
                        </td>

                        {/* Action: Add batch button */}
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedItemForBatch(item);
                              setBatchQuantity(isSomsa(item) ? '50' : '20');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] font-bold text-xs flex items-center gap-1 ml-auto transition-all cursor-pointer border border-[#D4AF37]/30"
                            title="Xom kiritish"
                          >
                            <Plus className="w-3.5 h-3.5" /> Kirim
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SIDE PANEL: RAW INPUT HISTORY (1 Column) */}
        <div className="space-y-4">
          <div className="rounded-3xl border p-5 shadow-2xl"
               style={{ background: '#1C1A17', borderColor: 'rgba(212,175,55,0.15)' }}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <History className="w-4 h-4 text-[#D4AF37]" />
                Bugungi Xom Kirimlar
              </h3>
              <span className="text-xs text-[#8A8070] font-mono font-bold">
                {currentDayBatches.length} ta partiya
              </span>
            </div>

            {currentDayBatches.length === 0 ? (
              <div className="text-center py-10 text-[#6C6659]">
                <Flame className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs">Ushbu sana uchun hali xomashyo kiritilmadi.</p>
                <p className="text-[11px] opacity-75 mt-1">Jadvaldagi "+ Kirim" tugmasi orqali kiriting.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {currentDayBatches.map(batch => {
                  const item = [...shashlikMenuItems, ...somsaMenuItems].find(m => m.id === batch.menuItemId);
                  const somsaItem = item ? isSomsa(item) : false;
                  return (
                    <div 
                      key={batch.id}
                      className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                          <span>{somsaItem ? '🥟' : '🍢'}</span>
                          <span>{item?.name || 'Mahsulot'}</span>
                        </div>
                        <div className="text-[11px] text-[#8A8070] flex items-center gap-2 mt-0.5 font-mono">
                          <span>🕒 {batch.time}</span>
                          {batch.notes && <span>• {batch.notes}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-black text-blue-400 text-sm px-2.5 py-1 rounded-xl bg-blue-500/10 font-mono">
                          +{batch.quantity} {somsaItem ? 'dona' : 'six'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteBatch(batch.id)}
                          className="text-[#6C6659] hover:text-red-400 transition-colors p-1"
                          title="O'chirish"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Help Box */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-[#8A8070] leading-relaxed space-y-1.5">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              💡 Shashlik & Somsa hisob-kitob qoidasi:
            </div>
            <p>1. <strong>Xom kirim:</strong> Qassob olib chiqqan sixlar yoki tandirchi tugib yopgan somsalar kiritiladi.</p>
            <p>2. <strong>Sotilgan:</strong> Ofitsiantlar buyurtma berganda tizimdan avtomatik hisoblanadi.</p>
            <p>3. <strong>Kechqurun:</strong> Sanalgan qoldiq kiritilganda, kamomad bo'lsa darhol ko'rsatiladi.</p>
          </div>
        </div>
      </div>

      {/* ── MODAL: ADD RAW BATCH ── */}
      {selectedItemForBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl shadow-2xl border"
               style={{ background: '#1C1A17', borderColor: 'rgba(212,175,55,0.3)' }}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{isSomsa(selectedItemForBatch) ? '🥟' : '🍢'}</span>
                  <span>Xom {isSomsa(selectedItemForBatch) ? 'Somsa' : 'Six'} Qo'shish</span>
                </h3>
                <p className="text-xs text-[#D4AF37] font-bold mt-0.5">
                  {selectedItemForBatch.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedItemForBatch(null)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#8A8070] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#8A8070] mb-2 tracking-wider">
                  Miqdori ({getUnit(selectedItemForBatch)})
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {(isSomsa(selectedItemForBatch) ? ['25', '50', '100', '150'] : ['10', '20', '30', '50']).map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBatchQuantity(preset)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        batchQuantity === preset 
                          ? 'bg-[#D4AF37] text-black shadow-md' 
                          : 'bg-black/30 border border-white/10 text-white hover:border-[#D4AF37]/50'
                      }`}
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  required
                  value={batchQuantity}
                  onChange={(e) => setBatchQuantity(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/15 text-white font-mono font-black text-xl text-center outline-none focus:border-[#D4AF37]"
                  placeholder="Masalan: 50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#8A8070] mb-1.5 tracking-wider">
                  Izoh (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white text-xs outline-none focus:border-[#D4AF37]"
                  placeholder={isSomsa(selectedItemForBatch) ? "Masalan: 1-tandir, Tandirchi Ali" : "Masalan: 2-partiya, Qassob"}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForBatch(null)}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold bg-white/5 hover:bg-white/10 text-[#8A8070] transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl text-xs font-black bg-[#D4AF37] hover:bg-[#c49f27] text-black transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Kirim Qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
