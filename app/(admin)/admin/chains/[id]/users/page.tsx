"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Loader2, MoreHorizontal, Plus, Trash, Edit, Eye } from "lucide-react"
import { useHotelChains, type ChainUser } from "@/hooks/use-hotel-chains"
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

export default function ChainUsersPage() {
  const params = useParams()
  const router = useRouter()
  const chainCode = params.id as string
  const { getChainDetails, getCrossHotelUsers, revokeChainAccess, isLoading: isLoadingChain } = useHotelChains()

  const [chain, setChain] = useState<any>(null)
  const [users, setUsers] = useState<ChainUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userToRevoke, setUserToRevoke] = useState<string | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chainResponse = await getChainDetails(chainCode)
        if (chainResponse.data) {
          setChain(chainResponse.data)
        } else {
          toast.error("Failed to load chain details")
        }

        const usersResponse = await getCrossHotelUsers(chainCode)
        if (usersResponse.data) {
          setUsers(usersResponse.data)
        } else {
          toast.error("Failed to load users")
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data")
        setIsLoading(false)
      }
    }

    if (chainCode) {
      fetchData()
    }
  }, [chainCode, getChainDetails, getCrossHotelUsers])

  const handleRevokeAccess = async () => {
    if (!userToRevoke) return

    setIsRevoking(true)
    try {
      const response = await revokeChainAccess(chainCode, userToRevoke)

      if (response.data) {
        toast.success(`Access revoked from ${response.data.hotelsAffected} hotels`)
        // Remove user from the list
        setUsers(users.filter((user) => user.user.id !== userToRevoke))
      } else {
        throw new Error("Failed to revoke access")
      }
    } catch (error) {
      console.error("Error revoking access:", error)
      toast.error("Failed to revoke access")
    } finally {
      setIsRevoking(false)
      setUserToRevoke(null)
    }
  }

  if (isLoading || isLoadingChain) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/chains/${chainCode}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (!chain) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Hotel chain not found</h2>
        <p className="text-muted-foreground">The requested hotel chain could not be found.</p>
        <Button className="mt-4" asChild>
          <Link href="/admin/chains">Back to Chains</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/chains/${chainCode}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chain Users</h1>
          <p className="text-muted-foreground">Manage users with access to multiple hotels in {chain.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cross-Hotel Users</CardTitle>
            <CardDescription>Users with access to multiple hotels in this chain</CardDescription>
          </div>
          <Button asChild>
            <Link href={`/admin/chains/${chainCode}/users/add`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Chain-wide User
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No users with cross-hotel access found</p>
              <Button asChild>
                <Link href={`/admin/chains/${chainCode}/users/add`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Chain-wide User Access
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Hotels</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user.id}>
                    <TableCell className="font-medium">{user.user.full_name}</TableCell>
                    <TableCell>{user.user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.hotelAccess[0]?.accessLevel || "view"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.hotelAccess.length}</TableCell>
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
                            <Link href={`/admin/chains/${chainCode}/users/${user.user.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Access
                            </Link>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => {
                                  e.preventDefault()
                                  setUserToRevoke(user.user.id)
                                }}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Revoke Access
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will revoke {user.user.full_name}'s access from all hotels in this chain.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setUserToRevoke(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleRevokeAccess}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={isRevoking}
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
    </div>
  )
}
