"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useInvoices } from "@/hooks/use-invoices"
import { useGuests } from "@/hooks/use-guests"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { addDays } from "date-fns"

export default function NewInvoicePage() {
  const router = useRouter()
  const { createInvoice, isLoading } = useInvoices()
  const { guests, getGuests } = useGuests()

  const [invoiceData, setInvoiceData] = useState({
    guest: "",
    booking: "",
    items: [
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        taxable: true,
      },
    ],
    taxes: [
      {
        name: "VAT",
        rate: 10,
        amount: 0,
      },
    ],
    discounts: [],
    subtotal: 0,
    taxTotal: 0,
    discountTotal: 0,
    total: 0,
    currency: "USD",
    status: "Draft",
    dueDate: addDays(new Date(), 30),
    notes: "",
    paymentTerms: "Payment due within 30 days of invoice date.",
    paymentInstructions: "",
    isBillingAddressSameAsGuest: true,
    isCompanyBilling: false,
  })

  const [billingAddress, setBillingAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  })

  const [companyDetails, setCompanyDetails] = useState({
    name: "",
    taxId: "",
    contactPerson: "",
    email: "",
    phone: "",
  })

  const [newDiscount, setNewDiscount] = useState({
    name: "",
    type: "percentage",
    value: 0,
    amount: 0,
  })

  useEffect(() => {
    getGuests()
  }, [])

  // Calculate item total
  const calculateItemTotal = (item: { quantity: number; unitPrice: number }) => {
    return item.quantity * item.unitPrice
  }

  // Calculate subtotal
  const calculateSubtotal = (items: Array<{ quantity: number; unitPrice: number }>) => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  // Calculate tax total
  const calculateTaxTotal = (
    items: Array<{ quantity: number; unitPrice: number; taxable: boolean }>,
    taxes: Array<{ rate: number }>,
  ) => {
    const taxableAmount = items.reduce((sum, item) => sum + (item.taxable ? calculateItemTotal(item) : 0), 0)
    return taxes.reduce((sum, tax) => sum + (taxableAmount * tax.rate) / 100, 0)
  }

  // Calculate discount total
  const calculateDiscountTotal = (subtotal: number, discounts: Array<{ type: string; value: number }>) => {
    return discounts.reduce((sum, discount) => {
      if (discount.type === "percentage") {
        return sum + (subtotal * discount.value) / 100
      } else {
        return sum + discount.value
      }
    }, 0)
  }

  // Calculate total
  const calculateTotal = (subtotal: number, taxTotal: number, discountTotal: number) => {
    return subtotal + taxTotal - discountTotal
  }

  // Update calculations
  const updateCalculations = () => {
    const subtotal = calculateSubtotal(invoiceData.items)
    const taxTotal = calculateTaxTotal(invoiceData.items, invoiceData.taxes)

    // Update discount amounts
    const updatedDiscounts = invoiceData.discounts.map((discount) => {
      if (discount.type === "percentage") {
        return {
          ...discount,
          amount: (subtotal * discount.value) / 100,
        }
      }
      return discount
    })

    const discountTotal = calculateDiscountTotal(subtotal, updatedDiscounts)
    const total = calculateTotal(subtotal, taxTotal, discountTotal)

    // Update tax amounts
    const updatedTaxes = invoiceData.taxes.map((tax) => {
      const taxableAmount = invoiceData.items.reduce(
        (sum, item) => sum + (item.taxable ? calculateItemTotal(item) : 0),
        0,
      )
      return {
        ...tax,
        amount: (taxableAmount * tax.rate) / 100,
      }
    })

    setInvoiceData({
      ...invoiceData,
      taxes: updatedTaxes,
      discounts: updatedDiscounts,
      subtotal,
      taxTotal,
      discountTotal,
      total,
    })
  }

  // Handle item change
  const handleItemChange = (index: number, field: string, value: string | number | boolean) => {
    const updatedItems = [...invoiceData.items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    }

    // Calculate item total
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].total = calculateItemTotal(updatedItems[index])
    }

    setInvoiceData({
      ...invoiceData,
      items: updatedItems,
    })

    // Update all calculations
    setTimeout(updateCalculations, 0)
  }

  // Add new item
  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          total: 0,
          taxable: true,
        },
      ],
    })
  }

  // Remove item
  const removeItem = (index: number) => {
    if (invoiceData.items.length === 1) {
      toast.error("Invoice must have at least one item")
      return
    }

    const updatedItems = [...invoiceData.items]
    updatedItems.splice(index, 1)

    setInvoiceData({
      ...invoiceData,
      items: updatedItems,
    })

    // Update all calculations
    setTimeout(updateCalculations, 0)
  }

  // Handle tax change
  const handleTaxChange = (index: number, field: string, value: string | number) => {
    const updatedTaxes = [...invoiceData.taxes]
    updatedTaxes[index] = {
      ...updatedTaxes[index],
      [field]: value,
    }

    setInvoiceData({
      ...invoiceData,
      taxes: updatedTaxes,
    })

    // Update all calculations
    setTimeout(updateCalculations, 0)
  }

  // Add new tax
  const addTax = () => {
    setInvoiceData({
      ...invoiceData,
      taxes: [
        ...invoiceData.taxes,
        {
          name: "",
          rate: 0,
          amount: 0,
        },
      ],
    })
  }

  // Remove tax
  const removeTax = (index: number) => {
    const updatedTaxes = [...invoiceData.taxes]
    updatedTaxes.splice(index, 1)

    setInvoiceData({
      ...invoiceData,
      taxes: updatedTaxes,
    })

    // Update all calculations
    setTimeout(updateCalculations, 0)
  }

  // Handle discount change
  const handleDiscountChange = (field: string, value: string | number) => {
    setNewDiscount({
      ...newDiscount,
      [field]: value,
    })

    if (field === "value" || field === "type") {
      // Calculate amount
      if (newDiscount.type === "percentage") {
        setNewDiscount({
          ...newDiscount,
          [field]: value,
          amount: (invoiceData.subtotal * (value as number)) / 100,
        })
      } else {
        setNewDiscount({
          ...newDiscount,
          [field]: value,
          amount: value as number,
        })
      }
    }
  }

  // Add discount
  const addDiscount = () => {
    if (!newDiscount.name) {
      toast.error("Discount name is required")
      return
    }

    if (newDiscount.value <= 0) {
      toast.error("Discount value must be greater than zero")
      return
    }

    // Calculate amount
    let amount = 0
    if (newDiscount.type === "percentage") {
      amount = (invoiceData.subtotal * newDiscount.value) / 100
    } else {
      amount = newDiscount.value
    }

    const discount = {
      ...newDiscount,
      amount,
    }

    setInvoiceData({
      ...invoiceData,
      discounts: [...invoiceData.discounts, discount],
    })

    // Reset new discount
    setNewDiscount({
      name: "",
      type: "percentage",
      value: 0,
      amount: 0,
    })

    // Update all calculations
    setTimeout(updateCalculations, 0)
  }

  // Remove discount
  const removeDiscount = (index: number) => {
    const updatedDiscounts = [...invoiceData.discounts]
    updatedDiscounts.splice(index, 1)

    setInvoiceData({
      ...invoiceData,
      discounts: updatedDiscounts,
    })

    // Update all calculations
    setTimeout(updateCalculations, 0)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setInvoiceData({ ...invoiceData, [name]: value })
  }

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setInvoiceData({ ...invoiceData, [name]: value })
  }

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setInvoiceData({ ...invoiceData, dueDate: date })
    }
  }

  // Handle checkbox change
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setInvoiceData({ ...invoiceData, [name]: checked })
  }

  // Handle billing address change
  const handleBillingAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBillingAddress({ ...billingAddress, [name]: value })
  }

  // Handle company details change
  const handleCompanyDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCompanyDetails({ ...companyDetails, [name]: value })
  }

  // Format currency
  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!invoiceData.guest) {
      toast.error("Please select a guest")
      return
    }

    if (invoiceData.items.length === 0) {
      toast.error("Please add at least one item")
      return
    }

    // Validate items
    for (const item of invoiceData.items) {
      if (!item.description) {
        toast.error("All items must have a description")
        return
      }
      if (item.quantity <= 0) {
        toast.error("All items must have a quantity greater than zero")
        return
      }
    }

    try {
      // Prepare data for submission
      const data = {
        ...invoiceData,
        billingAddress: invoiceData.isBillingAddressSameAsGuest ? undefined : billingAddress,
        companyDetails: invoiceData.isCompanyBilling ? companyDetails : undefined,
      }

      const response = await createInvoice(data)

      if (response.success) {
        toast.success("Invoice created successfully")
        router.push("/dashboard/invoices")
      }
    } catch (error) {
      console.error("Error creating invoice:", error)
      toast.error("Failed to create invoice")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">New Invoice</h2>
          <p className="text-muted-foreground">Create a new invoice for a guest</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic invoice details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guest">Guest</Label>
                  <Select value={invoiceData.guest} onValueChange={(value) => handleSelectChange("guest", value)}>
                    <SelectTrigger id="guest">
                      <SelectValue placeholder="Select guest" />
                    </SelectTrigger>
                    <SelectContent>
                      {guests.map((guest) => (
                        <SelectItem key={guest._id} value={guest._id}>
                          {guest.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={invoiceData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={invoiceData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Issued">Issued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <DatePicker date={invoiceData.dueDate} setDate={handleDateChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
              <CardDescription>Add items to the invoice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Taxable</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            placeholder="Item description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", Number.parseInt(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(index, "unitPrice", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={item.taxable}
                            onCheckedChange={(checked) => handleItemChange(index, "taxable", Boolean(checked))}
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(item.total, invoiceData.currency)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" type="button" onClick={() => removeItem(index)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button type="button" variant="outline" className="mt-4" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Taxes</CardTitle>
                <CardDescription>Add taxes to the invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Rate (%)</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceData.taxes.map((tax, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              value={tax.name}
                              onChange={(e) => handleTaxChange(index, "name", e.target.value)}
                              placeholder="Tax name"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={tax.rate}
                              onChange={(e) => handleTaxChange(index, "rate", Number.parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell>{formatCurrency(tax.amount, invoiceData.currency)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" type="button" onClick={() => removeTax(index)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button type="button" variant="outline" className="mt-4" onClick={addTax}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tax
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discounts</CardTitle>
                <CardDescription>Add discounts to the invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discountName">Name</Label>
                      <Input
                        id="discountName"
                        value={newDiscount.name}
                        onChange={(e) => handleDiscountChange("name", e.target.value)}
                        placeholder="Discount name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountType">Type</Label>
                      <Select value={newDiscount.type} onValueChange={(value) => handleDiscountChange("type", value)}>
                        <SelectTrigger id="discountType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discountValue">Value</Label>
                      <Input
                        id="discountValue"
                        type="number"
                        min="0"
                        step={newDiscount.type === "percentage" ? "0.01" : "1"}
                        value={newDiscount.value || ""}
                        onChange={(e) => handleDiscountChange("value", Number.parseFloat(e.target.value) || 0)}
                        placeholder={newDiscount.type === "percentage" ? "10" : "100"}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" onClick={addDiscount} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Discount
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-md border mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceData.discounts.map((discount, index) => (
                          <TableRow key={index}>
                            <TableCell>{discount.name}</TableCell>
                            <TableCell>{discount.type === "percentage" ? "Percentage" : "Fixed Amount"}</TableCell>
                            <TableCell>
                              {discount.type === "percentage"
                                ? `${discount.value}%`
                                : formatCurrency(discount.value, invoiceData.currency)}
                            </TableCell>
                            <TableCell>{formatCurrency(discount.amount, invoiceData.currency)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" type="button" onClick={() => removeDiscount(index)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {invoiceData.discounts.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                              No discounts added
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Configure billing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isBillingAddressSameAsGuest"
                  checked={invoiceData.isBillingAddressSameAsGuest}
                  onCheckedChange={(checked) => handleCheckboxChange("isBillingAddressSameAsGuest", checked)}
                />
                <Label htmlFor="isBillingAddressSameAsGuest">Use guest address for billing</Label>
              </div>

              {!invoiceData.isBillingAddressSameAsGuest && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="line1">Address Line 1</Label>
                      <Input
                        id="line1"
                        name="line1"
                        value={billingAddress.line1}
                        onChange={handleBillingAddressChange}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                      <Input
                        id="line2"
                        name="line2"
                        value={billingAddress.line2}
                        onChange={handleBillingAddressChange}
                        placeholder="Apt 4B"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={billingAddress.city}
                        onChange={handleBillingAddressChange}
                        placeholder="New York"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        name="state"
                        value={billingAddress.state}
                        onChange={handleBillingAddressChange}
                        placeholder="NY"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={billingAddress.postalCode}
                        onChange={handleBillingAddressChange}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={billingAddress.country}
                      onChange={handleBillingAddressChange}
                      placeholder="United States"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="isCompanyBilling"
                  checked={invoiceData.isCompanyBilling}
                  onCheckedChange={(checked) => handleCheckboxChange("isCompanyBilling", checked)}
                />
                <Label htmlFor="isCompanyBilling">Bill to a company</Label>
              </div>

              {invoiceData.isCompanyBilling && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        name="name"
                        value={companyDetails.name}
                        onChange={handleCompanyDetailsChange}
                        placeholder="Acme Inc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                      <Input
                        id="taxId"
                        name="taxId"
                        value={companyDetails.taxId}
                        onChange={handleCompanyDetailsChange}
                        placeholder="123456789"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        name="contactPerson"
                        value={companyDetails.contactPerson}
                        onChange={handleCompanyDetailsChange}
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">Email</Label>
                      <Input
                        id="companyEmail"
                        name="email"
                        type="email"
                        value={companyDetails.email}
                        onChange={handleCompanyDetailsChange}
                        placeholder="contact@acme.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Phone</Label>
                      <Input
                        id="companyPhone"
                        name="phone"
                        value={companyDetails.phone}
                        onChange={handleCompanyDetailsChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Add notes and payment terms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={invoiceData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes to appear on the invoice"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Textarea
                  id="paymentTerms"
                  name="paymentTerms"
                  value={invoiceData.paymentTerms}
                  onChange={handleInputChange}
                  placeholder="Payment terms and conditions"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentInstructions">Payment Instructions</Label>
                <Textarea
                  id="paymentInstructions"
                  name="paymentInstructions"
                  value={invoiceData.paymentInstructions}
                  onChange={handleInputChange}
                  placeholder="Instructions for making payment"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>{formatCurrency(invoiceData.subtotal, invoiceData.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tax:</span>
                  <span>{formatCurrency(invoiceData.taxTotal, invoiceData.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Discount:</span>
                  <span>-{formatCurrency(invoiceData.discountTotal, invoiceData.currency)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold">{formatCurrency(invoiceData.total, invoiceData.currency)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Invoice"}
                {!isLoading && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
