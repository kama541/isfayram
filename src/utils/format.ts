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
