import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Package, Plus, Search, AlertCircle, Trash2, Edit3, Beaker, Save, ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export const InventoryManagement = () => {
  const { inventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, addInventoryTransaction, menuItems, recipeIngredients, setRecipe } = useStore();
  const [activeTab, setActiveTab] = useState<'stock' | 'recipes' | 'history'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stock State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemForm, setItemForm] = useState({ name: '', unit: 'kg', minStockLevel: 0, purchasePrice: 0, supplier: '' });
  
  const [isStockIn, setIsStockIn] = useState<string | null>(null);
  const [stockInForm, setStockInForm] = useState({ quantity: 0, price: 0, notes: '' });

  // Recipe State
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<{inventoryItemId: string, quantity: number}[]>([]);

  const filteredItems = inventoryItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name) return;
    addInventoryItem({
      ...itemForm,
      currentStock: 0
    });
    setIsAddingItem(false);
    setItemForm({ name: '', unit: 'kg', minStockLevel: 0, purchasePrice: 0, supplier: '' });
  };

  const handleStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStockIn || stockInForm.quantity <= 0) return;
    
    addInventoryTransaction({
      itemId: isStockIn,
      transactionType: 'in',
      quantity: stockInForm.quantity,
      referenceId: stockInForm.notes || 'Kirim qilindi'
    });
    
    // Optionally update purchase price if it changed
    if (stockInForm.price > 0) {
      const item = inventoryItems.find(i => i.id === isStockIn);
      if (item) {
        updateInventoryItem({ ...item, purchasePrice: stockInForm.price });
      }
    }
    
    setIsStockIn(null);
    setStockInForm({ quantity: 0, price: 0, notes: '' });
  };

  const loadRecipe = (menuId: string) => {
    setSelectedMenuItem(menuId);
    const existing = recipeIngredients.filter(r => r.menuItemId === menuId).map(r => ({
      inventoryItemId: r.inventoryItemId,
      quantity: r.quantity
    }));
    setCurrentRecipe(existing);
  };

  const handleSaveRecipe = () => {
    if (!selectedMenuItem) return;
    const formatted = currentRecipe.map(r => ({
      menuItemId: selectedMenuItem,
      inventoryItemId: r.inventoryItemId,
      quantity: r.quantity,
      notes: ''
    }));
    setRecipe(selectedMenuItem, formatted);
    setSelectedMenuItem(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-indigo-600" />
            Omborxona (Inventory)
          </h1>
          <p className="text-slate-500 text-sm mt-1">Xom-ashyo qoldig'ini va texnologik kartalarni (retsept) boshqarish</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-xl mb-8 w-max border border-slate-200/60">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'stock' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Ombor Qoldig'i
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'recipes' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Retseptlar (Tex karta)
        </button>
      </div>

      {/* TAB: STOCK */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="relative w-96">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Mahsulot izlash..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAddingItem(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Yangi mahsulot
            </button>
          </div>

          {isAddingItem && (
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 relative">
              <button onClick={() => setIsAddingItem(false)} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600">×</button>
              <h3 className="font-bold text-indigo-900 mb-4">Omborga yangi mahsulot turini qo'shish</h3>
              <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-indigo-900 mb-1">Mahsulot nomi</label>
                  <input required type="text" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="w-full p-2 border border-indigo-200 rounded-lg text-sm" placeholder="Masalan: Lahm go'sht" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-indigo-900 mb-1">O'lchov birligi</label>
                  <select value={itemForm.unit} onChange={e => setItemForm({...itemForm, unit: e.target.value})} className="w-full p-2 border border-indigo-200 rounded-lg text-sm bg-white">
                    <option value="kg">Kilogramm (kg)</option>
                    <option value="l">Litr (l)</option>
                    <option value="dona">Dona</option>
                    <option value="pors">Porsiya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-indigo-900 mb-1">Minimal qoldiq</label>
                  <input required type="number" step="0.1" value={itemForm.minStockLevel} onChange={e => setItemForm({...itemForm, minStockLevel: Number(e.target.value)})} className="w-full p-2 border border-indigo-200 rounded-lg text-sm" />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">Saqlash</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Mahsulot</th>
                  <th className="px-6 py-4 text-center">Qoldiq</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.name}</div>
                      {item.currentStock <= item.minStockLevel && (
                        <div className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Kam qoldi
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-sm ${
                        item.currentStock <= item.minStockLevel ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {item.currentStock} {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isStockIn === item.id ? (
                        <form onSubmit={handleStockIn} className="flex items-center justify-end gap-2">
                          <input type="number" step="0.1" autoFocus required value={stockInForm.quantity || ''} onChange={e => setStockInForm({...stockInForm, quantity: Number(e.target.value)})} placeholder="+ miqdor" className="w-24 p-1.5 border border-slate-300 rounded-lg text-sm" />
                          <button type="submit" className="bg-emerald-500 text-white p-1.5 rounded-lg hover:bg-emerald-600"><Plus className="w-4 h-4" /></button>
                          <button type="button" onClick={() => setIsStockIn(null)} className="text-slate-400 hover:text-slate-600 p-1.5 font-bold">×</button>
                        </form>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setIsStockIn(item.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 font-semibold rounded-lg text-xs hover:bg-emerald-100 flex items-center gap-1">
                            <ArrowRightLeft className="w-3 h-3" /> Kirim
                          </button>
                          <button onClick={() => deleteInventoryItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">Mahsulot topilmadi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: RECIPES */}
      {activeTab === 'recipes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-1">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
              Menyu Taomlari
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {menuItems.map(menu => {
                const hasRecipe = recipeIngredients.some(r => r.menuItemId === menu.id);
                return (
                  <button
                    key={menu.id}
                    onClick={() => loadRecipe(menu.id)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex justify-between items-center ${selectedMenuItem === menu.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{menu.name}</div>
                      <div className={`text-xs mt-0.5 font-medium ${hasRecipe ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {hasRecipe ? 'Retsept biriktirilgan' : 'Retsept yo\'q'}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedMenuItem ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                  <h2 className="text-xl font-bold text-slate-800">
                    {menuItems.find(m => m.id === selectedMenuItem)?.name} - Tarkibi
                  </h2>
                  <button 
                    onClick={handleSaveRecipe}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Saqlash
                  </button>
                </div>

                <div className="space-y-3 mb-8">
                  {currentRecipe.map((ing, idx) => {
                    const invItem = inventoryItems.find(i => i.id === ing.inventoryItemId);
                    return (
                      <div key={idx} className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <select
                          value={ing.inventoryItemId}
                          onChange={e => {
                            const newR = [...currentRecipe];
                            newR[idx].inventoryItemId = e.target.value;
                            setCurrentRecipe(newR);
                          }}
                          className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-sm"
                        >
                          <option value="">Maxsulotni tanlang...</option>
                          {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                        </select>
                        
                        <div className="flex items-center gap-2 w-48">
                          <input
                            type="number"
                            step="0.001"
                            value={ing.quantity || ''}
                            onChange={e => {
                              const newR = [...currentRecipe];
                              newR[idx].quantity = Number(e.target.value);
                              setCurrentRecipe(newR);
                            }}
                            className="w-24 p-2 bg-white border border-slate-200 rounded-lg text-sm"
                            placeholder="Miqdor"
                          />
                          <span className="text-sm font-semibold text-slate-500 w-12">{invItem?.unit || '-'}</span>
                        </div>
                        
                        <button 
                          onClick={() => {
                            const newR = [...currentRecipe];
                            newR.splice(idx, 1);
                            setCurrentRecipe(newR);
                          }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )
                  })}
                  
                  <button 
                    onClick={() => setCurrentRecipe([...currentRecipe, { inventoryItemId: '', quantity: 0 }])}
                    className="w-full p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-semibold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Maxsulot qo'shish
                  </button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 flex gap-3">
                  <Beaker className="w-5 h-5 text-blue-500 shrink-0" />
                  <p><b>Maslahat:</b> Miqdorni o'lchov birligiga mos kiritishingiz kerak. Masalan, agar masalliq "Kilogramm (kg)" da bo'lsa va 1 ta porsiyaga 200 gramm ketsa, <b>0.2</b> deb kiriting.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center flex flex-col items-center justify-center h-full text-slate-400">
                <Beaker className="w-16 h-16 mb-4 text-slate-200" />
                <h3 className="text-lg font-bold text-slate-600 mb-1">Retseptni sozlash</h3>
                <p>Chap tomondan biron taomni tanlang.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
