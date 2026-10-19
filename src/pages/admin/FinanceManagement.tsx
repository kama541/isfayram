import { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, Wallet, TrendingDown, ArrowUpRight, ArrowDownRight, Banknote, CreditCard, Filter, Download } from 'lucide-react';
import { formatCurrency, formatDate, formatOrderId, formatTableName } from '../../utils/format';
import { CustomSelect } from '../../components/ui/CustomSelect';

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

export const FinanceManagement = () => {
  const { expenses, orders, tables, employees, addExpense, deleteExpense } = useStore();
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'card' | 'mixed'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday'>('today');

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Expense Form State
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'naqd'
  });

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount) return;
    
    addExpense({
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      paymentDate: expenseForm.paymentDate,
      description: expenseForm.description,
      paymentMethod: expenseForm.paymentMethod
    });
    
    setIsAddingExpense(false);
    setExpenseForm({ ...expenseForm, amount: '', description: '' });
  };

  // Real Payments derived from real DB paid orders
  const paidOrders = useMemo(() => {
    return orders
      .filter(o => o.status === 'paid')
      .slice()
      .reverse()
      .filter(o => {
        if (paymentFilter !== 'all') {
          if (paymentFilter === 'cash' && o.paymentMethod !== 'cash') return false;
          if (paymentFilter === 'card' && o.paymentMethod !== 'card') return false;
          if (paymentFilter === 'mixed' && o.paymentMethod !== 'mixed') return false;
        }

        const oDate = (o.createdAt || '').slice(0, 10);
        if (dateFilter === 'today' && oDate !== todayStr) return false;
        if (dateFilter === 'yesterday' && oDate !== yesterdayStr) return false;

        return true;
      });
  }, [orders, paymentFilter, dateFilter, todayStr, yesterdayStr]);

  const totalCash = useMemo(() => {
    return orders
      .filter(o => o.status === 'paid' && o.paymentMethod === 'cash')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders]);

  const totalCard = useMemo(() => {
    return orders
      .filter(o => o.status === 'paid' && o.paymentMethod === 'card')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const netProfit = totalRevenue - totalExpenses;

  const getTableNumber = (tableId: string | undefined | null) => {
    if (!tableId) return 'S-oboy (Olib ketish)';
    const table = tables.find(t => t.id === tableId);
    return table ? formatTableName(table.number) : `ID:${tableId.substring(0, 4)}...`;
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Banknote className="w-7 h-7 text-emerald-500" /> Moliya
          </h1>
        </div>

        {activeTab === 'expenses' && (
          <button 
            onClick={() => setIsAddingExpense(!isAddingExpense)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Yangi Xarajat
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jami Tushum</p>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Naqd Pul (Cash)</p>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{formatCurrency(totalCash)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plastik Karta (Card)</p>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{formatCurrency(totalCard)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sof Foyda</p>
            <h3 className={`text-lg font-black mt-0.5 ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'payments'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          To'lovlar Jurnali (Kassa)
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'expenses'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Xarajatlar & Chiqimlar
        </button>
      </div>

      {/* TAB 1: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            {/* Payment method filters */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setPaymentFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${paymentFilter === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Hammasi
              </button>
              <button
                onClick={() => setPaymentFilter('cash')}
                className={`px-3 py-1.5 rounded-xl transition-all ${paymentFilter === 'cash' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Naqd (Cash)
              </button>
              <button
                onClick={() => setPaymentFilter('card')}
                className={`px-3 py-1.5 rounded-xl transition-all ${paymentFilter === 'card' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Karta (Card)
              </button>
              <button
                onClick={() => setPaymentFilter('mixed')}
                className={`px-3 py-1.5 rounded-xl transition-all ${paymentFilter === 'mixed' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Aralash
              </button>
            </div>

            {/* Quick date filters */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1.5 rounded-xl transition-all ${dateFilter === 'today' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Bugun
              </button>
              <button
                onClick={() => setDateFilter('yesterday')}
                className={`px-3 py-1.5 rounded-xl transition-all ${dateFilter === 'yesterday' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Kecha
              </button>
              <button
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${dateFilter === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                Barchasi
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Buyurtma №</th>
                    <th className="px-6 py-4">Sana & Vaqt</th>
                    <th className="px-6 py-4">Xona</th>
                    <th className="px-6 py-4">Xodim / Kassir</th>
                    <th className="px-6 py-4">To'lov Turi</th>
                    <th className="px-6 py-4 text-right">Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {paidOrders.map(order => {
                    const waiter = employees.find(e => e.id === order.waiterId);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-200">
                          #{formatOrderId(order.id)}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                          {getTableNumber(order.tableId)}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs font-medium">
                          {waiter ? waiter.fullName : 'Kassir'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            order.paymentMethod === 'card' 
                              ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                              : order.paymentMethod === 'cash'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}>
                            {order.paymentMethod === 'card' ? 'Karta (Card)' : order.paymentMethod === 'cash' ? 'Naqd (Cash)' : 'Aralash'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {paidOrders.length === 0 && (
                <div className="p-16 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                  To'lov yozuvlari topilmadi
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {isAddingExpense && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" /> Yangi xarajat qo'shish
              </h2>
              <form onSubmit={handleExpenseSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Turkum</label>
                  <CustomSelect
                    value={expenseForm.category}
                    onChange={(val) => setExpenseForm({ ...expenseForm, category: val })}
                    options={EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))}
                    placeholder="Turkumni tanlang"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Summa (so'm)</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Sana</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.paymentDate}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Izoh</label>
                  <input
                    type="text"
                    placeholder="Izoh kiritish..."
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-md"
                >
                  Saqlash
                </button>
              </form>
            </div>
          )}

          {/* Expenses List */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[11px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Turkum</th>
                    <th className="px-6 py-4">Sana</th>
                    <th className="px-6 py-4">Izoh</th>
                    <th className="px-6 py-4 text-right">Summa</th>
                    <th className="px-6 py-4 text-center">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {expenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                        {expense.category}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {expense.paymentDate}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-xs">
                        {expense.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-red-600">
                        -{formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {expenses.length === 0 && (
                <div className="p-16 text-center text-slate-400 text-sm">
                  Xarajatlar yozuvlari mavjud emas
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
