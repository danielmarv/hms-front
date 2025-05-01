"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, MoreHorizontal, Plus, Trash, Eye, Hotel } from "lucide-react"
import { useHotelChains } from "@/hooks/use-hotel-chains"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ChainUsersPage() {
  const params = useParams()
  const chainCode = params.id as string
  const { getCrossHotelUsers, revokeChainAccess, getChainDetails } = useHotelChains()

  const [chainName, setChainName] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [userToRevoke, setUserToRevoke] = useState<any | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Get chain details
        const chainDetails = await getChainDetails(chainCode)
        setChainName(chainDetails.name || chainDetails.headquarters?.name || "")

        // Get users with access across the chain
        const chainUsers = await getCrossHotelUsers(chainCode)
        setUsers(chainUsers)
      } catch (error) {
        console.error("Error fetching chain users:", error)
        toast.error("Failed to load chain users")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [chainCode, getCrossHotelUsers, getChainDetails])

  const handleRevokeAccess = async () => {
    if (!userToRevoke) return

    setIsRevoking(true)
    try {
      await revokeChainAccess(chainCode, userToRevoke.user.id)
      toast.success(`Access revoked for ${userToRevoke.user.full_name}`)
      setUsers(users.filter((user) => user.user.id !== userToRevoke.user.id))
    } catch (error) {
      console.error("Error revoking access:", error)
      toast.error("Failed to revoke access")
    } finally {
      setIsRevoking(false)
      setUserToRevoke(null)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chain Users</h1>
          <p className="text-muted-foreground">
            Manage users with access to {chainName} ({chainCode})
          </p>
        </div>
        <Button asChild>
          <Link href={`/admin/chains/${chainCode}/users/add`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Chain User
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users with Chain Access</CardTitle>
          <CardDescription>Users who have access across multiple hotels in this chain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center">
              <p className="text-muted-foreground">No users found with chain-wide access</p>
              <Button asChild className="mt-4">
                <Link href={`/admin/chains/${chainCode}/users/add`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Chain User
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Hotels</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.user.id}>
                    <TableCell className="font-medium">{user.user.full_name}</TableCell>
                    <TableCell>{user.user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.hotelAccess[0]?.accessLevel === "full"
                            ? "default"
                            : user.hotelAccess[0]?.accessLevel === "limited"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {user.hotelAccess[0]?.accessLevel || "read-only"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Hotel className="h-4 w-4 text-muted-foreground" />
                        <span>{user.hotelAccess.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.user.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View User
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.user.id}/access`}>
                              <Hotel className="mr-2 h-4 w-4" />
                              Manage Access
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setUserToRevoke(user)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Revoke Chain Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!userToRevoke} onOpenChange={(open) => !open && setUserToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke chain access?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {userToRevoke?.user.full_name}'s access to all hotels in the {chainName} chain. They will
              no longer be able to access any hotels in this chain unless individually granted access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeAccess}
              disabled={isRevoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke Access"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
