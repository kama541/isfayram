import { X, Trash2, Printer } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/format';

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
  onPrint: () => void;
}

export const OrderDetailsModal = ({ order, onClose, onPrint }: OrderDetailsModalProps) => {
  const { menuItems, removeOrderItem } = useStore();

  const handleRemoveItem = async (itemId: string, itemPrice: number, quantity: number) => {
    if (window.confirm('Bu mahsulotni haqiqatan ham buyurtmadan olib tashlamoqchimisiz?')) {
      const itemTotal = itemPrice * quantity;
      await removeOrderItem(order.id, itemId, itemTotal);
      onClose(); // Close modal to refresh or keep it open if we fetch properly, but let's close for safety
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Buyurtma №{order.id.slice(-4)}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Holati: {order.status === 'new' ? 'Yangi' : order.status === 'paid' ? 'To\'langan' : order.status === 'cancelled' ? 'Bekor qilingan' : order.status}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-white dark:bg-slate-800 rounded-xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            {order.items.map((item: any, index: number) => {
              const menuItem = menuItems.find(m => m.id === item.menuItemId);
              return (
                <div key={index} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{menuItem?.name || 'Noma\'lum taom'}</h3>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {item.quantity} x {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                    {/* Faqat ochiq buyurtmalarda o'chirish mumkin */}
                    {order.status !== 'cancelled' && order.status !== 'paid' && (
                      <button 
                        onClick={() => handleRemoveItem(item.id || item.menuItemId, item.price, item.quantity)}
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
              onClick={() => {
                if (window.confirm('Haqiqatan ham butun buyurtmani bekor qilmoqchimisiz?')) {
                  useStore.getState().updateOrderStatus(order.id, 'cancelled');
                  onClose();
                }
              }}
              className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold transition-colors text-center border border-red-200 dark:border-red-900/50"
            >
              Butun buyurtmani bekor qilish (Otmen)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
