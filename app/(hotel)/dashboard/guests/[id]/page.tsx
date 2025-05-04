"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  ArrowLeft,
  Calendar,
  Edit,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  Trash2,
  User,
  AlertTriangle,
  Building,
  Clock,
  Award,
} from "lucide-react"
import { useGuests, type Guest, type GuestBooking } from "@/hooks/use-guests"

export default function GuestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const guestId = params.id as string
  const {
    getGuestById,
    getGuestBookingHistory,
    updateGuestLoyalty,
    toggleVipStatus,
    toggleBlacklistStatus,
    deleteGuest,
    isLoading,
  } = useGuests()

  const [guest, setGuest] = useState<Guest | null>(null)
  const [bookings, setBookings] = useState<GuestBooking[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [isUpdatingLoyalty, setIsUpdatingLoyalty] = useState(false)
  const [isUpdatingVip, setIsUpdatingVip] = useState(false)
  const [isUpdatingBlacklist, setIsUpdatingBlacklist] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loyaltyData, setLoyaltyData] = useState({
    member: false,
    points: 0,
    tier: "Standard",
    membership_number: "",
  })
  const [blacklistReason, setBlacklistReason] = useState("")
  const [openLoyaltyDialog, setOpenLoyaltyDialog] = useState(false)
  const [openBlacklistDialog, setOpenBlacklistDialog] = useState(false)

  useEffect(() => {
    loadGuestData()
  }, [guestId])

  const loadGuestData = async () => {
    try {
      const response = await getGuestById(guestId)
      if (response.data) {
        setGuest(response.data)
        // Initialize loyalty data from guest
        setLoyaltyData({
          member: response.data.loyalty_program.member,
          points: response.data.loyalty_program.points,
          tier: response.data.loyalty_program.tier || "Standard",
          membership_number: response.data.loyalty_program.membership_number || "",
        })
        setBlacklistReason(response.data.blacklist_reason || "")
        loadBookingHistory()
      }
    } catch (error) {
      console.error("Failed to load guest:", error)
      toast.error("Failed to load guest details")
    }
  }

  const loadBookingHistory = async () => {
    setIsLoadingBookings(true)
    try {
      const response = await getGuestBookingHistory(guestId)
      if (response.data) {
        setBookings(response.data.data)
      }
    } catch (error) {
      console.error("Failed to load booking history:", error)
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const handleUpdateLoyalty = async () => {
    setIsUpdatingLoyalty(true)
    try {
      const response = await updateGuestLoyalty(guestId, loyaltyData)
      if (response.data) {
        toast.success("Loyalty program updated successfully")
        setOpenLoyaltyDialog(false)
        loadGuestData()
      }
    } catch (error) {
      console.error("Failed to update loyalty program:", error)
    } finally {
      setIsUpdatingLoyalty(false)
    }
  }

  const handleToggleVip = async () => {
    setIsUpdatingVip(true)
    try {
      const response = await toggleVipStatus(guestId)
      if (response.data) {
        toast.success(response.data.message)
        loadGuestData()
      }
    } catch (error) {
      console.error("Failed to toggle VIP status:", error)
    } finally {
      setIsUpdatingVip(false)
    }
  }

  const handleToggleBlacklist = async (blacklisted: boolean) => {
    setIsUpdatingBlacklist(true)
    try {
      const response = await toggleBlacklistStatus(guestId, blacklisted, blacklistReason)
      if (response.data) {
        toast.success(response.data.message)
        setOpenBlacklistDialog(false)
        loadGuestData()
      }
    } catch (error) {
      console.error("Failed to toggle blacklist status:", error)
    } finally {
      setIsUpdatingBlacklist(false)
    }
  }

  const handleDeleteGuest = async () => {
    setIsDeleting(true)
    try {
      const response = await deleteGuest(guestId)
      if (response.data) {
        toast.success("Guest deleted successfully")
        router.push("/dashboard/guests")
      }
    } catch (error) {
      console.error("Failed to delete guest:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Format date to display in a more readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading && !guest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link href="/dashboard/guests">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <Skeleton className="h-8 w-64 mb-1" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold mb-2">Guest Not Found</h2>
        <p className="text-muted-foreground mb-6">The guest you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/dashboard/guests">Back to Guests</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link href="/dashboard/guests">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{guest.full_name}</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Guest ID: {guest._id.substring(0, 8)}</p>
              {guest.vip && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  VIP
                </Badge>
              )}
              {guest.blacklisted && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Blacklisted
                </Badge>
              )}
              {guest.loyalty_program.member && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {guest.loyalty_program.tier || "Loyalty Member"}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/guests/${guestId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the guest record and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteGuest}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="bookings">Booking History</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{guest.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {guest.gender ? `${guest.gender}, ` : ""}
                      {guest.dob ? `${formatDate(guest.dob)}` : "No DOB provided"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{guest.email || "No email provided"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{guest.phone || "No phone provided"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Nationality</p>
                    <p className="text-sm text-muted-foreground">{guest.nationality || "Not specified"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Address</p>
                    {guest.address ? (
                      <div className="text-sm text-muted-foreground">
                        {guest.address.street && <p>{guest.address.street}</p>}
                        <p>
                          {guest.address.city && `${guest.address.city}, `}
                          {guest.address.state && `${guest.address.state} `}
                          {guest.address.postal_code && guest.address.postal_code}
                        </p>
                        <p>{guest.address.country}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No address provided</p>
                    )}
                  </div>
                </div>
                {guest.emergency_contact && (
                  <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Emergency Contact</p>
                      <div className="text-sm text-muted-foreground">
                        <p>{guest.emergency_contact.name}</p>
                        <p>{guest.emergency_contact.relationship}</p>
                        <p>{guest.emergency_contact.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guest Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Registration Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(guest.createdAt)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Stay History</p>
                    <p className="text-sm text-muted-foreground">
                      {guest.stay_history?.total_stays || 0} stays
                      {guest.stay_history?.last_stay_date
                        ? `, last stay on ${formatDate(guest.stay_history.last_stay_date)}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Loyalty Program</p>
                      <p className="text-sm text-muted-foreground">
                        {guest.loyalty_program.member
                          ? `${guest.loyalty_program.tier || "Standard"} - ${guest.loyalty_program.points || 0} points`
                          : "Not a member"}
                      </p>
                    </div>
                    <Dialog open={openLoyaltyDialog} onOpenChange={setOpenLoyaltyDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage Loyalty Program</DialogTitle>
                          <DialogDescription>Update the guest's loyalty program status and points.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="flex items-center gap-4">
                            <Label htmlFor="loyalty-member" className="text-right">
                              Member
                            </Label>
                            <Select
                              value={loyaltyData.member ? "true" : "false"}
                              onValueChange={(value) => setLoyaltyData({ ...loyaltyData, member: value === "true" })}
                            >
                              <SelectTrigger id="loyalty-member">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {loyaltyData.member && (
                            <>
                              <div className="flex items-center gap-4">
                                <Label htmlFor="loyalty-points" className="text-right">
                                  Points
                                </Label>
                                <Input
                                  id="loyalty-points"
                                  type="number"
                                  value={loyaltyData.points}
                                  onChange={(e) =>
                                    setLoyaltyData({ ...loyaltyData, points: Number.parseInt(e.target.value) || 0 })
                                  }
                                />
                              </div>
                              <div className="flex items-center gap-4">
                                <Label htmlFor="loyalty-tier" className="text-right">
                                  Tier
                                </Label>
                                <Select
                                  value={loyaltyData.tier}
                                  onValueChange={(value) => setLoyaltyData({ ...loyaltyData, tier: value })}
                                >
                                  <SelectTrigger id="loyalty-tier">
                                    <SelectValue placeholder="Select tier" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Standard">Standard</SelectItem>
                                    <SelectItem value="Silver">Silver</SelectItem>
                                    <SelectItem value="Gold">Gold</SelectItem>
                                    <SelectItem value="Platinum">Platinum</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center gap-4">
                                <Label htmlFor="membership-number" className="text-right">
                                  Membership #
                                </Label>
                                <Input
                                  id="membership-number"
                                  value={loyaltyData.membership_number}
                                  onChange={(e) =>
                                    setLoyaltyData({ ...loyaltyData, membership_number: e.target.value })
                                  }
                                />
                              </div>
                            </>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setOpenLoyaltyDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateLoyalty} disabled={isUpdatingLoyalty}>
                            {isUpdatingLoyalty ? "Updating..." : "Save Changes"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
                  <Star className="h-5 w-5 text-muted-foreground" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">VIP Status</p>
                      <p className="text-sm text-muted-foreground">{guest.vip ? "VIP Guest" : "Regular Guest"}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleToggleVip} disabled={isUpdatingVip}>
                      {guest.vip ? "Remove VIP" : "Make VIP"}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Blacklist Status</p>
                      <p className="text-sm text-muted-foreground">
                        {guest.blacklisted ? "Blacklisted" : "Not Blacklisted"}
                        {guest.blacklisted && guest.blacklist_reason ? `: ${guest.blacklist_reason}` : ""}
                      </p>
                    </div>
                    <Dialog open={openBlacklistDialog} onOpenChange={setOpenBlacklistDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant={guest.blacklisted ? "outline" : "destructive"}
                          size="sm"
                          className={guest.blacklisted ? "" : "bg-red-600 hover:bg-red-700"}
                        >
                          {guest.blacklisted ? "Remove from Blacklist" : "Blacklist"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{guest.blacklisted ? "Remove from Blacklist" : "Add to Blacklist"}</DialogTitle>
                          <DialogDescription>
                            {guest.blacklisted
                              ? "Are you sure you want to remove this guest from the blacklist?"
                              : "Please provide a reason for blacklisting this guest."}
                          </DialogDescription>
                        </DialogHeader>
                        {!guest.blacklisted && (
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="blacklist-reason">Reason</Label>
                              <Textarea
                                id="blacklist-reason"
                                placeholder="Enter reason for blacklisting"
                                value={blacklistReason}
                                onChange={(e) => setBlacklistReason(e.target.value)}
                                rows={3}
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setOpenBlacklistDialog(false)}>
                            Cancel
                          </Button>
                          <Button
                            variant={guest.blacklisted ? "default" : "destructive"}
                            onClick={() => handleToggleBlacklist(!guest.blacklisted)}
                            disabled={isUpdatingBlacklist || (!guest.blacklisted && !blacklistReason)}
                          >
                            {isUpdatingBlacklist
                              ? "Updating..."
                              : guest.blacklisted
                                ? "Remove from Blacklist"
                                : "Blacklist Guest"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                {guest.company && (
                  <div className="grid grid-cols-[20px_1fr] items-start gap-x-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Company</p>
                      <div className="text-sm text-muted-foreground">
                        <p>{guest.company.name}</p>
                        {guest.company.position && <p>Position: {guest.company.position}</p>}
                        {guest.company.tax_id && <p>Tax ID: {guest.company.tax_id}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {guest.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{guest.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>View all past and upcoming bookings for this guest.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBookings ? (
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <Skeleton key={index} className="h-16 w-full" />
                    ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">No booking history found for this guest.</p>
                  <Button asChild>
                    <Link href="/dashboard/bookings/new">Create New Booking</Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking._id}>
                          <TableCell>
                            {booking.room.number} ({booking.room.floor}/{booking.room.building})
                          </TableCell>
                          <TableCell>{formatDate(booking.check_in)}</TableCell>
                          <TableCell>{formatDate(booking.check_out)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                booking.status === "confirmed"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : booking.status === "checked-in"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : booking.status === "checked-out"
                                      ? "bg-gray-50 text-gray-700 border-gray-200"
                                      : booking.status === "cancelled"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : ""
                              }
                            >
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>${booking.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                booking.payment_status === "paid"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : booking.payment_status === "partial"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : booking.payment_status === "unpaid"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : ""
                              }
                            >
                              {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/bookings/${booking._id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={loadBookingHistory} disabled={isLoadingBookings}>
                Refresh
              </Button>
              <Button asChild>
                <Link href={`/dashboard/bookings/new?guest=${guestId}`}>New Booking</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Guest Preferences</CardTitle>
              <CardDescription>View and manage this guest's preferences and special requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Room Preferences</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Preferred Room Type</Label>
                    <p className="text-sm text-muted-foreground">
                      {guest.preferences?.room_type || "No preference specified"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Pillow Type</Label>
                    <p className="text-sm text-muted-foreground">
                      {guest.preferences?.pillow_type || "No preference specified"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Dietary Restrictions</h3>
                {guest.preferences?.dietary_restrictions?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {guest.preferences.dietary_restrictions.map((diet, index) => (
                      <Badge key={index} variant="secondary">
                        {diet}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No dietary restrictions specified</p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Special Requests</h3>
                {guest.preferences?.special_requests?.length ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {guest.preferences.special_requests.map((request, index) => (
                      <li key={index} className="text-sm">
                        {request}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No special requests specified</p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Marketing Preferences</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email Marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      {guest.marketing_preferences?.email ? "Subscribed" : "Not subscribed"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>SMS Marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      {guest.marketing_preferences?.sms ? "Subscribed" : "Not subscribed"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      {guest.marketing_preferences?.phone ? "Subscribed" : "Not subscribed"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Mail Marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      {guest.marketing_preferences?.mail ? "Subscribed" : "Not subscribed"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href={`/dashboard/guests/${guestId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Preferences
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
