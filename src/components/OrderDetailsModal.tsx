import { useState } from 'react';
import { X, Trash2, Printer, Minus, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatOrderId, formatTableName } from '../utils/format';

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
  onPrint: () => void;
}

export const OrderDetailsModal = ({ order, onClose, onPrint }: OrderDetailsModalProps) => {
  const { menuItems, tables, kitchenStations, removeOrderItem, updateOrderItemQuantity, employees, updateOrderWaiter } = useStore();

  const table = tables.find(t => t.id === order.tableId);
  const tableLabel = table 
    ? formatTableName(table.number) 
    : (order.tableId === 'takeaway' ? 'S-oboy (Olib ketish)' : (order.tableId ? order.tableId.slice(0, 8) : '-'));

  const waiter = employees.find(e => e.id === order.waiterId);
  const waiterName = waiter ? waiter.fullName : (order.waiterId || "Noma'lum");

  const handleRemoveItem = async (itemId: string, itemPrice: number, quantity: number, _itemName: string) => {
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

  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelOrder = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    try {
      const userStr = localStorage.getItem('currentUser') || localStorage.getItem('adminUser');
      const user = userStr ? JSON.parse(userStr) : null;
      const cancelledBy = user?.fullName || user?.name || 'Admin';
      await useStore.getState().cancelOrder(order.id, cancelReason || "Mijoz fikridan qaytdi", cancelledBy);
      setShowCancelPrompt(false);
      onClose();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#1C1A17] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[rgba(212,175,55,0.2)]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[#24211D] flex justify-between items-start">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                Buyurtma №{formatOrderId(order.id)}
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                order.status === 'paid' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : order.status === 'cancelled'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {order.status === 'paid' ? "To'langan" : order.status === 'cancelled' ? 'Bekor qilingan' : order.status === 'ready' ? 'Tayyor' : 'Jarayonda'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#A39B8B] pt-1">
              <span><strong className="text-white">Xona:</strong> {tableLabel}</span>
              <span><strong className="text-white">Vaqt:</strong> {new Date(order.createdAt).toLocaleDateString('ru-RU')} {new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
              {order.status === 'paid' && order.paymentMethod && (
                <span><strong className="text-white">To'lov turi:</strong> {order.paymentMethod === 'card' ? 'Plastik karta' : order.paymentMethod === 'cash' ? 'Naqd pul' : order.paymentMethod}</span>
              )}
            </div>

            {order.status !== 'paid' && order.status !== 'cancelled' ? (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-white/80 font-bold">Ofitsiant:</span>
                <select
                  value={order.waiterId || ''}
                  onChange={(e) => updateOrderWaiter(order.id, e.target.value)}
                  className="bg-[#13120F] border border-white/10 text-white rounded-xl px-3 py-1.5 outline-none font-bold text-sm"
                >
                  {employees.filter(e => e.role === 'waiter').map(w => (
                    <option key={w.id} value={w.id}>{w.fullName}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-sm text-[#A39B8B] mt-1 font-semibold">
                <strong className="text-white">Ofitsiant:</strong> {waiterName}
              </div>
            )}

            {order.status === 'cancelled' && (
              <div className="mt-2.5 p-3.5 bg-red-950/40 border border-red-900/40 rounded-2xl text-xs space-y-1 text-red-300 font-bold">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span><strong>Bekor qilingan:</strong> {order.cancelledAt ? new Date(order.cancelledAt).toLocaleString('uz-UZ') : (order.updatedAt ? new Date(order.updatedAt).toLocaleString('uz-UZ') : '-')}</span>
                  {order.cancelledBy && <span>• <strong>Xodim:</strong> {order.cancelledBy}</span>}
                </div>
                {order.cancellationReason && (
                  <div>
                    <strong>Sabab:</strong> {order.cancellationReason}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-3 text-white/60 hover:text-white transition-colors bg-white/5 rounded-2xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 scrollbar-hide">
          {order.items.map((item: any, index: number) => {
            const menuItem = menuItems.find(m => m.id === item.menuItemId);
            const itemName = menuItem?.name || item.name || item.note || "Noma'lum taom";
            const station = kitchenStations.find(k => k.id === (item.kitchenStationId || menuItem?.kitchenStationId));
            const stationName = station?.name || (item.kitchenRoom || 'Asosiy');

            return (
              <div 
                key={index} 
                className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base text-white">
                      {itemName}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {stationName}
                    </span>
                    {item.status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        item.status === 'ready' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {item.status === 'ready' ? 'Tayyor' : item.status}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#A39B8B] font-semibold mt-1">
                    {item.quantity} x {formatCurrency(item.price)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="font-black text-base text-[#D4AF37]">
                    {formatCurrency(item.price * item.quantity)}
                  </div>

                  {order.status !== 'cancelled' && order.status !== 'paid' && (
                    <div className="flex items-center gap-1 bg-[#13120F] rounded-xl p-1 border border-white/10">
                      <button
                        onClick={() => handleUpdateQuantity(item.id || item.menuItemId, item.price, item.quantity, itemName, -1)}
                        className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-red-400 rounded-lg transition-colors active:scale-90"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-7 text-center font-black text-sm text-white">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id || item.menuItemId, item.price, item.quantity, itemName, 1)}
                        className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-green-400 rounded-lg transition-colors active:scale-90"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {order.status !== 'cancelled' && order.status !== 'paid' && (
                    <button
                      onClick={() => handleRemoveItem(item.id || item.menuItemId, item.price, item.quantity, itemName)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors active:scale-90"
                      title="Olib tashlash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {(() => {
          const itemsSum = (order.items || []).filter((i: any) => i.quantity > 0).reduce((sum: number, item: any) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
          const subtotal = itemsSum > 0 ? itemsSum : order.totalAmount;
          const serviceAmount = Math.round(subtotal * 0.10);
          const grandTotal = subtotal + serviceAmount;

          return (
            <div className="p-6 border-t border-white/10 bg-[#24211D] flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-black text-white">
                    Jami: <span className="text-[#D4AF37]">{formatCurrency(grandTotal)}</span>
                  </div>
                  <div className="text-xs text-[#A39B8B] font-semibold mt-0.5">
                    Taomlar: {formatCurrency(subtotal)} + Servis (10%): {formatCurrency(serviceAmount)}
                  </div>
                </div>
                <button
                  onClick={() => { onClose(); onPrint(); }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black transition-all shadow-lg active:scale-95 text-sm uppercase tracking-wider"
                >
                  <Printer className="w-4 h-4" /> Chek chiqarish
                </button>
              </div>

              {order.status !== 'cancelled' && order.status !== 'paid' && (
                <button
                  onClick={() => setShowCancelPrompt(true)}
                  className="w-full bg-red-500/15 hover:bg-red-500/25 text-red-400 py-3 rounded-2xl font-bold transition-colors text-center text-xs uppercase tracking-wider border border-red-500/30"
                >
                  Butun buyurtmani bekor qilish (Otmen)
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* Cancellation Prompt Modal */}
      {showCancelPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-[#1C1A17] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-red-500/30 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-500/20 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">Buyurtmani bekor qilish</h3>
                <p className="text-xs text-[#A39B8B]">№{formatOrderId(order.id)} raqamli buyurtma</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white mb-2">
                Bekor qilish sababini tanlang yoki yozing:
              </label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {["Mijoz fikridan qaytdi", "Noto'g'ri stol tanlandi", "Mijoz ketib qoldi", "Kutilmagan xatolik"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCancelReason(preset)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all ${
                      cancelReason === preset
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Bekor qilish sababini kiriting..."
                rows={2}
                className="w-full p-3 text-sm bg-[#13120F] border border-white/10 rounded-2xl outline-none focus:border-red-500 text-white font-medium"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelPrompt(false)}
                disabled={isCancelling}
                className="flex-1 py-3 px-4 rounded-2xl border border-white/10 text-white/80 font-bold text-sm hover:bg-white/5 transition-colors"
              >
                Orqaga
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isCancelling ? "Bekor qilinmoqda..." : "Tasdiqlash (Otmen)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
