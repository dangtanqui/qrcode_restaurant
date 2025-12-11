import { Currency } from '../contexts/CurrencyContext'

/**
 * Format number for input display (with thousand separators)
 * For VND: 100000 -> "100.000"
 * For USD: 10.5 -> "10.50"
 */
export function formatPriceInput(value: number | string, currency: Currency): string {
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
  
  if (currency === 'VND') {
    // VND: format with dots as thousand separators, no decimals
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(numValue).replace(/,/g, '.')
  } else {
    // USD: format with 2 decimals
    return numValue.toFixed(2)
  }
}

/**
 * Parse formatted input string back to number
 * "100.000" -> 100000 (VND)
 * "10.50" -> 10.5 (USD)
 */
export function parsePriceInput(value: string, currency: Currency): number {
  if (!value) return 0
  
  if (currency === 'VND') {
    // Remove dots (thousand separators) and parse
    const cleaned = value.replace(/\./g, '')
    return parseFloat(cleaned) || 0
  } else {
    // Parse as normal decimal
    return parseFloat(value) || 0
  }
}

/**
 * Format price for display (with currency symbol)
 */
export function formatPriceDisplay(amount: number, currency: Currency): string {
  if (currency === 'VND') {
    // VND: 100000 -> "100.000 đ"
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' đ'
  } else {
    // USD: 10.5 -> "$10.50"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }
}

