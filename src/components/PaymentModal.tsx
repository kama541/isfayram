import { useState } from 'react';
import { X, Calculator, CreditCard, Banknote, Percent, User, Phone } from 'lucide-react';
import type { Order } from '../types';
import { formatCurrency } from '../utils/format';

interface PaymentModalProps {
  order: Order | null;
  onClose: () => void;
  onPay: (orderId: string, paymentMethod: 'cash' | 'card' | 'mixed', data: any) => void;
}

export const PaymentModal = ({ order, onClose, onPay }: PaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mixed'>('cash');
  const [discountType, setDiscountType] = useState<'none' | 'percent' | 'fixed'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');

  if (!order) return null;

  // Calculate totals
  const subtotal = order.totalAmount;
  let finalTotal = subtotal;
  let discountAmount = 0;

  if (discountType === 'percent') {
    discountAmount = (subtotal * discountValue) / 100;
    finalTotal = subtotal - discountAmount;
  } else if (discountType === 'fixed') {
    discountAmount = discountValue;
    finalTotal = subtotal - discountAmount;
  }

  const handlePay = () => {
    onPay(order.id, paymentMethod, {
      finalTotal,
      discountType,
      discountValue,
      discountAmount,
      cashAmount,
      cardAmount,
      customerPhone,
      customerName
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-500" />
              To'lovni qabul qilish
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Buyurtma №{order.id.slice(-4)}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Totals Section */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span className="font-medium">Umumiy summa:</span>
              <span className="font-bold">{subtotal.toLocaleString('uz-UZ')} so'm</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-500">
                <span className="font-medium">Chegirma:</span>
                <span className="font-bold">- {discountAmount.toLocaleString('uz-UZ')} so'm</span>
              </div>
            )}
            <div className="flex justify-between items-center text-2xl font-black text-slate-800 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>To'lash kerak:</span>
              <span className="text-blue-600 dark:text-blue-400">{finalTotal.toLocaleString('uz-UZ')} so'm</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">To'lov turi</h3>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setPaymentMethod('cash')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                <Banknote className="w-8 h-8 mb-2" />
                <span className="font-semibold text-sm">Naqd</span>
              </button>
              <button onClick={() => setPaymentMethod('card')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                <CreditCard className="w-8 h-8 mb-2" />
                <span className="font-semibold text-sm">Karta</span>
              </button>
              <button onClick={() => setPaymentMethod('mixed')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'mixed' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                <Calculator className="w-8 h-8 mb-2" />
                <span className="font-semibold text-sm">Aralash</span>
              </button>
            </div>
          </div>

          {paymentMethod === 'mixed' && (
            <div className="grid grid-cols-2 gap-4 bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Naqd qismi (so'm)</label>
                <input type="number" value={cashAmount || ''} onChange={(e) => { setCashAmount(Number(e.target.value)); setCardAmount(finalTotal - Number(e.target.value)); }} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Karta qismi (so'm)</label>
                <input type="number" value={cardAmount || ''} onChange={(e) => { setCardAmount(Number(e.target.value)); setCashAmount(finalTotal - Number(e.target.value)); }} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" placeholder="0" />
              </div>
            </div>
          )}

          {/* Discount Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-500" /> Chegirma qo'llash
            </h3>
            <div className="flex gap-4">
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="w-1/3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="none">Yo'q</option>
                <option value="percent">Foiz (%)</option>
                <option value="fixed">Summa</option>
              </select>
              {discountType !== 'none' && (
                <input 
                  type="number" 
                  value={discountValue || ''} 
                  onChange={(e) => setDiscountValue(Number(e.target.value))} 
                  placeholder={discountType === 'percent' ? "Masalan: 10" : "Masalan: 15000"}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              )}
            </div>
          </div>

          {/* Customer / Loyalty */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" /> Mijoz biriktirish (Loyalty)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="+998 90 123 45 67" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Mijoz ismi" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex gap-4">
          <button onClick={onClose} className="flex-1 px-6 py-3.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors">
            Bekor qilish
          </button>
          <button onClick={handlePay} className="flex-1 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]">
            To'lash {finalTotal.toLocaleString('uz-UZ')} so'm
          </button>
        </div>
      </div>
    </div>
  );
};
