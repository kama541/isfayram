import { useState } from 'react';
import { X, Calculator, CreditCard, Banknote, Percent, User, Phone, CheckCircle2 } from 'lucide-react';
import type { Order } from '../types';
import { formatOrderId } from '../utils/format';

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
  const [isPaying, setIsPaying] = useState(false);

  if (!order) return null;

  // Calculate totals (strictly 10% service charge)
  const itemsSum = (order.items || []).filter((i: any) => i.quantity > 0).reduce((sum: number, item: any) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
  const subtotal = itemsSum > 0 ? itemsSum : order.totalAmount;
  const servicePercent = 10;
  const serviceAmount = Math.round(subtotal * 0.10);
  const totalWithService = subtotal + serviceAmount;
  let finalTotal = totalWithService;
  let discountAmount = 0;

  if (discountType === 'percent') {
    discountAmount = Math.round((totalWithService * discountValue) / 100);
    finalTotal = Math.max(0, totalWithService - discountAmount);
  } else if (discountType === 'fixed') {
    discountAmount = discountValue;
    finalTotal = Math.max(0, totalWithService - discountAmount);
  }

  const handlePay = async () => {
    if (isPaying) return;
    if (order.status === 'cancelled') {
      alert("Bu buyurtma bekor qilingan! Bekor qilingan buyurtmaga to'lov qabul qilib bo'lmaydi.");
      return;
    }
    setIsPaying(true);
    try {
      await onPay(order.id, paymentMethod, {
        subtotal,
        servicePercent,
        serviceAmount,
        finalTotal,
        discountType,
        discountValue,
        discountAmount,
        cashAmount: paymentMethod === 'mixed' ? cashAmount : (paymentMethod === 'cash' ? finalTotal : 0),
        cardAmount: paymentMethod === 'mixed' ? cardAmount : (paymentMethod === 'card' ? finalTotal : 0),
        customerPhone,
        customerName
      });
      onClose();
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#1C1A17] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-[rgba(212,175,55,0.2)]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#24211D]">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Calculator className="w-7 h-7 text-[#D4AF37]" />
              To'lovni Qabul Qilish
            </h2>
            <p className="text-sm font-semibold mt-1" style={{ color: '#A39B8B' }}>
              Buyurtma №{formatOrderId(order.id)}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          
          {/* Big Totals Section */}
          <div className="bg-[#13120F] p-6 rounded-3xl border border-[rgba(212,175,55,0.2)] flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm font-bold" style={{ color: '#A39B8B' }}>
              <span>Taomlar summasi:</span>
              <span className="text-white text-base font-extrabold">{subtotal.toLocaleString('uz-UZ')} so'm</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-amber-300">
              <span>Servis xizmati (10%):</span>
              <span className="text-base font-extrabold">+{serviceAmount.toLocaleString('uz-UZ')} so'm</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-400 font-bold text-sm">
                <span>Chegirma:</span>
                <span>- {discountAmount.toLocaleString('uz-UZ')} so'm</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-3 border-t border-white/10">
              <span className="text-base sm:text-lg font-extrabold text-white">To'lash kerak (Jami):</span>
              <span className="text-3xl sm:text-4xl font-black text-[#D4AF37] tracking-tight">
                {finalTotal.toLocaleString('uz-UZ')} so'm
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: '#8A8070' }}>
              To'lov Turini Tanlang:
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button 
                type="button"
                onClick={() => setPaymentMethod('cash')} 
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all active:scale-95 ${
                  paymentMethod === 'cash' 
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-lg shadow-emerald-500/20' 
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <Banknote className="w-9 h-9 mb-2" />
                <span className="font-black text-base">Naqd pul</span>
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMethod('card')} 
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all active:scale-95 ${
                  paymentMethod === 'card' 
                    ? 'border-blue-500 bg-blue-500/15 text-blue-400 shadow-lg shadow-blue-500/20' 
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <CreditCard className="w-9 h-9 mb-2" />
                <span className="font-black text-base">Plastik karta</span>
              </button>
              <button 
                type="button"
                onClick={() => setPaymentMethod('mixed')} 
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all active:scale-95 ${
                  paymentMethod === 'mixed' 
                    ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-lg shadow-amber-500/20' 
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <Calculator className="w-9 h-9 mb-2" />
                <span className="font-black text-base">Aralash</span>
              </button>
            </div>
          </div>

          {/* Mixed Payment Inputs */}
          {paymentMethod === 'mixed' && (
            <div className="grid grid-cols-2 gap-4 bg-amber-500/10 p-5 rounded-2xl border border-amber-500/25">
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-2">Naqd qismi (so'm)</label>
                <input 
                  type="number" 
                  value={cashAmount || ''} 
                  onChange={(e) => { 
                    const v = Number(e.target.value);
                    setCashAmount(v); 
                    setCardAmount(Math.max(0, finalTotal - v)); 
                  }} 
                  className="w-full bg-[#13120F] border border-amber-500/30 rounded-xl px-4 py-3 text-base font-black text-white outline-none focus:border-amber-400" 
                  placeholder="0" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase mb-2">Karta qismi (so'm)</label>
                <input 
                  type="number" 
                  value={cardAmount || ''} 
                  onChange={(e) => { 
                    const v = Number(e.target.value);
                    setCardAmount(v); 
                    setCashAmount(Math.max(0, finalTotal - v)); 
                  }} 
                  className="w-full bg-[#13120F] border border-amber-500/30 rounded-xl px-4 py-3 text-base font-black text-white outline-none focus:border-amber-400" 
                  placeholder="0" 
                />
              </div>
            </div>
          )}

          {/* Discount Section */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#8A8070' }}>
              <Percent className="w-4 h-4 text-emerald-400" /> Chegirma qo'llash
            </h3>
            <div className="flex gap-3">
              <select 
                value={discountType} 
                onChange={(e) => setDiscountType(e.target.value as any)} 
                className="w-1/3 bg-[#13120F] border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none"
              >
                <option value="none">Yo'q</option>
                <option value="percent">Foiz (%)</option>
                <option value="fixed">Summa (so'm)</option>
              </select>
              {discountType !== 'none' && (
                <input 
                  type="number" 
                  value={discountValue || ''} 
                  onChange={(e) => setDiscountValue(Number(e.target.value))} 
                  placeholder={discountType === 'percent' ? "Masalan: 10%" : "Masalan: 20000"}
                  className="flex-1 bg-[#13120F] border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-emerald-400"
                />
              )}
            </div>
          </div>

          {/* Customer / Loyalty */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#8A8070' }}>
              <User className="w-4 h-4 text-indigo-400" /> Mijoz (Ixtiyoriy)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  placeholder="+998 90 123 45 67" 
                  value={customerPhone} 
                  onChange={(e) => setCustomerPhone(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-[#13120F] border border-white/10 rounded-2xl text-sm font-bold text-white outline-none" 
                />
              </div>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Mijoz ismi" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 bg-[#13120F] border border-white/10 rounded-2xl text-sm font-bold text-white outline-none" 
                />
              </div>
            </div>
          </div>

        </div>

        {order.status === 'cancelled' && (
          <div className="mx-6 p-4 bg-red-950/60 border border-red-800 rounded-2xl flex items-center gap-3 text-red-300">
            <span className="text-2xl">⚠️</span>
            <div className="text-sm font-black">
              Bu buyurtma BEKOR QILINGAN (CANCELLED). Bekor qilingan buyurtmaga to'lov qabul qilib bo'lmaydi!
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-[#24211D] flex gap-4">
          <button 
            type="button"
            onClick={onClose} 
            className="flex-1 h-14 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-base transition-colors active:scale-98"
          >
            Yopish
          </button>
          <button 
            type="button"
            onClick={handlePay} 
            disabled={isPaying || order.status === 'cancelled'}
            className={`flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base sm:text-lg uppercase tracking-wider transition-all shadow-xl shadow-emerald-600/30 active:scale-98 flex items-center justify-center gap-2 ${
              isPaying || order.status === 'cancelled' ? 'opacity-40 cursor-not-allowed bg-slate-600 hover:bg-slate-600' : ''
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            {order.status === 'cancelled' ? "Bekor qilingan" : isPaying ? "To'lanmoqda..." : `To'lash: ${finalTotal.toLocaleString('uz-UZ')} so'm`}
          </button>
        </div>
      </div>
    </div>
  );
};
