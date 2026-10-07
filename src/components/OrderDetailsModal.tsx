import { useState } from 'react';
import { X, Trash2, Printer, AlertTriangle, Minus, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatOrderId } from '../utils/format';

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
  const { menuItems, removeOrderItem, updateOrderItemQuantity, employees, updateOrderWaiter } = useStore();
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const askConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirm({ open: true, title, message, onConfirm });
  };

  const handleRemoveItem = async (itemId: string, itemPrice: number, quantity: number, itemName: string) => {
    const itemTotal = itemPrice * quantity;
    await removeOrderItem(order.id, itemId, itemTotal);
  };

  const handleUpdateQuantity = (itemId: string, itemPrice: number, currentQuantity: number, itemName: string, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) {
      handleRemoveItem(itemId, itemPrice, currentQuantity, itemName);
      return;
    }
    const newTotalPrice = newQuantity * itemPrice;
    updateOrderItemQuantity(order.id, itemId, newQuantity, newTotalPrice);
  };

  const handleCancelOrder = () => {
    useStore.getState().updateOrderStatus(order.id, 'cancelled');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Buyurtma №{formatOrderId(order.id)}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Holati: {order.status === 'new' ? 'Yangi' : order.status === 'paid' ? "To'langan" : order.status === 'cancelled' ? 'Bekor qilingan' : order.status}
            </p>
            {order.status !== 'paid' && order.status !== 'cancelled' ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium">Ofitsiant:</span>
                <select
                  value={order.waiterId}
                  onChange={(e) => updateOrderWaiter(order.id, e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                >
                  {employees.filter(e => e.role === 'waiter').map(w => (
                    <option key={w.id} value={w.id}>{w.fullName}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Ofitsiant: {employees.find(e => e.id === order.waiterId)?.fullName || "Noma'lum"}
              </p>
            )}
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
                    <h3 className={`font-bold ${item.quantity === 0 ? 'line-through text-red-500/70 dark:text-red-400/70' : 'text-slate-800 dark:text-slate-200'}`}>
                      {menuItem?.name || "Noma'lum taom"}
                      {item.quantity === 0 && <span className="ml-2 text-xs text-red-500 no-underline">{item.notes || '(Otmen)'}</span>}
                    </h3>
                    <div className={`text-sm font-medium mt-1 ${item.quantity === 0 ? 'line-through text-red-400/50' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.quantity === 0 ? '0' : item.quantity} x {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`font-bold ${item.quantity === 0 ? 'line-through text-red-500/70 dark:text-red-400/70' : 'text-slate-700 dark:text-slate-300'}`}>
                      {formatCurrency(item.quantity === 0 ? 0 : item.price * item.quantity)}
                    </div>
                    {order.status !== 'cancelled' && (
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id || item.menuItemId, item.price, item.quantity, menuItem?.name || 'Taom', -1)}
                          className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id || item.menuItemId, item.price, item.quantity, menuItem?.name || 'Taom', 1)}
                          className="p-1.5 text-slate-600 hover:text-green-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {order.status !== 'cancelled' && (
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


    </div>
  );
};
