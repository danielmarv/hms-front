"use client"

import { useState } from "react"
import { toast } from "sonner"

export interface Currency {
  code: string
  name: string
  symbol: string
  exchangeRate: number
  isDefault: boolean
}

// Hardcoded currency configurations as requested
const HARDCODED_CURRENCIES: Currency[] = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    exchangeRate: 1,
    isDefault: true,
  },
  {
    code: "UGX",
    name: "Ugandan Shilling",
    symbol: "USh",
    exchangeRate: 3800,
    isDefault: false,
  },
]

export function useCurrency() {
  const [currencies, setCurrencies] = useState<Currency[]>(HARDCODED_CURRENCIES)
  const [isLoading, setIsLoading] = useState(false)

  // Get all currencies (returns hardcoded data)
  const getCurrencies = async () => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 100))
      setCurrencies(HARDCODED_CURRENCIES)
      return HARDCODED_CURRENCIES
    } catch (error) {
      toast.error("Failed to fetch currencies")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new currency (updates local state only)
  const createCurrency = async (currency: Partial<Currency>) => {
    setIsLoading(true)
    try {
      if (!currency.code || !currency.name || !currency.symbol) {
        throw new Error("Missing required fields")
      }

      const newCurrency: Currency = {
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        exchangeRate: currency.exchangeRate || 1,
        isDefault: currency.isDefault || false,
      }

      // If setting as default, update others
      let updatedCurrencies = [...currencies]
      if (newCurrency.isDefault) {
        updatedCurrencies = updatedCurrencies.map((c) => ({ ...c, isDefault: false }))
      }

      updatedCurrencies.push(newCurrency)
      setCurrencies(updatedCurrencies)

      return newCurrency
    } catch (error) {
      toast.error("Failed to create currency")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Update a currency
  const updateCurrency = async (code: string, updates: Partial<Currency>) => {
    setIsLoading(true)
    try {
      const updatedCurrencies = currencies.map((currency) => {
        if (currency.code === code) {
          return { ...currency, ...updates }
        }
        // If setting this currency as default, unset others
        if (updates.isDefault && currency.code !== code) {
          return { ...currency, isDefault: false }
        }
        return currency
      })

      setCurrencies(updatedCurrencies)
      return updatedCurrencies.find((c) => c.code === code)
    } catch (error) {
      toast.error("Failed to update currency")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Update exchange rate for a currency
  const updateExchangeRate = async (code: string, rate: number) => {
    setIsLoading(true)
    try {
      const updatedCurrencies = currencies.map((currency) =>
        currency.code === code ? { ...currency, exchangeRate: rate } : currency,
      )
      setCurrencies(updatedCurrencies)
      return updatedCurrencies.find((c) => c.code === code)
    } catch (error) {
      toast.error("Failed to update exchange rate")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a currency (prevent deletion of hardcoded currencies)
  const deleteCurrency = async (code: string) => {
    setIsLoading(true)
    try {
      // Prevent deletion of hardcoded currencies
      const hardcodedCodes = HARDCODED_CURRENCIES.map((c) => c.code)
      if (hardcodedCodes.includes(code)) {
        throw new Error("Cannot delete system currencies")
      }

      const updatedCurrencies = currencies.filter((currency) => currency.code !== code)
      setCurrencies(updatedCurrencies)
      return true
    } catch (error) {
      toast.error("Failed to delete currency")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Convert amount between currencies
  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    const from = currencies.find((c) => c.code === fromCurrency)
    const to = currencies.find((c) => c.code === toCurrency)

    if (!from || !to) {
      return amount
    }

    // If same currency, return original amount
    if (fromCurrency === toCurrency) {
      return amount
    }

    // Convert to base currency first (USD)
    let inBaseCurrency = amount
    if (!from.isDefault) {
      inBaseCurrency = amount / from.exchangeRate
    }

    // Then convert from base to target currency
    if (to.isDefault) {
      return inBaseCurrency
    } else {
      return inBaseCurrency * to.exchangeRate
    }
  }

  // Format amount according to currency
  const formatCurrency = (amount: number, currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode)

    if (!currency) {
      return `${amount}`
    }

    // Custom formatting for UGX (no decimals)
    if (currency.code === "UGX") {
      return `${currency.symbol} ${Math.round(amount).toLocaleString()}`
    }

    // Standard formatting for other currencies
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.code,
      currencyDisplay: "symbol",
      minimumFractionDigits: currency.code === "UGX" ? 0 : 2,
      maximumFractionDigits: currency.code === "UGX" ? 0 : 2,
    }).format(amount)
  }

  // Get default currency
  const getDefaultCurrency = () => {
    return currencies.find((c) => c.isDefault) || currencies[0]
  }

  return {
    currencies,
    isLoading,
    getCurrencies,
    createCurrency,
    updateCurrency,
    updateExchangeRate,
    deleteCurrency,
    convertCurrency,
    formatCurrency,
    getDefaultCurrency,
  }
}
