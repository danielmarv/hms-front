"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useCurrency } from "@/hooks/use-currency"
import { DollarSign, Banknote } from "lucide-react"

interface CurrencyInputProps {
  label?: string
  value: number // Always in USD for storage
  onChange: (usdValue: number) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  showConversion?: boolean
  id?: string
}

export function CurrencyInput({
  label,
  value,
  onChange,
  placeholder = "0.00",
  disabled = false,
  required = false,
  className = "",
  showConversion = true,
  id,
}: CurrencyInputProps) {
  const { convertToUsd, getDisplayAmounts, formatCurrency } = useCurrency()
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "UGX">("USD")
  const [inputValue, setInputValue] = useState<string>("")

  // Update input value when external value changes
  useEffect(() => {
    if (value === 0 && inputValue === "") return

    const displayAmounts = getDisplayAmounts(value)
    if (selectedCurrency === "USD") {
      setInputValue(displayAmounts.usd.toString())
    } else {
      setInputValue(Math.round(displayAmounts.ugx).toString())
    }
  }, [value, selectedCurrency])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    setInputValue(inputVal)

    const numericValue = Number.parseFloat(inputVal) || 0
    const usdValue = convertToUsd(numericValue, selectedCurrency)
    onChange(usdValue)
  }

  // Handle currency change
  const handleCurrencyChange = (currency: "USD" | "UGX") => {
    setSelectedCurrency(currency)

    // Convert current input value to new currency
    if (inputValue && !isNaN(Number.parseFloat(inputValue))) {
      const currentUsdValue = convertToUsd(Number.parseFloat(inputValue), selectedCurrency)
      const displayAmounts = getDisplayAmounts(currentUsdValue)

      if (currency === "USD") {
        setInputValue(displayAmounts.usd.toString())
      } else {
        setInputValue(Math.round(displayAmounts.ugx).toString())
      }
    }
  }

  const displayAmounts = getDisplayAmounts(value)

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="flex gap-2">
        <div className="flex-1">
          <div className="relative">
            <Input
              id={id}
              type="number"
              min="0"
              step={selectedCurrency === "USD" ? "0.01" : "1"}
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              className="pr-16"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {selectedCurrency === "USD" ? (
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Banknote className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="UGX">UGX</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showConversion && value > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">USD:</span>
                <span className="font-medium">{displayAmounts.formattedUsd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">UGX:</span>
                <span className="font-medium">{displayAmounts.formattedUgx}</span>
              </div>
              <div className="text-xs text-muted-foreground pt-1 border-t">Exchange Rate: 1 USD = 3,800 UGX</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
