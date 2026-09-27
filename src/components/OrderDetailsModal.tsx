import { useState } from 'react';
import { X, Trash2, Printer, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/format';

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
  onPrint: () => void;
}

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export const OrderDetailsModal = ({ order, onClose, onPrint }: OrderDetailsModalProps) => {
  const { menuItems, removeOrderItem } = useStore();
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const askConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirm({ open: true, title, message, onConfirm });
  };

  const handleRemoveItem = (itemId: string, itemPrice: number, quantity: number, itemName: string) => {
    askConfirm(
      'Mahsulotni olib tashlash',
      `"${itemName}" ni buyurtmadan olib tashlamoqchimisiz?`,
      async () => {
        const itemTotal = itemPrice * quantity;
        await removeOrderItem(order.id, itemId, itemTotal);
        setConfirm(c => ({ ...c, open: false }));
        onClose();
      }
    );
  };

  const handleCancelOrder = () => {
    askConfirm(
      'Buyurtmani bekor qilish',
      'Butun buyurtmani bekor qilmoqchimisiz? Bu amalni qaytarib bo\'lmaydi.',
      () => {
        useStore.getState().updateOrderStatus(order.id, 'cancelled');
        setConfirm(c => ({ ...c, open: false }));
        onClose();
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Buyurtma №{order.id.slice(-4)}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Holati: {order.status === 'new' ? 'Yangi' : order.status === 'paid' ? "To'langan" : order.status === 'cancelled' ? 'Bekor qilingan' : order.status}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 rounded-xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            {order.items.map((item: any, index: number) => {
              const menuItem = menuItems.find(m => m.id === item.menuItemId);
              return (
                <div key={index} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{menuItem?.name || "Noma'lum taom"}</h3>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {item.quantity} x {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                    {order.status !== 'cancelled' && order.status !== 'paid' && (
                      <button
                        onClick={() => handleRemoveItem(item.id || item.menuItemId, item.price, item.quantity, menuItem?.name || 'Taom')}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                        title="Olib tashlash"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-slate-800 dark:text-white">
              Jami: {formatCurrency(order.totalAmount)}
            </div>
            <button
              onClick={() => { onClose(); onPrint(); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-colors"
            >
              <Printer className="w-5 h-5" /> Chek chiqarish
            </button>
          </div>

          {order.status !== 'cancelled' && order.status !== 'paid' && (
            <button
              onClick={handleCancelOrder}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold transition-colors text-center border border-red-200 dark:border-red-900/50"
            >
              Butun buyurtmani bekor qilish (Otmen)
            </button>
          )}
        </div>
      </div>

      {/* Custom Confirm Dialog */}
      {confirm.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirm(c => ({ ...c, open: false }))} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4 border border-slate-200 dark:border-slate-700">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{confirm.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{confirm.message}</p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => setConfirm(c => ({ ...c, open: false }))}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirm.onConfirm}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-lg shadow-red-500/20"
              >
                Ha, tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
