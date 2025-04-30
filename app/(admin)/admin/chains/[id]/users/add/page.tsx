"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Building2, ChevronRight, Loader2, Users, Search, UserPlus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { useHotelChains, type HotelChain } from "@/hooks/use-hotel-chains"
import { toast } from "sonner"
import Link from "next/link"

interface User {
  id: string
  full_name: string
  email: string
  status: string
}

export default function AddChainUserPage() {
  const params = useParams()
  const router = useRouter()
  const chainCode = params.id as string
  const { getChainDetails, grantChainAccess, isLoading } = useHotelChains()
  const [chain, setChain] = useState<HotelChain | null>(null)
  const [isLoadingChain, setIsLoadingChain] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [accessLevel, setAccessLevel] = useState("view")

  // Mock users for demonstration - in a real app, this would come from an API
  const [users, setUsers] = useState<User[]>([
    { id: "1", full_name: "John Doe", email: "john@example.com", status: "active" },
    { id: "2", full_name: "Jane Smith", email: "jane@example.com", status: "active" },
    { id: "3", full_name: "Robert Johnson", email: "robert@example.com", status: "active" },
    { id: "4", full_name: "Emily Davis", email: "emily@example.com", status: "inactive" },
    { id: "5", full_name: "Michael Wilson", email: "michael@example.com", status: "active" },
  ])

  useEffect(() => {
    const fetchChainDetails = async () => {
      try {
        setIsLoadingChain(true)
        const response = await getChainDetails(chainCode)
        if (response.data) {
          setChain(response.data)
        }
      } catch (error) {
        console.error("Error fetching chain details:", error)
        toast.error("Failed to load chain details")
      } finally {
        setIsLoadingChain(false)
      }
    }

    if (chainCode) {
      fetchChainDetails()
    }
  }, [chainCode, getChainDetails])

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
  }

  const handleSubmit = async () => {
    if (!selectedUser) {
      toast.error("Please select a user")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await grantChainAccess(chainCode, {
        userId: selectedUser.id,
        accessLevel,
      })

      if (response.data) {
        toast.success(`Access granted to ${response.data.hotelCount} hotels in the chain`)
        router.push(`/admin/chains/${chainCode}/users`)
      }
    } catch (error) {
      console.error("Error granting chain access:", error)
      toast.error("Failed to grant chain access")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingChain) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[250px]" />
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-8 w-[150px]" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  if (!chain) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Chain Not Found</h2>
        <p className="mt-2 text-muted-foreground">The hotel chain you're looking for doesn't exist</p>
        <Button className="mt-6" onClick={() => router.push("/admin/chains")}>
          Back to Chains
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <Link href="/admin/chains" className="text-muted-foreground hover:text-foreground">
            Hotel Chains
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link href={`/admin/chains/${chainCode}`} className="text-muted-foreground hover:text-foreground">
            {chain.name}
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link href={`/admin/chains/${chainCode}/users`} className="text-muted-foreground hover:text-foreground">
            Users
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Add Chain User</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Add Chain User</h1>
        <p className="text-muted-foreground">Grant a user access to all hotels in the {chain.name} chain</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select User</CardTitle>
          <CardDescription>Choose a user to grant chain-wide access</CardDescription>
          <div className="mt-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="max-h-[300px] overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="flex h-[100px] flex-col items-center justify-center p-4 text-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50 ${
                        selectedUser?.id === user.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      {selectedUser?.id === user.id && <Check className="h-5 w-5 text-primary" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>Access Level</CardTitle>
            <CardDescription>
              Set the access level for {selectedUser.full_name} across all hotels in the chain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={accessLevel} onValueChange={setAccessLevel}>
              <div className="space-y-4">
                <div className="flex items-start space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="view" id="view" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="view" className="font-medium">
                      View Access
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Can view information across all hotels in the chain but cannot make changes
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="edit" id="edit" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="edit" className="font-medium">
                      Edit Access
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Can view and edit information across all hotels in the chain
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="full" id="full" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="full" className="font-medium">
                      Full Access
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Has complete control over all hotels in the chain, including configuration and user management
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push(`/admin/chains/${chainCode}/users`)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Granting Access...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Grant Chain Access
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
