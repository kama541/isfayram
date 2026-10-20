import React from 'react';
import { useStore } from '../store/useStore';
import { formatOrderId, formatTableName } from '../utils/format';
import logoImg from '../assets/logo.png';
import type { PrintJob } from './RemotePrintListener';

// Format price as "20 000 сум"
const formatSom = (amount: number): string => {
  const rounded = Math.round(amount);
  const s = rounded.toString();
  let result = '';
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) result += ' ';
    result += s[i];
  }
  return result + ' сум';
};

export const formatKitchenStationName = (rawName?: string): string => {
  if (!rawName) return 'OSHXONA';
  let clean = rawName.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  clean = clean.replace(/\b[Rr]oom\b/gi, '').replace(/\b[Xx]ona(si)?\b/gi, '').trim();
  const lower = clean.toLowerCase();
  if (lower.includes('shashlik') || lower.includes('mangal') || lower.includes('kabob')) return 'SHASHLIK';
  if (lower.includes('fish') || lower.includes('baliq')) return 'BALIQ';
  if (lower.includes('tandir') || lower.includes('somsa')) return 'TANDIR';
  if (lower.includes('bar') || lower.includes('ichimlik')) return 'BAR';
  if (lower.includes('oshxona') || lower.includes('kuhnya') || lower.includes('кухня')) return 'OSHXONA';
  return clean.toUpperCase() || 'OSHXONA';
};

interface ReceiptPrintProps {
  job: PrintJob | null;
}

