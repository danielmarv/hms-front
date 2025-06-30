"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePayments, type PaymentFilters } from "@/hooks/use-payments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, FileText, ReceiptIcon, RefreshCcw, Clock, AlertTriangle, TrendingUp } from "lucide-react"
import { format } from "date-fns"

type PaymentSummary = {
  totalPayments: number
  totalAmount: number
  pendingAmount: number
  completedToday: number
  pendingCharges: Array<{
    guestId: string
    guestName: string
    totalPending: number
    chargesCount: number
    oldestCharge: string
  }>
}

export default function PaymentsPage() {
  const { payments, pagination, isLoading, getPayments } = usePayments()
  const [searchQuery, setSearchQuery] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("all")
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 10,
  })

  useEffect(() => {
    getPayments(filters)
    loadPaymentSummary()
  }, [filters])

  const loadPaymentSummary = async () => {
    // Mock data - in real app, this would be an API call
    const mockSummary: PaymentSummary = {
      totalPayments: 156,
      totalAmount: 45230.5,
      pendingAmount: 8750.25,
      completedToday: 12,
      pendingCharges: [
        {
          guestId: "1",
          guestName: "John Smith",
          totalPending: 335.5,
          chargesCount: 2,
          oldestCharge: "2024-01-10",
        },
        {
          guestId: "2",
          guestName: "Sarah Johnson",
          totalPending: 125.0,
          chargesCount: 1,
          oldestCharge: "2024-01-12",
        },
        {
          guestId: "3",
          guestName: "Mike Wilson",
          totalPending: 890.75,
          chargesCount: 3,
          oldestCharge: "2024-01-08",
        },
      ],
    }
    setPaymentSummary(mockSummary)
  }

  // Apply filters
  const applyFilters = () => {
    const newFilters: PaymentFilters = {
      ...filters,
      page: 1, // Reset to first page when applying new filters
    }

    if (methodFilter !== "all") {
      newFilters.method = methodFilter
    } else {
      delete newFilters.method
    }

    if (statusFilter !== "all") {
      newFilters.status = statusFilter
    } else {
      delete newFilters.status
    }

    if (startDate) {
      newFilters.startDate = startDate.toISOString()
    } else {
      delete newFilters.startDate
    }

    if (endDate) {
      newFilters.endDate = endDate.toISOString()
    } else {
      delete newFilters.endDate
    }

    setFilters(newFilters)
  }

  // Handle search
  const handleSearch = () => {
    applyFilters()
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  // Function to get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "Pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "Failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Failed
          </Badge>
        )
      case "Refunded":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Refunded
          </Badge>
        )
      case "Partially Refunded":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Partially Refunded
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Function to get badge for payment method
  const getMethodBadge = (method: string) => {
    switch (method) {
      case "credit_card":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Credit Card
          </Badge>
        )
      case "cash":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Cash
          </Badge>
        )
      case "bank_transfer":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Bank Transfer
          </Badge>
        )
      case "paypal":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            PayPal
          </Badge>
        )
      case "stripe":
        return (
          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
            Stripe
          </Badge>
        )
      case "mobile_money":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Mobile Money
          </Badge>
        )
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return format(date, "MMM d, yyyy")
  }

  // Format currency
  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage hotel payments and transactions</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/payments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Payment
          </Link>
        </Button>
      </div>

      {/* Payment Summary Cards */}
      {paymentSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentSummary.totalPayments}</div>
              <p className="text-xs text-muted-foreground">{formatCurrency(paymentSummary.totalAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentSummary.completedToday}</div>
              <p className="text-xs text-muted-foreground">Payments processed today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(paymentSummary.pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Guests with Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{paymentSummary.pendingCharges.length}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="pending">Pending Charges</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="space-y-4">
              <CardTitle>All Payments</CardTitle>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search payments..."
                      className="w-full pl-8 sm:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                      <SelectItem value="Refunded">Refunded</SelectItem>
                      <SelectItem value="Partially Refunded">Partially Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">From:</span>
                    <DatePicker date={startDate} setDate={setStartDate} className="w-full sm:w-[150px]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">To:</span>
                    <DatePicker date={endDate} setDate={setEndDate} className="w-full sm:w-[150px]" />
                  </div>
                  <Button onClick={applyFilters} size="sm">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Loading payments...
                        </TableCell>
                      </TableRow>
                    ) : payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No payments found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment._id}>
                          <TableCell className="font-medium">{payment.receiptNumber || "N/A"}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payment.guest.full_name}</p>
                              <p className="text-sm text-muted-foreground">{payment.guest.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(payment.paidAt)}</TableCell>
                          <TableCell>{formatCurrency(payment.amountPaid, payment.currency)}</TableCell>
                          <TableCell className="hidden md:table-cell">{getMethodBadge(payment.method)}</TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild title="View Payment">
                                <Link href={`/dashboard/payments/${payment._id}`}>
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Link>
                              </Button>
                              {payment.status === "Completed" && !payment.receiptIssued && (
                                <Button variant="ghost" size="icon" asChild title="Issue Receipt">
                                  <Link href={`/dashboard/payments/${payment._id}/receipt`}>
                                    <ReceiptIcon className="h-4 w-4" />
                                    <span className="sr-only">Receipt</span>
                                  </Link>
                                </Button>
                              )}
                              {payment.status === "Completed" && !payment.isRefund && (
                                <Button variant="ghost" size="icon" asChild title="Process Refund">
                                  <Link href={`/dashboard/payments/${payment._id}/refund`}>
                                    <RefreshCcw className="h-4 w-4" />
                                    <span className="sr-only">Refund</span>
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                        className={pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNumber = i + 1
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNumber)}
                            isActive={pagination.page === pageNumber}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}
                    {pagination.totalPages > 5 && (
                      <>
                        <PaginationItem>
                          <PaginationLink className="cursor-default">...</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink onClick={() => handlePageChange(pagination.totalPages)}>
                            {pagination.totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                        className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Guests with Pending Charges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentSummary?.pendingCharges.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pending Charges</h3>
                  <p className="text-muted-foreground">All guests are up to date with their payments.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentSummary?.pendingCharges.map((guest) => (
                    <div key={guest.guestId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{guest.guestName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {guest.chargesCount} pending charge{guest.chargesCount > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-red-600">{formatCurrency(guest.totalPending)}</p>
                          <p className="text-xs text-muted-foreground">
                            Oldest: {format(new Date(guest.oldestCharge), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" asChild>
                          <Link href={`/dashboard/payments/new?guest=${guest.guestId}`}>Record Payment</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/guests/${guest.guestId}`}>View Guest</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
