"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, RefreshCw, Check } from "lucide-react"
import { useCurrency } from "@/hooks/use-currency"
import { useRouter } from "next/navigation"

export default function CurrencySettings() {
  const router = useRouter()
  const { currencies, isLoading, getCurrencies } = useCurrency()

  useEffect(() => {
    getCurrencies()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Currency Management</CardTitle>
          <CardDescription>Configure currencies and exchange rates for the system</CardDescription>
        </div>
        <Button onClick={() => router.push("/admin/settings/currencies")}>
          <Plus className="mr-2 h-4 w-4" />
          Manage Currencies
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Exchange Rate</TableHead>
                <TableHead>Default</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.slice(0, 5).map((currency) => (
                <TableRow key={currency.code}>
                  <TableCell className="font-medium">{currency.code}</TableCell>
                  <TableCell>{currency.name}</TableCell>
                  <TableCell>{currency.symbol}</TableCell>
                  <TableCell>
                    {currency.isDefault ? <Badge variant="outline">Base Currency</Badge> : currency.exchangeRate}
                  </TableCell>
                  <TableCell>{currency.isDefault && <Check className="h-5 w-5 text-green-500" />}</TableCell>
                </TableRow>
              ))}
              {currencies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No currencies found. Add a currency to get started.
                  </TableCell>
                </TableRow>
              )}
              {currencies.length > 5 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-2">
                    <Button variant="link" onClick={() => router.push("/admin/settings/currencies")}>
                      View all {currencies.length} currencies
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
