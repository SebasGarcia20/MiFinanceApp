/**
 * Currency utilities for COP (Colombian Pesos)
 * Amounts are stored as integers (cents), displayed as formatted currency
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseCurrencyInput(value: string): number {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  // Return as integer (cents)
  return digits ? parseInt(digits, 10) : 0;
}

export function formatCurrencyInput(amount: number): string {
  // Format for input display (without currency symbol, with thousand separators)
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
