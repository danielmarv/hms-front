"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowLeft, Plus, Trash2, RefreshCw, Check, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCurrency } from "@/hooks/use-currency"

export default function CurrenciesPage() {
  const router = useRouter()
  const {
    currencies,
    isLoading,
    getCurrencies,
    createCurrency,
    updateCurrency,
    deleteCurrency,
    updateExchangeRate,
    convertCurrency,
    formatCurrency,
  } = useCurrency()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditRateDialog, setShowEditRateDialog] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null)

  const [newCurrency, setNewCurrency] = useState({
    code: "",
    name: "",
    symbol: "",
    exchangeRate: 1,
    isDefault: false,
  })

  const [newRate, setNewRate] = useState({
    currencyCode: "",
    rate: 1,
  })

  useEffect(() => {
    getCurrencies()
  }, [])

  const handleAddCurrency = async () => {
    if (!newCurrency.code || !newCurrency.name || !newCurrency.symbol) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await createCurrency(newCurrency)
      setShowAddDialog(false)
      setNewCurrency({
        code: "",
        name: "",
        symbol: "",
        exchangeRate: 1,
        isDefault: false,
      })
      toast.success("Currency added successfully")
    } catch (error) {
      toast.error("Failed to add currency")
    }
  }

  const handleUpdateRate = async () => {
    if (!newRate.currencyCode || newRate.rate <= 0) {
      toast.error("Please provide a valid exchange rate")
      return
    }

    try {
      await updateExchangeRate(newRate.currencyCode, newRate.rate)
      setShowEditRateDialog(false)
      toast.success("Exchange rate updated successfully")
    } catch (error) {
      toast.error("Failed to update exchange rate")
    }
  }

  const handleDeleteCurrency = async (code: string) => {
    try {
      await deleteCurrency(code)
      toast.success("Currency deleted successfully")
    } catch (error) {
      toast.error("Cannot delete system currencies")
    }
  }

  const handleSetDefault = async (code: string) => {
    try {
      await updateCurrency(code, { isDefault: true })
      toast.success(`${code} set as default currency`)
    } catch (error) {
      toast.error("Failed to set default currency")
    }
  }

  const openEditRateDialog = (currency: any) => {
    setNewRate({
      currencyCode: currency.code,
      rate: currency.exchangeRate,
    })
    setSelectedCurrency(currency.code)
    setShowEditRateDialog(true)
  }

  // Example conversion for demonstration
  const exampleConversion =
    currencies.length >= 2
      ? {
          amount: 100,
          from: currencies[0].code,
          to: currencies[1].code,
          result: convertCurrency(100, currencies[0].code, currencies[1].code),
        }
      : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/settings")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Currency Management</h1>
            <p className="text-muted-foreground">Manage currencies and exchange rates for the system</p>
          </div>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Currency
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Currency</DialogTitle>
              <DialogDescription>
                Add a new currency to the system with its exchange rate relative to the base currency.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currencyCode">Currency Code</Label>
                  <Input
                    id="currencyCode"
                    placeholder="EUR"
                    maxLength={3}
                    value={newCurrency.code}
                    onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="€"
                    maxLength={3}
                    value={newCurrency.symbol}
                    onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Currency Name</Label>
                <Input
                  id="name"
                  placeholder="Euro"
                  value={newCurrency.name}
                  onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exchangeRate">Exchange Rate</Label>
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  placeholder="0.85"
                  value={newCurrency.exchangeRate}
                  onChange={(e) =>
                    setNewCurrency({ ...newCurrency, exchangeRate: Number.parseFloat(e.target.value) || 1 })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Rate relative to USD (e.g., 1 USD = {newCurrency.exchangeRate} {newCurrency.code || "XXX"})
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={newCurrency.isDefault}
                  onCheckedChange={(checked) => setNewCurrency({ ...newCurrency, isDefault: checked })}
                />
                <Label htmlFor="isDefault">Set as default currency</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCurrency}>Add Currency</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* System Currency Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          USD and UGX are system currencies with a fixed rate of 1 USD = 3,800 UGX. Additional currencies can be added
          as needed.
        </AlertDescription>
      </Alert>

      {/* Currency Conversion Example */}
      {exampleConversion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Currency Conversion Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm">
              <span>{formatCurrency(exampleConversion.amount, exampleConversion.from)}</span>
              <span>=</span>
              <span className="font-semibold">{formatCurrency(exampleConversion.result, exampleConversion.to)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Currencies</CardTitle>
          <CardDescription>Manage the currencies available in the system and their exchange rates</CardDescription>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencies.map((currency) => (
                  <TableRow key={currency.code}>
                    <TableCell className="font-medium">{currency.code}</TableCell>
                    <TableCell>{currency.name}</TableCell>
                    <TableCell>{currency.symbol}</TableCell>
                    <TableCell>
                      {currency.isDefault ? (
                        <Badge variant="outline">Base Currency</Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>
                            1 USD = {currency.exchangeRate.toLocaleString()} {currency.code}
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => openEditRateDialog(currency)}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {currency.isDefault ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => handleSetDefault(currency.code)}>
                          Set Default
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!currency.isDefault && !["USD", "UGX"].includes(currency.code) && (
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCurrency(currency.code)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEditRateDialog} onOpenChange={setShowEditRateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Exchange Rate</DialogTitle>
            <DialogDescription>Update the exchange rate for {selectedCurrency} relative to USD.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rate">Exchange Rate</Label>
              <Input
                id="rate"
                type="number"
                step="0.0001"
                min="0.0001"
                value={newRate.rate}
                onChange={(e) => setNewRate({ ...newRate, rate: Number.parseFloat(e.target.value) || 1 })}
              />
              <p className="text-sm text-muted-foreground">
                1 USD = {newRate.rate} {selectedCurrency}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRate}>Update Rate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
