"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePayments } from "@/hooks/use-payments"
import { useGuests } from "@/hooks/use-guests"
import { useInvoices } from "@/hooks/use-invoices"
import { useBookings } from "@/hooks/use-bookings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  Calendar,
  CreditCard,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"

interface PaymentSummary {
  totalPayments: number
  totalAmount: number
  pendingAmount: number
  overdueCount: number
  todayPayments: number
  todayAmount: number
}

interface PendingChargeGuest {
  guestId: string
  guestName: string
  guestEmail: string
  totalPending: number
  overdueAmount: number
  chargesCount: number
  oldestDue: Date
}

export default function PaymentsPage() {
  const router = useRouter()
  const { getPayments, isLoading } = usePayments()
  const { getGuests } = useGuests()
  const { getInvoices } = useInvoices()
  const { getBookings } = useBookings()

  const [payments, setPayments] = useState<any[]>([])
  const [pendingChargeGuests, setPendingChargeGuests] = useState<PendingChargeGuest[]>([])
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    totalPayments: 0,
    totalAmount: 0,
    pendingAmount: 0,
    overdueCount: 0,
    todayPayments: 0,
    todayAmount: 0,
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPaymentsData()
    loadPendingCharges()
  }, [])

  const loadPaymentsData = async () => {
    try {
      setLoading(true)
      const response = await getPayments({ limit: 100 })

      if (response) {
        const paymentsData = Array.isArray(response.data) ? response.data : response.data.payments || []
        setPayments(paymentsData)

        // Calculate summary
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const summary: PaymentSummary = {
          totalPayments: paymentsData.length,
          totalAmount: paymentsData.reduce((sum: number, p: any) => sum + (p.amountPaid || 0), 0),
          pendingAmount: 0,
          overdueCount: 0,
          todayPayments: paymentsData.filter((p: any) => {
            const paymentDate = new Date(p.paid_at || p.createdAt)
            paymentDate.setHours(0, 0, 0, 0)
            return paymentDate.getTime() === today.getTime()
          }).length,
          todayAmount: paymentsData
            .filter((p: any) => {
              const paymentDate = new Date(p.paid_at || p.createdAt)
              paymentDate.setHours(0, 0, 0, 0)
              return paymentDate.getTime() === today.getTime()
            })
            .reduce((sum: number, p: any) => sum + (p.amountPaid || 0), 0),
        }

        setPaymentSummary(summary)
      }
    } catch (error) {
      toast.error("Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  const loadPendingCharges = async () => {
    try {
      const [guestsResponse, invoicesResponse, bookingsResponse] = await Promise.all([
        getGuests({ limit: 100 }).catch(() => ({ data: [] })),
        getInvoices({ status: "pending" }).catch(() => ({ data: [] })),
        getBookings({ payment_status: "pending" }).catch(() => ({ data: [] })),
      ])

      const guests = Array.isArray(guestsResponse.data) ? guestsResponse.data : guestsResponse.data?.data || []
      const invoices = Array.isArray(invoicesResponse.data)
        ? invoicesResponse.data
        : invoicesResponse.data?.invoices || []
      const bookings = Array.isArray(bookingsResponse.data)
        ? bookingsResponse.data
        : bookingsResponse.data?.bookings || []

      // Group pending charges by guest
      const guestCharges = new Map<string, PendingChargeGuest>()

      // Process invoices
      invoices.forEach((invoice: any) => {
        if (invoice.guest_id) {
          const guest = guests.find((g: any) => g._id === invoice.guest_id)
          if (guest) {
            const existing = guestCharges.get(invoice.guest_id) || {
              guestId: invoice.guest_id,
              guestName: guest.full_name,
              guestEmail: guest.email,
              totalPending: 0,
              overdueAmount: 0,
              chargesCount: 0,
              oldestDue: new Date(),
            }

            const amount = invoice.total_amount || 0
            const dueDate = new Date(invoice.due_date || Date.now())
            const isOverdue = dueDate < new Date()

            existing.totalPending += amount
            if (isOverdue) existing.overdueAmount += amount
            existing.chargesCount += 1
            if (dueDate < existing.oldestDue) existing.oldestDue = dueDate

            guestCharges.set(invoice.guest_id, existing)
          }
        }
      })

      // Process bookings
      bookings.forEach((booking: any) => {
        if (booking.guest_id && booking.payment_status === "pending") {
          const guest = guests.find((g: any) => g._id === booking.guest_id)
          if (guest) {
            const existing = guestCharges.get(booking.guest_id) || {
              guestId: booking.guest_id,
              guestName: guest.full_name,
              guestEmail: guest.email,
              totalPending: 0,
              overdueAmount: 0,
              chargesCount: 0,
              oldestDue: new Date(),
            }

            const amount = booking.total_amount || 0
            const dueDate = new Date(booking.check_in_date || Date.now())
            const isOverdue = dueDate < new Date()

            existing.totalPending += amount
            if (isOverdue) existing.overdueAmount += amount
            existing.chargesCount += 1
            if (dueDate < existing.oldestDue) existing.oldestDue = dueDate

            guestCharges.set(booking.guest_id, existing)
          }
        }
      })

      const pendingGuestsList = Array.from(guestCharges.values()).sort((a, b) => b.totalPending - a.totalPending)

      setPendingChargeGuests(pendingGuestsList)

      // Update summary with pending amounts
      const totalPending = pendingGuestsList.reduce((sum, guest) => sum + guest.totalPending, 0)
      const overdueCount = pendingGuestsList.filter((guest) => guest.overdueAmount > 0).length

      setPaymentSummary((prev) => ({
        ...prev,
        pendingAmount: totalPending,
        overdueCount,
      }))
    } catch (error) {
      console.error("Error loading pending charges:", error)
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.guest?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  const handleViewPayment = (paymentId: string) => {
    router.push(`/frontdesk/payments/${paymentId}`)
  }

  const handleEditPayment = (paymentId: string) => {
    router.push(`/frontdesk/payments/${paymentId}/edit`)
  }

  const handleRecordPayment = (guestId?: string) => {
    const url = guestId ? `/frontdesk/payments/new?guest=${guestId}` : "/frontdesk/payments/new"
    router.push(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">Manage guest payments and track outstanding charges</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPaymentsData} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => handleRecordPayment()}>
            <Plus className="mr-2 h-4 w-4" />
            New Payment
          </Button>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentSummary.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{paymentSummary.totalPayments} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentSummary.todayAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{paymentSummary.todayPayments} payments today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Charges</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentSummary.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{pendingChargeGuests.length} guests with pending charges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{paymentSummary.overdueCount}</div>
            <p className="text-xs text-muted-foreground">Accounts with overdue payments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">All Payments</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Charges
            {paymentSummary.overdueCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {paymentSummary.overdueCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View and manage all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                        Loading payments...
                      </TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.guest?.full_name || "Unknown Guest"}</div>
                            <div className="text-sm text-muted-foreground">{payment.guest?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${(payment.amountPaid || 0).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">{payment.currency || "USD"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {payment.method || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                            {format(new Date(payment.paid_at || payment.createdAt), "MMM d, yyyy")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(payment.paid_at || payment.createdAt), "h:mm a")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "completed"
                                ? "default"
                                : payment.status === "pending"
                                  ? "secondary"
                                  : payment.status === "failed"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {payment.status || "completed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono">{payment.transaction_reference || "-"}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewPayment(payment._id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditPayment(payment._id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guests with Pending Charges</CardTitle>
              <CardDescription>Manage outstanding payments and overdue accounts</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Total Pending</TableHead>
                    <TableHead>Overdue Amount</TableHead>
                    <TableHead>Charges</TableHead>
                    <TableHead>Oldest Due</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingChargeGuests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No pending charges found
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingChargeGuests.map((guest) => (
                      <TableRow key={guest.guestId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{guest.guestName}</div>
                            <div className="text-sm text-muted-foreground">{guest.guestEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-lg">${guest.totalPending.toFixed(2)}</div>
                        </TableCell>
                        <TableCell>
                          {guest.overdueAmount > 0 ? (
                            <div className="font-medium text-red-600">${guest.overdueAmount.toFixed(2)}</div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{guest.chargesCount} charges</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                            {format(guest.oldestDue, "MMM d, yyyy")}
                          </div>
                          {guest.oldestDue < new Date() && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              Overdue
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/frontdesk/guests/${guest.guestId}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" onClick={() => handleRecordPayment(guest.guestId)}>
                              <Plus className="h-4 w-4 mr-1" />
                              Record Payment
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
