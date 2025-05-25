"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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

export default function AccountsDashboard() {
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 125000,
    totalExpenses: 85000,
    netProfit: 40000,
    cashFlow: 15000,
    accountsReceivable: 25000,
    accountsPayable: 18000,
    outstandingInvoices: 12,
    overduePayments: 3,
  })

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: 1,
      type: "revenue",
      description: "Room Revenue - Suite 501",
      amount: 450.0,
      date: "2025-01-25",
      status: "completed",
    },
    {
      id: 2,
      type: "expense",
      description: "Housekeeping Supplies",
      amount: -125.5,
      date: "2025-01-25",
      status: "completed",
    },
    {
      id: 3,
      type: "revenue",
      description: "Restaurant Sales",
      amount: 280.75,
      date: "2025-01-24",
      status: "completed",
    },
    {
      id: 4,
      type: "expense",
      description: "Utility Bills",
      amount: -850.0,
      date: "2025-01-24",
      status: "pending",
    },
  ])

  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 1,
      type: "expense",
      description: "Marketing Campaign Budget",
      amount: 5000,
      requestedBy: "Marketing Team",
      date: "2025-01-24",
      priority: "high",
    },
    {
      id: 2,
      type: "invoice",
      description: "Corporate Event Booking",
      amount: 12000,
      customer: "ABC Corporation",
      date: "2025-01-23",
      priority: "medium",
    },
    {
      id: 3,
      type: "payment",
      description: "Vendor Payment - Laundry Services",
      amount: 2500,
      vendor: "Clean Pro Services",
      date: "2025-01-22",
      priority: "low",
    },
  ])

  const [monthlyData, setMonthlyData] = useState([
    { month: "Jan", revenue: 125000, expenses: 85000, profit: 40000 },
    { month: "Dec", revenue: 118000, expenses: 82000, profit: 36000 },
    { month: "Nov", revenue: 132000, expenses: 88000, profit: 44000 },
    { month: "Oct", revenue: 128000, expenses: 86000, profit: 42000 },
  ])

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
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
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
            <div className="text-2xl font-bold">{formatCurrency(financialStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+3.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.netProfit)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18.7%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.cashFlow)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">Positive</span> cash position
            </p>
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
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(Math.abs(transaction.amount))}
                      </span>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
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
                {pendingApprovals.map((item) => (
                  <div key={item.id} className={`p-3 rounded-lg border-l-4 ${getPriorityColor(item.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.requestedBy || item.customer || item.vendor} • {item.date}
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
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Accounts Summary */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Accounts Summary</CardTitle>
            <CardDescription>Overview of receivables and payables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Accounts Receivable</p>
                <p className="text-2xl font-bold">{formatCurrency(financialStats.accountsReceivable)}</p>
                <p className="text-xs text-muted-foreground">
                  {financialStats.outstandingInvoices} outstanding invoices
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Accounts Payable</p>
                <p className="text-2xl font-bold">{formatCurrency(financialStats.accountsPayable)}</p>
                <p className="text-xs text-muted-foreground">{financialStats.overduePayments} overdue payments</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Working Capital</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(financialStats.accountsReceivable - financialStats.accountsPayable)}
                </p>
                <p className="text-xs text-green-600">Healthy position</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">
                  {((financialStats.netProfit / financialStats.totalRevenue) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-green-600">Above industry average</p>
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
