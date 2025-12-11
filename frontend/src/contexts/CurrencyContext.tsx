import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Currency = 'VND' | 'USD'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatCurrency: (amount: number) => string
  convertToUSD: (vndAmount: number, exchangeRate?: number) => number
  formatUSD: (amount: number) => string
}

const DEFAULT_EXCHANGE_RATE = 25000 // 1 USD = 25000 VND (có thể config sau)

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency') as Currency
    return saved && (saved === 'VND' || saved === 'USD') ? saved : 'VND'
  })

  useEffect(() => {
    localStorage.setItem('currency', currency)
  }, [currency])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
  }

  const formatCurrency = (amount: number): string => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' đ'
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }
  }

  const convertToUSD = (vndAmount: number, exchangeRate: number = DEFAULT_EXCHANGE_RATE): number => {
    return vndAmount / exchangeRate
  }

  const formatUSD = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency, convertToUSD, formatUSD }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}

