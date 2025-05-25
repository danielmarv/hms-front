"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  Calculator,
  PieChart,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { useInvoices } from "@/hooks/use-invoices"
import { usePayments } from "@/hooks/use-payments"
import { toast } from "sonner"

export default function AccountsDashboard() {
  const { getInvoices, getInvoiceStats, stats: invoiceStats, isLoading: invoicesLoading } = useInvoices()
  const { getPayments, getPaymentStats, stats: paymentStats, isLoading: paymentsLoading } = usePayments()

  type RecentTransaction = {
    id: string
    type: string
    description: string
    amount: number
    date: string
    status: string
  }
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  type PendingApproval = {
    id: string
    type: string
    description: string
    amount: number
    customer: string
    date: string
    priority: string
  }
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([])
  const [financialSummary, setFinancialSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    cashFlow: 0,
    accountsReceivable: 0,
    accountsPayable: 0,
    outstandingInvoices: 0,
    overduePayments: 0,
  })

  useEffect(() => {
    loadAccountsData()
  }, [])

  const loadAccountsData = async () => {
    try {
      // Load invoice statistics
      const invoiceStatsResponse = await getInvoiceStats()

      // Load payment statistics
      const paymentStatsResponse = await getPaymentStats()

      // Load recent invoices for pending approvals
      const invoicesResponse = await getInvoices({
        status: "Draft",
        limit: 5,
        sort: "-createdAt",
      })

      if ("data" in invoicesResponse && Array.isArray(invoicesResponse.data)) {
        setPendingApprovals(
          invoicesResponse.data.map((invoice) => ({
            id: invoice._id,
            type: "invoice",
            description: `Invoice ${invoice.invoiceNumber}`,
            amount: invoice.total,
            customer: invoice.guest.full_name,
            date: new Date(invoice.createdAt).toLocaleDateString(),
            priority: invoice.total > 1000 ? "high" : "medium",
          })),
        )
      }

      // Load recent payments for transactions
      const paymentsResponse = await getPayments({
        limit: 10,
        sort: "-createdAt",
      })

      if ("data" in paymentsResponse && Array.isArray(paymentsResponse.data)) {
        setRecentTransactions(
          paymentsResponse.data.map((payment) => ({
            id: payment._id,
            type: "revenue",
            description: `Payment - ${payment.guest.full_name}`,
            amount: payment.amountPaid,
            date: new Date(payment.createdAt).toLocaleDateString(),
            status: payment.status.toLowerCase(),
          })),
        )
      }

      // Calculate financial summary
      if (
        "data" in invoiceStatsResponse &&
        invoiceStatsResponse.data &&
        "data" in paymentStatsResponse &&
        paymentStatsResponse.data
      ) {
        const invoiceTotals = invoiceStatsResponse.data.totals
        const paymentTotals = paymentStatsResponse.data.totals

        setFinancialSummary({
          totalRevenue: paymentTotals?.totalAmount || 0,
          totalExpenses: 0, // Would come from expense tracking
          netProfit: paymentTotals?.totalAmount || 0,
          cashFlow: paymentTotals?.totalAmount || 0,
          accountsReceivable: invoiceTotals?.totalOutstanding || 0,
          accountsPayable: 0, // Would come from vendor management
          outstandingInvoices: invoiceTotals?.totalInvoices || 0,
          overduePayments: 0, // Would be calculated from overdue invoices
        })
      }
    } catch (error) {
      console.error("Error loading accounts data:", error)
      toast.error("Failed to load accounts data")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "revenue":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "expense":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "low":
        return "border-l-green-500 bg-green-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const isLoading = invoicesLoading || paymentsLoading

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[500px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-3 w-[120px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts Dashboard</h1>
          <p className="text-muted-foreground">Monitor financial performance and manage accounting operations</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/accounts/invoices/new">
              <FileText className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/accounts/reports">
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate Report
            </Link>
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialSummary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From {recentTransactions.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialSummary.outstandingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(financialSummary.accountsReceivable)} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialSummary.netProfit)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Positive</span> cash flow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals.length}</div>
            <p className="text-xs text-muted-foreground">Items need review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">{formatCurrency(transaction.amount)}</span>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent transactions</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Items requiring your review</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {pendingApprovals.length > 0 ? (
                  pendingApprovals.map((item) => (
                    <div key={item.id} className={`p-3 rounded-lg border-l-4 ${getPriorityColor(item.priority)}`}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{item.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.customer} • {item.date}
                          </p>
                        </div>
                        <Badge
                          variant={
                            item.priority === "high"
                              ? "destructive"
                              : item.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold">{formatCurrency(item.amount)}</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/accounts/invoices/${item.id}`}>Review</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No pending approvals</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Accounts Summary */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Key financial metrics and performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Accounts Receivable</p>
                <p className="text-2xl font-bold">{formatCurrency(financialSummary.accountsReceivable)}</p>
                <p className="text-xs text-muted-foreground">
                  {financialSummary.outstandingInvoices} outstanding invoices
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(financialSummary.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">This period</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Cash Flow</p>
                <p className="text-2xl font-bold">{formatCurrency(financialSummary.cashFlow)}</p>
                <p className="text-xs text-green-600">Positive position</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Payment Success Rate</p>
                <p className="text-2xl font-bold">98.5%</p>
                <p className="text-xs text-green-600">Above target</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used accounting functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/accounts/invoices/new">
                <FileText className="h-6 w-6" />
                Create Invoice
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/accounts/payments/new">
                <CreditCard className="h-6 w-6" />
                Record Payment
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/accounts/expenses/new">
                <TrendingDown className="h-6 w-6" />
                Add Expense
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/accounts/reports">
                <PieChart className="h-6 w-6" />
                Financial Reports
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
