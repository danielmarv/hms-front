"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Loader2, UserPlus } from "lucide-react"
import { useHotelChains } from "@/hooks/use-hotel-chains"

interface User {
  _id: string
  full_name: string
  email: string
  status: string
}

export default function AddChainUserPage() {
  const params = useParams()
  const router = useRouter()
  const chainCode = params.id as string
  const { getChainDetails, grantChainAccess, isLoading: isLoadingChain } = useHotelChains()

  const [chain, setChain] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState("")
  const [accessLevel, setAccessLevel] = useState("view")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchChainDetails = async () => {
      try {
        const response = await getChainDetails(chainCode)
        if (response.data) {
          setChain(response.data)
        } else {
          toast.error("Failed to load chain details")
        }

        // In a real app, you would fetch users here
        // For demo purposes, we'll use mock data
        setUsers([
          { _id: "user1", full_name: "John Doe", email: "john@example.com", status: "active" },
          { _id: "user2", full_name: "Jane Smith", email: "jane@example.com", status: "active" },
          { _id: "user3", full_name: "Bob Johnson", email: "bob@example.com", status: "active" },
        ])

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data")
        setIsLoading(false)
      }
    }

    if (chainCode) {
      fetchChainDetails()
    }
  }, [chainCode, getChainDetails])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) {
      toast.error("Please select a user")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await grantChainAccess(chainCode, {
        userId: selectedUser,
        accessLevel,
      })

      if (response.data) {
        toast.success(`Access granted to ${response.data.hotelCount} hotels`)
        router.push(`/admin/chains/${chainCode}?tab=users`)
      } else {
        throw new Error("Failed to grant access")
      }
    } catch (error) {
      console.error("Error granting access:", error)
      toast.error("Failed to grant access")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isLoadingChain) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/chains/${chainCode}?tab=users`}>
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
          <Link href={`/admin/chains/${chainCode}?tab=users`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Chain-wide User</h1>
          <p className="text-muted-foreground">Grant a user access to all hotels in {chain.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>User Access</CardTitle>
            <CardDescription>Select a user and access level to grant chain-wide access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessLevel">Access Level</Label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger id="accessLevel">
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="full">Full Access</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will grant the selected access level to all hotels in the chain
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push(`/admin/chains/${chainCode}?tab=users`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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
      </form>
    </div>
  )
}
