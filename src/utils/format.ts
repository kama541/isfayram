/**
 * Formats a number to Uzbek so'm (UZS)
 * Example: 15000 -> 15 000 so'm
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " so'm";
};

export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTime = (isoString?: string): string => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatOrderId = (id: string): string => {
  if (!id) return 'A-060';
  if (id.startsWith('TEST') || id.toLowerCase().includes('test')) return 'A-060';
  const hex = id.replace(/[^0-9a-fA-F]/g, '');
  if (hex.length >= 4) {
    const num = parseInt(hex.substring(0, 6), 16);
    if (!isNaN(num)) return 'A-' + String(num % 1000).padStart(3, '0');
  }
  const digits = id.replace(/\D/g, '');
  if (digits.length > 0) {
    return 'A-' + digits.slice(-3).padStart(3, '0');
  }
  return 'A-060';
};

export const formatTableName = (name: string | number | undefined | null): string => {
  if (!name) return '';
  const str = String(name);
  if (/^\d+$/.test(str)) {
    return `${str}-xona`;
  }
  return str;
};

export const getDefaultTableSection = (tableName: string | undefined | null): string => {
  if (!tableName) return 'Zal';
  const name = String(tableName).toLowerCase();
  if (name.includes('tapcha') || ['4-stol', '6-stol', '8-stol', '9-stol'].includes(name)) return "Ko'cha";
  if (name.includes('kabinet')) return "Kabina";
  return 'Zal';
};
