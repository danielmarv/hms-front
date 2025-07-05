"use client"

import { useState } from "react"

export interface CurrencyConfig {
  primaryCurrency: "USD" | "UGX"
  exchangeRate: number // UGX to USD rate
  displayBoth: boolean
}

export const useCurrency = () => {
  const [config, setConfig] = useState<CurrencyConfig>({
    primaryCurrency: "USD",
    exchangeRate: 3800, // 3800 UGX = 1 USD
    displayBoth: true,
  })

  // Convert UGX to USD
  const ugxToUsd = (ugxAmount: number): number => {
    return ugxAmount / config.exchangeRate
  }

  // Convert USD to UGX
  const usdToUgx = (usdAmount: number): number => {
    return usdAmount * config.exchangeRate
  }

  // Format currency for display
  const formatCurrency = (amount: number, currency: "USD" | "UGX" = "USD"): string => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
    } else {
      return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency: "UGX",
      }).format(amount)
    }
  }

  // Convert any amount to USD (for storage)
  const convertToUsd = (amount: number, fromCurrency: "USD" | "UGX"): number => {
    if (fromCurrency === "USD") {
      return amount
    }
    return ugxToUsd(amount)
  }

  // Get display amounts for both currencies
  const getDisplayAmounts = (usdAmount: number) => {
    return {
      usd: usdAmount,
      ugx: usdToUgx(usdAmount),
      formattedUsd: formatCurrency(usdAmount, "USD"),
      formattedUgx: formatCurrency(usdToUgx(usdAmount), "UGX"),
    }
  }

  return {
    config,
    setConfig,
    ugxToUsd,
    usdToUgx,
    formatCurrency,
    convertToUsd,
    getDisplayAmounts,
  }
}
