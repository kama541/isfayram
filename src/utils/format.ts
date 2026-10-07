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

export const formatOrderId = (id: string): string => {
  if (!id) return '';
  return parseInt(id.substring(0, 8), 16).toString().substring(0, 6);
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
