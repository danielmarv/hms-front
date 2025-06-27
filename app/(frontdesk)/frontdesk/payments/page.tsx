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
import { Plus, Search, FileText, ReceiptIcon, RefreshCcw } from "lucide-react"
import { format } from "date-fns"

export default function PaymentsPage() {
  const { payments, pagination, isLoading, getPayments } = usePayments()
  const [searchQuery, setSearchQuery] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 10,
  })

  useEffect(() => {
    getPayments(filters)
  }, [filters])

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
    // For simplicity, we're just filtering on the client side
    // In a real app, you'd send this to the server
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
                      <TableCell>{payment.guest.full_name}</TableCell>
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
    </div>
  )
}
