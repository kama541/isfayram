import React from 'react';
import type { Order } from '../types';
import { useStore } from '../store/useStore';

interface ReceiptPrintProps {
  order: Order | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0 }).format(amount);
};

export const ReceiptPrint = React.forwardRef<HTMLDivElement, ReceiptPrintProps>(({ order }, ref) => {
  const { menuItems } = useStore();
  
  if (!order) return null;

  const tipAmount = order.totalAmount * 0.1;
  const grandTotal = order.totalAmount + tipAmount;

  return (
    <div ref={ref} className="hidden print:block bg-white text-black p-4 w-[80mm] mx-auto text-sm font-mono">
      <div className="text-center mb-6 border-b-2 border-black pb-4 border-dashed">
        <h2 className="text-xl font-bold mb-1">ISFARYAM</h2>
        <p className="text-xs">Chipta/Chek №: {order.id.slice(0, 8)}</p>
        <p className="text-xs">Sana: {new Date(order.createdAt).toLocaleString('uz-UZ')}</p>
        <p className="text-xs">Stol: {order.tableId.replace('t', '')}</p>
      </div>

      <div className="mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black border-dashed">
              <th className="text-left py-1 w-1/2">Nomi</th>
              <th className="text-center py-1 w-1/4">Soni</th>
              <th className="text-right py-1 w-1/4">Summa</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => {
              const menuItem = menuItems.find(m => m.id === item.menuItemId);
              return (
                <tr key={idx} className="border-b border-gray-300 border-dashed">
                  <td className="py-2 text-left pr-2">{menuItem ? menuItem.name : 'Unknown'}</td>
                  <td className="py-2 text-center">{item.quantity}x</td>
                  <td className="py-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t-2 border-black border-dashed pt-4 mb-4">
        <div className="flex justify-between mb-1">
          <span>Jami summa:</span>
          <span>{formatCurrency(order.totalAmount)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Xizmat haqi (10%):</span>
          <span>{formatCurrency(tipAmount)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-black border-dashed">
          <span>TO'LOV UCHUN:</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <div className="text-center mt-8 text-xs border-t border-black pt-4">
        <p>Xaridingiz uchun rahmat!</p>
        <p>Yana kelib turing 😊</p>
      </div>
      
      {/* Spacer for thermal printer tearing */}
      <div className="h-12"></div>
    </div>
  );
});

ReceiptPrint.displayName = 'ReceiptPrint';
