import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/format';
import { Users, X } from 'lucide-react';
import type { Order } from '../types';

interface WaiterDetailsModalProps {
  waiterId: string;
  onClose: () => void;
  monthOrders: Order[]; // Orders for this specific waiter for the current month
}

export const WaiterDetailsModal = ({ waiterId, onClose, monthOrders }: WaiterDetailsModalProps) => {
  const { employees, menuItems } = useStore();
  const waiter = employees.find(e => e.id === waiterId);

  if (!waiter) return null;

  // Calculate items sold
  const itemsSold: Record<string, { quantity: number; totalAmount: number }> = {};
  
  monthOrders.forEach(order => {
    order.items.forEach(item => {
      if (!itemsSold[item.menuItemId]) {
        itemsSold[item.menuItemId] = { quantity: 0, totalAmount: 0 };
      }
      itemsSold[item.menuItemId].quantity += item.quantity;
      itemsSold[item.menuItemId].totalAmount += (item.quantity * item.price);
    });
  });

  const sortedItems = Object.entries(itemsSold)
    .map(([menuItemId, stats]) => ({
      menuItem: menuItems.find(m => m.id === menuItemId),
      ...stats
    }))
    .sort((a, b) => b.quantity - a.quantity);

  const totalSales = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{waiter.fullName}</h2>
              <p className="text-slate-500 text-sm">Shu oy ko'rsatkichlari (Savdo hajmi: {formatCurrency(totalSales)})</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
          <h3 className="font-bold text-slate-700 mb-4">Sotilgan taomlar ro'yxati</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Taom nomi</th>
                  <th className="px-6 py-4 text-center">Soni</th>
                  <th className="px-6 py-4 text-right">Umumiy summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {item.menuItem?.name || 'Noma\'lum taom'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold">
                        {item.quantity} ta
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-600">
                      {formatCurrency(item.totalAmount)}
                    </td>
                  </tr>
                ))}
                {sortedItems.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">
                      Hali hech narsa sotilmagan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