export const ReceiptPrint = React.forwardRef<HTMLDivElement, ReceiptPrintProps>(({ job }, ref) => {
  const { menuItems, tables, employees, receiptSettings, categories } = useStore();

  if (!job) return null;

  const { order, type, stationName, items: jobItems } = job;

  const is58mm = receiptSettings?.paperWidth === '58mm';
  // 70mm width left-aligned gives perfectly equal ~5mm margins on both left and right edges of 80mm paper
  const printWidth = is58mm ? '48mm' : '70mm';
  const fontSize = is58mm ? '9px' : '10.5px';

  const table = tables.find(t => t.id === order.tableId);
  const tableLabel = table
    ? (typeof table.number === 'number' || /^\d+$/.test(String(table.number)) ? String(table.number) : formatTableName(table.number))
    : (order.tableId === 'takeaway'
        ? 'S-oboy'
        : (order.tableId === 'test-table'
            ? '5'
            : (order.tableId ? order.tableId.slice(0, 8) : '5')));

  const waiter = employees.find(e => e.id === order.waiterId);
  const waiterName = waiter
    ? waiter.fullName.toUpperCase()
    : (order.waiterId === 'test-waiter' ? 'NARGIZA' : (order.waiterId ? String(order.waiterId).toUpperCase() : 'NARGIZA'));

  const isTest = order.id?.startsWith('TEST') || (order as any).isTest;
  const isPaid = order.status === 'paid';

  // Format closed date as YYYY-MM-DD, в HH:mm:ss (exact matching photo)
  const closedAt = (order as any).closedAt || (order as any).paidAt || (order as any).updatedAt || order.createdAt;
  const closedDate = closedAt ? new Date(closedAt) : new Date();
  const y = closedDate.getFullYear();
  const m = String(closedDate.getMonth() + 1).padStart(2, '0');
  const d = String(closedDate.getDate()).padStart(2, '0');
  const hh = String(closedDate.getHours()).padStart(2, '0');
  const mm = String(closedDate.getMinutes()).padStart(2, '0');
  const ss = String(closedDate.getSeconds()).padStart(2, '0');
  const closedDateTimeStr = `${y}-${m}-${d}, в ${hh}:${mm}:${ss}`;

  // Guest count
  const guestCount: number = (order as any).guestCount || (order as any).guests || 2;

  // Service charge (strictly default 10%)
  const rawServicePercent: number = (receiptSettings as any)?.serviceChargePercent ?? 10;
  const servicePercent = rawServicePercent > 0 ? rawServicePercent : 10;
  // Subtotal of food items
  const itemsSum = (order.items || []).filter((i: any) => i.quantity > 0).reduce((sum: number, item: any) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
  const subtotal = itemsSum > 0 ? itemsSum : order.totalAmount;
  const serviceAmount = Math.round(subtotal * servicePercent / 100);
  const grandTotal = subtotal + serviceAmount;

  // Double dashed line: =====================================
  const doubleDashedLine: React.CSSProperties = {
    borderTop: '1px dashed #000',
    borderBottom: '1px dashed #000',
    height: '3px',
    margin: is58mm ? '1.5mm 0' : '2mm 0',
  };

  // Single dashed line: -------------------------------------
  const singleDashedLine: React.CSSProperties = {
    borderTop: '1px dashed #000',
    borderBottom: 'none',
    margin: is58mm ? '1.5mm 0' : '2mm 0',
  };

  const commonPrintStyles = `
    @media print {
      @page {
        size: ${is58mm ? '58mm auto' : '80mm auto'};
        margin: 0 !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: ${is58mm ? '58mm' : '80mm'} !important;
        background: #fff !important;
        color: #000 !important;
        display: block !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        font-family: 'Consolas', 'Segoe UI Mono', 'Courier New', Courier, monospace !important;
      }
      .print-thermal-receipt {
        box-sizing: border-box !important;
        display: block !important;
        visibility: visible !important;
        overflow: visible !important;
        font-family: 'Consolas', 'Segoe UI Mono', 'Courier New', Courier, monospace !important;
        color: #000 !important;
        font-weight: 700 !important;
      }
      .print-cashier-container {
        position: absolute !important;
        left: 0 !important;
        right: auto !important;
        top: 0 !important;
        width: ${printWidth} !important;
        max-width: ${printWidth} !important;
        margin: 0 !important;
        margin-left: 0 !important;
        padding: 0 1.5mm 0 1.5mm !important;
        box-sizing: border-box !important;
        display: block !important;
        visibility: visible !important;
        overflow: visible !important;
      }
      .print-kitchen-container {
        position: absolute !important;
        left: 0 !important;
        right: auto !important;
        top: 0 !important;
        width: ${is58mm ? '46mm' : '64mm'} !important;
        max-width: ${is58mm ? '46mm' : '64mm'} !important;
        margin: 0 !important;
        margin-left: 0 !important;
        padding: 0 4mm 0 1.5mm !important;
        box-sizing: border-box !important;
        display: block !important;
        visibility: visible !important;
        overflow: visible !important;
      }
    }
  `;

  // ================================================================
  // KITCHEN TICKET
  // ================================================================
  if (type === 'kitchen') {
    const kitchenWidth = is58mm ? '46mm' : '64mm';
    return (
      <>
        <style>{commonPrintStyles}</style>
        <div
          ref={ref}
          data-receipt-id={order.id}
          className="hidden print:block print-thermal-receipt print-kitchen-container print-container"
          style={{
            width: kitchenWidth,
            maxWidth: kitchenWidth,
            margin: '0',
            marginLeft: '0',
            padding: '0 4mm 0 1.5mm',
            boxSizing: 'border-box',
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: is58mm ? '11px' : '13px',
            lineHeight: '1.3',
            color: '#000',
            backgroundColor: '#fff',
            overflow: 'visible',
            fontWeight: 700,
          }}
        >
          <div style={{ textAlign: 'center', margin: '1.5mm 0 1mm' }}>
            <div style={{
              fontWeight: 900,
              fontSize: is58mm ? '18px' : '22px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#000',
            }}>
              {formatKitchenStationName(stationName)}
            </div>
          </div>

          {job.isAddition && (
            <div style={{ textAlign: 'center', fontWeight: 900, fontSize: is58mm ? '11px' : '13px', margin: '1mm 0', padding: '1mm', border: '1px dashed #000' }}>
              *** QO'SHIMCHA BUYURTMA ***
            </div>
          )}

          <div style={singleDashedLine} />

          <div style={{ fontWeight: 'bold', fontSize: is58mm ? '10px' : '12px', lineHeight: '1.45', paddingRight: '2mm' }}>
            <div style={{ fontSize: is58mm ? '15px' : '18px', fontWeight: 900, margin: '1mm 0' }}>
              STOL: {tableLabel}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span>Buyurtma:</span>
              <span style={{ fontWeight: 900 }}>№{formatOrderId(order.id)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span>Ofitsiant:</span>
              <span>{waiterName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span>Vaqt:</span>
              <span>{closedDateTimeStr}</span>
            </div>
          </div>

          <div style={singleDashedLine} />

          <div style={{ margin: '1mm 0', paddingRight: '2mm' }}>
            {(jobItems || order.items).map((item: any, idx: number) => {
              const menuItem = menuItems.find(m => m.id === (item.menuItemId || item.id));
              const rawName = (item.name && item.name.trim() !== '' && item.name.toLowerCase() !== 'taom')
                ? item.name
                : (menuItem?.name || item.note || 'Taom');
              const itemName = rawName.toUpperCase();
              return (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '2mm',
                  fontSize: is58mm ? '12px' : '14px',
                  fontWeight: 900,
                  gap: '2mm'
                }}>
                  <div style={{ flex: 1, paddingRight: '2mm', wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: '1.2' }}>
                    {itemName}
                    {item.notes && <div style={{ fontSize: '10px', fontWeight: 'normal' }}>({item.notes})</div>}
                  </div>
                  <div style={{ whiteSpace: 'nowrap', fontSize: is58mm ? '14px' : '17px', fontWeight: 900, minWidth: '35px', textAlign: 'right' }}>
                    x {item.quantity}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={singleDashedLine} />

          <div style={{ textAlign: 'center', fontSize: is58mm ? '10px' : '11px', fontWeight: 'bold', margin: '1.5mm 0' }}>
            ISFAYRAM KAFE
          </div>

          <div style={{ height: '8mm' }} />
        </div>
      </>
    );
  }

  // ================================================================
  // CASHIER RECEIPT — grouped by category, exact format from photo
  // ================================================================

  const groupedItems: Record<string, any[]> = {};
  order.items.forEach((item: any) => {
    const menuItem = menuItems.find(m => m.id === (item.menuItemId || item.id));
    const resolvedName = (item.name && item.name.trim() !== '' && item.name.toLowerCase() !== 'taom')
      ? item.name
      : (menuItem?.name || item.note || 'Taom');

    let catName = item.categoryName;
    if (!catName || catName.trim() === '' || catName.toLowerCase() === 'boshqa' || catName.toLowerCase() === 'кухня') {
      const cat = categories.find(c => c.id === menuItem?.categoryId);
      catName = cat?.name;
    }

    // Smart categorizer fallback so items are grouped cleanly into the 9 categories
    if (!catName || catName.toLowerCase() === 'boshqa' || catName.toLowerCase() === 'кухня') {
      const name = resolvedName.toLowerCase();
      if (name.includes('shashlik') || name.includes('kabob') || name.includes('qiyma') || name.includes('dandana') || name.includes('bomba') || name.includes('polvon')) {
        catName = 'KABOBLAR';
      } else if (name.includes('baliq') || name.includes('fish') || name.includes('marinka') || name.includes('sazan')) {
        catName = 'BALIQ TAOMLARI';
      } else if (name.includes('somsa')) {
        catName = 'TANDIR SOMSA';
      } else if (name.includes('non') || name.includes('choy')) {
        catName = 'NON - CHOY';
      } else if (name.includes('tabaka')) {
        catName = 'TABAKA';
      } else if (name.includes('salat') || name.includes('akroshka') || name.includes('shakarob') || name.includes('suzma') || name.includes('svejiy') || name.includes('tuzlama')) {
        catName = 'SALATLAR';
      } else if (name.includes('tort') || name.includes('medovik') || name.includes('micado') || name.includes('napalion') || name.includes('praysil') || name.includes('snickers') || name.includes('tart') || name.includes('twix') || name.includes('pista')) {
        catName = 'SHIRINLIKLAR';
      } else if (name.includes('cola') || name.includes('fanta') || name.includes('suv') || name.includes('lipton') || name.includes('kavsar') || name.includes('sok') || name.includes('anor')) {
        catName = 'SALQIN ICHIMLIKLAR';
      } else {
        catName = 'OVQATLAR';
      }
    }

    if (!groupedItems[catName]) groupedItems[catName] = [];
    groupedItems[catName].push({
      ...item,
      name: resolvedName,
      price: item.price || menuItem?.price || 0
    });
  });

  return (
    <>
      <style>{commonPrintStyles}</style>
      <div
        ref={ref}
        data-receipt-id={order.id}
        className="hidden print:block print-thermal-receipt print-cashier-container print-container"
        style={{
          width: printWidth,
          maxWidth: printWidth,
          margin: '0',
          marginLeft: '0',
          padding: '0 1.5mm 0 1.5mm',
          boxSizing: 'border-box',
          fontFamily: "'Consolas', 'Segoe UI Mono', 'Courier New', Courier, monospace",
          fontSize: fontSize,
          lineHeight: '1.35',
          color: '#000',
          backgroundColor: '#fff',
          overflow: 'hidden',
          fontWeight: 700,
        }}
      >
        {/* ── HEADER: LOGO & BRAND MATCHING IMAGE 2 ── */}
        <div style={{ textAlign: 'center', padding: '1mm 0 1.5mm' }}>
          {order.status === 'cancelled' && (
            <div style={{ fontWeight: 900, marginBottom: '1.5mm', fontSize: '13px' }}>*** BEKOR QILINDI ***</div>
          )}
          {(order as any).printCount > 1 && isPaid && !isTest && (
            <div style={{ fontWeight: 900, marginBottom: '1.5mm', fontSize: '13px' }}>*** POVTOR ***</div>
          )}
          <img
            src={logoImg}
            alt="Isfayram Kafe"
            style={{
              width: is58mm ? '28mm' : '38mm',
              height: 'auto',
              maxHeight: is58mm ? '28mm' : '38mm',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto 1mm',
              imageRendering: '-webkit-optimize-contrast' as any,
            }}
          />
        </div>

        {/* Double dashed separator matching Image 1 */}
        <div style={doubleDashedLine} />

        {/* ── ORDER INFO ── */}
        <div style={{ fontSize: is58mm ? '10px' : '11.5px', lineHeight: '1.55', fontWeight: 'bold' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Счёт №:</span>
            <span style={{ fontWeight: 900 }}>{formatOrderId(order.id)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Стол:</span>
            <span style={{ fontWeight: 900 }}>{tableLabel}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Официант:</span>
            <span>{waiterName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Гостей:</span>
            <span>{guestCount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Закрыт:</span>
            <span>{closedDateTimeStr}</span>
          </div>
        </div>

        {/* Single dashed separator under order info */}
        <div style={singleDashedLine} />

        {/* ── ITEMS grouped by category ── */}
        {Object.entries(groupedItems).map(([catName, items]) => (
          <div key={catName}>
            {/* Category header — centered */}
            <div style={{
              textAlign: 'center',
              fontWeight: 900,
              fontSize: is58mm ? '10.5px' : '12px',
              margin: '1.5mm 0 1mm',
              letterSpacing: '0.5px',
            }}>
              {catName}
            </div>

            {/* Dashed line directly under category title */}
            <div style={singleDashedLine} />

            {/* ITEM ROWS: NAME on left, xQTY | PRICE on right */}
            {items.map((item, idx) => {
              const itemName = (item.name || 'Taom').toUpperCase();
              const itemTotal = (item.price || 0) * item.quantity;
              return (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '1.2mm',
                  fontSize: is58mm ? '10px' : '11.5px',
                  fontWeight: 'bold',
                  lineHeight: '1.3',
                }}>
                  <div style={{ flex: 1, paddingRight: '2mm', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {itemName}
                    {item.notes && (
                      <div style={{ fontSize: '9px', fontWeight: 'normal' }}>({item.notes})</div>
                    )}
                  </div>
                  <div style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    x{item.quantity}&nbsp;|&nbsp;{formatSom(itemTotal)}
                  </div>
                </div>
              );
            })}

            {/* Dashed line at category bottom */}
            <div style={singleDashedLine} />
          </div>
        ))}

        {/* ── TOTALS ── */}
        <div style={{ fontSize: is58mm ? '10px' : '11.5px', lineHeight: '1.6', marginTop: '1mm', fontWeight: 'bold' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Сумма блюд:</span>
            <span>{formatSom(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Сервис ({servicePercent.toFixed(2)}%):</span>
            <span>+{formatSom(serviceAmount).replace(' сум', '')}</span>
          </div>
        </div>

        {/* Double dashed line above grand total */}
        <div style={doubleDashedLine} />

        {/* ИТОГО */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 900,
          fontSize: is58mm ? '14px' : '16px',
          margin: '1.2mm 0',
          letterSpacing: '0.3px',
        }}>
          <span>ИТОГО:</span>
          <span>{formatSom(grandTotal)}</span>
        </div>

        {/* Double dashed line below grand total */}
        <div style={doubleDashedLine} />

        {/* ── FOOTER: Delivery numbers separated with +998 + Thank you ── */}
        <div style={{ textAlign: 'center', marginTop: '3mm', lineHeight: '1.4' }}>
          <div style={{
            padding: '1.5mm 0',
            borderTop: '1px dashed #000',
            borderBottom: '1px dashed #000',
            marginBottom: '1.5mm',
            color: '#000',
          }}>
            {(!receiptSettings?.footer1 ||
              receiptSettings.footer1.includes('95 034 31 15') ||
              receiptSettings.footer1.includes('93 229 88 96') ||
              receiptSettings.footer1.toLowerCase().includes('доставка')) ? (
              <>
                <div style={{
                  fontSize: is58mm ? '10.5px' : '12px',
                  fontWeight: 900,
                  letterSpacing: '0.5px',
                  marginBottom: '1mm',
                }}>
                  Доставка:
                </div>
                <div style={{
                  fontSize: is58mm ? '12px' : '14px',
                  fontWeight: 900,
                  letterSpacing: '0.5px',
                  lineHeight: '1.35',
                }}>
                  +998 95 034 31 15
                </div>
                <div style={{
                  fontSize: is58mm ? '12px' : '14px',
                  fontWeight: 900,
                  letterSpacing: '0.5px',
                  lineHeight: '1.35',
                  marginTop: '0.8mm',
                }}>
                  +998 93 229 88 96
                </div>
              </>
            ) : (
              <div style={{
                fontSize: is58mm ? '12px' : '14px',
                fontWeight: 900,
                letterSpacing: '0.4px',
                whiteSpace: 'pre-line',
              }}>
                {receiptSettings.footer1}
              </div>
            )}
          </div>
          <div style={{ fontSize: is58mm ? '11px' : '12.5px', fontWeight: 900, letterSpacing: '0.5px', color: '#000' }}>
            {receiptSettings?.footer2 || 'Спасибо за визит!'}
          </div>
        </div>

        <div style={{ height: '8mm' }} />
      </div>
    </>
  );
});

ReceiptPrint.displayName = 'ReceiptPrint';
