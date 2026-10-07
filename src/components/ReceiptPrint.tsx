import React from 'react';
import type { Order } from '../types';
import { useStore } from '../store/useStore';
import { formatOrderId, formatTableName } from '../utils/format';
import logoImg from '../assets/logo.png';

interface ReceiptPrintProps {
  order: Order | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU').format(amount).replace(',', ' ') + " so'm";
};

export const ReceiptPrint = React.forwardRef<HTMLDivElement, ReceiptPrintProps>(({ order }, ref) => {
  const { menuItems, tables, employees, categories, receiptSettings } = useStore();

  if (!order) return null;

  const table = tables.find(t => t.id === order.tableId);
  const tableLabel = table ? formatTableName(table.number) : (order.tableId === 'takeaway' ? 'S-oboy' : order.tableId?.slice(0, 8) || '-');
  const waiter = employees.find(e => e.id === order.waiterId);

  const tipAmount = order.totalAmount * 0.1;
  const grandTotal = order.totalAmount + tipAmount;

  const hr: React.CSSProperties = { borderTop: '2px dashed #000', margin: '1.5mm 0' };
  const solid: React.CSSProperties = { borderTop: '2px solid #000', margin: '1.5mm 0' };
  const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };

  const itemsByCategory = order.items.reduce((acc, item) => {
    const menuItem = menuItems.find(m => m.id === item.menuItemId);
    const catId = menuItem?.categoryId || 'other';
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push({ item, menuItem });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div
      ref={ref}
      data-receipt-id={order.id}
      className="hidden print:block print-container"
      style={{ width: '80mm', padding: '0 4mm', boxSizing: 'border-box', fontFamily: '"Courier New", Courier, monospace', fontSize: '12px', lineHeight: '1.4', color: '#000' }}
    >
      <div style={{ textAlign: 'center' }}>
        {order.status === 'paid' && (
          <div style={{ fontWeight: 900, fontSize: '16px', marginBottom: '2mm', letterSpacing: '1px' }}>*** TO'LANDI ***</div>
        )}
        {order.printCount && order.printCount > 1 && order.status !== 'paid' && (
          <div style={{ fontWeight: 900, fontSize: '14px', marginBottom: '1mm' }}>*** POVTOR ***</div>
        )}
        <img src={logoImg} alt="logo" style={{ width: '35mm', display: 'block', margin: '0 auto 2mm', filter: 'grayscale(100%) contrast(200%) brightness(1.1)' }} />
        <div style={{ fontSize: '16px', fontWeight: 900 }}>{receiptSettings?.title || 'Isfayram Kafe'}</div>
        <div style={{ fontSize: '12px', marginBottom: '2mm' }}>{receiptSettings?.address || 'Quvasoy, UZ'}</div>
      </div>

      <div style={{ height: '3mm' }} />

      <div style={{ fontSize: '12px', lineHeight: '1.5', fontWeight: 'bold' }}>
        <div style={row}><span>Stol:</span><span>{tableLabel}</span></div>
        <div style={row}><span>Ofitsiant:</span><span>{waiter ? waiter.fullName : "Noma'lum"}</span></div>
        <div style={row}><span>Order №:</span><span>{formatOrderId(order.id)}</span></div>
        <div style={row}><span>Sana:</span><span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span></div>
        <div style={row}><span>Vaqt:</span><span>{new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span></div>
      </div>

      <div style={hr} />

      <div style={{ ...row, fontSize: '11px', fontWeight: 'bold', marginBottom: '2mm', textTransform: 'uppercase' }}>
        <span style={{ flex: 1, paddingRight: '4px' }}>Taom nomi</span>
        <span style={{ width: '10mm', textAlign: 'center' }}>Soni</span>
        <span style={{ width: '32mm', textAlign: 'right' }}>Summa</span>
      </div>
      <div style={hr} />

      <div style={{ fontSize: '14px' }}>
        {Object.entries(itemsByCategory).map(([catId, categoryItems]) => {
          const cat = categories.find(c => c.id === catId);
          const catName = cat ? cat.name.toUpperCase() : 'BOSHQA';
          return (
            <React.Fragment key={catId}>
              <div style={{ textAlign: 'center', margin: '2mm 0 1mm', fontWeight: 900, fontSize: '13px' }}>
                {catName}
              </div>
              <div style={hr} />
              {categoryItems.map(({ item, menuItem }, idx) => (
                <div key={idx} style={{ ...row, marginBottom: '1.5mm', fontWeight: 800, fontSize: '12px', alignItems: 'center' }}>
                  <div style={{ textTransform: 'uppercase', flex: 1, paddingRight: '4px', wordBreak: 'break-word', lineHeight: '1.2' }}>
                    {menuItem ? menuItem.name : 'Unknown'}
                  </div>
                  <div style={{ width: '10mm', textAlign: 'center', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {item.quantity}
                  </div>
                  <div style={{ width: '32mm', textAlign: 'right', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>

      <div style={hr} />

      <div style={{ fontSize: '12px', lineHeight: '1.5', fontWeight: 'bold' }}>
        <div style={row}><span>Taomlar:</span><span>{formatCurrency(order.totalAmount)}</span></div>
        {tipAmount > 0 && <div style={row}><span>Xizmat (10%):</span><span>+{formatCurrency(tipAmount)}</span></div>}
      </div>

      <div style={solid} />

      <div style={{ ...row, fontWeight: 900, fontSize: '16px', margin: '2mm 0' }}>
        <span>JAMI:</span>
        <span>{formatCurrency(grandTotal)}</span>
      </div>
      
      {order.status === 'paid' && (
        <div style={{ ...row, fontSize: '12px', marginTop: '2mm', fontWeight: 'bold' }}>
          <span>To'lov turi:</span>
          <span>{order.paymentMethod === 'cash' ? 'Naqd pul' : (order.paymentMethod === 'card' ? 'Plastik karta' : 'Boshqa')}</span>
        </div>
      )}

      <div style={solid} />

      <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '3mm', fontWeight: 'bold' }}>
        <div>{receiptSettings?.footer1 || 'Доставка 95 034 31 15'}</div>
        <div style={{ marginTop: '2mm' }}>{receiptSettings?.footer2 || 'Спасибо за визит!'}</div>
      </div>

      <div style={{ height: '15mm' }} />
    </div>
  );
});

ReceiptPrint.displayName = 'ReceiptPrint';
