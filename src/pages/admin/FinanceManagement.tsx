import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, Wallet, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { CustomSelect } from '../../components/ui/CustomSelect';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';

const EXPENSE_CATEGORIES = [
  'Elektr energiyasi',
  'Gaz',
  'Suv',
  'Internet',
  'Ijara',
  'Ishchilar maoshi',
  'Ta\'mirlash xarajatlari',
  'Boshqa'
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

export const FinanceManagement = () => {
  const { expenses, orders, addExpense, deleteExpense } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'naqd'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;
    
    addExpense({
      category: formData.category,
      amount: Number(formData.amount),
      paymentDate: formData.paymentDate,
      description: formData.description,
      paymentMethod: formData.paymentMethod
    });
    
    setIsAdding(false);
    setFormData({ ...formData, amount: '', description: '' });
  };

  // Financial Calculations
  const totalRevenue = orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Chart Data Preparation
  const expensesByCategory = EXPENSE_CATEGORIES.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(item => item.value > 0);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Moliya va Xarajatlar</h1>
          <p className="text-slate-500 mt-1">Kirim-chiqimlar va kommunal to'lovlarni nazorat qilish</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-5 h-5" /> Yangi xarajat qo'shish
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <ArrowUpRight className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Jami Daromad</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatMoney(totalRevenue)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <ArrowDownRight className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Jami Xarajatlar</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatMoney(totalExpenses)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Sof Foyda</p>
            <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatMoney(netProfit)}
            </h3>
          </div>
        </div>
      </div>

      {/* Add Expense Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 animation-fade-in">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" /> Yangi xarajat yozish
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Turkum</label>
              <CustomSelect
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                options={EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))}
                placeholder="Turkumni tanlang"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Summa (so'm)</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sana</label>
              <input
                type="date"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To'lov usuli</label>
              <CustomSelect
                value={formData.paymentMethod}
                onChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                options={[
                  { value: 'naqd', label: 'Naqd pul' },
                  { value: 'karta', label: 'Plastik karta' },
                  { value: 'otkazma', label: "Pul o'tkazma" }
                ]}
                placeholder="To'lov usulini tanlang"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Qisqacha izoh..."
              />
              <button 
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 px-6 rounded-xl font-medium transition-colors"
              >
                Saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expenses List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">So'nggi xarajatlar ro'yxati</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {expenses.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Xarajatlar topilmadi.</div>
            ) : (
              expenses.map(expense => (
                <div key={expense.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{expense.category}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        {format(new Date(expense.paymentDate), 'dd.MM.yyyy')} • {expense.paymentMethod}
                        {expense.description && ` • ${expense.description}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-red-500">-{formatMoney(expense.amount)}</span>
                    <button 
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Xarajatlar Taqsimoti</h2>
          {expensesByCategory.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensesByCategory.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => formatMoney(Number(value))}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {expensesByCategory.map((cat, index) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="truncate">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              Ma'lumot yo'q
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
