"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useInvoices, type InvoiceFilters } from "@/hooks/use-invoices"
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
import { Plus, Search, FileText, Send, CreditCard } from "lucide-react"
import { format } from "date-fns"

export default function InvoicesPage() {
  const { invoices, pagination, isLoading, getInvoices } = useInvoices()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [filters, setFilters] = useState<InvoiceFilters>({
    page: 1,
    limit: 10,
  })

  useEffect(() => {
    getInvoices(filters)
  }, [filters])

  // Apply filters
  const applyFilters = () => {
    const newFilters: InvoiceFilters = {
      ...filters,
      page: 1, // Reset to first page when applying new filters
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
      case "Paid":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Paid
          </Badge>
        )
      case "Partially Paid":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Partially Paid
          </Badge>
        )
      case "Issued":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Issued
          </Badge>
        )
      case "Draft":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Draft
          </Badge>
        )
      case "Cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      case "Overdue":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Overdue
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
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
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">Manage hotel invoices and billing</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>All Invoices</CardTitle>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="w-full pl-8 sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Issued">Issued</SelectItem>
                  <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
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
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading invoices...
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.guest.full_name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(invoice.issuedDate || invoice.createdAt)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>{formatCurrency(invoice.total, invoice.currency)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild title="View Invoice">
                            <Link href={`/dashboard/invoices/${invoice._id}`}>
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          {invoice.status !== "Paid" && invoice.status !== "Cancelled" && (
                            <Button variant="ghost" size="icon" asChild title="Record Payment">
                              <Link href={`/dashboard/invoices/${invoice._id}/payment`}>
                                <CreditCard className="h-4 w-4" />
                                <span className="sr-only">Payment</span>
                              </Link>
                            </Button>
                          )}
                          {(invoice.status === "Issued" || invoice.status === "Partially Paid") && (
                            <Button variant="ghost" size="icon" asChild title="Send Invoice">
                              <Link href={`/dashboard/invoices/${invoice._id}/send`}>
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send</span>
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
